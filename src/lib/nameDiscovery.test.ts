import { describe, expect, test } from 'vitest';
import { prepareReviewedNames } from './reviewedNames';
import type { PublicNameRecord } from './publicNames';
import { calculateScore } from '@/utils/calculateScore';
import { analyzePairs } from '@/utils/analyzePairs';
import { calculateGrade } from '@/utils/gradeResult';
import { analyzeThaksa } from '@/utils/analyzeThaksa';
import { thaksaConfig } from '@/data/thaksaConfig';
import type { DayKey } from '@/types';
import { boyNamesCurated } from '@/data/boyNamesCurated';
import { newEnglishNames, newNicknames } from '@/data/nameDiscoveryAdditions';
import { englishNames } from '@/data/englishNames';
import { nicknames } from '@/data/nicknames';
import {
    parseFavorites,
    parseComparisonSelection,
    favoriteId,
    canCompareFavorite,
    writeFavorites,
} from './nameFavorites';
const record = (
    name: string,
    extra: Partial<PublicNameRecord> = {},
): PublicNameRecord => ({
    name,
    gender: 'neutral',
    meaning: 'ความหมายตรวจแล้ว',
    meaningStatus: 'approved',
    numerology: 999,
    grade: 'C',
    suitableDays: ['monday'],
    ...extra,
});
describe('reviewed name discovery', () => {
    test('excludes explicit pending/rejected meanings and unreviewed unknown names; only approved readings', () => {
        const curated = boyNamesCurated[0];
        const rows = prepareReviewedNames([
            record('กวิน', {
                pronunciation: 'ร่าง',
                pronunciationStatus: 'pending',
            }),
            record('ภาคิน', { meaningStatus: 'pending' }),
            record('วิชญ์', { meaningStatus: 'rejected' }),
            record('ใหม่ที่ไม่ตรวจ', { meaningStatus: undefined }),
            record(curated.name, { meaningStatus: undefined, meaning: 'ร่าง' }),
            record('Alice', {
                pronunciation: 'อลิส',
                pronunciationStatus: 'approved',
            }),
        ]);
        expect(rows.map((r) => r.name)).not.toContain('ภาคิน');
        expect(rows.map((r) => r.name)).not.toContain('วิชญ์');
        expect(rows.map((r) => r.name)).not.toContain('ใหม่ที่ไม่ตรวจ');
        expect(rows.find((r) => r.name === curated.name)?.meaning).toBe(
            curated.meaning,
        );
        expect(
            rows.find((r) => r.name === 'กวิน')?.pronunciation,
        ).toBeUndefined();
        expect(rows.find((r) => r.name === 'Alice')?.pronunciation).toBe(
            'อลิส',
        );
    });
    test('normalizes duplicates conservatively and recalculates all eight days with analysis formula', () => {
        const rows = prepareReviewedNames(
            ['ภาคิน', 'กวินทร์', 'ศิริพร', 'Alice'].map((name) => record(name)),
        );
        for (const row of rows) {
            expect(row.numerology).toBe(calculateScore(row.name));
            expect(row.grade).toBe(
                calculateGrade(
                    calculateScore(row.name),
                    analyzePairs(row.name),
                ),
            );
            for (const day of Object.keys(thaksaConfig) as DayKey[])
                expect(row.suitableDays.includes(day)).toBe(
                    !analyzeThaksa(row.name, day)?.hasKali,
                );
        }
        expect(
            prepareReviewedNames([record(' Alice '), record('alice')]),
        ).toHaveLength(1);
        expect(
            prepareReviewedNames([
                record('ภาคิน'),
                record('ภาคิน', { meaningStatus: 'rejected' }),
            ]),
        ).toEqual([]);
    });
    test('adds exactly forty unique names per collection with source links, without duplicating old names', () => {
        for (const [added, all] of [
            [newNicknames, nicknames],
            [newEnglishNames, englishNames],
        ] as const) {
            expect(added).toHaveLength(40);
            expect(
                new Set(
                    all.map((item) =>
                        item.name.normalize('NFC').trim().toLowerCase(),
                    ),
                ).size,
            ).toBe(all.length);
            expect(
                added.every(
                    (item) =>
                        !!item.meaning &&
                        !!item.sourceUrl?.startsWith('https://'),
                ),
            ).toBe(true);
        }
        expect(nicknames).toHaveLength(63);
        expect(englishNames).toHaveLength(75);
        expect(newNicknames.every((item) => item.gender === 'unisex')).toBe(
            true,
        );
    });
});
describe('local favorites and comparison selection', () => {
    test('handles storage denial without throwing or changing the in-memory selection', () => {
        const items = [{ name: 'Alice', kind: 'english' as const }];
        expect(
            writeFavorites(
                {
                    setItem: () => {
                        throw new Error('Denied');
                    },
                },
                items,
            ),
        ).toBe(false);
        expect(items).toHaveLength(1);
        let saved = '';
        expect(
            writeFavorites(
                {
                    setItem: (_key, value) => {
                        saved = value;
                    },
                },
                items,
            ),
        ).toBe(true);
        expect(parseFavorites(JSON.parse(saved))).toEqual(items);
    });
    test('deduplicates within kind, keeps nickname separate and caps fifty', () => {
        const parsed = parseFavorites([
            { name: ' Alice ', kind: 'english' },
            { name: 'alice', kind: 'english' },
            { name: 'Alice', kind: 'nickname' },
            ...Array.from({ length: 60 }, (_, i) => ({
                name: `ชื่อ${i}`,
                kind: 'thai',
            })),
        ]);
        expect(parsed).toHaveLength(50);
        expect(
            parsed.filter((item) => item.name.toLowerCase() === 'alice'),
        ).toHaveLength(2);
        expect(favoriteId(parsed[0])).toBe('english:alice');
    });
    test('rejects invalid data and only hands off two to five supported, distinct real names', () => {
        expect(
            parseFavorites([
                null,
                { name: '<script>', kind: 'thai' },
                { name: '', kind: 'thai' },
                { name: 'เจ', kind: 'bad' },
            ]),
        ).toEqual([]);
        expect(canCompareFavorite({ name: 'ข้าว', kind: 'nickname' })).toBe(
            false,
        );
        expect(
            parseComparisonSelection({ names: [' ภาคิน ', 'Alice'] }),
        ).toEqual(['ภาคิน', 'Alice']);
        for (const names of [
            ['Alice'],
            ['Alice', 'ALICE'],
            ['กวิน', '<svg>'],
            Array(6).fill('กวิน'),
        ])
            expect(parseComparisonSelection({ names })).toBeNull();
    });
});
