import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { NamingIntentLinks } from './NamingIntentLinks';

describe('search-intent next steps', () => {
    it('provides crawlable next steps matching the purpose of each owner page', () => {
        const expected = {
            search: ['/meaning', '/name-check', '/names', '/nicknames'],
            baby: ['/nicknames/meaning/happiness', '/nicknames/unisex', '/articles/name-meaning-vs-numerology'],
            analysis: ['/search', '/compare-names', '/articles/name-meaning-vs-numerology'],
            premium: ['/nicknames', '/name-check'],
        } as const;
        const headings = new Set<string>();
        for (const context of Object.keys(expected) as (keyof typeof expected)[]) {
            const html = renderToStaticMarkup(React.createElement(NamingIntentLinks, { context }));
            const links = [...html.matchAll(/<a[^>]+href="([^"]+)"/g)].map(match => match[1]);
            expect(links).toEqual(expected[context]);
            expect(html).not.toContain('<h1');
            expect(html).not.toContain('onclick');
            const heading = html.match(/<h2[^>]*>(.*?)<\/h2>/)?.[1];
            expect(heading).toBeTruthy();
            headings.add(heading!);
        }
        expect(headings.size).toBe(4);
    });
    it('keeps a clear distinction between name-search and nickname data', () => {
        const html = renderToStaticMarkup(React.createElement(NamingIntentLinks, { context: 'premium' }));
        expect(html).toContain('ชื่อจริง');
        expect(html).toContain('ข้อมูลคนละชุด');
        expect(html).toContain('ตัวอย่างดูฟรี');
    });
});
