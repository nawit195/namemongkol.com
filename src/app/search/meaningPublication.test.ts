import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

function readSource(relativePath: string) {
    return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');
}

describe('public name meaning publication', () => {
    it('publishes newly added names even when meaning is not available yet', () => {
        const source = readSource('src/lib/publicNames.ts');
        expect(source).toContain('.filter((row) => row.name)');
        expect(source).not.toContain('.filter((row) => row.name && row.meaning)');
    });

    it('counts every stored name in public stats', () => {
        const source = readSource('src/lib/publicStats.ts');
        expect(source).not.toContain(".not('meaning', 'is', null)");
        expect(source).not.toContain(".neq('meaning', '')");
    });

    it('shows a transparent status when a name has no meaning yet', () => {
        const source = readSource('src/app/search/ClientPage.tsx');
        expect(source).toContain('อยู่ระหว่างเพิ่มความหมาย');
    });

    it('ships the review-state migration and admin review actions', () => {
        const migration = readSource('scripts/migration-auspicious-name-meanings.sql');
        const route = readSource('src/app/api/admin/names/route.ts');
        expect(migration).toContain("'pending', 'draft', 'approved', 'rejected'");
        expect(route).toContain("action === 'generate_meaning_drafts'");
        expect(route).toContain("action === 'review_meaning'");
    });

    it('loads pronunciation without breaking deployments that have not run the migration yet', () => {
        const publicNames = readSource('src/lib/publicNames.ts');
        const page = readSource('src/app/search/page.tsx');
        const client = readSource('src/app/search/ClientPage.tsx');

        expect(publicNames).toContain('pronunciation_variants');
        expect(publicNames).toContain('meaning_status');
        expect(publicNames).toContain("row.pronunciation_status === 'rejected'");
        expect(publicNames).toContain('publishedPronunciation || draftPronunciation');
        expect(publicNames).toContain('public-auspicious-name-page-v16');
        expect(publicNames).toContain('fetchPublicNamesDataset = cache');
        expect(publicNames).toContain('using existing pronunciation data');
        expect(publicNames).toContain("readRows('with-status')");
        expect(publicNames).toContain("readRows('with-pronunciation')");
        expect(page).toContain('queryPublicNames({ page: 1, limit: 50 })');
        expect(page).toContain('initialResult={initialResult}');
        expect(client).toContain('อ่านว่า {displayPronunciation}');
        expect(client).toContain('รอยืนยันการอ่าน');
        expect(client).toContain('รอตรวจสอบคำอ่าน');
        expect(client).toContain('คำอ่าน</th>');
        expect(client).toContain('colSpan={6}');
        expect(client).not.toContain('colSpan={5}');
    });

    it('ships a service-role-only transactional CSV import', () => {
        const migration = readSource('scripts/migration-auspicious-name-pronunciation.sql');
        const importer = readSource('scripts/import-auspicious-name-details.mjs');

        expect(migration).toContain('admin_import_auspicious_name_details');
        expect(migration).toContain('pronunciation_status');
        expect(migration).toContain('pronunciation_draft');
        expect(migration).toContain("pronunciation_status = 'pending'");
        expect(migration).toContain('pronunciation_evidence');
        expect(migration).toContain('meaning_evidence');
        expect(migration).toContain('meaning_status = source.meaning_status');
        expect(migration).toContain('grant execute on function public.admin_import_auspicious_name_details(jsonb) to service_role');
        expect(importer).toContain("mode: 'dry-run'");
        expect(importer).toContain('writeBackup(databaseRows)');
        expect(importer).toContain('pronunciation_status: review.status');
    });

    it('keeps legacy readings visible but pending until evidence is complete', () => {
        const report = JSON.parse(readSource('outputs/auspicious-names-pronunciation-audit.json'));
        const reviews = JSON.parse(readSource('outputs/auspicious-names-pronunciation-review.json')) as Array<{
            pronunciationStatus: string;
            pronunciationDraft: string;
            issues: string[];
            note: string;
        }>;
        const adminRoute = readSource('src/app/api/admin/names/route.ts');
        const adminPage = readSource('src/app/admin/names/page.tsx');

        expect(report.sourceRows).toBe(7348);
        expect(report.statusCounts.pronunciation).toEqual({ pending: 7348, draft: 0, approved: 0, rejected: 0 });
        expect(report.statusCounts.meaning).toEqual({ pending: 7348, draft: 0, approved: 0, rejected: 0 });
        expect(Object.keys(report.categoryCounts)).toHaveLength(new Set(reviews.map((record) => (record as { initial?: string }).initial)).size);
        expect(reviews).toHaveLength(7348);
        expect(reviews.every((record) => record.pronunciationStatus === 'pending')).toBe(true);
        expect(reviews.every((record) => record.issues.includes('missing-official-evidence'))).toBe(true);
        expect(reviews.every((record) => Boolean(record.pronunciationDraft))).toBe(true);
        expect(adminRoute).toContain("view') === 'pronunciation-review'");
        expect(adminRoute).toContain("action === 'review_pronunciation'");
        expect(adminRoute).toContain('getPublicationPronunciationIssues');
        expect(adminPage).toContain('<PronunciationReviewPanel />');
    });
});
