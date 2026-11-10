import { beforeEach, describe, expect, test, vi } from 'vitest';
vi.mock('server-only', () => ({}));
const mocks = vi.hoisted(() => ({
    user: { id: 'member' } as { id: string } | null,
    rpc: vi.fn(),
    service: true,
    from: vi.fn(),
    role: 'admin',
}));
vi.mock('@/lib/memberActivityServer', async (original) => {
    const actual =
        await original<typeof import('@/lib/memberActivityServer')>();
    return {
        ...actual,
        activityAuth: vi.fn(async () => ({
            user: mocks.user,
            client: { from: mocks.from },
        })),
        activityService: vi.fn(() =>
            mocks.service ? { rpc: mocks.rpc } : null,
        ),
    };
});
import { POST } from './route';
import { GET } from '@/app/api/admin/returning-members/route';
const request = (body?: string) =>
    new Request('https://example.test/api/member-activity', {
        method: 'POST',
        body,
    });
beforeEach(() => {
    vi.clearAllMocks();
    mocks.user = { id: 'member' };
    mocks.service = true;
    mocks.role = 'admin';
    mocks.rpc.mockResolvedValue({
        data: { recorded: true, activityDate: '2026-11-10' },
        error: null,
    });
    mocks.from.mockImplementation(() => {
        const q = {
            select: () => q,
            eq: () => q,
            maybeSingle: async () => ({
                data: { role: mocks.role },
                error: null,
            }),
        };
        return q;
    });
});
describe('member activity API permissions', () => {
    test('requires real server authentication and private/no-store responses', async () => {
        mocks.user = null;
        for (const res of [
            await POST(request()),
            await GET(new Request('https://example.test')),
        ]) {
            expect(res.status).toBe(401);
            expect(res.headers.get('cache-control')).toBe('private, no-store');
        }
        expect(mocks.rpc).not.toHaveBeenCalled();
    });
    test('rejects forged identity, dates and tool content; passes only the session ID to RPC', async () => {
        for (const body of [
            '{"user_id":"victim"}',
            '{"date":"2020-01-01"}',
            '{"name":"ลับ"}',
            '[]',
        ])
            expect((await POST(request(body))).status).toBe(400);
        expect((await POST(new Request('https://example.test/api/member-activity?user_id=victim&date=2020-01-01', {method:'POST'}))).status).toBe(400);
        expect(mocks.rpc).not.toHaveBeenCalled();
        expect((await POST(request())).status).toBe(200);
        expect(mocks.rpc).toHaveBeenCalledWith('record_member_activity', {
            p_user_id: 'member',
        });
    });
    test('does not count excluded accounts and makes configuration failures explicit', async () => {
        mocks.rpc.mockResolvedValueOnce({
            data: { recorded: false, activityDate: '2026-11-10' },
            error: null,
        });
        expect(await (await POST(request())).json()).toMatchObject({
            recorded: false,
        });
        mocks.rpc.mockResolvedValueOnce({
            data: null,
            error: { code: 'PGRST202' },
        });
        const missing = await POST(request());
        expect(missing.status).toBe(503);
        expect(await missing.json()).toMatchObject({
            code: 'MIGRATION_REQUIRED',
        });
        mocks.service = false;
        expect((await POST(request())).status).toBe(503);
    });
    test('denies ordinary users before calling the reporting RPC', async () => {
        mocks.role = 'user';
        expect((await GET(new Request('https://example.test'))).status).toBe(
            403,
        );
        expect(mocks.rpc).not.toHaveBeenCalled();
    });
    test('validates report filters and validates the SQL response rather than showing an empty success', async () => {
        expect(
            (await GET(new Request('https://example.test?from=bad&to=bad')))
                .status,
        ).toBe(400);
        expect(mocks.rpc).not.toHaveBeenCalled();
        mocks.rpc.mockResolvedValueOnce({
            data: null,
            error: { code: '42P01' },
        });
        expect((await GET(new Request('https://example.test'))).status).toBe(
            503,
        );
        mocks.rpc.mockResolvedValueOnce({ data: { members: [] }, error: null });
        expect((await GET(new Request('https://example.test'))).status).toBe(
            503,
        );
    });
    test('returns a correctly typed report with fixed pagination and coverage', async () => {
        const report = {
            members: [],
            total: 0,
            page: 2,
            pageSize: 50,
            summary: { activeMembers: 0, returningMembers: 0 },
            coverage: {
                trackingStartedAt: '2026-11-10T00:00:00Z',
                legacyImportedAt: null,
                legacySources: [],
            },
        };
        mocks.rpc.mockResolvedValueOnce({ data: report, error: null });
        const res = await GET(
            new Request(
                'https://example.test?days=7&page=2&source=observed&search=มาลี',
            ),
        );
        expect(res.status).toBe(200);
        expect(await res.json()).toMatchObject({ ...report, success: true });
        expect(mocks.rpc).toHaveBeenCalledWith(
            'admin_returning_members',
            expect.objectContaining({
                p_source: 'observed',
                p_page: 2,
                p_search: 'มาลี',
            }),
        );
    });
});
