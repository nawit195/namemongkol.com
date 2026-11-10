import { afterEach, beforeEach, expect, test, vi } from 'vitest';
vi.mock('server-only', () => ({}));
vi.mock('next/cache', () => ({ unstable_cache: (fn: unknown) => fn }));
vi.mock('@supabase/supabase-js', () => ({ createClient: () => ({ from: () => ({
    select: () => ({ order: () => ({ range: async () => ({ data: null, error: { message: 'Simulated database outage' } }) }) }),
}) }) }));
import { fetchAllPublicNames } from './publicNames';

beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-only');
    vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks(); });

test('strict reviewed reads never reintroduce static names after a database failure', async () => {
    await expect(fetchAllPublicNames(true)).rejects.toThrow('Cannot safely load reviewed public names');
    expect((await fetchAllPublicNames()).length).toBeGreaterThan(0); // Existing callers retain their fallback.
});

test('strict reads with no configured source return no published records', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '');
    expect(await fetchAllPublicNames(true)).toEqual([]);
});
