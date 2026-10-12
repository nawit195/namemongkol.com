import { describe, expect, it } from 'vitest';
import { THAI_NAME_INITIALS } from '@/data/thaiInitials';
import {
    buildLetterPreviewLookup,
    createLetterPreviewResult,
    getImmediateLetterResult,
    mergeUniqueNames,
    shouldUseLetterPreview,
} from './letterPreviews';

type TestName = { name: string };

const summary = {
    grades: { 'A+': 1, A: 2, B: 3, C: 4 },
    withPronunciation: 5,
    withMeaning: 6,
};

describe('instant initial-letter previews', () => {
    it('keeps only ten featured names and derives pagination for the regular 50-name pages', () => {
        const featuredData = Array.from({ length: 12 }, (_, index) => ({ name: `featured-${index}` }));

        const preview = createLetterPreviewResult({
            data: [{ name: 'canonical' }],
            featuredData,
            total: 101,
            summary,
        });

        expect(preview.data.map((item) => item.name)).toEqual(
            Array.from({ length: 10 }, (_, index) => `featured-${index}`),
        );
        expect(preview.total).toBe(101);
        expect(preview.totalPages).toBe(3);
        expect(preview.summary).toBe(summary);
    });

    it('falls back to canonical names and supports an empty initial', () => {
        expect(createLetterPreviewResult({
            data: [{ name: 'กนก' }, { name: 'กมล' }],
            featuredData: [],
            total: 2,
            summary,
        }).data).toEqual([{ name: 'กนก' }, { name: 'กมล' }]);

        const empty = createLetterPreviewResult<TestName, typeof summary>({
            data: [],
            featuredData: [],
            total: 0,
            summary,
        });
        expect(empty.data).toEqual([]);
        expect(empty.totalPages).toBe(1);
    });

    it('builds a preview entry for every Thai initial', async () => {
        const lookup = await buildLetterPreviewLookup(THAI_NAME_INITIALS, async (letter) => ({
            data: [{ name: `${letter}หลัก` }],
            featuredData: [{ name: `${letter}เด่น` }],
            total: 51,
            summary,
        }));

        expect(Object.keys(lookup)).toHaveLength(44);
        expect(lookup['ก'].data).toEqual([{ name: 'กเด่น' }]);
        expect(lookup['ฮ'].totalPages).toBe(2);
    });

    it('uses an instant preview only for an initial without day or gender filters', () => {
        expect(shouldUseLetterPreview({ day: 'all', gender: 'all', initial: 'ก' })).toBe(true);
        expect(shouldUseLetterPreview({ day: 'monday', gender: 'all', initial: 'ก' })).toBe(false);
        expect(shouldUseLetterPreview({ day: 'all', gender: 'female', initial: 'ก' })).toBe(false);
        expect(shouldUseLetterPreview({ day: 'all', gender: 'all', initial: 'all' })).toBe(false);
    });

    it('resolves all and initial-only selections locally but leaves combined filters to the API', () => {
        const initialResult = { kind: 'initial' };
        const letterPreview = { kind: 'preview' };
        const previews = { ก: letterPreview };

        expect(getImmediateLetterResult(
            { day: 'all', gender: 'all', initial: 'all' },
            previews,
            initialResult,
        )).toBe(initialResult);
        expect(getImmediateLetterResult(
            { day: 'all', gender: 'all', initial: 'ก' },
            previews,
            initialResult,
        )).toBe(letterPreview);
        expect(getImmediateLetterResult(
            { day: 'monday', gender: 'all', initial: 'ก' },
            previews,
            initialResult,
        )).toBeUndefined();
        expect(getImmediateLetterResult(
            { day: 'all', gender: 'female', initial: 'ก' },
            previews,
            initialResult,
        )).toBeUndefined();
    });

    it('merges canonical pages after preview names without duplicates', () => {
        const preview = [{ name: 'กนก' }, { name: 'กมล' }];
        const canonical = [{ name: 'กมล' }, { name: 'กวี' }, { name: 'กนก' }, { name: 'กฤต' }];

        expect(mergeUniqueNames(preview, canonical)).toEqual([
            { name: 'กนก' },
            { name: 'กมล' },
            { name: 'กวี' },
            { name: 'กฤต' },
        ]);
    });
});
