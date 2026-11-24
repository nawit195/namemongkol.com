import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const stats = { success: true, onlineNow: 3, totals: { analyses: 42 } };

describe('shared public stats requests', () => {
    beforeEach(() => {
        vi.resetModules();
        vi.useFakeTimers();
    });
    afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllGlobals();
    });

    it('shares one in-flight request, reuses the response, and refreshes after expiry', async () => {
        let finish!: (response: Response) => void;
        const fetchMock = vi.fn().mockImplementationOnce(() => new Promise<Response>(resolve => { finish = resolve; }))
            .mockResolvedValueOnce(Response.json({ ...stats, onlineNow: 4 }));
        vi.stubGlobal('fetch', fetchMock);
        const { fetchSharedLiveStats } = await import('./heroLiveStats');

        const hero = fetchSharedLiveStats();
        const ticker = fetchSharedLiveStats();
        expect(ticker).toBe(hero);
        finish(Response.json(stats));
        expect(await hero).toEqual(stats);
        expect(await fetchSharedLiveStats()).toEqual(stats);
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(fetchMock.mock.calls[0][1].cache).toBe('default');

        await vi.advanceTimersByTimeAsync(60_001);
        expect((await fetchSharedLiveStats()).onlineNow).toBe(4);
        expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('retries failed requests and does not retain fallback aggregates', async () => {
        const fetchMock = vi.fn().mockResolvedValueOnce(new Response(null, { status: 503 }))
            .mockResolvedValueOnce(Response.json({ success: false }))
            .mockResolvedValueOnce(Response.json(stats));
        vi.stubGlobal('fetch', fetchMock);
        const { fetchSharedLiveStats } = await import('./heroLiveStats');
        await expect(fetchSharedLiveStats()).rejects.toThrow('503');
        expect((await fetchSharedLiveStats()).success).toBe(false);
        expect(await fetchSharedLiveStats()).toEqual(stats);
        expect(fetchMock).toHaveBeenCalledTimes(3);
    });

    it('releases a stalled request so the next caller can retry', async () => {
        const fetchMock = vi.fn().mockImplementationOnce((_url, { signal }: RequestInit) => new Promise((_resolve, reject) => {
            signal?.addEventListener('abort', () => reject(new DOMException('Timed out', 'AbortError')));
        })).mockResolvedValueOnce(Response.json(stats));
        vi.stubGlobal('fetch', fetchMock);
        const { fetchSharedLiveStats } = await import('./heroLiveStats');
        const pending = expect(fetchSharedLiveStats()).rejects.toMatchObject({ name: 'AbortError' });
        await vi.advanceTimersByTimeAsync(10_001);
        await pending;
        expect(await fetchSharedLiveStats()).toEqual(stats);
        expect(fetchMock).toHaveBeenCalledTimes(2);
    });
});
