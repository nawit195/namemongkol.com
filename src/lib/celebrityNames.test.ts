import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { articles } from '@/data/articles';
import { celebrityNameCases } from '@/data/celebrityNames';
import { analyzeCelebrityName, getPublishedCelebrityNames } from './celebrityNames';
import { analyzePairs } from '@/utils/analyzePairs';
import { calculateScore } from '@/utils/calculateScore';
import { calculateGrade } from '@/utils/gradeResult';

describe('reviewed celebrity name case studies', () => {
    it('retains sourced occupations and uses only portraits with recorded license evidence', () => {
        const entries = getPublishedCelebrityNames();
        expect(entries.map(entry => [entry.nickname, entry.occupations])).toEqual([
            ['นนน', ['นักแสดง', 'นักร้อง']], ['เลิฟ', ['นักแสดง']], ['โฟร์ท', ['นักแสดง', 'นักร้อง']],
        ]);
        expect(entries.filter(entry => entry.portrait)).toHaveLength(2);
        for (const entry of entries) {
            if (!entry.portrait) {
                expect(entry.nickname).toBe('เลิฟ');
                continue;
            }
            const image = readFileSync(path.join(process.cwd(), 'public', entry.portrait.src));
            expect(image.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
            expect([image.readUInt32BE(16), image.readUInt32BE(20)]).toEqual([entry.portrait.width, entry.portrait.height]);
            expect(entry.portrait.alt).toContain(entry.nickname);
            expect(entry.portrait.credit).toBe('THHeadline');
            expect(entry.portrait.sourceUrl).toMatch(/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
            expect(entry.portrait.licenseUrl).toBe('https://creativecommons.org/licenses/by/3.0/');
            expect(entry.occupationSources.length).toBeGreaterThan(0);
        }
    });
    it('publishes only the three individually sourced identities, with workbook totals reproduced by the personal tool', () => {
        const entries = getPublishedCelebrityNames();
        expect(entries.map(entry => [entry.name, entry.surname, entry.analysis.nameSum])).toEqual([
            ['กรภัทร์', 'เกิดพันธุ์', 24], ['ภัทรานิษฐ์', 'ลิ้มปติยากร', 42], ['ณัฐวรรธน์', 'จิโรชน์ธิกุล', 50],
        ]);
        for (const entry of entries) {
            expect(entry.analysis.nameGrade).toBe('A+');
            expect(entry.analysis.namePairs.every(pair => pair.grade === 'good')).toBe(true);
            expect(entry.analysis.characters.reduce((sum, item) => sum + item.value, 0)).toBe(entry.workbookSum);
            expect(entry.source.url).toMatch(/^https:\/\/www\.gmm-tv\.com\/artists\/view\//);
            expect(articles.filter(article => article.slug === entry.slug)).toHaveLength(1);
        }
    });
    it('does not expose drafts, ambiguous surname matches, unsourced identities, or mismatched scores', () => {
        const original = celebrityNameCases[0];
        expect(getPublishedCelebrityNames([
            { ...original, status: 'draft' },
            { ...original, surname: 'เกิดพันธุ์\nนามสกุลอื่น' },
            { ...original, source: { title: '', url: '' } },
            { ...original, verifiedAt: '' },
            { ...original, workbookSum: 1 },
            { ...original, name: 'กก' },
        ])).toEqual([]);
    });
    it('computes the full-name grade independently, using separate name and surname pairs like the personal tool', () => {
        const input = { name: 'ปริญ', surname: 'สุภารัตน์' };
        const result = analyzeCelebrityName(input);
        expect(result.nameSum).toBe(14);
        expect(result.nameGrade).toBe('A+');
        expect(result.fullNameSum).toBe(49);
        expect(result.fullNameGrade).not.toBe('A+');
        expect(result.fullNameGrade).toBe(calculateGrade(calculateScore(input.name) + calculateScore(input.surname), [...analyzePairs(input.name), ...analyzePairs(input.surname)]));
    });
    it('keeps existing article URLs while replacing hard-coded scores and unsupported success claims', () => {
        for (const [slug, name, surname] of [
            ['case-study-khemanit-name-analysis', 'เขมนิจ', 'จามิกรณ์'],
            ['supajee-suthampun-numerology-a-plus', 'ศุภจี', 'สุธรรมพันธุ์'],
        ]) {
            const article = articles.find(article => article.slug === slug)!;
            const result = analyzeCelebrityName({ name, surname });
            expect(article.content).toContain(`${result.nameSum} + ${result.surnameSum} = ${result.fullNameSum}`);
            expect(article.content).toContain('ไม่ได้แสดงถึงการรับรองบริการ');
            expect(article.title).not.toMatch(/ร่ำรวย|รวยและดัง|CEO/);
            expect(article.metaTitle).not.toContain(`${name} ${name}`);
            expect(article.content).not.toContain('ต้นแบบชื่อเกรด A+');
            expect(article.dateModified).toBe('2026-11-26');
        }
    });
    it('separates identity sources, unverified meaning, and birthday compatibility from personal facts', () => {
        for (const entry of getPublishedCelebrityNames()) {
            const article = articles.find(article => article.slug === entry.slug)!;
            expect(article.content).toContain(entry.source.url);
            expect(article.content).toContain('ยังไม่ยืนยันคำอ่านเฉพาะบุคคล');
            expect(article.content).toContain('ไม่ใช่วันเกิดจริง');
            expect(article.content).toContain('day=sunday');
            expect(article.content).toContain('วันอาทิตย์เป็นเงื่อนไขสมมติ');
            expect(article.content).toContain('ไม่ใช่สถิติของคนดังทั้งหมด');
            expect(article.sources?.map(source => source.kind)).toEqual(['primary', 'methodology']);
        }
    });
});
