import { readFileSync } from 'node:fs';
import path from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement, type ReactNode } from 'react';
import sharp from 'sharp';
import { describe, expect, test, vi } from 'vitest';

vi.mock('@/app/wallpapers/ClientPage', () => ({ default: ({ embedded }: { embedded?: boolean }) => embedded ? createElement('div', { 'data-gallery': 'true' }) : createElement('h1', null, 'วอลเปเปอร์มงคลทุกคอลเลกชัน') }));
vi.mock('next/navigation', () => ({ notFound: () => { throw new Error('NOT_FOUND'); } }));
vi.mock('next/image', () => ({ default: ({ src, alt, width, height }: { src: string; alt: string; width: number; height: number }) => createElement('img', { src, alt, width, height }) }));
vi.mock('next/link', () => ({ default: ({ href, children }: { href: string; children: ReactNode }) => createElement('a', { href }, children) }));

import DayPage, { generateMetadata, generateStaticParams } from './day/[day]/page';
import { metadata as hubMetadata } from './page';
import { REVIEWED_DAY_WALLPAPERS } from '@/data/wallpaperDayContent';
import { INITIAL_WALLPAPERS, buildWallpaperAlt } from '@/data/wallpapers';

describe('wallpaper search intent and server-rendered content', () => {
    for (const day of ['saturday', 'sunday', 'thursday', 'tuesday']) {
        test(`${day} has a unique day heading, truthful download terms, visible FAQ and a matching real image`, async () => {
            const content = REVIEWED_DAY_WALLPAPERS[day]!;
            const params = Promise.resolve({ day });
            const metadata = await generateMetadata({ params });
            const title = metadata.title as { absolute: string };
            expect(title.absolute).toContain(content.label);
            expect(title.absolute.match(/NameMongkol/g)).toHaveLength(1);
            expect(metadata.description).toContain('ฟรีหลังเข้าสู่ระบบ');
            expect(metadata.alternates?.canonical).toBe(`https://www.namemongkol.com/wallpapers/day/${day}`);

            const html = renderToStaticMarkup(await DayPage({ params }));
            expect(html.match(/<h1\b/g)).toHaveLength(1);
            expect(html).toContain(`<h1>${content.h1}</h1>`);
            expect(html).toContain(`alt="${content.alt}"`);
            expect(html).toContain(`?id=${content.id}`);
            const schemas = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(match => JSON.parse(match[1]));
            const faq = schemas.find(schema => schema['@type'] === 'FAQPage');
            for (const question of faq.mainEntity) expect(html).toContain(`<summary>${question.name}</summary>`);
            expect(schemas.find(schema => schema['@type'] === 'CollectionPage').primaryImageOfPage.caption).toBe(content.alt);

            const wallpaper = INITIAL_WALLPAPERS.find(wallpaper => wallpaper.id === content.id)!;
            expect(wallpaper.day).toBe(day);
            expect(wallpaper.image).toBe(content.image);
            expect(buildWallpaperAlt(wallpaper)).toBe(content.alt);
            expect(wallpaper.description).toBe(content.description);
            const file = readFileSync(path.join(process.cwd(), 'public', content.image));
            const image = await sharp(file).metadata();
            expect(image.format).toBe('webp');
            expect([image.width, image.height]).toEqual([content.width, content.height]);
        });
    }

    test('keeps the hub broad and its social descriptions consistent', () => {
        const title = hubMetadata.title as { absolute: string };
        expect(title.absolute).toBe('วอลเปเปอร์มงคลตามวันเกิดและราศี | NameMongkol');
        expect(hubMetadata.description).toContain('ราคาเครดิต');
        expect(hubMetadata.openGraph?.description).toBe(hubMetadata.description);
        expect(hubMetadata.twitter?.description).toBe(hubMetadata.description);
    });

    test('preserves the eight supported day routes and rejects unknown days', async () => {
        const days = await generateStaticParams();
        expect(days).toHaveLength(8);
        for (const { day } of days) {
            const params = Promise.resolve({ day });
            const html = renderToStaticMarkup(await DayPage({ params }));
            expect(html.match(/<h1\b/g)).toHaveLength(1);
            const title = (await generateMetadata({ params })).title as { absolute: string };
            expect(title.absolute.match(/NameMongkol/g)).toHaveLength(1);
        }
        await expect(DayPage({ params: Promise.resolve({ day: 'unknown' }) })).rejects.toThrow('NOT_FOUND');
    });
});
