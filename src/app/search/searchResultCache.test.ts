import { describe, expect, it, vi } from 'vitest';
import {
    createPublicNamesRequestUrl,
    createSearchResultCacheKey,
    SearchResultLruCache,
    SearchRequestDeduplicator,
} from './searchResultCache';

describe('search result session cache', () => {
    it('does not reuse a request cancelled by a previous filter selection', async () => {
        const requests = new SearchRequestDeduplicator<number>();
        const controller = new AbortController();
        const old = requests.run('filter', async () => 1, controller.signal);
        controller.abort();
        const current = requests.run('filter', async () => 2);
        expect(current).not.toBe(old);
        await expect(current).resolves.toBe(2);
    });
    it('shares a pending next-page prefetch with a click and permits retry after failure', async () => {
        const requests = new SearchRequestDeduplicator<number>();
        let resolve!: (value: number) => void;
        const load = vi.fn(() => new Promise<number>(done => { resolve = done; }));
        const prefetched = requests.run('next-seed', load);
        const clicked = requests.run('next-seed', load);
        expect(clicked).toBe(prefetched);
        await Promise.resolve();
        expect(load).toHaveBeenCalledTimes(1);
        resolve(10);
        await expect(clicked).resolves.toBe(10);
        await expect(requests.run('next-seed', async () => 20)).resolves.toBe(20);
        await expect(requests.run('error', async () => { throw new Error('offline'); })).rejects.toThrow('offline');
        await expect(requests.run('error', async () => 30)).resolves.toBe(30);
    });
    it('creates a stable key for one filter and page combination', () => {
        expect(createSearchResultCacheKey({ day: 'monday', gender: 'male', initial: 'ก' }, 2))
            .toBe('server-randomized-v6-english-review|monday|male|ก|2|canonical');
        expect(createSearchResultCacheKey({ day: 'monday', gender: 'male', initial: 'ก' }, 1, 'session-1'))
            .toBe('server-randomized-v6-english-review|monday|male|ก|1|session-1');
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
            .toBe('/api/public/name-initials/%E0%B8%89?v=server-randomized-v6-english-review');
        expect(createPublicNamesRequestUrl({ day: 'all', gender: 'all', initial: 'ฉ' }, 1, 'session-1'))
            .toBe('/api/public/name-initials/%E0%B8%89?v=server-randomized-v6-english-review&seed=session-1');
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
