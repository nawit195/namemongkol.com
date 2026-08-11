export type SearchFilterState = {
    day: string;
    gender: string;
    initial: string;
};

export function createSearchResultCacheKey(filters: SearchFilterState, page: number): string {
    return `${filters.day}|${filters.gender}|${filters.initial}|${page}`;
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
