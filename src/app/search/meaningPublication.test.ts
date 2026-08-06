import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

function readSource(relativePath: string) {
    return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');
}

describe('public name meaning publication', () => {
    it('removes names without an approved stored meaning from public data', () => {
        const source = readSource('src/lib/publicNames.ts');
        expect(source).toContain('.filter((row) => row.name && row.meaning)');
    });

    it('counts only names with stored meanings in public stats', () => {
        const source = readSource('src/lib/publicStats.ts');
        expect(source).toContain(".not('meaning', 'is', null)");
        expect(source).toContain(".neq('meaning', '')");
    });

    it('does not show a waiting-for-update placeholder in search results', () => {
        const source = readSource('src/app/search/ClientPage.tsx');
        expect(source).not.toContain('รออัปเดต');
    });

    it('ships the review-state migration and admin review actions', () => {
        const migration = readSource('scripts/migration-auspicious-name-meanings.sql');
        const route = readSource('src/app/api/admin/names/route.ts');
        expect(migration).toContain("'pending', 'draft', 'approved', 'rejected'");
        expect(route).toContain("action === 'generate_meaning_drafts'");
        expect(route).toContain("action === 'review_meaning'");
    });
});
