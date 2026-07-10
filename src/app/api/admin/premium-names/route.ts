/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabaseServer';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 1000;
const INSERT_BATCH_SIZE = 500;

async function fetchAllPremiumNames() {
    const supabase = await createClient();
    const names: string[] = [];
    let from = 0;

    while (true) {
        const { data, error } = await supabase
            .from('premium_names')
            .select('name')
            .order('name', { ascending: true })
            .range(from, from + PAGE_SIZE - 1);

        if (error) {
            // If table doesn't exist yet, we can gracefully return empty
            // array or log the error.
            if (error.code === '42P01') {
                console.warn('premium_names table does not exist yet. Please run migration.');
                return [];
            }
            throw error;
        }

        const batch = data?.map((row: { name: string }) => row.name) ?? [];
        names.push(...batch);

        if (batch.length < PAGE_SIZE) {
            break;
        }

        from += PAGE_SIZE;
    }

    return names;
}

async function requireAdmin(supabase: any) {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return { error: NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 }) };
    }

    const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin') {
        return { error: NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 }) };
    }

    return { user };
}

/** Trim + dedupe names from raw input, return unique list and stats */
function sanitizeNames(raw: string[]): { unique: string[]; received: number; duplicatesInPayload: number; invalid: number } {
    const received = raw.length;
    let invalid = 0;
    const seen = new Set<string>();
    const unique: string[] = [];

    for (const r of raw) {
        const trimmed = typeof r === 'string' ? r.trim() : '';
        if (trimmed.length === 0) {
            invalid++;
            continue;
        }
        if (seen.has(trimmed)) {
            continue;
        }
        seen.add(trimmed);
        unique.push(trimmed);
    }

    const duplicatesInPayload = received - invalid - unique.length;
    return { unique, received, duplicatesInPayload, invalid };
}

export async function GET() {
    try {
        const supabase = await createClient();
        const auth = await requireAdmin(supabase);
        if ('error' in auth && auth.error) return auth.error;

        const names = await fetchAllPremiumNames();
        return NextResponse.json({ success: true, count: names.length, names });
    } catch (error: any) {
        console.error('Premium names GET error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const auth = await requireAdmin(supabase);
        if ('error' in auth && auth.error) return auth.error;

        const body = await req.json();
        const { names } = body;

        if (!Array.isArray(names)) {
            return NextResponse.json({ success: false, error: 'Invalid data format' }, { status: 400 });
        }

        // Sanitize: trim + dedupe within payload
        const { unique, received, duplicatesInPayload, invalid } = sanitizeNames(names);

        console.log(`[Premium Names] POST received=${received} unique=${unique.length} dupsInPayload=${duplicatesInPayload} invalid=${invalid}`);

        if (unique.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'No valid names to insert',
                stats: { received, uniqueInPayload: 0, inserted: 0, skippedDuplicate: 0, duplicatesInPayload, invalid, totalAfter: 0 }
            });
        }

        let inserted = 0;
        let skippedDuplicate = 0;

        const insertData = unique.map((name) => ({ name }));

        for (let i = 0; i < insertData.length; i += INSERT_BATCH_SIZE) {
            const chunk = insertData.slice(i, i + INSERT_BATCH_SIZE);

            // Use upsert with ignoreDuplicates to skip existing names (UNIQUE constraint on `name`)
            const { data: upsertData, error: upsertError } = await supabase
                .from('premium_names')
                .upsert(chunk, { onConflict: 'name', ignoreDuplicates: true })
                .select('name');

            if (upsertError) {
                console.error('Upsert error:', upsertError);
                throw upsertError;
            }

            const insertedCount = upsertData?.length ?? 0;
            inserted += insertedCount;
            skippedDuplicate += chunk.length - insertedCount;
        }

        // Just get the new total count
        const { count } = await supabase.from('premium_names').select('*', { count: 'exact', head: true });

        console.log(`[Premium Names] Append done: inserted=${inserted} skipped=${skippedDuplicate}`);

        return NextResponse.json({
            success: true,
            message: `Append complete: inserted ${inserted}, skipped ${skippedDuplicate} duplicates`,
            stats: { 
                received, 
                uniqueInPayload: unique.length, 
                inserted, 
                skippedDuplicate, 
                duplicatesInPayload, 
                invalid,
                totalAfter: count ?? 0
            }
        });

    } catch (error: any) {
        console.error('Premium names POST error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
