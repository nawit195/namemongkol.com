/**
 * Conservative RTGS transcription of an already syllable-separated Thai reading.
 * This does not choose a person's reading or their preferred passport spelling.
 * Reference: Royal Institute, หลักเกณฑ์การถอดอักษรไทยเป็นอักษรโรมันแบบถ่ายเสียง,
 * https://www.arts.chula.ac.th/~ling/tts/ThaiRoman.pdf
 * Tones and vowel length do not distinguish RTGS output; onset/coda do.
 * Unknown or malformed syllables stop the whole reading, never drop characters.
 */
export const THAI_ROMANIZATION_VERSION = 'rtgs-reading-v1';

const INITIALS = {
    ก: 'k', ข: 'kh', ฃ: 'kh', ค: 'kh', ฅ: 'kh', ฆ: 'kh', ง: 'ng',
    จ: 'ch', ฉ: 'ch', ช: 'ch', ฌ: 'ch', ซ: 's', ศ: 's', ษ: 's', ส: 's',
    ญ: 'y', ย: 'y', ฎ: 'd', ด: 'd', ฏ: 't', ต: 't',
    ฐ: 'th', ฑ: 'th', ฒ: 'th', ถ: 'th', ท: 'th', ธ: 'th',
    ณ: 'n', น: 'n', บ: 'b', ป: 'p', ผ: 'ph', พ: 'ph', ภ: 'ph',
    ฝ: 'f', ฟ: 'f', ม: 'm', ร: 'r', ล: 'l', ฬ: 'l', ว: 'w', ห: 'h', ฮ: 'h', อ: '',
};
const FINALS = {
    ก: 'k', ข: 'k', ค: 'k', ฆ: 'k', ง: 'ng',
    จ: 't', ช: 't', ซ: 't', ฎ: 't', ฏ: 't', ฐ: 't', ฑ: 't', ฒ: 't',
    ด: 't', ต: 't', ถ: 't', ท: 't', ธ: 't', ศ: 't', ษ: 't', ส: 't',
    ญ: 'n', ณ: 'n', น: 'n', ร: 'n', ล: 'n', ฬ: 'n',
    บ: 'p', ป: 'p', พ: 'p', ฟ: 'p', ภ: 'p', ม: 'm',
};
const CLUSTERS = new Set(['กร', 'กล', 'กว', 'ขร', 'ขล', 'ขว', 'คร', 'คล', 'คว', 'ปร', 'ปล', 'พร', 'พล', 'ตร']);
const EXPLICIT_FOREIGN_CLUSTERS = new Set(['บร', 'บล', 'ดร', 'ฟร', 'ฟล', 'ทร']);
const SILENT_H_FOLLOWERS = new Set(['ง', 'ญ', 'น', 'ม', 'ย', 'ร', 'ล', 'ว']);
// Familiar lexical exceptions whose pronunciation is part of the RTGS examples.
const EXCEPTIONS = { ทรง: 'song', ไทร: 'sai' };
const permittedClusters = [...CLUSTERS, ...[...SILENT_H_FOLLOWERS].map(value => `ห${value}`), 'อย'];
const clusterPatterns = permittedClusters.map(value => `${value[0]}ฺ?${value[1]}`);
clusterPatterns.push(...[...EXPLICIT_FOREIGN_CLUSTERS].map(value => `${value[0]}ฺ${value[1]}`));
const ONSET = `(${clusterPatterns.join('|')}|[ก-ฮ])`;
const CODA = '([ก-ฮ]?)';

function onsetSound(value) {
    const explicit = value.includes('ฺ');
    const letters = value.replace('ฺ', '');
    if (letters.length === 1) return INITIALS[letters];
    if (letters[0] === 'ห' && SILENT_H_FOLLOWERS.has(letters[1])) return INITIALS[letters[1]];
    if (letters === 'อย') return 'y';
    if (!CLUSTERS.has(letters) && !(explicit && EXPLICIT_FOREIGN_CLUSTERS.has(letters))) return undefined;
    return INITIALS[letters[0]] + INITIALS[letters[1]];
}

