import { describe, expect, test, vi } from 'vitest';

vi.mock('@supabase/supabase-js', () => ({
    createClient: vi.fn(() => null),
}));

describe('/api/live-stats', () => {
    test('returns no-store cache headers for near realtime stats', async () => {
        vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '');
        vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', '');
        vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', '');

        const { GET } = await import('./route');
        const response = await GET();

        expect(response.headers.get('Cache-Control')).toBe('no-store, max-age=0');
    });
});
