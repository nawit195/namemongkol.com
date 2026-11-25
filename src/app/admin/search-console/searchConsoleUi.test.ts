import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { compatibleComparison, defaultGscScope, defaultGscView, gscReportParams, gscImportListSchema, gscPreviewResponseSchema, gscReportSchema, inferGscFileKind, mergeImportHistory, signedPercent, type GscImport, type GscReport } from './searchConsoleUi';
import { SearchConsolePreview, SearchConsoleReport } from './SearchConsoleReport';

const scope = defaultGscScope(new Date('2026-11-25T08:01:00Z'));
const importOne: GscImport = { id: '10000000-0000-4000-8000-000000000001', createdAt: '2026-11-25T10:00:00Z', scope, kinds: ['queries', 'pages'], rowCount: 12 };
const report: GscReport = {
    ...importOne, kind: 'queries', page: 1, pageSize: 50, total: 1,
    ...defaultGscView('queries'),
    rows: [{ key: 'ชื่อเล่นทดสอบ', query: 'ชื่อเล่นทดสอบ', clicks: 20, impressions: 200, position: 7.5, ctr: 10 }],
    summary: { clicks: 20, impressions: 200, position: 7.5, ctr: 10 },
    warnings: ['ตัวอย่างข้อมูลจากแถวที่ส่งออก'], comparison: null,
};

