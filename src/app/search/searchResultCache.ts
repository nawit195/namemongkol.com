export type SearchFilterState = {
    day: string;
    gender: string;
    initial: string;
};

export function createSearchResultCacheKey(filters: SearchFilterState, page: number): string {
    return `${filters.day}|${filters.gender}|${filters.initial}|${page}`;
}

export function createPublicNamesRequestUrl(filters: SearchFilterState, page: number): string {
    const isStaticInitialRequest = page === 1
        && filters.day === 'all'
        && filters.gender === 'all'
        && filters.initial !== 'all';

    if (isStaticInitialRequest) {
        return `/api/public/name-initials/${encodeURIComponent(filters.initial)}`;
    }

    return `/api/public/names?${new URLSearchParams({
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
