import { NextResponse } from 'next/server';
import {
    fallbackPublicAggregateStats,
    getCachedPublicAggregateStats,
    getPublicStatsCacheHeaders,
} from '@/lib/publicStats';

export const revalidate = 120;

export async function GET() {
    try {
        return NextResponse.json(
            await getCachedPublicAggregateStats(),
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
