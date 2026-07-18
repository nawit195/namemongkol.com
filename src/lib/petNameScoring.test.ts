import { describe, expect, it } from 'vitest';
import { PET_NAME_SEEDS } from '@/data/petNamesSeed';
import { PET_NAME_SEED_EXPANSION_500 } from '@/data/petNamesSeedExpansion500';
import { analyzeExistingPetName, DEFAULT_PET_NAME_FILTERS, filterAndScorePetNames, getAuspiciousScore } from './petNameScoring';

function duplicateValues(values: string[]) {
    const seen = new Set<string>();
    return [...new Set(values.filter((value) => seen.size === seen.add(value).size))];
}

describe('pet name seed data', () => {
    it('contains 500 valid and uniquely addressable records', () => {
        expect(PET_NAME_SEEDS).toHaveLength(500);
        expect(duplicateValues(PET_NAME_SEEDS.map((record) => record.slug))).toEqual([]);
        expect(duplicateValues(PET_NAME_SEEDS.map((record) => record.nameTh))).toEqual([]);
        expect(duplicateValues(PET_NAME_SEEDS.map((record) => record.nameEn.toLowerCase()))).toEqual([]);

        for (const record of PET_NAME_SEEDS) {
            expect(record.nameTh).not.toBe('');
            expect(record.meaning).not.toBe('');
            expect(record.pronunciation).not.toBe('');
            expect(record.initial).not.toBe('');
            expect(record.petTypes.length).toBeGreaterThan(0);
            expect(record.syllables).toBeGreaterThanOrEqual(1);
            expect(record.syllables).toBeLessThanOrEqual(5);
            expect(record.meaningScore).toBeGreaterThanOrEqual(0);
            expect(record.meaningScore).toBeLessThanOrEqual(100);
            expect(record.pronunciationScore).toBeGreaterThanOrEqual(0);
            expect(record.pronunciationScore).toBeLessThanOrEqual(100);
            expect(record.distinctivenessScore).toBeGreaterThanOrEqual(0);
            expect(record.distinctivenessScore).toBeLessThanOrEqual(100);
        }

        expect(PET_NAME_SEEDS.filter((record) => record.petTypes.includes('dog')).length).toBeGreaterThanOrEqual(150);
        expect(PET_NAME_SEEDS.filter((record) => record.petTypes.includes('cat')).length).toBeGreaterThanOrEqual(150);
        expect(PET_NAME_SEEDS.some((record) => record.language === 'japanese')).toBe(true);
        expect(PET_NAME_SEEDS.some((record) => record.language === 'korean')).toBe(true);
    });

    it('adds the planned 200-name language and species mix', () => {
        expect(PET_NAME_SEED_EXPANSION_500).toHaveLength(200);
        expect(PET_NAME_SEED_EXPANSION_500.filter((record) => record.language === 'thai')).toHaveLength(40);
        expect(PET_NAME_SEED_EXPANSION_500.filter((record) => record.language === 'english')).toHaveLength(35);
        expect(PET_NAME_SEED_EXPANSION_500.filter((record) => record.language === 'japanese')).toHaveLength(35);
        expect(PET_NAME_SEED_EXPANSION_500.filter((record) => record.language === 'korean')).toHaveLength(35);
        expect(PET_NAME_SEED_EXPANSION_500.filter((record) => record.language === 'international')).toHaveLength(55);
        expect(PET_NAME_SEED_EXPANSION_500.filter((record) => record.petTypes.includes('dog')).length).toBeGreaterThanOrEqual(120);
        expect(PET_NAME_SEED_EXPANSION_500.filter((record) => record.petTypes.includes('cat')).length).toBeGreaterThanOrEqual(120);
        expect(PET_NAME_SEED_EXPANSION_500.filter((record) => record.petTypes.includes('other')).length).toBeGreaterThanOrEqual(50);
    });
});

describe('pet name scoring', () => {
    it('filters by pet type and excluded letters before ranking', () => {
        const results = filterAndScorePetNames(PET_NAME_SEEDS, {
            ...DEFAULT_PET_NAME_FILTERS,
            petType: 'cat',
            excludedLetters: 'ซ',
        });

        expect(results).toHaveLength(12);
        expect(results.every((record) => record.petTypes.includes('cat'))).toBe(true);
        expect(results.every((record) => !`${record.nameTh}${record.nameEn}`.toLocaleLowerCase('th').includes('ซ'))).toBe(true);
    });

    it('uses selected traits as a soft ranking signal', () => {
        const results = filterAndScorePetNames(PET_NAME_SEEDS, {
            ...DEFAULT_PET_NAME_FILTERS,
            traits: ['ขี้เล่น'],
        });

        expect(results.some((record) => record.traits.includes('ขี้เล่น'))).toBe(true);
        expect(results[0].totalScore).toBeGreaterThanOrEqual(results.at(-1)?.totalScore ?? 0);
    });

    it('combines language, gender and initial filters and keeps the 12-result limit', () => {
        const matchingInitial = PET_NAME_SEEDS.find((record) => record.language === 'japanese' && record.genders.includes('neutral'))?.initial ?? '';
        const results = filterAndScorePetNames(PET_NAME_SEEDS, {
            ...DEFAULT_PET_NAME_FILTERS,
            language: 'japanese',
            gender: 'neutral',
            initial: matchingInitial,
        });

        expect(results.length).toBeLessThanOrEqual(12);
        expect(results.length).toBeGreaterThan(0);
        expect(results.every((record) => record.language === 'japanese')).toBe(true);
        expect(results.every((record) => record.genders.includes('neutral'))).toBe(true);
        expect(results.every((record) => record.initial === matchingInitial)).toBe(true);
    });

    it('does not invent a meaning for an unknown name', () => {
        const result = analyzeExistingPetName('ชื่อทดสอบใหม่', PET_NAME_SEEDS, DEFAULT_PET_NAME_FILTERS);
        expect(result.meaningAvailable).toBe(false);
        expect(result.meaning).toBe('');
        expect(result.scoreBreakdown.meaning).toBeNull();
    });

    it('returns the full stored meaning for a known name', () => {
        const result = analyzeExistingPetName('โมจิ', PET_NAME_SEEDS, DEFAULT_PET_NAME_FILTERS);
        expect(result.meaningAvailable).toBe(true);
        expect(result.meaning).toContain('ขนม');
    });

    it('calculates numerology for Thai and Latin names', () => {
        expect(getAuspiciousScore('มงคล').numerologyValue).toBeGreaterThan(0);
        expect(getAuspiciousScore('Lucky').numerologyValue).toBeGreaterThan(0);
    });
});
