import { createHmac } from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('server-only', () => ({}));
import { createPageTrafficRateLimiter, pageTrafficRateLimitKey } from './pageTrafficRateLimit';

const secret = 'synthetic-traffic-rate-secret';
const request = (ip = '192.0.2.1', extra: Record<string, string> = {}) => new Request('https://www.namemongkol.com/api/analytics/page-view', { headers: { 'x-forwarded-for': ip, ...extra } });
beforeEach(() => vi.stubEnv('VERCEL', '1'));
afterEach(() => vi.unstubAllEnvs());

describe('bounded page traffic ingestion limits', () => {
    it('limits a network to 30 requests per 10 seconds and resets at the boundary', () => {
        const check = createPageTrafficRateLimiter();
        for (let index = 0; index < 30; index++) expect(check(request(), secret, 1000).allowed).toBe(true);
        expect(check(request(), secret, 1000)).toEqual({ allowed: false, retryAfter: 10 });
        expect(check(request(), secret, 10_999)).toEqual({ allowed: false, retryAfter: 1 });
        expect(check(request(), secret, 11_000)).toEqual({ allowed: true, retryAfter: 0 });
    });

    it('limits sustained events to 120 per network per minute without extending its expiry on rejection', () => {
        const check = createPageTrafficRateLimiter();
        for (const now of [0, 10_000, 20_000, 30_000]) {
            for (let index = 0; index < 30; index++) expect(check(request(), secret, now).allowed).toBe(true);
        }
        expect(check(request(), secret, 40_000)).toEqual({ allowed: false, retryAfter: 20 });
        expect(check(request(), secret, 59_999)).toEqual({ allowed: false, retryAfter: 1 });
        expect(check(request(), secret, 60_000)).toEqual({ allowed: true, retryAfter: 0 });
    });

    it('caps all admitted events at 600 per instance each minute, across many networks', () => {
        const check = createPageTrafficRateLimiter();
        for (let network = 1; network <= 20; network++) {
            for (let event = 0; event < 30; event++) expect(check(request(`192.0.2.${network}`), secret, 0).allowed).toBe(true);
        }
        expect(check(request('192.0.2.21'), secret, 500)).toEqual({ allowed: false, retryAfter: 60 });
        expect(check(request('192.0.2.21'), secret, 60_000)).toEqual({ allowed: true, retryAfter: 0 });
    });

    it('denies new network keys when storage is full rather than evicting active limits', () => {
        const check = createPageTrafficRateLimiter({ maxNetworks: 2 });
        expect(check(request('192.0.2.1'), secret, 0).allowed).toBe(true);
        expect(check(request('192.0.2.2'), secret, 5000).allowed).toBe(true);
        expect(check(request('192.0.2.3'), secret, 5000)).toEqual({ allowed: false, retryAfter: 55 });
        for (let index = 1; index < 30; index++) expect(check(request('192.0.2.1'), secret, 5000).allowed).toBe(true);
        expect(check(request('192.0.2.1'), secret, 5000).allowed).toBe(false);
        expect(check(request('192.0.2.3'), secret, 60_000).allowed).toBe(true);
        expect(check(request('192.0.2.4'), secret, 60_000)).toEqual({ allowed: false, retryAfter: 5 });
        expect(check(request('192.0.2.4'), secret, 65_000).allowed).toBe(true);
    });

    it('ignores all supplied network headers off Vercel and uses one fallback bucket', () => {
        vi.stubEnv('VERCEL', '0');
        const check = createPageTrafficRateLimiter();
        for (let index = 1; index <= 30; index++) expect(check(request(`192.0.2.${index}`, { 'x-real-ip': `198.51.100.${index}`, 'cf-connecting-ip': `203.0.113.${index}` }), secret, 0).allowed).toBe(true);
        expect(check(request('192.0.2.31'), secret, 0)).toEqual({ allowed: false, retryAfter: 10 });
        expect(pageTrafficRateLimitKey(request('192.0.2.1'), secret)).toBe(pageTrafficRateLimitKey(request('192.0.2.99'), secret));
    });

    it('uses only valid first forwarded IPs on Vercel, ignoring spoofed alternate headers', () => {
        const check = createPageTrafficRateLimiter();
        for (let index = 1; index <= 30; index++) expect(check(request('192.0.2.1, 198.51.100.1', { 'cf-connecting-ip': `203.0.113.${index}`, 'x-real-ip': `198.51.100.${index}` }), secret, 0).allowed).toBe(true);
        expect(check(request('192.0.2.1'), secret, 0).allowed).toBe(false);
        expect(check(request('192.0.2.2'), secret, 0).allowed).toBe(true);
        const invalid = request('not-an-ip', { 'cf-connecting-ip': '203.0.113.9' });
        expect(pageTrafficRateLimitKey(invalid, secret)).toBe(pageTrafficRateLimitKey(new Request('https://www.namemongkol.com'), secret));
    });

    it('stores identity as a domain-separated secret HMAC and exposes no network data in results', () => {
        const key = pageTrafficRateLimitKey(request('192.0.2.1'), secret);
        expect(key).toMatch(/^[a-f0-9]{64}$/);
        expect(key).toBe(createHmac('sha256', secret).update('page-traffic-rate:v1:192.0.2.1').digest('hex'));
        expect(key).not.toBe(pageTrafficRateLimitKey(request('192.0.2.1'), 'different-secret'));
        expect(key).not.toBe(pageTrafficRateLimitKey(request('192.0.2.2'), secret));
        expect(createPageTrafficRateLimiter()(request(), secret, 0)).toEqual({ allowed: true, retryAfter: 0 });
    });
});
