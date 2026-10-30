import { getCharValue } from '@/data/numerologyLookup';
import { thaksaConfig } from '@/data/thaksaConfig';
import { calculateScore } from '@/utils/calculateScore';
import { analyzePairs } from '@/utils/analyzePairs';
import { analyzeThaksa } from '@/utils/analyzeThaksa';
import { calculateAyatana } from '@/utils/ayatana';
import { calculateGrade, type Grade } from '@/utils/gradeResult';
import type { DayKey } from '@/types';

export type ComparisonValidation = {
  valid: boolean;
  names: string[];
  surname: string;
  day: string;
  form: string;
};

function textError(value: string): string {
  if (value.length > 100) return 'กรอกไม่เกิน 100 ตัวอักษร';
  if (/\s/.test(value)) return 'กรอกเฉพาะชื่อในช่องนี้ โดยไม่เว้นวรรค';
  if ([...value].some(char => getCharValue(char) === undefined)) {
    return 'ใช้ตัวอักษรไทยหรืออังกฤษที่ระบบรองรับ ไม่ใส่ตัวเลขหรือสัญลักษณ์';
  }
  return '';
}

export function validateComparison(names: string[], surname: string, day: string): ComparisonValidation {
  const normalized = names.map(name => name.trim());
  const counts = new Map<string, number>();
  for (const name of normalized) {
    const key = name.toLocaleLowerCase('en');
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const errors = normalized.map(name => !name ? 'กรอกชื่อ หรือลบช่องที่ไม่ใช้' :
    textError(name) || ((counts.get(name.toLocaleLowerCase('en')) ?? 0) > 1 ? 'ชื่อนี้ซ้ำกับอีกช่อง กรุณาเลือกชื่ออื่น' : ''));
  const surnameError = textError(surname.trim());
  const dayError = Object.hasOwn(thaksaConfig, day) ? '' : 'กรุณาเลือกวันเกิด';
  const form = names.length < 2 || names.length > 5 ? 'เปรียบเทียบได้ครั้งละ 2–5 ชื่อ' : '';
  return { valid: !form && !surnameError && !dayError && errors.every(error => !error), names: errors, surname: surnameError, day: dayError, form };
}

export function compareNames(names: string[], surname: string, day: string) {
  if (!validateComparison(names, surname, day).valid) throw new Error('ข้อมูลเปรียบเทียบไม่ถูกต้อง');
  const normalizedSurname = surname.trim();
  const surnameScore = calculateScore(normalizedSurname);
  const surnamePairs = analyzePairs(normalizedSurname);
  return names.map((value, inputIndex) => {
    const name = value.trim();
    const nameScore = calculateScore(name);
    const namePairs = analyzePairs(name);
    const allPairs = [...namePairs, ...surnamePairs];
    const totalScore = nameScore + surnameScore;
    return {
      inputIndex, name, surname: normalizedSurname, day: day as DayKey,
      nameScore, surnameScore, totalScore, namePairs, surnamePairs,
      grade: calculateGrade(totalScore, allPairs),
      thaksa: analyzeThaksa(name, day, normalizedSurname),
      ayatana: calculateAyatana(totalScore),
      pairCounts: {
        good: allPairs.filter(pair => pair.grade === 'good').length,
        neutral: allPairs.filter(pair => pair.grade === 'neutral').length,
        bad: allPairs.filter(pair => pair.grade === 'bad').length,
      },
    };
  });
}

export type NameComparison = ReturnType<typeof compareNames>[number];
export type ComparisonOrder = 'grade' | 'input';
const GRADE_ORDER: Record<Grade, number> = { 'A+': 0, A: 1, B: 2, C: 3 };

export function sortComparisons(rows: NameComparison[], order: ComparisonOrder): NameComparison[] {
  return [...rows].sort((a, b) =>
    (order === 'grade' ? GRADE_ORDER[a.grade] - GRADE_ORDER[b.grade] : 0) || a.inputIndex - b.inputIndex);
}

export function analysisDetailHref(row: Pick<NameComparison, 'name' | 'surname' | 'day'>): string {
  return `/name-check?${new URLSearchParams({ name: row.name, surname: row.surname, day: row.day })}`;
}
