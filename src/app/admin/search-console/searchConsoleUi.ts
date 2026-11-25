import { z } from 'zod';
import { activityDateIsValid } from '@/lib/memberActivityDates';

export const GSC_FILE_KINDS = ['queries', 'pages', 'daily', 'query-pages'] as const;
export type GscFileKind = typeof GSC_FILE_KINDS[number];
export const GSC_SORTS = ['clicks', 'impressions', 'ctr', 'position', 'dimension'] as const;
export type GscSort = typeof GSC_SORTS[number];
export type GscView = { sort: GscSort; order: 'asc' | 'desc'; opportunity: boolean };
export const sortLabels: Record<GscSort, string> = { clicks: 'คลิก', impressions: 'การแสดงผล', ctr: 'CTR', position: 'อันดับเฉลี่ย', dimension: 'คำค้น / หน้า / วันที่' };
export function defaultGscView(kind: GscFileKind): GscView {
    return { sort: kind === 'daily' ? 'dimension' : 'clicks', order: kind === 'daily' ? 'asc' : 'desc', opportunity: false };
}
export function gscReportParams(query: GscView & { kind: GscFileKind; page: number; q: string; compare: string }) {
    const params = new URLSearchParams({ kind: query.kind, page: String(query.page), q: query.q,
        sort: query.sort, order: query.order, opportunity: query.kind !== 'daily' && query.opportunity ? '1' : '0' });
    if (query.compare) params.set('compare', query.compare);
    return params;
}
export const kindLabels: Record<GscFileKind, string> = {
    queries: 'คำค้นหา', pages: 'หน้าเว็บไซต์', daily: 'รายวัน', 'query-pages': 'คำค้นหาและหน้า',
};
export const MAX_UPLOAD_BYTES = 3 * 1024 * 1024;
const count = z.number().int().nonnegative().safe();
const metric = z.number().finite().nonnegative();
const isoDay = z.string().refine(activityDateIsValid);
export const gscScopeSchema = z.object({
    property: z.enum(['https://www.namemongkol.com/', 'sc-domain:namemongkol.com']),
    searchType: z.literal('web'), from: isoDay, to: isoDay,
    country: z.string().regex(/^(all|[A-Z]{2})$/),
    device: z.enum(['all', 'mobile', 'desktop', 'tablet']), filters: z.string().max(500),
});
export type GscScope = z.infer<typeof gscScopeSchema>;
const kinds = z.array(z.enum(GSC_FILE_KINDS)).min(1).max(4);
export const gscImportSchema = z.object({
    id: z.uuid(), createdAt: z.string().datetime({ offset: true }), scope: gscScopeSchema,
    kinds, rowCount: count,
});
export type GscImport = z.infer<typeof gscImportSchema>;
export function mergeImportHistory(previous: GscImport[], incoming: GscImport[]) {
    return [...new Map([...previous, ...incoming].map(item => [item.id, item])).values()]
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id));
}
export const gscImportListSchema = z.object({ success: z.literal(true), imports: z.array(gscImportSchema).max(50), total: count, page: z.number().int().positive(), pageSize: z.literal(50) });
export const gscImportResultSchema = z.object({ success: z.literal(true), id: z.uuid(), duplicate: z.boolean() });
const summary = z.object({ clicks: count, impressions: count, ctr: metric, position: metric });
export const gscPreviewSchema = z.object({
    scope: gscScopeSchema, kinds, rowCount: count, contentHash: z.string().regex(/^[a-f0-9]{64}$/),
    files: z.array(z.object({ name: z.string(), kind: z.enum(GSC_FILE_KINDS), rows: count, summary })).min(1).max(4),
    warnings: z.array(z.string()),
    review: z.object({
        periods: z.array(z.object({ days: z.number(), currentFrom: isoDay, currentTo: isoDay, previousFrom: isoDay, previousTo: isoDay, currentClicks: count, previousClicks: count, change: z.number().nullable() })),
        pageClicks: count, topTwoClicks: count, topTwoShare: metric.nullable(), queryClicks: count, nonBrandClicks: count,
        opportunities: z.array(z.object({ query: z.string(), clicks: count, impressions: count, ctr: metric, position: metric })),
    }).optional(),
});
export type GscPreview = z.infer<typeof gscPreviewSchema>;
export const gscWorkbookResponseSchema = z.object({ success: z.literal(true), workbook: z.object({
    files: z.array(z.object({ name: z.string(), kind: z.enum(GSC_FILE_KINDS), csv: z.string() })).min(1).max(4),
    from: isoDay, to: isoDay, searchType: z.literal('web'),
    sheets: z.array(z.object({ name: z.string(), kind: z.enum(GSC_FILE_KINDS).nullable(), rows: count })).max(12),
    filters: z.array(z.object({ label: z.string(), value: z.string() })), warnings: z.array(z.string()),
}) });
export type GscWorkbook = z.infer<typeof gscWorkbookResponseSchema>['workbook'];
export const gscPreviewResponseSchema = z.object({ success: z.literal(true), preview: gscPreviewSchema });
export const gscReportSchema = z.object({
    id: z.uuid(), createdAt: z.string().datetime({ offset: true }), scope: gscScopeSchema,
    kinds, rowCount: count, kind: z.enum(GSC_FILE_KINDS), page: z.number().int().positive(),
    sort: z.enum(GSC_SORTS), order: z.enum(['asc', 'desc']), opportunity: z.boolean(),
    pageSize: z.literal(50), total: count,
    rows: z.array(z.object({
        key: z.string(), query: z.string().optional(), path: z.string().optional(), date: isoDay.optional(),
        clicks: count, impressions: count, position: metric, ctr: metric,
    })).max(50),
    summary, warnings: z.array(z.string()),
    comparison: z.object({
        id: z.uuid(), summary,
        delta: z.object({ clicks: z.number().finite().nullable(), impressions: z.number().finite().nullable(), ctr: z.number().finite().nullable(), position: z.number().finite().nullable() }),
    }).nullable(),
}).refine(report => report.kind !== 'daily' || !report.opportunity);
export type GscReport = z.infer<typeof gscReportSchema>;
export const gscReportResponseSchema = z.object({ success: z.literal(true), report: gscReportSchema });

