import { describe, expect, test } from 'vitest';
import { analysisNamesDownloadFilename, buildAnalyzedNamesCsv, parseAnalysisNamesQuery, parseAnalysisNamesResult } from './adminAnalysisResults';

describe('analyzed names query and export', () => {
    test('uses page one by default and treats Thai and wildcard text as literal search input', () => {
        expect(parseAnalysisNamesQuery(new URLSearchParams())).toEqual({ search: '', page: 1, exportCsv: false });
        expect(parseAnalysisNamesQuery(new URLSearchParams({ search: '  ณัฐ_%  ', page: '2', format: 'csv' })))
            .toEqual({ search: 'ณัฐ_%', page: 2, exportCsv: true });
    });
    test.each(['0', '-1', '1.5', '1abc', 'Infinity', '2147483648'])('rejects an invalid database page: %s', (page) => {
        expect(parseAnalysisNamesQuery(new URLSearchParams({ page }))).toBeNull();
    });
    test('rejects oversized search text and unknown formats', () => {
        expect(parseAnalysisNamesQuery(new URLSearchParams({ search: 'ก'.repeat(201) }))).toBeNull();
        expect(parseAnalysisNamesQuery(new URLSearchParams({ format: 'html' }))).toBeNull();
    });
    test('whitelists only names and total, rejecting malformed data', () => {
        expect(parseAnalysisNamesResult({ names: ['กานต์'], total: 1, surname: 'private', serviceKey: 'secret' }))
            .toEqual({ names: ['กานต์'], total: 1 });
        for (const value of [null, { names: ['กานต์'], total: 0 }, { names: [1], total: 1 }, { names: [], total: -1 }]) {
            expect(parseAnalysisNamesResult(value)).toBeNull();
        }
    });
    test('exports Thai as one-column CSV with BOM, CRLF, escaping and formula protection', () => {
        const csv = buildAnalyzedNamesCsv(['กานต์', 'ชื่อ,ทดสอบ', 'ชื่อ"ทดสอบ', 'ชื่อ\nใหม่', '=2+2', ' \t@SUM(1)', '+123', '-123']);
        expect(csv).toBe('\uFEFF"ชื่อ"\r\n"กานต์"\r\n"ชื่อ,ทดสอบ"\r\n"ชื่อ""ทดสอบ"\r\n"ชื่อ\nใหม่"\r\n"\'=2+2"\r\n"\' \t@SUM(1)"\r\n"\'+123"\r\n"\'-123"\r\n');
        expect(buildAnalyzedNamesCsv([])).toBe('\uFEFF"ชื่อ"\r\n');
    });
    test('dates filenames in Bangkok time', () => {
        expect(analysisNamesDownloadFilename(new Date('2026-11-04T18:00:00Z'))).toBe('analyzed-names-2026-11-05.csv');
    });
});
