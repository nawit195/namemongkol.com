const THAI_LEADING_VOWELS = new Set(['\u0E40', '\u0E41', '\u0E42', '\u0E43', '\u0E44']);
const INVISIBLE_OR_SPACE = /[\s\u200B\u200C\u200D\uFEFF]+/g;

/** Returns the first Thai consonant, accounting for vowels written before it. */
export function getFirstThaiConsonant(name: string): string {
    const normalized = name.normalize('NFC').replace(INVISIBLE_OR_SPACE, '');
    if (!normalized) return '';

    return THAI_LEADING_VOWELS.has(normalized.charAt(0))
        ? normalized.charAt(1) ?? ''
        : normalized.charAt(0);
}
