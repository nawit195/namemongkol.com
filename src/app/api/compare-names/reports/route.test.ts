import { beforeEach, describe, expect, test, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ user: { id: 'owner' } as { id: string } | null, rpc: vi.fn(), from: vi.fn(), service: true, history: { data: [], count: 0, error: null } as Record<string, unknown>, profile: { data: { credits: 10 }, error: null }, saved: { data: null, error: null } as Record<string, unknown>, eq: vi.fn() }));
vi.mock('@/lib/comparisonReportServer', async importOriginal => {
    const actual = await importOriginal<typeof import('@/lib/comparisonReportServer')>();
    return { ...actual, reportAuth: vi.fn(async () => ({ user: mocks.user, client: { from: mocks.from } })), reportService: vi.fn(() => mocks.service ? { rpc: mocks.rpc } : null) };
});
import { GET, POST } from './route';
import { GET as getReport } from './[id]/route';
import { buildComparisonSnapshot } from '@/lib/comparisonReport';
const input = { names: ['ปัญญา', 'กานต์'], surname: '', day: 'monday' };
const request = (body: unknown = input, query = '') => new Request(`https://example.test/api/compare-names/reports${query}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
beforeEach(() => {
    vi.clearAllMocks(); mocks.user = { id: 'owner' }; mocks.service = true;
    mocks.history = { data: [], count: 0, error: null }; mocks.saved = { data: null, error: null }; mocks.profile = { data: { credits: 10 }, error: null };
    mocks.from.mockImplementation((table: string) => {
        const chain = { select: vi.fn(() => chain), eq: mocks.eq.mockImplementation(() => chain), order: vi.fn(() => chain), range: vi.fn(async () => mocks.history), maybeSingle: vi.fn(async () => table === 'user_profiles' ? mocks.profile : mocks.saved) };
        return chain;
    });
    mocks.rpc.mockResolvedValue({ data: { status: 'unlocked', remaining_credits: 5, report: { id: 'saved', snapshot: buildComparisonSnapshot(input) } }, error: null });
});
describe('comparison report API', () => {
    test('requires real authentication for history, quote, purchase and individual reports', async () => {
        mocks.user = null;
        for (const response of [await GET(new Request('https://example.test/api/compare-names/reports')), await POST(request()), await POST(request(input, '?preview=1')), await getReport(new Request('https://example.test'), { params: Promise.resolve({ id: 'bad' }) })]) {
            expect(response.status).toBe(401);
            expect(response.headers.get('Cache-Control')).toBe('private, no-store');
        }
        expect(mocks.rpc).not.toHaveBeenCalled(); expect(mocks.from).not.toHaveBeenCalled();
    });
    test('quotes current credits without charging and returns a previous snapshot when present', async () => {
        mocks.saved = { data: { id: 'previous', snapshot: { formulaVersion: 'older' } }, error: null };
        const response = await POST(request(input, '?preview=1'));
        expect(await response.json()).toMatchObject({ remainingCredits: 10, cost: 5, report: { id: 'previous' } });
        expect(mocks.rpc).not.toHaveBeenCalled();
        expect(mocks.eq).toHaveBeenCalledWith('user_id', 'owner');
    });
    test('ignores forged scores, price and owner, and computes the snapshot on the server', async () => {
        const response = await POST(request({ ...input, user_id: 'victim', cost: 0, snapshot: { grade: 'A+' } }));
        expect(response.status).toBe(200);
        expect(mocks.rpc).toHaveBeenCalledWith('unlock_comparison_report', { p_user_id: 'owner', p_fingerprint: expect.stringMatching(/^[a-f0-9]{64}$/), p_input: input, p_snapshot: buildComparisonSnapshot(input) });
        expect(JSON.stringify(await response.json())).not.toContain('victim');
    });
    test('handles insufficient balance, already purchased results and missing setup', async () => {
        mocks.rpc.mockResolvedValueOnce({ data: { status: 'insufficient_credits', remaining_credits: 4 }, error: null });
        const response = await POST(request());
        expect(response.status).toBe(402); expect(await response.json()).toMatchObject({ remainingCredits: 4, cost: 5 });
        mocks.rpc.mockResolvedValueOnce({ data: { status: 'already_unlocked', remaining_credits: 4, report: { id: 'previous' } }, error: null });
        expect(await (await POST(request())).json()).toMatchObject({ status: 'already_unlocked' });
        mocks.rpc.mockResolvedValueOnce({ data: null, error: { code: 'PGRST202' } });
        expect((await POST(request())).status).toBe(503);
        mocks.service = false; expect((await POST(request())).status).toBe(503);
    });
    test('rejects bad input without charging', async () => {
        expect((await POST(request({ ...input, names: ['ซ้ำ', 'ซ้ำ'] }))).status).toBe(400);
        expect((await POST(new Request('https://example.test', { method: 'POST', body: '{bad' }))).status).toBe(400);
        expect(mocks.rpc).not.toHaveBeenCalled();
    });
    test('paginates owner history and fails closed when migration is absent', async () => {
        expect((await GET(new Request('https://example.test?page=0'))).status).toBe(400);
        const response = await GET(new Request('https://example.test?page=2'));
        expect(await response.json()).toMatchObject({ page: 2, pageSize: 20, reports: [], remainingCredits: 10 });
        expect(mocks.eq).toHaveBeenCalledWith('user_id', 'owner');
        mocks.history = { data: null, error: { code: '42P01' } };
        expect((await GET(new Request('https://example.test'))).status).toBe(503);
    });
    test('does not expose other users reports or recompute old snapshots', async () => {
        const id = '10000000-0000-4000-8000-000000000001';
        const context = { params: Promise.resolve({ id }) };
        expect((await getReport(new Request('https://example.test'), context)).status).toBe(404);
        expect(mocks.eq).toHaveBeenCalledWith('user_id', 'owner');
        mocks.saved = { data: { id, snapshot: { formulaVersion: 'legacy-snapshot' } }, error: null };
        expect(await (await getReport(new Request('https://example.test'), context)).json()).toMatchObject({ report: { snapshot: { formulaVersion: 'legacy-snapshot' } } });
        expect(mocks.rpc).not.toHaveBeenCalled();
    });
});
