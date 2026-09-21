import { describe, expect, it } from 'vitest';
import type { PublicNameRecord } from '@/lib/publicNames';
import { buildPublicNamesCsv, getPublicNameDisplayMeaning } from '@/lib/publicNamesCsv';

function createRecord(overrides: Partial<PublicNameRecord> = {}): PublicNameRecord {
    return {
        name: 'ชิณคิณา',
        gender: 'neutral',
        pronunciation: 'ชิน-คิ-นา',
        pronunciationVariants: ['ชิน-คิ-นา', 'ชิ-นะ-คิ-นา'],
        pronunciationStatus: 'pending',
        meaning: 'ชิณ = มีปัญญา และมีความรู้',
        meaningStatus: 'draft',
        numerology: 25,
        suitableDays: ['sunday', 'wednesday_night', 'friday'],
        grade: 'B',
        ...overrides,
    };
}

describe('public names CSV export', () => {
    it('uses the requested Thai columns, UTF-8 BOM, display values, and full day names', () => {
        const csv = buildPublicNamesCsv([createRecord()]);

        expect(csv.charCodeAt(0)).toBe(0xfeff);
        expect(csv).toContain('"ชื่อมงคล","คำอ่าน","ความหมาย","วัน","ผลรวมเลขศาสตร์"');
        expect(csv).toContain('"ชิณคิณา","ชิน-คิ-นา / ชิ-นะ-คิ-นา","มีปัญญา และมีความรู้"');
        expect(csv).toContain('"วันอาทิตย์, วันพุธ (กลางคืน/ราหู), วันศุกร์","25"');
    });

    it('leaves unavailable details blank and keeps pending or draft values', () => {
        const csv = buildPublicNamesCsv([
            createRecord({ pronunciation: undefined, pronunciationVariants: [], meaning: undefined }),
            createRecord({ name: 'ชินรินา', pronunciation: 'ชิน-ริ-นา', pronunciationVariants: [], meaning: 'อ่อนโยน และรุ่งเรือง' }),
        ]);

        expect(csv).toContain('"ชิณคิณา","",""');
        expect(csv).toContain('"ชินรินา","ชิน-ริ-นา","อ่อนโยน และรุ่งเรือง"');
    });

    it('escapes quotes, commas, newlines, and spreadsheet formula prefixes', () => {
        const csv = buildPublicNamesCsv([
            createRecord({
                name: '=HYPERLINK("https://example.com")',
                pronunciation: 'คำ,อ่าน',
                pronunciationVariants: [],
                meaning: 'บรรทัดแรก\n"บรรทัดสอง"',
            }),
        ]);

        expect(csv).toContain('"\'=HYPERLINK(""https://example.com"")"');
        expect(csv).toContain('"คำ,อ่าน"');
        expect(csv).toContain('"บรรทัดแรก\n""บรรทัดสอง"""');
    });

    it('matches the meaning displayed by the search table', () => {
        expect(getPublicNameDisplayMeaning('รากศัพท์ = ความหมายที่แสดง')).toBe('ความหมายที่แสดง');
        expect(getPublicNameDisplayMeaning('ความหมายโดยตรง')).toBe('ความหมายโดยตรง');
        expect(getPublicNameDisplayMeaning()).toBe('');
    });
});
