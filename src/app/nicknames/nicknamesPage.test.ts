import React from 'react';
import { renderToString } from 'react-dom/server';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/auspiciousNicknames', () => ({
    queryNicknames: () => ({ response: {} }),
}));
vi.mock('@/components/names/NamingProvider', () => ({
    FavoriteListButton: ({ className }: { className?: string }) =>
        React.createElement('button', { className, type: 'button' }, 'ชื่อที่เก็บ'),
}));
vi.mock('./NicknameBrowser', () => ({
    default: () => { throw new Promise(() => {}); },
}));

import NicknamesPage from './page';
import { NICKNAME_COLLECTION_LINKS } from '@/lib/nicknameCollectionLinks';

beforeAll(() => vi.stubGlobal('React', React));
afterAll(() => vi.unstubAllGlobals());

describe('nickname discovery server shell', () => {
    it('keeps its one H1, breadcrumbs, collection links and guide visible while the browser suspends', () => {
        const html = renderToString(React.createElement(NicknamesPage));
        expect(html).toContain('กำลังเตรียมชื่อเล่นมงคล…');
        expect(html.match(/<h1\b/g)).toHaveLength(1);
        expect(html).toContain('<h1>ชื่อเล่นมงคล</h1>');
        expect(html.match(/<main\b/g)).toHaveLength(1);
        const fallbackStart = html.indexOf('<!--$!');
        expect(fallbackStart).toBeGreaterThan(0);
        const shell = html.slice(0, fallbackStart);
        expect(shell).toContain('aria-current="page"');
        expect(shell).toContain('href="/search"');
        expect(shell).toContain('ชื่อที่เก็บ');
        for (const collection of NICKNAME_COLLECTION_LINKS) {
            expect(shell).toContain(`href="${collection.path}"`);
            expect(shell).toContain(collection.label);
        }
        expect(html).toContain('เริ่มเลือกชื่อเล่นจากความหมาย แล้วค่อยดูวันเกิดและเลขศาสตร์');
        expect(html.indexOf('แนวทางเลือกชื่อเล่นมงคล')).toBeLessThan(html.indexOf('</main>'));
    });
});
