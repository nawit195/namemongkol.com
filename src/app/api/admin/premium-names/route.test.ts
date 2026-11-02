import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
    getUser: vi.fn(),
    getProfile: vi.fn(),
    createServiceClient: vi.fn(),
    serviceFrom: vi.fn(),
}));

vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
    revalidateTag: vi.fn(),
}));

vi.mock('@/utils/supabaseServer', () => ({
    createClient: vi.fn(async () => ({
        auth: { getUser: mocks.getUser },
        from: vi.fn(() => ({
            select: vi.fn(() => ({
                eq: vi.fn(() => ({ maybeSingle: mocks.getProfile })),
            })),
        })),
    })),
}));

vi.mock('@supabase/supabase-js', () => ({
    createClient: mocks.createServiceClient,
}));

import { DELETE, GET, PATCH, POST } from './route';

describe('admin premium names authorization', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.getUser.mockResolvedValue({ data: { user: null }, error: null });
        mocks.getProfile.mockResolvedValue({ data: null, error: null });
        mocks.createServiceClient.mockReturnValue({ from: mocks.serviceFrom });
        vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co');
        vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'service-role-key');
    });

    it('returns 401 when there is no authenticated user', async () => {
        const response = await GET(new Request('http://localhost/api/admin/premium-names'));
        expect(response.status).toBe(401);
        await expect(response.json()).resolves.toMatchObject({ success: false, error: 'Unauthorized' });
    });

    it('returns 403 when the authenticated user is not an admin', async () => {
        mocks.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });
        mocks.getProfile.mockResolvedValue({ data: { role: 'user' }, error: null });

        const response = await POST(new Request('http://localhost/api/admin/premium-names', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ names: ['กานต์'] }),
        }));
        expect(response.status).toBe(403);
        await expect(response.json()).resolves.toMatchObject({ success: false, error: 'Forbidden' });
    });

    it('rejects an invalid payload before creating a mutation client', async () => {
        mocks.getUser.mockResolvedValue({ data: { user: { id: 'admin-1' } }, error: null });
        mocks.getProfile.mockResolvedValue({ data: { role: 'admin' }, error: null });

        const response = await POST(new Request('http://localhost/api/admin/premium-names', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ names: 'ไม่ใช่ array' }),
        }));
        expect(response.status).toBe(400);
        await expect(response.json()).resolves.toMatchObject({ success: false });
    });

    it('saves edited pronunciation and meaning as drafts without replacing published fields', async () => {
        mocks.getUser.mockResolvedValue({ data: { user: { id: 'admin-1' } }, error: null });
        mocks.getProfile.mockResolvedValue({ data: { role: 'admin' }, error: null });
        const update = vi.fn((payload: Record<string, unknown>) => {
            void payload;
            return { eq: vi.fn(async () => ({ error: null })) };
        });
        mocks.serviceFrom.mockImplementation((table: string) => {
            if (table === 'premium_names') {
                return {
                    select: vi.fn(() => ({
                        eq: vi.fn(() => ({
                            maybeSingle: vi.fn(async () => ({ data: { id: 1, name: 'กานต์' }, error: null })),
                        })),
                    })),
                };
            }
            return {
                select: vi.fn(() => ({
                    eq: vi.fn(() => ({
                        maybeSingle: vi.fn(async () => ({ data: { name: 'กานต์' }, error: null })),
                    })),
                })),
                update,
            };
        });

        const response = await PATCH(new Request('http://localhost/api/admin/premium-names', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: 1,
                changes: { pronunciationDraft: 'กาน-นะ', meaningDraft: 'เป็นที่รัก' },
            }),
        }));

        expect(response.status).toBe(200);
        expect(update).toHaveBeenCalledWith(expect.objectContaining({
            pronunciation_draft: 'กาน-นะ',
            pronunciation_status: 'draft',
            meaning_draft: 'เป็นที่รัก',
            meaning_status: 'draft',
        }));
        const updatePayload = update.mock.calls[0]?.[0];
        expect(updatePayload).not.toHaveProperty('pronunciation');
        expect(updatePayload).not.toHaveProperty('meaning');
    });

    it('deletes only the premium membership and keeps shared name details', async () => {
        mocks.getUser.mockResolvedValue({ data: { user: { id: 'admin-1' } }, error: null });
        mocks.getProfile.mockResolvedValue({ data: { role: 'admin' }, error: null });
        const maybeSingle = vi.fn(async () => ({ data: { id: 1, name: 'กานต์' }, error: null }));
        mocks.serviceFrom.mockImplementation((table: string) => {
            if (table !== 'premium_names') throw new Error(`Unexpected delete table: ${table}`);
            return {
                delete: vi.fn(() => ({
                    eq: vi.fn(() => ({
                        select: vi.fn(() => ({ maybeSingle })),
                    })),
                })),
            };
        });

        const response = await DELETE(new Request('http://localhost/api/admin/premium-names', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: 1 }),
        }));

        expect(response.status).toBe(200);
        expect(mocks.serviceFrom).toHaveBeenCalledTimes(1);
        expect(mocks.serviceFrom).toHaveBeenCalledWith('premium_names');
        await expect(response.json()).resolves.toMatchObject({ success: true, removed: 'กานต์' });
    });
});
