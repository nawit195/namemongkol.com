import { describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { planPremiumImport } from '../../scripts/import-premium-aplus.mjs';
import { buildImportSql } from '../../scripts/import-filtered-names.mjs';
vi.mock('server-only', () => ({}));
vi.mock('next/cache', () => ({ unstable_cache: (fn: unknown) => fn }));
vi.mock('@/components/LanguageProvider', () => ({ useLanguage: () => ({ t: (key: string) => key }) }));
import { buildPublicPremiumNameDetails } from './premiumNameDetails';
import { mergePremiumNameDetails, parsePremiumNames } from '@/utils/premiumDataParser';
import { generatePremiumNames } from '@/utils/premiumAnalysisUtils';
import PremiumNameCard from '@/app/premium-search/components/PremiumNameCard';
import { PremiumAnalysisNameDetails } from '@/app/premium-analysis/PremiumAnalysisNameDetails';
import PremiumHeader from '@/app/premium-search/components/PremiumHeader';
import PremiumSEOSection from '@/app/premium-search/components/PremiumSEOSection';

describe('premium A+ import and English details', () => {
    it('does not advertise a fallback count when the remote count is unavailable', () => {
        const header = renderToStaticMarkup(createElement(PremiumHeader, { totalNames: null, filteredCount: 0, availableLettersCount: 0, credits: null }));
        expect(header).toContain('คัดชื่อมงคลตามวันเกิดและเงื่อนไขที่คุณเลือก');
        const seo = renderToStaticMarkup(createElement(PremiumSEOSection, { allNamesLength: null }));
        expect(seo).toContain('ฐานรายชื่อคัดสรร');
        expect(seo).not.toContain('2,976');
    });
    it('has exactly 531 source names and does not guess English for ขันธ์', () => {
        const source = JSON.parse(readFileSync('scripts/data/premium-aplus-2026-11-14.json', 'utf8'));
        expect(source.sheet).toBe('A+');
        expect(source.records).toHaveLength(531);
        expect(source.records.filter((x: { englishName: string }) => x.englishName)).toHaveLength(530);
        expect(source.records.find((x: { name: string }) => x.name === 'ขันธ์').englishName).toBe('');
        const plan = planPremiumImport(source.records, []);
        expect(plan.stats.newNames).toBe(531);
        expect(plan.changes[0].patch).not.toHaveProperty('gender');
        expect(buildImportSql(plan, 'premium_names')).not.toContain('public.auspicious_names');
    });
    it('uses shared reviewed values, preserves rejection and hidden rows, and fills only missing fields', () => {
        const result = buildPublicPremiumNameDetails([
            { name: 'กานต์', pronunciation: 'ใหม่', meaning: 'ใหม่', english_name: 'KAN', pronunciation_status: 'pending', meaning_status: 'pending' },
            { name: 'ขวัญ', pronunciation: 'ขวัน', meaning: 'ความสุข', english_name: 'KHWAN' },
            { name: 'คีตา', english_name: 'KITA' },
        ], [
            { name: 'กานต์', pronunciation: 'กาน', meaning: 'ที่รัก', pronunciation_status: 'approved', meaning_status: 'approved', english_name: 'KANT' },
            { name: 'ขวัญ', pronunciation_status: 'rejected', meaning_status: 'rejected' },
            { name: 'คีตา', publication_status: 'hidden' },
        ]);
        expect(result).toHaveLength(2);
        expect(result[0]).toMatchObject({ pronunciation: 'กาน', meaning: 'ที่รัก', englishName: 'KANT', meaningStatus: 'approved' });
        expect(result[1]).toMatchObject({ pronunciationStatus: 'rejected', meaningStatus: 'rejected', englishName: 'KHWAN' });
        expect(result[1].meaning).toBeUndefined();
    });
    it('carries English to both result views and leaves formulas unchanged', () => {
        const parsed = parsePremiumNames('กานต์\nขวัญ\nกมล\nณัฐ\nธนกร');
        const detailed = mergePremiumNameDetails(parsed, parsed.map(x => ({ name: x.name, englishName: 'EXAMPLE-NAME', pronunciation: 'คำ-อ่าน', meaning: 'ความหมาย', pronunciationStatus: 'pending', meaningStatus: 'pending' })));
        const before = generatePremiumNames('', 'sunday', 'WEALTH', 20, [], parsed);
        const after = generatePremiumNames('', 'sunday', 'WEALTH', 20, [], detailed);
        expect(after.length).toBeGreaterThan(0);
        expect(after.map(({ name, grade, totalScore, notes }) => ({ name, grade, totalScore, notes }))).toEqual(before.map(({ name, grade, totalScore, notes }) => ({ name, grade, totalScore, notes })));
        expect(after[0].englishName).toBe('EXAMPLE-NAME');
        const searchHtml = renderToStaticMarkup(createElement(PremiumNameCard, { item: detailed[0], isUnlocked: true }));
        const analysisHtml = renderToStaticMarkup(createElement(PremiumAnalysisNameDetails, { result: after[0] }));
        expect(searchHtml).toContain('EXAMPLE-NAME');
        expect(analysisHtml).toContain('EXAMPLE-NAME');
        expect(analysisHtml).toContain('รอตรวจสอบ');
        const oldHtml = renderToStaticMarkup(createElement(PremiumAnalysisNameDetails, { result: { meaning: 'ข้อมูลประวัติเดิม' } }));
        expect(oldHtml).toContain('ข้อมูลประวัติเดิม');
        expect(oldHtml).toContain('ยังไม่มีข้อมูล');
    });
});
