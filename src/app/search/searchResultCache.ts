export type SearchFilterState = {
    day: string;
    gender: string;
    initial: string;
};

const SEARCH_DATA_VERSION = 'server-randomized-v6-english-review';

export function createSearchResultCacheKey(
    filters: SearchFilterState,
    page: number,
    featuredSeed?: string,
): string {
    return `${SEARCH_DATA_VERSION}|${filters.day}|${filters.gender}|${filters.initial}|${page}|${featuredSeed ?? 'canonical'}`;
}

export function createPublicNamesRequestUrl(
    filters: SearchFilterState,
    page: number,
    featuredSeed?: string,
): string {
    const isStaticInitialRequest = page === 1
        && filters.day === 'all'
        && filters.gender === 'all'
        && filters.initial !== 'all';

    if (isStaticInitialRequest) {
        const params = new URLSearchParams({ v: SEARCH_DATA_VERSION });
        if (featuredSeed) params.set('seed', featuredSeed);
        return `/api/public/name-initials/${encodeURIComponent(filters.initial)}?${params.toString()}`;
    }

    const params = new URLSearchParams({
        v: SEARCH_DATA_VERSION,
        day: filters.day,
        gender: filters.gender,
        initial: filters.initial,
        page: String(page),
        limit: '50',
    });
    if (featuredSeed) params.set('seed', featuredSeed);
    return `/api/public/names?${params.toString()}`;
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

/** A foreground click can reuse an in-flight prefetch for the same result. */
export class SearchRequestDeduplicator<T> {
    private readonly pending = new Map<string, { request: Promise<T>; signal?: AbortSignal }>();

    run(key: string, load: () => Promise<T>, signal?: AbortSignal): Promise<T> {
        const existing = this.pending.get(key);
        if (existing && !existing.signal?.aborted) return existing.request;
        const request = Promise.resolve().then(load);
        this.pending.set(key, { request, signal });
        const clear = () => { if (this.pending.get(key)?.request === request) this.pending.delete(key); };
        void request.then(clear, clear);
        return request;
    }
}
