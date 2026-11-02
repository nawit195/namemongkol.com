import { describe, expect, it } from 'vitest';
import { buildPremiumNameCatalog, fallbackPremiumNameCatalog } from './premiumNameCatalog';

describe('shared premium name catalog', () => {
    it('uses the database response as the authoritative catalog', () => {
        const remoteName = 'กานต์ฐานกลาง';
        const catalog = buildPremiumNameCatalog([{
            name: remoteName,
            pronunciation: 'กาน-ฐาน-กลาง',
            pronunciationStatus: 'approved',
            meaning: 'ชื่อทดสอบจากฐานข้อมูลกลาง',
            meaningStatus: 'approved',
        }]);

        expect(catalog.find((entry) => entry.name === remoteName)).toMatchObject({
            pronunciation: 'กาน-ฐาน-กลาง',
            meaning: 'ชื่อทดสอบจากฐานข้อมูลกลาง',
        });
        expect(catalog).toHaveLength(1);
        expect(catalog.some((entry) => entry.name === fallbackPremiumNameCatalog[0]?.name)).toBe(false);
    });

    it('keeps the static catalog only as an API failure fallback', () => {
        expect(buildPremiumNameCatalog([])).toEqual([]);
        expect(fallbackPremiumNameCatalog.length).toBeGreaterThan(0);
    });
});
