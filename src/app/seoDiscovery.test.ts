import { describe, expect, test, vi } from 'vitest';
vi.mock('server-only', () => ({}));
vi.mock('@/lib/nameMeaningCatalog', () => ({
    getMeaningDiscoveryNames: async () => [
        { name: 'ธนกร', meaning: 'ความหมายตัวอย่างที่เผยแพร่แล้ว', path: `/meaning/${encodeURIComponent('ธนกร')}` },
    ],
}));
import { readFileSync } from 'node:fs';
import path from 'node:path';
import robots, {
    PRIVATE_CRAWL_PATHS,
    RETRIEVAL_CRAWLERS,
    TRAINING_CRAWLERS,
} from './robots';
import sitemap, { dedupeSitemapEntries } from './sitemap';
import { siteUrl } from '@/lib/seo';
import { getPublishedNicknameCollections, nicknameCollectionMetadata } from '@/lib/nicknameCollections';
import { ARTICLE_REDIRECTS, isRedirectedArticleSlug } from '@/lib/articleRedirects';

const root = process.cwd();
const readSource = (filePath: string) => readFileSync(path.join(root, filePath), 'utf8');

describe('SEO discovery surfaces', () => {
    test('includes the nickname canonical once without private or filtered URLs', async () => {
        vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '');
        try {
            const entries = await sitemap();
            expect(entries.filter(entry => entry.url === `${siteUrl}/meaning`)).toHaveLength(1);
            expect(entries.filter(entry => entry.url === `${siteUrl}/meaning/${encodeURIComponent('ธนกร')}`)).toHaveLength(1);
            expect(entries.some(entry => entry.url === `${siteUrl}/meaning/${encodeURIComponent('ยังไม่ยืนยัน')}`)).toBe(false);
            for (const slug of ['real-name-nickname-numerology', 'name-meaning-vs-numerology']) {
                expect(entries.filter(entry => entry.url === `${siteUrl}/articles/${slug}`)).toHaveLength(1);
            }
            expect(entries.filter(entry => entry.url === `${siteUrl}/nicknames`)).toHaveLength(1);
            for (const collection of getPublishedNicknameCollections()) {
                expect(entries.filter(entry => entry.url === `${siteUrl}${collection.path}`)).toHaveLength(1);
            }
            expect(entries.every(entry => !new URL(entry.url).search)).toBe(true);
            expect(entries.every(entry => !PRIVATE_CRAWL_PATHS.some(prefix =>
                new URL(entry.url).pathname === prefix ||
                new URL(entry.url).pathname.startsWith(`${prefix}/`),
            ))).toBe(true);
        } finally {
            vi.unstubAllEnvs();
        }
    });

    test('allows nickname discovery while keeping nickname APIs out of crawling', () => {
        const rules = robots().rules;
        const ruleList = Array.isArray(rules) ? rules : [rules];
        for (const rule of ruleList.filter(rule => rule.userAgent === '*' ||
            (Array.isArray(rule.userAgent) && rule.userAgent.includes('OAI-SearchBot')))) {
            const blocked = Array.isArray(rule.disallow) ? rule.disallow : [rule.disallow];
            expect(blocked.some(prefix => prefix && '/nicknames'.startsWith(prefix))).toBe(false);
            expect(blocked.some(prefix => prefix && '/api/nicknames/unlock'.startsWith(prefix))).toBe(true);
        }
    });

    test('keeps private routes closed for generic and retrieval crawlers', () => {
        const rules = robots().rules;
        const ruleList = Array.isArray(rules) ? rules : [rules];
        const genericRule = ruleList.find((rule) => rule.userAgent === '*');
        const retrievalRule = ruleList.find((rule) => Array.isArray(rule.userAgent));

        expect(genericRule?.disallow).toEqual([...PRIVATE_CRAWL_PATHS]);
        expect(retrievalRule?.userAgent).toEqual([...RETRIEVAL_CRAWLERS]);
        expect(retrievalRule?.disallow).toEqual([...PRIVATE_CRAWL_PATHS]);
    });

    test('allows the actual share-image endpoint while blocking private APIs', () => {
        const metadata = nicknameCollectionMetadata(getPublishedNicknameCollections()[0]);
        const image = (metadata.openGraph?.images as { url: string }[])[0].url;
        const imagePath = new URL(image).pathname;
        const rules = robots().rules;
        const ruleList = Array.isArray(rules) ? rules : [rules];
        for (const rule of ruleList.filter(rule => rule.userAgent === '*' ||
            (Array.isArray(rule.userAgent) && rule.userAgent.includes('OAI-SearchBot')))) {
            const allow = Array.isArray(rule.allow) ? rule.allow : [rule.allow];
            const disallow = Array.isArray(rule.disallow) ? rule.disallow : [rule.disallow];
            const longest = (patterns: typeof allow, pathname: string) =>
                Math.max(0, ...patterns.filter((pattern): pattern is string => Boolean(pattern && pathname.startsWith(pattern))).map(pattern => pattern.length));
            expect(longest(allow, imagePath)).toBeGreaterThan(longest(disallow, imagePath));
            expect(longest(disallow, '/api/admin/search-console')).toBeGreaterThan(longest(allow, '/api/admin/search-console'));
        }
    });

    test('blocks model-training crawlers without blocking search crawlers', () => {
        const rules = robots().rules;
        const ruleList = Array.isArray(rules) ? rules : [rules];
        const trainingRule = ruleList.find(
            (rule) => Array.isArray(rule.userAgent) && rule.userAgent.includes('GPTBot')
        );

        expect(trainingRule?.userAgent).toEqual([...TRAINING_CRAWLERS]);
        expect(trainingRule?.disallow).toBe('/');
    });

    test('deduplicates canonical sitemap URLs and recognizes every redirect source', () => {
        const deduped = dedupeSitemapEntries([
            { url: 'https://www.namemongkol.com/articles' },
            { url: 'https://www.namemongkol.com/articles' },
            { url: 'https://www.namemongkol.com/reviews' },
        ]);

        expect(deduped.map((entry) => entry.url)).toEqual([
            'https://www.namemongkol.com/articles',
            'https://www.namemongkol.com/reviews',
        ]);
        expect(ARTICLE_REDIRECTS.every(({ sourceSlug }) => isRedirectedArticleSlug(sourceSlug))).toBe(true);
    });

    test('keeps redirected pages and deprecated image tags out of discovery XML', () => {
        const sitemap = readSource('src/app/sitemap.ts');
        const imageSitemap = readSource('src/app/image-sitemap.xml/route.ts');

        expect(sitemap).toContain('isRedirectedArticleSlug');
        expect(sitemap).toContain('dedupeSitemapEntries');
        expect(imageSitemap).toContain('isRedirectedArticleSlug');
        expect(imageSitemap).not.toContain('<image:title>');
        expect(imageSitemap).not.toContain('<image:caption>');
    });

    test('marks admin and development demo pages as noindex', () => {
        const adminLayout = readSource('src/app/admin/layout.tsx');
        const demoLayout = readSource('src/app/dev-pricing-demo/layout.tsx');

        for (const source of [adminLayout, demoLayout]) {
            expect(source).toContain('index: false');
            expect(source).toContain('follow: false');
        }
    });
});
