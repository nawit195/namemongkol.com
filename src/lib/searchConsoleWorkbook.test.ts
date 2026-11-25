import { readFileSync } from 'node:fs';
import { strToU8, zipSync } from 'fflate';
import { describe, expect, it, vi } from 'vitest';
vi.mock('server-only', () => ({}));
import { inspectGscWorkbookZip, readGscWorkbook } from './searchConsoleWorkbook';
import { normalizeGscUpload, summarizeGscRows } from './searchConsole';

const escape = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
function workbook(tables: { name: string; data: (string | number)[][] }[]) {
    const files: Record<string, Uint8Array> = {
        '[Content_Types].xml': strToU8('<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="xml" ContentType="application/xml"/></Types>'),
        'xl/workbook.xml': strToU8(`<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${tables.map((table, i) => `<sheet name="${escape(table.name)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join('')}</sheets></workbook>`),
        'xl/_rels/workbook.xml.rels': strToU8(`<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${tables.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join('')}</Relationships>`),
    };
    tables.forEach((table, i) => { files[`xl/worksheets/sheet${i + 1}.xml`] = strToU8(`<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${table.data.map((row, r) => `<row r="${r + 1}">${row.map((value, c) => `<c r="${String.fromCharCode(65 + c)}${r + 1}"${typeof value === 'string' ? ' t="inlineStr"' : ''}>${typeof value === 'string' ? `<is><t>${escape(value)}</t></is>` : `<v>${value}</v>`}</c>`).join('')}</row>`).join('')}</sheetData></worksheet>`); });
    return zipSync(files);
}
const chart = { name: 'แผนผัง', data: [['วันที่', 'การคลิก', 'การแสดงผล', 'CTR', 'ตำแหน่ง'], ['2026-10-01', 10, 100, .1, 4], ['2026-10-02', 20, 200, .1, 6]] };
const filters = { name: 'ตัวกรอง', data: [['ตัวกรอง', 'ค่า'], ['ประเภทการค้นหา', 'เว็บ (แบบข้อความ)'], ['วันที่', '3 เดือนล่าสุด']] };

describe('GSC XLSX adapter', () => {
    it('reads Thai exports with exact chart totals and separates all dimensions', async () => {
        const result = await readGscWorkbook(workbook([chart, filters,
            { name: 'ข้อความค้นหา', data: [['ข้อความค้นหายอดนิยม', 'การคลิก', 'การแสดงผล', 'ตำแหน่ง'], ['ชื่อมงคล', 1, 10, 4]] },
            { name: 'หน้า', data: [['เพจยอดนิยม', 'การคลิก', 'การแสดงผล', 'ตำแหน่ง'], ['https://www.namemongkol.com/', 2, 20, 5]] },
            { name: 'อุปกรณ์', data: [['อุปกรณ์', 'การคลิก'], ['มือถือ', 30]] },
        ]));
        expect([result.from, result.to]).toEqual(['2026-10-01', '2026-10-02']);
        const parsed = normalizeGscUpload({ scope: { property: 'sc-domain:namemongkol.com', searchType: 'web', from: result.from, to: result.to, country: 'all', device: 'all', filters: '' }, files: result.files });
        expect(summarizeGscRows(parsed.rows.filter(row => row.kind === 'daily'))).toEqual({ clicks: 30, impressions: 300, ctr: 10, position: 16 / 3 });
        expect(parsed.kinds).toEqual(['queries', 'pages', 'daily']);
        expect(result.warnings.join(' ')).toContain('อุปกรณ์');
        expect(parsed.rows.some(row => row.kind === 'query-pages')).toBe(false);
    });
    it('rejects image reports, duplicate dimensions, missing dates and invalid metrics', async () => {
        await expect(readGscWorkbook(workbook([chart, { ...filters, data: [['Filter', 'Value'], ['Search type', 'Image']] }]))).rejects.toThrow('Web');
        await expect(readGscWorkbook(workbook([chart, { ...chart, name: 'Chart' }, filters]))).rejects.toThrow('มิติเดียวกัน');
        await expect(readGscWorkbook(workbook([filters]))).rejects.toThrow('Chart');
        await expect(readGscWorkbook(workbook([{ ...chart, data: [chart.data[0], ['2026-10-01', 1.5, 10, 0, 4]] }, filters]))).rejects.toThrow('จำนวนเต็ม');
    });
    it('bounds inflated content and rejects formulas, entities and sparse cell attacks', () => {
        for (const xml of ['<worksheet><f>1+1</f></worksheet>', '<worksheet><f/></worksheet>', '<!DOCTYPE foo><worksheet/>', '<worksheet><row r="99999999"/></worksheet>', "<worksheet><row r = '99999999'/></worksheet>", '<worksheet><c r="ZZ99"/></worksheet>']) {
            const input = zipSync({ '[Content_Types].xml': strToU8('x'), 'xl/workbook.xml': strToU8('x'), 'xl/worksheets/sheet1.xml': strToU8(xml) });
            expect(() => inspectGscWorkbookZip(input)).toThrow();
        }
        expect(() => inspectGscWorkbookZip(zipSync({ bomb: new Uint8Array(6 * 1024 * 1024 + 1) }))).toThrow();
    });
    it.skipIf(!process.env.GSC_WORKBOOK_PATH)('matches the supplied workbook without storing its contents', async () => {
        const result = await readGscWorkbook(readFileSync(process.env.GSC_WORKBOOK_PATH!));
        const rows = normalizeGscUpload({ scope: { property: 'https://www.namemongkol.com/', searchType: 'web', from: result.from, to: result.to, country: 'all', device: 'all', filters: '' }, files: result.files }).rows;
        expect(summarizeGscRows(rows.filter(row => row.kind === 'daily'))).toMatchObject({ clicks: 7373, impressions: 80292 });
        expect(result.sheets).toHaveLength(7);
    });
});
