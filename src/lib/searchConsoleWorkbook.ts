import 'server-only';
import { Unzip, UnzipInflate } from 'fflate';
import { GSC_MAX_BYTES, GSC_MAX_ROWS, normalizeGscUpload, type GscKind } from './searchConsole';

const sheetKinds: Record<string, GscKind> = { chart: 'daily', แผนผัง: 'daily', queries: 'queries', ข้อความค้นหา: 'queries', คำค้นหา: 'queries', pages: 'pages', หน้า: 'pages' };
const normalize = (value: string) => value.normalize('NFC').trim().toLowerCase();
const csvCell = (value: string) => `"${value.replace(/"/g, '""')}"`;

/** Validate actual inflated bytes, not just the attacker-controlled ZIP size fields. */
export function inspectGscWorkbookZip(input: Uint8Array) {
    if (!input.length || input.length > GSC_MAX_BYTES) throw new Error('ไฟล์ XLSX ต้องไม่เกิน 3 MiB');
    let total = 0, entries = 0;
    const names = new Set<string>();
    const zip = new Unzip(file => {
        if (++entries > 128 || names.has(file.name) || /(?:^|\/)\.\.(?:\/|$)|^\/|\\/.test(file.name)) throw new Error('โครงสร้าง XLSX ไม่ถูกต้อง');
        names.add(file.name);
        if (/vbaProject|externalLinks|\.bin$/i.test(file.name)) throw new Error('รองรับเฉพาะ XLSX รายงาน GSC ที่ไม่มีแมโครหรือลิงก์ภายนอก');
        let size = 0;
        const chunks: Uint8Array[] = [];
        file.ondata = (error, data, final) => {
            if (error) throw new Error('อ่านข้อมูล ZIP ใน XLSX ไม่สำเร็จ');
            size += data.length; total += data.length;
            if (size > 6 * 1024 * 1024 || total > 16 * 1024 * 1024) throw new Error('ข้อมูลเมื่อเปิด XLSX มีขนาดใหญ่เกินไป กรุณาแบ่งรายงาน');
            chunks.push(data);
            if (final && file.name.endsWith('.xml')) {
                const xml = Buffer.concat(chunks).toString('utf8');
                if (/<!DOCTYPE|<!ENTITY|<(?:[\w.-]+:)?f(?:\s|\/?>)/i.test(xml)) throw new Error('XLSX ต้องเป็นข้อมูลส่งออกโดยตรงและไม่มีสูตร');
                if (/^xl\/worksheets\//.test(file.name)) {
                    for (const match of xml.matchAll(/<(?:[\w.-]+:)?(?:c|row)\b[^>]*\br\s*=\s*(["'])(.*?)\1/gs)) {
                        const ref = /^(?:([A-Z]+))?(\d+)$/.exec(match[2]);
                        if (!ref || Number(ref[2]) > GSC_MAX_ROWS + 1 || (ref[1] && (ref[1].length > 1 || ref[1] > 'P'))) throw new Error('ชีตมีแถวหรือคอลัมน์เกินขอบเขตรายงาน GSC');
                    }
                }
            }
        };
        file.start();
    });
    zip.register(UnzipInflate);
    // Small compressed chunks bound each inflation callback, even for a ZIP bomb.
    for (let index = 0; index < input.length; index += 128) zip.push(input.subarray(index, index + 128), index + 128 >= input.length);
    if (!names.has('[Content_Types].xml') || !names.has('xl/workbook.xml')) throw new Error('ไฟล์นี้ไม่ใช่ XLSX');
}

export async function readGscWorkbook(input: Uint8Array) {
    inspectGscWorkbookZip(input);
    const { default: readXlsxFile } = await import('read-excel-file/node');
    // Preserve numeric text until the existing strict count validator has checked it.
    const sheets = await readXlsxFile(Buffer.from(input), { parseNumber: value => value });
    if (sheets.length > 12) throw new Error('XLSX มีจำนวนชีตเกินขอบเขตรายงาน GSC');
    const files: { name: string; kind: GscKind; csv: string }[] = [];
    const inventory: { name: string; kind: GscKind | null; rows: number }[] = [];
    const filters: { label: string; value: string }[] = [];
    const days: string[] = [];
    for (const sheet of sheets) {
        const data = sheet.data.filter(row => row.some(cell => cell !== null && cell !== ''));
        const kind = sheetKinds[normalize(sheet.sheet)] ?? null;
        inventory.push({ name: sheet.sheet, kind, rows: Math.max(0, data.length - 1) });
        if (['filters', 'ตัวกรอง'].includes(normalize(sheet.sheet))) {
            for (const row of data.slice(1)) filters.push({ label: String(row[0] ?? ''), value: String(row[1] ?? '') });
        }
        if (!kind) continue;
        if (files.some(file => file.kind === kind)) throw new Error('มีชีตข้อมูลมิติเดียวกันมากกว่าหนึ่งชีต');
        const rows = data.map(row => row.map(cell => cell instanceof Date ? cell.toISOString().slice(0, 10) : cell === null ? '' : String(cell)));
        if (kind === 'daily') {
            const dateColumn = rows[0]?.findIndex(value => ['date', 'วันที่'].includes(normalize(value))) ?? -1;
            if (dateColumn < 0) throw new Error('ชีต Chart ต้องมีคอลัมน์วันที่รายวัน');
            days.push(...rows.slice(1).map(row => row[dateColumn]));
        }
        files.push({ name: `${sheet.sheet}.csv`, kind, csv: rows.map(row => row.map(csvCell).join(',')).join('\n') });
    }
    const searchType = filters.find(filter => ['search type', 'ประเภทการค้นหา'].includes(normalize(filter.label)))?.value;
    if (!searchType || !['web', 'เว็บ', 'เว็บ (แบบข้อความ)'].includes(normalize(searchType))) throw new Error('เลือกไฟล์ผลการค้นหาประเภท Web เท่านั้น รายงาน Images ต้องแยกจาก Web');
    if (!days.length || days.some(day => !/^\d{4}-\d{2}-\d{2}$/.test(day))) throw new Error('ต้องมีชีต Chart รายวันเพื่อระบุช่วงวันที่ (PT)');
    days.sort();
    const from = days[0], to = days[days.length - 1];
    // Same validation and row limits as CSV; separate sheets never form query/page pairs.
    normalizeGscUpload({ scope: { property: 'sc-domain:namemongkol.com', searchType: 'web', from, to, country: 'all', device: 'all', filters: '' }, files });
    return { files, from, to, searchType: 'web' as const, sheets: inventory, filters,
        warnings: ['ตรวจพร็อพเพอร์ตี ประเทศ อุปกรณ์ และตัวกรองให้ตรงกับไฟล์ก่อนยืนยัน',
            ...inventory.filter(sheet => !sheet.kind && !['filters', 'ตัวกรอง'].includes(normalize(sheet.name))).map(sheet => `ชีต ${sheet.name}: ${sheet.rows} แถว แสดงในรายการชีตเท่านั้น ไม่นำไปรวมกับยอดคำค้น หน้า หรือรายวัน`)] };
}
