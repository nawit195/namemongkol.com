import 'server-only';

import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import { getPublicPetNames } from '@/lib/petNames';
import { analyzeExistingPetName, filterAndScorePetNames } from '@/lib/petNameScoring';
import {
    createPetNameFingerprint,
    normalizePetNameFilters,
    PET_NAME_SET_SIZE,
    PET_NAME_UNLOCK_COST,
    presentAnalysisResult,
    presentSearchResults,
    type PetNameQueryResponse,
    type PetNameViewer,
} from '@/lib/petNameAccess';
import type { PetNameQueryInput } from '@/lib/petNameApi';
import type { PetNameFilters, ScoredPetName } from '@/types/petName';

type UnlockRow = { result_slugs: string[] | null };

export function getPetNameAdminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return null;
    return createSupabaseAdmin(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function getPetNameViewer(supabase: SupabaseClient): Promise<{ user: User | null; viewer: PetNameViewer }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { user: null, viewer: { authenticated: false, credits: null } };

    const { data: effective } = await supabase.rpc('get_effective_credits');
    const rpcCredits = effective && typeof effective === 'object' && 'total_credits' in effective
        ? Number(effective.total_credits)
        : null;

    if (Number.isFinite(rpcCredits)) {
        return { user, viewer: { authenticated: true, credits: rpcCredits } };
    }

    const { data: profile } = await supabase
        .from('user_profiles')
        .select('credits, welcome_credits, welcome_credits_granted_at')
        .eq('id', user.id)
        .maybeSingle();

    let credits = profile?.credits ?? 0;
    if (profile?.welcome_credits && profile.welcome_credits_granted_at) {
        const expiresAt = new Date(profile.welcome_credits_granted_at).getTime() + 30 * 24 * 60 * 60 * 1000;
        if (Date.now() <= expiresAt) credits += profile.welcome_credits;
    }

    return { user, viewer: { authenticated: true, credits } };
}

async function findSearchUnlock(supabase: SupabaseClient, fingerprint: string) {
    const { data, error } = await supabase
        .from('pet_name_unlocks')
        .select('result_slugs')
        .eq('unlock_type', 'search')
        .eq('fingerprint', fingerprint)
        .maybeSingle();
    if (error) return null;
    return data as UnlockRow | null;
}

async function hasNameDetailUnlock(supabase: SupabaseClient, slug: string) {
    const { data, error } = await supabase
        .from('pet_name_unlocks')
        .select('id')
        .contains('result_slugs', [slug])
        .limit(1);
    return !error && Boolean(data?.length);
}

function restorePurchasedOrder(
    ranked: ScoredPetName[],
    purchasedSlugs: string[] | null | undefined,
) {
    if (!purchasedSlugs?.length) return ranked.slice(0, PET_NAME_SET_SIZE);
    const bySlug = new Map(ranked.map((result) => [result.slug, result]));
    const restored = purchasedSlugs.map((slug) => bySlug.get(slug)).filter((result): result is ScoredPetName => Boolean(result));
    const restoredSlugs = new Set(restored.map((result) => result.slug));
    for (const result of ranked) {
        if (restored.length >= PET_NAME_SET_SIZE) break;
        if (!restoredSlugs.has(result.slug)) restored.push(result);
    }
    return restored;
}

export async function buildPetNameQueryResponse(
    input: PetNameQueryInput,
    supabase: SupabaseClient,
): Promise<PetNameQueryResponse> {
    const names = await getPublicPetNames();
    const filters = normalizePetNameFilters(input.filters as PetNameFilters);
    const { user, viewer } = await getPetNameViewer(supabase);

    if (input.mode === 'search') {
        const fingerprint = createPetNameFingerprint('search', filters);
        const ranked = filterAndScorePetNames(names, filters, names.length);
        const unlock = user ? await findSearchUnlock(supabase, fingerprint) : null;
        const selected = restorePurchasedOrder(ranked, unlock?.result_slugs);
        const presentation = presentSearchResults(selected, Boolean(unlock));
        return {
            success: true,
            mode: 'search',
            fingerprint,
            totalMatches: ranked.length,
            cost: PET_NAME_UNLOCK_COST,
            viewer,
            ...presentation,
        };
    }

    const result = analyzeExistingPetName(input.name, names, filters);
    const fingerprint = createPetNameFingerprint('analysis', filters, result.slug);
    const isUnlocked = user && result.meaningAvailable
        ? await hasNameDetailUnlock(supabase, result.slug)
        : false;
    const presentation = presentAnalysisResult(result, isUnlocked);
    return {
        success: true,
        mode: 'analysis',
        fingerprint,
        totalMatches: 1,
        cost: PET_NAME_UNLOCK_COST,
        viewer,
        ...presentation,
    };
}
