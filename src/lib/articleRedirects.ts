export type ArticleRedirect = {
    sourceSlug: string;
    destinationSlug: string;
};

export const ARTICLE_REDIRECTS: readonly ArticleRedirect[] = [
    { sourceSlug: '100-auspicious-boy-names-2569', destinationSlug: 'naming-tips-2026-year-of-horse' },
    { sourceSlug: 'auspicious-boy-names-2569', destinationSlug: 'naming-tips-2026-year-of-horse' },
    { sourceSlug: 'check-kalakini-letters-7-days', destinationSlug: 'forbidden-letters-kalakini' },
    { sourceSlug: 'lucky-names-by-birthday-2569', destinationSlug: 'auspicious-names-by-birthday-2026' },
    { sourceSlug: '700-auspicious-names-by-birthday-2569', destinationSlug: 'auspicious-names-by-birthday-2026' },
    { sourceSlug: 'lucky-colors-by-day', destinationSlug: 'auspicious-colors-2569-guide' },
    { sourceSlug: 'numerology-guide', destinationSlug: 'numerology-0-9-power-guide' },
    { sourceSlug: 'ตั้งชื่อลูก-2569-คู่มือสมบูรณ์', destinationSlug: 'baby-naming-guide-2569' },
    { sourceSlug: 'ทักษา-ปกรณ์-ตั้งชื่อลูกให้ตรงจุด', destinationSlug: 'thaksa-pakorn-naming-guide' },
    { sourceSlug: 'เบอร์มงคล-วิธีเลือก-คู่เลขเสริมดวง', destinationSlug: 'lucky-phone-numbers-guide-2569' },
    { sourceSlug: 'ชื่อลูกสาว-2569-50-ชื่อมงคล', destinationSlug: 'girl-names-2569-50-auspicious' },
    { sourceSlug: 'ชื่อลูกชาย-2569-50-ชื่อมงคล', destinationSlug: 'boy-names-2569-50-auspicious' },
] as const;

export const ARTICLE_REDIRECT_MAP: Readonly<Record<string, string>> = Object.freeze(
    Object.fromEntries(ARTICLE_REDIRECTS.map(({ sourceSlug, destinationSlug }) => [sourceSlug, destinationSlug]))
);

export const REDIRECTED_ARTICLE_SLUGS = new Set(
    ARTICLE_REDIRECTS.map(({ sourceSlug }) => sourceSlug)
);

export function isRedirectedArticleSlug(slug: string) {
    return REDIRECTED_ARTICLE_SLUGS.has(slug);
}
