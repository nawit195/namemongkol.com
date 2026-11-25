import { createHash } from 'node:crypto';
import { z } from 'zod';
import { activityDateIsValid } from './memberActivityDates';

export const GSC_MAX_BYTES = 3 * 1024 * 1024;
export const GSC_MAX_ROWS = 20_000;
export const gscKinds = ['queries', 'pages', 'daily', 'query-pages'] as const;
export type GscKind = typeof gscKinds[number];
export const gscSorts = ['clicks', 'impressions', 'ctr', 'position', 'dimension'] as const;
export const gscOrders = ['asc', 'desc'] as const;
export type GscSort = typeof gscSorts[number];
export type GscOrder = typeof gscOrders[number];
export type GscReportOptions = { sort: GscSort; order: GscOrder; opportunity: boolean };
const date = z.string().refine(activityDateIsValid, 'วันที่ต้องเป็น YYYY-MM-DD');
export function gscPacificToday(now = new Date()) {
    const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Los_Angeles', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
    const get = (type: string) => parts.find(part => part.type === type)!.value;
    return `${get('year')}-${get('month')}-${get('day')}`;
}
export const gscScopeSchema = z.object({
    property: z.enum(['https://www.namemongkol.com/', 'sc-domain:namemongkol.com']),
    searchType: z.literal('web'), from: date, to: date,
    country: z.string().regex(/^(all|[A-Z]{2})$/),
    device: z.enum(['all', 'mobile', 'desktop', 'tablet']),
    filters: z.string().max(500).transform(value => value.normalize('NFC').trim()),
}).strict().refine(scope => scope.from <= scope.to && scope.to <= gscPacificToday(), 'ช่วงวันที่ต้องไม่กลับด้านหรือเกินวันนี้ตาม Pacific Time');
export type GscScope = z.infer<typeof gscScopeSchema>;
export const gscUploadSchema = z.object({ scope: gscScopeSchema, files: z.array(z.object({
    name: z.string().min(1).max(150), kind: z.enum(gscKinds), csv: z.string().min(1),
}).strict()).min(1).max(4) }).strict();

export type GscRow = { kind: GscKind; key: string; query?: string; path?: string; date?: string; clicks: number; impressions: number; position: number; ctr: number };
export type GscSummary = { clicks: number; impressions: number; ctr: number; position: number };
export type GscImport = { id: string; createdAt: string; scope: GscScope; kinds: GscKind[]; rowCount: number };
export type GscReport = GscImport & GscReportOptions & { kind: GscKind; page: number; pageSize: 50; total: number; rows: GscRow[]; summary: GscSummary; warnings: string[];
    comparison: null | { id: string; summary: GscSummary; delta: { clicks: number | null; impressions: number | null; ctr: number | null; position: number | null } };
};

