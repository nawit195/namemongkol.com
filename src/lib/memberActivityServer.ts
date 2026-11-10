import 'server-only';
import { NextResponse } from 'next/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabaseServer';
export function activityResponse(body: unknown, status = 200) {
    return NextResponse.json(body, {
        status,
        headers: { 'Cache-Control': 'private, no-store', Vary: 'Cookie' },
    });
}
export function activityFailure(status: number, error: string, code?: string) {
    return activityResponse(
        { success: false, error, ...(code ? { code } : {}) },
        status,
    );
}
export function activityUnavailable(error?: { code?: string } | null) {
    const missing = ['42P01', '42883', 'PGRST202', 'PGRST205'].includes(
        error?.code ?? '',
    );
    return activityFailure(
        503,
        missing
            ? 'ยังไม่ได้ติดตั้งระบบกิจกรรมสมาชิก กรุณาติดตั้ง SQL migration ก่อนใช้งาน'
            : 'ไม่สามารถโหลดกิจกรรมสมาชิกได้ กรุณาลองใหม่',
        missing ? 'MIGRATION_REQUIRED' : 'ACTIVITY_UNAVAILABLE',
    );
}
export async function activityAuth() {
    const client = await createClient();
    const {
        data: { user },
        error,
    } = await client.auth.getUser();
    return { client, user: !error && user && !user.is_anonymous ? user : null };
}
export function activityService() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL,
        key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    return url && key
        ? createServiceClient(url, key, {
              auth: { persistSession: false, autoRefreshToken: false },
          })
        : null;
}
