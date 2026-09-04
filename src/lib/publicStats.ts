import { createClient } from '@supabase/supabase-js';
import { premiumNamesRaw } from '@/data/premiumNamesRaw';
import { countRawNameLines } from '@/lib/nameCounts';

export const PUBLIC_STATS_REVALIDATE_SECONDS = 120;

export const emptyActivityCounts = {
    analysis: 0,
    wallpaper: 0,
    phone: 0,
    palm: 0,
    premium: 0,
    total: 0,
};

export type PublicActivityCounts = typeof emptyActivityCounts;

export type PublicAggregateStats = {
    success: boolean;
    onlineNow: number;
    totals: {
        members: number;
        analyses: number;
        names: number;
        premiumNames: number;
        reviews: number;
    };
    stats: {
        totalUsers: number;
        totalAnalyses: number;
        weeklyAnalyses: number;
        avgRating: number;
        reviewCount: number;
        totalApprovedReviews: number;
        totalNames: number;
        totalPremiumNames: number;
    };
    counts: PublicActivityCounts;
    ts: string;
};

export function getPublicStatsCacheHeaders() {
    return {
        'Cache-Control': `public, s-maxage=${PUBLIC_STATS_REVALIDATE_SECONDS}, stale-while-revalidate=300`,
    };
}

export function fallbackPublicAggregateStats(): PublicAggregateStats {
    return {
        success: false,
        onlineNow: 0,
        totals: {
            members: 0,
            analyses: 0,
            names: 0,
            premiumNames: 0,
            reviews: 0,
        },
        stats: {
            totalUsers: 0,
            totalAnalyses: 0,
            weeklyAnalyses: 0,
            avgRating: 0,
            reviewCount: 0,
            totalApprovedReviews: 0,
            totalNames: 0,
            totalPremiumNames: 0,
        },
        counts: { ...emptyActivityCounts },
        ts: new Date().toISOString(),
    };
}

function getServiceClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        return null;
    }

    return createClient(
        supabaseUrl,
        supabaseKey,
        { auth: { persistSession: false } },
    );
}

const countValue = (result: { count: number | null; error?: unknown } | null | undefined) => {
    if (!result || result.error) return 0;
    return result.count ?? 0;
};

export async function fetchPublicAggregateStats(): Promise<PublicAggregateStats> {
    const now = new Date();
    const supabase = getServiceClient();

    if (!supabase) {
        return fallbackPublicAggregateStats();
    }

    const ago5m = new Date(now.getTime() - 5 * 60 * 1000).toISOString();
    const ago30m = new Date(now.getTime() - 30 * 60 * 1000).toISOString();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const namesTotalPromise = supabase
        .from('auspicious_names')
        .select('*', { count: 'exact', head: true })
        .neq('publication_status', 'hidden');

    const [
        onlineRes,
        eventsRes,
        analysisTotalRes,
        weeklyAnalysisRes,
        userTotalRes,
        reviewsRes,
        initialNamesTotalRes,
    ] = await Promise.all([
        supabase.from('user_action_events').select('session_id').gte('created_at', ago5m),
        supabase.from('user_action_events').select('button_key').gte('created_at', ago30m),
        supabase.from('analysis_results').select('*', { count: 'exact', head: true }),
        supabase.from('analysis_results').select('*', { count: 'exact', head: true }).gte('created_at', weekAgo),
        supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
        supabase.from('reviews').select('rating').eq('status', 'approved'),
        namesTotalPromise,
    ]);

    const namesTotalRes = initialNamesTotalRes.error && /publication_status/i.test(initialNamesTotalRes.error.message ?? '')
        ? await supabase.from('auspicious_names').select('*', { count: 'exact', head: true })
        : initialNamesTotalRes;

    const onlineNow = onlineRes.error || !onlineRes.data
        ? 0
        : new Set(
            onlineRes.data
                .map((row: { session_id: string | null }) => row.session_id)
                .filter(Boolean),
        ).size;

    const counts: PublicActivityCounts = { ...emptyActivityCounts };

    if (!eventsRes.error && eventsRes.data) {
        for (const row of eventsRes.data as { button_key: string | null }[]) {
            const key = row.button_key ?? '';
            counts.total++;

            if (
                key.startsWith('name_analysis') ||
                key.startsWith('home.') ||
                key.startsWith('search.') ||
                key.startsWith('meaning.')
            ) {
                counts.analysis++;
            } else if (key.startsWith('wallpapers')) {
                counts.wallpaper++;
            } else if (key.startsWith('phone_analysis') || key.startsWith('phone.')) {
                counts.phone++;
            } else if (key.startsWith('palm_analysis') || key.startsWith('aura')) {
                counts.palm++;
            } else if (
                key.startsWith('premium') ||
                key.includes('unlock') ||
                key.includes('topup') ||
                key.includes('deduct')
            ) {
                counts.premium++;
            }
        }
    }

    const totalUsers = countValue(userTotalRes);
    const totalAnalyses = countValue(analysisTotalRes);
    const weeklyAnalyses = countValue(weeklyAnalysisRes);
    const totalNames = countValue(namesTotalRes);
    const totalPremiumNames = countRawNameLines(premiumNamesRaw);
    const reviews = reviewsRes.error ? [] : reviewsRes.data ?? [];
    const reviewCount = reviews.length;
    const avgRating = reviewCount > 0
        ? reviews.reduce((sum, row: { rating: number | null }) => sum + (row.rating ?? 0), 0) / reviewCount
        : 0;

    return {
        success: true,
        onlineNow,
        totals: {
            members: totalUsers,
            analyses: totalAnalyses,
            names: totalNames,
            premiumNames: totalPremiumNames,
            reviews: reviewCount,
        },
        stats: {
            totalUsers,
            totalAnalyses,
            weeklyAnalyses,
            avgRating: Number(avgRating.toFixed(1)),
            reviewCount,
            totalApprovedReviews: reviewCount,
            totalNames,
            totalPremiumNames,
        },
        counts,
        ts: now.toISOString(),
    };
}
