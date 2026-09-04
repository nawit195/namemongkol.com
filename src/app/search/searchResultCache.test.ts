import { describe, expect, it } from 'vitest';
import {
    createPublicNamesRequestUrl,
    createSearchResultCacheKey,
    SearchResultLruCache,
} from './searchResultCache';

describe('search result session cache', () => {
    it('creates a stable key for one filter and page combination', () => {
        expect(createSearchResultCacheKey({ day: 'monday', gender: 'male', initial: 'ก' }, 2))
            .toBe('pronunciation-evidence-v3|monday|male|ก|2');
    });

    it('returns cached results and refreshes their LRU position', () => {
        const cache = new SearchResultLruCache<number>(2);
        cache.set('first', 1);
        cache.set('second', 2);
        expect(cache.get('first')).toBe(1);
        cache.set('third', 3);

        expect(cache.get('second')).toBeUndefined();
        expect(cache.get('first')).toBe(1);
        expect(cache.get('third')).toBe(3);
        expect(cache.size).toBe(2);
    });

    it('uses the pre-rendered endpoint for a first-page initial-only filter', () => {
        expect(createPublicNamesRequestUrl({ day: 'all', gender: 'all', initial: 'ฉ' }, 1))
            .toBe('/api/public/name-initials/%E0%B8%89?v=pronunciation-evidence-v3');
    });

    it('keeps combined filters and later pages on the dynamic endpoint', () => {
        expect(createPublicNamesRequestUrl({ day: 'monday', gender: 'all', initial: 'ก' }, 1))
            .toContain('/api/public/names?');
        expect(createPublicNamesRequestUrl({ day: 'all', gender: 'male', initial: 'ก' }, 1))
            .toContain('/api/public/names?');
        expect(createPublicNamesRequestUrl({ day: 'all', gender: 'all', initial: 'ก' }, 2))
            .toContain('/api/public/names?');
    });
});
