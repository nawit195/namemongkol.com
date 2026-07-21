import { describe, expect, it } from 'vitest';
import {
    getCompatibilityPresentation,
    type CompatibilityAnalysisResult,
    type CompatibilityScoreBreakdown,
} from './petCompatibility';

function buildResult(
    scoreBreakdown: CompatibilityScoreBreakdown,
    kalakineeChars: string[] = []
): CompatibilityAnalysisResult {
    return {
        scoreBreakdown,
        daySuitability: [],
        ownerDayResult: null,
        kalakineeChars,
        ownerNameScore: 24,
        combinedAuspicious: false,
    };
}

const baseBreakdown: CompatibilityScoreBreakdown = {
    total: 78,
    birthdaySuitability: 76,
    thaksaLetters: 82,
    meaning: 91,
    pronunciation: 88,
    petSuitability: 72,
    nameRelationship: 64,
};

describe('getCompatibilityPresentation', () => {
    it.each([
        [94, 'เข้ากันได้ดีเยี่ยม', 'excellent'],
        [74, 'เข้ากันได้ดี', 'good'],
        [61, 'เข้ากันได้ระดับปานกลาง', 'consider'],
    ] as const)('maps score %s to a stable verdict', (total, verdict, tone) => {
        const result = getCompatibilityPresentation(buildResult({ ...baseBreakdown, total }));

        expect(result.verdict).toBe(verdict);
        expect(result.tone).toBe(tone);
    });

    it('selects the two strongest and two weakest factors', () => {
        const result = getCompatibilityPresentation(buildResult(baseBreakdown));

        expect(result.strengths.map((factor) => factor.key)).toEqual(['meaning', 'pronunciation']);
        expect(result.cautions.map((factor) => factor.key)).toEqual(['nameRelationship', 'petSuitability']);
    });

    it('surfaces kalakinee letters as a caution note', () => {
        const result = getCompatibilityPresentation(buildResult(baseBreakdown, ['ส', 'ศ']));

        expect(result.cautionNote).toContain('ส, ศ');
        expect(result.tone).toBe('warning');
        expect(result.verdict).toBe('แนะนำให้เปลี่ยนชื่อ');
        expect(result.recommendation).toContain('ควรเปลี่ยน');
    });
});
