import { describe, expect, test } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const readSource = (filePath: string) => readFileSync(path.join(root, filePath), 'utf8');

describe('search SSR and birthday landing pages', () => {
    test('serves paginated and filterable public names', () => {
        const routeSource = readSource('src/app/api/public/names/route.ts');
        const staticInitialRoute = readSource('src/app/api/public/name-initials/[letter]/route.ts');
        const dataSource = readSource('src/lib/publicNames.ts');
        const catalogSource = readSource('src/lib/publicNameCatalog.ts');

        for (const parameter of ['day', 'gender', 'initial', 'page', 'limit']) {
            expect(routeSource).toContain(`params.get('${parameter}')`);
        }
        expect(dataSource).toContain('totalPages');
        expect(dataSource).toContain('facets');
        expect(dataSource).toContain('pageSize');
        expect(dataSource).toContain('withPronunciation');
        expect(dataSource).toContain('withMeaning');
        expect(dataSource).toContain('latestCreatedAt');
        expect(dataSource).toContain('selectPublicNameCandidates');
        expect(catalogSource).toContain('sortSearchNamesByNewest(filtered)');
        expect(catalogSource).toContain('buckets.reduce');
        expect(routeSource).toContain('...result');
        expect(staticInitialRoute).toContain('revalidate = 600');
        expect(staticInitialRoute).toContain('generateStaticParams');
        expect(dataSource).toContain("tags: ['public-names']");
    });

    test('caches public names in bounded database pages instead of aggregate entries', () => {
        const dataSource = readSource('src/lib/publicNames.ts');

        expect(dataSource).toContain('const DATABASE_PAGE_SIZE = 1000;');
        expect(dataSource).toContain('const fetchPublicNameRowsPage = unstable_cache(');
        expect(dataSource).toContain("['public-auspicious-name-page-v16']");
        expect(dataSource).toContain("{ revalidate: 600, tags: ['public-names'] }");
        expect(dataSource).toContain('export const fetchAllPublicNames = cache(loadAllPublicNames);');
        expect(dataSource).toContain('const fetchPublicNamesDataset = cache(async () =>');
        expect(dataSource).not.toContain('export const fetchAllPublicNames = unstable_cache(');
        expect(dataSource).not.toContain('const fetchPublicNamesCatalog = unstable_cache(');
        expect(dataSource.match(/unstable_cache\(/g)).toHaveLength(1);
        expect(dataSource).toContain("row.publication_status !== 'hidden'");
    });

    test('pre-renders eight birthday variants for both genders', () => {
        const boysRoute = readSource('src/app/names/boys/by-birthday/[day]/page.tsx');
        const girlsRoute = readSource('src/app/names/girls/by-birthday/[day]/page.tsx');
        const landing = readSource('src/components/names/BirthdayDayLandingPage.tsx');

        expect(boysRoute).toContain('generateStaticParams');
        expect(girlsRoute).toContain('generateStaticParams');
        expect(landing).toContain("'wednesday_night'");
        expect(landing).toContain('ItemList');
        expect(landing).toContain('FAQPage');
        expect(landing).toContain('queryPublicNames');
    });

    test('adds birthday pages and methodology to the sitemap', () => {
        const sitemap = readSource('src/app/sitemap.ts');

        expect(sitemap).toContain("'/methodology'");
        expect(sitemap).toContain('namingDayUrls');
        expect(sitemap).toContain('/names/${gender}/by-birthday/${day}');
    });
});
