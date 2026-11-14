import { afterEach, beforeEach, expect, test, vi } from 'vitest';

const state = vi.hoisted(() => ({
    rows: [] as Record<string, unknown>[],
    error: null as { message: string } | null,
    clientKeys: [] as string[],
}));
vi.mock('server-only', () => ({}));
vi.mock('next/cache', () => ({ unstable_cache: (fn: unknown) => fn }));
vi.mock('@supabase/supabase-js', () => ({ createClient: (_url: string, key: string) => {
    state.clientKeys.push(key);
    return { from: () => ({ select: () => ({ order: () => ({ range: async () => ({ data: state.rows, error: state.error }) }) }) }) };
} }));
import { queryPublicNames } from './publicNames';

beforeEach(() => {
    state.rows = [{ name: 'กมล', gender: 'neutral', pronunciation: 'กะ-มน', meaning: 'ใจ' }];
    state.error = null;
    state.clientKeys = [];
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'public-test-key');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', '');
    vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks(); });

test('identifies the 84-name curated fallback when configuration is absent', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '');
    const result = await queryPublicNames();
    expect(result.dataSource).toBe('fallback');
    expect(result.total).toBe(84);
    expect(state.clientKeys).toHaveLength(0);
});

test('uses the public key when the service key is empty or whitespace', async () => {
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', '  ');
    const result = await queryPublicNames();
    expect(result.dataSource).toBe('database');
    expect(result.total).toBe(31);
    expect(state.clientKeys).toEqual(['public-test-key']);
});

test('retains the preferred service key when configured', async () => {
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'server-test-key');
    expect((await queryPublicNames()).dataSource).toBe('database');
    expect(state.clientKeys).toEqual(['server-test-key']);
});

test.each(['error', 'empty'])('discloses fallback for an %s database response', async mode => {
    state.rows = [];
    state.error = mode === 'error' ? { message: 'Query refused; private diagnostic' } : null;
    const result = await queryPublicNames();
    expect(result.dataSource).toBe('fallback');
    expect(result.total).toBe(84);
    expect(JSON.stringify(result)).not.toContain('private diagnostic');
});

test('a later successful dataset does not inherit an earlier fallback source', async () => {
    state.error = { message: 'Temporary query failure' };
    const fallback = await queryPublicNames();
    state.error = null;
    const database = await queryPublicNames();
    expect(fallback.dataSource).toBe('fallback');
    expect(database.dataSource).toBe('database');
    expect(fallback.dataSource).toBe('fallback');
});
