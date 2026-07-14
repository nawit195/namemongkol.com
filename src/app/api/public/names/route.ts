import { NextRequest, NextResponse } from 'next/server';
import { thaksaConfig, type DayKey } from '@/data/thaksa';
import { queryPublicNames, type PublicNameGender } from '@/lib/publicNames';

const NAMES_REVALIDATE_SECONDS = 600;

// Keep public search close to the database while still caching enough for Vercel Free.
export const revalidate = 600;

export async function GET(request: NextRequest) {
    try {
        const params = request.nextUrl.searchParams;
        const rawDay = params.get('day') ?? 'all';
        const rawGender = params.get('gender') ?? 'all';
        const day = rawDay === 'all' || rawDay in thaksaConfig ? rawDay as DayKey | 'all' : 'all';
        const gender = ['all', 'male', 'female', 'neutral'].includes(rawGender)
            ? rawGender as PublicNameGender | 'all'
            : 'all';
        const page = Number.parseInt(params.get('page') ?? '1', 10);
        const limit = Number.parseInt(params.get('limit') ?? '30', 10);
        const result = await queryPublicNames({
            day,
            gender,
            initial: params.get('initial') ?? 'all',
            page: Number.isFinite(page) ? page : 1,
            limit: Number.isFinite(limit) ? limit : 30,
        });

        return NextResponse.json({
            success: true,
            ...result,
        }, {
            headers: {
                'Cache-Control': `public, s-maxage=${NAMES_REVALIDATE_SECONDS}, stale-while-revalidate=2592000`,
            },
        });

    } catch (err) {
        console.error('Failed to fetch /names:', err);
        return NextResponse.json(
            { success: false, data: [], total: 0, page: 1, pageSize: 30, totalPages: 1 },
            { status: 500 }
        );
    }
}
