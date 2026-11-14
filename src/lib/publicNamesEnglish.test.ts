import { afterEach, expect, test, vi } from 'vitest';
const state = vi.hoisted(() => ({ columns: new Set<string>(), pages: [] as number[] }));
vi.mock('server-only', () => ({}));
vi.mock('next/cache', () => ({ unstable_cache: (fn: unknown) => fn }));
vi.mock('@supabase/supabase-js', () => ({ createClient: () => ({ from: () => ({
    select: (columns: string) => ({ order: () => ({ range: async (from: number, to: number) => {
        const missing = columns.split(',').map(x => x.trim()).find(x => !state.columns.has(x));
        if (missing) return { data: null, error: { message: `column ${missing} does not exist` } };
        state.pages.push(from);
        return { data: Array.from({ length: 1005 }, (_, i) => ({ name: `กมล${i}`, english_name: columns.includes('english_name') ? `KAMON-${i}` : undefined, gender: 'neutral', meaning: 'ใจ', meaning_status: 'pending', pronunciation: 'กะ-มน', created_at: null })).slice(from, to + 1), error: null };
    } }) }),
}) }) }));
import { fetchAllPublicNames } from './publicNames';
afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks(); });
test.each([true, false])('preserves English across the 1000-row boundary on legacy review schemas, column present=%s', async (english) => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-only');
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    state.columns = new Set(['name', 'gender', 'pronunciation', 'meaning', 'meaning_status', 'created_at', ...(english ? ['english_name'] : [])]);
    state.pages = [];
    const rows = await fetchAllPublicNames(true);
    const last = rows.find(x => x.name === 'กมล1004');
    expect(last?.englishName).toBe(english ? 'KAMON-1004' : undefined);
    expect(last?.meaningStatus).toBe('pending');
    expect(state.pages).toEqual([0, 1000]);
});
