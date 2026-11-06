import type { Grade } from '@/utils/gradeResult';

export const ANALYSIS_NAMES_PAGE_SIZE = 50;
export const ANALYSIS_NAMES_MAX_SEARCH_LENGTH = 200;

export type AnalysisNamesResult = { names: string[]; total: number };
export type AnalysisNameRow = { name: string; nameScore: number; grade: Grade };
export type AnalysisNamesTableResult = { rows: AnalysisNameRow[]; total: number };
export type AnalysisNamesResponse = AnalysisNamesResult & AnalysisNamesTableResult & {
    success: true;
    page: number;
    pageSize: number;
    totalPages: number;
};

export function parseAnalysisNamesQuery(params: URLSearchParams) {
    const search = (params.get('search') ?? '').trim();
    const pageText = params.get('page') ?? '1';
    const page = Number(pageText);
    const format = params.get('format') ?? 'json';
    if (search.length > ANALYSIS_NAMES_MAX_SEARCH_LENGTH
        || !/^[1-9]\d*$/.test(pageText) || !Number.isSafeInteger(page) || page > 2_147_483_647
        || (format !== 'json' && format !== 'csv')) return null;
    return { search, page, exportCsv: format === 'csv' };
}

export function parseAnalysisNamesResult(value: unknown): AnalysisNamesResult | null {
    if (!value || typeof value !== 'object') return null;
    const result = value as Record<string, unknown>;
    if (!Array.isArray(result.names) || !result.names.every((name) => typeof name === 'string')
        || typeof result.total !== 'number' || !Number.isSafeInteger(result.total)
        || result.total < result.names.length) return null;
    return { names: result.names, total: result.total };
}

export function parseAnalysisNamesTableResult(value: unknown): AnalysisNamesTableResult | null {
    const result = parseAnalysisNamesResult(value);
    if (!result || !value || typeof value !== 'object' || !('rows' in value) || !Array.isArray(value.rows)
        || value.rows.length !== result.names.length) return null;
    const rows: AnalysisNameRow[] = [];
    for (const [index, item] of value.rows.entries()) {
        if (!item || typeof item !== 'object' || item.name !== result.names[index]
            || typeof item.nameScore !== 'number' || !Number.isSafeInteger(item.nameScore) || item.nameScore < 0
            || !['A+', 'A', 'B', 'C'].includes(item.grade)) return null;
        rows.push({ name: item.name, nameScore: item.nameScore, grade: item.grade });
    }
    return { rows, total: result.total };
}

export function buildAnalyzedNamesCsv(records: readonly AnalysisNameRow[]): string {
    const cell = (value: string) => {
        const safeValue = /^[\s\uFEFF]*[=+\-@]/u.test(value) ? `'${value}` : value;
        return `"${safeValue.replace(/"/g, '""')}"`;
    };
    const rows = records.map((record) => [record.name, String(record.nameScore), record.grade].map(cell).join(','));
    return `\uFEFF${[['ชื่อ', 'ผลรวมชื่อ', 'เกรด'].map(cell).join(','), ...rows].join('\r\n')}\r\n`;
}

export function analysisNamesDownloadFilename(date = new Date()): string {
    const stamp = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit',
    }).format(date);
    return `analyzed-names-${stamp}.csv`;
}
