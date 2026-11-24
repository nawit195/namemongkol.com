import 'server-only';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabaseServer';
import type {
    AuspiciousNickname,
    NicknameFilters,
    NicknameQueryResponse,
} from '@/types/auspiciousNickname';
import {
    NICKNAME_CATALOG_VERSION,
    queryNicknames,
} from './auspiciousNicknames';
import { signNicknameQuote } from './auspiciousNicknameQuote';
import { getPremiumNicknameCatalog } from './auspiciousNicknameCatalogServer';

export function getNicknameAdminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
    return url && secret
        ? createAdminClient(url, secret, {
              auth: { persistSession: false, autoRefreshToken: false },
          })
        : null;
}

export async function loadNicknameAccess(
    supabase: Awaited<ReturnType<typeof createClient>>,
    userId: string,
) {
    const [profile, unlocks] = await Promise.all([
        supabase
            .from('user_profiles')
            .select('credits,welcome_credits,welcome_credits_granted_at')
            .eq('id', userId)
            .maybeSingle(),
        supabase
            .from('nickname_unlocks')
            .select('snapshot')
            .eq('user_id', userId)
            .order('created_at'),
    ]);
    if (profile.error) throw new Error('Unable to read nickname wallet');
    // Missing schema disables purchases instead of treating a buyer as a new customer.
    const available = !unlocks.error && Boolean(profile.data);
    const purchased = new Map<string, AuspiciousNickname>();
    for (const batch of unlocks.data ?? []) {
        if (!Array.isArray(batch.snapshot)) continue;
        for (const item of batch.snapshot as unknown as AuspiciousNickname[])
            purchased.set(item.id, item);
    }
    const wallet = profile.data;
    const welcomeValid =
        wallet?.welcome_credits_granted_at &&
        Date.now() <=
            new Date(wallet.welcome_credits_granted_at).getTime() +
                30 * 86400_000;
    return {
        purchased: [...purchased.values()],
        available,
        credits:
            Number(wallet?.credits ?? 0) +
            (welcomeValid ? Number(wallet?.welcome_credits ?? 0) : 0),
    };
}

export async function buildNicknameResponse(
    filters: NicknameFilters,
    supabase: Awaited<ReturnType<typeof createClient>>,
    userId: string,
): Promise<NicknameQueryResponse> {
    const [access, premium] = await Promise.all([
        loadNicknameAccess(supabase, userId),
        getPremiumNicknameCatalog(),
    ]);
    const { response, candidates } = queryNicknames(
        filters,
        access.purchased,
        premium,
    );
    const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const ready = access.available && Boolean(secret);
    return {
        ...response,
        viewer: { authenticated: true, credits: access.credits },
        accessReady: ready,
        purchase: {
            ...response.purchase,
            quote:
                ready && candidates.length
                    ? signNicknameQuote(
                          {
                              userId,
                              version: NICKNAME_CATALOG_VERSION,
                              filters,
                              ids: candidates.map((item) => item.id),
                          },
                          secret!,
                      )
                    : null,
        },
    };
}
