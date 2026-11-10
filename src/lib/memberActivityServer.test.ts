import { beforeEach, expect, test, vi } from 'vitest';
vi.mock('server-only', () => ({}));
const state = vi.hoisted(() => ({
    user: { id: 'signed-in', is_anonymous: false } as {
        id: string;
        is_anonymous: boolean;
    } | null,
    error: null as { message: string } | null,
}));
vi.mock('@/utils/supabaseServer', () => ({
    createClient: async () => ({
        auth: {
            getUser: async () => ({
                data: { user: state.user },
                error: state.error,
            }),
        },
    }),
}));
import { activityAuth } from './memberActivityServer';
beforeEach(() => {
    state.user = { id: 'signed-in', is_anonymous: false };
    state.error = null;
});
test('only a verified non-anonymous session can identify activity', async () => {
    expect((await activityAuth()).user?.id).toBe('signed-in');
    state.user = { id: 'anonymous', is_anonymous: true };
    expect((await activityAuth()).user).toBeNull();
    state.user = { id: 'signed-in', is_anonymous: false };
    state.error = { message: 'Invalid token' };
    expect((await activityAuth()).user).toBeNull();
    state.user = null;
    state.error = null;
    expect((await activityAuth()).user).toBeNull();
});
