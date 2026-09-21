import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

function readSource(relativePath: string): string {
    return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');
}

describe('admin public-name CSV export', () => {
    it('checks admin access before handling the CSV export', () => {
        const route = readSource('src/app/api/admin/names/route.ts');
        const authCheck = route.indexOf('await requireAdmin(supabase)');
        const csvBranch = route.indexOf("searchParams.get('view') === 'csv'");

        expect(authCheck).toBeGreaterThan(-1);
        expect(csvBranch).toBeGreaterThan(authCheck);
    });

    it('uses the unpaginated public-search dataset and validates every filter', () => {
        const route = readSource('src/app/api/admin/names/route.ts');
        const publicNames = readSource('src/lib/publicNames.ts');

        expect(route).toContain('queryAllPublicNames({');
        expect(route).toContain("rawDay !== 'all'");
        expect(route).toContain("['all', 'male', 'female', 'neutral']");
        expect(route).toContain("rawInitial !== 'all' && !isThaiNameInitial(rawInitial)");
        expect(publicNames).toContain('return selectPublicNameCandidates(allNames, catalog, { day, gender, initial });');
    });

    it('renders the three search filters and a guarded download action', () => {
        const page = readSource('src/app/admin/names/page.tsx');

        expect(page).toContain('วันเกิดที่เหมาะสม');
        expect(page).toContain('exportGender');
        expect(page).toContain('THAI_NAME_INITIALS.map');
        expect(page).toContain('disabled={isExporting}');
        expect(page).toContain('กำลังสร้าง CSV...');
        expect(page).toContain("response.headers.get('Content-Disposition')");
    });
});
