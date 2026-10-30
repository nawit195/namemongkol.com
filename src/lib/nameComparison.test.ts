import { describe, expect, it } from 'vitest';
import { compareNames, sortComparisons, validateComparison, analysisDetailHref } from './nameComparison';
import { calculateScore } from '@/utils/calculateScore';
import { analyzePairs } from '@/utils/analyzePairs';
import { analyzeThaksa } from '@/utils/analyzeThaksa';
import { calculateAyatana } from '@/utils/ayatana';
import { calculateGrade } from '@/utils/gradeResult';

describe('comparison input', () => {
  it('requires 2–5 filled, distinct names and a supported weekday', () => {
    expect(validateComparison(['กานต์'], '', '').valid).toBe(false);
    expect(validateComparison(Array(6).fill('กานต์'), '', 'monday').valid).toBe(false);
    expect(validateComparison(['กานต์', '  '], '', 'monday').names[1]).toBeTruthy();
    expect(validateComparison(['กานต์', ' กานต์ '], '', 'monday').names.every(Boolean)).toBe(true);
    expect(validateComparison(['James', 'JAMES'], '', 'monday').valid).toBe(false);
    expect(validateComparison(['กานต์', 'ธนกร'], '', 'invalid').day).toBeTruthy();
    expect(validateComparison(['กานต์', 'ธนกร'], '', 'wednesday_night').valid).toBe(true);
  });
  it('rejects unsupported characters, embedded spaces, and empty added slots', () => {
    for (const value of ['กานต์!', '123', 'ชื่อ นามสกุล', 'กานต์\u200b']) {
      expect(validateComparison([value, 'ธนกร'], '', 'sunday').names[0]).toBeTruthy();
    }
    expect(validateComparison(['กานต์', 'ธนกร', ''], '', 'sunday').valid).toBe(false);
    expect(validateComparison(['กานต์', 'ธนกร'], 'สกุล!', 'sunday').surname).toBeTruthy();
    expect(validateComparison([' James ', 'ธนกร'], ' มงคล ', 'sunday').valid).toBe(true);
  });
});

describe('individual analysis parity', () => {
  for (const surname of ['', 'มงคล']) {
    it(`matches existing individual utilities with surname "${surname}"`, () => {
      const rows = compareNames(['กานต์', 'ธนกร'], surname, 'wednesday_night');
      for (const row of rows) {
        const namePairs = analyzePairs(row.name);
        const surnamePairs = analyzePairs(surname);
        const total = calculateScore(row.name) + calculateScore(surname);
        expect(row.totalScore).toBe(total);
        expect(row.namePairs).toEqual(namePairs);
        expect(row.surnamePairs).toEqual(surnamePairs);
        expect(row.grade).toBe(calculateGrade(total, [...namePairs, ...surnamePairs]));
        expect(row.thaksa).toEqual(analyzeThaksa(row.name, 'wednesday_night', surname));
        expect(row.ayatana).toEqual(calculateAyatana(total));
        expect(row.pairCounts.good + row.pairCounts.neutral + row.pairCounts.bad)
          .toBe(namePairs.length + surnamePairs.length);
      }
    });
  }
  it('accepts five names, trims outer spaces and rejects invalid calculations', () => {
    expect(compareNames([' กานต์ ', 'ธนกร', 'สิรภพ', 'พิชญา', 'ณิชา'], '', 'monday')[0].name).toBe('กานต์');
    expect(() => compareNames(['กานต์', ''], '', 'monday')).toThrow();
  });
  it('sorts grades stably without mutating input and restores original order', () => {
    const rows = compareNames(['กานต์', 'ธนกร', 'ณิชา', 'สิรภพ', 'พิชญา'], '', 'monday');
    const graded = rows.map((row, i) => ({ ...row, grade: (['C', 'A+', 'B', 'A+', 'A'] as const)[i] }));
    const sorted = sortComparisons(graded, 'grade');
    expect(sorted.map(row => row.inputIndex)).toEqual([1, 3, 4, 2, 0]);
    expect(sortComparisons(sorted, 'input').map(row => row.inputIndex)).toEqual([0, 1, 2, 3, 4]);
    expect(graded.map(row => row.inputIndex)).toEqual([0, 1, 2, 3, 4]);
  });
  it('encodes the detail link without losing Thai text', () => {
    const row = compareNames(['กานต์', 'ธนกร'], 'มงคล', 'monday')[0];
    const url = new URL(analysisDetailHref(row), 'https://example.test');
    expect(url.pathname).toBe('/name-check');
    expect(Object.fromEntries(url.searchParams)).toEqual({ name: 'กานต์', surname: 'มงคล', day: 'monday' });
  });
});
