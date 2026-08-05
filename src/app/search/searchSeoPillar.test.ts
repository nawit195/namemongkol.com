import { describe, expect, test } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const readSource = (filePath: string) => readFileSync(path.join(root, filePath), 'utf8');

describe('/search SEO pillar content', () => {
    test('uses database-backed name counts instead of a hardcoded marketing number', () => {
        const pageSource = readSource('src/app/search/page.tsx');
        const clientSource = readSource('src/app/search/ClientPage.tsx');

        expect(pageSource).toContain('fetchPublicAggregateStats');
        expect(pageSource).toContain('liveNamesLabel');
        expect(pageSource).toContain('numberOfItems: allNames.length');
        expect(pageSource).toContain("'itemListElement': allNames.slice");
        expect(pageSource).toContain('const searchNames = allNames.map');
        expect(pageSource).toContain('<ClientPage initialNames={searchNames} initialTotal={searchNames.length} />');
        expect(pageSource).not.toContain('numberOfItems: 5000');

        expect(clientSource).toContain('totalNames');
        expect(clientSource).toContain('liveNameCount');
        expect(clientSource).toContain("{total.toLocaleString('th-TH')}");
        expect(clientSource).toContain("{filteredNames.length.toLocaleString('th-TH')}");
        expect(clientSource).toContain('bGradeCount > 0');
        expect(clientSource).toContain("{bGradeCount.toLocaleString('th-TH')}");
        expect(clientSource).toContain("selectedLetter === 'all'");
        expect(clientSource).toContain('sortSearchNamesByNewest(matchingNames)');
        expect(clientSource).toContain('createdAt={item.createdAt}');
        expect(clientSource).not.toContain('{resultTotal}');
        expect(clientSource).toContain('ชื่อในฐานข้อมูลล่าสุด');
    });

    test('targets ชื่อมงคล as the primary search landing page', () => {
        const pageSource = readSource('src/app/search/page.tsx');

        expect(pageSource).toContain('ค้นหาชื่อมงคลจากฐานข้อมูลล่าสุด');
        expect(pageSource).toContain('title: { absolute: searchPageTitle }');
        expect(pageSource).toContain('รายชื่อมงคล');
        expect(pageSource).toContain('ตั้งชื่อลูก');
        expect(pageSource).toContain('เปลี่ยนชื่อมงคล');
    });

    test('renders server-side answer sections and FAQ for AEO', () => {
        const pageSource = readSource('src/app/search/page.tsx');

        expect(pageSource).toContain('id="auspicious-name-pillar"');
        expect(pageSource).toContain('id="search-faq"');
        expect(pageSource).toContain('pillarFaqs');
        expect(pageSource).toContain('FAQPage');
        expect(pageSource).toContain('SpeakableSpecification');
    });

    test('passes internal authority from related pages to /search', () => {
        const homeSource = readSource('src/components/HomeSeoContent.tsx');
        const nameCheckSource = readSource('src/components/NameCheckSeoContent.tsx');
        const articlesSource = readSource('src/app/articles/page.tsx');
        const topicClustersSource = readSource('src/app/articles/topicClusters.ts');

        expect(homeSource).toContain('/search');
        expect(nameCheckSource).toContain('/search');
        expect(articlesSource).toContain("import { topicClusters }");
        expect(topicClustersSource).toContain("href: '/search'");
    });

    test('keeps /search in the canonical sitemap route list', () => {
        const sitemapSource = readSource('src/app/sitemap.ts');

        expect(sitemapSource).toContain("'/search'");
        expect(sitemapSource).not.toContain('<priority>');
    });
});
