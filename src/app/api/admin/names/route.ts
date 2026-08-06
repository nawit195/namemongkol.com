/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabaseServer';
import {
    analyzeNameRoots,
    buildMeaningBatchPrompt,
    canGenerateMeaningDraft,
    parseGeminiMeaningBatchResponse,
} from '@/lib/nameMeaningDraft';

const PAGE_SIZE = 1000;
const INSERT_BATCH_SIZE = 500;
const MEANING_BATCH_SIZE = 20;
const MEANING_STATUSES = ['pending', 'draft', 'approved', 'rejected'] as const;
type MeaningStatus = typeof MEANING_STATUSES[number];

type MeaningImportRecord = {
    name: string;
    meaning?: string;
    gender?: 'male' | 'female' | 'neutral';
};

function revalidatePublicNames() {
    revalidateTag('public-names', 'max');
    revalidatePath('/search');
}

async function fetchAllAuspiciousNames() {
    const supabase = await createClient();
    const names: string[] = [];
    let from = 0;

    while (true) {
        const { data, error } = await supabase
            .from('auspicious_names')
            .select('name')
            .order('name', { ascending: true })
            .range(from, from + PAGE_SIZE - 1);

        if (error) {
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

async function getGeminiApiKey() {
    if (process.env.GEMINI_API_KEY?.trim()) return process.env.GEMINI_API_KEY.trim();

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return null;

    const service = createServiceClient(url, key, { auth: { persistSession: false } });
    const { data } = await service
        .from('app_secrets')
        .select('value')
        .eq('key', 'gemini_api_key')
        .maybeSingle();
    return typeof data?.value === 'string' && data.value.trim() ? data.value.trim() : null;
}

function normalizeMeaningRecord(value: unknown): MeaningImportRecord | null {
    if (!value || typeof value !== 'object') return null;
    const input = value as Record<string, unknown>;
    const name = typeof input.name === 'string' ? input.name.trim() : '';
    if (!name) return null;
    const meaning = typeof input.meaning === 'string' ? input.meaning.trim() : '';
    const gender = input.gender === 'male' || input.gender === 'female' ? input.gender : 'neutral';
    return { name, meaning: meaning || undefined, gender };
}

async function generateMeaningDrafts(supabase: any, ids?: string[]) {
    let query = supabase
        .from('auspicious_names')
        .select('id, name')
        .eq('meaning_status', 'pending')
        .is('meaning_review_notes', null)
        .order('created_at', { ascending: true })
        .limit(MEANING_BATCH_SIZE);

    if (ids?.length) query = query.in('id', ids.slice(0, MEANING_BATCH_SIZE));
    const { data, error } = await query;
    if (error) throw error;

    const rows = (data ?? []) as Array<{ id: string; name: string }>;
    const analyzed = rows.map((row) => ({ ...row, coverage: analyzeNameRoots(row.name) }));
    const eligible = analyzed.filter((row) => canGenerateMeaningDraft(row.coverage));
    const blocked = analyzed.filter((row) => !canGenerateMeaningDraft(row.coverage));

    await Promise.all(blocked.map((row) => supabase
        .from('auspicious_names')
        .update({
            meaning_review_notes: `รอตรวจรากศัพท์: coverage ${Math.round(row.coverage.coverage * 100)}%`,
            meaning_source: 'roots',
        })
        .eq('id', row.id)));

    if (eligible.length === 0) return { processed: rows.length, drafted: 0, blocked: blocked.length };

    const apiKey = await getGeminiApiKey();
    if (!apiKey) throw new Error('Gemini API key is not configured');

    const model = process.env.GEMINI_TEXT_MODEL || 'gemini-2.5-flash-lite';
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: buildMeaningBatchPrompt(eligible) }] }],
            generationConfig: { temperature: 0.2, maxOutputTokens: 4096, responseMimeType: 'application/json' },
        }),
    });
    if (!response.ok) throw new Error(`Gemini request failed (${response.status})`);

    const payload = await response.json();
    const rawText = payload?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (typeof rawText !== 'string') throw new Error('Gemini returned an empty response');

    let decoded: unknown;
    try {
        decoded = JSON.parse(rawText);
    } catch {
        throw new Error('Gemini returned invalid JSON');
    }
    const drafts = parseGeminiMeaningBatchResponse(decoded);
    if (!drafts) throw new Error('Gemini response did not match the meaning schema');

    const eligibleById = new Map(eligible.map((row) => [row.id, row]));
    const acceptedDrafts = drafts.filter((draft) => eligibleById.has(draft.id));
    await Promise.all(acceptedDrafts.map((draft) => {
        const row = eligibleById.get(draft.id)!;
        const roots = row.coverage.roots.map((entry) => entry.root).join(' + ');
        return supabase
            .from('auspicious_names')
            .update({
                meaning_draft: draft.meaning,
                meaning_status: 'draft',
                meaning_source: 'roots+gemini',
                meaning_review_notes: `รากศัพท์: ${roots} | coverage ${Math.round(row.coverage.coverage * 100)}%`,
            })
            .eq('id', draft.id);
    }));

    return { processed: rows.length, drafted: acceptedDrafts.length, blocked: blocked.length };
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

