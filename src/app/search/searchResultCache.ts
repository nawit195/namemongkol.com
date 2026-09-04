export type SearchFilterState = {
    day: string;
    gender: string;
    initial: string;
};

const SEARCH_DATA_VERSION = 'pronunciation-evidence-v3';

export function createSearchResultCacheKey(filters: SearchFilterState, page: number): string {
    return `${SEARCH_DATA_VERSION}|${filters.day}|${filters.gender}|${filters.initial}|${page}`;
}

export function createPublicNamesRequestUrl(filters: SearchFilterState, page: number): string {
    const isStaticInitialRequest = page === 1
        && filters.day === 'all'
        && filters.gender === 'all'
        && filters.initial !== 'all';

    if (isStaticInitialRequest) {
        return `/api/public/name-initials/${encodeURIComponent(filters.initial)}?v=${SEARCH_DATA_VERSION}`;
    }

    return `/api/public/names?${new URLSearchParams({
        v: SEARCH_DATA_VERSION,
        day: filters.day,
        gender: filters.gender,
        initial: filters.initial,
        page: String(page),
        limit: '50',
    }).toString()}`;
}

export class SearchResultLruCache<T> {
    private readonly entries = new Map<string, T>();

    constructor(private readonly maxEntries = 30) {}

    get(key: string): T | undefined {
        const value = this.entries.get(key);
        if (value === undefined) return undefined;
        this.entries.delete(key);
        this.entries.set(key, value);
        return value;
    }

    set(key: string, value: T) {
        this.entries.delete(key);
        this.entries.set(key, value);

        while (this.entries.size > this.maxEntries) {
            const oldestKey = this.entries.keys().next().value;
            if (oldestKey === undefined) break;
            this.entries.delete(oldestKey);
        }
    }

    get size() {
        return this.entries.size;
    }
}
