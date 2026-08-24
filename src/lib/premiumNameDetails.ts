import 'server-only';

import { unstable_cache } from 'next/cache';
import { createClient } from '@supabase/supabase-js';

const DATABASE_PAGE_SIZE = 1000;

export type PremiumNameReviewStatus = 'pending' | 'draft' | 'approved' | 'rejected';

export type PublicPremiumNameDetail = {
    name: string;
    pronunciation?: string;
    pronunciationVariants: string[];
    pronunciationStatus?: PremiumNameReviewStatus;
    meaning?: string;
    meaningStatus?: PremiumNameReviewStatus;
};

type PremiumNameRow = { name: string };

export type AuspiciousNameDetailRow = {
    name: string;
    pronunciation?: string | null;
    pronunciation_draft?: string | null;
    pronunciation_variants?: string[] | null;
    pronunciation_status?: string | null;
    meaning?: string | null;
    meaning_status?: string | null;
    publication_status?: string | null;
};

type DatabaseQueryError = {
    message: string;
    code?: string;
    details?: string;
    hint?: string;
};

type DetailQueryMode = 'with-publication' | 'with-evidence' | 'with-review-state' | 'with-status' | 'with-pronunciation' | 'legacy';

const DETAIL_QUERY_MODES: DetailQueryMode[] = [
    'with-publication',
    'with-evidence',
    'with-review-state',
    'with-status',
    'with-pronunciation',
    'legacy',
];

const DETAIL_COLUMNS: Record<DetailQueryMode, string> = {
    'with-publication': 'name, pronunciation, pronunciation_draft, pronunciation_variants, pronunciation_status, meaning, meaning_status, publication_status',
    'with-evidence': 'name, pronunciation, pronunciation_draft, pronunciation_variants, pronunciation_status, meaning, meaning_status',
    'with-review-state': 'name, pronunciation, pronunciation_draft, pronunciation_status, meaning',
    'with-status': 'name, pronunciation, pronunciation_status, meaning',
    'with-pronunciation': 'name, pronunciation, meaning',
    legacy: 'name, meaning',
};

function getSupabaseClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) return null;
    return createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });
}

function toQueryError(error: DatabaseQueryError): DatabaseQueryError {
    return {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
    };
}

const fetchPremiumNamePage = unstable_cache(
    async (from: number): Promise<{ rows: PremiumNameRow[]; error: DatabaseQueryError | null }> => {
        const supabase = getSupabaseClient();
        if (!supabase) return { rows: [], error: { message: 'Supabase credentials are not configured.' } };
        const { data, error } = await supabase
            .from('premium_names')
            .select('name')
            .order('name', { ascending: true })
            .range(from, from + DATABASE_PAGE_SIZE - 1);
        return error
            ? { rows: [], error: toQueryError(error) }
            : { rows: (data ?? []) as PremiumNameRow[], error: null };
    },
    ['public-premium-name-list-page-v1'],
    { revalidate: 600, tags: ['premium-names'] },
);

const fetchAuspiciousNameDetailPage = unstable_cache(
    async (mode: DetailQueryMode, from: number): Promise<{ rows: AuspiciousNameDetailRow[]; error: DatabaseQueryError | null }> => {
        const supabase = getSupabaseClient();
        if (!supabase) return { rows: [], error: { message: 'Supabase credentials are not configured.' } };
        const { data, error } = await supabase
            .from('auspicious_names')
            .select(DETAIL_COLUMNS[mode])
            .order('name', { ascending: true })
            .range(from, from + DATABASE_PAGE_SIZE - 1);
        return error
            ? { rows: [], error: toQueryError(error) }
            : { rows: (data ?? []) as unknown as AuspiciousNameDetailRow[], error: null };
    },
    ['public-premium-name-detail-page-v1'],
    { revalidate: 600, tags: ['premium-names', 'public-names'] },
);

async function readAllPages<T>(readPage: (from: number) => Promise<{ rows: T[]; error: DatabaseQueryError | null }>) {
    const rows: T[] = [];
    for (let from = 0; ; from += DATABASE_PAGE_SIZE) {
        const result = await readPage(from);
        if (result.error) return { rows: [] as T[], error: result.error };
        if (result.rows.length === 0) break;
        rows.push(...result.rows);
        if (result.rows.length < DATABASE_PAGE_SIZE) break;
    }
    return { rows, error: null };
}

function isMissingReviewColumn(error: DatabaseQueryError) {
    return error.code === '42703'
        || error.code === 'PGRST204'
        || /pronunciation|meaning_status|publication_status/i.test(`${error.message} ${error.details ?? ''}`);
}

function normalizeStatus(value: string | null | undefined): PremiumNameReviewStatus | undefined {
    return value === 'pending' || value === 'draft' || value === 'approved' || value === 'rejected'
        ? value
        : undefined;
}

function normalizeName(value: string) {
    return value.normalize('NFC').trim();
}

export function buildPublicPremiumNameDetails(
    premiumRows: PremiumNameRow[],
    detailRows: AuspiciousNameDetailRow[],
): PublicPremiumNameDetail[] {
    const detailsByName = new Map(detailRows.map((row) => [normalizeName(row.name), row]));
    const seen = new Set<string>();
    const records: PublicPremiumNameDetail[] = [];

    for (const premiumRow of premiumRows) {
        const name = normalizeName(premiumRow.name);
        if (!name || seen.has(name)) continue;
        seen.add(name);
        const detail = detailsByName.get(name);
        if (detail?.publication_status === 'hidden') continue;

        const publishedPronunciation = detail?.pronunciation?.trim();
        const draftPronunciation = detail?.pronunciation_draft?.trim();
        const rawPronunciationStatus = normalizeStatus(detail?.pronunciation_status);
        const pronunciationRejected = rawPronunciationStatus === 'rejected';
        const pronunciation = pronunciationRejected ? undefined : publishedPronunciation || draftPronunciation || undefined;
        const pronunciationStatus = pronunciation
            ? rawPronunciationStatus ?? 'pending'
            : rawPronunciationStatus;
        const pronunciationVariants = pronunciationRejected
            ? []
            : (detail?.pronunciation_variants ?? []).map((value) => value.trim()).filter(Boolean);

        const rawMeaningStatus = normalizeStatus(detail?.meaning_status);
        const meaningRejected = rawMeaningStatus === 'rejected';
        const meaning = meaningRejected ? undefined : detail?.meaning?.trim() || undefined;
        const meaningStatus = meaning ? rawMeaningStatus ?? 'pending' : rawMeaningStatus;

        records.push({
            name,
            pronunciation,
            pronunciationVariants,
            pronunciationStatus,
            meaning,
            meaningStatus,
        });
    }

    return records;
}

export async function fetchPublicPremiumNameDetails(): Promise<PublicPremiumNameDetail[]> {
    const premiumResult = await readAllPages(fetchPremiumNamePage);
    if (premiumResult.error) throw new Error(`Premium name query failed: ${premiumResult.error.message}`);

    let detailRows: AuspiciousNameDetailRow[] = [];
    let lastError: DatabaseQueryError | null = null;
    for (const mode of DETAIL_QUERY_MODES) {
        const result = await readAllPages((from) => fetchAuspiciousNameDetailPage(mode, from));
        if (!result.error) {
            detailRows = result.rows;
            lastError = null;
            break;
        }
        lastError = result.error;
        if (!isMissingReviewColumn(result.error)) break;
    }
    if (lastError) throw new Error(`Premium name detail query failed: ${lastError.message}`);

    return buildPublicPremiumNameDetails(premiumResult.rows, detailRows);
}
