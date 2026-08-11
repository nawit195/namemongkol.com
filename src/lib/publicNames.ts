import 'server-only';

import { unstable_cache } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import { boyNamesCurated } from '@/data/boyNamesCurated';
import { girlNamesCurated } from '@/data/girlNamesCurated';
import { thaksaConfig, type DayKey } from '@/data/thaksa';
import { calculateScore } from '@/utils/numerologyUtils';
import { analyzeNameSuitability } from '@/utils/thaksaUtils';
import { analyzeName, type NameAnalysisResult } from '@/utils/nameAnalysis';
import { buildPublicNameCatalog, selectPublicNameCandidates } from '@/lib/publicNameCatalog';

const PAGE_SIZE_DEFAULT = 30;
const PAGE_SIZE_MAX = 50;
const DAY_KEYS = Object.keys(thaksaConfig) as DayKey[];

export type PublicNameGender = 'male' | 'female' | 'neutral';

export type PublicNameRecord = {
    name: string;
    gender: PublicNameGender;
    pronunciation?: string;
    meaning?: string;
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

    return [...girls, ...boys].sort((a, b) => a.name.localeCompare(b.name, 'th'));
}

export const fetchAllPublicNames = unstable_cache(
    async (): Promise<PublicNameRecord[]> => {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) return createFallbackNames();

        const supabase = createClient(supabaseUrl, supabaseKey, {
            auth: { persistSession: false },
        });
        const pageSize = 1000;
        type DatabaseNameRow = {
            name: string;
            gender: string | null;
            pronunciation?: string | null;
            pronunciation_status?: string | null;
            meaning: string | null;
            created_at: string | null;
        };

        type NameQueryMode = 'with-status' | 'with-pronunciation' | 'legacy';

        async function readRows(mode: NameQueryMode) {
            const rows: DatabaseNameRow[] = [];
            const columns = {
                'with-status': 'name, gender, pronunciation, pronunciation_status, meaning, created_at',
                'with-pronunciation': 'name, gender, pronunciation, meaning, created_at',
                legacy: 'name, gender, meaning, created_at',
            }[mode];

            for (let from = 0; ; from += pageSize) {
                const { data, error } = await supabase
                    .from('auspicious_names')
                    .select(columns)
                    .order('name', { ascending: true })
                    .range(from, from + pageSize - 1);

                if (error) return { rows: [] as DatabaseNameRow[], error };
                if (!data?.length) break;
                rows.push(...(data as unknown as DatabaseNameRow[]));
                if (data.length < pageSize) break;
            }

            return { rows, error: null };
        }

        let result = await readRows('with-status');
        if (result.error && /pronunciation_status/i.test(result.error.message ?? '')) {
            console.warn('Public names pronunciation status is not available yet; loading approved legacy pronunciation data.');
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

        return rows
            .map((row) => {
                const name = stripInvisible(row.name);
                const pronunciation = row.pronunciation_status === undefined || row.pronunciation_status === 'approved'
                    ? row.pronunciation?.trim()
                    : undefined;
                const meaning = row.meaning?.trim();
                const suitability = analyzeNameSuitability(name);
                const suitableDays = DAY_KEYS.filter((day) =>
                    suitability.suitable.includes(thaksaConfig[day].name),
                );

                return {
                    name,
                    gender: normalizeGender(row.gender),
                    pronunciation: pronunciation || undefined,
                    meaning: meaning || undefined,
                    createdAt: row.created_at || undefined,
                    numerology: calculateScore(name),
                    suitableDays,
                    grade: analyzeName(name)?.grade ?? 'C',
                };
            })
            .filter((row) => row.name);
    },
    ['public-auspicious-names-v9'],
    { revalidate: 600, tags: ['public-names'] },
);

const fetchPublicNamesCatalog = unstable_cache(
    async () => buildPublicNameCatalog(await fetchAllPublicNames(), DAY_KEYS),
    ['public-auspicious-name-catalog-v1'],
    { revalidate: 600, tags: ['public-names'] },
);

export async function queryPublicNames(query: PublicNamesQuery = {}): Promise<PublicNamesResult> {
    const allNames = await fetchAllPublicNames();
    const catalog = await fetchPublicNamesCatalog();
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
