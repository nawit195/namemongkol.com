const THAI_MARKS = '\\u0E31\\u0E34-\\u0E3A\\u0E47-\\u0E4E';
const THAI_LEADING_VOWELS = '\\u0E40-\\u0E44';

export function normalizePronunciationText(value) {
    return String(value ?? '')
        .normalize('NFC')
        .trim()
        .replace(/[‐‑‒–—−]/g, '-')
        .replace(/\s*-\s*/g, '-')
        .replace(/-{2,}/g, '-');
}

export function getPronunciationIssues(value) {
    const pronunciation = normalizePronunciationText(value);
    const issues = [];

    if (!pronunciation) return ['blank'];
    if (/\s/u.test(pronunciation)) issues.push('contains-space');
    if (/^-|-$/.test(pronunciation)) issues.push('dangling-separator');
    if (new RegExp(`ะ[${THAI_MARKS}]`, 'u').test(pronunciation)) issues.push('invalid-vowel-sequence');
    if (new RegExp(`(^|-)[${THAI_LEADING_VOWELS}]-`, 'u').test(pronunciation)) issues.push('detached-leading-vowel');
    if (new RegExp(`(^|-)[${THAI_MARKS}]`, 'u').test(pronunciation)) issues.push('detached-thai-mark');
    if (/[^ก-๙\-]/u.test(pronunciation)) issues.push('unsupported-character');

    return [...new Set(issues)];
}

export function isPronunciationStructurallyValid(value) {
    return getPronunciationIssues(value).length === 0;
}
