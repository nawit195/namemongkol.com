import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test, vi } from 'vitest';
vi.mock('@/utils/supabase', () => ({ supabase: {} }));
import { SearchDataSourceNotice } from './ClientPage';

test('fallback notice explains that curated names are not the full database', () => {
    const html = renderToStaticMarkup(createElement(SearchDataSourceNotice, { dataSource: 'fallback' }));
    expect(html).toContain('role="status"');
    expect(html).toContain('รายชื่อสำรอง');
    expect(html).toContain('ยังไม่ใช่รายชื่อทั้งหมด');
    expect(html).not.toContain('Supabase');
});

test('database and older responses render without a fallback notice', () => {
    expect(renderToStaticMarkup(createElement(SearchDataSourceNotice, { dataSource: 'database' }))).toBe('');
    expect(renderToStaticMarkup(createElement(SearchDataSourceNotice, {}))).toBe('');
});
