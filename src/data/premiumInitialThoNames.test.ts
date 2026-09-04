import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { getFirstConsonant } from '@/app/premium-search/premiumSearchUtils';
import { premiumInitialThoNames } from './premiumInitialThoNames';
import { premiumSearchNamesRaw } from './premiumSearchNames';
import { mergePremiumNameSources, parsePremiumNames } from '@/utils/premiumDataParser';

const expectedSamples = [
    {
        name: 'ฑอลาลักษณ์',
        totalScore: 45,
        suitableDays: ['พุธ(กลางวัน)', 'พุธ(กลางคืน)', 'พฤหัสบดี'],
        scoreBreakdown: ['36🟢', '66🟢', '61🟢', '16🟢', '64🟢', '41🟢', '14🟢', '45🟢', '59🟢'],
    },
    {
        name: 'ฑจินาวิชญ์',
        totalScore: 44,
        suitableDays: ['อาทิตย์', 'อังคาร', 'พุธ(กลางคืน)'],
        scoreBreakdown: ['36🟢', '64🟢', '45🟢', '51🟢', '16🟢', '64🟢', '42🟢', '24🟢', '49🟢'],
    },
    {
        name: 'ฑอมินาณัฐ',
        totalScore: 42,
        suitableDays: ['อาทิตย์', 'อังคาร', 'พุธ(กลางวัน)', 'ศุกร์'],
        scoreBreakdown: ['36🟢', '65🟢', '54🟢', '45🟢', '51🟢', '15🟢', '54🟢', '49🟢'],
    },
    {
        name: 'ฑจินารักษ์',
        totalScore: 41,
        suitableDays: ['พุธ(กลางคืน)'],
        scoreBreakdown: ['36🟢', '64🟢', '45🟢', '51🟢', '14🟢', '44🟢', '41🟢', '14🟢', '49🟢'],
    },
    {
        name: 'ฑจวินาวิน',
        totalScore: 40,
        suitableDays: ['อาทิตย์', 'อังคาร', 'พุธ(กลางคืน)'],
        scoreBreakdown: ['36🟢', '66🟢', '64🟢', '45🟢', '51🟢', '16🟢', '64🟢', '45🟢'],
    },
    {
        name: 'ฑอวราอรุณ',
        totalScore: 36,
        suitableDays: ['อาทิตย์', 'อังคาร', 'พุธ(กลางวัน)', 'พุธ(กลางคืน)', 'พฤหัสบดี'],
        scoreBreakdown: ['36🟢', '66🟢', '64🟢', '41🟢', '16🟢', '64🟢', '41🟢', '15🟢'],
    },
    {
        name: 'ฑจินาญา',
        totalScore: 24,
        suitableDays: ['อาทิตย์', 'อังคาร', 'พุธ(กลางคืน)', 'ศุกร์'],
        scoreBreakdown: ['36🟢', '64🟢', '45🟢', '51🟢', '14🟢', '41🟢'],
    },
];

describe('premium initial ฑ names', () => {
    it('contains 100 unique premium-only details under the ฑ initial', () => {
        const names = premiumInitialThoNames.map(({ name }) => name);

        expect(premiumInitialThoNames).toHaveLength(100);
        expect(new Set(names).size).toBe(100);
        expect(names.every((name) => getFirstConsonant(name) === 'ฑ')).toBe(true);
        expect(premiumInitialThoNames.every((item) => (
            item.pronunciation.length > 0
            && item.meaning.length > 0
            && item.pronunciationStatus === 'pending'
            && item.meaningStatus === 'pending'
        ))).toBe(true);
    });

    it('keeps the local fallback and SQL seed synchronized', () => {
        const fallbackNames = new Set(parsePremiumNames(premiumSearchNamesRaw).map(({ name }) => name));
        const seed = fs.readFileSync(path.join(process.cwd(), 'scripts/seed-premium-names.sql'), 'utf8');

        for (const { name } of premiumInitialThoNames) {
            expect(fallbackNames.has(name), `${name} is missing from the premium-search fallback`).toBe(true);
            expect(seed, `${name} is missing from the premium_names seed`).toContain(`('${name}')`);
        }
    });

    it.each(expectedSamples)('keeps the existing numerology rules for $name', (expected) => {
        const [parsed] = parsePremiumNames(expected.name);

        expect(parsed.totalScore).toBe(expected.totalScore);
        expect(parsed.suitableDays).toEqual(expect.arrayContaining(expected.suitableDays));
        expect(parsed.suitableDays).toHaveLength(expected.suitableDays.length);
        expect(parsed.scoreBreakdown).toEqual(expected.scoreBreakdown);
    });

    it('keeps local-only names and lets remote reviewed details win', () => {
        const localDetails = [{
            name: 'ฑอลาลักษณ์',
            pronunciation: 'ทอ-ลา-ลัก',
            meaning: 'ข้อมูล local',
            pronunciationStatus: 'pending' as const,
            meaningStatus: 'pending' as const,
        }];
        const remoteDetails = [
            {
                name: 'ฑอลาลักษณ์',
                pronunciation: 'ทอ-ลา-ลัก',
                meaning: 'ข้อมูลตรวจสอบแล้ว',
                pronunciationStatus: 'approved' as const,
                meaningStatus: 'approved' as const,
            },
            { name: 'ฑชื่อจากฐานข้อมูล', meaning: 'ชื่อจาก API' },
        ];

        const result = mergePremiumNameSources('ฑอลาลักษณ์\nฑลม', localDetails, remoteDetails);
        const byName = new Map(result.map((item) => [item.name, item]));

        expect(result.map(({ name }) => name)).toEqual(['ฑอลาลักษณ์', 'ฑลม', 'ฑชื่อจากฐานข้อมูล']);
        expect(byName.get('ฑอลาลักษณ์')).toMatchObject({
            meaning: 'ข้อมูลตรวจสอบแล้ว',
            pronunciationStatus: 'approved',
            meaningStatus: 'approved',
        });
        expect(byName.get('ฑลม')).toBeDefined();
        expect(byName.get('ฑชื่อจากฐานข้อมูล')?.meaning).toBe('ชื่อจาก API');
    });
});
