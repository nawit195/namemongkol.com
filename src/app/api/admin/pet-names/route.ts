import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { PET_NAME_SEEDS, PET_NAME_SEED_COUNT } from '@/data/petNamesSeed';
import { createClient } from '@/utils/supabaseServer';
import { mapPetNameRow, toPetNameRow, type PetNameRow } from '@/lib/petNames';

export const dynamic = 'force-dynamic';

const recordSchema = z.object({
    id: z.string().uuid().optional(),
    slug: z.string().trim().min(1).max(100),
    nameTh: z.string().trim().min(1).max(100),
    nameEn: z.string().trim().max(100).default(''),
    pronunciation: z.string().trim().min(1).max(150),
    meaning: z.string().trim().min(1).max(500),
    language: z.enum(['thai', 'english', 'japanese', 'korean', 'international']),
    petTypes: z.array(z.enum(['dog', 'cat', 'other'])).min(1),
    genders: z.array(z.enum(['male', 'female', 'neutral'])).min(1),
    traits: z.array(z.string().trim().min(1)).max(12),
    styles: z.array(z.string().trim().min(1)).max(12),
    intents: z.array(z.string().trim().min(1)).max(12),
    syllables: z.number().int().min(1).max(5),
    initial: z.string().trim().min(1).max(2),
    meaningScore: z.number().int().min(0).max(100),
    pronunciationScore: z.number().int().min(0).max(100),
    distinctivenessScore: z.number().int().min(0).max(100),
    isActive: z.boolean(),
    updatedAt: z.string().optional(),
});

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

async function requireAdmin(supabase: SupabaseServerClient) {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase.from('user_profiles').select('role').eq('id', user.id).maybeSingle();
    if (profile?.role !== 'admin') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    return null;
}

function validationError(error: z.ZodError) {
    return NextResponse.json({ success: false, error: 'ข้อมูลไม่ถูกต้อง', details: error.flatten() }, { status: 400 });
}

export async function GET() {
    const supabase = await createClient();
    const authError = await requireAdmin(supabase);
    if (authError) return authError;

    const { data, error } = await supabase.from('pet_names').select('*').order('name_th', { ascending: true });
    if (error) return NextResponse.json({ success: false, error: error.code === '42P01' ? 'กรุณารัน src/data/setup_pet_names.sql ก่อน' : error.message }, { status: 500 });
    return NextResponse.json({ success: true, count: data?.length ?? 0, seedCount: PET_NAME_SEED_COUNT, names: ((data ?? []) as PetNameRow[]).map(mapPetNameRow) });
}

export async function POST(request: Request) {
    const supabase = await createClient();
    const authError = await requireAdmin(supabase);
    if (authError) return authError;

    const body = await request.json() as { action?: string; records?: unknown[] };
    const source = body.action === 'seed' ? PET_NAME_SEEDS : body.records;
    if (!Array.isArray(source)) return NextResponse.json({ success: false, error: 'records must be an array' }, { status: 400 });

    const parsed = z.array(recordSchema).safeParse(source);
    if (!parsed.success) return validationError(parsed.error);

    const { data, error } = await supabase
        .from('pet_names')
        .upsert(parsed.data.map(toPetNameRow), { onConflict: 'slug' })
        .select('id');
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

    revalidateTag('pet-names', 'max');
    return NextResponse.json({ success: true, saved: data?.length ?? 0 });
}

export async function PATCH(request: Request) {
    const supabase = await createClient();
    const authError = await requireAdmin(supabase);
    if (authError) return authError;

    const body = await request.json() as { id?: string; record?: unknown };
    if (!body.id) return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 });
    const parsed = recordSchema.safeParse(body.record);
    if (!parsed.success) return validationError(parsed.error);

    const { error } = await supabase.from('pet_names').update({ ...toPetNameRow(parsed.data), updated_at: new Date().toISOString() }).eq('id', body.id);
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

    revalidateTag('pet-names', 'max');
    return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
    const supabase = await createClient();
    const authError = await requireAdmin(supabase);
    if (authError) return authError;

    const body = await request.json() as { id?: string };
    if (!body.id) return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 });
    const { error } = await supabase.from('pet_names').delete().eq('id', body.id);
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

    revalidateTag('pet-names', 'max');
    return NextResponse.json({ success: true });
}
