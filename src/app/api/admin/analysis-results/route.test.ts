import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ getUser: vi.fn(), getProfile: vi.fn(), createService: vi.fn(), rpc: vi.fn() }));
vi.mock('@/utils/supabaseServer', () => ({
    createClient: vi.fn(async () => ({
        auth: { getUser: mocks.getUser },
        from: vi.fn(() => ({ select: vi.fn(() => ({ eq: vi.fn(() => ({ maybeSingle: mocks.getProfile })) })) })),
    })),
}));
vi.mock('@supabase/supabase-js', () => ({ createClient: mocks.createService }));
import { GET } from './route';

const request = (query = '') => new Request(`http://localhost/api/admin/analysis-results${query}`);
beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-service-secret');
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'admin-1' } }, error: null });
    mocks.getProfile.mockResolvedValue({ data: { role: 'admin' }, error: null });
    mocks.createService.mockReturnValue({ rpc: mocks.rpc });
    mocks.rpc.mockResolvedValue({ data: { names: ['กานต์'], total: 1 }, error: null });
});
afterEach(() => vi.unstubAllEnvs());

describe('admin analyzed names API', () => {
    test.each(['', '?format=csv'])('rejects unauthenticated requests before accessing the service client: %s', async (query) => {
        mocks.getUser.mockResolvedValue({ data: { user: null }, error: null });
        const response = await GET(request(query));
        expect(response.status).toBe(401);
        expect(response.headers.get('Cache-Control')).toBe('private, no-store');
        expect(mocks.createService).not.toHaveBeenCalled();
    });
    test.each(['', '?format=csv'])('rejects ordinary users and does not call the RPC: %s', async (query) => {
        mocks.getProfile.mockResolvedValue({ data: { role: 'user' }, error: null });
        expect((await GET(request(query))).status).toBe(403);
        expect(mocks.rpc).not.toHaveBeenCalled();
    });
    test('fails closed when the profile cannot be verified', async () => {
        mocks.getProfile.mockResolvedValue({ data: { role: 'admin' }, error: { code: 'offline' } });
        expect((await GET(request())).status).toBe(503);
        expect(mocks.rpc).not.toHaveBeenCalled();
    });
    test('validates query input before creating a service client', async () => {
        expect((await GET(request('?page=-1'))).status).toBe(400);
        expect(mocks.createService).not.toHaveBeenCalled();
    });
    test('returns only first names and accurate pagination from the database', async () => {
        mocks.rpc.mockResolvedValue({ data: { names: ['ณัฐ'], total: 2501, surname: 'private', key: 'test-service-secret' }, error: null });
        const response = await GET(request(`?page=2&search=${encodeURIComponent('ณัฐ')}`));
        expect(mocks.rpc).toHaveBeenCalledWith('admin_analysis_result_names', { p_search: 'ณัฐ', p_page: 2, p_page_size: 50, p_export: false });
        expect(response.headers.get('Cache-Control')).toBe('private, no-store');
        expect(await response.json()).toEqual({ success: true, names: ['ณัฐ'], total: 2501, page: 2, pageSize: 50, totalPages: 51 });
    });
    test('exports more than 1000 names in one snapshot for the current search, ignoring pagination', async () => {
        const names = Array.from({ length: 1501 }, (_, index) => `ชื่อ${index}`);
        mocks.rpc.mockResolvedValue({ data: { names, total: names.length }, error: null });
        const response = await GET(request(`?format=csv&search=${encodeURIComponent('ชื่อ')}`));
        expect(mocks.rpc).toHaveBeenCalledWith('admin_analysis_result_names', { p_search: 'ชื่อ', p_page: 1, p_page_size: 50, p_export: true });
        expect(response.headers.get('Content-Type')).toBe('text/csv; charset=utf-8');
        expect(response.headers.get('Content-Disposition')).toMatch(/attachment; filename="analyzed-names-.*\.csv"/);
        const bytes = new Uint8Array(await response.arrayBuffer());
        expect([...bytes.slice(0, 3)]).toEqual([0xef, 0xbb, 0xbf]);
        const csv = new TextDecoder().decode(bytes);
        expect(csv).toContain('"ชื่อ1500"');
        expect(csv.split('\r\n')).toHaveLength(1503);
        expect(csv).not.toContain('test-service-secret');
    });
    test('does not silently export a truncated result', async () => {
        mocks.rpc.mockResolvedValue({ data: { names: ['กานต์'], total: 1501 }, error: null });
        expect((await GET(request('?format=csv'))).status).toBe(503);
    });
    test('distinguishes a missing migration from an empty table', async () => {
        mocks.rpc.mockResolvedValue({ data: null, error: { code: 'PGRST202', message: 'database internals' } });
        const response = await GET(request());
        expect(response.status).toBe(503);
        const body = await response.json();
        expect(body.code).toBe('MIGRATION_REQUIRED');
        expect(body.error).not.toContain('database internals');
    });
    test('returns an explicit configuration error when service credentials are absent', async () => {
        vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', '');
        const response = await GET(request());
        expect(response.status).toBe(503);
        expect((await response.json()).code).toBe('CONFIGURATION_REQUIRED');
        expect(mocks.rpc).not.toHaveBeenCalled();
    });
    test('represents no matches as an empty list, not as a setup error', async () => {
        mocks.rpc.mockResolvedValue({ data: { names: [], total: 0 }, error: null });
        const response = await GET(request('?search=missing'));
        expect(response.status).toBe(200);
        expect(await response.json()).toMatchObject({ names: [], total: 0, totalPages: 1 });
    });
});
