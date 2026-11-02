import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

function readSource(relativePath: string) {
    return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');
}

describe('admin premium-name CSV export', () => {
    it('checks admin access before handling the CSV export', () => {
        const route = readSource('src/app/api/admin/premium-names/route.ts');
        const authCheck = route.indexOf('await requireAdmin(supabase)');
        const csvBranch = route.indexOf("searchParams.get('view') === 'csv'");

        expect(authCheck).toBeGreaterThan(-1);
        expect(csvBranch).toBeGreaterThan(authCheck);
    });

    it('exports the complete filtered dataset rather than the current page', () => {
        const route = readSource('src/app/api/admin/premium-names/route.ts');
        expect(route).toContain('fetchAllPremiumMembershipRows(supabase, search)');
        expect(route).toContain('buildPremiumNamesCsv(buildPremiumAdminRecords(memberships, details))');
        expect(route).toContain("'Content-Type': 'text/csv; charset=utf-8'");
        expect(route).toContain('filename*=UTF-8');
    });

    it('renders a guarded download action that keeps the active search', () => {
        const page = readSource('src/app/admin/premium-names/page.tsx');
        expect(page).toContain("view: 'csv'");
        expect(page).toContain('...(query ? { q: query } : {})');
        expect(page).toContain('disabled={isExporting}');
        expect(page).toContain('กำลังสร้าง CSV...');
        expect(page).toContain("response.headers.get('Content-Disposition')");
    });
});
