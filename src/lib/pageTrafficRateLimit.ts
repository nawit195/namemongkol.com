import 'server-only';
import { createHmac } from 'node:crypto';
import { isIP } from 'node:net';

const WINDOW_MS = 60_000;
const BURST_MS = 10_000;
const NETWORK_LIMIT = 120;
const BURST_LIMIT = 30;
const GLOBAL_LIMIT = 600;
const MAX_NETWORKS = 2048;

export type PageTrafficLimitResult = { allowed: boolean; retryAfter: number };
type NetworkWindow = { count: number; expiresAt: number; burstCount: number; burstResetAt: number };

/** Only Vercel's overwritten header is trusted; other deployments share a bucket. */
export function pageTrafficRateLimitKey(request: Request, secret: string) {
    const candidate = process.env.VERCEL === '1'
        ? request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? ''
        : '';
    const identity = isIP(candidate) ? candidate.toLowerCase() : 'shared-network';
    return createHmac('sha256', secret).update(`page-traffic-rate:v1:${identity}`).digest('hex');
}

/** Best-effort, per-instance protection. It is deliberately not a distributed quota. */
export function createPageTrafficRateLimiter({ maxNetworks = MAX_NETWORKS }: { maxNetworks?: number } = {}) {
    if (!Number.isInteger(maxNetworks) || maxNetworks < 1 || maxNetworks > MAX_NETWORKS) throw new RangeError('Invalid traffic limiter capacity');
    const networks = new Map<string, NetworkWindow>();
    let globalCount = 0;
    let globalResetAt = 0;
    const deny = (until: number, now: number): PageTrafficLimitResult => ({ allowed: false, retryAfter: Math.max(1, Math.ceil((until - now) / 1000)) });

    return (request: Request, secret: string, now = Date.now()): PageTrafficLimitResult => {
        if (now >= globalResetAt) { globalCount = 0; globalResetAt = now + WINDOW_MS; }
        if (globalCount >= GLOBAL_LIMIT) return deny(globalResetAt, now);

        // All retained keys are HMACs. This bounded scan also expires idle entries
        // without a timer or an unbounded queue of per-visitor cleanup callbacks.
        for (const [key, entry] of networks) if (now >= entry.expiresAt) networks.delete(key);
        const key = pageTrafficRateLimitKey(request, secret);
        let entry = networks.get(key);
        if (!entry) {
            if (networks.size >= maxNetworks) {
                let nextExpiry = now + WINDOW_MS;
                for (const value of networks.values()) nextExpiry = Math.min(nextExpiry, value.expiresAt);
                return deny(nextExpiry, now);
            }
            entry = { count: 0, expiresAt: now + WINDOW_MS, burstCount: 0, burstResetAt: now + BURST_MS };
            networks.set(key, entry);
        }
        if (now >= entry.burstResetAt) { entry.burstCount = 0; entry.burstResetAt = now + BURST_MS; }
        const networkBlocked = entry.count >= NETWORK_LIMIT;
        const burstBlocked = entry.burstCount >= BURST_LIMIT;
        if (networkBlocked || burstBlocked) return deny(Math.max(networkBlocked ? entry.expiresAt : now, burstBlocked ? entry.burstResetAt : now), now);

        entry.count++;
        entry.burstCount++;
        globalCount++;
        return { allowed: true, retryAfter: 0 };
    };
}

export const checkPageTrafficRateLimit = createPageTrafficRateLimiter();
