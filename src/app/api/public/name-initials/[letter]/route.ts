import { NextResponse } from 'next/server';
import { THAI_NAME_INITIALS, isThaiNameInitial } from '@/data/thaiInitials';
import { queryPublicNames } from '@/lib/publicNames';

export const revalidate = 600;

export function generateStaticParams() {
    return THAI_NAME_INITIALS.map((letter) => ({ letter }));
}

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ letter: string }> },
) {
    const { letter } = await params;

    if (!isThaiNameInitial(letter)) {
        return NextResponse.json(
            { success: false, data: [], total: 0, page: 1, pageSize: 50, totalPages: 1 },
            { status: 404 },
        );
    }

    const result = await queryPublicNames({
        day: 'all',
        gender: 'all',
        initial: letter,
        page: 1,
        limit: 50,
    });

    return NextResponse.json({
        success: true,
        ...result,
    }, {
        headers: {
            'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=2592000',
        },
    });
}
