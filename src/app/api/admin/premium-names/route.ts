import { createClient as createServiceClient, type SupabaseClient } from '@supabase/supabase-js';
import { revalidatePath, revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';
import {
    buildPremiumAdminRecords,
    normalizePremiumName,
    PREMIUM_ADMIN_DEFAULT_PAGE_SIZE,
    PREMIUM_ADMIN_MAX_IMPORT_SIZE,
    PREMIUM_ADMIN_MAX_PAGE_SIZE,
    sanitizePremiumAdminRecords,
    type PremiumAdminInput,
    type PremiumSharedDetailRow,
} from '@/lib/adminPremiumNames';
import { buildPremiumNamesCsv } from '@/lib/premiumNamesCsv';
import { createClient } from '@/utils/supabaseServer';

export const dynamic = 'force-dynamic';

const DATABASE_PAGE_SIZE = 1000;
const INSERT_BATCH_SIZE = 500;

type ServerClient = Awaited<ReturnType<typeof createClient>>;

async function requireAdmin(supabase: ServerClient) {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();
    if (profile?.role !== 'admin') {
        return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }
    return null;
}

function getMutationClient(): SupabaseClient {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error('Supabase service role is not configured');
    return createServiceClient(url, key, { auth: { persistSession: false } });
}

function revalidatePremiumCatalog(sharedDetailsChanged = false) {
    revalidateTag('premium-names', 'max');
    revalidatePath('/api/public/premium-names');
    revalidatePath('/premium-search');
    revalidatePath('/premium-analysis');
    if (!sharedDetailsChanged) return;

    revalidateTag('public-names', 'max');
    revalidateTag('public-stats', 'max');
    revalidateTag('public-live-stats', 'max');
    revalidatePath('/search');
    revalidatePath('/names', 'layout');
}

function parsePositiveInteger(value: string | null, fallback: number) {
    const parsed = Number.parseInt(value ?? '', 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function escapeLikePattern(value: string) {
    return value.replace(/[\\%_]/g, (character) => `\\${character}`);
}

function getBangkokDateStamp(date = new Date()) {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Bangkok',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).formatToParts(date);
    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    return `${values.year}-${values.month}-${values.day}`;
}

async function fetchSharedDetails(supabase: ServerClient, names: string[]) {
    const details: PremiumSharedDetailRow[] = [];
    for (let index = 0; index < names.length; index += INSERT_BATCH_SIZE) {
        const result = await supabase
            .from('auspicious_names')
            .select('name, gender, pronunciation, pronunciation_draft, pronunciation_status, meaning, meaning_draft, meaning_status, publication_status')
            .in('name', names.slice(index, index + INSERT_BATCH_SIZE));
        if (result.error) throw result.error;
        details.push(...((result.data ?? []) as PremiumSharedDetailRow[]));
    }
    return details;
}

async function fetchAllPremiumMembershipRows(supabase: ServerClient, search: string) {
    const memberships: Array<{ id: number | string; name: string; created_at?: string | null }> = [];
    for (let from = 0; ; from += DATABASE_PAGE_SIZE) {
        let query = supabase
            .from('premium_names')
            .select('id, name, created_at')
            .order('name', { ascending: true })
            .range(from, from + DATABASE_PAGE_SIZE - 1);
        if (search) query = query.ilike('name', `%${escapeLikePattern(search)}%`);
        const { data, error } = await query;
        if (error) throw error;
        const batch = data ?? [];
        memberships.push(...batch);
        if (batch.length < DATABASE_PAGE_SIZE) break;
    }
    return memberships;
}

async function fetchAllPremiumNames(supabase: ServerClient) {
    const names: string[] = [];
    for (let from = 0; ; from += DATABASE_PAGE_SIZE) {
        const { data, error } = await supabase
            .from('premium_names')
            .select('name')
            .order('name', { ascending: true })
            .range(from, from + DATABASE_PAGE_SIZE - 1);
        if (error) {
            if (error.code === '42P01') return [];
            throw error;
        }
        const batch = data?.map((row: { name: string }) => row.name) ?? [];
        names.push(...batch);
        if (batch.length < DATABASE_PAGE_SIZE) break;
    }
    return names;
}

async function fetchAdminRecords(supabase: ServerClient, request: Request) {
    const { searchParams } = new URL(request.url);
    const search = normalizePremiumName(searchParams.get('q')).slice(0, 100);
    const page = parsePositiveInteger(searchParams.get('page'), 1);
    const pageSize = Math.min(
        parsePositiveInteger(searchParams.get('pageSize'), PREMIUM_ADMIN_DEFAULT_PAGE_SIZE),
        PREMIUM_ADMIN_MAX_PAGE_SIZE,
    );
    const from = (page - 1) * pageSize;

    let membershipQuery = supabase
        .from('premium_names')
        .select('id, name, created_at', { count: 'exact' })
        .order('name', { ascending: true })
        .range(from, from + pageSize - 1);
    if (search) membershipQuery = membershipQuery.ilike('name', `%${escapeLikePattern(search)}%`);

    const { data: memberships, count, error } = await membershipQuery;
    if (error) throw error;
    const names = (memberships ?? []).map((row) => row.name);
    const details = names.length > 0 ? await fetchSharedDetails(supabase, names) : [];

    return NextResponse.json({
        success: true,
        records: buildPremiumAdminRecords(memberships ?? [], details),
        count: count ?? 0,
        page,
        pageSize,
    });
}

function detailInsertRow(record: PremiumAdminInput) {
    return {
        name: record.name,
        gender: record.gender ?? 'neutral',
        pronunciation: null,
        pronunciation_draft: record.pronunciation ?? null,
        pronunciation_status: record.pronunciation ? 'draft' : 'pending',
        pronunciation_source: record.pronunciation ? 'manual-admin-draft' : null,
        meaning: null,
        meaning_draft: record.meaning ?? null,
        meaning_status: record.meaning ? 'draft' : 'pending',
        meaning_source: record.meaning ? 'manual-admin-draft' : null,
        publication_status: 'published',
    };
}

async function ensureSharedDetails(service: SupabaseClient, records: PremiumAdminInput[]) {
    const names = records.map((record) => record.name);
    const { data: existingRows, error: readError } = await service
        .from('auspicious_names')
        .select('name')
        .in('name', names);
    if (readError) throw readError;

    const existing = new Set((existingRows ?? []).map((row: { name: string }) => normalizePremiumName(row.name)));
    const missing = records.filter((record) => !existing.has(record.name));
    for (let index = 0; index < missing.length; index += INSERT_BATCH_SIZE) {
        const { error } = await service
            .from('auspicious_names')
            .insert(missing.slice(index, index + INSERT_BATCH_SIZE).map(detailInsertRow));
        if (error) throw error;
    }

    const detailUpdates = records.filter((record) => existing.has(record.name)
        && (record.gender || record.pronunciation || record.meaning));
    for (const record of detailUpdates) {
        const update: Record<string, unknown> = {};
        if (record.gender) update.gender = record.gender;
        if (record.pronunciation) {
            update.pronunciation_draft = record.pronunciation;
            update.pronunciation_status = 'draft';
            update.pronunciation_source = 'manual-admin-draft';
            update.pronunciation_reviewed_at = null;
            update.pronunciation_reviewed_by = null;
        }
        if (record.meaning) {
            update.meaning_draft = record.meaning;
            update.meaning_status = 'draft';
            update.meaning_source = 'manual-admin-draft';
            update.meaning_reviewed_at = null;
            update.meaning_reviewed_by = null;
        }
        const { error } = await service.from('auspicious_names').update(update).eq('name', record.name);
        if (error) throw error;
    }

    return missing.length > 0 || detailUpdates.length > 0;
}

export async function GET(request: Request) {
    try {
        const supabase = await createClient();
        const authError = await requireAdmin(supabase);
        if (authError) return authError;

        const { searchParams } = new URL(request.url);
        if (searchParams.get('view') === 'csv') {
            const search = normalizePremiumName(searchParams.get('q')).slice(0, 100);
            const memberships = await fetchAllPremiumMembershipRows(supabase, search);
            const names = memberships.map((row) => row.name);
            const details = names.length > 0 ? await fetchSharedDetails(supabase, names) : [];
            const csv = buildPremiumNamesCsv(buildPremiumAdminRecords(memberships, details));
            const dateStamp = getBangkokDateStamp();
            const localizedFilename = `รายชื่อ-premium-${dateStamp}.csv`;

            return new NextResponse(csv, {
                headers: {
                    'Content-Type': 'text/csv; charset=utf-8',
                    'Content-Disposition': `attachment; filename="premium-names-${dateStamp}.csv"; filename*=UTF-8''${encodeURIComponent(localizedFilename)}`,
                    'Cache-Control': 'private, no-store',
                    'X-Content-Type-Options': 'nosniff',
                },
            });
        }
        if (searchParams.get('view') === 'records') return fetchAdminRecords(supabase, request);

        const names = await fetchAllPremiumNames(supabase);
        return NextResponse.json({ success: true, count: names.length, names });
    } catch (error) {
        console.error('Premium names GET error:', error);
        return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'โหลดรายชื่อไม่สำเร็จ' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const authError = await requireAdmin(supabase);
        if (authError) return authError;

        const body = await request.json() as { names?: unknown[]; records?: unknown[] };
        const source = Array.isArray(body.records) ? body.records : body.names;
        if (!Array.isArray(source)) {
            return NextResponse.json({ success: false, error: 'names หรือ records ต้องเป็น array' }, { status: 400 });
        }
        if (source.length > PREMIUM_ADMIN_MAX_IMPORT_SIZE) {
            return NextResponse.json({ success: false, error: `เพิ่มได้ไม่เกิน ${PREMIUM_ADMIN_MAX_IMPORT_SIZE} ชื่อต่อครั้ง` }, { status: 400 });
        }

        const sanitized = sanitizePremiumAdminRecords(source);
        if (sanitized.records.length === 0) {
            if (source.length === 0) {
                return NextResponse.json({
                    success: true,
                    stats: {
                        received: 0,
                        uniqueInPayload: 0,
                        inserted: 0,
                        skippedDuplicate: 0,
                        duplicatesInPayload: 0,
                        invalid: 0,
                        totalAfter: 0,
                    },
                });
            }
            return NextResponse.json({ success: false, error: 'ไม่พบรายชื่อที่ถูกต้อง' }, { status: 400 });
        }

        const service = getMutationClient();
        const sharedDetailsChanged = await ensureSharedDetails(service, sanitized.records);
        const { data: insertedRows, error: insertError } = await service
            .from('premium_names')
            .upsert(sanitized.records.map(({ name }) => ({ name })), { onConflict: 'name', ignoreDuplicates: true })
            .select('id, name');
        if (insertError) throw insertError;

        const inserted = insertedRows?.length ?? 0;
        const { count } = await service.from('premium_names').select('*', { count: 'exact', head: true });
        revalidatePremiumCatalog(sharedDetailsChanged || sanitized.records.some((record) => record.gender || record.pronunciation || record.meaning));

        return NextResponse.json({
            success: true,
            stats: {
                received: sanitized.received,
                uniqueInPayload: sanitized.records.length,
                inserted,
                skippedDuplicate: sanitized.records.length - inserted,
                duplicatesInPayload: sanitized.duplicatesInPayload,
                invalid: sanitized.invalid,
                totalAfter: count ?? 0,
            },
        });
    } catch (error) {
        console.error('Premium names POST error:', error);
        return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'เพิ่มรายชื่อไม่สำเร็จ' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const supabase = await createClient();
        const authError = await requireAdmin(supabase);
        if (authError) return authError;

        const body = await request.json() as {
            id?: number | string;
            changes?: { gender?: unknown; pronunciationDraft?: unknown; meaningDraft?: unknown };
        };
        if (body.id === undefined || !body.changes || typeof body.changes !== 'object') {
            return NextResponse.json({ success: false, error: 'ข้อมูลสำหรับแก้ไขไม่ครบ' }, { status: 400 });
        }

        const service = getMutationClient();
        const { data: membership, error: membershipError } = await service
            .from('premium_names')
            .select('id, name')
            .eq('id', body.id)
            .maybeSingle();
        if (membershipError) throw membershipError;
        if (!membership) return NextResponse.json({ success: false, error: 'ไม่พบรายชื่อ Premium' }, { status: 404 });

        const update: Record<string, unknown> = {};
        const gender = body.changes.gender;
        if (gender !== undefined) {
            if (gender !== 'male' && gender !== 'female' && gender !== 'neutral') {
                return NextResponse.json({ success: false, error: 'เพศไม่ถูกต้อง' }, { status: 400 });
            }
            update.gender = gender;
        }
        if (body.changes.pronunciationDraft !== undefined) {
            if (typeof body.changes.pronunciationDraft !== 'string') {
                return NextResponse.json({ success: false, error: 'คำอ่านไม่ถูกต้อง' }, { status: 400 });
            }
            const draft = body.changes.pronunciationDraft.normalize('NFC').trim().slice(0, 150);
            update.pronunciation_draft = draft || null;
            update.pronunciation_status = draft ? 'draft' : 'pending';
            update.pronunciation_source = draft ? 'manual-admin-draft' : null;
            update.pronunciation_reviewed_at = null;
            update.pronunciation_reviewed_by = null;
        }
        if (body.changes.meaningDraft !== undefined) {
            if (typeof body.changes.meaningDraft !== 'string') {
                return NextResponse.json({ success: false, error: 'ความหมายไม่ถูกต้อง' }, { status: 400 });
            }
            const draft = body.changes.meaningDraft.normalize('NFC').trim().slice(0, 1000);
            update.meaning_draft = draft || null;
            update.meaning_status = draft ? 'draft' : 'pending';
            update.meaning_source = draft ? 'manual-admin-draft' : null;
            update.meaning_reviewed_at = null;
            update.meaning_reviewed_by = null;
        }
        if (Object.keys(update).length === 0) {
            return NextResponse.json({ success: false, error: 'ไม่มีข้อมูลที่เปลี่ยนแปลง' }, { status: 400 });
        }

        const { data: detail, error: detailReadError } = await service
            .from('auspicious_names')
            .select('name')
            .eq('name', membership.name)
            .maybeSingle();
        if (detailReadError) throw detailReadError;
        if (detail) {
            const { error } = await service.from('auspicious_names').update(update).eq('name', membership.name);
            if (error) throw error;
        } else {
            const input: PremiumAdminInput = {
                name: membership.name,
                ...(update.gender ? { gender: update.gender as PremiumAdminInput['gender'] } : {}),
                ...(typeof update.pronunciation_draft === 'string' ? { pronunciation: update.pronunciation_draft } : {}),
                ...(typeof update.meaning_draft === 'string' ? { meaning: update.meaning_draft } : {}),
            };
            const { error } = await service.from('auspicious_names').insert(detailInsertRow(input));
            if (error) throw error;
        }

        revalidatePremiumCatalog(true);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Premium names PATCH error:', error);
        return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'แก้ไขรายชื่อไม่สำเร็จ' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const supabase = await createClient();
        const authError = await requireAdmin(supabase);
        if (authError) return authError;

        const body = await request.json() as { id?: number | string };
        if (body.id === undefined) {
            return NextResponse.json({ success: false, error: 'ไม่พบรหัสรายชื่อ' }, { status: 400 });
        }

        const service = getMutationClient();
        const { data, error } = await service
            .from('premium_names')
            .delete()
            .eq('id', body.id)
            .select('id, name')
            .maybeSingle();
        if (error) throw error;
        if (!data) return NextResponse.json({ success: false, error: 'ไม่พบรายชื่อ Premium' }, { status: 404 });

        revalidatePremiumCatalog(false);
        return NextResponse.json({ success: true, removed: data.name });
    } catch (error) {
        console.error('Premium names DELETE error:', error);
        return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'นำรายชื่อออกไม่สำเร็จ' }, { status: 500 });
    }
}
