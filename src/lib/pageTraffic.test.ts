import { describe, expect, it, vi } from 'vitest';
vi.mock('server-only', () => ({}));
import { normalizeTrafficPath, parsePageTrafficQuery } from './pageTraffic';
import { trafficVisitorHash } from './pageTrafficServer';
import { thaiActivityDate } from './memberActivityDates';

describe('daily page traffic identity and dates', () => {
    it('groups query changes together without storing user input and normalizes Unicode paths', () => {
        expect(normalizeTrafficPath('/search/?name=private#details')).toBe('/search');
        expect(normalizeTrafficPath('/articles/%E0%B8%81')).toBe('/articles/ก');
        expect(normalizeTrafficPath('/')).toBe('/');
        expect(normalizeTrafficPath('/reports/10000000-0000-4000-8000-000000000001')).toBe('/reports/:id');
        expect(normalizeTrafficPath('/meaning/' + encodeURIComponent('ธนกร') + '?source=form')).toBe('/meaning/:name');
        expect(normalizeTrafficPath('/meaning/กรวิชญ์')).toBe('/meaning/:name');
        expect(normalizeTrafficPath('/meaning/:name')).toBe('/meaning/:name');
        expect(normalizeTrafficPath('/meaning?name=private')).toBe('/meaning');
        expect(normalizeTrafficPath('/nicknames/meaning/light')).toBe('/nicknames/meaning/light');
        for (const value of ['//evil.test/x', 'https://evil.test', '/admin', '/admin/users', '/api/test', '/auth/callback', '/_next/x', '/icon/x.png', '/%zz', '/a\\b']) expect(normalizeTrafficPath(value)).toBeNull();
    });
    it('uses Thai midnight and validates inclusive bounded report dates', () => {
        expect(thaiActivityDate(new Date('2026-11-23T16:59:59Z'))).toBe('2026-11-23');
        expect(thaiActivityDate(new Date('2026-11-23T17:00:00Z'))).toBe('2026-11-24');
        const now = new Date('2026-11-24T05:00:00Z');
        expect(parsePageTrafficQuery(new URLSearchParams(), now)).toEqual({ from: '2026-11-24', to: '2026-11-24', q: '', page: 1 });
        expect(parsePageTrafficQuery(new URLSearchParams('from=2026-10-25&to=2026-11-24'), now)).not.toBeNull();
        for (const query of ['from=2026-10-24&to=2026-11-24', 'to=2026-11-25', 'from=2026-02-30', 'page=-1', 'page=1.5', 'page=100001', 'q='+'x'.repeat(101)]) expect(parsePageTrafficQuery(new URLSearchParams(query), now)).toBeNull();
    });
    it('counts one browser consistently within a day without linking its hashes across days', () => {
        const a = trafficVisitorHash('visitor-a', '2026-11-24', 'test-secret');
        expect(a).toMatch(/^[a-f0-9]{64}$/);
        expect(a).toBe(trafficVisitorHash('visitor-a', '2026-11-24', 'test-secret'));
        expect(a).not.toBe(trafficVisitorHash('visitor-a', '2026-11-25', 'test-secret'));
        expect(a).not.toBe(trafficVisitorHash('visitor-b', '2026-11-24', 'test-secret'));
    });
});
