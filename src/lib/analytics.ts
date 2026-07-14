/**
 * Analytics Tracking Utility — Central client-side event tracker.
 *
 * Usage:
 *   import { trackEvent } from '@/lib/analytics';
 *   trackEvent('home.hero.analyze_click');
 *
 * Auto-capture via data attributes (mounted by AnalyticsProvider):
 *   <button data-track="login.social.google">Login with Google</button>
 */

import { supabase } from '@/utils/supabase';

const CLICK_SAMPLE_RATE = 0.15;
const DEDUPE_WINDOW_MS = 2000;
const BATCH_FLUSH_MS = 10_000;
const CRITICAL_FLUSH_MS = 1_000;
const MAX_BATCH_SIZE = 10;
const ALWAYS_TRACK_KEYWORDS = [
    'analyze',
    'submit',
    'login',
    'signup',
    'topup',
    'payment',
    'organic',
    'funnel',
    'unlock',
    'deduct',
    'download',
];

// ---------------------------------------------------------------------------
// Session ID (anonymous fallback)
// ---------------------------------------------------------------------------
let _sessionId: string | null = null;
const _recentEvents = new Map<string, number>();
const _eventQueue: AnalyticsEventPayload[] = [];
let _flushTimer: ReturnType<typeof setTimeout> | null = null;
let _lifecycleListenersAttached = false;
let _cachedUserId: string | null = null;
let _userLookupStarted = false;

interface AnalyticsEventPayload {
    event_name: 'click';
    button_key: string;
    page_path: string;
    user_id: string | null;
    session_id: string;
    referrer: string;
    metadata: Record<string, unknown>;
}

function getSessionId(): string {
    if (_sessionId) return _sessionId;

    // Try to reuse from sessionStorage (persists across pages in same tab)
    if (typeof window !== 'undefined') {
        const stored = sessionStorage.getItem('nm_sid');
        if (stored) {
            _sessionId = stored;
            return stored;
        }
        // Generate a simple random ID
        const id = `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
        sessionStorage.setItem('nm_sid', id);
        _sessionId = id;
        return id;
    }
    return 'unknown';
}

async function getUserId(): Promise<string | null> {
    if (_userLookupStarted) return _cachedUserId;
    _userLookupStarted = true;

    try {
        const { data: { session } } = await supabase.auth.getSession();
        _cachedUserId = session?.user?.id ?? null;
    } catch {
        _cachedUserId = null;
    }

    return _cachedUserId;
}

function postAnalyticsBatch(batch: AnalyticsEventPayload[]): void {
    if (batch.length === 0) return;

    fetch('/api/analytics/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: batch }),
        keepalive: true,
    }).catch(() => {
        // Silently fail — analytics should never block UX
    });
}

async function flushEvents(): Promise<void> {
    if (_flushTimer) {
        clearTimeout(_flushTimer);
        _flushTimer = null;
    }

    if (_eventQueue.length === 0) return;

    const batch = _eventQueue.splice(0, MAX_BATCH_SIZE);
    const userId = await getUserId();
    postAnalyticsBatch(batch.map(event => ({ ...event, user_id: event.user_id ?? userId })));

    if (_eventQueue.length > 0) {
        scheduleFlush();
    }
}

function flushEventsBestEffort(): void {
    if (_flushTimer) {
        clearTimeout(_flushTimer);
        _flushTimer = null;
    }

    if (_eventQueue.length === 0) return;

    const batch = _eventQueue.splice(0, MAX_BATCH_SIZE);
    const body = JSON.stringify({ events: batch.map(event => ({ ...event, user_id: event.user_id ?? _cachedUserId })) });

    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
        const sent = navigator.sendBeacon(
            '/api/analytics/ingest',
            new Blob([body], { type: 'application/json' }),
        );

        if (sent) return;
    }

    fetch('/api/analytics/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: true,
    }).catch(() => {
        // Silently fail
    });
}

function scheduleFlush(delay = BATCH_FLUSH_MS): void {
    if (_flushTimer || typeof window === 'undefined') return;
    _flushTimer = setTimeout(() => {
        void flushEvents();
    }, delay);
}

function ensureLifecycleFlush(): void {
    if (typeof window === 'undefined' || _lifecycleListenersAttached) return;
    _lifecycleListenersAttached = true;

    window.addEventListener('pagehide', flushEventsBestEffort);
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            flushEventsBestEffort();
        }
    });
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface TrackEventOptions {
    /** Override auto-detected page path */
    pagePath?: string;
    /** Extra metadata (keep small — no PII) */
    metadata?: Record<string, unknown>;
}

/**
 * Track a user action event.
 *
 * @param buttonKey  Dot-notation key, e.g. "name_analysis.form.analyze"
 * @param options    Optional overrides
 */
export async function trackEvent(
    buttonKey: string,
    options: TrackEventOptions = {},
): Promise<void> {
    try {
        const pagePath = options.pagePath ?? (typeof window !== 'undefined' ? window.location.pathname : '/');
        const referrer = typeof document !== 'undefined' ? document.referrer : '';
        const normalizedKey = buttonKey.toLowerCase();
        const shouldAlwaysTrack = ALWAYS_TRACK_KEYWORDS.some(keyword => normalizedKey.includes(keyword));
        const dedupeKey = `${pagePath}:${buttonKey}`;
        const now = Date.now();
        const lastTrackedAt = _recentEvents.get(dedupeKey) ?? 0;

        if (now - lastTrackedAt < DEDUPE_WINDOW_MS) {
            return;
        }

        if (!shouldAlwaysTrack && Math.random() > CLICK_SAMPLE_RATE) {
            return;
        }

        _recentEvents.set(dedupeKey, now);

        const payload = {
            event_name: 'click',
            button_key: buttonKey,
            page_path: pagePath,
            user_id: _cachedUserId,
            session_id: getSessionId(),
            referrer: referrer.slice(0, 500),
            metadata: options.metadata ?? {},
        } satisfies AnalyticsEventPayload;

        ensureLifecycleFlush();
        _eventQueue.push(payload);

        if (_eventQueue.length >= MAX_BATCH_SIZE) {
            void flushEvents();
            return;
        }

        scheduleFlush(shouldAlwaysTrack ? CRITICAL_FLUSH_MS : BATCH_FLUSH_MS);
    } catch {
        // Silently fail
    }
}

// ---------------------------------------------------------------------------
// Auto-capture: delegated click listener for [data-track] elements
// ---------------------------------------------------------------------------
let _listenerAttached = false;

export function attachAutoCapture(): void {
    if (typeof window === 'undefined' || _listenerAttached) return;
    _listenerAttached = true;

    document.addEventListener('click', (e) => {
        const target = (e.target as HTMLElement)?.closest?.('[data-track]');
        if (!target) return;

        const buttonKey = (target as HTMLElement).dataset.track;
        if (!buttonKey) return;

        // Optional: extra metadata from data-track-meta (JSON string)
        let metadata: Record<string, unknown> = {};
        const metaStr = (target as HTMLElement).dataset.trackMeta;
        if (metaStr) {
            try { metadata = JSON.parse(metaStr); } catch { /* ignore */ }
        }

        trackEvent(buttonKey, { metadata });
    }, { capture: true, passive: true });
}
