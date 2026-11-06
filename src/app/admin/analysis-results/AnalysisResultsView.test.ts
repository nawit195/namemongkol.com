import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, test, vi } from 'vitest';
import { AnalysisResultsView, type AnalysisResultsViewProps } from './AnalysisResultsView';

const base: AnalysisResultsViewProps = {
    data: { rows: [{ name: 'กานต์', nameScore: 19, grade: 'C' }, { name: '<script>test</script>', nameScore: 24, grade: 'A+' }], total: 105 }, search: '', page: 2,
    loading: false, error: null, accessDenied: null, exporting: false, exportError: null,
    onSearchChange: vi.fn(), onRefresh: vi.fn(), onPageChange: vi.fn(), onExport: vi.fn(),
};
const render = (props: Partial<AnalysisResultsViewProps> = {}) => renderToStaticMarkup(createElement(AnalysisResultsView, { ...base, ...props }));

describe('admin analyzed names view', () => {
    test('shows names, accurate page offsets and a single heading without interpreting names as HTML', () => {
        const html = render();
        expect(html.match(/<h1\b/g)).toHaveLength(1);
        expect(html).toContain('กานต์');
        expect(html).toContain('&lt;script&gt;test&lt;/script&gt;');
        expect(html).not.toContain('<script>test</script>');
        expect(html).toContain('51');
        expect(html).toContain('52');
        expect(html).toContain('หน้า 2 / 3');
        expect(html).toContain('CSV รวมชื่อทั้งหมดที่ตรงคำค้น');
        expect(html.match(/scope="col"/g)).toHaveLength(4);
        expect(html).toContain('ผลรวมชื่อ');
        expect(html).toContain('เกรด');
        expect(html).toContain('>19</td>');
        expect(html).toContain('>C</span>');
        expect(html).toContain('>A+</span>');
        expect(html).toContain('ไม่รวมคะแนนนามสกุล');
    });
    test('distinguishes loading, empty search, empty table and setup failure', () => {
        expect(render({ loading: true, data: null })).toContain('กำลังโหลดรายชื่อ');
        expect(render({ loading: true, data: null })).toContain('colSpan="4"');
        expect(render({ data: { rows: [], total: 0 }, page: 1 })).toContain('ยังไม่มีรายชื่อ');
        expect(render({ data: { rows: [], total: 0 }, page: 1, search: 'ไม่มี' })).toContain('ไม่พบชื่อที่ตรงกับคำค้น');
        const html = render({ data: null, error: 'กรุณาติดตั้ง SQL migration ก่อนใช้งาน' });
        expect(html).toContain('role="alert"');
        expect(html).toContain('กรุณาติดตั้ง SQL migration');
        expect(html).not.toContain('ยังไม่มีรายชื่อ');
    });
    test('presents authentication failures instead of the table', () => {
        const html = render({ data: null, error: 'กรุณาเข้าสู่ระบบ', accessDenied: 'unauthorized' });
        expect(html).toContain('/login?redirect=%2Fadmin%2Fanalysis-results');
        expect(html).not.toContain('<table');
    });
    test('announces CSV failures without hiding a successfully loaded table', () => {
        const html = render({ exportError: 'ดาวน์โหลดไม่สำเร็จ' });
        expect(html).toContain('role="alert"');
        expect(html).toContain('ดาวน์โหลดไม่สำเร็จ');
        expect(html).toContain('<table');
    });
});
