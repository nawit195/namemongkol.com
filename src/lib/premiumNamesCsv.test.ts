import { describe, expect, it } from 'vitest';
import type { PremiumAdminRecord } from './adminPremiumNames';
import { buildPremiumNamesCsv } from './premiumNamesCsv';

const RECORD: PremiumAdminRecord = {
    id: 1,
    name: '=HYPERLINK("https://example.com")',
    createdAt: '2026-11-02T00:00:00.000Z',
    gender: 'female',
    pronunciation: 'กาน',
    pronunciationDraft: 'กาน-นะ',
    pronunciationStatus: 'draft',
    meaning: 'ความหมาย "เดิม"',
    meaningDraft: 'ความหมายใหม่',
    meaningStatus: 'approved',
    publicationStatus: 'hidden',
    hasSharedDetails: true,
};

describe('premium names CSV', () => {
    it('adds a UTF-8 BOM, Thai headers, shared details, and review states', () => {
        const csv = buildPremiumNamesCsv([RECORD]);

        expect(csv.startsWith('\uFEFF')).toBe(true);
        expect(csv).toContain('"ชื่อ Premium"');
        expect(csv).toContain('"หญิง"');
        expect(csv).toContain('"กาน-นะ"');
        expect(csv).toContain('"ฉบับร่าง"');
        expect(csv).toContain('"ซ่อน"');
        expect(csv).toContain('"ความหมาย ""เดิม"""');
        expect(csv.endsWith('\r\n')).toBe(true);
    });

    it('protects spreadsheet formula prefixes', () => {
        const csv = buildPremiumNamesCsv([RECORD]);
        expect(csv).toContain('"\'=HYPERLINK(""https://example.com"")"');
    });
});
