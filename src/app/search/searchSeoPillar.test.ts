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
        expect(pageSource).toContain('numberOfItems: liveNamesCount');
        expect(pageSource).not.toContain('numberOfItems: 5000');

        expect(clientSource).toContain('totalNames');
        expect(clientSource).toContain('liveNameCount');
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

        expect(homeSource).toContain('/search');
        expect(nameCheckSource).toContain('/search');
        expect(articlesSource).toContain("href: '/search'");
    });

    test('gives /search pillar-level sitemap priority', () => {
        const sitemapSource = readSource('src/app/sitemap.ts');

        expect(sitemapSource).toContain("{ path: '/search', priority: 1.0");
    });
});
