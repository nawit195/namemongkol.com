import 'server-only';

import { unstable_cache } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import { boyNamesCurated } from '@/data/boyNamesCurated';
import { girlNamesCurated } from '@/data/girlNamesCurated';
import { thaksaConfig, type DayKey } from '@/data/thaksa';
import { calculateScore } from '@/utils/numerologyUtils';
import { analyzeNameSuitability } from '@/utils/thaksaUtils';
import { getFirstThaiConsonant } from '@/utils/thaiNameInitial';

const PAGE_SIZE_DEFAULT = 30;
const PAGE_SIZE_MAX = 50;
const DAY_KEYS = Object.keys(thaksaConfig) as DayKey[];

export type PublicNameGender = 'male' | 'female' | 'neutral';

export type PublicNameRecord = {
    name: string;
    gender: PublicNameGender;
    meaning?: string;
    createdAt?: string;
    numerology: number;
    suitableDays: DayKey[];
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
    }));
    const boys = boyNamesCurated.map((item) => ({
        name: item.name,
        gender: 'male' as const,
        meaning: item.meaning,
        numerology: item.numerology,
        suitableDays: item.suitableDays,
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
        const rows: { name: string; gender: string | null; meaning: string | null; created_at: string | null }[] = [];
        const pageSize = 1000;

        for (let from = 0; ; from += pageSize) {
            const { data, error } = await supabase
                .from('auspicious_names')
                .select('name, gender, meaning, created_at')
                .order('name', { ascending: true })
                .range(from, from + pageSize - 1);

            if (error) {
                console.error('Public names database query failed:', error);
                return createFallbackNames();
            }

            if (!data?.length) break;
            rows.push(...data);
            if (data.length < pageSize) break;
        }

        if (rows.length === 0) return createFallbackNames();

        return rows
            .map((row) => {
                const name = stripInvisible(row.name);
                const suitability = analyzeNameSuitability(name);
                const suitableDays = DAY_KEYS.filter((day) =>
                    suitability.suitable.includes(thaksaConfig[day].name),
                );

                return {
                    name,
                    gender: normalizeGender(row.gender),
                    meaning: row.meaning || undefined,
                    createdAt: row.created_at || undefined,
                    numerology: calculateScore(name),
                    suitableDays,
                };
            })
            .filter((row) => row.name);
    },
    ['public-auspicious-names-v3'],
    { revalidate: 600, tags: ['public-names'] },
);

export async function queryPublicNames(query: PublicNamesQuery = {}): Promise<PublicNamesResult> {
    const allNames = await fetchAllPublicNames();
    const day = query.day && query.day !== 'all' && DAY_KEYS.includes(query.day) ? query.day : 'all';
    const gender = query.gender ?? 'all';
    const initial = query.initial?.trim() || 'all';
    const page = Math.max(1, Math.floor(query.page ?? 1));
    const pageSize = Math.min(PAGE_SIZE_MAX, Math.max(1, Math.floor(query.limit ?? PAGE_SIZE_DEFAULT)));

    const filtered = allNames.filter((item) => {
        if (gender === 'male' && item.gender !== 'male' && item.gender !== 'neutral') return false;
        if (gender === 'female' && item.gender !== 'female' && item.gender !== 'neutral') return false;
        if (gender === 'neutral' && item.gender !== 'neutral') return false;
        if (day !== 'all' && !item.suitableDays.includes(day)) return false;
        if (initial !== 'all' && getFirstThaiConsonant(item.name) !== initial) return false;
        return true;
    });

    const start = (page - 1) * pageSize;
    const genders: Record<PublicNameGender, number> = { male: 0, female: 0, neutral: 0 };
    const days = Object.fromEntries(DAY_KEYS.map((key) => [key, 0])) as Record<DayKey, number>;
    const initials = new Set<string>();

    for (const item of allNames) {
        genders[item.gender] += 1;
        initials.add(getFirstThaiConsonant(item.name));
        for (const suitableDay of item.suitableDays) days[suitableDay] += 1;
    }

    return {
        data: filtered.slice(start, start + pageSize),
        total: filtered.length,
        page,
        pageSize,
        totalPages: Math.max(1, Math.ceil(filtered.length / pageSize)),
        facets: {
            genders,
            initials: [...initials].filter(Boolean).sort((a, b) => a.localeCompare(b, 'th')),
            days,
        },
    };
}
