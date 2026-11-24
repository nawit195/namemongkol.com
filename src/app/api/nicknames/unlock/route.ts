import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabaseServer';
import { getPremiumNicknameCatalog } from '@/lib/auspiciousNicknameCatalogServer';
import { normalizeNicknameFilters } from '@/lib/auspiciousNicknameShared';
import {
    NICKNAME_CATALOG_VERSION,
    queryNicknames,
} from '@/lib/auspiciousNicknames';
import {
    nicknameQuoteHash,
    verifyNicknameQuote,
} from '@/lib/auspiciousNicknameQuote';
import {
    buildNicknameResponse,
    getNicknameAdminClient,
    loadNicknameAccess,
} from '@/lib/auspiciousNicknameServer';
import {
    nicknamePrivateHeaders as headers,
    nicknameSameOrigin,
    nicknameUnlockSchema,
    readNicknameBody,
} from '@/lib/auspiciousNicknameApi';

export async function POST(request: Request) {
    if (!nicknameSameOrigin(request))
        return NextResponse.json({ success: false }, { status: 403, headers });
    let input;
    try {
        input = nicknameUnlockSchema.safeParse(await readNicknameBody(request));
    } catch {
        return NextResponse.json(
            { success: false, error: 'ข้อมูลปลดล็อกไม่ถูกต้อง' },
            { status: 400, headers },
        );
    }
    if (
        !input.success ||
        input.data.filters.group !== 'aplus' ||
        input.data.filters.view === 'owned'
    ) {
        return NextResponse.json(
            { success: false, error: 'ข้อมูลปลดล็อกไม่ถูกต้อง' },
            { status: 400, headers },
        );
    }
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user)
            return NextResponse.json(
                { success: false, status: 'login_required' },
                { status: 401, headers },
            );
        const filters = normalizeNicknameFilters(input.data.filters);
        const admin = getNicknameAdminClient();
        const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!admin || !secret)
            return NextResponse.json(
                { success: false, error: 'ระบบปลดล็อกยังไม่พร้อมใช้งาน' },
                { status: 503, headers },
            );

        // A lost HTTP response can be retried even after its quote expires.
        const receipt = await supabase
            .from('nickname_unlocks')
            .select('id,result_ids')
            .eq('user_id', user.id)
            .eq('request_id', input.data.requestId)
            .maybeSingle();
        if (receipt.error)
            return NextResponse.json(
                {
                    success: false,
                    error: 'ตรวจสอบสิทธิ์ไม่สำเร็จ กรุณาลองใหม่',
                },
                { status: 503, headers },
            );
        if (receipt.data)
            return NextResponse.json(
                {
                    ...(await buildNicknameResponse(
                        filters,
                        supabase,
                        user.id,
                    )),
                    unlockStatus: 'already_unlocked',
                    receivedCount: receipt.data.result_ids.length,
                },
                { headers },
            );

        const quote = verifyNicknameQuote(
            input.data.quote,
            secret,
            user.id,
            NICKNAME_CATALOG_VERSION,
            filters,
        );
        if (!quote)
            return NextResponse.json(
                {
                    success: false,
                    status: 'stale_quote',
                    error: 'เงื่อนไขปลดล็อกหมดอายุ กรุณาค้นหาใหม่ก่อนยืนยัน',
                },
                { status: 409, headers },
            );
        const access = await loadNicknameAccess(supabase, user.id);
        if (!access.available)
            return NextResponse.json(
                { success: false, error: 'ระบบปลดล็อกยังไม่พร้อมใช้งาน' },
                { status: 503, headers },
            );
        const { candidates } = queryNicknames(
            filters,
            access.purchased,
            await getPremiumNicknameCatalog(),
        );
        const ids = candidates.map((item) => item.id);
        if (JSON.stringify(ids) !== JSON.stringify(quote.ids)) {
            return NextResponse.json(
                {
                    success: false,
                    status: 'stale_quote',
                    error: 'สิทธิ์รายชื่อเปลี่ยนแล้ว กรุณาค้นหาใหม่ ไม่มีการหักเครดิต',
                },
                { status: 409, headers },
            );
        }
        const { data, error } = await admin.rpc('unlock_nickname_batch', {
            p_user_id: user.id,
            p_request_id: input.data.requestId,
            p_quote_hash: nicknameQuoteHash(quote),
            p_catalog_version: NICKNAME_CATALOG_VERSION,
            p_filters: quote.filters,
            p_snapshot: candidates,
        });
        if (error) throw new Error('Nickname purchase could not be completed');
        if (data.status === 'insufficient_credits')
            return NextResponse.json(
                {
                    success: false,
                    status: data.status,
                    error: 'เครดิตไม่เพียงพอ',
                    remainingCredits: data.remaining_credits,
                },
                { status: 402, headers },
            );
        if (data.status === 'stale_quote')
            return NextResponse.json(
                {
                    success: false,
                    status: data.status,
                    error: 'มีการปลดล็อกชื่อในชุดนี้แล้ว กรุณาค้นหาใหม่ ไม่มีการหักเครดิต',
                },
                { status: 409, headers },
            );
        return NextResponse.json(
            {
                ...(await buildNicknameResponse(filters, supabase, user.id)),
                unlockStatus: data.status,
                receivedCount: data.received_count,
            },
            { headers },
        );
    } catch (error) {
        console.error(
            '[nicknames/unlock]',
            error instanceof Error ? error.message : 'Unlock failed',
        );
        return NextResponse.json(
            {
                success: false,
                error: 'ยังยืนยันผลปลดล็อกไม่ได้ กรุณาลองอีกครั้ง ระบบจะตรวจคำขอเดิมก่อนหักเครดิต',
            },
            { status: 503, headers },
        );
    }
}