// Most-specific nuclei come first. Each rule consumes the *entire* syllable.
// A coda is never inferred from a fragment left over by another rule.
const RULES = [
    [new RegExp(`^เ${ONSET}ียว$`, 'u'), 'iao'],
    [new RegExp(`^เ${ONSET}ีย(?:ะ|${CODA})$`, 'u'), 'ia'],
    [new RegExp(`^เ${ONSET}ือ(?:ะ|${CODA})$`, 'u'), 'uea'],
    [new RegExp(`^${ONSET}ัว(?:ะ|${CODA})$`, 'u'), 'ua'],
    [new RegExp(`^${ONSET}ว([ก-ฮ])$`, 'u'), 'ua'],
    [new RegExp(`^เ${ONSET}าะ$`, 'u'), 'o'],
    [new RegExp(`^เ${ONSET}า$`, 'u'), 'ao'],
    [new RegExp(`^เ${ONSET}อะ$`, 'u'), 'oe'],
    [new RegExp(`^เ${ONSET}อ${CODA}$`, 'u'), 'oe'],
    [new RegExp(`^เ${ONSET}ิ([ก-ฮ])$`, 'u'), 'oe'],
    [new RegExp(`^เ${ONSET}อย$`, 'u'), 'oei'],
    [new RegExp(`^เ${ONSET}ย$`, 'u'), 'oei'],
    [new RegExp(`^${ONSET}าย$`, 'u'), 'ai'],
    [new RegExp(`^${ONSET}าว$`, 'u'), 'ao'],
    [new RegExp(`^${ONSET}ิ[ว]$`, 'u'), 'io'],
    [new RegExp(`^${ONSET}ุ[ย]$`, 'u'), 'ui'],
    [new RegExp(`^${ONSET}อย$`, 'u'), 'oi'],
    [new RegExp(`^${ONSET}วย$`, 'u'), 'uai'],
    [new RegExp(`^เ${ONSET}ว$`, 'u'), 'eo'],
    [new RegExp(`^แ${ONSET}ว$`, 'u'), 'aeo'],
    [new RegExp(`^[ใไ]${ONSET}$`, 'u'), 'ai'],
    [new RegExp(`^${ONSET}ำ$`, 'u'), 'am'],
    [new RegExp(`^${ONSET}อ${CODA}$`, 'u'), 'o'],
    [new RegExp(`^${ONSET}า${CODA}$`, 'u'), 'a'],
    [new RegExp(`^${ONSET}ะ$`, 'u'), 'a'],
    [new RegExp(`^${ONSET}ั([ก-ฮ])$`, 'u'), 'a'],
    [new RegExp(`^${ONSET}[ิี]${CODA}$`, 'u'), 'i'],
    [new RegExp(`^${ONSET}ึ${CODA}$`, 'u'), 'ue'],
    [new RegExp(`^${ONSET}ื([ก-ฮ])$`, 'u'), 'ue'],
    [new RegExp(`^${ONSET}ือ$`, 'u'), 'ue'],
    [new RegExp(`^${ONSET}[ุู]${CODA}$`, 'u'), 'u'],
    [new RegExp(`^เ${ONSET}(?:ะ|${CODA})$`, 'u'), 'e'],
    [new RegExp(`^แ${ONSET}(?:ะ|${CODA})$`, 'u'), 'ae'],
    [new RegExp(`^โ${ONSET}(?:ะ|${CODA})$`, 'u'), 'o'],
    // An unwritten short /o/ is only accepted when there is an explicit coda.
    [new RegExp(`^${ONSET}([ก-ฮ])$`, 'u'), 'o'],
];

function romanizeSyllable(input) {
    if (!/^[ก-ฮะาำิีึืุูเแโใไั่้๊๋็์ฺ]+$/u.test(input)) return undefined;
    if (/[่้๊๋]{2,}/u.test(input)) return undefined;
    const normalized = input.replace(/[่้๊๋็]/gu, '').replace(/[ก-ฮ][ิีุู]?์/gu, '');
    if (EXCEPTIONS[normalized]) return EXCEPTIONS[normalized];
    for (const [pattern, vowel] of RULES) {
        const match = normalized.match(pattern);
        if (!match) continue;
        const initial = onsetSound(match[1]);
        const coda = match[2] || '';
        if (initial === undefined || (coda && FINALS[coda] === undefined)) continue;
        return initial + vowel + (coda ? FINALS[coda] : '');
    }
    return undefined;
}

/** Proposed spelling only. The source reading's review status is unchanged. */
export function romanizeReading(reading) {
    const normalized = String(reading ?? '').normalize('NFC').trim();
    if (!normalized) return { issues: ['blank-reading'] };
    if (/[^ก-๙-]/u.test(normalized)) return { issues: ['unsupported-reading-character'] };
    const inputSyllables = normalized.split('-');
    if (inputSyllables.some(value => !value)) return { issues: ['empty-syllable'] };
    const syllables = inputSyllables.map(thai => ({ thai, roman: romanizeSyllable(thai)?.toUpperCase() }));
    const issues = syllables.filter(value => !value.roman).map(value => `unresolved-syllable:${value.thai}`);
    if (issues.length) return { syllables, issues };
    // Preserve the boundary before a vowel-initial syllable (สะ-อาด = SA-AT),
    // avoiding a different reading without cluttering normal Thai name joins.
    const englishName = syllables.map((value, index) => index > 0 && /^[AEIOU]/.test(value.roman) ? `-${value.roman}` : value.roman).join('');
    return { englishName, syllables, issues: [] };
}
