import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/components/LanguageProvider', () => ({
    useLanguage: () => ({ t: (key: string) => key }),
}));

import PremiumNameCard from './components/PremiumNameCard';
import { mergePremiumNameDetails, parsePremiumNames, type PremiumNameData } from '@/utils/premiumDataParser';

const baseName: PremiumNameData = {
    name: 'กานต์',
    totalScore: 41,
    suitableDays: ['จันทร์'],
    scoreBreakdown: ['14🟢'],
    gender: 'neutral',
};

const renderCard = (item: PremiumNameData, isUnlocked: boolean) => renderToStaticMarkup(
    createElement(PremiumNameCard, { item, isUnlocked }),
);

describe('premium name enrichment and cards', () => {
    it('merges details without changing computed filters or name order', () => {
        const parsed = parsePremiumNames('กานต์\nขวัญ');
        const originalScores = parsed.map((item) => item.totalScore);
        const merged = mergePremiumNameDetails(parsed, [{
            name: 'กานต์',
            pronunciation: 'กาน',
            pronunciationVariants: ['กาน-นะ'],
            pronunciationStatus: 'pending',
            meaning: 'เป็นที่รัก',
            meaningStatus: 'pending',
        }]);

        expect(merged.map((item) => item.name)).toEqual(['กานต์', 'ขวัญ']);
        expect(merged.map((item) => item.totalScore)).toEqual(originalScores);
        expect(merged[0]).toMatchObject({ pronunciation: 'กาน', meaning: 'เป็นที่รัก' });
        expect(merged[1].pronunciation).toBeUndefined();
    });

    it('shows pending details and pronunciation variants on an unlocked card', () => {
        const html = renderCard({
            ...baseName,
            pronunciation: 'กาน',
            pronunciationVariants: ['กาน-นะ'],
            pronunciationStatus: 'pending',
            meaning: 'เป็นที่รัก',
            meaningStatus: 'draft',
        }, true);

        expect(html).toContain('ข้อมูลเบื้องต้น · รอตรวจสอบ');
        expect(html).toContain('กาน-นะ');
        expect(html).toContain('เป็นที่รัก');
    });

    it('distinguishes approved, missing, and locked details', () => {
        const approved = renderCard({
            ...baseName,
            pronunciation: 'กาน',
            pronunciationStatus: 'approved',
            meaning: 'เป็นที่รัก',
            meaningStatus: 'approved',
        }, true);
        const missing = renderCard(baseName, true);
        const locked = renderCard({ ...baseName, pronunciation: 'กาน', meaning: 'เป็นที่รัก' }, false);

        expect(approved).toContain('ตรวจสอบแล้ว');
        expect(missing).toContain('กำลังจัดทำคำอ่าน');
        expect(missing).toContain('กำลังจัดทำความหมาย');
        expect(locked).toContain('aria-hidden="true"');
        expect(locked).toContain('ปลดล็อกเพื่อดูชื่อ');
        expect(locked).toContain('blur-sm');
    });
});
