import { afterEach, expect, test, vi } from 'vitest';
const state = vi.hoisted(() => ({ value: '2026-11-17T05:00:00+00:00', error: false }));
vi.mock('server-only', () => ({}));
vi.mock('next/cache', () => ({ unstable_cache: (fn: unknown) => fn }));
vi.mock('@supabase/supabase-js', () => ({ createClient: () => ({ from: () => ({ select: () => ({ order: () => ({
    limit: async () => ({ data: [{ created_at: state.value }], error: state.error ? { message: 'unavailable' } : null }),
}) }) }) }) }));
import { fetchPremiumLatestAddedAt } from './premiumNameDetails';
afterEach(() => { vi.unstubAllEnvs(); state.error = false; });
test('reads a catalog timestamp and handles unavailable or invalid metadata without failing names', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-only');
    expect(await fetchPremiumLatestAddedAt()).toBe('2026-11-17T05:00:00.000Z');
    state.error = true;
    expect(await fetchPremiumLatestAddedAt()).toBeNull();
    state.error = false;
    state.value = 'invalid';
    expect(await fetchPremiumLatestAddedAt()).toBeNull();
});
