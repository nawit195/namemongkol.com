import { describe, expect, it, vi } from 'vitest';
vi.mock('server-only', () => ({}));
import catalog from '@/data/auspiciousNicknames.json';
import {
    DEFAULT_NICKNAME_FILTERS,
    nicknameInitial,
    nicknameFilterParams,
    normalizeNicknameFilters,
} from './auspiciousNicknameShared';
import {
    matchesNickname,
    NICKNAME_SUMMARY,
    queryNicknames as queryCatalog,
} from './auspiciousNicknames';
import type {
    AuspiciousNickname,
    NicknameFilters,
} from '@/types/auspiciousNickname';
import { premiumNicknameFixture as fixture } from './testFixtures/auspiciousNicknameCatalog';

const plus = { ...DEFAULT_NICKNAME_FILTERS, group: 'aplus' as const };
const query = (
    filters: NicknameFilters,
    purchased: AuspiciousNickname[] = [],
) => queryCatalog(filters, purchased, fixture);
const free = new Set(
    ['ก', 'ข', 'ค', 'ญ', 'อ'].flatMap((initial) =>
        fixture
            .filter((item) => item.name.startsWith(initial))
            .slice(0, 2)
            .map((item) => item.id),
    ),
);

describe('auspicious nickname catalog and access', () => {
    it('keeps the complete A+ catalog out of public source files', () => {
        expect(catalog.sourceRows).toBe(1650);
        expect(catalog.duplicatesRemoved).toBe(5);
        expect(NICKNAME_SUMMARY).toEqual({
            total: 1645,
            aPlus: 369,
            ab: 1276,
            a: 25,
            b: 1251,
        });
        expect(catalog.records).toHaveLength(1276);
        expect(catalog.records.every((item) => item.grade !== 'A+')).toBe(true);
        expect(new Set(catalog.records.map((item) => item.id)).size).toBe(1276);
    });
    it('preserves free A/B pagination and grading', () => {
        const result = query(DEFAULT_NICKNAME_FILTERS).response;
        expect(result.total).toBe(1276);
        expect(result.totalPages).toBe(43);
        expect(result.data).toHaveLength(30);
        expect(result.lockedOnPage).toBe(0);
        expect(result.data.every((item) => item.access === 'free')).toBe(true);
        expect(
            query({ ...DEFAULT_NICKNAME_FILTERS, grade: 'A' }).response.total,
        ).toBe(25);
        expect(
            query({ ...DEFAULT_NICKNAME_FILTERS, page: 999 }).response.page,
        ).toBe(43);
    });
    it('gives each initial its own fixed first two free names', () => {
        for (const initial of ['ก', 'ข', 'ค', 'ญ', 'อ']) {
            const expected = fixture
                .filter((item) => item.name.startsWith(initial))
                .slice(0, 2);
            const result = query({ ...plus, initial }).response;
            expect(result.data.map((item) => item.id)).toEqual(
                expected.map((item) => item.id),
            );
            expect(result.data.every((item) => item.access === 'preview')).toBe(
                true,
            );
            expect(result.visibleTotal).toBe(expected.length);
        }
    });
    it('does not rotate free names through search, birthday or score filters', () => {
        const exposed = new Set<string>();
        for (const item of fixture) {
            const result = query({ ...plus, q: item.name }).response;
            expect(result.data.map((row) => row.id)).toEqual(
                free.has(item.id) ? [item.id] : [],
            );
            for (const row of result.data) exposed.add(row.id);
        }
        expect(exposed).toEqual(free);
        expect(query({ ...plus, day: 'monday' }).response.data).toEqual([]);
        expect(query({ ...plus, score: 24 }).response.data).toEqual([]);
    });
    it('offers at most twenty locked names on the current page, excluding free names', () => {
        const first = query({ ...plus, initial: 'ก' });
        expect(first.response.data).toHaveLength(2);
        expect(first.response.lockedCount).toBe(25);
        expect(first.response.lockedOnPage).toBe(20);
        expect(first.response.purchase.count).toBe(20);
        expect(first.response.totalPages).toBe(2);
        expect(first.candidates.every((item) => !free.has(item.id))).toBe(true);
        const second = query({ ...plus, initial: 'ก', page: 2 });
        expect(second.response.data).toHaveLength(2);
        expect(second.response.lockedOnPage).toBe(5);
        expect(second.response.purchase.count).toBe(5);
        expect(
            second.candidates.every(
                (item) =>
                    !first.candidates.some(
                        (previous) => previous.id === item.id,
                    ),
            ),
        ).toBe(true);
        expect(query({ ...plus, initial: 'ก', page: 999 }).response.page).toBe(
            2,
        );
    });
    it('keeps page membership stable after buying and never charges for owned names', () => {
        const selected = { ...plus, initial: 'ก' };
        const bought = query(selected).candidates;
        const restored = query(selected, bought);
        expect(restored.response.data).toHaveLength(22);
        expect(restored.response.lockedOnPage).toBe(0);
        expect(restored.response.lockedCount).toBe(5);
        expect(restored.candidates).toEqual([]);
        expect(query({ ...selected, page: 2 }, bought).candidates).toHaveLength(
            5,
        );
        expect(
            query({ ...plus, view: 'owned' }, bought).response.data,
        ).toHaveLength(20);
        expect(
            query({ ...plus, q: bought[0].name }, bought).response.data[0]
                .access,
        ).toBe('purchased');
    });
    it('includes free-only letters and every paid name when browsing all pages', () => {
        const found = new Set<string>();
        const first = query(plus).response;
        for (let page = 1; page <= first.totalPages; page++) {
            const result = query({ ...plus, page });
            expect(result.candidates.length).toBeLessThanOrEqual(20);
            expect(result.response.lockedOnPage).toBe(result.candidates.length);
            for (const item of [...result.response.data, ...result.candidates])
                found.add(item.id);
        }
        expect(found).toEqual(new Set(fixture.map((item) => item.id)));
    });
    it('makes letters containing one or two names entirely free', () => {
        for (const initial of ['ญ', 'ค']) {
            const result = query({ ...plus, initial });
            expect(result.response.lockedCount).toBe(0);
            expect(result.response.lockedOnPage).toBe(0);
            expect(result.response.purchase.count).toBe(0);
            expect(result.candidates).toEqual([]);
        }
    });
    it('supports Thai leading vowels, separate Wednesday periods and unisex names', () => {
        expect(nicknameInitial('ไก่')).toBe('ก');
        expect(matchesNickname(fixture[0], { ...plus, gender: 'male' })).toBe(
            true,
        );
        expect(matchesNickname(fixture[0], { ...plus, gender: 'female' })).toBe(
            true,
        );
        expect(matchesNickname(fixture[0], { ...plus, day: 'wednesday' })).toBe(
            true,
        );
        expect(
            matchesNickname(fixture[0], { ...plus, day: 'wednesday_night' }),
        ).toBe(false);
    });
    it('retains purchased snapshots removed from the active catalog', () => {
        const snapshot = {
            ...fixture[0],
            id: 'nn_ffffffffffffffffffff',
            name: 'ชื่อที่เคยซื้อ',
        };
        const result = query({ ...plus, view: 'owned' }, [snapshot]);
        expect(result.response.data[0]).toMatchObject({
            ...snapshot,
            access: 'purchased',
        });
        expect(result.candidates).toEqual([]);
    });
    it('canonicalizes URLs and strips privileged views from free searches', () => {
        const filters = normalizeNicknameFilters({
            group: 'aplus',
            q: ' คำค้น ',
            page: -1,
            score: '14',
            day: 'unknown',
            initial: 'ไ',
        });
        expect(filters).toMatchObject({
            q: 'คำค้น',
            page: 1,
            score: 14,
            day: 'all',
            initial: 'all',
        });
        expect(
            normalizeNicknameFilters(
                Object.fromEntries(nicknameFilterParams(filters)),
            ),
        ).toEqual(filters);
        expect(
            normalizeNicknameFilters({ group: 'ab', view: 'owned' }).view,
        ).toBe('all');
    });
});
