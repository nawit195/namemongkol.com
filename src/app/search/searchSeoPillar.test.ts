import { describe, expect, test } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const readSource = (filePath: string) => readFileSync(path.join(root, filePath), 'utf8');

describe('/search SEO pillar content', () => {
    test('targets ชื่อมงคล as the primary search landing page', () => {
        const pageSource = readSource('src/app/search/page.tsx');
        const dictionarySource = readSource('src/i18n/dictionaries.ts');

        expect(pageSource).toContain('ชื่อมงคล 5,000+ ชื่อ พร้อมความหมาย เลขศาสตร์ และวันเกิดที่เหมาะสม | NameMongkol');
        expect(pageSource).toContain('title: { absolute: searchPageTitle }');
        expect(pageSource).toContain('รายชื่อมงคล 5,000+ ชื่อ');
        expect(dictionarySource).toContain('ชื่อมงคล 5,000+ ชื่อ สำหรับตั้งชื่อลูกและเปลี่ยนชื่อ');
    });

    test('renders server-side answer sections and FAQ for AEO', () => {
        const pageSource = readSource('src/app/search/page.tsx');

        expect(pageSource).toContain('ชื่อมงคลคืออะไร');
        expect(pageSource).toContain('วิธีเลือกชื่อมงคลให้เหมาะกับวันเกิด');
        expect(pageSource).toContain('ชื่อมงคลชาย / ชื่อมงคลหญิง');
        expect(pageSource).toContain('หลังเลือกชื่อแล้วควรวิเคราะห์ร่วมกับนามสกุลอย่างไร');
        expect(pageSource).toContain('ชื่อมงคลตามวันเกิดดูอย่างไร');
    });

    test('covers supporting keyword clusters without duplicate FAQ anchors', () => {
        const pageSource = readSource('src/app/search/page.tsx');
        const clientSource = readSource('src/app/search/ClientPage.tsx');
        const combinedSearchSource = `${pageSource}\n${clientSource}`;

        expect(combinedSearchSource).toContain('ชื่อมงคลตามวันเกิด');
        expect(combinedSearchSource).toContain('ตั้งชื่อลูกชาย');
        expect(combinedSearchSource).toContain('ตั้งชื่อลูกสาว');
        expect(combinedSearchSource).toContain('ชื่อความหมายดี');
        expect(combinedSearchSource).toContain('เปลี่ยนชื่อมงคล');
        expect(combinedSearchSource).toContain('ตั้งชื่อลูก 2569');
        expect(combinedSearchSource.match(/id="search-faq"/g) ?? []).toHaveLength(1);
    });

    test('keeps baby-name supporting pages out of the global sidebar', () => {
        const sidebarSource = readSource('src/components/Sidebar.tsx');

        expect(sidebarSource).not.toContain("key: 'baby-names'");
        expect(sidebarSource).not.toContain('ตั้งชื่อลูกสาว');
        expect(sidebarSource).not.toContain('ตั้งชื่อลูกชาย');
    });

    test('passes internal authority from related pages to /search', () => {
        const homeSource = readSource('src/components/HomeSeoContent.tsx');
        const nameCheckSource = readSource('src/components/NameCheckSeoContent.tsx');
        const articlesSource = readSource('src/app/articles/page.tsx');

        expect(homeSource).toContain('ชื่อมงคล 5,000+ ชื่อ');
        expect(nameCheckSource).toContain('ค้นหาชื่อมงคล 5,000+ ชื่อ');
        expect(articlesSource).toContain("href: '/search'");
        expect(articlesSource).toContain("label: 'ค้นหาชื่อมงคล 5,000+ ชื่อ'");
    });

    test('gives /search pillar-level sitemap priority', () => {
        const sitemapSource = readSource('src/app/sitemap.ts');

        expect(sitemapSource).toContain("{ path: '/search', priority: 1.0");
    });
});
