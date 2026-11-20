import 'server-only';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabaseServer';

export const WALLPAPER_PRIVATE_HEADERS = { 'Cache-Control': 'private, no-store', Vary: 'Cookie', 'X-Content-Type-Options': 'nosniff' };
export const WALLPAPER_ORIGINAL_BUCKET = 'premium-wallpaper-originals';

export function wallpaperJson(body: unknown, status = 200) {
    return NextResponse.json(body, { status, headers: WALLPAPER_PRIVATE_HEADERS });
}

export async function wallpaperAuth() {
    const client = await createClient();
    const { data: { user }, error } = await client.auth.getUser();
    return { client, user: error || user?.is_anonymous ? null : user };
}

export function wallpaperService() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    return url && key ? createServiceClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }) : null;
}

export function wallpaperUnavailable() {
    return wallpaperJson({ error: 'ระบบดาวน์โหลดภาพชุดนี้ยังไม่พร้อม กรุณาตรวจการตั้งค่าและไฟล์ต้นฉบับ ระบบยังไม่หักเครดิต', code: 'WALLPAPER_NOT_READY' }, 503);
}
