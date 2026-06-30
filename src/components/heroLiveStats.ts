export const STATS_POLL_MS = 12_000;
export const STATS_IDLE_DELAY_MS = 1_000;
export const LIVE_STATS_FETCH_INIT = { cache: 'no-store' } as const satisfies RequestInit;

export const formatRealtimeCount = (value?: number) => {
    if (typeof value !== 'number' || value <= 0) {
        return null;
    }

    return value.toLocaleString('th-TH');
};
