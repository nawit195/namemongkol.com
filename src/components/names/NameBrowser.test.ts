import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
vi.mock('./NamingProvider', () => ({
    FavoriteButton: ({ name }: { name: string }) => React.createElement('button', { type: 'button' }, `เก็บ ${name}`),
    trackNaming: vi.fn(),
}));
import { NameBrowser } from './NameBrowser';
import type { NameChoice } from '@/lib/nameChoices';

beforeAll(() => vi.stubGlobal('React', React));
afterAll(() => vi.unstubAllGlobals());

describe('real-name card meaning links', () => {
    it('renders curated name headings as encoded NFC meaning links without adding another action row', () => {
        const name = 'ณิชา';
        const items: NameChoice[] = [{ name, kind: 'thai', meaning: 'ตัวอย่างข้อมูลความหมาย', numerology: 19, grade: 'A' }];
        const html = renderToStaticMarkup(React.createElement(NameBrowser, { initialItems: items, title: 'รายชื่อจริง' }));
        const heading = html.match(/<h3>([\s\S]*?)<\/h3>/)?.[1];
        expect(heading).toContain(`href="/meaning/${encodeURIComponent(name.normalize('NFC'))}"`);
        expect(heading).toContain('อ่านความหมายของชื่อ');
        expect(html).toContain(`href="/name-check?name=${encodeURIComponent(name)}"`);
        expect(html).toContain(`เก็บ ${name}`);
        expect(html.match(/<article\b/g)).toHaveLength(1);
        expect(html.match(/<button\b/g)).toHaveLength(2); // clear filters and existing favorite
        expect(html).not.toContain('<h1');
        expect(html).not.toContain('data-track-meta');
    });

    it('keeps nonseed Thai, nickname and English headings plain while preserving their existing actions', () => {
        const items: NameChoice[] = [
            { name: 'พลอย', kind: 'nickname', meaning: 'อัญมณี' },
            { name: 'Amelie', kind: 'english', meaning: 'ชื่อภาษาอังกฤษ' },
            { name: 'ธนกร', kind: 'thai', meaning: 'ผู้สร้างทรัพย์' },
            { name: 'กานต์', kind: 'thai', meaning: 'เป็นที่รัก' },
        ];
        const html = renderToStaticMarkup(React.createElement(NameBrowser, { initialItems: items, title: 'ตัวเลือกชื่อ' }));
        const headings = [...html.matchAll(/<h3>([\s\S]*?)<\/h3>/g)].map(match => match[1]);
        expect(headings[0]).toBe('พลอย');
        expect(headings[1]).toBe('Amelie');
        expect(headings[2]).toContain('/meaning/');
        expect(headings[3]).toBe('กานต์');
        expect(html.match(/href="\/meaning\//g)).toHaveLength(1);
        expect(html).not.toContain(`/name-check?name=${encodeURIComponent('พลอย')}`);
        expect(html).toContain('/name-check?name=Amelie');
        expect(html).toContain(`/name-check?name=${encodeURIComponent('กานต์')}`);
        expect(html).toContain('เก็บ กานต์');
    });
});
