'use client';

import { useEffect, useState } from 'react';
import { LIVE_STATS_FETCH_INIT } from '@/components/heroLiveStats';

export interface LiveStats {
    totalAnalyses: number;
    totalUsers: number;
    avgRating: number;
    reviewCount: number;
}

interface LiveStatsResponse {
    success?: boolean;
    totals?: {
        analyses?: number;
        members?: number;
    };
    stats?: Partial<LiveStats>;
}

/**
 * Lightweight hook that fetches public live stats once and exposes them.
 * Returns `null` until data is available.
 */
export function useLiveStats(): LiveStats | null {
    const [stats, setStats] = useState<LiveStats | null>(null);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                const res = await fetch('/api/live-stats', LIVE_STATS_FETCH_INIT);
                if (!res.ok) return;
                const data = (await res.json()) as LiveStatsResponse;
                if (cancelled) return;

                setStats({
                    totalAnalyses: data.totals?.analyses ?? data.stats?.totalAnalyses ?? 0,
                    totalUsers: data.totals?.members ?? data.stats?.totalUsers ?? 0,
                    avgRating: data.stats?.avgRating ?? 0,
                    reviewCount: data.stats?.reviewCount ?? 0,
                });
            } catch {
                // silent – components show fallback text
            }
        };

        void load();
        return () => { cancelled = true; };
    }, []);

    return stats;
}
