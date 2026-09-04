import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { buildInitialKhoReview } from '../../scripts/build-initial-kho-review.mjs';
import { runInitialKhoImport, validateInitialKhoReview } from '../../scripts/import-initial-kho-review.mjs';
import { getPublicationPronunciationIssues } from '@/lib/thaiPronunciation';

const root = process.cwd();
const reviewFile = path.join(root, 'outputs/auspicious-names-initial-kho-review.json');
const readJson = (relativePath: string) => JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));

function createFakeSupabase(reviewPayload: ReturnType<typeof validateInitialKhoReview>) {
    const state = new Map(reviewPayload.records.map((record: { name: string; legacyPronunciation?: string }) => [record.name, {
        id: `id-${record.name}`,
        name: record.name,
        pronunciation: record.legacyPronunciation || null,
        pronunciation_draft: record.legacyPronunciation || null,
        pronunciation_variants: [],
        pronunciation_status: 'pending',
        pronunciation_evidence: {},
        publication_status: 'published',
        publication_reason: null,
        publication_evidence: {},
        publication_reviewed_at: null,
    }]));
    const rpc = vi.fn(async (_name: string, args: { records: Array<Record<string, unknown>> }) => {
        for (const record of args.records) {
            const current = state.get(record.name as string)!;
            state.set(record.name as string, {
                ...current,
                pronunciation: record.publication_status === 'published' ? record.pronunciation : null,
                pronunciation_draft: record.pronunciation,
                pronunciation_variants: record.pronunciation_variants,
                pronunciation_status: record.pronunciation_status,
                pronunciation_evidence: record.pronunciation_evidence,
                publication_status: record.publication_status,
                publication_reason: record.publication_reason,
                publication_evidence: record.publication_evidence,
                publication_reviewed_at: new Date().toISOString(),
            });
        }
        return { data: [{ updated_rows: args.records.length }], error: null };
    });
    return {
        client: {
            from: () => ({
                select: () => ({
                    in: async (_column: string, names: string[]) => ({
                        data: names.map((name) => state.get(name)).filter(Boolean),
                        error: null,
                    }),
                }),
            }),
            rpc,
        },
        rpc,
    };
}

describe('initial ข linguistic review', () => {
    it('covers the exact 285-name source set with no pending decision', () => {
        const audit = readJson('outputs/auspicious-names-7348-audit.json');
        const generated = buildInitialKhoReview(audit);
        const committed = readJson('outputs/auspicious-names-initial-kho-review.json');
        const sourceNames = audit.records.filter((record: { initial: string }) => record.initial === 'ข').map((record: { name: string }) => record.name).sort();
        const reviewNames = committed.records.map((record: { name: string }) => record.name).sort();

        expect(generated.records.map((record: Record<string, unknown>) => ({ ...record, legacyPronunciation: undefined })))
            .toEqual(committed.records.map((record: Record<string, unknown>) => ({ ...record, legacyPronunciation: undefined })));
        expect(reviewNames).toEqual(sourceNames);
        expect(committed.counts).toEqual({ total: 285, published: 45, hidden: 240, pending: 0 });
        expect(new Set(reviewNames)).toHaveLength(285);
    });

    it('publishes only sourced, structurally valid readings and explains every hidden name', () => {
        const review = validateInitialKhoReview(readJson('outputs/auspicious-names-initial-kho-review.json'));
        for (const record of review.records) {
            if (record.publicationStatus === 'published') {
                expect(getPublicationPronunciationIssues(record.pronunciation)).toEqual([]);
                expect(record.pronunciationEvidence.roots.length).toBeGreaterThan(0);
                expect(record.pronunciationEvidence.sources.every((source: { url: string }) => source.url.startsWith('https://'))).toBe(true);
            } else {
                expect(record.pronunciation).toBeNull();
                expect(record.pronunciationStatus).toBe('rejected');
                expect(record.publicationReason.length).toBeGreaterThan(10);
            }
        }
    });

    it('dry-runs without mutation and applies with backup, verification and revalidation', async () => {
        const review = validateInitialKhoReview(readJson('outputs/auspicious-names-initial-kho-review.json'));
        const fake = createFakeSupabase(review);
        const dependencies = {
            dotenv: { config: vi.fn() },
            createClient: () => fake.client,
            supabaseUrl: 'https://example.supabase.co',
            serviceRoleKey: 'test-service-role',
            writeBackup: vi.fn(() => 'backup.json'),
            revalidate: vi.fn(async () => undefined),
        };

        const dryRun = await runInitialKhoImport({ reviewFile, apply: false }, dependencies);
        expect(dryRun).toMatchObject({ mode: 'dry-run', summary: { total: 285, published: 45, hidden: 240, databaseRows: 285 } });
        expect(fake.rpc).not.toHaveBeenCalled();

        const applied = await runInitialKhoImport({ reviewFile, apply: true }, dependencies);
        expect(applied).toMatchObject({ mode: 'apply', verifiedRows: 285, revalidated: true, backupPath: 'backup.json' });
        expect(dependencies.writeBackup).toHaveBeenCalledOnce();
        expect(fake.rpc).toHaveBeenCalledOnce();
        expect(dependencies.revalidate).toHaveBeenCalledOnce();
    });

    it('stops after a failed transactional RPC and never invalidates caches', async () => {
        const review = validateInitialKhoReview(readJson('outputs/auspicious-names-initial-kho-review.json'));
        const fake = createFakeSupabase(review);
        const failingRpc = vi.fn(async () => ({ data: null, error: { message: 'transaction rolled back' } }));
        const writeBackup = vi.fn(() => 'backup.json');
        const revalidate = vi.fn(async () => undefined);

        await expect(runInitialKhoImport({ reviewFile, apply: true }, {
            dotenv: { config: vi.fn() },
            createClient: () => ({ ...fake.client, rpc: failingRpc }),
            supabaseUrl: 'https://example.supabase.co',
            serviceRoleKey: 'test-service-role',
            writeBackup,
            revalidate,
        })).rejects.toThrow('transaction rolled back');

        expect(writeBackup).toHaveBeenCalledOnce();
        expect(failingRpc).toHaveBeenCalledOnce();
        expect(revalidate).not.toHaveBeenCalled();
    });

    it('ships publication filtering, transactional RPC and cache invalidation', () => {
        const publicNames = fs.readFileSync(path.join(root, 'src/lib/publicNames.ts'), 'utf8');
        const publicStats = fs.readFileSync(path.join(root, 'src/lib/publicStats.ts'), 'utf8');
        const migration = fs.readFileSync(path.join(root, 'scripts/migration-auspicious-name-publication.sql'), 'utf8');
        const revalidateRoute = fs.readFileSync(path.join(root, 'src/app/api/admin/revalidate-public-names/route.ts'), 'utf8');

        expect(publicNames).toContain("row.publication_status !== 'hidden'");
        expect(publicStats).toContain(".neq('publication_status', 'hidden')");
        expect(migration).toContain('admin_apply_name_linguistic_review');
        expect(migration).toContain("publication_status in ('published', 'hidden')");
        expect(revalidateRoute).toContain("revalidateTag('public-names', 'max')");
        expect(revalidateRoute).toContain("revalidateTag('public-stats', 'max')");
    });
});
