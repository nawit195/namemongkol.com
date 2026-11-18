import { afterEach, expect, test, vi } from 'vitest';
vi.mock('server-only', () => ({}));
vi.mock('next/cache', () => ({ unstable_cache: (fn: unknown) => fn }));
vi.mock('@supabase/supabase-js', () => ({ createClient: () => ({ from: (table: string) => ({
    select: (selection: string) => ({ order: () => ({ range: async (from: number, to: number) => {
        const columns = selection.split(',').map(x => x.trim());
        const absent = columns.find(x => ['pronunciation_variants', 'pronunciation_draft'].includes(x));
        if (absent) return { data: null, error: { code: '42703', message: `column ${absent} does not exist` } };
        const rows = ['กซ่อน', 'กปฏิเสธ', 'กตรวจแล้ว'].map((name, i) => table === 'premium_names'
            ? { name, pronunciation: 'ใหม่', meaning: 'ใหม่', english_name: 'NEW', pronunciation_status: 'pending', meaning_status: 'pending' }
            : { name, gender: 'neutral', pronunciation: 'กาน', meaning: 'ความหมายเดิม', english_name: 'OLD', pronunciation_status: i === 1 ? 'rejected' : 'approved', meaning_status: i === 1 ? 'rejected' : 'approved', publication_status: i === 0 ? 'hidden' : 'published', created_at: null });
        return { data: rows.slice(from, to + 1).map(row => Object.fromEntries(columns.map(column => [column, row[column as keyof typeof row]]))), error: null };
    } }) }),
}) }) }));
import { fetchAllPublicNames } from './publicNames';
import { fetchPublicPremiumNameDetails } from './premiumNameDetails';
afterEach(() => vi.unstubAllEnvs());
test('missing draft/variant columns never discard existing hidden or rejected states in either catalog', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-only');
    const publicRows = await fetchAllPublicNames();
    expect(publicRows.some(x => x.name === 'กซ่อน')).toBe(false);
    expect(publicRows.find(x => x.name === 'กปฏิเสธ')).toMatchObject({ pronunciation: undefined, meaning: undefined, meaningStatus: 'rejected' });
    const premiumRows = await fetchPublicPremiumNameDetails();
    expect(premiumRows.some(x => x.name === 'กซ่อน')).toBe(false);
    expect(premiumRows.find(x => x.name === 'กปฏิเสธ')).toMatchObject({ pronunciation: undefined, meaning: undefined, pronunciationStatus: 'rejected', meaningStatus: 'rejected' });
    expect(premiumRows.find(x => x.name === 'กตรวจแล้ว')?.meaning).toBe('ความหมายเดิม');
});
