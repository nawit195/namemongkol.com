import { describe, expect, test, vi } from 'vitest';

vi.mock('@supabase/supabase-js', () => ({
    createClient: vi.fn(() => null),
}));

describe('/api/live-stats', () => {
    test('returns cacheable headers for budget-friendly public stats', async () => {
        vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '');
        vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', '');
        vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', '');

        const { GET } = await import('./route');
        const response = await GET();

        expect(response.headers.get('Cache-Control')).toContain('s-maxage=600');
        expect(response.headers.get('Cache-Control')).toContain('stale-while-revalidate=1800');
    });
});