function shiftDate(value: string, amount: number) {
    const date = new Date(`${value}T00:00:00Z`);
    date.setUTCDate(date.getUTCDate() + amount);
    return date.toISOString().slice(0, 10);
}
export function defaultGscScope(now = new Date()): GscScope {
    const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Los_Angeles', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
    const part = (type: string) => parts.find(value => value.type === type)!.value;
    const today = `${part('year')}-${part('month')}-${part('day')}`;
    const to = shiftDate(today, -1);
    return { property: 'https://www.namemongkol.com/', searchType: 'web', from: shiftDate(to, -27), to, country: 'all', device: 'all', filters: '' };
}
export function compatibleComparison(current: GscScope, candidate: GscScope): boolean {
    const key = (scope: GscScope) => JSON.stringify([scope.property, scope.searchType, scope.country, scope.device, scope.filters.normalize('NFC').trim()]);
    const span = (scope: GscScope) => Date.parse(scope.to) - Date.parse(scope.from);
    return key(current) === key(candidate) && span(current) === span(candidate) &&
        (candidate.to < current.from || candidate.from > current.to);
}
export function inferGscFileKind(name: string): GscFileKind | null {
    const value = name.toLowerCase();
    if (/query.?page|page.?query/.test(value)) return 'query-pages';
    if (/quer|คำค้น/.test(value)) return 'queries';
    if (/page|หน้าเว็บ/.test(value)) return 'pages';
    if (/chart|date|แผนภูมิ|รายวัน/.test(value)) return 'daily';
    return null;
}
export function signedPercent(value: number | null) {
    if (value === null) return 'ไม่มีฐานเปรียบเทียบ';
    return `${value > 0 ? '+' : ''}${value.toLocaleString('th-TH', { maximumFractionDigits: 1 })}%`;
}