describe('Search Console report controls', () => {
    it('sends sorting and opportunity filters with the comparison while keeping daily reports unfiltered by opportunity', () => {
        expect(defaultGscView('queries')).toEqual({ sort: 'clicks', order: 'desc', opportunity: false });
        expect(defaultGscView('daily')).toEqual({ sort: 'dimension', order: 'asc', opportunity: false });
        const params = gscReportParams({ kind: 'pages', page: 2, q: '/names', compare: importOne.id, sort: 'position', order: 'asc', opportunity: true });
        expect(Object.fromEntries(params)).toEqual({ kind: 'pages', page: '2', q: '/names', compare: importOne.id, sort: 'position', order: 'asc', opportunity: '1' });
        const daily = gscReportParams({ kind: 'daily', page: 1, q: '', compare: '', ...defaultGscView('daily'), opportunity: true });
        expect(daily.get('opportunity')).toBe('0');
        expect(daily.has('compare')).toBe(false);
        expect(gscReportSchema.safeParse({ ...report, kind: 'daily', opportunity: true }).success).toBe(false);
        expect(gscReportSchema.safeParse({ ...report, sort: 'unsupported' }).success).toBe(false);
    });

    it('defaults to 28 complete Pacific calendar days without shifting the report to Thai time', () => {
        expect(scope.from).toBe('2026-10-28'); expect(scope.to).toBe('2026-11-24');
        const beforeMidnightPT = defaultGscScope(new Date('2026-11-25T07:59:00Z'));
        expect(beforeMidnightPT.to).toBe('2026-11-23');
        expect(beforeMidnightPT.searchType).toBe('web'); expect(beforeMidnightPT.country).toBe('all');
    });
    it('allows only equivalent scopes, equal lengths and non-overlapping periods for comparison', () => {
        const old = { ...scope, from: '2026-09-30', to: '2026-10-27' };
        expect(compatibleComparison(scope, old)).toBe(true);
        for (const other of [{ ...old, country: 'TH' }, { ...old, device: 'mobile' as const }, { ...old, filters: 'query contains x' }, { ...old, to: '2026-10-26' }, { ...scope, from: '2026-10-27', to: '2026-11-23' }]) expect(compatibleComparison(scope, other)).toBe(false);
    });
    it('makes older paged versions reachable without duplicate options or losing selected metadata', () => {
        const old = { ...importOne, id: '10000000-0000-4000-8000-000000000002', createdAt: '2026-10-20T10:00:00Z' };
        const history = mergeImportHistory([old, importOne], [importOne]);
        expect(history.map(item => item.id)).toEqual([importOne.id, old.id]);
        // A duplicate import may open a version older than the currently loaded history page.
        const fromSelectedDetail = mergeImportHistory([importOne], [old]);
        expect(fromSelectedDetail.find(item => item.id === old.id)).toEqual(old);
        expect(mergeImportHistory(fromSelectedDetail, [importOne])).toContainEqual(old);
        expect(gscImportListSchema.safeParse({ success: true, imports: [importOne], total: 101, page: 3, pageSize: 50 }).success).toBe(true);
    });
    it('identifies normal export files while allowing the user to choose an explicit kind', () => {
        expect(inferGscFileKind('Queries.csv')).toBe('queries'); expect(inferGscFileKind('Pages.csv')).toBe('pages');
        expect(inferGscFileKind('Chart.csv')).toBe('daily'); expect(inferGscFileKind('query-page.csv')).toBe('query-pages');
        expect(inferGscFileKind('unrecognized.csv')).toBeNull();
    });
    it('does not turn missing comparison baselines into Infinity or fabricate valid metadata', () => {
        expect(signedPercent(null)).toBe('ไม่มีฐานเปรียบเทียบ'); expect(signedPercent(20)).toBe('+20%');
        expect(gscReportSchema.safeParse({ ...report, scope: { ...scope, from: '2026-02-30' } }).success).toBe(false);
        expect(gscReportSchema.safeParse({ ...report, summary: { ...report.summary, clicks: -2 } }).success).toBe(false);
    });
});
describe('Search Console report presentation', () => {
    it('explains that opportunity filters apply to both the table totals and comparison', () => {
        const html = renderToStaticMarkup(React.createElement(SearchConsoleReport, { report: { ...report, sort: 'position', order: 'asc', opportunity: true }, onPage() {} }));
        expect(html).toContain('เรียงตามอันดับเฉลี่ย');
        expect(html).toContain('เฉพาะอันดับเฉลี่ย 4–15');
        expect(html).toContain('ยอดสรุปและการเปรียบเทียบใช้ตัวกรองนี้ด้วย');
    });

    it('renders imported-row totals with PT labels and keeps dimension attribution explicit', () => {
        const html = renderToStaticMarkup(React.createElement(SearchConsoleReport, { report, onPage() {} }));
        expect(html).toContain('ชื่อเล่นทดสอบ'); expect(html).toContain('10.00%'); expect(html).toContain('(PT)');
        expect(html).toContain('ผลรวมจากแถวที่นำเข้า'); expect(html).toContain('ไม่ได้ระบุความสัมพันธ์');
    });
    it('escapes source query/URL values instead of rendering uploaded markup', () => {
        const html = renderToStaticMarkup(React.createElement(SearchConsoleReport, { report: { ...report, rows: [{ ...report.rows[0], key: '<script>bad</script>', query: '<script>bad</script>' }] }, onPage() {} }));
        expect(html).not.toContain('<script>bad'); expect(html).toContain('&lt;script&gt;');
    });
    it('shows an empty row, not an average ranking of zero, when no rows match', () => {
        const html = renderToStaticMarkup(React.createElement(SearchConsoleReport, { report: { ...report, rows: [], total: 0, summary: { clicks: 0, impressions: 0, position: 0, ctr: 0 } }, onPage() {} }));
        expect(html).toContain('ยังไม่มีแถวที่ตรง'); expect(html).toContain('—');
    });
    it('shows a no-write preview with normalized scope, individual file totals and a separate confirm action', () => {
        const preview = { scope, kinds: ['queries' as const, 'pages' as const], rowCount: 2, contentHash: 'a'.repeat(64), warnings: ['ข้อมูลตัวอย่าง'], files: [
            { name: 'Queries.csv', kind: 'queries' as const, rows: 1, summary: report.summary },
            { name: 'Pages.csv', kind: 'pages' as const, rows: 1, summary: { ...report.summary, clicks: 30 } },
        ] };
        expect(gscPreviewResponseSchema.safeParse({ success: true, preview }).success).toBe(true);
        expect(gscPreviewResponseSchema.safeParse({ success: true, preview: { ...preview, contentHash: 'bad' } }).success).toBe(false);
        const html = renderToStaticMarkup(React.createElement(SearchConsolePreview, { preview, busy: false, onConfirm() {} }));
        expect(html).toContain('ยังไม่ได้บันทึกข้อมูล'); expect(html).toContain('ยืนยันนำเข้า');
        expect(html).toContain('Queries.csv'); expect(html).toContain('Pages.csv'); expect(html).toContain('ไม่รวมยอดข้ามมิติ');
        expect(html).not.toContain(preview.contentHash);
    });
    it('does not fabricate zero-valued CTR or ranking changes when an impression baseline is missing', () => {
        const data = { ...report, comparison: { id: importOne.id, summary: { clicks: 0, impressions: 0, ctr: 0, position: 0 }, delta: { clicks: null, impressions: null, ctr: null, position: null } } };
        expect(gscReportSchema.safeParse(data).success).toBe(true);
        const html = renderToStaticMarkup(React.createElement(SearchConsoleReport, { report: data, onPage() {} }));
        expect(html).toContain('ไม่มีฐานเปรียบเทียบ'); expect(html).not.toContain('Infinity');
    });
});
