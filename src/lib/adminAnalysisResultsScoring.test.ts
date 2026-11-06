import { describe, expect, test } from 'vitest';
import { buildAnalyzedNameRows } from './adminAnalysisResultsScoring';
import { calculateScore } from '@/utils/calculateScore';
import { analyzePairs } from '@/utils/analyzePairs';
import { AUSPICIOUS_SUMS, calculateGrade } from '@/utils/gradeResult';

describe('admin first-name scoring', () => {
    test('matches the analysis tool for Thai, vowels, tone marks and English', () => {
        const names = ['กานต์', 'ณัฐ', 'ปัญญา', 'ศิริ', 'น้ำ', 'พิมพ์', 'Alice', 'Anna'];
        const rows = buildAnalyzedNameRows(names);
        for (const row of rows) {
            expect(row.nameScore).toBe(calculateScore(row.name));
            expect(row.grade).toBe(calculateGrade(calculateScore(row.name), analyzePairs(row.name)));
        }
    });
    test.each([
        { name: 'ปัญญา', nameScore: 15, grade: 'A+' },
        { name: 'ศิริ', nameScore: 19, grade: 'A' },
        { name: 'ณัฐ', nameScore: 18, grade: 'B' },
        { name: 'กานต์', nameScore: 19, grade: 'C' },
        { name: 'Alice', nameScore: 13, grade: 'C' },
        { name: 'Anna', nameScore: 12, grade: 'B' },
    ])('returns the current first-name result for $name ($grade)', (row) => {
        expect(buildAnalyzedNameRows([row.name])).toEqual([row]);
    });
    test('a bad pair overrides an auspicious name sum', () => {
        const [row] = buildAnalyzedNameRows(['กานต์']);
        expect(AUSPICIOUS_SUMS).toContain(row.nameScore);
        expect(analyzePairs(row.name).some(pair => pair.grade === 'bad')).toBe(true);
        expect(row.grade).toBe('C');
    });
});
