import { describe, expect, test, vi } from 'vitest';

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => null),
}));

describe('/api/public/compare-names-views', () => {
  test('uses a rolling 24-hour window', async () => {
    const { getWindowStart } = await import('./route');

    expect(getWindowStart(new Date('2026-10-31T12:00:00.000Z')))
      .toBe('2026-10-30T12:00:00.000Z');
  });

  test('returns a cacheable zero fallback when analytics is unavailable', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', '');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', '');

    const { GET } = await import('./route');
    const response = await GET();
    const payload = await response.json();

    expect(payload).toEqual({ success: true, count: 0, windowHours: 24 });
    expect(response.headers.get('Cache-Control')).toContain('s-maxage=60');
    expect(response.headers.get('Cache-Control')).toContain('stale-while-revalidate=300');
  });
});
