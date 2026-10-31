import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const CACHE_SECONDS = 60;
const WINDOW_HOURS = 24;

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

export function getWindowStart(now = new Date()) {
  return new Date(now.getTime() - WINDOW_HOURS * 60 * 60 * 1000).toISOString();
}

async function countRecentViews() {
  const supabase = getSupabaseAdmin();
  if (!supabase) return 0;

  const { count, error } = await supabase
    .from('user_action_events')
    .select('id', { count: 'exact', head: true })
    .eq('event_name', 'view')
    .eq('button_key', 'compare_names.page.view')
    .eq('page_path', '/compare-names')
    .gte('created_at', getWindowStart());

  if (error) {
    console.warn('[compare-names-views] count error:', error.message);
    return 0;
  }

  return count ?? 0;
}

export async function GET() {
  return NextResponse.json(
    {
      success: true,
      count: await countRecentViews(),
      windowHours: WINDOW_HOURS,
    },
    {
      headers: {
        'Cache-Control': `public, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=300`,
      },
    },
  );
}
