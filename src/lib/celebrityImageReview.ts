import reviews from '@/data/celebrityImageReviews.json';
import type { CelebrityPortrait } from '@/data/celebrityNames';
import type { CelebrityImageEvidence } from '@/types/celebrityCatalog';

function referencePath(value: string, host: string) {
    try {
        const url = new URL(value);
        if (url.protocol !== 'https:' || url.hostname !== host || url.username || url.password) return null;
        return decodeURIComponent(url.pathname).normalize('NFC').replace(/ /g, '_').replace(/\/+$/, '');
    } catch { return null; }
}

export function celebrityImageEvidence(portrait: CelebrityPortrait): CelebrityImageEvidence | null {
    const review = reviews.find(review => review.src === portrait.src);
    if (!review || !['own-work-declaration', 'external-review-recorded', 'public-domain-declaration'].includes(review.status) ||
        review.declaration !== portrait.license || review.author !== portrait.credit || !review.revisionId || !review.evidenceUrl.startsWith('https://commons.wikimedia.org/')) return null;
    const source = referencePath(portrait.sourceUrl, 'commons.wikimedia.org');
    const license = referencePath(portrait.licenseUrl, 'creativecommons.org');
    if (!source || !license || source !== referencePath(review.sourceUrl, 'commons.wikimedia.org') ||
        license !== referencePath(review.licenseUrl, 'creativecommons.org')) return null;
    return { status: review.status as CelebrityImageEvidence['status'], checkedAt: review.checkedAt,
        evidenceUrl: review.evidenceUrl, revisionId: review.revisionId, title: review.fileTitle.replace(/^File:/, '') };
}

export function reviewedCelebrityPortrait(portrait: CelebrityPortrait): CelebrityPortrait | null {
    return celebrityImageEvidence(portrait) ? portrait : null;
}
