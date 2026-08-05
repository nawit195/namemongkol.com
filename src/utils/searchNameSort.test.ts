import { describe, expect, it } from 'vitest';
import { isRecentlyAdded, sortSearchNamesByNewest } from './searchNameSort';

describe('search name recency', () => {
    it('sorts newly added names before older names', () => {
        const names = [
            { name: 'กานต์', createdAt: '2026-07-01T00:00:00.000Z' },
            { name: 'ไกรวิชญ์', createdAt: '2026-08-05T00:00:00.000Z' },
            { name: 'โกมลกร', createdAt: '2026-08-04T00:00:00.000Z' },
        ];

        expect(sortSearchNamesByNewest(names).map((item) => item.name)).toEqual([
            'ไกรวิชญ์',
            'โกมลกร',
            'กานต์',
        ]);
    });

    it('uses Thai alphabetical order when timestamps are equal', () => {
        const createdAt = '2026-08-05T00:00:00.000Z';
        const names = [
            { name: 'โกมลกร', createdAt },
            { name: 'ไกรวิชญ์', createdAt },
        ];

        const sorted = sortSearchNamesByNewest(names);
        expect(sorted.map((item) => item.name)).toEqual(
            [...names].sort((left, right) => left.name.localeCompare(right.name, 'th')).map((item) => item.name),
        );
    });

    it('marks only names added within the configured period as recent', () => {
        const now = Date.parse('2026-08-05T12:00:00.000Z');

        expect(isRecentlyAdded('2026-08-01T12:00:00.000Z', now)).toBe(true);
        expect(isRecentlyAdded('2026-07-01T12:00:00.000Z', now)).toBe(false);
        expect(isRecentlyAdded(undefined, now)).toBe(false);
    });
});
