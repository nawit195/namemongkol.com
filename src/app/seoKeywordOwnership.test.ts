import { describe, expect, test } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const readSource = (filePath: string) => readFileSync(path.join(root, filePath), 'utf8');

describe('conservative SEO keyword ownership', () => {
    test('keeps each head keyword mapped to a distinct public page', () => {
        const home = readSource('src/app/page.tsx');
        const homeHero = readSource('src/i18n/dictionaries.ts');
        const nameCheck = readSource('src/app/name-check/page.tsx');
        const search = readSource('src/app/search/page.tsx');
        const nameAnalysis = readSource('src/app/name-analysis/page.tsx');

        expect(home).toContain("const pageTitle = 'NameMongkol | ค้นหาและวิเคราะห์ชื่อมงคลตามวันเกิด'");
        expect(homeHero).toContain("titlePrefix: 'วิเคราะห์'");
        expect(homeHero).toContain("titleHighlight: 'ชื่อมงคล'");
        expect(nameCheck).toContain("title: 'วิเคราะห์ชื่อ นามสกุล ฟรี | ถอดอักษรเป็นเลขศาสตร์ เช็กคู่เลขในชื่อ | NameMongkol'");
        expect(nameCheck).toContain("canonical: `${siteUrl.replace(/\\/$/, '')}/name-check`");
        expect(search).toContain("const searchPageTitle = 'ค้นหาชื่อมงคล พร้อมคำอ่าน ความหมาย และเลขศาสตร์ | NameMongkol'");
        expect(nameAnalysis).toContain("title: 'เปรียบเทียบชื่อหลายชื่อ จัดเกรดและส่งออกผล | NameMongkol'");
    });

    test('renders only the analysis surface on /name-check and preserves its reset URL', () => {
        const clientHome = readSource('src/app/ClientHome.tsx');
        const nameCheck = readSource('src/app/name-check/page.tsx');

        expect(clientHome).toContain("surface?: 'home' | 'name-check'");
        expect(clientHome).toContain("surface = 'home'");
        expect(clientHome).toContain("const isHomeSurface = surface === 'home'");
        expect(clientHome).toContain("if (!isHomeSurface || result || didFetchHomeSections.current) return");
        expect(clientHome).toContain("window.history.pushState({}, '', isHomeSurface ? '/' : '/name-check')");
        expect(clientHome).toContain('{isHomeSurface && !result && (');
        expect(nameCheck).toContain('<ClientHome surface="name-check" />');
        expect(nameCheck).toContain('<HomeFallback surface="name-check" />');
        expect(nameCheck.match(/<h1/g)).toHaveLength(1);
    });

    test('uses the same FAQ and HowTo source for visible content and JSON-LD', () => {
        const nameCheck = readSource('src/app/name-check/page.tsx');
        const seoContent = readSource('src/components/NameCheckSeoContent.tsx');
        const seoData = readSource('src/data/nameCheckSeo.ts');

        expect(nameCheck).toContain('nameCheckFaqItems.map');
        expect(nameCheck).toContain('nameCheckHowTo.steps.map');
        expect(seoContent).toContain('nameCheckFaqItems.map');
        expect(seoContent).toContain('nameCheckHowTo.steps.map');
        expect(seoData).toContain('ไม่ต้องสมัครสมาชิกหรือเข้าสู่ระบบก็เริ่มวิเคราะห์ชื่อและนามสกุลฟรีได้ทันที');
    });

    test('protects the current long-tail and wallpaper winners', () => {
        const mondayArticle = readSource('src/data/article-monday-girl-names-2569.ts');
        const wallpapers = readSource('src/app/wallpapers/page.tsx');
        const wallpaperDay = readSource('src/app/wallpapers/day/[day]/page.tsx');

        expect(mondayArticle).toContain("metaTitle: 'ชื่อมงคล คนเกิดวันจันทร์ ผู้หญิง 2569 รวม 400 ชื่อทันสมัย | NameMongkol'");
        expect(wallpapers).toContain("title: 'วอลเปเปอร์สายมูตามวันเกิด ฟรี 2569 | การเงิน งาน ความรัก | NameMongkol'");
        expect(wallpapers).toContain("canonical: `${siteUrl}/wallpapers`");
        expect(wallpaperDay).toContain('canonical: `${siteUrl}/wallpapers/day/${day}`');
    });

    test('tracks exact head terms, protected cohorts and change-name ownership in GSC reporting', () => {
        const report = readSource('scripts/generate-gsc-weekly-report.js');

        for (const key of [
            'home',
            'change-name-pillar',
            'change-name-2569',
            'protected-monday-girl',
            'protected-wallpapers',
            'name-head-exact',
            'analyze-name-exact',
            'analyze-auspicious-name-exact',
            'change-name-exact',
        ]) {
            expect(report).toContain(`key: '${key}'`);
        }
    });
});
