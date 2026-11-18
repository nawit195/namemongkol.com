import { afterEach, expect, test, vi } from 'vitest';
const state = vi.hoisted(() => ({ columns: new Set<string>(), pages: [] as number[], rows: [] as Record<string, unknown>[] }));
vi.mock('server-only', () => ({}));
vi.mock('next/cache', () => ({ unstable_cache: (fn: unknown) => fn }));
vi.mock('@supabase/supabase-js', () => ({ createClient: () => ({ from: () => ({
    select: (columns: string) => ({ order: () => ({ range: async (from: number, to: number) => {
        const missing = columns.split(',').map(x => x.trim()).find(x => !state.columns.has(x));
        if (missing) return { data: null, error: { message: `column ${missing} does not exist` } };
        state.pages.push(from);
        const rows = state.rows.length ? state.rows : Array.from({ length: 1005 }, (_, i) => ({ name: `กมล${i}`, english_name: columns.includes('english_name') ? `KAMON-${i}` : undefined, gender: 'neutral', meaning: 'ใจ', meaning_status: 'pending', pronunciation: 'กะ-มน', created_at: null }));
        const selected = columns.split(',').map(value => value.trim());
        return { data: rows.slice(from, to + 1).map(row => Object.fromEntries(selected.map(column => [column, row[column as keyof typeof row]]))), error: null };
    } }) }),
}) }) }));
import { fetchAllPublicNames } from './publicNames';
afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks(); state.rows = []; });
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

test('publishes suggestions with provenance and hides rejected or stale reading-derived spellings', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-only');
    state.columns = new Set(['name', 'gender', 'meaning', 'created_at', 'pronunciation', 'pronunciation_draft', 'pronunciation_variants', 'pronunciation_status', 'meaning_status', 'publication_status', 'english_name', 'english_name_draft', 'english_name_status', 'english_name_source', 'english_name_reading']);
    const base = { gender: 'neutral', meaning: 'ใจ', pronunciation: 'กะ-มน', english_name: null, english_name_draft: 'Kamon', english_name_source: 'rtgs-reading-v1', english_name_reading: 'กะ-มน', english_name_status: 'pending' };
    state.rows = [
        { ...base, name: 'กมล' },
        { ...base, name: 'กมลใหม่', pronunciation: 'กะ-มน-ใหม่' },
        { ...base, name: 'กมลไม่รับ', english_name_status: 'rejected' },
        { ...base, name: 'กมลไม่รับใหม่', english_name_status: 'rejected', pronunciation: 'changed-after-rejection' },
        { ...base, name: 'กมลอ่านไม่รับ', pronunciation_status: 'rejected' },
        { ...base, name: 'กมลไม่มีที่มา', english_name_reading: null },
        { ...base, name: 'กมลต้นทาง', english_name_source: null, english_name_status: null, english_name: 'KAMOL' },
        { ...base, name: 'กมลต้นทางใหม่', english_name: 'KAMOL-NEW', pronunciation: 'changed-after-draft' },
    ];
    const rows = await fetchAllPublicNames(true);
    expect(rows.find(row => row.name === 'กมล')).toMatchObject({ englishName: 'Kamon', englishNameStatus: 'pending', englishNameSource: 'rtgs-reading-v1' });
    for (const name of ['กมลใหม่', 'กมลไม่รับ', 'กมลไม่รับใหม่', 'กมลอ่านไม่รับ', 'กมลไม่มีที่มา']) expect(rows.find(row => row.name === name)?.englishName).toBeUndefined();
    expect(rows.find(row => row.name === 'กมลไม่รับใหม่')?.englishNameStatus).toBe('rejected');
    expect(rows.find(row => row.name === 'กมลต้นทาง')).toMatchObject({ englishName: 'KAMOL', englishNameStatus: undefined });
    expect(rows.find(row => row.name === 'กมลต้นทางใหม่')).toMatchObject({ englishName: 'KAMOL-NEW', englishNameStatus: undefined, englishNameSource: undefined });
});
