import type { DayKey } from '@/data/thaksa';
import { sortSearchNamesByNewest } from '@/utils/searchNameSort';
import { getFirstThaiConsonant } from '@/utils/thaiNameInitial';

export type CatalogGender = 'male' | 'female' | 'neutral';

type CatalogName = {
    name: string;
    gender: CatalogGender;
    pronunciation?: string;
    meaning?: string;
    createdAt?: string;
    suitableDays: DayKey[];
};

export type PublicNameCatalog = {
    all: number[];
    byInitial: Record<string, number[]>;
    byDay: Record<DayKey, number[]>;
    byGender: Record<CatalogGender | 'all', number[]>;
    facets: {
        genders: Record<CatalogGender, number>;
        initials: string[];
        days: Record<DayKey, number>;
    };
    quality: {
        withPronunciation: number;
        withMeaning: number;
        latestCreatedAt?: string;
    };
};

export type PublicNameCatalogFilters = {
    day: DayKey | 'all';
    gender: CatalogGender | 'all';
    initial: string | 'all';
};

function addToBucket<T>(buckets: Record<string, T[]>, key: string, value: T) {
    (buckets[key] ??= []).push(value);
}

export function buildPublicNameCatalog<T extends CatalogName>(
    names: readonly T[],
    dayKeys: readonly DayKey[],
): PublicNameCatalog {
    const all = names.map((_, index) => index);
    const byInitial: Record<string, number[]> = {};
    const byDay = Object.fromEntries(dayKeys.map((day) => [day, [] as number[]])) as Record<DayKey, number[]>;
    const byGender: Record<CatalogGender | 'all', number[]> = {
        all,
        male: [],
        female: [],
        neutral: [],
    };
    const genders: Record<CatalogGender, number> = { male: 0, female: 0, neutral: 0 };
    const days = Object.fromEntries(dayKeys.map((day) => [day, 0])) as Record<DayKey, number>;
    let withPronunciation = 0;
    let withMeaning = 0;
    let latestCreatedAt: string | undefined;

    names.forEach((item, index) => {
        const initial = getFirstThaiConsonant(item.name);
        if (initial) addToBucket(byInitial, initial, index);

        genders[item.gender] += 1;
        if (item.gender === 'neutral') {
            byGender.neutral.push(index);
            byGender.male.push(index);
            byGender.female.push(index);
        } else {
            byGender[item.gender].push(index);
        }

        for (const day of item.suitableDays) {
            byDay[day].push(index);
            days[day] += 1;
        }

        if (item.pronunciation) withPronunciation += 1;
        if (item.meaning) withMeaning += 1;
        if (item.createdAt && (!latestCreatedAt || Date.parse(item.createdAt) > Date.parse(latestCreatedAt))) {
            latestCreatedAt = item.createdAt;
        }
    });

    for (const initial of Object.keys(byInitial)) {
        byInitial[initial] = sortSearchNamesByNewest(
            byInitial[initial].map((index) => ({ index, ...names[index] })),
        ).map((item) => item.index);
    }

    return {
        all,
        byInitial,
        byDay,
        byGender,
        facets: {
            genders,
            initials: Object.keys(byInitial).sort((left, right) => left.localeCompare(right, 'th')),
            days,
        },
        quality: { withPronunciation, withMeaning, latestCreatedAt },
    };
}

export function selectPublicNameCandidates<T extends CatalogName>(
    names: readonly T[],
    catalog: PublicNameCatalog,
    filters: PublicNameCatalogFilters,
): T[] {
    const buckets: number[][] = [];
    if (filters.initial !== 'all') buckets.push(catalog.byInitial[filters.initial] ?? []);
    if (filters.day !== 'all') buckets.push(catalog.byDay[filters.day] ?? []);
    if (filters.gender !== 'all') buckets.push(catalog.byGender[filters.gender]);

    const sourceIndexes = buckets.length > 0
        ? buckets.reduce((smallest, bucket) => bucket.length < smallest.length ? bucket : smallest)
        : catalog.all;

    const filtered = sourceIndexes.map((index) => names[index]).filter((item) => {
        if (filters.initial !== 'all' && getFirstThaiConsonant(item.name) !== filters.initial) return false;
        if (filters.day !== 'all' && !item.suitableDays.includes(filters.day)) return false;
        if (filters.gender === 'male' && item.gender !== 'male' && item.gender !== 'neutral') return false;
        if (filters.gender === 'female' && item.gender !== 'female' && item.gender !== 'neutral') return false;
        if (filters.gender === 'neutral' && item.gender !== 'neutral') return false;
        return true;
    });

    return filters.initial === 'all' ? filtered : sortSearchNamesByNewest(filtered);
}
