import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { articles } from '@/data/articles';
import { namingBirthdayLinks } from '@/data/babyNaming';
import { isRedirectedArticleSlug } from './articleRedirects';
import { getArticleNamingJourney, NAMING_ARTICLE_PROFILES } from './articleNamingJourney';
import { NamingArticleJourney } from '@/components/names/NamingArticleJourney';
import { NICKNAME_COLLECTION_LINKS } from './nicknameCollectionLinks';

describe('contextual article naming journeys', () => {
    it('uses published canonical article slugs and existing category/day routes', () => {
        const articleSlugs = new Set(articles.map(article => article.slug));
        const days = new Set<string>(namingBirthdayLinks.map(([day]) => day));
        for (const slug of Object.keys(NAMING_ARTICLE_PROFILES)) {
            expect(articleSlugs.has(slug), slug).toBe(true);
            expect(isRedirectedArticleSlug(slug), slug).toBe(false);
            const journey = getArticleNamingJourney(slug)!;
            const links = [...journey.steps, ...journey.related];
            expect(new Set(links.map(link => link.href)).size).toBe(links.length);
            for (const { href } of links) {
                const url = new URL(href, 'https://www.namemongkol.com');
                expect(url.search).toBe('');
                expect(url.pathname).not.toBe(`/articles/${slug}`);
                if (url.pathname.startsWith('/articles/')) {
                    expect(articleSlugs.has(url.pathname.slice('/articles/'.length)), href).toBe(true);
                } else if (/^\/names\/(?:boys\/|girls\/)?by-birthday\/[^/]+$/.test(url.pathname)) {
                    expect(days.has(url.pathname.split('/').at(-1)!)).toBe(true);
                    expect(url.pathname).not.toBe('/names/girls/by-birthday/monday');
                } else if (url.pathname.startsWith('/nicknames/')) {
                    expect(NICKNAME_COLLECTION_LINKS.some(collection => collection.path === url.pathname), href).toBe(true);
                } else {
                    expect(existsSync(path.join(process.cwd(), 'src/app', url.pathname, 'page.tsx')), href).toBe(true);
                }
            }
        }
    });

    it('matches article day and gender without sending every article to Monday', () => {
        expect(getArticleNamingJourney('sunday-boy-names-2569-avoid-kalakini')?.steps[0].href).toBe('/names/boys/by-birthday/sunday');
        expect(getArticleNamingJourney('boy-names-wednesday-night-2569')?.steps[0].href).toBe('/names/boys/by-birthday/wednesday_night');
        expect(getArticleNamingJourney('monday-girl-names-2569-no-sara')?.steps[0].href).toBe('/names/by-birthday/monday');
        expect(getArticleNamingJourney('girl-names-2569-auspicious-modern')?.steps[0].href).toBe('/names/girls');
        expect(getArticleNamingJourney('naming-tips-2026-year-of-horse')?.steps[0].href).toBe('/names/boys');
        expect(getArticleNamingJourney('auspicious-names-by-birthday-2026')?.steps[0].href).toBe('/names#naming-birthdays');
        expect(getArticleNamingJourney('change-auspicious-name-checklist-numerology-thaksa-ayatana-surname')?.steps[0].href).toBe('/search');
    });

    it('keeps nickname meanings in their own catalog and labels real-name analysis separately', () => {
        const journey = getArticleNamingJourney('nickname-kalakini-effect')!;
        expect(journey.steps.map(step => step.href)).toEqual(['/nicknames', '/nicknames/meaning/happiness', '/name-check']);
        expect(journey.steps.at(-1)?.label).toContain('ชื่อจริง');
        expect(journey.steps.some(step => step.href.startsWith('/meaning'))).toBe(false);
        expect(journey.related[0].href).toBe('/articles/real-name-nickname-numerology');
    });

    it('renders readable crawlable anchors before hydration with no extra H1 or personal tracking', () => {
        for (const slug of Object.keys(NAMING_ARTICLE_PROFILES)) {
            const journey = getArticleNamingJourney(slug)!;
            const html = renderToStaticMarkup(React.createElement(NamingArticleJourney, { slug }));
            expect(html.match(/<nav\b/g)).toHaveLength(1);
            expect(html).not.toContain('<h1');
            expect(html).not.toContain('data-track');
            expect(html).not.toContain('onclick');
            for (const link of [...journey.steps, ...journey.related]) {
                expect(html).toContain(`href="${link.href}"`);
                expect(html).toContain(link.label);
            }
        }
    });

    it('adds no human-naming journey to pets, phones, wallpapers, palms or unknown articles', () => {
        for (const slug of ['lucky-cat-names-by-birthday-2026', '17-auspicious-thai-cats-2569', 'auspicious-phone-number-guide-2026', 'most-accurate-phone-number-analysis-2026', 'caishen-wallpaper-free-download', 'palmistry-lines-meaning', 'unknown', '__proto__']) {
            expect(getArticleNamingJourney(slug)).toBeNull();
            expect(renderToStaticMarkup(React.createElement(NamingArticleJourney, { slug }))).toBe('');
        }
    });
});
