import { describe, expect, it } from 'vitest';
import {
    createSeededRandom,
    excludeFeaturedNames,
    reorderFirstPageWithFeatured,
    sampleRandomIndexes,
    selectSeededRandomItems,
} from '@/lib/randomizedNameSelection';

describe('randomized first search names', () => {
    it('samples unique indexes from the full result range', () => {
        const indexes = sampleRandomIndexes(100, 10, () => 0.5);

        expect(indexes).toHaveLength(10);
        expect(new Set(indexes).size).toBe(10);
        expect(indexes.every((index) => index >= 0 && index < 100)).toBe(true);
    });

    it('limits the sample when fewer than ten names match', () => {
        expect(sampleRandomIndexes(3, 10, () => 0)).toEqual([0, 1, 2]);
    });

    it('selects the same names for the same seed without duplicates', () => {
        const names = Array.from({ length: 100 }, (_, index) => ({ name: String(index) }));
        const first = selectSeededRandomItems(names, 10, 'session-ก');
        const second = selectSeededRandomItems(names, 10, 'session-ก');

        expect(second).toEqual(first);
        expect(new Set(first.map((item) => item.name)).size).toBe(10);
        expect(selectSeededRandomItems(names, 10, 'session-ข')).not.toEqual(first);
        expect(createSeededRandom('session-ก')()).toBe(createSeededRandom('session-ก')());
    });

    it('puts featured names first and keeps all other names in canonical order', () => {
        const canonical = [{ name: 'ก' }, { name: 'ข' }, { name: 'ค' }, { name: 'ง' }];
        const reordered = reorderFirstPageWithFeatured(canonical, [canonical[3], canonical[1]]);

        expect(reordered.map((item) => item.name)).toEqual(['ง', 'ข', 'ก', 'ค']);
        expect(new Set(reordered.map((item) => item.name)).size).toBe(4);
    });

    it('does not duplicate a featured name that is already in the canonical page', () => {
        const canonical = [{ name: 'ก' }, { name: 'ข' }];
        const reordered = reorderFirstPageWithFeatured(canonical, [canonical[1], canonical[1]]);

        expect(reordered.map((item) => item.name)).toEqual(['ข', 'ก']);
    });

    it('removes featured names from later canonical pages before they are unlocked', () => {
        const laterPage = [{ name: 'ก' }, { name: 'ข' }, { name: 'ค' }];

        expect(excludeFeaturedNames(laterPage, new Set(['ข']))).toEqual([{ name: 'ก' }, { name: 'ค' }]);
    });
});
