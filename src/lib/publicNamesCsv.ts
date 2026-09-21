import { thaksaConfig } from '@/data/thaksa';
import type { PublicNameRecord } from '@/lib/publicNames';

const CSV_HEADERS = ['ชื่อมงคล', 'คำอ่าน', 'ความหมาย', 'วัน', 'ผลรวมเลขศาสตร์'] as const;
const SPREADSHEET_FORMULA_PREFIX = /^[\t\r\n ]*[=+\-@]/;

function protectSpreadsheetCell(value: string): string {
    return SPREADSHEET_FORMULA_PREFIX.test(value) ? `'${value}` : value;
}

function csvCell(value: string | number): string {
    const safeValue = protectSpreadsheetCell(String(value));
    return `"${safeValue.replace(/"/g, '""')}"`;
}

export function getPublicNameDisplayMeaning(meaning?: string): string {
    if (!meaning) return '';
    if (meaning.includes('=')) return meaning.split('=').pop()?.trim() ?? '';
    return meaning.trim();
}

export function buildPublicNamesCsv(records: readonly PublicNameRecord[]): string {
    const rows = records.map((record) => {
        const pronunciation = [record.pronunciation, ...(record.pronunciationVariants ?? [])]
            .filter((value, index, values): value is string => Boolean(value) && values.indexOf(value) === index)
            .join(' / ');
        const days = record.suitableDays.map((day) => thaksaConfig[day].name).join(', ');

        return [
            record.name,
            pronunciation,
            getPublicNameDisplayMeaning(record.meaning),
            days,
            record.numerology,
        ].map(csvCell).join(',');
    });

    return `\uFEFF${[CSV_HEADERS.map(csvCell).join(','), ...rows].join('\r\n')}\r\n`;
}
