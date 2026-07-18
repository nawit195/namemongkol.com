import { NextResponse } from 'next/server';
import { petNameUnlockSchema } from '@/lib/petNameApi';
import {
    createPetNameFingerprint,
    normalizePetNameFilters,
    PET_NAME_SET_SIZE,
} from '@/lib/petNameAccess';
import { buildPetNameQueryResponse, getPetNameAdminClient } from '@/lib/petNameServer';
import { getPublicPetNames } from '@/lib/petNames';
import { analyzeExistingPetName, filterAndScorePetNames } from '@/lib/petNameScoring';
import { createClient } from '@/utils/supabaseServer';

export const dynamic = 'force-dynamic';

const privateHeaders = { 'Cache-Control': 'private, no-store, max-age=0' };

export async function POST(request: Request) {
    try {
        const parsed = petNameUnlockSchema.safeParse(await request.json());
        if (!parsed.success) {
            return NextResponse.json({ success: false, error: 'ข้อมูลปลดล็อกไม่ถูกต้อง' }, { status: 400, headers: privateHeaders });
        }

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ success: false, status: 'login_required' }, { status: 401, headers: privateHeaders });
        }

        const admin = getPetNameAdminClient();
        if (!admin) {
            return NextResponse.json({ success: false, error: 'ระบบปลดล็อกยังไม่ได้ตั้งค่า' }, { status: 503, headers: privateHeaders });
        }

        const filters = normalizePetNameFilters(parsed.data.filters);
        const names = await getPublicPetNames();
        let fingerprint: string;
        let resultSlugs: string[];

        if (parsed.data.mode === 'search') {
            fingerprint = createPetNameFingerprint('search', filters);
            const ranked = filterAndScorePetNames(names, filters, PET_NAME_SET_SIZE);
            if (ranked.length < PET_NAME_SET_SIZE) {
                return NextResponse.json({ success: false, status: 'not_chargeable', error: 'ชุดนี้มีชื่อไม่ครบ 12 ชื่อ จึงเปิดให้ดูฟรี' }, { status: 409, headers: privateHeaders });
            }
            resultSlugs = ranked.map((result) => result.slug);
        } else {
            const result = analyzeExistingPetName(parsed.data.name, names, filters);
            if (!result.meaningAvailable) {
                return NextResponse.json({ success: false, status: 'not_chargeable', error: 'ชื่อนี้ยังไม่มีข้อมูลความหมาย จึงไม่มีการหักเครดิต' }, { status: 409, headers: privateHeaders });
            }
            fingerprint = createPetNameFingerprint('analysis', filters, result.slug);
            resultSlugs = [result.slug];
        }

        if (fingerprint !== parsed.data.fingerprint) {
            return NextResponse.json({ success: false, error: 'ตัวกรองมีการเปลี่ยนแปลง กรุณาค้นหาใหม่ก่อนปลดล็อก' }, { status: 409, headers: privateHeaders });
        }

        const { data, error } = await admin.rpc('unlock_pet_name_result', {
            p_user_id: user.id,
            p_unlock_type: parsed.data.mode,
            p_fingerprint: fingerprint,
            p_filters: filters,
            p_result_slugs: resultSlugs,
        });

        if (error) {
            console.error('[pet-name/unlock] rpc failed:', error.message);
            const migrationMissing = error.code === 'PGRST202' || error.message.includes('unlock_pet_name_result');
            return NextResponse.json(
                { success: false, error: migrationMissing ? 'กรุณารัน src/data/setup_pet_name_unlocks.sql ใน Supabase ก่อน' : 'ไม่สามารถหักเครดิตได้ กรุณาลองใหม่' },
                { status: migrationMissing ? 503 : 500, headers: privateHeaders },
            );
        }

        const status = typeof data === 'object' && data && 'status' in data ? String(data.status) : 'unlocked';
        if (status === 'insufficient_credits') {
            return NextResponse.json({ success: false, status, remainingCredits: Number(data.remaining_credits ?? 0) }, { status: 402, headers: privateHeaders });
        }

        const response = await buildPetNameQueryResponse(parsed.data, supabase);
        return NextResponse.json(
            { ...response, unlockStatus: status, remainingCredits: Number(data?.remaining_credits ?? response.viewer.credits ?? 0) },
            { headers: privateHeaders },
        );
    } catch (error) {
        console.error('[pet-name/unlock] failed:', error);
        return NextResponse.json({ success: false, error: 'เกิดข้อผิดพลาดระหว่างปลดล็อก กรุณาลองใหม่' }, { status: 500, headers: privateHeaders });
    }
}
