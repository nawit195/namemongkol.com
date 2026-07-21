import { describe, expect, test } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import robots, {
    PRIVATE_CRAWL_PATHS,
    RETRIEVAL_CRAWLERS,
    TRAINING_CRAWLERS,
} from './robots';
import { dedupeSitemapEntries } from './sitemap';
import { ARTICLE_REDIRECTS, isRedirectedArticleSlug } from '@/lib/articleRedirects';

const root = process.cwd();
const readSource = (filePath: string) => readFileSync(path.join(root, filePath), 'utf8');

describe('SEO discovery surfaces', () => {
    test('keeps private routes closed for generic and retrieval crawlers', () => {
        const rules = robots().rules;
        const ruleList = Array.isArray(rules) ? rules : [rules];
        const genericRule = ruleList.find((rule) => rule.userAgent === '*');
        const retrievalRule = ruleList.find((rule) => Array.isArray(rule.userAgent));

        expect(genericRule?.disallow).toEqual([...PRIVATE_CRAWL_PATHS]);
        expect(retrievalRule?.userAgent).toEqual([...RETRIEVAL_CRAWLERS]);
        expect(retrievalRule?.disallow).toEqual([...PRIVATE_CRAWL_PATHS]);
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
