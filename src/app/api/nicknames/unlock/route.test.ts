import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('server-only', () => ({}));
vi.mock('@/lib/auspiciousNicknameCatalogServer', async () => ({
    getPremiumNicknameCatalog: async () =>
        (await import('@/lib/testFixtures/auspiciousNicknameCatalog'))
            .premiumNicknameFixture,
}));
const mocks = vi.hoisted(() => ({
    auth: vi.fn(),
    receipt: vi.fn(),
    rpc: vi.fn(),
    access: vi.fn(),
    response: vi.fn(),
}));
vi.mock('@/utils/supabaseServer', () => ({
    createClient: async () => ({
        auth: { getUser: mocks.auth },
        from: () => {
            const builder = {
                select: () => builder,
                eq: () => builder,
                maybeSingle: mocks.receipt,
            };
            return builder;
        },
    }),
}));
vi.mock('@/lib/auspiciousNicknameServer', () => ({
    loadNicknameAccess: mocks.access,
    buildNicknameResponse: mocks.response,
    getNicknameAdminClient: () => ({ rpc: mocks.rpc }),
}));
import { POST } from './route';
import { DEFAULT_NICKNAME_FILTERS } from '@/lib/auspiciousNicknameShared';
import {
    NICKNAME_CATALOG_VERSION,
    queryNicknames as queryCatalog,
} from '@/lib/auspiciousNicknames';
import { signNicknameQuote } from '@/lib/auspiciousNicknameQuote';
import { premiumNicknameFixture } from '@/lib/testFixtures/auspiciousNicknameCatalog';
import type { NicknameFilters } from '@/types/auspiciousNickname';
const queryNicknames = (filters: NicknameFilters) =>
    queryCatalog(filters, [], premiumNicknameFixture);

const userId = '10000000-0000-4000-8000-000000000001';
const secret = 'nickname-api-test-secret';
const filters = { ...DEFAULT_NICKNAME_FILTERS, group: 'aplus' as const };
function request(override: Record<string, unknown> = {}, selected = filters) {
    return new Request('https://namemongkol.com/api/nicknames/unlock', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            origin: 'https://namemongkol.com',
        },
        body: JSON.stringify({
            filters: selected,
            requestId: '10000000-0000-4000-8000-000000000100',
            quote: signNicknameQuote(
                {
                    userId,
                    version: NICKNAME_CATALOG_VERSION,
                    filters: selected,
                    ids: queryNicknames(selected).candidates.map(
                        (item) => item.id,
                    ),
                },
                secret,
            ),
            ...override,
        }),
    });
}
beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', secret);
    mocks.auth.mockResolvedValue({
        data: { user: { id: userId } },
        error: null,
    });
    mocks.receipt.mockResolvedValue({ data: null, error: null });
    mocks.access.mockResolvedValue({
        purchased: [],
        credits: 100,
        available: true,
    });
    mocks.rpc.mockResolvedValue({
        data: { status: 'unlocked', received_count: 20 },
        error: null,
    });
    mocks.response.mockResolvedValue({
        ...queryNicknames(filters).response,
        viewer: { authenticated: true, credits: 85 },
        accessReady: true,
    });
});
afterEach(() => vi.unstubAllEnvs());
describe('nickname unlock authorization and billing boundary', () => {
    it('rejects anonymous requests before invoking billing', async () => {
        mocks.auth.mockResolvedValue({ data: { user: null } });
        expect((await POST(request())).status).toBe(401);
        expect(mocks.rpc).not.toHaveBeenCalled();
    });
    it('rejects a client-selected cost and cross-origin requests', async () => {
        expect((await POST(request({ cost: 0 }))).status).toBe(400);
        const foreign = new Request(request(), {
            headers: { origin: 'https://other.example' },
        });
        expect((await POST(foreign)).status).toBe(403);
        expect(mocks.rpc).not.toHaveBeenCalled();
    });
    it('binds confirmation to the original filters and exact batch', async () => {
        const original = request();
        const body = await original.json();
        expect(
            (
                await POST(
                    request(
                        { quote: body.quote },
                        { ...filters, gender: 'female' },
                    ),
                )
            ).status,
        ).toBe(409);
        mocks.access.mockResolvedValue({
            purchased: queryNicknames(filters).candidates.slice(0, 1),
            credits: 100,
            available: true,
        });
        expect((await POST(request())).status).toBe(409);
        expect(mocks.rpc).not.toHaveBeenCalled();
    });
    it('uses server-selected snapshots and charges the confirmed short batch', async () => {
        mocks.rpc.mockResolvedValue({
            data: { status: 'unlocked', received_count: 3 },
            error: null,
        });
        const response = await POST(request({}, { ...filters, initial: 'ข' }));
        expect(response.status).toBe(200);
        expect(response.headers.get('cache-control')).toContain(
            'private, no-store',
        );
        expect(mocks.rpc.mock.calls[0][0]).toBe('unlock_nickname_batch');
        const submitted = mocks.rpc.mock.calls[0][1];
        expect(submitted.p_user_id).toBe(userId);
        expect(submitted.p_snapshot).toHaveLength(3);
        expect(submitted).not.toHaveProperty('cost');
    });
    it('restores a successful receipt even when the retried quote has expired', async () => {
        mocks.receipt.mockResolvedValue({
            data: { id: 'receipt', result_ids: ['saved'] },
            error: null,
        });
        const response = await POST(request({ quote: 'expired-quote-token' }));
        expect(response.status).toBe(200);
        expect((await response.json()).unlockStatus).toBe('already_unlocked');
        expect(mocks.rpc).not.toHaveBeenCalled();
    });
    it('binds purchases to the displayed page rather than a different batch', async () => {
        const original = await request().json();
        expect(
            (
                await POST(
                    request({ quote: original.quote }, { ...filters, page: 2 }),
                )
            ).status,
        ).toBe(409);
        expect(mocks.rpc).not.toHaveBeenCalled();
        expect((await POST(request({}, { ...filters, page: 2 }))).status).toBe(
            200,
        );
        const sent = mocks.rpc.mock.calls[0][1];
        expect(sent.p_filters.page).toBe(2);
        expect(sent.p_snapshot.map((item: { id: string }) => item.id)).toEqual(
            queryNicknames({ ...filters, page: 2 }).candidates.map(
                (item) => item.id,
            ),
        );
    });
    it('never charges a letter whose names are entirely free', async () => {
        expect(
            (await POST(request({}, { ...filters, initial: 'ค' }))).status,
        ).toBe(409);
        expect(mocks.rpc).not.toHaveBeenCalled();
    });
    it('does not initiate a charge when ownership lookup is unavailable', async () => {
        mocks.access.mockResolvedValue({
            purchased: [],
            credits: 100,
            available: false,
        });
        expect((await POST(request())).status).toBe(503);
        expect(mocks.rpc).not.toHaveBeenCalled();
    });
    it('returns insufficient credits and concurrent ownership conflicts from the transaction', async () => {
        mocks.rpc.mockResolvedValue({
            data: { status: 'insufficient_credits', remaining_credits: 14 },
            error: null,
        });
        expect((await POST(request())).status).toBe(402);
        mocks.rpc.mockResolvedValue({
            data: { status: 'stale_quote' },
            error: null,
        });
        expect((await POST(request())).status).toBe(409);
    });
});
