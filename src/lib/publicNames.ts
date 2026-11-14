import 'server-only';
import { missingNameColumn, nameColumns } from './nameQueryCompatibility';

import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import { boyNamesCurated } from '@/data/boyNamesCurated';
import { girlNamesCurated } from '@/data/girlNamesCurated';
import { thaksaConfig, type DayKey } from '@/data/thaksa';
import { calculateScore } from '@/utils/numerologyUtils';
import { analyzeNameSuitability } from '@/utils/thaksaUtils';
import { analyzeName, type NameAnalysisResult } from '@/utils/nameAnalysis';
import { buildPublicNameCatalog, selectPublicNameCandidates } from '@/lib/publicNameCatalog';
import { mergePublicChoNames } from '@/lib/publicChoNameAdditions';
import { selectSeededRandomItems } from '@/lib/randomizedNameSelection';
import { prepareReviewedNames, editorialNameKeys } from '@/lib/reviewedNames';

const PAGE_SIZE_DEFAULT = 30;
const PAGE_SIZE_MAX = 50;
const DATABASE_PAGE_SIZE = 1000;
const FEATURED_NAME_COUNT = 10;
const DAY_KEYS = Object.keys(thaksaConfig) as DayKey[];

type DatabaseNameRow = {
    calculated?: Pick<PublicNameRecord, 'numerology' | 'suitableDays' | 'grade'>;
    name: string;
    english_name?: string | null;
    english_name_draft?: string | null;
    english_name_status?: string | null;
    english_name_source?: string | null;
    english_name_reading?: string | null;
    gender: string | null;
    pronunciation?: string | null;
    pronunciation_draft?: string | null;
    pronunciation_status?: string | null;
    pronunciation_variants?: string[] | null;
    meaning: string | null;
    meaning_status?: string | null;
    publication_status?: string | null;
    created_at: string | null;
};

type NameQueryMode = 'with-publication' | 'with-evidence' | 'with-review-state' | 'with-status' | 'with-meaning-status' | 'with-pronunciation' | 'legacy';

type DatabaseQueryError = {
    message: string;
    code?: string;
    details?: string;
    hint?: string;
};

const DATABASE_COLUMNS: Record<NameQueryMode, string> = {
    'with-publication': 'name, gender, pronunciation, pronunciation_draft, pronunciation_variants, pronunciation_status, meaning, meaning_status, publication_status, created_at',
    'with-evidence': 'name, gender, pronunciation, pronunciation_draft, pronunciation_variants, pronunciation_status, meaning, meaning_status, created_at',
    'with-review-state': 'name, gender, pronunciation, pronunciation_draft, pronunciation_status, meaning, created_at',
    'with-status': 'name, gender, pronunciation, pronunciation_status, meaning, created_at',
    'with-meaning-status': 'name, gender, pronunciation, meaning, meaning_status, created_at',
    'with-pronunciation': 'name, gender, pronunciation, meaning, created_at',
    legacy: 'name, gender, meaning, created_at',
};

export type PublicNameGender = 'male' | 'female' | 'neutral';
export type PublicNameReviewStatus = 'pending' | 'draft' | 'approved' | 'rejected';

export type PublicNameRecord = {
    name: string;
    englishName?: string;
    englishNameStatus?: PublicNameReviewStatus;
    englishNameSource?: string;
    gender: PublicNameGender;
    pronunciation?: string;
    pronunciationVariants?: string[];
    pronunciationStatus?: PublicNameReviewStatus;
    meaning?: string;
    meaningStatus?: PublicNameReviewStatus;
    createdAt?: string;
    numerology: number;
    suitableDays: DayKey[];
    grade: NameAnalysisResult['grade'];
};

export type PublicNamesSummary = {
    grades: Record<NameAnalysisResult['grade'], number>;
    withPronunciation: number;
    withMeaning: number;
    latestCreatedAt?: string;
};

export type PublicNamesQuery = {
    reviewedOnly?: boolean;
    discoveryOnly?: boolean;
    search?: string;
    day?: DayKey | 'all';
    gender?: PublicNameGender | 'all';
    initial?: string | 'all';
    page?: number;
    limit?: number;
    featuredSeed?: string;
};

export type PublicNamesFilterQuery = Pick<PublicNamesQuery, 'day' | 'gender' | 'initial'>;

