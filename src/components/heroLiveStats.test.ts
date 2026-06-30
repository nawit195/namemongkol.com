import { describe, expect, test } from 'vitest';

import {
    LIVE_STATS_FETCH_INIT,
    STATS_IDLE_DELAY_MS,
    STATS_POLL_MS,
    formatRealtimeCount,
} from './heroLiveStats';

describe('hero live stats helpers', () => {
    test('requests uncached live stats at a near realtime cadence', () => {
        expect(LIVE_STATS_FETCH_INIT).toEqual({ cache: 'no-store' });
        expect(STATS_POLL_MS).toBeGreaterThanOrEqual(10_000);
        expect(STATS_POLL_MS).toBeLessThanOrEqual(15_000);
        expect(STATS_IDLE_DELAY_MS).toBeLessThanOrEqual(1_500);
    });

    test('formats only positive numbers for social proof counts', () => {
        expect(formatRealtimeCount(258)).toBe('258');
        expect(formatRealtimeCount(0)).toBeNull();
        expect(formatRealtimeCount(-1)).toBeNull();
        expect(formatRealtimeCount(undefined)).toBeNull();
    });
});
