import 'server-only';
import { unstable_cache } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import type { AuspiciousNickname } from '@/types/auspiciousNickname';
import {
    NICKNAME_CATALOG_VERSION,
    NICKNAME_SUMMARY,
} from './auspiciousNicknames';

/** Paid records never enter the public Git repository or browser bundles. */
export const getPremiumNicknameCatalog = unstable_cache(
    async (): Promise<AuspiciousNickname[]> => {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!url || !key)
            throw new Error('Paid nickname catalog is not configured');
        const admin = createClient(url, key, {
            auth: { persistSession: false, autoRefreshToken: false },
        });
        const { data, error } = await admin
            .from('nickname_catalog')
            .select('record')
            .eq('catalog_version', NICKNAME_CATALOG_VERSION);
        if (error || !data || data.length !== NICKNAME_SUMMARY.aPlus)
            throw new Error('Paid nickname catalog is not ready');
        return data.map((row) => row.record as AuspiciousNickname);
    },
    ['nickname-catalog', NICKNAME_CATALOG_VERSION],
    { revalidate: 600, tags: ['nickname-catalog'] },
);
