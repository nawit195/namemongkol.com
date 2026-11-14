import 'server-only';
import { missingNameColumn, nameColumns } from './nameQueryCompatibility';

import { unstable_cache } from 'next/cache';
import { createClient } from '@supabase/supabase-js';

const DATABASE_PAGE_SIZE = 1000;

export type PremiumNameReviewStatus = 'pending' | 'draft' | 'approved' | 'rejected';

export type PublicPremiumNameDetail = {
    name: string;
    englishName?: string;
    pronunciation?: string;
    pronunciationVariants: string[];
    pronunciationStatus?: PremiumNameReviewStatus;
    meaning?: string;
    meaningStatus?: PremiumNameReviewStatus;
};

export type PremiumNameRow = AuspiciousNameDetailRow;

export type AuspiciousNameDetailRow = {
    name: string;
    english_name?: string | null;
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

type DetailQueryMode = 'with-publication' | 'with-evidence' | 'with-review-state' | 'with-status' | 'with-meaning-status' | 'with-pronunciation' | 'legacy';

const DETAIL_QUERY_MODES: DetailQueryMode[] = [
    'with-publication',
    'with-evidence',
    'with-review-state',
    'with-status',
    'with-meaning-status',
    'with-pronunciation',
    'legacy',
];

const DETAIL_COLUMNS: Record<DetailQueryMode, string> = {
    'with-publication': 'name, pronunciation, pronunciation_draft, pronunciation_variants, pronunciation_status, meaning, meaning_status, publication_status',
    'with-evidence': 'name, pronunciation, pronunciation_draft, pronunciation_variants, pronunciation_status, meaning, meaning_status',
    'with-review-state': 'name, pronunciation, pronunciation_draft, pronunciation_status, meaning',
    'with-status': 'name, pronunciation, pronunciation_status, meaning',
    'with-meaning-status': 'name, pronunciation, meaning, meaning_status',
    'with-pronunciation': 'name, pronunciation, meaning',
    legacy: 'name, meaning',
};

function getSupabaseClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
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
    async (from: number, withDetails = true, excluded: string[] = []): Promise<{ rows: PremiumNameRow[]; error: DatabaseQueryError | null }> => {
        const supabase = getSupabaseClient();
        if (!supabase) return { rows: [], error: { message: 'Supabase credentials are not configured.' } };
        const { data, error } = await supabase
            .from('premium_names')
            .select(nameColumns(withDetails ? 'name, pronunciation, meaning, english_name, pronunciation_status, meaning_status' : 'name', excluded))
            .order('name', { ascending: true })
            .range(from, from + DATABASE_PAGE_SIZE - 1);
        return error
            ? { rows: [], error: toQueryError(error) }
            : { rows: (data ?? []) as unknown as PremiumNameRow[], error: null };
    },
    ['public-premium-name-list-page-v2-details'],
    { revalidate: 600, tags: ['premium-names'] },
);

const fetchAuspiciousNameDetailPage = unstable_cache(
    async (mode: DetailQueryMode, from: number, withEnglish = true, excluded: string[] = []): Promise<{ rows: AuspiciousNameDetailRow[]; error: DatabaseQueryError | null }> => {
        const supabase = getSupabaseClient();
        if (!supabase) return { rows: [], error: { message: 'Supabase credentials are not configured.' } };
        const { data, error } = await supabase
            .from('auspicious_names')
            .select(nameColumns(DETAIL_COLUMNS[mode] + (withEnglish ? ", english_name" : ""), excluded))
            .order('name', { ascending: true })
            .range(from, from + DATABASE_PAGE_SIZE - 1);
        return error
            ? { rows: [], error: toQueryError(error) }
            : { rows: (data ?? []) as unknown as AuspiciousNameDetailRow[], error: null };
    },
    ['public-premium-name-detail-page-v3-editorial-corrections'],
    { revalidate: 600, tags: ['premium-names', 'public-names'] },
);

async function readAllPages<T>(readPage: (from: number, excluded: string[]) => Promise<{ rows: T[]; error: DatabaseQueryError | null }>, excluded: string[] = []): Promise<{ rows: T[]; error: DatabaseQueryError | null }> {
    const rows: T[] = [];
    for (let from = 0; ; from += DATABASE_PAGE_SIZE) {
        const result = await readPage(from, excluded);
        if (result.error) {
            const missing = missingNameColumn(result.error, excluded);
            if (missing) return readAllPages(readPage, [...excluded, missing]);
        }
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
        || /pronunciation|meaning_status|publication_status|english_name/i.test(`${error.message} ${error.details ?? ''}`);
}

function normalizeStatus(value: string | null | undefined): PremiumNameReviewStatus | undefined {
    return value === 'pending' || value === 'draft' || value === 'approved' || value === 'rejected'
        ? value
        : undefined;
}

function normalizeName(value: string) {
    return value.normalize('NFC').replace(/[\s\u200b\u200c\u200d\ufeff]+/g, '');
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

        const pick = (column: 'pronunciation' | 'meaning') => {
            const statusColumn = column === 'pronunciation' ? 'pronunciation_status' : 'meaning_status';
            const sharedStatus = normalizeStatus(detail?.[statusColumn]);
            const premiumStatus = normalizeStatus(premiumRow[statusColumn]);
            if (sharedStatus === 'rejected' || premiumStatus === 'rejected') return { value: undefined, status: 'rejected' as const, shared: false };
            const sharedValue = detail?.[column]?.trim() || (column === 'pronunciation' ? detail?.pronunciation_draft?.trim() : undefined);
            if (sharedValue || sharedStatus === 'approved') return { value: sharedValue || undefined, status: sharedStatus ?? 'pending' as const, shared: true };
            return { value: premiumRow[column]?.trim() || undefined, status: premiumStatus ?? (premiumRow[column]?.trim() ? 'pending' as const : undefined), shared: false };
        };
        const pronunciationField = pick('pronunciation');
        const meaningField = pick('meaning');
        const pronunciation = pronunciationField.value;
        const pronunciationStatus = pronunciationField.status;
        const pronunciationVariants = pronunciationStatus === 'rejected' ? [] : ((pronunciationField.shared ? detail?.pronunciation_variants : premiumRow.pronunciation_variants) ?? []).map(value => value.trim()).filter(Boolean);
        const meaning = meaningField.value;
        const meaningStatus = meaningField.status;
        const englishName = detail?.english_name?.trim() || premiumRow.english_name?.trim() || undefined;

        records.push({
            name,
            englishName,
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
    let premiumResult = await readAllPages((from, excluded) => fetchPremiumNamePage(from, true, excluded));
    if (premiumResult.error && isMissingReviewColumn(premiumResult.error)) premiumResult = await readAllPages((from) => fetchPremiumNamePage(from, false));
    if (premiumResult.error) throw new Error(`Premium name query failed: ${premiumResult.error.message}`);

    let detailRows: AuspiciousNameDetailRow[] = [];
    let lastError: DatabaseQueryError | null = null;
    for (const mode of DETAIL_QUERY_MODES) {
        let result = await readAllPages((from, excluded) => fetchAuspiciousNameDetailPage(mode, from, true, excluded));
        if (result.error && /english_name/i.test(result.error.message)) result = await readAllPages((from) => fetchAuspiciousNameDetailPage(mode, from, false));
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

export async function fetchPremiumPublishedCount(): Promise<number | null> {
    try { return (await fetchPublicPremiumNameDetails()).length; }
    catch { return null; }
}
