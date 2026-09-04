import { NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import {
    PUBLIC_STATS_REVALIDATE_SECONDS,
    fallbackPublicAggregateStats,
    fetchPublicAggregateStats,
    getPublicStatsCacheHeaders,
} from '@/lib/publicStats';

export const revalidate = 120;

const getCachedLiveStats = unstable_cache(
    fetchPublicAggregateStats,
    ['public-live-stats:v3'],
    {
        revalidate: PUBLIC_STATS_REVALIDATE_SECONDS,
        tags: ['public-live-stats', 'public-stats'],
    },
);

export async function GET() {
    try {
        return NextResponse.json(
            await getCachedLiveStats(),
            { headers: getPublicStatsCacheHeaders() },
        );
    } catch (err) {
        console.error('[live-stats]', err);

        return NextResponse.json(
            fallbackPublicAggregateStats(),
            {
                status: 200,
                headers: getPublicStatsCacheHeaders(),
            },
        );
    }
}
