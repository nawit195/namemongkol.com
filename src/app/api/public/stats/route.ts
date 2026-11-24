import { NextResponse } from 'next/server';
import {
    fallbackPublicAggregateStats,
    getCachedPublicAggregateStats,
    getPublicStatsCacheHeaders,
} from '@/lib/publicStats';

export const revalidate = 600;

export async function GET() {
    try {
        const aggregate = await getCachedPublicAggregateStats();

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