/** RFC 4180 fields, including quoted newlines. Reject malformed quoting instead of dropping data. */
export function parseGscCsv(csv: string): string[][] {
    const text = csv.replace(/^\uFEFF/, '');
    const rows: string[][] = []; let row: string[] = [], field = '', quoted = false, closed = false;
    function finishField() { row.push(field.trim()); field = ''; closed = false; }
    function finishRow() { finishField(); if (row.some(value => value !== '')) rows.push(row); row = []; }
    for (let index = 0; index < text.length; index++) {
        const char = text[index];
        if (quoted) {
            if (char === '"') { if (text[index + 1] === '"') { field += '"'; index++; } else { quoted = false; closed = true; } }
            else field += char;
        } else if (char === ',') finishField();
        else if (char === '\n' || char === '\r') { if (char === '\r' && text[index + 1] === '\n') index++; finishRow(); }
        else if (char === '"') { if (field !== '' || closed) throw new Error('รูปแบบเครื่องหมายคำพูด CSV ไม่ถูกต้อง'); quoted = true; }
        else if (closed) { if (!/\s/.test(char)) throw new Error('พบข้อความหลังปิดเครื่องหมายคำพูด CSV'); }
        else field += char;
        if (rows.length > GSC_MAX_ROWS + 1) throw new Error('แต่ละชุดนำเข้าได้ไม่เกิน 20,000 แถว');
    }
    if (quoted) throw new Error('CSV มีเครื่องหมายคำพูดที่ยังไม่ปิด');
    if (row.length || field.length || closed) finishRow();
    if (rows.length < 2) throw new Error('CSV ต้องมีหัวตารางและข้อมูลอย่างน้อยหนึ่งแถว');
    const width = rows[0].length;
    if (rows.some(item => item.length !== width)) throw new Error('จำนวนคอลัมน์ CSV ไม่ตรงกัน');
    return rows;
}
const header = (value: string) => value.toLowerCase().normalize('NFC').replace(/[\s_\-./()]/g, '');
const aliases = {
    query: ['query', 'queries', 'topqueries', 'searchquery', 'คำค้นหา', 'คำค้นหายอดนิยม'],
    path: ['page', 'pages', 'toppages', 'url', 'landingpage', 'หน้า', 'หน้าเว็บ', 'หน้าเว็บยอดนิยม'],
    date: ['date', 'วันที่'], clicks: ['clicks', 'click', 'คลิก', 'จำนวนคลิก'],
    impressions: ['impressions', 'impression', 'การแสดงผล', 'จำนวนการแสดงผล'],
    ctr: ['ctr', 'clickthroughrate', 'อัตราการคลิกผ่าน'],
    position: ['position', 'avgposition', 'averageposition', 'อันดับ', 'อันดับเฉลี่ย', 'ตำแหน่ง', 'ตำแหน่งเฉลี่ย'],
} as const;
function metric(value: string, integer: boolean, row: number, label: string) {
    if (value.includes(',') && !/^\d{1,3}(?:,\d{3})+(?:\.\d+)?$/.test(value.trim())) throw new Error(`แถว ${row}: รูปแบบหลักพันของ ${label} ไม่ถูกต้อง`);
    const raw = value.replace(/,/g, '').trim();
    if (!/^\d+(?:\.\d+)?$/.test(raw)) throw new Error(`แถว ${row}: ${label} ต้องเป็นตัวเลขที่ไม่ติดลบ`);
    // Check before Number() can round a nonzero fractional tail to an integer.
    if (integer && !/^\d+(?:\.0+)?$/.test(raw)) throw new Error(`แถว ${row}: ${label} ต้องเป็นจำนวนเต็ม`);
    const number = Number(raw);
    if (!Number.isFinite(number) || number > Number.MAX_SAFE_INTEGER || (integer && !Number.isSafeInteger(number))) throw new Error(`แถว ${row}: ${label} ไม่ถูกต้อง`);
    return number;
}
export function normalizeGscPage(value: string) {
    try {
        if (!/^https?:\/\//i.test(value) && (!value.startsWith('/') || value.startsWith('//'))) throw Error();
        const url = new URL(value, 'https://www.namemongkol.com');
        if (!['http:', 'https:'].includes(url.protocol) || !['namemongkol.com', 'www.namemongkol.com'].includes(url.hostname) || url.username || url.password || url.port || value.length > 2000) throw Error();
        url.hash = '';
        return url.href;
    } catch { throw new Error('URL ต้องเป็นหน้าของ namemongkol.com เท่านั้น'); }
}
export function gscScopeKey(scope: GscScope) {
    const { property, searchType, country, device, filters } = scope;
    return createHash('sha256').update(JSON.stringify({ property, searchType, country, device, filters })).digest('hex');
}
export function compatibleGscPeriods(a: GscScope, b: GscScope) {
    return gscScopeKey(a) === gscScopeKey(b) && Date.parse(a.to) - Date.parse(a.from) === Date.parse(b.to) - Date.parse(b.from) && (a.to < b.from || b.to < a.from);
}
export function summarizeGscRows(rows: readonly GscRow[]): GscSummary {
    const clicks = rows.reduce((sum, row) => sum + row.clicks, 0), impressions = rows.reduce((sum, row) => sum + row.impressions, 0);
    return { clicks, impressions, ctr: impressions ? clicks / impressions * 100 : 0,
        position: impressions ? rows.reduce((sum, row) => sum + row.position * row.impressions, 0) / impressions : 0 };
}
export function normalizeGscUpload(input: unknown) {
    const parsed = gscUploadSchema.safeParse(input);
    if (!parsed.success) throw new Error('ข้อมูลไฟล์ ช่วงวันที่ หรือขอบเขตรายงานไม่ถูกต้อง');
    const { scope, files } = parsed.data;
    if (new Set(files.map(file => file.kind)).size !== files.length) throw new Error('เลือกไฟล์ได้หนึ่งไฟล์ต่อชนิดข้อมูล');
    if (Buffer.byteLength(JSON.stringify(parsed.data), 'utf8') > GSC_MAX_BYTES) throw new Error('ชุดนำเข้าต้องไม่เกิน 3 MB');
    const rows: GscRow[] = [], identities = new Set<string>();
    for (const file of files) {
        const records = parseGscCsv(file.csv), names = records[0].map(header);
        const semanticHeaders = names.map(name => Object.entries(aliases).find(([, values]) => values.some(alias => header(alias) === name))?.[0]);
        if (semanticHeaders.some(name => !name) || new Set(semanticHeaders).size !== names.length) throw new Error(`${file.name}: มีคอลัมน์ที่ไม่รองรับหรือซ้ำกัน กรุณาส่งออกตารางมาตรฐานในมิติที่เลือก`);
        const indexes = Object.fromEntries(Object.entries(aliases).map(([key, values]) => [key, names.findIndex(name => values.some(alias => header(alias) === name))])) as Record<keyof typeof aliases, number>;
        const required: (keyof typeof aliases)[] = ['clicks', 'impressions', 'position', ...(file.kind === 'query-pages' ? ['query', 'path'] as const : [file.kind === 'queries' ? 'query' : file.kind === 'pages' ? 'path' : 'date'] as const)];
        if (required.some(key => indexes[key] < 0)) throw new Error(`${file.name}: หัวตารางไม่ตรงกับชนิดข้อมูลที่เลือก (ต้องมี ${required.join(', ')})`);
        // Refuse silently discarding a dimension (e.g. treating joint rows as a query-only file).
        if ((file.kind === 'queries' && indexes.path >= 0) || (file.kind === 'pages' && indexes.query >= 0) || (file.kind !== 'daily' && indexes.date >= 0) || (file.kind === 'daily' && (indexes.query >= 0 || indexes.path >= 0))) throw new Error(`${file.name}: มีมิติข้อมูลเพิ่ม กรุณาเลือกชนิดไฟล์ให้ถูกต้อง`);
        for (const [offset, record] of records.slice(1).entries()) {
            const rowNumber = offset + 2;
            const query = file.kind === 'queries' || file.kind === 'query-pages' ? record[indexes.query].normalize('NFC').trim() : undefined;
            const page = file.kind === 'pages' || file.kind === 'query-pages' ? normalizeGscPage(record[indexes.path]) : undefined;
            if (page && scope.property !== 'sc-domain:namemongkol.com' && !page.startsWith(scope.property)) throw new Error(`${file.name} แถว ${rowNumber}: URL ไม่ตรงกับ property ที่เลือก`);
            const day = file.kind === 'daily' ? record[indexes.date] : undefined;
            if (query !== undefined && (!query || query.length > 1000)) throw new Error(`${file.name} แถว ${rowNumber}: คำค้นว่างหรือยาวเกินไป`);
            if (day !== undefined && (!activityDateIsValid(day) || day < scope.from || day > scope.to)) throw new Error(`${file.name} แถว ${rowNumber}: วันที่ต้องเป็น YYYY-MM-DD และอยู่ในช่วงรายงาน (PT)`);
            const key = file.kind === 'query-pages' ? JSON.stringify([query, page]) : query ?? page ?? day!;
            if (identities.has(`${file.kind}:${key}`)) throw new Error(`${file.name} แถว ${rowNumber}: มีรายการซ้ำในมิติเดียวกัน`);
            identities.add(`${file.kind}:${key}`);
            const clicks = metric(record[indexes.clicks], true, rowNumber, 'clicks'), impressions = metric(record[indexes.impressions], true, rowNumber, 'impressions');
            const position = metric(record[indexes.position], false, rowNumber, 'position');
            if (impressions > 0 && position < 1) throw new Error(`${file.name} แถว ${rowNumber}: position ต้องไม่น้อยกว่า 1 เมื่อมี impressions`);
            rows.push({ kind: file.kind, key, ...(query !== undefined ? { query } : {}), ...(page ? { path: page } : {}), ...(day ? { date: day } : {}), clicks, impressions,
                position, ctr: impressions ? clicks / impressions * 100 : 0 });
            if (rows.length > GSC_MAX_ROWS) throw new Error('ชุดนำเข้าได้ไม่เกิน 20,000 แถว');
        }
    }
    const compareText = (a: string, b: string) => a < b ? -1 : a > b ? 1 : 0;
    rows.sort((a, b) => compareText(a.kind, b.kind) || compareText(a.key, b.key));
    const kinds = gscKinds.filter(kind => files.some(file => file.kind === kind));
    for (const kind of kinds) {
        const bucket = rows.filter(row => row.kind === kind);
        for (const key of ['clicks', 'impressions'] as const) {
            if (bucket.reduce((sum, row) => sum + BigInt(row[key]), 0n) > BigInt(Number.MAX_SAFE_INTEGER)) throw new Error('ผลรวมตัวเลขเกินช่วงที่ระบบรองรับ');
        }
    }
    const scopeKey = gscScopeKey(scope);
    const contentHash = createHash('sha256').update(JSON.stringify({ scope, kinds, rows })).digest('hex');
    return { scope, scopeKey, contentHash, kinds, rows: rows.map(row => ({ ...row, identityHash: createHash('sha256').update(`${row.kind}:${row.key}`).digest('hex') })) };
}

export function gscCoverageWarnings(kind: GscKind, count: number) {
    return ['วันที่ของรายงานนี้เป็น Pacific Time (PT) ไม่ใช่ยอดผู้เข้าชมรายวันเวลาไทย',
        kind === 'daily' ? 'ยอดจากไฟล์รายวันเป็นข้อมูล Chart ที่นำเข้า' : 'ยอดสรุปคำนวณจากแถวที่นำเข้า อาจไม่เท่ากับยอดรวมทั้งหมดใน Search Console',
        ...(count >= 1000 ? ['ไฟล์อาจเป็นข้อมูลตัวอย่างที่ Google จำกัดไว้ 1,000 แถว ไม่ยืนยันว่าครบทุกคำค้นหรือทุกหน้า'] : []),
        ...(kind !== 'query-pages' ? ['ข้อมูลนี้ไม่ระบุความสัมพันธ์ระหว่างคำค้นกับหน้า จึงไม่ใช้สรุปว่าหน้าใดแข่งขันกันในคำค้นเดียวกัน'] : [])];
}
