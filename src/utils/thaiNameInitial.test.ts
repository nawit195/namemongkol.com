import { describe, expect, it } from 'vitest';
import { getFirstThaiConsonant } from './thaiNameInitial';

const KOR_KAI_NAMES = [
    'ไกรสรวิชญ์',
    'ไกรศรวิชญ์',
    'ไกรสรธรรม',
    'ไกรศรธรรม',
    'โกมินทร์วิชญ์',
    'ไกรวิชญ์คุณ',
    'ไกรวิชญ์ภัทร',
    'ไกรภัทรวิชญ์',
    'ไกรธรรมธรรม',
    'โกมินทร์คุณ',
    'โกมินทร์ภัทร',
    'ไกรวิชญ์',
    'โกมินทร์กร',
    'ไกรสรคุณ',
    'ไกรสรภัทร',
    'ไกรศรคุณ',
    'ไกรศรภัทร',
    'ไกรภัทรคุณ',
    'ไกรภัทรภัทร',
    'โกวิทธรรม',
    'โกมลธรรม',
    'ไกรธรรม',
    'ไกรสรกร',
    'ไกรศรกร',
    'ไกรภัทรกร',
    'โกวิทคุณ',
    'โกมลคุณ',
    'โกมลภัทร',
    'โกมลกร',
] as const;

describe('getFirstThaiConsonant', () => {
    it.each(KOR_KAI_NAMES)('groups %s under ก', (name) => {
        expect(getFirstThaiConsonant(name)).toBe('ก');
    });

    it('ignores surrounding whitespace and invisible characters', () => {
        expect(getFirstThaiConsonant(' \uFEFFไกรวิชญ์ ')).toBe('ก');
    });

    it('keeps a consonant that is already the first written character', () => {
        expect(getFirstThaiConsonant('ศุภชัย')).toBe('ศ');
    });
});
