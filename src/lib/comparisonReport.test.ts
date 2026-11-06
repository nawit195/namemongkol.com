import { describe, expect, test } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { buildComparisonSnapshot, comparisonIdentity, comparisonInputSchema, comparisonReportCsv } from './comparisonReport';
import { reportFingerprint } from './comparisonReportServer';
import { compareNames } from './nameComparison';
import { ComparisonReportContent } from '@/app/compare-names/ComparisonReportContent';

const input = { names: ['ปัญญา', 'ศิริ', 'ณัฐ', 'กานต์'], surname: '', day: 'monday' };
describe('comparison report snapshots', () => {
    test('uses exactly the free comparison calculations and preserves all four grades', () => {
        const snapshot = buildComparisonSnapshot(input);
        expect(snapshot.rows).toEqual(compareNames(input.names, '', 'monday'));
        expect(snapshot.rows.map(row => row.grade)).toEqual(['A+', 'A', 'B', 'C']);
        expect(snapshot.summary.topGrade).toBe('A+');
        expect(snapshot.summary.highestGradeNames).toEqual(['ปัญญา']);
        expect(snapshot.summary.notes[3].text).toContain('พบคู่เลขเสีย');
        expect(snapshot.summary.notes[0].text).toContain('คู่เลขดี');
    });
    test('identifies a set independently of input order, surrounding whitespace and English case', () => {
        const first = { names: [' Alice ', 'Anna'], surname: ' Smith ', day: 'friday' };
        const second = { names: ['ANNA', 'alice'], surname: 'SMITH', day: 'friday' };
        expect(comparisonIdentity(first)).toBe(comparisonIdentity(second));
        expect(reportFingerprint(first)).toBe(reportFingerprint(second));
        for (const changed of [{ ...first, names: ['Alice', 'Mary'] }, { ...first, day: 'sunday' }, { ...first, surname: '' }, { ...first, names: ['Alice', 'Anna', 'Mary'] }]) {
            expect(reportFingerprint(changed)).not.toBe(reportFingerprint(first));
        }
        expect(buildComparisonSnapshot(first).rows[0].name).toBe('Alice');
    });
    test('rejects invalid names, duplicates and forged values while normalizing valid inputs', () => {
        for (const names of [['ชื่อเดียว'], ['Alice', 'ALICE'], ['ชื่อ!', 'ศิริ'], ['กานต์', ''], Array(6).fill('ปัญญา')]) {
            expect(comparisonInputSchema.safeParse({ ...input, names }).success).toBe(false);
        }
        const parsed = comparisonInputSchema.parse({ ...input, cost: 0, user_id: 'another', snapshot: { grade: 'A+' } });
        expect(parsed).toEqual(input);
    });
    test('supports five distinct names and a surname at the full 100-character limit', () => {
        const snapshot = buildComparisonSnapshot({ names: ['จ','ค','ท','ม','น'].map(last => 'ก'.repeat(99) + last), surname: 'ข'.repeat(100), day: 'monday' });
        expect(snapshot.rows).toHaveLength(5);
        expect(Buffer.byteLength(JSON.stringify(snapshot))).toBeGreaterThan(250000);
        expect(Buffer.byteLength(JSON.stringify(snapshot))).toBeLessThan(2000000);
    });
    test('keeps tied grades and conflicting thaksa groups separate, and warns when all grades are C', () => {
        const snapshot = buildComparisonSnapshot({ names: ['ปัญญา', 'ธนกร'], surname: '', day: 'monday' });
        expect(snapshot.summary.highestGradeNames).toEqual(['ปัญญา', 'ธนกร']);
        expect(snapshot.summary.noKaliNames).toEqual(snapshot.rows.filter(row => !row.thaksa?.hasKali).map(row => row.name));
        expect(snapshot.summary.bothNames).toEqual(snapshot.summary.highestGradeNames.filter(name => snapshot.summary.noKaliNames.includes(name)));
        const allC = buildComparisonSnapshot({ names: ['กานต์', 'กิตติ'], surname: 'มงคล', day: 'monday' });
        expect(allC.summary.allGradeC).toBe(true);
        const html = renderToStaticMarkup(createElement(ComparisonReportContent, { report: { id: 'saved', created_at: '2026-11-06T00:00:00Z', credits_spent: 5, snapshot: allC } }));
        expect(html).toContain('ทุกชื่อได้เกรด C');
        expect(html).toContain('สูตร comparison-v1');
        expect(html).not.toContain('ดีที่สุดสำหรับชีวิต');
    });
    test('exports the purchased snapshot, escaping CSV values and preventing formulas', () => {
        const snapshot = buildComparisonSnapshot(input);
        const csv = comparisonReportCsv(snapshot);
        expect(csv.startsWith('\uFEFF')).toBe(true);
        expect(csv).toContain('"ปัญญา","","monday","15","0","15","A+"');
        snapshot.rows[0].name = '=HYPERLINK("bad"),\nทดสอบ';
        expect(comparisonReportCsv(snapshot)).toContain('"\'=HYPERLINK(""bad""),\nทดสอบ"');
        snapshot.formulaVersion = 'saved-formula';
        expect(snapshot.rows[1].nameScore).toBe(19); // Export does not recalculate saved values.
    });
});