export async function GET(req: Request) {
    try {
        const supabase = await createClient();
        const auth = await requireAdmin(supabase);
        if ('error' in auth && auth.error) return auth.error;

        const { searchParams } = new URL(req.url);
        if (searchParams.get('view') === 'meaning-review') {
            const rawStatus = searchParams.get('status');
            const status = MEANING_STATUSES.includes(rawStatus as MeaningStatus)
                ? rawStatus as MeaningStatus
                : 'pending';
            const search = searchParams.get('q')?.trim() ?? '';
            const page = Math.max(1, Number.parseInt(searchParams.get('page') ?? '1', 10) || 1);
            const pageSize = 30;
            const from = (page - 1) * pageSize;

            let recordsQuery = supabase
                .from('auspicious_names')
                .select('id, name, gender, meaning, meaning_draft, meaning_status, meaning_source, meaning_review_notes, updated_at', { count: 'exact' })
                .eq('meaning_status', status)
                .order('updated_at', { ascending: false })
                .range(from, from + pageSize - 1);
            if (search) recordsQuery = recordsQuery.ilike('name', `%${search}%`);

            const countQueries = MEANING_STATUSES.map((item) => supabase
                .from('auspicious_names')
                .select('*', { count: 'exact', head: true })
                .eq('meaning_status', item));
            const [recordsResult, ...countResults] = await Promise.all([recordsQuery, ...countQueries]);
            if (recordsResult.error) throw recordsResult.error;

            const counts = Object.fromEntries(MEANING_STATUSES.map((item, index) => [
                item,
                countResults[index]?.count ?? 0,
            ]));

            return NextResponse.json({
                success: true,
                records: recordsResult.data ?? [],
                counts,
                total: recordsResult.count ?? 0,
                page,
                pageSize,
            });
        }

        const names = await fetchAllAuspiciousNames();

        return NextResponse.json({
            success: true,
            count: names.length,
            names: names
        });
    } catch (error: any) {
        console.error('Fetch error:', error);
        return NextResponse.json({ success: false, error: 'Failed to read names' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const supabase = await createClient();

        const auth = await requireAdmin(supabase);
        if ('error' in auth && auth.error) return auth.error;

        const body = await req.json();
        const action = typeof body.action === 'string' ? body.action : '';

        if (action === 'generate_meaning_drafts') {
            const ids = Array.isArray(body.ids)
                ? body.ids.filter((id: unknown): id is string => typeof id === 'string').slice(0, MEANING_BATCH_SIZE)
                : undefined;
            const result = await generateMeaningDrafts(supabase, ids);
            return NextResponse.json({ success: true, ...result });
        }

        if (action === 'review_meaning') {
            const id = typeof body.id === 'string' ? body.id : '';
            const decision = body.decision === 'approved' || body.decision === 'rejected' ? body.decision : null;
            const draft = typeof body.meaningDraft === 'string' ? body.meaningDraft.trim() : '';
            if (!id || !decision || (decision === 'approved' && draft.length < 3)) {
                return NextResponse.json({ success: false, error: 'Invalid review payload' }, { status: 400 });
            }

            const update = decision === 'approved'
                ? {
                    meaning: draft,
                    meaning_draft: draft,
                    meaning_status: 'approved',
                    meaning_reviewed_at: new Date().toISOString(),
                    meaning_reviewed_by: auth.user.id,
                }
                : {
                    meaning: null,
                    meaning_status: 'rejected',
                    meaning_reviewed_at: new Date().toISOString(),
                    meaning_reviewed_by: auth.user.id,
                };
            const { error } = await supabase.from('auspicious_names').update(update).eq('id', id);
            if (error) throw error;
            revalidatePublicNames();
            return NextResponse.json({ success: true });
        }

        if (action === 'save_meaning_draft') {
            const id = typeof body.id === 'string' ? body.id : '';
            const draft = typeof body.meaningDraft === 'string' ? body.meaningDraft.trim() : '';
            if (!id || draft.length < 3) {
                return NextResponse.json({ success: false, error: 'Invalid draft payload' }, { status: 400 });
            }
            const { error } = await supabase
                .from('auspicious_names')
                .update({ meaning_draft: draft, meaning_status: 'draft', meaning_source: 'manual' })
                .eq('id', id);
            if (error) throw error;
            return NextResponse.json({ success: true });
        }

        const { names, mode = 'append' } = body;
        const importedRecords: MeaningImportRecord[] = Array.isArray(body.records)
            ? body.records.map(normalizeMeaningRecord).filter((record: MeaningImportRecord | null): record is MeaningImportRecord => Boolean(record))
            : [];
        const rawNames = Array.isArray(names) ? names : importedRecords.map((record) => record.name);

        if (!Array.isArray(rawNames)) {
            return NextResponse.json({ success: false, error: 'Invalid data format' }, { status: 400 });
        }

        if (mode !== 'append' && mode !== 'replace') {
            return NextResponse.json({ success: false, error: 'Invalid mode. Use "append" or "replace".' }, { status: 400 });
        }

        // Sanitize: trim + dedupe within payload
        const { unique, received, duplicatesInPayload, invalid } = sanitizeNames(rawNames);
        const recordsByName = new Map(importedRecords.map((record) => [record.name, record]));

        console.log(`[Admin Names] POST mode=${mode} received=${received} unique=${unique.length} dupsInPayload=${duplicatesInPayload} invalid=${invalid}`);

        if (unique.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'No valid names to insert',
                stats: { received, uniqueInPayload: 0, inserted: 0, skippedDuplicate: 0, duplicatesInPayload, invalid }
            });
        }

        // ─── Replace mode: delete all then insert ───
        if (mode === 'replace') {
            const { error: deleteError } = await supabase
                .from('auspicious_names')
                .delete()
                .gte('created_at', '1900-01-01');

            if (deleteError) {
                console.error('Delete error:', deleteError);
                throw deleteError;
            }

            console.log('[Admin Names] Replace mode: deleted all existing names');

            const insertData = unique.map((name) => {
                const record = recordsByName.get(name);
                return {
                    name,
                    gender: record?.gender ?? 'neutral',
                    meaning: record?.meaning ?? null,
                    meaning_draft: record?.meaning ?? null,
                    meaning_status: record?.meaning ? 'approved' : 'pending',
                    meaning_source: record?.meaning ? 'manual-import' : null,
                };
            });
            for (let i = 0; i < insertData.length; i += INSERT_BATCH_SIZE) {
                const chunk = insertData.slice(i, i + INSERT_BATCH_SIZE);
                const { error: insertError } = await supabase
                    .from('auspicious_names')
                    .insert(chunk);

                if (insertError) {
                    console.error('Insert error:', insertError);
                    throw insertError;
                }
            }

            revalidatePublicNames();

            return NextResponse.json({
                success: true,
                message: `Replace complete: inserted ${unique.length} names`,
                stats: { received, uniqueInPayload: unique.length, inserted: unique.length, skippedDuplicate: 0, duplicatesInPayload, invalid }
            });
        }

        // ─── Append mode (default): insert only new names, skip duplicates ───
        let inserted = 0;
        let skippedDuplicate = 0;

        const insertData = unique.map((name) => ({ name, gender: recordsByName.get(name)?.gender ?? 'neutral' }));

        const recordsWithMeanings = unique
            .map((name) => recordsByName.get(name))
            .filter((record): record is MeaningImportRecord & { meaning: string } => Boolean(record?.meaning));
        if (recordsWithMeanings.length > 0) {
            const meaningRows = recordsWithMeanings.map((record) => ({
                name: record.name,
                gender: record.gender ?? 'neutral',
                meaning: record.meaning,
                meaning_draft: record.meaning,
                meaning_status: 'approved',
                meaning_source: 'manual-import',
                meaning_reviewed_at: new Date().toISOString(),
                meaning_reviewed_by: auth.user.id,
            }));
            const { error: meaningUpsertError } = await supabase
                .from('auspicious_names')
                .upsert(meaningRows, { onConflict: 'name' });
            if (meaningUpsertError) throw meaningUpsertError;
        }

        for (let i = 0; i < insertData.length; i += INSERT_BATCH_SIZE) {
            const chunk = insertData
                .slice(i, i + INSERT_BATCH_SIZE)
                .filter((record) => !recordsByName.get(record.name)?.meaning);
            if (chunk.length === 0) continue;

            // Use upsert with ignoreDuplicates to skip existing names (UNIQUE constraint on `name`)
            const { data: upsertData, error: upsertError } = await supabase
                .from('auspicious_names')
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

        console.log(`[Admin Names] Append done: inserted=${inserted} skipped=${skippedDuplicate}`);

        if (inserted > 0 || recordsWithMeanings.length > 0) revalidatePublicNames();

        return NextResponse.json({
            success: true,
            message: `Append complete: inserted ${inserted}, skipped ${skippedDuplicate} duplicates`,
            stats: { received, uniqueInPayload: unique.length, inserted, skippedDuplicate, duplicatesInPayload, invalid }
        });

    } catch (error: any) {
        console.error('Save error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
