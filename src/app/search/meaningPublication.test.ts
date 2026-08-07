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
});
