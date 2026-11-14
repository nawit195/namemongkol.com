import { expect, test } from 'vitest';
import { romanizeReading, THAI_ROMANIZATION_VERSION } from '../../scripts/lib/thai-romanization.mjs';

test.each([
    ['สม-ชาย', 'SOMCHAI'], ['นา-วิน', 'NAWIN'], ['กะ-หนก', 'KANOK'],
    ['นิ-รัน', 'NIRAN'], ['พัด', 'PHAT'], ['ทำ', 'THAM'],
    ['สะ-อาด', 'SA-AT'], ['จัน', 'CHAN'], ['แก้ว', 'KAEO'], ['พระ', 'PHRA'],
    ['พัด-ชะ-ระ-พน', 'PHATCHARAPHON'], ['ก้อง', 'KONG'], ['หนู', 'NU'],
    ['ไทร', 'SAI'], ['ทรง', 'SONG'], ['กฺระ', 'KRA'], ['หฺนก', 'NOK'],
    ['กวย', 'KUAI'], ['เขียง', 'KHIANG'], ['เพียง', 'PHIANG'], ['เรือน', 'RUEAN'],
    ['เชย', 'CHOEI'], ['เบย', 'BOEI'], ['เขียว', 'KHIAO'], ['ทฺรา', 'THRA'], ['ไทฺร', 'THRAI'],
])('transcribes explicit Thai reading %s as %s', (thai, roman) => {
    expect(romanizeReading(thai)).toMatchObject({ englishName: roman, issues: [] });
});

test.each(['', 'SOMCHAI', 'สมชาย', 'กมล', 'กั', 'ฉั', 'ะะ', 'โกิ', 'เลื้อา', 'กะ--นก', 'กะ นก', 'กะ-', 'เกะด', 'โกะน', 'แปะน', 'เคียะน', 'กั้วะน', 'ก้้'])('refuses unresolved reading %s without partial output', thai => {
    const result = romanizeReading(thai);
    expect(result.englishName).toBeUndefined();
    expect(result.issues.length).toBeGreaterThan(0);
});

test('identifies source syllables and version for review instead of asserting approval', () => {
    expect(THAI_ROMANIZATION_VERSION).toBe('rtgs-reading-v1');
    expect(romanizeReading('สม-ชาย').syllables).toEqual([{ thai: 'สม', roman: 'SOM' }, { thai: 'ชาย', roman: 'CHAI' }]);
    expect(romanizeReading('นา-???')).not.toHaveProperty('englishName');
});
