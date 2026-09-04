import { describe, expect, it } from 'vitest';
import {
    getPronunciationIssues,
    getPublicationPronunciationIssues,
    getPronunciationApprovalIssues,
    normalizePronunciationText,
} from './thaiPronunciation';

describe('Thai pronunciation publication rules', () => {
    it('normalizes separators without changing Thai syllables', () => {
        expect(normalizePronunciationText(' กะ – หนก ')).toBe('กะ-หนก');
    });

    it.each([
        ['เขตรกรินทร์', 'เขด-ตระ-กะ-ริน'],
        ['เขตรจิราวรรณ', 'เขด-จิ-รา-วัน'],
        ['เขตรณัฐจิรา', 'เขด-นัด-จิ-รา'],
        ['เขตรญาลักษณ์', 'เขด-ยา-ลัก'],
        ['พัชรพล', 'พัด-ชะ-ระ-พน'],
    ])('accepts the required hyphenated reading fixture for %s', (_name, pronunciation) => {
        expect(getPublicationPronunciationIssues(pronunciation)).toEqual([]);
    });

    it('requires linguistic roots and traceable sources before approval', () => {
        expect(getPronunciationApprovalIssues('เขด-กะ-ริน', [], {})).toEqual(['missing-roots', 'missing-sources']);
        expect(getPronunciationApprovalIssues('เขด-กะ-ริน', ['เขด-ตระ-กะ-ริน'], {
            roots: ['เขตร', 'กรินทร์'],
            sources: [{ title: 'พจนานุกรม ฉบับราชบัณฑิตยสถาน', url: 'https://dictionary.orst.go.th/' }],
        })).toEqual([]);
    });

    it('separates structural validation from public readability', () => {
        expect(getPronunciationIssues('หฺนู-ปฺระ-โคน')).toEqual([]);
        expect(getPublicationPronunciationIssues('หฺนู-ปฺระ-โคน')).toEqual(['technical-pinthu']);
    });

    it('rejects malformed syllable separators and detached marks', () => {
        expect(getPublicationPronunciationIssues('-กะ-หนก')).toContain('dangling-separator');
        expect(getPublicationPronunciationIssues('เ-กี-ยะด')).toContain('detached-leading-vowel');
        expect(getPublicationPronunciationIssues('ลิ-่น')).toContain('detached-thai-mark');
    });
});
