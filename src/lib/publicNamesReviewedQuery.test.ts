import { describe, expect, test, vi } from 'vitest';
const { range } = vi.hoisted(() => ({
    range: vi.fn(async (from: number, to: number) => ({
        data: Array.from({ length: 1510 }, (_, i) => ({
            name: `ชื่อทดสอบ${i}`,
            gender: 'neutral',
            english_name: `NAME-${i}`,
            meaning: i % 3 === 0 ? 'ความสุข' : 'ความรู้',
            meaning_status: i < 1505 ? 'approved' : 'pending',
            pronunciation: 'ร่าง',
            pronunciation_status: 'pending',
            publication_status: 'published',
            created_at: null,
        })).slice(from, to + 1),
        error: null,
    })),
}));
vi.mock('server-only', () => ({}));
vi.mock('next/cache', () => ({ unstable_cache: (fn: unknown) => fn }));
vi.mock('@supabase/supabase-js', () => ({
    createClient: () => ({
        from: () => ({ select: () => ({ order: () => ({ range }) }) }),
    }),
}));
import { queryPublicNames } from './publicNames';
describe('reviewed public names query', () => {
    test('reviews and searches before counting and paging across the database 1000 row boundary, sharing prepared data', async () => {
        vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co');
        vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-only');
        try {
            const first = await queryPublicNames({
                reviewedOnly: true,
                discoveryOnly: true,
                search: 'ความสุข',
                limit: 30,
            });
            const second = await queryPublicNames({
                reviewedOnly: true,
                discoveryOnly: true,
                search: 'ความสุข',
                limit: 30,
                page: 2,
            });
            expect(first.data[0].englishName).toMatch(/^NAME-/);
            expect(first.total).toBe(502);
            expect(second.total).toBe(502);
            expect(first.data).toHaveLength(30);
            expect(second.data).toHaveLength(30);
            expect(
                new Set(
                    [...first.data, ...second.data].map((item) => item.name),
                ).size,
            ).toBe(60);
            expect(
                first.data.every(
                    (item) =>
                        item.meaning === 'ความสุข' &&
                        item.pronunciation === undefined,
                ),
            ).toBe(true);
            expect(range).toHaveBeenCalledTimes(2);
            const empty = await queryPublicNames({
                reviewedOnly: true,
                search: 'ไม่มีคำนี้',
            });
            expect(empty.total).toBe(0);
            expect(empty.data).toEqual([]);
            const legacy = await queryPublicNames({ search: 'ไม่มีคำนี้' });
            expect(legacy.total).toBeGreaterThan(1505); // Existing mode ignores the new reviewed-only search.
        } finally {
            vi.unstubAllEnvs();
        }
    });
});
