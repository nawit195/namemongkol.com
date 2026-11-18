import { beforeEach, expect, test, vi } from 'vitest';

const state = vi.hoisted(() => ({
    cache: new Map<string, unknown>(), count: true, active: 0, maxActive: 0, pages: [] as number[],
}));
vi.mock('server-only', () => ({}));
vi.mock('next/cache', () => ({ unstable_cache: (fn: (...args: unknown[]) => Promise<unknown>) => async (...args: unknown[]) => {
    const key = JSON.stringify(args);
    if (!state.cache.has(key)) state.cache.set(key, await fn(...args));
    return state.cache.get(key);
} }));
vi.mock('@/utils/nameAnalysis', async importOriginal => {
    const actual = await importOriginal<typeof import('@/utils/nameAnalysis')>();
    return { ...actual, analyzeName: vi.fn(actual.analyzeName) };
});
vi.mock('@supabase/supabase-js', () => ({ createClient: () => ({ from: () => ({ select: () => ({ order: () => ({
    range: async (from: number, to: number) => {
        state.pages.push(from);
        state.maxActive = Math.max(state.maxActive, ++state.active);
        await new Promise(resolve => setTimeout(resolve, 0));
        state.active--;
        return {
            data: Array.from({ length: 2305 }, (_, index) => ({ name: `กมล${index}`, gender: 'neutral', meaning: 'ใจ' })).slice(from, to + 1),
            error: null, count: state.count ? 2305 : undefined,
        };
    },
}) }) }) }) }));

import { queryPublicNames } from './publicNames';
import { analyzeName } from '@/utils/nameAnalysis';

beforeEach(() => {
    state.cache.clear(); state.pages = []; state.count = true; state.active = 0; state.maxActive = 0;
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-only');
    vi.mocked(analyzeName).mockClear();
});

test('reads remaining pages concurrently and reuses calculations across rotation seeds', async () => {
    const first = await queryPublicNames({ initial: 'ก', featuredSeed: 'first' });
    const calculations = vi.mocked(analyzeName).mock.calls.length;
    const second = await queryPublicNames({ initial: 'ก', featuredSeed: 'second' });
    expect(state.pages).toEqual([0, 1000, 2000]);
    expect(state.maxActive).toBe(2);
    expect(calculations).toBe(2305);
    expect(analyzeName).toHaveBeenCalledTimes(calculations);
    expect(first.total).toBe(2305);
    expect(second.total).toBe(first.total);
    expect(second.data).toEqual(first.data);
    expect(second.summary).toEqual(first.summary);
    expect(second.featuredData).not.toEqual(first.featuredData);
    expect(new Set(second.featuredData.map(item => item.name)).size).toBe(10);
});

test('continues paging safely when an older database response omits the count', async () => {
    state.count = false;
    const result = await queryPublicNames({ initial: 'ก', page: 47, limit: 50 });
    expect(result.total).toBe(2305);
    expect(result.data).toHaveLength(5);
    expect(state.pages).toEqual([0, 1000, 2000]);
    expect(state.maxActive).toBe(1);
});
