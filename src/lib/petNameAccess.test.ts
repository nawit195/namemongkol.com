import { describe, expect, it } from 'vitest';
import { PET_NAME_SEEDS } from '@/data/petNamesSeed';
import { DEFAULT_PET_NAME_FILTERS, filterAndScorePetNames } from './petNameScoring';
import {
    createPetNameFingerprint,
    PET_NAME_FREE_COUNT,
    PET_NAME_SET_SIZE,
    presentAnalysisResult,
    presentSearchResults,
} from './petNameAccess';

describe('pet-name access rules', () => {
    it('creates the same fingerprint for equivalent multi-select ordering', () => {
        const first = createPetNameFingerprint('search', {
            ...DEFAULT_PET_NAME_FILTERS,
            traits: ['ขี้เล่น', 'ฉลาด'],
            intents: ['ความสุข', 'โชคลาภ'],
        });
        const second = createPetNameFingerprint('search', {
            ...DEFAULT_PET_NAME_FILTERS,
            traits: ['ฉลาด', 'ขี้เล่น'],
            intents: ['โชคลาภ', 'ความสุข'],
        });
        expect(first).toBe(second);
    });

    it('returns only three redacted previews for a locked twelve-name set', () => {
        const ranked = filterAndScorePetNames(PET_NAME_SEEDS, DEFAULT_PET_NAME_FILTERS, PET_NAME_SET_SIZE);
        const presentation = presentSearchResults(ranked, false);

        expect(presentation.results).toHaveLength(PET_NAME_FREE_COUNT);
        expect(presentation.lockedCount).toBe(9);
        expect(presentation.results.every((result) => result.detailLevel === 'preview')).toBe(true);
        expect(JSON.stringify(presentation.results)).not.toContain('scoreBreakdown');
        expect(JSON.stringify(presentation.results)).not.toContain('meaningScore');
    });

    it('does not charge a search that cannot produce a complete set', () => {
        const ranked = filterAndScorePetNames(PET_NAME_SEEDS.slice(0, 5), DEFAULT_PET_NAME_FILTERS, PET_NAME_SET_SIZE);
        const presentation = presentSearchResults(ranked, false);
        expect(presentation.canUnlock).toBe(false);
        expect(presentation.lockedCount).toBe(0);
        expect(presentation.results.every((result) => result.detailLevel === 'full')).toBe(true);
    });

    it('does not offer paid detail when a name has no stored meaning', () => {
        const ranked = filterAndScorePetNames(PET_NAME_SEEDS, DEFAULT_PET_NAME_FILTERS, 1)[0];
        const unknown = { ...ranked, slug: 'custom-name', meaning: '', meaningAvailable: false };
        const presentation = presentAnalysisResult(unknown, false);
        expect(presentation.canUnlock).toBe(false);
        expect(presentation.results[0].detailLevel).toBe('full');
    });
});
