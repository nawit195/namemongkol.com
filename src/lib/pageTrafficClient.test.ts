import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
const store = new Map<string, string>();
let navigation: { hostname: string };
let visibility: { visibilityState: string };
let privacy: { doNotTrack: string; globalPrivacyControl: boolean };
beforeEach(() => {
    vi.resetModules(); vi.useFakeTimers(); store.clear();
    vi.stubEnv('NODE_ENV', 'production'); vi.stubEnv('NEXT_PUBLIC_VERCEL_ENV', 'production');
    navigation = { hostname: 'www.namemongkol.com' }; visibility = { visibilityState: 'visible' };
    privacy = { doNotTrack: '0', globalPrivacyControl: false };
    vi.stubGlobal('window', { location: navigation }); vi.stubGlobal('document', visibility); vi.stubGlobal('navigator', privacy);
    vi.stubGlobal('localStorage', { getItem: (key: string) => store.get(key), setItem: (key: string, value: string) => store.set(key, value) });
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllEnvs(); vi.unstubAllGlobals(); });
describe('page navigation tracking', () => {
    it('counts route navigation and back visits, but not Strict Mode, visibility or filter repetitions', async () => {
        const fetcher = vi.fn().mockResolvedValue({ ok: true, status: 204 }); vi.stubGlobal('fetch', fetcher);
        const { recordBrowserPageView: record } = await import('./pageTrafficClient');
        record('/search?q=private'); record('/search'); record('/search?day=monday'); record('/nicknames'); record('/search');
        expect(fetcher).toHaveBeenCalledTimes(3);
        const events = fetcher.mock.calls.map(call => JSON.parse(call[1].body));
        expect(events.map(event => event.path)).toEqual(['/search', '/nicknames', '/search']);
        expect(new Set(events.map(event => event.eventId)).size).toBe(3);
        expect(new Set(events.map(event => event.visitorId)).size).toBe(1);
        expect(fetcher.mock.calls[0][1]).toMatchObject({ keepalive: true, credentials: 'omit' });
    });
    it('skips admin, local/preview traffic, hidden pages and privacy opt-outs', async () => {
        const fetcher = vi.fn(); vi.stubGlobal('fetch', fetcher);
        const { recordBrowserPageView: record } = await import('./pageTrafficClient');
        record('/admin/page-traffic'); navigation.hostname = 'localhost'; record('/search'); navigation.hostname = 'www.namemongkol.com';
        vi.stubEnv('NEXT_PUBLIC_VERCEL_ENV', 'preview'); record('/search'); vi.stubEnv('NEXT_PUBLIC_VERCEL_ENV', 'production');
        visibility.visibilityState = 'hidden'; record('/search'); visibility.visibilityState = 'visible';
        privacy.doNotTrack = '1'; record('/search'); privacy.doNotTrack = '0'; privacy.globalPrivacyControl = true; record('/search');
        expect(fetcher).not.toHaveBeenCalled(); expect(store.size).toBe(0);
    });
    it('counts different redacted meaning pages while suppressing same-route and query repeats', async () => {
        const fetcher = vi.fn().mockResolvedValue({ ok: true, status: 204 }); vi.stubGlobal('fetch', fetcher);
        const { recordBrowserPageView: record } = await import('./pageTrafficClient');
        record('/meaning/ธนกร'); record('/meaning/ธนกร?source=lookup');
        record('/meaning/' + encodeURIComponent('ณิชา')); record('/meaning/ณิชา/');
        expect(fetcher).toHaveBeenCalledTimes(2);
        const events = fetcher.mock.calls.map(call => JSON.parse(call[1].body));
        expect(events.map(event => event.path)).toEqual(['/meaning/:name', '/meaning/:name']);
        expect(new Set(events.map(event => event.eventId)).size).toBe(2);
        expect(new Set(events.map(event => event.visitorId)).size).toBe(1);
        expect(JSON.stringify(fetcher.mock.calls)).not.toContain('ธนกร');
        expect(JSON.stringify(fetcher.mock.calls)).not.toContain('ณิชา');
        expect([...store.keys()]).toEqual(['nm_page_visitor:v1']);
    });
    it('does not retry rate-limit or other client rejections', async () => {
        const fetcher = vi.fn().mockResolvedValueOnce({ ok: false, status: 429 }).mockResolvedValueOnce({ ok: false, status: 400 }); vi.stubGlobal('fetch', fetcher);
        const { recordBrowserPageView: record } = await import('./pageTrafficClient');
        record('/search'); record('/nicknames'); await vi.advanceTimersByTimeAsync(3000);
        expect(fetcher).toHaveBeenCalledTimes(2);
    });
    it('retries a server failure once and preserves event identity', async () => {
        const fetcher = vi.fn().mockResolvedValue({ ok: false, status: 503 }); vi.stubGlobal('fetch', fetcher);
        const { recordBrowserPageView: record } = await import('./pageTrafficClient');
        record('/search'); await vi.advanceTimersByTimeAsync(5000);
        expect(fetcher).toHaveBeenCalledTimes(2);
        expect(fetcher.mock.calls[0][1].body).toBe(fetcher.mock.calls[1][1].body);
    });
    it('retries a network failure once with the same idempotent event, and works without storage', async () => {
        vi.stubGlobal('localStorage', { getItem() { throw Error('blocked'); }, setItem() { throw Error('blocked'); } });
        const fetcher = vi.fn().mockRejectedValueOnce(Error('network')).mockResolvedValue({ ok: true, status: 204 }); vi.stubGlobal('fetch', fetcher);
        const { recordBrowserPageView: record } = await import('./pageTrafficClient');
        record('/'); await vi.advanceTimersByTimeAsync(2001);
        expect(fetcher).toHaveBeenCalledTimes(2);
        expect(fetcher.mock.calls[0][1].body).toBe(fetcher.mock.calls[1][1].body);
        record('/', true); expect(fetcher).toHaveBeenCalledTimes(3);
    });
});
