import { describe, expect, it } from 'vitest';
import { createSearchResultCacheKey, SearchResultLruCache } from './searchResultCache';

describe('search result session cache', () => {
    it('creates a stable key for one filter and page combination', () => {
        expect(createSearchResultCacheKey({ day: 'monday', gender: 'male', initial: 'ก' }, 2))
            .toBe('monday|male|ก|2');
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
});
