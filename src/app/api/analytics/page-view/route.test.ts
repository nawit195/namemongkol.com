import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('server-only', () => ({}));
const mocks = vi.hoisted(() => ({ upsert: vi.fn(), rpc: vi.fn(), rate: vi.fn(), role: 'admin', user: { id: 'admin', is_anonymous: false } as { id: string; is_anonymous: boolean } | null, profileError: null as object | null }));
vi.mock('@/lib/pageTrafficRateLimit', () => ({ checkPageTrafficRateLimit: mocks.rate }));
vi.mock('@supabase/supabase-js', () => ({ createClient: () => ({ from: () => ({ upsert: mocks.upsert }), rpc: mocks.rpc }) }));
vi.mock('@/utils/supabaseServer', () => ({ createClient: async () => ({ auth: { getUser: async () => ({ data: { user: mocks.user }, error: null }) }, from: () => { const q = { select: () => q, eq: () => q, maybeSingle: async () => ({ data: { role: mocks.role }, error: mocks.profileError }) }; return q; } }) }));
import { POST } from './route';
import { GET } from '@/app/api/admin/page-traffic/route';

const input = { path: '/nicknames?name=private', eventId: '10000000-0000-4000-8000-000000000001', visitorId: '20000000-0000-4000-8000-000000000001' };
const request = (body: unknown = input, headers: Record<string, string> = {}) => new Request('https://www.namemongkol.com/api/analytics/page-view', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://www.namemongkol.com', 'user-agent': 'Mozilla/5.0', ...headers }, body: JSON.stringify(body) });
const report = { rows: [], daily: [], total: 0, page: 1, pageSize: 50, summary: { views: 0, visitorDays: 0, pages: 0 } };
beforeEach(() => { vi.clearAllMocks(); vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co'); vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'traffic-test-key'); vi.stubEnv('VERCEL_ENV', 'production'); mocks.user = { id: 'admin', is_anonymous: false }; mocks.role = 'admin'; mocks.profileError = null; mocks.rate.mockReturnValue({ allowed: true, retryAfter: 0 }); mocks.upsert.mockResolvedValue({ error: null }); mocks.rpc.mockResolvedValue({ data: report, error: null }); });
afterEach(() => vi.unstubAllEnvs());
describe('page view ingestion', () => {
    it('accepts anonymous visitors using only server dates, canonical paths and a one-way hash', async () => {
        const response = await POST(request()); expect(response.status).toBe(204);
        expect(response.headers.get('cache-control')).toContain('no-store');
        const [row, options] = mocks.upsert.mock.calls[0];
        expect(row.page_path).toBe('/nicknames'); expect(row.visit_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(row.visitor_hash).toMatch(/^[a-f0-9]{64}$/); expect(JSON.stringify(row)).not.toContain(input.visitorId);
        expect(options).toEqual({ onConflict: 'event_id', ignoreDuplicates: true });
    });
    it('rejects forged identity/date fields and cross-origin writes, and ignores bots/admin/opt-outs', async () => {
        expect((await POST(request({ ...input, visit_date: '2000-01-01' }))).status).toBe(400);
        expect((await POST(request(input, { origin: 'https://evil.test' }))).status).toBe(403);
        expect((await POST(request({ ...input, visitorId: 'bad' }))).status).toBe(400);
        const ignoredHeaders: Record<string, string>[] = [{ dnt: '1' }, { 'sec-gpc': '1' }, { 'user-agent': 'Googlebot' }];
        for (const headers of ignoredHeaders) expect((await POST(request(input, headers))).status).toBe(204);
        expect((await POST(request({ ...input, path: '/admin' }))).status).toBe(204);
        expect(mocks.upsert).not.toHaveBeenCalled();
    });
    it('reports a database failure instead of acknowledging a lost event', async () => {
        mocks.upsert.mockResolvedValue({ error: { code: '42P01' } }); expect((await POST(request())).status).toBe(503);
    });
    it('returns bounded rate-limit rejection before reading the body or writing to the database', async () => {
        mocks.rate.mockReturnValue({ allowed: false, retryAfter: 10 });
        const req = request();
        const reader = vi.spyOn(req.body!, 'getReader');
        const response = await POST(req);
        expect(response.status).toBe(429);
        expect(response.headers.get('retry-after')).toBe('10');
        expect(response.headers.get('cache-control')).toContain('no-store');
        expect(reader).not.toHaveBeenCalled(); expect(mocks.upsert).not.toHaveBeenCalled();
    });
    it('rejects a declared oversize body before reading it, and counts UTF-8 bytes for undeclared bodies', async () => {
        const oversized = request(input, { 'content-length': '2049' });
        const reader = vi.spyOn(oversized.body!, 'getReader');
        expect((await POST(oversized)).status).toBe(413);
        expect(reader).not.toHaveBeenCalled(); expect(mocks.rate).not.toHaveBeenCalled();
        const unicode = { ...input, path: '/' + 'ก'.repeat(700) };
        expect(JSON.stringify(unicode).length).toBeLessThan(2048);
        expect((await POST(request(unicode))).status).toBe(413);
        expect(mocks.upsert).not.toHaveBeenCalled();
    });
    it('stops an oversize stream at the byte limit and rejects malformed UTF-8 without a write', async () => {
        const cancel = vi.fn();
        let reads = 0;
        const stream = new ReadableStream<Uint8Array>({
            pull(controller) { reads++; controller.enqueue(new Uint8Array(1100)); }, cancel,
        }, { highWaterMark: 0 });
        const init: RequestInit & { duplex: 'half' } = { method: 'POST', headers: { 'content-type': 'application/json' }, body: stream, duplex: 'half' };
        expect((await POST(new Request('https://www.namemongkol.com/api/analytics/page-view', init))).status).toBe(413);
        expect(reads).toBe(2); expect(cancel).toHaveBeenCalledTimes(1);
        expect((await POST(new Request('https://www.namemongkol.com/api/analytics/page-view', { method: 'POST', headers: { 'content-type': 'application/json' }, body: new Uint8Array([0xff]) }))).status).toBe(400);
        expect(mocks.upsert).not.toHaveBeenCalled();
    });
    it('accepts a valid JSON body split across a multibyte UTF-8 character boundary', async () => {
        const bytes = new TextEncoder().encode(JSON.stringify({ ...input, path: '/articles/ก' }));
        const split = bytes.indexOf(0xe0) + 1;
        const stream = new ReadableStream<Uint8Array>({ start(controller) { controller.enqueue(bytes.slice(0, split)); controller.enqueue(bytes.slice(split)); controller.close(); } });
        const init: RequestInit & { duplex: 'half' } = { method: 'POST', headers: { 'content-type': 'application/json' }, body: stream, duplex: 'half' };
        expect((await POST(new Request('https://www.namemongkol.com/api/analytics/page-view', init))).status).toBe(204);
        expect(mocks.upsert.mock.calls[0][0].page_path).toBe('/articles/ก');
    });
});
describe('page traffic report authorization', () => {
    const url = 'https://www.namemongkol.com/api/admin/page-traffic';
    it('requires verified admin access and does not allow forged query roles', async () => {
        mocks.user = null; expect((await GET(new Request(url))).status).toBe(401);
        mocks.user = { id: 'member', is_anonymous: true }; expect((await GET(new Request(url))).status).toBe(401);
        mocks.user.is_anonymous = false; mocks.role = 'member'; expect((await GET(new Request(url+'?role=admin'))).status).toBe(403);
        expect(mocks.rpc).not.toHaveBeenCalled();
    });
    it('validates date bounds, returns exact aggregated results privately and fails closed on bad DB data', async () => {
        expect((await GET(new Request(url+'?from=2020-01-01&to=2020-03-01'))).status).toBe(400);
        const response = await GET(new Request(url+'?from=2020-01-01&to=2020-01-02&q=%2Fnicknames'));
        expect(response.status).toBe(200); expect(response.headers.get('cache-control')).toContain('no-store'); expect(response.headers.get('vary')).toBe('Cookie');
        expect(mocks.rpc).toHaveBeenCalledWith('admin_page_traffic', { p_from: '2020-01-01', p_to: '2020-01-02', p_search: '/nicknames', p_page: 1 });
        mocks.rpc.mockResolvedValue({ data: {}, error: null }); expect((await GET(new Request(url))).status).toBe(503);
    });
});
