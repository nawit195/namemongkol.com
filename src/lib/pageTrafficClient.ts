import { normalizeTrafficPath } from './pageTrafficPath';

let visitorId: string | null = null;
// Navigation identity stays in this tab's memory, separately from the redacted
// payload. Different names/IDs still represent different page openings.
let lastNavigationPath: string | null = null;
const STORAGE_KEY = 'nm_page_visitor:v1';
function browserVisitorId() {
    if (visitorId) return visitorId;
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(stored)) visitorId = stored;
    } catch { /* Private browsing can disable storage. Use this tab's in-memory ID. */ }
    if (!visitorId) {
        visitorId = crypto.randomUUID();
        try { localStorage.setItem(STORAGE_KEY, visitorId); } catch { /* Optional persistence. */ }
    }
    return visitorId;
}

export function recordBrowserPageView(pathname: string, restored = false) {
    try {
        if (process.env.NODE_ENV !== 'production' || process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview') return;
        const host = window.location.hostname;
        if (['localhost', '127.0.0.1', '[::1]', '::1'].includes(host) || host.endsWith('.localhost')) return;
        const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
        if (nav.doNotTrack === '1' || nav.globalPrivacyControl || document.visibilityState !== 'visible') return;
        const path = normalizeTrafficPath(pathname);
        if (!path) { lastNavigationPath = null; return; }
        const navigationPath = decodeURI(new URL(pathname, 'https://traffic.invalid').pathname)
            .normalize('NFC').replace(/\/{2,}/g, '/').replace(/\/$/, '') || '/';
        if (!restored && lastNavigationPath === navigationPath) return;
        lastNavigationPath = navigationPath;
        const body = JSON.stringify({ path, visitorId: browserVisitorId(), eventId: crypto.randomUUID() });
        const send = () => fetch('/api/analytics/page-view', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body,
            credentials: 'omit', keepalive: true,
        }).then(response => { if (response.status >= 500) throw new Error('Page view unavailable'); });
        // Retry network/5xx failures only, reusing the event ID. A 4xx rejection
        // (including rate limits) must not create another ingestion request.
        void send().catch(() => { setTimeout(() => { void send().catch(() => {}); }, 2000); });
    } catch { /* Measurements must never block the page. */ }
}
