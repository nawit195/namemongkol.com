export const PREMIUM_ADMIN_DEFAULT_PAGE_SIZE = 30;
export const PREMIUM_ADMIN_MAX_PAGE_SIZE = 100;
export const PREMIUM_ADMIN_MAX_IMPORT_SIZE = 500;

export type PremiumAdminGender = 'male' | 'female' | 'neutral';
export type PremiumAdminReviewStatus = 'pending' | 'draft' | 'approved' | 'rejected';
export type PremiumAdminPublicationStatus = 'published' | 'hidden';

export type PremiumAdminInput = {
    name: string;
    gender?: PremiumAdminGender;
    pronunciation?: string;
    meaning?: string;
};

export type PremiumMembershipRow = {
    id: number | string;
    name: string;
    created_at?: string | null;
};

export type PremiumSharedDetailRow = {
    name: string;
    gender?: string | null;
    pronunciation?: string | null;
    pronunciation_draft?: string | null;
    pronunciation_status?: string | null;
    meaning?: string | null;
    meaning_draft?: string | null;
    meaning_status?: string | null;
    publication_status?: string | null;
};

export type PremiumAdminRecord = {
    id: number | string;
    name: string;
    createdAt?: string;
    gender: PremiumAdminGender;
    pronunciation?: string;
    pronunciationDraft?: string;
    pronunciationStatus: PremiumAdminReviewStatus;
    meaning?: string;
    meaningDraft?: string;
    meaningStatus: PremiumAdminReviewStatus;
    publicationStatus: PremiumAdminPublicationStatus;
    hasSharedDetails: boolean;
};

export type PremiumAdminSanitizeResult = {
    records: PremiumAdminInput[];
    received: number;
    duplicatesInPayload: number;
    invalid: number;
};

function normalizeOptionalText(value: unknown, maxLength: number) {
    if (typeof value !== 'string') return undefined;
    const normalized = value.normalize('NFC').trim();
    return normalized ? normalized.slice(0, maxLength) : undefined;
}
export function normalizePremiumName(value: unknown) {
    if (typeof value !== 'string') return '';
    return value.normalize('NFC').trim().slice(0, 100);
}
export function sanitizePremiumAdminRecords(values: unknown[]): PremiumAdminSanitizeResult {
    const records: PremiumAdminInput[] = [];
    const seen = new Set<string>();
    let invalid = 0;
    let duplicatesInPayload = 0;

    for (const value of values) {
        const source = typeof value === 'string'
            ? { name: value }
            : value && typeof value === 'object'
                ? value as Record<string, unknown>
                : null;
        const name = normalizePremiumName(source?.name);
        if (!name) {
            invalid++;
            continue;
        }
        if (seen.has(name)) {
            duplicatesInPayload++;
            continue;
        }
        seen.add(name);

        const rawGender = source?.gender;
        const gender = rawGender === 'male' || rawGender === 'female' || rawGender === 'neutral'
            ? rawGender
            : undefined;
        records.push({
            name,
            ...(gender ? { gender } : {}),
            ...(normalizeOptionalText(source?.pronunciation, 150)
                ? { pronunciation: normalizeOptionalText(source?.pronunciation, 150) }
                : {}),
            ...(normalizeOptionalText(source?.meaning, 1000)
                ? { meaning: normalizeOptionalText(source?.meaning, 1000) }
                : {}),
        });
    }

    return { records, received: values.length, duplicatesInPayload, invalid };
}

function normalizeGender(value: string | null | undefined): PremiumAdminGender {
    return value === 'male' || value === 'female' ? value : 'neutral';
}

function normalizeReviewStatus(value: string | null | undefined): PremiumAdminReviewStatus {
    return value === 'draft' || value === 'approved' || value === 'rejected' ? value : 'pending';
}

export function buildPremiumAdminRecords(
    memberships: PremiumMembershipRow[],
    detailRows: PremiumSharedDetailRow[],
): PremiumAdminRecord[] {
    const details = new Map(detailRows.map((row) => [normalizePremiumName(row.name), row]));

    return memberships.map((membership) => {
        const name = normalizePremiumName(membership.name);
        const detail = details.get(name);
        return {
            id: membership.id,
            name,
            ...(membership.created_at ? { createdAt: membership.created_at } : {}),
            gender: normalizeGender(detail?.gender),
            ...(detail?.pronunciation?.trim() ? { pronunciation: detail.pronunciation.trim() } : {}),
            ...(detail?.pronunciation_draft?.trim() ? { pronunciationDraft: detail.pronunciation_draft.trim() } : {}),
            pronunciationStatus: normalizeReviewStatus(detail?.pronunciation_status),
            ...(detail?.meaning?.trim() ? { meaning: detail.meaning.trim() } : {}),
            ...(detail?.meaning_draft?.trim() ? { meaningDraft: detail.meaning_draft.trim() } : {}),
            meaningStatus: normalizeReviewStatus(detail?.meaning_status),
            publicationStatus: detail?.publication_status === 'hidden' ? 'hidden' : 'published',
            hasSharedDetails: Boolean(detail),
        };
    });
}
