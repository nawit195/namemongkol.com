import fs from 'node:fs';
import { describe, expect, it } from 'vitest';
import { premiumInitialChoNames, premiumInitialChoNamesRaw } from './premiumInitialChoNames';
import { premiumInitialThoNames } from './premiumInitialThoNames';
import { premiumNamesRaw } from './premiumNamesRaw';
import { premiumSearchNameDetails, premiumSearchNamesRaw } from './premiumSearchNames';
import { mergePremiumNameSources, parsePremiumNames } from '@/utils/premiumDataParser';
import { generatePremiumNames } from '@/utils/premiumAnalysisUtils';
import { filterPremiumNames, THAI_DAY_TO_KEY } from '@/app/premium-search/premiumSearchUtils';

const source = fs.readFileSync('src/data/__fixtures__/premium-initial-cho.tsv', 'utf8')
    .trim().split(/\r?\n/).map((line) => {
        const [, name, grade, score, days, pairs, pronunciation, meaning] = line.split('\t');
        return { name, grade, score: Number(score), days: days.split(',').map((day) => day.trim()),
            pairs: pairs.split(' - '), pronunciation, meaning };
    });
const catalog = mergePremiumNameSources(premiumSearchNamesRaw, premiumSearchNameDetails);
const byName = new Map(catalog.map((item) => [item.name, item]));

describe('curated Premium ช collection', () => {
    it('imports exactly 187 unique names and preserves every supplied field', () => {
        expect(source).toHaveLength(187);
        expect(premiumInitialChoNames).toHaveLength(187);
        expect(new Set(premiumInitialChoNames.map((item) => item.name)).size).toBe(187);
        for (const row of source) {
            expect(row.name.startsWith('ช')).toBe(true);
            expect(row.grade).toBe('A+');
            expect(byName.get(row.name), row.name).toMatchObject({
                totalScore: row.score, scoreBreakdown: row.pairs, suitableDays: row.days,
                pronunciation: row.pronunciation, meaning: row.meaning,
                pronunciationStatus: 'pending', meaningStatus: 'pending',
            });
        }
    });

    it('uses supplied days in both search and analysis for every name', () => {
        for (const [day, dayKey] of Object.entries(THAI_DAY_TO_KEY)) {
            const found = new Set(filterPremiumNames(catalog, {
                selectedDay: day, selectedGender: 'all', targetScore: '', leadingCharType: 'Any',
            }).map((item) => item.name));
            // Empty surname gives a zero surname score, isolating the supplied-day filter.
            const analyzed = new Map(generatePremiumNames('', dayKey, 'WEALTH', 10000)
                .map((item) => [item.name, item]));
            for (const row of source) {
                expect(found.has(row.name), `${row.name}: ${day}`).toBe(row.days.includes(day));
                expect(analyzed.has(row.name), `${row.name}: ${day}`).toBe(row.days.includes(day));
                if (analyzed.has(row.name)) expect(analyzed.get(row.name)?.meaning).toBe(row.meaning);
            }
        }
        expect(parsePremiumNames('ชิณคัณ')[0].suitableDays).not.toContain('เสาร์');
        expect(byName.get('ชิณคัณ')?.suitableDays).toContain('เสาร์');
    });

    it('preserves details on missing/blank API responses and accepts reviewed fields', () => {
        const local = premiumInitialChoNames[0];
        const blank = mergePremiumNameSources(premiumInitialChoNamesRaw, premiumInitialChoNames, [
            { name: ` ${local.name} `, meaning: ' ', pronunciation: '', meaningStatus: 'pending' },
            { name: local.name },
        ]);
        expect(blank).toHaveLength(187);
        expect(blank[0]).toMatchObject(local);
        const reviewed = mergePremiumNameSources(premiumInitialChoNamesRaw, premiumInitialChoNames, [
            { name: local.name, meaning: 'ความหมายตรวจสอบแล้ว', meaningStatus: 'approved' },
            { name: local.name },
        ])[0];
        expect(reviewed).toMatchObject({ meaning: 'ความหมายตรวจสอบแล้ว', meaningStatus: 'approved',
            pronunciation: local.pronunciation, suitableDays: local.suitableDays });
        const rejected = mergePremiumNameSources(premiumInitialChoNamesRaw, premiumInitialChoNames, [
            { name: local.name, meaningStatus: 'rejected' },
        ])[0];
        expect(rejected.meaning).toBeUndefined();
        expect(rejected.meaningStatus).toBe('rejected');
    });

    it('keeps surname scoring, focus grades, exclusions and limits', () => {
        const all = generatePremiumNames('', 'saturday', 'PATRON', 10000);
        expect(all.find((item) => item.name === 'ชิณคัณ')).toMatchObject({ grade: 'A+', totalScore: 24 });
        expect(generatePremiumNames('', 'saturday', 'WEALTH', 10000)
            .find((item) => item.name === 'ชิณคัณ')?.grade).toBe('A');
        expect(generatePremiumNames('', 'saturday', 'PATRON', 10000, ['ชิณคัณ'])
            .some((item) => item.name === 'ชิณคัณ')).toBe(false);
        expect(generatePremiumNames('', 'saturday', 'PATRON', 20)).toEqual(all.slice(0, 20));
        expect(generatePremiumNames('ก', 'saturday', 'PATRON', 10000)
            .some((item) => item.name === 'ชิณคัณ')).toBe(false);
    });

    it('leaves the shared base unchanged and keeps ฑ additions search-only', () => {
        const base = new Set(parsePremiumNames(premiumNamesRaw).map((item) => item.name));
        const seed = fs.readFileSync('scripts/seed-premium-names.sql', 'utf8');
        for (const row of source) {
            expect(base.has(row.name)).toBe(false);
            expect(seed.split(`('${row.name}')`)).toHaveLength(2);
        }
        const analysisNames = new Set(Object.values(THAI_DAY_TO_KEY).flatMap((day) => (
            generatePremiumNames('', day, 'WEALTH', 10000).map((item) => item.name)
        )));
        for (const row of premiumInitialThoNames) {
            expect(byName.get(row.name)).toMatchObject({ meaning: row.meaning });
            expect(analysisNames.has(row.name)).toBe(false);
        }
    });
});
