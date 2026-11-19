import { createHash } from 'node:crypto';
import { beforeEach, expect, test, vi } from 'vitest';
vi.mock('server-only', () => ({}));
vi.mock('@/utils/supabase', () => ({ supabase: {} }));
vi.mock('@/data/horseWallpapers', () => ({
    HORSE_WALLPAPER_COST: 15,
    WALLPAPER_RETRY_MINUTES: 30,
    HORSE_WALLPAPERS: [{ id: 'eight-horses-test', name: 'ม้าแปดตัว', downloadFilename: 'eight-horses-waterfall-sunlight-wallpaper.png', bytes: 11, cost: 15, preview: '/preview.webp', width: 852, height: 1846, device: 'mobile' }],
}));
const state = vi.hoisted(() => ({
    user: { id: 'member-a', is_anonymous: false } as { id: string; is_anonymous: boolean } | null,
    authError: null as unknown,
    authWait: null as Promise<void> | null,
    asset: { id: 'eight-horses-test', cost: 15, active: true, original_path: 'private/file.png', sha256: '', bytes: 11 },
    readError: null as unknown,
    fileError: null as unknown,
    file: new Blob(['PNG-fixture'], { type: 'image/png' }),
    rpc: vi.fn(),
}));
vi.mock('@/utils/supabaseServer', () => ({ createClient: async () => ({
    auth: { getUser: async () => { await state.authWait; return { data: { user: state.user }, error: state.authError }; } },
    from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { credits: 25, welcome_credits: 0 }, error: null }) }) }) }),
}) }));
vi.mock('@supabase/supabase-js', () => ({ createClient: () => ({
    from: () => {
        const query = {
            select: () => query, eq: () => query,
            in: async () => ({ data: [state.asset], error: state.readError }),
            maybeSingle: async () => ({ data: state.asset, error: state.readError }),
        };
        return query;
    },
    storage: { from: () => ({ download: async () => ({ data: state.file, error: state.fileError }) }) },
    rpc: state.rpc,
}) }));
import { POST } from '@/app/api/wallpapers/download/route';
import { GET } from '@/app/api/wallpapers/products/route';

const payload = { productId: 'eight-horses-test', requestId: '10000000-0000-4000-8000-000000000001', action: 'start' };
const request = (body: unknown = payload, origin = 'https://www.namemongkol.com') => new Request('https://www.namemongkol.com/api/wallpapers/download', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Origin: origin }, body: JSON.stringify(body),
});
beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://project.supabase.co');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'server-key-fixture');
    state.user = { id: 'member-a', is_anonymous: false };
    state.authError = null;
    state.authWait = null;
    state.asset.active = true;
    state.asset.cost = 15;
    state.asset.bytes = 11;
    state.asset.sha256 = createHash('sha256').update('PNG-fixture').digest('hex');
    state.readError = null;
    state.fileError = null;
    state.file = new Blob(['PNG-fixture'], { type: 'image/png' });
    state.rpc.mockReset().mockResolvedValue({ data: { status: 'charged', remaining_credits: 10, expires_at: '2026-11-19T04:00:00+00:00' }, error: null });
});

test('catalog fails with a retryable private response when auth never finishes', async () => {
    vi.useFakeTimers();
    let release: () => void = () => {};
    state.authWait = new Promise<void>(resolve => { release = resolve; });
    try {
        const pending = GET();
        await vi.advanceTimersByTimeAsync(10_000);
        const response = await pending;
        expect(response.status).toBe(503);
        expect(response.headers.get('Cache-Control')).toBe('private, no-store');
        expect((await response.json()).code).toBe('WALLPAPER_NOT_READY');
        expect(state.rpc).not.toHaveBeenCalled();
    } finally {
        release();
        state.authWait = null;
        vi.useRealTimers();
    }
});

