import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const MAX_SLUGS = 80;
const CACHE_SECONDS = 600;

function getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key || url === 'http://dummy.supabase.co' || key === 'dummy_anon_key') {
        return null;
    }

    return createClient(url, key, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        },
    });
}

function normalizeSlug(value: string) {
    return decodeURIComponent(value).trim().replace(/^\/+|\/+$/g, '');
}

function getRequestedSlugs(request: NextRequest) {
    const repeatedSlugs = request.nextUrl.searchParams.getAll('slug');
    const commaSlugs = request.nextUrl.searchParams.get('slugs')?.split(',') ?? [];

    return Array.from(new Set([...repeatedSlugs, ...commaSlugs]
        .map((slug) => normalizeSlug(slug))
        .filter(Boolean)
        .slice(0, MAX_SLUGS)));
}

async function countArticleViews(slugs: string[]) {
    const supabase = getSupabaseAdmin();
    const emptyCounts = Object.fromEntries(slugs.map((slug) => [slug, 0]));

    if (!supabase || slugs.length === 0) {
        return emptyCounts;
    }

    const counts: Record<string, number> = {};

    for (let index = 0; index < slugs.length; index += 8) {
        const chunk = slugs.slice(index, index + 8);
        const results = await Promise.all(chunk.map(async (slug) => {
            const { count, error } = await supabase
                .from('user_action_events')
                .select('id', { count: 'exact', head: true })
                .eq('event_name', 'view')
                .eq('button_key', 'articles.detail.view')
                .eq('page_path', `/articles/${slug}`);

            if (error) {
                console.warn('[articles/views] count error:', error.message);
                return [slug, 0] as const;
            }

            return [slug, count ?? 0] as const;
        }));

        for (const [slug, count] of results) {
            counts[slug] = count;
        }
    }

    return { ...emptyCounts, ...counts };
}

export async function GET(request: NextRequest) {
    const slugs = getRequestedSlugs(request);
    const counts = await countArticleViews(slugs);

    return NextResponse.json(
        { success: true, counts },
        {
            headers: {
                'Cache-Control': `public, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=1800`,
            },
        },
    );
}
