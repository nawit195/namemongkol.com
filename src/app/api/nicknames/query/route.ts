import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabaseServer';
import { normalizeNicknameFilters } from '@/lib/auspiciousNicknameShared';
import { queryNicknames } from '@/lib/auspiciousNicknames';
import { buildNicknameResponse } from '@/lib/auspiciousNicknameServer';
import { getPremiumNicknameCatalog } from '@/lib/auspiciousNicknameCatalogServer';
import {
    nicknamePrivateHeaders as headers,
    nicknameQuerySchema,
    nicknameSameOrigin,
    readNicknameBody,
} from '@/lib/auspiciousNicknameApi';

export async function POST(request: Request) {
    if (!nicknameSameOrigin(request))
        return NextResponse.json({ success: false }, { status: 403, headers });
    let input;
    try {
        input = nicknameQuerySchema.safeParse(await readNicknameBody(request));
    } catch {
        return NextResponse.json(
            { success: false, error: 'ข้อมูลค้นหาไม่ถูกต้อง' },
            { status: 400, headers },
        );
    }
    if (!input.success)
        return NextResponse.json(
            { success: false, error: 'ข้อมูลค้นหาไม่ถูกต้อง' },
            { status: 400, headers },
        );
    try {
        const filters = normalizeNicknameFilters(input.data.filters);
        if (filters.group === 'ab')
            return NextResponse.json(queryNicknames(filters).response, {
                headers,
            });
        const supabase = await createClient();
        const {
            data: { user },
            error,
        } = await supabase.auth.getUser();
        if (error && error.name !== 'AuthSessionMissingError')
            return NextResponse.json(
                { success: false, error: 'ตรวจสอบบัญชีไม่สำเร็จ กรุณาลองใหม่' },
                { status: 503, headers },
            );
        if (!user)
            return NextResponse.json(
                queryNicknames(
                    { ...filters, view: 'all' },
                    [],
                    await getPremiumNicknameCatalog(),
                ).response,
                { headers },
            );
        return NextResponse.json(
            await buildNicknameResponse(filters, supabase, user.id),
            { headers },
        );
    } catch (error) {
        console.error(
            '[nicknames/query]',
            error instanceof Error ? error.message : 'Query failed',
        );
        return NextResponse.json(
            { success: false, error: 'โหลดรายชื่อไม่สำเร็จ กรุณาลองใหม่' },
            { status: 503, headers },
        );
    }
}
