import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test, vi } from 'vitest';

vi.mock('@/utils/supabase', () => ({ supabase: {} }));
import { NameRow } from './ClientPage';

const record = {
    name: 'กมล', englishName: 'Kamon', englishNameStatus: 'pending' as const,
    englishNameSource: 'rtgs-reading-v1', gender: 'neutral' as const,
    pronunciation: 'กะ-มน', numerology: 15, suitableDays: ['sunday' as const],
    grade: 'A' as const, rowIndex: 0,
};

test('server HTML shows suggestions without pending badges in mobile and desktop spelling cells', () => {
    const html = renderToStaticMarkup(createElement('table', null, createElement('tbody', null, createElement(NameRow, record))));
    expect(html.match(/Kamon/g)).toHaveLength(2);
    expect(html).not.toContain('รอตรวจสอบ');
    expect(html).toContain('lang="en"');
});

test('source spellings keep their original case and rejected spellings are absent', () => {
    const legacy = renderToStaticMarkup(createElement('table', null, createElement('tbody', null, createElement(NameRow, { ...record, englishName: 'KAMOL', englishNameStatus: undefined }))));
    expect(legacy).toContain('KAMOL');
    expect(legacy).not.toContain('รอตรวจสอบ');
    const rejected = renderToStaticMarkup(createElement('table', null, createElement('tbody', null, createElement(NameRow, { ...record, englishName: 'RejectedValue', englishNameStatus: 'rejected' }))));
    expect(rejected).not.toContain('RejectedValue');
});
