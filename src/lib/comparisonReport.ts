import { z } from 'zod';
import { compareNames, sortComparisons, validateComparison, type NameComparison } from './nameComparison';

export const COMPARISON_REPORT_COST = 5;
export const COMPARISON_REPORT_PAGE_SIZE = 20;
export const comparisonInputSchema = z.object({
    names: z.array(z.string().max(100)).min(2).max(5),
    surname: z.string().max(100).default(''),
    day: z.string().max(30),
}).transform(input => ({
    names: input.names.map(name => name.normalize('NFC').trim()),
    surname: input.surname.normalize('NFC').trim(), day: input.day,
})).refine(input => validateComparison(input.names, input.surname, input.day).valid, 'ข้อมูลเปรียบเทียบไม่ถูกต้อง');
export type ComparisonInput = z.infer<typeof comparisonInputSchema>;

// Sorting names is only for identity. The snapshot preserves the purchased display order.
export function comparisonIdentity(input: ComparisonInput): string {
    const normalized = comparisonInputSchema.parse(input);
    return JSON.stringify({ names: normalized.names.map(name => name.toLowerCase()).sort(), surname: normalized.surname.toLowerCase(), day: normalized.day });
}

export function buildComparisonSnapshot(input: ComparisonInput) {
    const normalized = comparisonInputSchema.parse(input);
    const rows = compareNames(normalized.names, normalized.surname, normalized.day);
    const topGrade = sortComparisons(rows, 'grade')[0].grade;
    const highestGradeNames = rows.filter(row => row.grade === topGrade).map(row => row.name);
    const noKaliNames = rows.filter(row => !row.thaksa?.hasKali).map(row => row.name);
    const bothNames = highestGradeNames.filter(name => noKaliNames.includes(name));
    return {
        formulaVersion: 'comparison-v1', summaryVersion: 'comparison-summary-v1', input: normalized, rows,
        summary: {
            topGrade, highestGradeNames, noKaliNames, bothNames,
            allGradeC: rows.every(row => row.grade === 'C'),
            surnameWarning: rows[0].thaksa?.surnameHasKali
                ? `พบกาลกิณีในนามสกุล: ${rows[0].thaksa.surnameKaliChars?.join(' ')}` : null,
            notes: rows.map(row => ({
                name: row.name,
                text: describeComparisonRow(row),
            })),
            disclaimer: 'เกรดเลขศาสตร์และกาลกิณีเป็นคนละเกณฑ์ ผลนี้เป็นข้อมูลตามศาสตร์ความเชื่อเพื่อประกอบการพิจารณา ไม่รับรองผลต่อชีวิต',
        },
    };
}

function describeComparisonRow(row: NameComparison) {
    const pairs = `คู่เลขดี ${row.pairCounts.good} คู่ กลาง ${row.pairCounts.neutral} คู่ เสีย ${row.pairCounts.bad} คู่`;
    const grade = row.grade === 'C' ? 'เกรด C เพราะพบคู่เลขเสีย แม้ผลรวมอาจเป็นเลขมงคล'
        : row.grade === 'B' ? 'เกรด B เพราะผลรวมไม่อยู่ในกลุ่มเลขมงคลของระบบ และไม่พบคู่เลขเสีย'
            : row.grade === 'A' ? 'เกรด A ผลรวมอยู่ในกลุ่มเลขมงคล ไม่พบคู่เลขเสีย แต่มีคู่เลขกลาง'
                : 'เกรด A+ ผลรวมอยู่ในกลุ่มเลขมงคลและไม่พบคู่เลขเสียหรือคู่เลขกลาง';
    const kali = row.thaksa?.hasKali ? `พบกาลกิณีในชื่อ: ${row.thaksa.kaliChars.join(' ')}` : 'ไม่พบกาลกิณีในชื่อจริงตามวันเกิดที่ระบุ';
    return `${grade} · ${pairs} · ${kali}`;
}

export type ComparisonSnapshot = ReturnType<typeof buildComparisonSnapshot>;
export type ComparisonReport = { id: string; created_at: string; credits_spent: number; snapshot: ComparisonSnapshot };
export type ComparisonReportListItem = { id: string; created_at: string; credits_spent: number; input: ComparisonInput };

export function comparisonReportCsv(snapshot: ComparisonSnapshot): string {
    const cell = (value: string) => `"${(/^[\s\uFEFF]*[=+\-@]/u.test(value) ? `'${value}` : value).replace(/"/g, '""')}"`;
    const yesNo = (value: boolean) => value ? 'ใช่' : 'ไม่ใช่';
    const pairs = (items: NameComparison['namePairs']) => items.map(pair => `${pair.pair} (${pair.grade}) ${pair.title}: ${pair.description}`).join(' | ');
    const rows = snapshot.rows.map((row, index) => [row.name, row.surname, row.day, String(row.nameScore), String(row.surnameScore), String(row.totalScore), row.grade,
        String(row.pairCounts.good), String(row.pairCounts.neutral), String(row.pairCounts.bad), pairs(row.namePairs), pairs(row.surnamePairs),
        row.thaksa?.kaliChars.join(' ') || 'ไม่พบ', row.surname ? row.thaksa?.surnameKaliChars?.join(' ') || 'ไม่พบ' : 'ไม่ได้ระบุ',
        String(row.ayatana.score), row.ayatana.title, row.ayatana.desc,
        yesNo(snapshot.summary.highestGradeNames.includes(row.name)), yesNo(snapshot.summary.noKaliNames.includes(row.name)), yesNo(snapshot.summary.bothNames.includes(row.name)),
        snapshot.summary.notes[index].text, snapshot.summary.surnameWarning ?? '', snapshot.summary.disclaimer, snapshot.formulaVersion, snapshot.summaryVersion]);
    return '\uFEFF' + [['ชื่อ', 'นามสกุล', 'วันเกิด', 'ผลรวมชื่อ', 'ผลรวมนามสกุล', 'ผลรวมทั้งหมด', 'เกรด', 'คู่เลขดี', 'คู่เลขกลาง', 'คู่เลขเสีย', 'คู่เลขในชื่อ', 'คู่เลขในนามสกุล',
        'กาลกิณีในชื่อ', 'กาลกิณีในนามสกุล', 'อายตนะ 6', 'หัวข้ออายตนะ', 'คำอธิบายอายตนะ', 'เกรดสูงสุดในชุด', 'ไม่มีกาลกิณีในชื่อจริง', 'อยู่ในทั้งสองกลุ่ม', 'สรุป', 'ข้อควรพิจารณานามสกุล', 'หมายเหตุ', 'สูตร', 'เวอร์ชันสรุป'], ...rows].map(row => row.map(cell).join(',')).join('\r\n') + '\r\n';
}
