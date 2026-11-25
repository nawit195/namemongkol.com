import 'server-only';
import { createHmac } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const trafficHeaders = { 'Cache-Control': 'private, no-store', Vary: 'Cookie' };
export function trafficResponse(body: unknown, status = 200) {
    return NextResponse.json(body, { status, headers: trafficHeaders });
}
export function trafficService() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    return url && key ? createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }) : null;
}
export function trafficVisitorHash(visitorId: string, day: string, secret: string) {
    return createHmac('sha256', secret).update(`page-visitor:v1:${day}:${visitorId}`).digest('hex');
}
export function isLocalTrafficHost(hostname: string) {
    return ['localhost', '127.0.0.1', '[::1]', '::1'].includes(hostname) || hostname.endsWith('.localhost');
}
