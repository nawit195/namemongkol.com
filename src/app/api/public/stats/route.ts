import { NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import {
    PUBLIC_STATS_REVALIDATE_SECONDS,
    fallbackPublicAggregateStats,
    fetchPublicAggregateStats,
    getPublicStatsCacheHeaders,
} from '@/lib/publicStats';

export const revalidate = 600;

const getCachedPublicStats = unstable_cache(
    fetchPublicAggregateStats,
    ['public-stats:v3'],
    {
        revalidate: PUBLIC_STATS_REVALIDATE_SECONDS,
        tags: ['public-stats', 'public-live-stats'],
    },
);

export async function GET() {
    try {
        const aggregate = await getCachedPublicStats();

        return NextResponse.json(
            {
                success: aggregate.success,
                stats: aggregate.stats,
                totals: aggregate.totals,
                counts: aggregate.counts,
                onlineNow: aggregate.onlineNow,
                ts: aggregate.ts,
            },
            { headers: getPublicStatsCacheHeaders() },
        );
    } catch (err) {
        console.error('[public-stats]', err);

        const fallback = fallbackPublicAggregateStats();
        return NextResponse.json(
            {
                success: false,
                stats: fallback.stats,
                totals: fallback.totals,
                counts: fallback.counts,
                onlineNow: fallback.onlineNow,
                ts: fallback.ts,
            },
            {
                status: 200,
                headers: getPublicStatsCacheHeaders(),
            },
        );
    }
}
