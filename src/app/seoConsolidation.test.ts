import { describe, expect, test } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const readSource = (filePath: string) => readFileSync(path.join(root, filePath), 'utf8');

const consolidatedSlugs = [
    '100-auspicious-boy-names-2569',
    'auspicious-boy-names-2569',
    'check-kalakini-letters-7-days',
    'lucky-names-by-birthday-2569',
    '700-auspicious-names-by-birthday-2569',
];

describe('SEO consolidation and answer-ready content', () => {
    test('permanently redirects every approved duplicate to its canonical winner', () => {
        const config = readSource('next.config.ts');

        for (const slug of consolidatedSlugs) {
            expect(config).toContain(`source: '/articles/${slug}'`);
        }
        expect(config).toContain("source: '/names/girls/by-birthday/monday'");
        expect(config).toContain("destination: '/articles/monday-girl-names-2569-no-sara'");
        expect(config.match(/permanent: true/g)?.length).toBeGreaterThanOrEqual(6);
    });

    test('removes redirected articles and the Monday duplicate from discovery surfaces', () => {
        const sitemap = readSource('src/app/sitemap.ts');
        const articleIndex = readSource('src/app/articles/page.tsx');
        const articleRoute = readSource('src/app/articles/[slug]/page.tsx');

        for (const slug of consolidatedSlugs) {
            expect(sitemap).toContain(`'${slug}'`);
            expect(articleIndex).toContain(`'${slug}'`);
            expect(articleRoute).toContain(`'${slug}'`);
        }
        expect(sitemap).toContain("!(gender === 'girls' && day === 'monday')");
        expect(articleRoute).toContain('.filter((slug) => !SLUG_REDIRECTS[slug])');
    });

    test('renders direct answers, summary tables, sources and tracked CTAs for priority articles', () => {
        const profiles = readSource('src/data/articleTrust.ts');
        const articleRoute = readSource('src/app/articles/[slug]/page.tsx');

        for (const slug of [
            'monday-girl-names-2569-no-sara',
            'naming-tips-2026-year-of-horse',
            '100-auspicious-women-names-2026',
            'forbidden-letters-kalakini',
            'auspicious-names-by-birthday-2026',
        ]) {
            expect(profiles).toContain(`'${slug}'`);
        }
        expect(articleRoute).toContain('answerProfile?.directAnswer');
        expect(articleRoute).toContain('<table');
        expect(articleRoute).toContain('article.sources');
        expect(articleRoute).toContain('reviewedBy');
        expect(articleRoute).toContain("link.href === '/premium-search' ? 'premium'");
    });

    test('keeps page intent ownership distinct and adds verifiable trust content', () => {
        const home = readSource('src/app/page.tsx');
        const homeHero = readSource('src/components/HeroBanner.tsx');
        const nameAnalysis = readSource('src/app/name-analysis/page.tsx');
        const wallpaper = readSource('src/app/wallpapers/page.tsx');
        const methodology = readSource('src/app/methodology/page.tsx');

        expect(home).toContain('heroHeadingLevel="h1"');
        expect(homeHero).toContain('id="home-seo-answer"');
        expect(nameAnalysis).toContain('เปรียบเทียบชื่อหลายชื่อ');
        expect(wallpaper).toContain('วอลเปเปอร์สายมูตามวันเกิด ฟรี 2569');
        expect(wallpaper).toContain("'@type': 'ImageObject'");
        expect(methodology).toContain('charValues');
        expect(methodology).toContain('นโยบายบรรณาธิการ');
        expect(methodology).toContain('การแก้ไขข้อมูล');
    });
});
