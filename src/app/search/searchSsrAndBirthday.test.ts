import { describe, expect, test } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const readSource = (filePath: string) => readFileSync(path.join(root, filePath), 'utf8');

describe('search SSR and birthday landing pages', () => {
    test('serves paginated and filterable public names', () => {
        const routeSource = readSource('src/app/api/public/names/route.ts');
        const dataSource = readSource('src/lib/publicNames.ts');

        for (const parameter of ['day', 'gender', 'initial', 'page', 'limit']) {
            expect(routeSource).toContain(`params.get('${parameter}')`);
        }
        expect(dataSource).toContain('totalPages');
        expect(dataSource).toContain('facets');
        expect(dataSource).toContain('pageSize');
        expect(dataSource).toContain('withPronunciation');
        expect(dataSource).toContain('withMeaning');
        expect(dataSource).toContain('latestCreatedAt');
        expect(dataSource).toContain('sortSearchNamesByNewest(filtered)');
        expect(routeSource).toContain('...result');
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
