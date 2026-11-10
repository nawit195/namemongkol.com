import { describe, expect, test } from 'vitest';
import {
    thaiActivityDate,
    shiftActivityDate,
    parseReturningMembersQuery,
} from './memberActivity';
import {
    isMemberActivityPath,
    activityDateIsValid,
} from './memberActivityDates';
const now = new Date('2026-11-10T10:00:00Z');
describe('Thai activity dates and returning member filters', () => {
    test('uses the Thai midnight boundary rather than UTC', () => {
        expect(thaiActivityDate(new Date('2026-11-09T16:59:59Z'))).toBe(
            '2026-11-09',
        );
        expect(thaiActivityDate(new Date('2026-11-09T17:00:00Z'))).toBe(
            '2026-11-10',
        );
        expect(shiftActivityDate('2024-03-01', -1)).toBe('2024-02-29');
    });
    test('defaults to thirty inclusive Thai calendar days and validates filters', () => {
        expect(parseReturningMembersQuery(new URLSearchParams(), now)).toEqual({
            from: '2026-10-12',
            to: '2026-11-10',
            page: 1,
            source: 'all',
            search: '',
        });
        expect(
            parseReturningMembersQuery(
                new URLSearchParams(
                    'days=7&source=observed&search=  มาลี  &page=2',
                ),
                now,
            ),
        ).toMatchObject({
            from: '2026-11-04',
            to: '2026-11-10',
            source: 'observed',
            search: 'มาลี',
            page: 2,
        });
    });
    test('rejects invalid dates, future dates, oversized ranges and page/filter values', () => {
        for (const query of [
            'from=2026-02-30&to=2026-03-01',
            'from=2026-11-10&to=2026-11-09',
            'from=2026-11-09&to=2026-11-11',
            'from=2025-11-10&to=2026-11-10',
            'from=2026-11-01',
            'days=365',
            'source=bad',
            'page=0',
            'page=1.2',
            'page=100001',
            'search=' + 'ก'.repeat(101),
        ])
            expect(
                parseReturningMembersQuery(new URLSearchParams(query), now),
            ).toBeNull();
        expect(
            parseReturningMembersQuery(
                new URLSearchParams('from=2025-11-11&to=2026-11-10'),
                now,
            ),
        ).not.toBeNull();
        expect(activityDateIsValid('0000-01-01')).toBe(false);
    });
    test('only records public pages, excluding login, admin, private and API surfaces', () => {
        for (const p of [
            '/',
            '/names/girls',
            '/articles/example',
            '/premium-search',
            '/compare-names',
        ])
            expect(isMemberActivityPath(p)).toBe(true);
        for (const p of [
            '/admin',
            '/admin/users',
            '/login',
            '/auth/callback',
            '/api/member-activity',
            '/history',
            '/register',
            '/unknown',
            '/namesake',
        ])
            expect(isMemberActivityPath(p)).toBe(false);
    });
});
