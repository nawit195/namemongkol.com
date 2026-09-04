import 'server-only';

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

const PAGE_SIZE_DEFAULT = 30;
const PAGE_SIZE_MAX = 50;
const DATABASE_PAGE_SIZE = 1000;
const DAY_KEYS = Object.keys(thaksaConfig) as DayKey[];

type DatabaseNameRow = {
    name: string;
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

type NameQueryMode = 'with-publication' | 'with-evidence' | 'with-review-state' | 'with-status' | 'with-pronunciation' | 'legacy';

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
    'with-pronunciation': 'name, gender, pronunciation, meaning, created_at',
    legacy: 'name, gender, meaning, created_at',
};

export type PublicNameGender = 'male' | 'female' | 'neutral';
export type PublicNameReviewStatus = 'pending' | 'draft' | 'approved' | 'rejected';

export type PublicNameRecord = {
    name: string;
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
    day?: DayKey | 'all';
    gender?: PublicNameGender | 'all';
    initial?: string | 'all';
    page?: number;
    limit?: number;
};

export type PublicNamesResult = {
    data: PublicNameRecord[];
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

const fetchPublicNameRowsPage = unstable_cache(
    async (mode: NameQueryMode, from: number): Promise<{
        rows: DatabaseNameRow[];
        error: DatabaseQueryError | null;
    }> => {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
            return {
                rows: [],
                error: { message: 'Supabase public names credentials are not configured.' },
            };
        }

        const supabase = createClient(supabaseUrl, supabaseKey, {
            auth: { persistSession: false },
        });
        const { data, error } = await supabase
            .from('auspicious_names')
            .select(DATABASE_COLUMNS[mode])
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
            rows: (data ?? []) as unknown as DatabaseNameRow[],
            error: null,
        };
    },
    ['public-auspicious-name-page-v16'],
    { revalidate: 600, tags: ['public-names'] },
);

async function readRows(mode: NameQueryMode) {
    const rows: DatabaseNameRow[] = [];

    for (let from = 0; ; from += DATABASE_PAGE_SIZE) {
        const result = await fetchPublicNameRowsPage(mode, from);
        if (result.error) return { rows: [] as DatabaseNameRow[], error: result.error };
        if (result.rows.length === 0) break;
        rows.push(...result.rows);
        if (result.rows.length < DATABASE_PAGE_SIZE) break;
    }

    return { rows, error: null };
}

async function loadAllPublicNames(): Promise<PublicNameRecord[]> {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) return createFallbackNames();

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
        result = await readRows('with-pronunciation');
    }
    if (result.error && /pronunciation/i.test(result.error.message ?? '')) {
        console.warn('Public names pronunciation column is not available yet; using the legacy query.');
        result = await readRows('legacy');
    }

    if (result.error) {
        console.error('Public names database query failed:', result.error);
        return createFallbackNames();
    }

    const rows = result.rows;

    if (rows.length === 0) return createFallbackNames();

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
            const meaning = row.meaning?.trim();
            const suitability = analyzeNameSuitability(name);
            const suitableDays = DAY_KEYS.filter((day) =>
                suitability.suitable.includes(thaksaConfig[day].name),
            );

            return {
                name,
                gender: normalizeGender(row.gender),
                pronunciation: pronunciation || undefined,
                pronunciationVariants,
                pronunciationStatus: normalizeReviewStatus(row.pronunciation_status),
                meaning: meaning || undefined,
                meaningStatus: normalizeReviewStatus(row.meaning_status),
                createdAt: row.created_at || undefined,
                numerology: calculateScore(name),
                suitableDays,
                grade: analyzeName(name)?.grade ?? 'C',
            };
        })
        .filter((row) => row.name);
    return mergePublicChoNames(records, rows.filter((row) => row.publication_status === 'hidden').map((row) => row.name));
}

export const fetchAllPublicNames = cache(loadAllPublicNames);

const fetchPublicNamesDataset = cache(async () => {
    const allNames = await fetchAllPublicNames();
    return {
        allNames,
        catalog: buildPublicNameCatalog(allNames, DAY_KEYS),
    };
});

export async function queryPublicNames(query: PublicNamesQuery = {}): Promise<PublicNamesResult> {
    const { allNames, catalog } = await fetchPublicNamesDataset();
    const day = query.day && query.day !== 'all' && DAY_KEYS.includes(query.day) ? query.day : 'all';
    const gender = query.gender ?? 'all';
    const initial = query.initial?.trim() || 'all';
    const page = Math.max(1, Math.floor(query.page ?? 1));
    const pageSize = Math.min(PAGE_SIZE_MAX, Math.max(1, Math.floor(query.limit ?? PAGE_SIZE_DEFAULT)));

    const ordered = selectPublicNameCandidates(allNames, catalog, { day, gender, initial });
    const start = (page - 1) * pageSize;
    const grades: PublicNamesSummary['grades'] = { 'A+': 0, A: 0, B: 0, C: 0 };

    for (const item of ordered) grades[item.grade] += 1;

    return {
        data: ordered.slice(start, start + pageSize),
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