export type PublicNamesResult = {
    dataSource?: 'database' | 'fallback';
    data: PublicNameRecord[];
    featuredData: PublicNameRecord[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    facets: {
        genders: Record<PublicNameGender, number>;
        initials: string[];
        days: Record<DayKey, number>;
    };
    summary: PublicNamesSummary;
};

function stripInvisible(value: string) {
    return value.replace(/[\s\u200B\u200C\u200D\uFEFF]+/g, '');
}
function normalizeGender(value: string | null | undefined): PublicNameGender {
    if (value === 'male' || value === 'female') return value;
    return 'neutral';
}

function normalizeReviewStatus(value: string | null | undefined): PublicNameReviewStatus | undefined {
    return value === 'pending' || value === 'draft' || value === 'approved' || value === 'rejected'
        ? value
        : undefined;
}

function createFallbackNames(): PublicNameRecord[] {
    const girls = girlNamesCurated.map((item) => ({
        name: item.name,
        gender: 'female' as const,
        meaning: item.meaning,
        numerology: item.numerology,
        suitableDays: item.suitableDays,
        grade: analyzeName(item.name)?.grade ?? 'C',
    }));
    const boys = boyNamesCurated.map((item) => ({
        name: item.name,
        gender: 'male' as const,
        meaning: item.meaning,
        numerology: item.numerology,
        suitableDays: item.suitableDays,
        grade: analyzeName(item.name)?.grade ?? 'C',
    }));

    return mergePublicChoNames([...girls, ...boys]).sort((a, b) => a.name.localeCompare(b.name, 'th'));
}

function calculatePublicNameValues(name: string): Pick<PublicNameRecord, 'numerology' | 'suitableDays' | 'grade'> {
    const suitability = analyzeNameSuitability(name);
    return {
        numerology: calculateScore(name),
        suitableDays: DAY_KEYS.filter(day => suitability.suitable.includes(thaksaConfig[day].name)),
        grade: analyzeName(name)?.grade ?? 'C',
    };
}

const fetchPublicNameRowsPage = unstable_cache(
    async (mode: NameQueryMode, from: number, withEnglish: boolean, excluded: string[]): Promise<{
        rows: DatabaseNameRow[];
        error: DatabaseQueryError | null;
        totalRows?: number | null;
    }> => {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

        if (!supabaseUrl || !supabaseKey) {
            return {
                rows: [],
                error: { message: 'Supabase public names credentials are not configured.' },
            };
        }

        const supabase = createClient(supabaseUrl, supabaseKey, {
            auth: { persistSession: false },
        });
        const { data, error, count } = await supabase
            .from('auspicious_names')
            .select(nameColumns(DATABASE_COLUMNS[mode] + (withEnglish ? ', english_name, english_name_draft, english_name_status, english_name_source, english_name_reading' : ''), excluded), from === 0 ? { count: 'exact' } : undefined)
            .order('name', { ascending: true })
            .range(from, from + DATABASE_PAGE_SIZE - 1);

        if (error) {
            return {
                rows: [],
                error: {
                    message: error.message,
                    code: error.code,
                    details: error.details,
                    hint: error.hint,
                },
            };
        }

        return {
            // Keep computed values in bounded, tag-invalidated page entries.
            // A new rotation seed must not recalculate the entire catalog.
            rows: ((data ?? []) as unknown as DatabaseNameRow[]).map(row => ({
                ...row,
                calculated: calculatePublicNameValues(stripInvisible(row.name)),
            })),
            error: null,
            totalRows: count,
        };
    },
    ['public-auspicious-name-page-v20-prepared-pages'],
    { revalidate: 600, tags: ['public-names'] },
);

async function readRows(mode: NameQueryMode, withEnglish = true, excluded: string[] = []): Promise<{ rows: DatabaseNameRow[]; error: DatabaseQueryError | null }> {
    const rows: DatabaseNameRow[] = [];
    let next = 0;
    let totalRows: number | undefined;
    while (true) {
        // Discover the schema/count with page one, then read at most four
        // independent pages together. Legacy responses without a count still work.
        const offsets = totalRows === undefined ? [next]
            : Array.from({ length: 4 }, (_, index) => next + index * DATABASE_PAGE_SIZE).filter(from => from < totalRows!);
        if (offsets.length === 0) break;
        const results = await Promise.all(offsets.map(from => fetchPublicNameRowsPage(mode, from, withEnglish, excluded)));
        for (const result of results) {
            if (result.error) {
                const missing = missingNameColumn(result.error, excluded);
                if (missing) return readRows(mode, withEnglish, [...excluded, missing]);
                return { rows: [], error: result.error };
            }
            rows.push(...result.rows);
        }
        const first = results[0];
        if (next === 0 && typeof first.totalRows === 'number' && Number.isFinite(first.totalRows) && first.totalRows >= first.rows.length) totalRows = first.totalRows;
        next = offsets[offsets.length - 1] + DATABASE_PAGE_SIZE;
        if (totalRows === undefined && results[results.length - 1].rows.length < DATABASE_PAGE_SIZE) break;
    }

    return { rows, error: null };
}

type LoadedPublicNames = { allNames: PublicNameRecord[]; dataSource: 'database' | 'fallback' };

async function loadPublicNamesWithSource(strictRead = false): Promise<LoadedPublicNames> {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

    if (!supabaseUrl || !supabaseKey) return { allNames: strictRead ? [] : createFallbackNames(), dataSource: 'fallback' };

    let result = await readRows('with-publication');
    if (result.error && /publication_status/i.test(result.error.message ?? '')) {
        console.warn('Public name publication status is not available yet; using the existing evidence fields.');
        result = await readRows('with-evidence');
    }
    if (result.error && /pronunciation_variants|meaning_status/i.test(result.error.message ?? '')) {
        console.warn('Public names evidence fields are not available yet; using the existing review state.');
        result = await readRows('with-review-state');
    }
    if (result.error && /pronunciation_draft/i.test(result.error.message ?? '')) {
        console.warn('Public names pronunciation draft is not available yet; using the existing review status.');
        result = await readRows('with-status');
    }
    if (result.error && /pronunciation_status/i.test(result.error.message ?? '')) {
        console.warn('Public names pronunciation status is not available yet; using existing pronunciation data.');
        result = await readRows('with-meaning-status');
    }
    if (result.error && /meaning_status/i.test(result.error.message ?? '')) {
        result = await readRows('with-pronunciation');
    }
    if (result.error && /pronunciation/i.test(result.error.message ?? '')) {
        console.warn('Public names pronunciation column is not available yet; using the legacy query.');
        result = await readRows('legacy');
    }

    if (result.error) {
        console.error('Public names database query failed:', result.error);
        if (strictRead) throw new Error('Cannot safely load reviewed public names. Please retry.');
        return { allNames: createFallbackNames(), dataSource: 'fallback' };
    }

    const rows = result.rows;

    if (rows.length === 0) return { allNames: strictRead ? [] : createFallbackNames(), dataSource: 'fallback' };

    const records: PublicNameRecord[] = rows
        .filter((row) => row.publication_status !== 'hidden')
        .map((row) => {
            const name = stripInvisible(row.name);
            const publishedPronunciation = row.pronunciation?.trim();
            const draftPronunciation = row.pronunciation_draft?.trim();
            const pronunciation = row.pronunciation_status === 'rejected'
                ? undefined
                : publishedPronunciation || draftPronunciation;
            const pronunciationVariants = row.pronunciation_status === 'rejected'
                ? []
                : (row.pronunciation_variants ?? []).map((value) => value.trim()).filter(Boolean);
            const meaning = row.meaning_status === 'rejected' ? undefined : row.meaning?.trim();
            const storedEnglish = row.english_name?.trim();
            const draftEnglish = row.english_name_draft?.trim();
            const storedEnglishStatus = normalizeReviewStatus(row.english_name_status);
            // Existing source spellings win over suggestions. Draft metadata
            // must not relabel a source spelling filled by another editor.
            const useDraftMetadata = !storedEnglish || storedEnglishStatus === 'approved' || storedEnglishStatus === 'rejected';
            const englishNameSource = useDraftMetadata ? row.english_name_source?.trim() || undefined : undefined;
            const generatedEnglish = englishNameSource === 'rtgs-reading-v1';
            // A suggested spelling belongs to its recorded reading. Hide it if
            // an editor changes/rejects that reading until it is regenerated.
            const englishIsStale = !storedEnglish && generatedEnglish && (
                !row.english_name_reading?.trim()
                || !pronunciation?.trim()
                || row.english_name_reading.normalize('NFC').trim() !== pronunciation.normalize('NFC').trim()
            );
            const englishNameStatus: PublicNameReviewStatus | undefined = storedEnglishStatus === 'rejected' ? 'rejected' : englishIsStale ? 'pending'
                : useDraftMetadata ? storedEnglishStatus ?? (draftEnglish ? 'pending' : undefined) : undefined;
            const englishName = row.english_name_status === 'rejected' || englishIsStale
                ? undefined : storedEnglish || draftEnglish || undefined;
            const calculated = row.calculated ?? calculatePublicNameValues(name);

            return {
                name,
                englishName,
                englishNameStatus,
                englishNameSource,
                gender: normalizeGender(row.gender),
                pronunciation: pronunciation || undefined,
                pronunciationVariants,
                pronunciationStatus: normalizeReviewStatus(row.pronunciation_status),
                meaning: meaning || undefined,
                meaningStatus: normalizeReviewStatus(row.meaning_status),
                createdAt: row.created_at || undefined,
                ...calculated,
            };
        })
        .filter((row) => row.name);
    return {
        allNames: mergePublicChoNames(records, rows.filter((row) => row.publication_status === 'hidden').map((row) => row.name)),
        dataSource: 'database',
    };
}

const fetchPublicNamesWithSource = cache(loadPublicNamesWithSource);
async function loadAllPublicNames(strictRead = false): Promise<PublicNameRecord[]> {
    return (await fetchPublicNamesWithSource(strictRead)).allNames;
}
export const fetchAllPublicNames = cache(loadAllPublicNames);

const fetchPublicNamesDataset = cache(async () => {
    const { allNames, dataSource } = await fetchPublicNamesWithSource(false);
    return {
        allNames,
        dataSource,
        catalog: buildPublicNameCatalog(allNames, DAY_KEYS),
    };
});

// Database rows remain in bounded Next cache entries. Share the prepared catalog in
// memory for ten minutes so pagination does not recalculate the entire collection,
// without exceeding the Next Data Cache per-entry size limit.
let reviewedDataset: { expires: number; promise: Promise<LoadedPublicNames> } | undefined;
export const fetchReviewedNamesDataset = cache(async (discoveryOnly: boolean) => {
    if (!reviewedDataset || reviewedDataset.expires <= Date.now()) {
        const promise = fetchPublicNamesWithSource(true).then(({ allNames, dataSource }) => ({ allNames: prepareReviewedNames(allNames), dataSource }));
        reviewedDataset = { expires: Date.now() + 600_000, promise };
        promise.then(
            ({ dataSource }) => { if (dataSource === 'fallback' && reviewedDataset?.promise === promise) reviewedDataset = undefined; },
            () => { if (reviewedDataset?.promise === promise) reviewedDataset = undefined; },
        );
    }
    const { allNames: reviewed, dataSource } = await reviewedDataset.promise;
    const allNames = discoveryOnly ? reviewed.filter(item => item.gender === 'neutral' && !editorialNameKeys.has(item.name.normalize('NFC').trim().toLowerCase())) : reviewed;
    return { allNames, dataSource, catalog: buildPublicNameCatalog(allNames, DAY_KEYS) };
});

export async function queryPublicNames(query: PublicNamesQuery = {}): Promise<PublicNamesResult> {
    const { allNames, catalog, dataSource } = query.reviewedOnly ? await fetchReviewedNamesDataset(!!query.discoveryOnly) : await fetchPublicNamesDataset();
    const day = query.day && query.day !== 'all' && DAY_KEYS.includes(query.day) ? query.day : 'all';
    const gender = query.gender ?? 'all';
    const initial = query.initial?.trim() || 'all';
    const page = Math.max(1, Math.floor(query.page ?? 1));
    const pageSize = Math.min(PAGE_SIZE_MAX, Math.max(1, Math.floor(query.limit ?? PAGE_SIZE_DEFAULT)));

    const candidates = selectPublicNameCandidates(allNames, catalog, { day, gender, initial });
    const search = query.reviewedOnly ? query.search?.normalize('NFC').trim().toLowerCase().slice(0, 100) : '';
    const ordered = search ? candidates.filter(item => item.name.toLowerCase().includes(search) || item.meaning?.toLowerCase().includes(search)) : candidates;
    const start = (page - 1) * pageSize;
    const grades: PublicNamesSummary['grades'] = { 'A+': 0, A: 0, B: 0, C: 0 };

    for (const item of ordered) grades[item.grade] += 1;

    return {
        dataSource,
        data: ordered.slice(start, start + pageSize),
        featuredData: query.featuredSeed && page === 1
            ? selectSeededRandomItems(ordered, FEATURED_NAME_COUNT, query.featuredSeed)
            : [],
        total: ordered.length,
        page,
        pageSize,
        totalPages: Math.max(1, Math.ceil(ordered.length / pageSize)),
        facets: catalog.facets,
        summary: {
            grades,
            ...catalog.quality,
        },
    };
}

export async function queryAllPublicNames(query: PublicNamesFilterQuery = {}): Promise<PublicNameRecord[]> {
    const { allNames, catalog } = await fetchPublicNamesDataset();
    const day = query.day && query.day !== 'all' && DAY_KEYS.includes(query.day) ? query.day : 'all';
    const gender = query.gender ?? 'all';
    const initial = query.initial?.trim() || 'all';

    return selectPublicNameCandidates(allNames, catalog, { day, gender, initial });
}
