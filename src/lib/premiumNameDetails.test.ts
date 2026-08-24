import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('next/cache', () => ({ unstable_cache: (callback: unknown) => callback }));

import { buildPublicPremiumNameDetails } from './premiumNameDetails';

describe('public premium name details', () => {
    it('preserves premium order, removes hidden names, and normalizes review states', () => {
        const result = buildPublicPremiumNameDetails(
            [{ name: 'กานต์' }, { name: 'ขวัญ' }, { name: 'คีตา' }, { name: 'กานต์' }],
            [
                {
                    name: 'กานต์',
                    pronunciation: 'กาน',
                    pronunciation_variants: ['กาน-นะ'],
                    meaning: 'เป็นที่รัก',
                    publication_status: 'published',
                },
                {
                    name: 'ขวัญ',
                    pronunciation: 'ขวัน',
                    pronunciation_status: 'rejected',
                    meaning: 'สิริมงคล',
                    meaning_status: 'approved',
                    publication_status: 'published',
                },
                { name: 'คีตา', publication_status: 'hidden' },
            ],
        );

        expect(result).toEqual([
            {
                name: 'กานต์',
                pronunciation: 'กาน',
                pronunciationVariants: ['กาน-นะ'],
                pronunciationStatus: 'pending',
                meaning: 'เป็นที่รัก',
                meaningStatus: 'pending',
            },
            {
                name: 'ขวัญ',
                pronunciation: undefined,
                pronunciationVariants: [],
                pronunciationStatus: 'rejected',
                meaning: 'สิริมงคล',
                meaningStatus: 'approved',
            },
        ]);
    });

    it('keeps unmatched premium names without inventing details', () => {
        expect(buildPublicPremiumNameDetails([{ name: 'ชื่อใหม่' }], [])).toEqual([{
            name: 'ชื่อใหม่',
            pronunciation: undefined,
            pronunciationVariants: [],
            pronunciationStatus: undefined,
            meaning: undefined,
            meaningStatus: undefined,
        }]);
    });

    it('caches only database pages with the expected TTL and invalidation tags', () => {
        const source = fs.readFileSync(path.join(process.cwd(), 'src/lib/premiumNameDetails.ts'), 'utf8');
        expect(source).toContain("['public-premium-name-list-page-v1']");
        expect(source).toContain("tags: ['premium-names']");
        expect(source).toContain("['public-premium-name-detail-page-v1']");
        expect(source).toContain("tags: ['premium-names', 'public-names']");
        expect(source).toContain('revalidate: 600');
        expect(source).toContain('.range(from, from + DATABASE_PAGE_SIZE - 1)');
    });
});
