import type { PublicAggregateStats } from '@/lib/publicStats';

export const STATS_POLL_MS = 10 * 60 * 1000;
export const STATS_IDLE_DELAY_MS = 2_500;
// Public aggregates can use the CDN cache. no-store sends cache-bypassing
// request headers, even though these responses contain no member data.
export const LIVE_STATS_FETCH_INIT = { cache: 'default' } as const satisfies RequestInit;

const CLIENT_STATS_TTL_MS = 60_000;
let snapshot: { value: PublicAggregateStats; expiresAt: number } | null = null;
let inFlight: Promise<PublicAggregateStats> | null = null;

export function fetchSharedLiveStats(): Promise<PublicAggregateStats> {
    if (snapshot && Date.now() < snapshot.expiresAt) return Promise.resolve(snapshot.value);
    if (inFlight) return inFlight;

    inFlight = (async () => {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10_000);
        try {
            const response = await fetch('/api/live-stats', { ...LIVE_STATS_FETCH_INIT, signal: controller.signal });
            if (!response.ok) throw new Error(`Public stats unavailable (${response.status})`);
            const value = await response.json() as PublicAggregateStats;
            if (value.success) snapshot = { value, expiresAt: Date.now() + CLIENT_STATS_TTL_MS };
            return value;
        } finally {
            clearTimeout(timeout);
        }
    })().finally(() => { inFlight = null; });

    return inFlight;
}

export const formatRealtimeCount = (value?: number) => {
    if (typeof value !== 'number' || value <= 0) {
        return null;
    }

    return value.toLocaleString('th-TH');
};
