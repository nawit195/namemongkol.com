import { normalizeTrafficPath, pageViewInputSchema } from '@/lib/pageTraffic';
import { thaiActivityDate } from '@/lib/memberActivityDates';
import { isLocalTrafficHost, trafficHeaders, trafficResponse, trafficService, trafficVisitorHash } from '@/lib/pageTrafficServer';
import { checkPageTrafficRateLimit } from '@/lib/pageTrafficRateLimit';

const MAX_BODY_BYTES = 2048;
async function readBoundedBody(request: Request): Promise<{ text: string } | { status: 400 | 413 }> {
    const reader = request.body?.getReader();
    if (!reader) return { text: '' };
    const chunks: Uint8Array[] = [];
    let size = 0;
    try {
        while (true) {
            const result = await reader.read();
            if (result.done) break;
            size += result.value.byteLength;
            if (size > MAX_BODY_BYTES) {
                void reader.cancel().catch(() => {});
                return { status: 413 };
            }
            chunks.push(result.value);
        }
    } finally { reader.releaseLock(); }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    try { return { text: new TextDecoder('utf-8', { fatal: true }).decode(bytes) }; }
    catch { return { status: 400 }; }
}

export async function POST(request: Request) {
    const origin = request.headers.get('origin');
    if ((origin && origin !== new URL(request.url).origin) || request.headers.get('sec-fetch-site') === 'cross-site') return trafficResponse({ success: false }, 403);
    const ignored = () => new Response(null, { status: 204, headers: trafficHeaders });
    if (process.env.VERCEL_ENV === 'preview' || isLocalTrafficHost(new URL(request.url).hostname) ||
        request.headers.get('dnt') === '1' || request.headers.get('sec-gpc') === '1' ||
        /bot|crawler|spider|headless|lighthouse|prerender/i.test(request.headers.get('user-agent') ?? '')) return ignored();
    if (!request.headers.get('content-type')?.includes('application/json')) return trafficResponse({ success: false }, 415);
    const contentLength = request.headers.get('content-length');
    if (contentLength !== null) {
        if (!/^\d+$/.test(contentLength)) return trafficResponse({ success: false }, 400);
        if (Number(contentLength) > MAX_BODY_BYTES) return trafficResponse({ success: false }, 413);
    }
    try {
        const secret = process.env.PAGE_ANALYTICS_HASH_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!secret) return trafficResponse({ success: false }, 503);
        const rate = checkPageTrafficRateLimit(request, secret);
        if (!rate.allowed) {
            const response = trafficResponse({ success: false }, 429);
            response.headers.set('Retry-After', String(rate.retryAfter));
            return response;
        }
        const body = await readBoundedBody(request);
        if ('status' in body) return trafficResponse({ success: false }, body.status);
        const input = pageViewInputSchema.safeParse(JSON.parse(body.text));
        if (!input.success) return trafficResponse({ success: false }, 400);
        const path = normalizeTrafficPath(input.data.path);
        if (!path) return ignored();
        const service = trafficService();
        if (!service) return trafficResponse({ success: false }, 503);
        const day = thaiActivityDate();
        const { error } = await service.from('page_view_events').upsert({
            event_id: input.data.eventId, visit_date: day, page_path: path,
            visitor_hash: trafficVisitorHash(input.data.visitorId, day, secret),
        }, { onConflict: 'event_id', ignoreDuplicates: true });
        if (error) return trafficResponse({ success: false }, 503);
        return ignored();
    } catch (error) { return trafficResponse({ success: false }, error instanceof SyntaxError ? 400 : 503); }
}
