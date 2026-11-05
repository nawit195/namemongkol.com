export const ANALYSIS_NAMES_PAGE_SIZE = 50;
export const ANALYSIS_NAMES_MAX_SEARCH_LENGTH = 200;

export type AnalysisNamesResult = { names: string[]; total: number };
export type AnalysisNamesResponse = AnalysisNamesResult & {
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

export function buildAnalyzedNamesCsv(names: readonly string[]): string {
    const cell = (value: string) => {
        const safeValue = /^[\s\uFEFF]*[=+\-@]/u.test(value) ? `'${value}` : value;
        return `"${safeValue.replace(/"/g, '""')}"`;
    };
    return `\uFEFF${['ชื่อ', ...names].map(cell).join('\r\n')}\r\n`;
}

export function analysisNamesDownloadFilename(date = new Date()): string {
    const stamp = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit',
    }).format(date);
    return `analyzed-names-${stamp}.csv`;
}
