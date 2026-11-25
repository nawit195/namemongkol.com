import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
vi.mock('server-only', () => ({}));
vi.mock('next/navigation', () => ({ notFound: () => { throw new Error('NEXT_NOT_FOUND'); } }));
vi.mock('@/components/names/NamingProvider', () => ({
    FavoriteButton: ({ name }: { name: string }) => React.createElement('button', { type: 'button', 'aria-label': `เก็บ ${name}` }, 'เก็บชื่อ'),
    FavoriteListButton: ({ className }: { className?: string }) => React.createElement('button', { className, type: 'button' }, 'ชื่อที่เก็บ'),
}));
import catalog from '@/data/auspiciousNicknames.json';
import { NICKNAME_COLLECTION_LINKS } from './nicknameCollectionLinks';
import { getNicknameCollection, getPublishedNicknameCollections, nicknameCollectionMetadata, nicknameCollectionSchema } from './nicknameCollections';
import NicknameCollectionPage from '@/app/nicknames/NicknameCollectionPage';
import { generateStaticParams, generateMetadata, default as MeaningPage } from '@/app/nicknames/meaning/[slug]/page';
import { siteUrl } from './seo';

beforeAll(() => vi.stubGlobal('React', React));
afterAll(() => vi.unstubAllGlobals());

describe('curated free nickname collections', () => {
    it('publishes exactly the three explicit collections with intact free source data', () => {
        const collections = getPublishedNicknameCollections();
        expect(collections.map(item => item.path)).toEqual(NICKNAME_COLLECTION_LINKS.map(item => item.path));
        expect(collections.map(item => item.entries.length)).toEqual([8, 8, 20]);
        const source = new Map(catalog.records.map(item => [item.id, item]));
        for (const collection of collections) {
            expect(new Set(collection.entries.map(({ item }) => item.id)).size).toBe(collection.entries.length);
            expect(collection.entries.length).toBeGreaterThanOrEqual(8);
            for (const { item, reason } of collection.entries) {
                expect(item.grade).not.toBe('A+');
                expect(item.access).toBe('free');
                expect(item.meaning).toBe(source.get(item.id)?.meaning);
                expect(item.gender).toBe(source.get(item.id)?.gender);
                expect(item.numerology).toBe(source.get(item.id)?.numerology);
                expect(reason.trim().length).toBeGreaterThan(15);
            }
        }
        expect(getNicknameCollection('unisex')!.entries.every(({ item }) => item.gender === 'unisex')).toBe(true);
    });

    it('keeps distinct metadata, self-canonicals and complete share metadata', () => {
        const titles = new Set<string>();
        for (const collection of getPublishedNicknameCollections()) {
            const meta = nicknameCollectionMetadata(collection);
            expect(meta.alternates?.canonical).toBe(siteUrl + collection.path);
            expect(meta.title).toBe(collection.title);
            expect(collection.title).not.toContain('NameMongkol');
            titles.add(collection.title);
            expect(meta.description).toBe(collection.description);
            expect(meta.openGraph).toHaveProperty('url', siteUrl + collection.path);
            expect(meta.openGraph).toHaveProperty('images');
            expect(meta.twitter).toHaveProperty('card', 'summary_large_image');
        }
        expect(titles.size).toBe(3);
    });

    it('serves full visible names, meanings, editorial context and analysis links in server HTML', () => {
        for (const collection of getPublishedNicknameCollections()) {
            const html = renderToStaticMarkup(React.createElement(NicknameCollectionPage, { collectionKey: collection.key }));
            expect((html.match(/<h1\b/g) ?? []).length).toBe(1);
            expect((html.match(/<article\b/g) ?? []).length).toBe(collection.entries.length);
            for (const { item } of collection.entries) {
                expect(html).toContain(item.name);
                expect(html).toContain(new URLSearchParams({ name: item.name }).toString().replace(/&/g, '&amp;'));
            }
            expect(html).toContain('ตามชุดข้อมูลชื่อเล่นต้นฉบับ');
            expect(html).toContain('เหตุผลที่เลือก');
            expect(html).toContain(collection.question);
            expect(html).not.toContain('ปลดล็อกชุดนี้');
            const match = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s);
            expect(match).not.toBeNull();
            const schema = JSON.parse(match![1]);
            expect(schema['@graph'].map((node: Record<string, unknown>) => node['@type'])).toEqual(['CollectionPage', 'ItemList', 'BreadcrumbList']);
            expect(schema['@graph'][1].numberOfItems).toBe(collection.entries.length);
            expect(schema['@graph'][1].itemListElement.map((node: { item: { name: string } }) => node.item.name)).toEqual(collection.entries.map(({ item }) => item.name));
            expect(schema['@graph'][2].itemListElement.at(-1).item).toBe(siteUrl + collection.path);
        }
    });

    it('does not expose unsupported collections and rejects unknown meaning slugs', async () => {
        expect(generateStaticParams()).toEqual([{ slug: 'light' }, { slug: 'happiness' }]);
        expect(getNicknameCollection('meaning/unknown')).toBeNull();
        expect(getNicknameCollection('aplus')).toBeNull();
        expect(() => NicknameCollectionPage({ collectionKey: 'meaning/unknown' })).toThrow('NEXT_NOT_FOUND');
        await expect(generateMetadata({ params: Promise.resolve({ slug: 'unknown' }) })).rejects.toThrow('NEXT_NOT_FOUND');
        const view = await MeaningPage({ params: Promise.resolve({ slug: 'unknown' }) });
        expect(() => renderToStaticMarkup(view)).toThrow('NEXT_NOT_FOUND');
    });

    it('uses only actual visible entries in structured data and escapes script injection', () => {
        const original = getNicknameCollection('unisex')!;
        const collection = { ...original, entries: [{ ...original.entries[0], item: { ...original.entries[0].item, meaning: '</script><script>bad()</script>' } }] };
        const encoded = JSON.stringify(nicknameCollectionSchema(collection)).replace(/</g, '\\u003c');
        expect(encoded).not.toContain('</script>');
        expect(JSON.parse(encoded)['@graph'][1].numberOfItems).toBe(1);
        expect(JSON.parse(encoded)['@graph'][1].itemListElement[0].item.description).toBe(collection.entries[0].item.meaning);
    });
});
