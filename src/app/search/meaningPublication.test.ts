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

        expect(publicNames).toContain('name, gender, pronunciation, pronunciation_status, meaning, created_at');
        expect(publicNames).toContain('name, gender, pronunciation, meaning, created_at');
        expect(publicNames).toContain("readRows('with-pronunciation')");
        expect(publicNames).toContain("row.pronunciation_status === 'approved'");
        expect(publicNames).toContain('public-auspicious-names-v9');
        expect(publicNames).toContain('using the legacy query');
        expect(page).toContain('queryPublicNames({ page: 1, limit: 50 })');
        expect(page).toContain('initialResult={initialResult}');
        expect(client).toContain('อ่านว่า {pronunciation}');
        expect(client).toContain('คำอ่าน</th>');
        expect(client).toContain('colSpan={6}');
        expect(client).not.toContain('colSpan={5}');
    });

    it('ships a service-role-only transactional CSV import', () => {
        const migration = readSource('scripts/migration-auspicious-name-pronunciation.sql');
        const importer = readSource('scripts/import-auspicious-name-details.mjs');

        expect(migration).toContain('admin_import_auspicious_name_details');
        expect(migration).toContain('pronunciation_status');
        expect(migration).toContain("meaning_status = 'approved'");
        expect(migration).toContain("meaning_source = 'csv-import'");
        expect(migration).toContain('grant execute on function public.admin_import_auspicious_name_details(jsonb) to service_role');
        expect(importer).toContain("mode: 'dry-run'");
        expect(importer).toContain('writeBackup(databaseRows)');
        expect(importer).toContain('pronunciation_status: review.confidence');
    });
});
