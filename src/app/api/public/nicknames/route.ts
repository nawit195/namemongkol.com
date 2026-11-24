import { NextResponse } from 'next/server';
import { normalizeNicknameFilters } from '@/lib/auspiciousNicknameShared';
import { queryNicknames } from '@/lib/auspiciousNicknames';
import { getPremiumNicknameCatalog } from '@/lib/auspiciousNicknameCatalogServer';

export const revalidate = 600;

export async function GET(request: Request) {
    const filters = normalizeNicknameFilters(
        Object.fromEntries(new URL(request.url).searchParams),
    );
    // A public request can never turn a purchase/owned flag into access.
    try {
        const premium =
            filters.group === 'aplus' ? await getPremiumNicknameCatalog() : [];
        const { response } = queryNicknames(
            { ...filters, view: 'all' },
            [],
            premium,
        );
        return NextResponse.json(response, {
            headers: {
                'Cache-Control':
                    'public, s-maxage=600, stale-while-revalidate=86400',
            },
        });
    } catch {
        return NextResponse.json(
            { success: false, error: 'โหลดคลังชื่อเล่นไม่สำเร็จ กรุณาลองใหม่' },
            { status: 503, headers: { 'Cache-Control': 'no-store' } },
        );
    }
}
