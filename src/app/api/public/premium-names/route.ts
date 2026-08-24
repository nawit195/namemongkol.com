import { NextResponse } from 'next/server';
import { fetchPublicPremiumNameDetails } from '@/lib/premiumNameDetails';

const CACHE_SECONDS = 600;

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const data = await fetchPublicPremiumNameDetails();
        return NextResponse.json({ success: true, data, total: data.length }, {
            headers: {
                'Cache-Control': `public, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=2592000`,
            },
        });
    } catch (error) {
        console.error('Failed to fetch public premium names:', error);
        return NextResponse.json({ success: false, data: [], total: 0 }, { status: 500 });
    }
}
