import { describe, expect, it } from 'vitest';
import type { DayKey } from '@/data/thaksa';
import { buildPublicNameCatalog, selectPublicNameCandidates } from './publicNameCatalog';

const DAYS: DayKey[] = ['monday', 'friday'];
const names = [
    { name: 'กวิน', gender: 'male' as const, suitableDays: ['monday'] as DayKey[], createdAt: '2026-01-01' },
    { name: 'เกรียงไกร', gender: 'male' as const, suitableDays: ['friday'] as DayKey[], createdAt: '2026-07-01' },
    { name: 'แก้ว', gender: 'neutral' as const, suitableDays: ['monday', 'friday'] as DayKey[], pronunciation: 'แก้ว' },
    { name: 'โกมล', gender: 'female' as const, suitableDays: ['monday'] as DayKey[], meaning: 'ดอกบัว' },
    { name: 'ใกล้รุ่ง', gender: 'neutral' as const, suitableDays: ['friday'] as DayKey[] },
    { name: 'ไกรวิชญ์', gender: 'male' as const, suitableDays: ['monday'] as DayKey[], createdAt: '2026-08-01' },
];

describe('public name catalog', () => {
    it('buckets Thai names by the consonant behind a leading vowel', () => {
        const catalog = buildPublicNameCatalog(names, DAYS);

        expect(catalog.byInitial['ก'].map((index) => names[index].name)).toEqual([
            'ไกรวิชญ์', 'เกรียงไกร', 'กวิน', 'แก้ว', 'โกมล', 'ใกล้รุ่ง',
        ]);
    });

    it('uses inclusive gender buckets and keeps exact facet counts', () => {
        const catalog = buildPublicNameCatalog(names, DAYS);

        expect(catalog.byGender.male).toHaveLength(5);
        expect(catalog.byGender.female).toHaveLength(3);
        expect(catalog.facets.genders).toEqual({ male: 3, female: 1, neutral: 2 });
    });

    it('filters combined conditions from indexed candidates and keeps newest names first', () => {
        const catalog = buildPublicNameCatalog(names, DAYS);
        const result = selectPublicNameCandidates(names, catalog, {
            initial: 'ก',
            day: 'monday',
            gender: 'male',
        });

        expect(result.map((item) => item.name)).toEqual(['ไกรวิชญ์', 'กวิน', 'แก้ว']);
    });

    it('computes reusable quality and day summaries once', () => {
        const catalog = buildPublicNameCatalog(names, DAYS);

        expect(catalog.quality.withPronunciation).toBe(1);
        expect(catalog.quality.withMeaning).toBe(1);
        expect(catalog.quality.latestCreatedAt).toBe('2026-08-01');
        expect(catalog.facets.days).toEqual({ monday: 4, friday: 3 });
    });
});
