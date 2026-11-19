import { afterEach, expect, test, vi } from 'vitest';
import { WallpaperTimeoutError, withWallpaperTimeout } from './wallpaperRequest';
import { wallpaperAttemptAfterFailure } from './paidWallpaper';

afterEach(() => vi.useRealTimers());

test('ends a hung request and aborts the underlying transfer', async () => {
    vi.useFakeTimers();
    let transfer: AbortSignal | undefined;
    const result = withWallpaperTimeout(signal => {
        transfer = signal;
        return new Promise<never>(() => {});
    }, 12_000);
    const check = expect(result).rejects.toBeInstanceOf(WallpaperTimeoutError);
    await vi.advanceTimersByTimeAsync(12_000);
    await check;
    expect(transfer?.aborted).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
});

test('includes body reads in the deadline and preserves an uncertain paid attempt', async () => {
    vi.useFakeTimers();
    const attempt = { requestId: '10000000-0000-4000-8000-000000000001', productId: 'eight-horses-waterfall', userId: 'member', startedAt: Date.now() };
    const result = withWallpaperTimeout(async () => {
        await Promise.resolve({ ok: true });
        return await new Promise<never>(() => {}); // Headers arrived; the body never completes.
    }, 75_000);
    const check = expect(result).rejects.toBeInstanceOf(WallpaperTimeoutError);
    await vi.advanceTimersByTimeAsync(75_000);
    await check;
    expect(wallpaperAttemptAfterFailure(attempt, null, 408)).toEqual(attempt);
});

test('cancels superseded work without allowing its late response to win', async () => {
    vi.useFakeTimers();
    const owner = new AbortController();
    let resolveOld: (value: string) => void = () => {};
    const old = withWallpaperTimeout(() => new Promise<string>(resolve => { resolveOld = resolve; }), 12_000, owner.signal);
    const check = expect(old).rejects.toMatchObject({ name: 'AbortError' });
    await Promise.resolve();
    owner.abort();
    await check;
    expect(await withWallpaperTimeout(async () => 'new account', 12_000)).toBe('new account');
    resolveOld('old account');
    expect(vi.getTimerCount()).toBe(0);
});

test('cleans up deadlines after success and does not start already-cancelled requests', async () => {
    vi.useFakeTimers();
    expect(await withWallpaperTimeout(async () => 'ready', 12_000)).toBe('ready');
    const owner = new AbortController();
    owner.abort();
    const operation = vi.fn(async () => 'never');
    await expect(withWallpaperTimeout(operation, 12_000, owner.signal)).rejects.toMatchObject({ name: 'AbortError' });
    expect(operation).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
});