test('verified membership required; guests, anonymous sign-ins, and invalid sessions never debit', async () => {
    for (const user of [null, { id: 'anon', is_anonymous: true }]) {
        state.user = user;
        expect((await POST(request())).status).toBe(401);
    }
    state.user = { id: 'member-a', is_anonymous: false };
    state.authError = { message: 'Invalid token' };
    expect((await POST(request())).status).toBe(401);
    expect(state.rpc).not.toHaveBeenCalled();
});
test('rejects cross-site purchases and browser-supplied pricing/owner fields', async () => {
    expect((await POST(request(payload, 'https://other.example'))).status).toBe(403);
    expect((await POST(request({ ...payload, cost: 0 }))).status).toBe(400);
    expect((await POST(request({ ...payload, userId: 'victim' }))).status).toBe(400);
    expect(state.rpc).not.toHaveBeenCalled();
});
test('missing configuration, missing files, and corrupted originals fail before debiting', async () => {
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', '');
    expect((await POST(request())).status).toBe(503);
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'server-key-fixture');
    state.fileError = { message: 'Not found' };
    expect((await POST(request())).status).toBe(503);
    state.fileError = null;
    state.asset.sha256 = 'f'.repeat(64);
    expect((await POST(request())).status).toBe(503);
    expect(state.rpc).not.toHaveBeenCalled();
});
test('returns verified PNG through a private response and sends only server-derived identity/checksum to RPC', async () => {
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect(await response.text()).toBe('PNG-fixture');
    expect(response.headers.get('Cache-Control')).toBe('private, no-store');
    expect(response.headers.get('Content-Type')).toBe('image/png');
    expect(response.headers.get('X-Credits-Remaining')).toBe('10');
    expect(response.headers.get('Content-Disposition')).toBe('attachment; filename="eight-horses-waterfall-sunlight-wallpaper.png"');
    expect(state.rpc).toHaveBeenCalledWith('purchase_wallpaper_download', { p_user_id: 'member-a', p_product_id: payload.productId, p_request_id: payload.requestId, p_sha256: state.asset.sha256, p_retry_only: false });
});
test('retry is explicitly read-only with respect to new charges; expired receipts do not become new purchases', async () => {
    state.rpc.mockResolvedValue({ data: { status: 'expired' }, error: null });
    expect((await POST(request({ ...payload, action: 'retry' }))).status).toBe(409);
    expect(state.rpc.mock.calls[0][1].p_retry_only).toBe(true);
    state.rpc.mockResolvedValue({ data: { status: 'insufficient_credits', remaining_credits: 14 }, error: null });
    expect((await POST(request())).status).toBe(402);
});
test('ambiguous RPC/network failure never falsely claims no credits were charged', async () => {
    state.rpc.mockResolvedValue({ data: null, error: { message: 'Connection lost after commit' } });
    const response = await POST(request());
    expect(response.status).toBe(503);
    expect((await response.json()).code).toBe('DOWNLOAD_RESULT_UNKNOWN');
});
test('catalog includes safe display metadata and session balance without private original paths or secrets', async () => {
    const response = await GET();
    const text = await response.text();
    expect(response.headers.get('Cache-Control')).toBe('private, no-store');
    expect(text).toContain('"remainingCredits":25');
    expect(text).not.toContain('private/file.png');
    expect(text).not.toContain('server-key-fixture');
    expect(JSON.parse(text).products[0].available).toBe(true);
});

test('guests can be sent to login even when catalog setup is incomplete; purchasing stays blocked', async () => {
    state.user = null;
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', '');
    const response = await GET();
    expect(response.status).toBe(200);
    expect(response.headers.get('Cache-Control')).toBe('private, no-store');
    expect(await response.json()).toMatchObject({
        userId: null, remainingCredits: null,
        error: expect.any(String), products: [{ available: false }],
    });
    expect((await POST(request())).status).toBe(401);
    expect(state.rpc).not.toHaveBeenCalled();
});

test('catalog failures preserve verified membership but never enable a paid download', async () => {
    state.readError = { message: 'Catalog unavailable' };
    const response = await GET();
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.userId).toBe('member-a');
    expect(body.remainingCredits).toBeNull();
    expect(body.products[0].available).toBe(false);
    expect(body.error).toBeTruthy();
    expect((await POST(request())).status).toBe(503);
    expect(state.rpc).not.toHaveBeenCalled();
});

test('signed-out and anonymous catalog visitors have no member identity even for ready products', async () => {
    for (const user of [null, { id: 'anonymous', is_anonymous: true }]) {
        state.user = user;
        const body = await (await GET()).json();
        expect(body.userId).toBeNull();
        expect(body.remainingCredits).toBeNull();
        expect(body.products[0].available).toBe(true);
    }
    expect(state.rpc).not.toHaveBeenCalled();
});
