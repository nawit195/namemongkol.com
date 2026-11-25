import { describe, expect, it, vi } from 'vitest';
import { articles } from '@/data/articles';
import { articleAbsoluteTitle, enhanceNameArticleTables, prepareNameArticleTables } from './articleNameTables';

describe('progressive article name search', () => {
    it('keeps all article rows available when optional meaning data fails and skips that lookup for other articles', async () => {
        const article = articles.find(article => article.slug === 'monday-girl-names-2569-no-sara')!;
        const unavailable = vi.fn(async () => { throw new Error('catalog unavailable'); });
        const result = await prepareNameArticleTables(article.content, article.slug, unavailable);
        expect(result.total).toBe(400);
        expect(result.html).toContain('data-name-search=');
        expect(result.html).toContain('รอตรวจคำอ่าน');
        expect(result.html).not.toContain('href="/meaning/');
        unavailable.mockClear();
        expect((await prepareNameArticleTables('<p>other</p>', 'other', unavailable)).html).toBe('<p>other</p>');
        expect(unavailable).not.toHaveBeenCalled();
    });
    it('preserves every original Monday row in HTML and reports the actual distinct names', () => {
        const article = articles.find(article => article.slug === 'monday-girl-names-2569-no-sara')!;
        const result = enhanceNameArticleTables(article.content, article.slug, [{ name: 'ดลพร', path: '/meaning/test', pronunciation: 'ดน-พอน' }]);
        expect(result.total).toBe(400); expect(result.unique).toBe(348);
        expect(result.suitable).toBeGreaterThan(0); expect(result.suitable).toBeLessThan(result.total);
        expect(result.groups.map(group => group.count)).toEqual([100, 100, 100, 100]);
        expect(result.html.match(/data-name-row\b/g)).toHaveLength(400);
        expect(result.html).toContain('รอตรวจคำอ่าน');
        expect(result.html).toContain('href="/meaning/test"');
        expect(result.html).toContain('ดน-พอน');
        expect(result.html.match(/class="name-table-analysis"/g)).toHaveLength(400);
        expect(result.html).toContain('data-name-suitable="false"');
    });
    it('does not turn English transliterations into verified Thai pronunciations or invent meaning links', () => {
        const article = articles.find(article => article.slug === '100-auspicious-women-names-2026')!;
        const result = enhanceNameArticleTables(article.content, article.slug);
        expect(result.total).toBeGreaterThanOrEqual(100);
        expect(result.groups).toHaveLength(6);
        expect(result.html).not.toContain('href="/meaning/');
        expect(result.html).toContain('Nalin');
    });
    it('leaves other articles unchanged and emits one brand suffix', () => {
        expect(enhanceNameArticleTables('<table>other</table>', 'other').html).toBe('<table>other</table>');
        for (const value of ['ชื่อมงคล', 'ชื่อมงคล | NameMongkol', 'ชื่อมงคล | NameMongkol | NameMongkol']) expect(articleAbsoluteTitle(value)).toBe('ชื่อมงคล | NameMongkol');
    });
});
