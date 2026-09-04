const THAI_MARKS = '\\u0E31\\u0E34-\\u0E3A\\u0E47-\\u0E4E';
const THAI_LEADING_VOWELS = '\\u0E40-\\u0E44';

export function normalizePronunciationText(value: unknown) {
    return String(value ?? '')
        .normalize('NFC')
        .trim()
        .replace(/[‐‑‒–—−]/g, '-')
        .replace(/\s*-\s*/g, '-')
        .replace(/-{2,}/g, '-');
}

export function getPronunciationIssues(value: unknown) {
    const pronunciation = normalizePronunciationText(value);
    const issues: string[] = [];

    if (!pronunciation) return ['blank'];
    if (/\s/u.test(pronunciation)) issues.push('contains-space');
    if (/^-|-$/.test(pronunciation)) issues.push('dangling-separator');
    if (new RegExp(`ะ[${THAI_MARKS}]`, 'u').test(pronunciation)) issues.push('invalid-vowel-sequence');
    if (new RegExp(`(^|-)[${THAI_LEADING_VOWELS}]-`, 'u').test(pronunciation)) issues.push('detached-leading-vowel');
    if (new RegExp(`(^|-)[${THAI_MARKS}]`, 'u').test(pronunciation)) issues.push('detached-thai-mark');
    if (/[^ก-๙\-]/u.test(pronunciation)) issues.push('unsupported-character');

    return [...new Set(issues)];
}

export function getPublicationPronunciationIssues(value: unknown) {
    const pronunciation = normalizePronunciationText(value);
    const issues = getPronunciationIssues(pronunciation);
    if (/ฺ/u.test(pronunciation)) issues.push('technical-pinthu');
    return [...new Set(issues)];
}

export type LinguisticEvidence = {
    roots?: string[];
    sources?: Array<{ title: string; url: string }>;
    note?: string;
    method?: string;
};

export function normalizePronunciationVariants(value: unknown): string[] {
    const values = Array.isArray(value) ? value : [];
    return [...new Set(values
        .map(normalizePronunciationText)
        .filter(Boolean))];
}

export function getLinguisticEvidenceIssues(value: unknown): string[] {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return ['missing-evidence'];
    const evidence = value as LinguisticEvidence;
    const roots = Array.isArray(evidence.roots) ? evidence.roots.filter((root) => root.trim()) : [];
    const sources = Array.isArray(evidence.sources)
        ? evidence.sources.filter((source) => source?.title?.trim() && /^https:\/\//u.test(source?.url ?? ''))
        : [];
    const issues: string[] = [];
    if (roots.length === 0) issues.push('missing-roots');
    if (sources.length === 0) issues.push('missing-sources');
    return issues;
}

export function getPronunciationApprovalIssues(
    pronunciation: unknown,
    variants: unknown,
    evidence: unknown,
): string[] {
    const readings = [normalizePronunciationText(pronunciation), ...normalizePronunciationVariants(variants)].filter(Boolean);
    const issues = readings.flatMap(getPublicationPronunciationIssues);
    issues.push(...getLinguisticEvidenceIssues(evidence));
    return [...new Set(issues)];
}
