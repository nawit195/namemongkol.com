import { NextResponse } from 'next/server';
import { fetchPublicPremiumNameDetails, fetchPremiumLatestAddedAt } from '@/lib/premiumNameDetails';

const CACHE_SECONDS = 600;

// This response is public and identical for every visitor. Cache the completed
// response and allow the tagged database page caches to work on a cache miss.
export const revalidate = 600;

export async function GET() {
    try {
        const [data, latestAddedAt] = await Promise.all([fetchPublicPremiumNameDetails(), fetchPremiumLatestAddedAt()]);
        return NextResponse.json({ success: true, data, total: data.length, latestAddedAt }, {
            headers: {
                'Cache-Control': `public, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=2592000`,
            },
        });
    } catch (error) {
        console.error('Failed to fetch public premium names:', error);
        return NextResponse.json({ success: false, data: [], total: 0 }, {
            status: 500,
            headers: { 'Cache-Control': 'no-store' },
        });
    }
}
