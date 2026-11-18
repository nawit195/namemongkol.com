import { describe, expect, it } from 'vitest';
import type { PublicNameRecord } from '@/lib/publicNames';
import { buildPublicNamesCsv, getPublicNameDisplayMeaning } from '@/lib/publicNamesCsv';

function createRecord(overrides: Partial<PublicNameRecord> = {}): PublicNameRecord {
    return {
        name: 'ชิณคิณา',
        englishName: 'CHINKHINA',
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
        expect(csv).toContain('"ชื่อมงคล","ชื่อภาษาอังกฤษ","สถานะชื่อภาษาอังกฤษ","คำอ่าน","ความหมาย","วัน","ผลรวมเลขศาสตร์"');
        expect(csv).toContain('"ชิณคิณา","CHINKHINA","ตามข้อมูลต้นทาง","ชิน-คิ-นา / ชิ-นะ-คิ-นา","มีปัญญา และมีความรู้"');
        expect(csv).toContain('"วันอาทิตย์, วันพุธ (กลางคืน/ราหู), วันศุกร์","25"');
    });

    it('leaves unavailable details blank and keeps pending or draft values', () => {
        const csv = buildPublicNamesCsv([
            createRecord({ pronunciation: undefined, pronunciationVariants: [], meaning: undefined }),
            createRecord({ name: 'ชินรินา', pronunciation: 'ชิน-ริ-นา', pronunciationVariants: [], meaning: 'อ่อนโยน และรุ่งเรือง' }),
        ]);

        expect(csv).toContain('"ชิณคิณา","CHINKHINA","ตามข้อมูลต้นทาง","",""');
        expect(csv).toContain('"ชินรินา","CHINKHINA","ตามข้อมูลต้นทาง","ชิน-ริ-นา","อ่อนโยน และรุ่งเรือง"');
    });

    it('escapes quotes, commas, newlines, and spreadsheet formula prefixes', () => {
        const csv = buildPublicNamesCsv([
            createRecord({
                name: '=HYPERLINK("https://example.com")',
                pronunciation: 'คำ,อ่าน',
                pronunciationVariants: [],
                englishName: '@SUM(1,2)',
                meaning: 'บรรทัดแรก\n"บรรทัดสอง"',
            }),
        ]);

        expect(csv).toContain('"\'=HYPERLINK(""https://example.com"")"');
        expect(csv).toContain('"คำ,อ่าน"');
        expect(csv).toContain("\"'@SUM(1,2)\"");
        expect(csv).toContain('"บรรทัดแรก\n""บรรทัดสอง"""');
    });

    it('matches the meaning displayed by the search table', () => {
        expect(getPublicNameDisplayMeaning('รากศัพท์ = ความหมายที่แสดง')).toBe('ความหมายที่แสดง');
        expect(getPublicNameDisplayMeaning('ความหมายโดยตรง')).toBe('ความหมายโดยตรง');
        expect(getPublicNameDisplayMeaning()).toBe('');
    });

    it('exports the spelling review status and excludes rejected spellings', () => {
        const csv = buildPublicNamesCsv([
            createRecord({ englishName: 'Chinkhina', englishNameStatus: 'pending' }),
            createRecord({ name: 'ตรวจแล้ว', englishName: 'Approved', englishNameStatus: 'approved' }),
            createRecord({ name: 'ไม่ผ่าน', englishName: 'RejectedValue', englishNameStatus: 'rejected' }),
        ]);
        expect(csv).toContain('"Chinkhina","รอตรวจสอบ"');
        expect(csv).toContain('"Approved","ตรวจสอบแล้ว"');
        expect(csv).toContain('"ไม่ผ่าน","","ไม่เผยแพร่"');
        expect(csv).not.toContain('RejectedValue');
        expect(buildPublicNamesCsv([createRecord({ englishName: undefined })])).toContain('"ชิณคิณา","","ยังไม่มีข้อมูล"');
    });
});
