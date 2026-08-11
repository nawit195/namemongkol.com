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
        expect(pageSource).toContain('queryPublicNames({ page: 1, limit: 50 })');
        expect(pageSource).toContain('numberOfItems: initialResult.total');
        expect(pageSource).toContain('initialResult.data.slice(0, 10)');
        expect(pageSource).toContain('<ClientPage initialResult={initialResult} initialStats={aggregate.stats} />');
        expect(pageSource).not.toContain('fetchAllPublicNames()');
        expect(pageSource).not.toContain('numberOfItems: 5000');

        expect(clientSource).toContain('totalNames');
        expect(clientSource).toContain('liveNameCount');
        expect(clientSource).toContain("{total.toLocaleString('th-TH')}");
        expect(clientSource).toContain("{total.toLocaleString('th-TH')}");
        expect(clientSource).toContain('bGradeCount > 0');
        expect(clientSource).toContain("{bGradeCount.toLocaleString('th-TH')}");
        expect(clientSource).toContain("initial: selectedLetter");
        expect(clientSource).toContain("limit: '50'");
        expect(clientSource).toContain('<NameRow key={`${item.name}-${index}`} {...item} rowIndex={index} />');
        expect(clientSource).toContain('{resultTotal.toLocaleString');
        expect(clientSource).toContain('ชื่อในฐานข้อมูลล่าสุด');
        expect(clientSource.indexOf('requestNamesPage(nextLoadedPage + 1)'))
            .toBeLessThan(clientSource.indexOf("supabase.rpc('deduct_credits'"));
    });

    test('targets ชื่อมงคล as the primary search landing page', () => {
        const pageSource = readSource('src/app/search/page.tsx');

        expect(pageSource).toContain('ค้นหาชื่อมงคล พร้อมคำอ่าน ความหมาย และเลขศาสตร์');
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
        expect(pageSource).toContain("'@type': 'DefinedTermSet'");
        expect(pageSource).toContain("'@type': 'SoftwareApplication'");
        expect(pageSource).not.toContain('SpeakableSpecification');
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
