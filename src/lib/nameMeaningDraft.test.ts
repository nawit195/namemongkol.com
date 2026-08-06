import { describe, expect, it } from 'vitest';
import {
    analyzeNameRoots,
    buildMeaningBatchPrompt,
    canGenerateMeaningDraft,
    parseGeminiMeaningBatchResponse,
} from './nameMeaningDraft';

describe('name meaning draft grounding', () => {
    it('accepts a name composed from curated roots', () => {
        const result = analyzeNameRoots('ไกรสรวิชญ์');
        expect(result.roots.map((entry) => entry.root)).toEqual(['ไกร', 'สร', 'วิชญ์']);
        expect(result.coverage).toBe(1);
        expect(canGenerateMeaningDraft(result)).toBe(true);
    });

    it('blocks unusual names with insufficient root coverage', () => {
        const result = analyzeNameRoots('โงรินวริศ');
        expect(result.unmatched.length).toBeGreaterThan(0);
        expect(canGenerateMeaningDraft(result)).toBe(false);
    });

    it('rejects malformed Gemini payloads', () => {
        expect(parseGeminiMeaningBatchResponse({ results: [{ id: 'bad-id', meaning: 'สั้น' }] })).toBeNull();
    });

    it('keeps ids and grounded roots in the batch prompt', () => {
        const coverage = analyzeNameRoots('ไกรภัทร');
        const prompt = buildMeaningBatchPrompt([{ id: '550e8400-e29b-41d4-a716-446655440000', name: 'ไกรภัทร', coverage }]);
        expect(prompt).toContain('550e8400-e29b-41d4-a716-446655440000');
        expect(prompt).toContain('ไกร');
        expect(prompt).toContain('ภัทร');
        expect(prompt).toContain('ห้ามเพิ่มรากศัพท์');
    });
});
