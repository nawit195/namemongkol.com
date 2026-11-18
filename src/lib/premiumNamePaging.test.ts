import { afterEach, expect, test, vi } from 'vitest';
const state = vi.hoisted(() => ({ details: true, english: true, pages: [] as string[] }));
vi.mock('server-only', () => ({}));
vi.mock('next/cache', () => ({ unstable_cache: (fn: unknown) => fn }));
vi.mock('@supabase/supabase-js', () => ({ createClient: () => ({ from: (table: string) => ({
    select: (columns: string) => ({ order: () => ({ range: async (from: number, to: number) => {
        const allowed = table === 'premium_names'
            ? ['name', ...(state.details ? ['pronunciation', 'meaning', 'english_name', 'pronunciation_status', 'meaning_status'] : [])]
            : ['name', 'pronunciation', 'meaning', 'meaning_status', ...(state.english ? ['english_name'] : [])];
        const missing = columns.split(',').map(x => x.trim()).find(x => !allowed.includes(x));
        if (missing) return { data: null, error: { code: '42703', message: `column ${missing} does not exist` } };
        state.pages.push(`${table}:${from}`);
        return { data: Array.from({ length: 1205 }, (_, i) => table === 'premium_names'
            ? { name: `กานต์${i}`, ...(state.details ? { english_name: `KANT-${i}`, pronunciation: 'กาน', pronunciation_status: 'pending', meaning: 'จากไฟล์', meaning_status: 'pending' } : {}) }
            : { name: `กานต์${i}`, meaning: 'ข้อมูลเดิม', meaning_status: 'approved', english_name: state.english ? `SHARED-${i}` : undefined }).slice(from, to + 1), error: null };
    } }) }),
}) }) }));
import { fetchPublicPremiumNameDetails, fetchPremiumPublishedCount } from './premiumNameDetails';
afterEach(() => { vi.unstubAllEnvs(); });
test.each([true, false])('reads all pages and supports pre-migration schemas, details=%s', async (details) => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-only');
    state.details = details;
    state.english = details;
    state.pages = [];
    const result = await fetchPublicPremiumNameDetails();
    expect(result).toHaveLength(1205);
    expect(result[1204]).toMatchObject({ meaning: 'ข้อมูลเดิม', meaningStatus: 'approved' });
    expect(result[1204].englishName).toBe(details ? 'SHARED-1204' : undefined);
    expect(state.pages).toEqual(['premium_names:0', 'premium_names:1000', 'auspicious_names:0', 'auspicious_names:1000']);
    expect(await fetchPremiumPublishedCount()).toBe(1205);
});
