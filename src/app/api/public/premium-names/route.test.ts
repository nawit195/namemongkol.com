import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ details: vi.fn(), latest: vi.fn() }));
vi.mock('@/lib/premiumNameDetails', () => ({
    fetchPublicPremiumNameDetails: mocks.details,
    fetchPremiumLatestAddedAt: mocks.latest,
}));
import { GET } from './route';

describe('public premium catalog response', () => {
    beforeEach(() => { vi.resetAllMocks(); });

    it('keeps the public catalog and update metadata cacheable together', async () => {
        const data = [{ name: 'กานต์', meaning: 'เป็นที่รัก', pronunciationVariants: [] }];
        mocks.details.mockResolvedValue(data);
        mocks.latest.mockResolvedValue('2026-11-17T00:00:00.000Z');
        const response = await GET();
        expect(await response.json()).toEqual({ success: true, data, total: 1, latestAddedAt: '2026-11-17T00:00:00.000Z' });
        expect(response.headers.get('Cache-Control')).toContain('s-maxage=600');
    });

    it('does not cache a transient database failure as an empty catalog', async () => {
        mocks.details.mockRejectedValue(new Error('Database unavailable'));
        mocks.latest.mockResolvedValue(null);
        const log = vi.spyOn(console, 'error').mockImplementation(() => {});
        try {
            const response = await GET();
            expect(response.status).toBe(500);
            expect(response.headers.get('Cache-Control')).toBe('no-store');
            expect((await response.json()).success).toBe(false);
        } finally { log.mockRestore(); }
    });
});
