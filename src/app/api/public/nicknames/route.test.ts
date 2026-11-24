import { describe, expect, it, vi } from 'vitest';
vi.mock('server-only', () => ({}));
vi.mock('@/lib/auspiciousNicknameCatalogServer', async () => ({
    getPremiumNicknameCatalog: async () =>
        (await import('@/lib/testFixtures/auspiciousNicknameCatalog'))
            .premiumNicknameFixture,
}));
import { GET } from './route';
import { premiumNicknameFixture as fixture } from '@/lib/testFixtures/auspiciousNicknameCatalog';

describe('public nickname delivery', () => {
    it('returns two free names for a letter and only a count for its locked cards', async () => {
        const response = await GET(
            new Request(
                'https://namemongkol.com/api/public/nicknames?group=aplus&initial=' +
                    encodeURIComponent('ข'),
            ),
        );
        const body = await response.json();
        expect(body.total).toBe(5);
        expect(body.visibleTotal).toBe(2);
        expect(body.lockedCount).toBe(3);
        expect(body.lockedOnPage).toBe(3);
        expect(body.purchase.count).toBe(3);
        expect(body.data).toHaveLength(2);
        expect(
            body.data.every(
                (item: { access: string }) => item.access === 'preview',
            ),
        ).toBe(true);
        for (const privateName of fixture
            .filter((item) => item.name.startsWith('ข'))
            .slice(2)) {
            expect(JSON.stringify(body)).not.toContain(privateName.name);
            expect(JSON.stringify(body)).not.toContain(privateName.id);
        }
    });
    it('is cacheable and never trusts an owned flag or requested page size', async () => {
        const response = await GET(
            new Request(
                'https://namemongkol.com/api/public/nicknames?group=aplus&view=owned&limit=9999&page=500',
            ),
        );
        const body = await response.json();
        expect(response.headers.get('cache-control')).toContain('s-maxage=600');
        expect(body.page).toBe(body.totalPages);
        expect(
            body.data.every(
                (item: { access: string }) => item.access === 'preview',
            ),
        ).toBe(true);
        expect(body.lockedOnPage).toBeLessThanOrEqual(20);
        expect(body.viewer.authenticated).toBe(false);
        expect(body.purchase.quote).toBeNull();
    });
});
