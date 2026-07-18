import { NextResponse } from 'next/server';
import { petNameQuerySchema } from '@/lib/petNameApi';
import { buildPetNameQueryResponse } from '@/lib/petNameServer';
import { createClient } from '@/utils/supabaseServer';

export const dynamic = 'force-dynamic';

const privateHeaders = { 'Cache-Control': 'private, no-store, max-age=0' };

export async function POST(request: Request) {
    try {
        const parsed = petNameQuerySchema.safeParse(await request.json());
        if (!parsed.success) {
            return NextResponse.json({ success: false, error: 'ข้อมูลค้นหาไม่ถูกต้อง' }, { status: 400, headers: privateHeaders });
        }

        const supabase = await createClient();
        const response = await buildPetNameQueryResponse(parsed.data, supabase);
        return NextResponse.json(response, { headers: privateHeaders });
    } catch (error) {
        console.error('[pet-name/query] failed:', error);
        return NextResponse.json({ success: false, error: 'ยังไม่สามารถค้นหาชื่อได้ กรุณาลองอีกครั้ง' }, { status: 500, headers: privateHeaders });
    }
}
