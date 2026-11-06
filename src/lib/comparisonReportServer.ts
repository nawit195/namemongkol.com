import { createHash } from 'node:crypto';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabaseServer';
import { comparisonIdentity, type ComparisonInput } from './comparisonReport';

export const REPORT_PRIVATE_HEADERS = { 'Cache-Control': 'private, no-store', Vary: 'Cookie' };
export function reportResponse(body: unknown, status = 200) {
    return NextResponse.json(body, { status, headers: REPORT_PRIVATE_HEADERS });
}
export function reportFailure(status: number, error: string, code?: string) {
    return reportResponse({ success: false, error, ...(code ? { code } : {}) }, status);
}
export function reportDatabaseFailure(error?: { code?: string } | null) {
    const missing = ['42P01', '42883', 'PGRST202', 'PGRST205'].includes(error?.code ?? '');
    return reportFailure(503, missing ? 'ระบบรายงานยังไม่พร้อม กรุณาติดตั้ง migration รายงานเปรียบเทียบก่อนใช้งาน ตารางเปรียบเทียบฟรียังใช้ได้' : 'ไม่สามารถเปิดรายงานได้ กรุณาลองใหม่', missing ? 'MIGRATION_REQUIRED' : 'REPORT_UNAVAILABLE');
}
export async function reportAuth() {
    const client = await createClient();
    const { data: { user }, error } = await client.auth.getUser();
    return { client, user: error ? null : user };
}
export function reportService() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    return url && key ? createServiceClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }) : null;
}
export function reportFingerprint(input: ComparisonInput) {
    return createHash('sha256').update(comparisonIdentity(input)).digest('hex');
}
