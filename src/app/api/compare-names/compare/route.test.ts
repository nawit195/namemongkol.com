import { beforeEach, describe, expect, test, vi } from 'vitest';
const mocks = vi.hoisted(() => ({
    user: { id: 'owner', is_anonymous: false } as {
        id: string;
        is_anonymous: boolean;
    } | null,
    from: vi.fn(),
    rpc: vi.fn(),
    eq: vi.fn(),
    service: true,
    saved: { data: null, error: null } as Record<string, unknown>,
    balance: { data: { credits: 12 }, error: null },
}));
vi.mock('@/lib/comparisonReportServer', async (original) => {
    const actual =
        await original<typeof import('@/lib/comparisonReportServer')>();
    return {
        ...actual,
        reportAuth: vi.fn(async () => ({
            user: mocks.user,
            client: { from: mocks.from },
        })),
        reportService: vi.fn(() => (mocks.service ? { rpc: mocks.rpc } : null)),
    };
});
import { POST } from './route';
import { buildComparisonSnapshot } from '@/lib/comparisonReport';
const input = {
    names: ['ปัญญา', 'กานต์', 'ศิริ', 'ณัฐ'],
    surname: '',
    day: 'monday',
};
const request = (body: unknown = input, preview = false) =>
    new Request(
        'https://example.test/api/compare-names/compare' +
            (preview ? '?preview=1' : ''),
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        },
    );
beforeEach(() => {
    vi.clearAllMocks();
    mocks.user = { id: 'owner', is_anonymous: false };
    mocks.service = true;
    mocks.saved = { data: null, error: null };
    mocks.balance = { data: { credits: 12 }, error: null };
    mocks.from.mockImplementation((table) => {
        const chain = {
            select: vi.fn(() => chain),
            eq: mocks.eq.mockImplementation(() => chain),
            maybeSingle: vi.fn(async () =>
                table === 'user_profiles' ? mocks.balance : mocks.saved,
            ),
        };
        return chain;
    });
    mocks.rpc.mockResolvedValue({
        data: {
            status: 'unlocked',
            remaining_credits: 2,
            access: { snapshot: buildComparisonSnapshot(input) },
        },
        error: null,
    });
});
describe('extended comparison debit API', () => {
    test('2–3 names remain free and need neither authentication nor database access', async () => {
        mocks.user = null;
        for (const n of [2, 3]) {
            const response = await POST(
                request({ ...input, names: input.names.slice(0, n) }),
            );
            expect(response.status).toBe(200);
            expect(await response.json()).toMatchObject({
                status: 'free',
                cost: 0,
                rows: expect.arrayContaining([
                    expect.objectContaining({ name: 'ปัญญา' }),
                ]),
            });
        }
        expect(mocks.rpc).not.toHaveBeenCalled();
        expect(mocks.from).not.toHaveBeenCalled();
    });
    test('4–5 names require a real signed-in user', async () => {
        for (const user of [null, { id: 'anonymous', is_anonymous: true }]) {
            mocks.user = user;
            const response = await POST(request());
            expect(response.status).toBe(401);
            expect(response.headers.get('Cache-Control')).toBe(
                'private, no-store',
            );
        }
        expect(mocks.rpc).not.toHaveBeenCalled();
    });
    test('preview quotes ten credits with no debit and existing sets reopen for zero', async () => {
        const quote = await POST(request(input, true));
        expect(await quote.json()).toMatchObject({
            status: 'confirmation_required',
            cost: 10,
            remainingCredits: 12,
        });
        expect(mocks.rpc).not.toHaveBeenCalled();
        expect(mocks.eq).toHaveBeenCalledWith('user_id', 'owner');
        mocks.saved = {
            data: { snapshot: buildComparisonSnapshot(input) },
            error: null,
        };
        expect(await (await POST(request(input, true))).json()).toMatchObject({
            status: 'already_unlocked',
            cost: 0,
            rows: expect.any(Array),
        });
    });
    test('computes identity, price and scores on the server despite forged input', async () => {
        const response = await POST(
            request({
                ...input,
                user_id: 'victim',
                cost: 0,
                rows: [],
                snapshot: { grade: 'A+' },
            }),
        );
        expect(response.status).toBe(200);
        expect(mocks.rpc).toHaveBeenCalledWith('unlock_comparison_access', {
            p_user_id: 'owner',
            p_fingerprint: expect.stringMatching(/^[a-f0-9]{64}$/),
            p_input: input,
            p_snapshot: buildComparisonSnapshot(input),
        });
        expect(await response.json()).toMatchObject({
            status: 'unlocked',
            cost: 10,
            remainingCredits: 2,
        });
    });
    test('insufficient credits never expose paid results; retries reuse the existing snapshot', async () => {
        mocks.rpc.mockResolvedValueOnce({
            data: { status: 'insufficient_credits', remaining_credits: 9 },
            error: null,
        });
        const response = await POST(request());
        expect(response.status).toBe(402);
        expect(await response.json()).toEqual({
            success: false,
            status: 'insufficient_credits',
            cost: 10,
            remainingCredits: 9,
        });
        mocks.rpc.mockResolvedValueOnce({
            data: {
                status: 'already_unlocked',
                remaining_credits: 0,
                access: { snapshot: buildComparisonSnapshot(input) },
            },
            error: null,
        });
        expect(await (await POST(request())).json()).toMatchObject({
            status: 'already_unlocked',
            cost: 0,
            remainingCredits: 0,
        });
    });
    test('missing migration, service credentials and database errors fail closed', async () => {
        mocks.saved = { data: null, error: { code: '42P01' } };
        expect((await POST(request(input, true))).status).toBe(503);
        mocks.rpc.mockResolvedValueOnce({
            data: null,
            error: { code: 'PGRST202' },
        });
        expect((await POST(request())).status).toBe(503);
        mocks.service = false;
        expect((await POST(request())).status).toBe(503);
    });
    test('invalid names or day do not call the debit RPC', async () => {
        for (const bad of [
            { ...input, names: ['ซ้ำ', 'ซ้ำ', 'ศิริ', 'ณัฐ'] },
            { ...input, day: 'unknown' },
            { ...input, names: Array(6).fill('ศิริ') },
        ])
            expect((await POST(request(bad))).status).toBe(400);
        expect(mocks.rpc).not.toHaveBeenCalled();
    });
});
