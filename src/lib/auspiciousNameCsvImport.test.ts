import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { parseCsv, validateCsv } from '../../scripts/import-auspicious-name-details.mjs';
import {
    getPronunciationIssues,
    getPublicationPronunciationIssues,
    normalizePronunciationText,
} from '../../scripts/lib/thai-pronunciation.mjs';

describe('auspicious name CSV import', () => {
    it('ships reviewed and audit CSV artifacts for all 7,348 names', () => {
        const reviewed = parseCsv(readFileSync('outputs/auspicious-names-7348-reviewed.csv', 'utf8'));
        const audit = parseCsv(readFileSync('outputs/auspicious-names-7348-audit.csv', 'utf8'));
        expect(reviewed[0]).toEqual(['ชื่อ', 'คำอ่าน', 'ความหมาย']);
        expect(reviewed).toHaveLength(7349);
        expect(audit[0]).toEqual(['ชื่อ', 'คำอ่านหลัก', 'คำอ่านอื่น', 'สถานะคำอ่าน', 'สถานะความหมาย', 'รากศัพท์', 'แหล่งอ้างอิง', 'หมายเหตุ']);
        expect(audit).toHaveLength(7349);
    });
    it('parses quoted commas, quotes and new lines', () => {
        const rows = parseCsv('\uFEFFชื่อมงคล,คำอ่าน,ความหมาย\r\nกมล,"กะ-มน","ใจ, \"\"ดวงใจ\"\"\nที่งดงาม"\r\n');
        expect(rows).toEqual([
            ['ชื่อมงคล', 'คำอ่าน', 'ความหมาย'],
            ['กมล', 'กะ-มน', 'ใจ, "ดวงใจ"\nที่งดงาม'],
        ]);
    });

    it('accepts identical duplicate rows and returns one import record', () => {
        const csv = [
            'ชื่อมงคล,คำอ่าน,ความหมาย',
            'กมล,กะ-มน,ดวงใจ',
            'กมล,กะ-มน,ดวงใจ',
        ].join('\n');
        const result = validateCsv(csv, 2);
        expect(result.records).toHaveLength(2);
        expect(result.uniqueRecords).toEqual([{ name: 'กมล', pronunciation: 'กะ-มน', meaning: 'ดวงใจ' }]);
        expect(result.duplicateRows).toBe(1);
    });

    it('rejects conflicting duplicate rows', () => {
        const csv = [
            'ชื่อมงคล,คำอ่าน,ความหมาย',
            'กมล,กะ-มน,ดวงใจ',
            'กมล,กะ-มน,หัวใจ',
        ].join('\n');
        expect(() => validateCsv(csv, 2)).toThrow('Duplicate name has conflicting data: กมล');
    });

    it('rejects blank pronunciation and unexpected row counts', () => {
        expect(() => validateCsv('ชื่อมงคล,คำอ่าน,ความหมาย\nกมล,,ดวงใจ', 1)).toThrow('has a blank');
        expect(() => validateCsv('ชื่อมงคล,คำอ่าน,ความหมาย\nกมล,กะ-มน,ดวงใจ', 2)).toThrow('expected 2');
    });

    it('normalizes separators and rejects structurally invalid Thai readings', () => {
        expect(normalizePronunciationText(' กะ – มน ')).toBe('กะ-มน');
        expect(getPronunciationIssues('กะ-นะิก-นัน')).toContain('invalid-vowel-sequence');
        expect(getPronunciationIssues('เ-กี-ยะด')).toContain('detached-leading-vowel');
        expect(getPronunciationIssues('ลิ-่น')).toContain('detached-thai-mark');
        expect(() => validateCsv('ชื่อมงคล,คำอ่าน,ความหมาย\nกณิกนันต์,กะ-นะิก-นัน,ผู้มีความสุข', 1))
            .toThrow('invalid pronunciation');
    });

    it('keeps technical pinthu in drafts but blocks it from public approval', () => {
        expect(getPronunciationIssues('หฺนู-ปฺระ-โคน')).toEqual([]);
        expect(getPublicationPronunciationIssues('หฺนู-ปฺระ-โคน')).toContain('technical-pinthu');
    });

    it('keeps database-only names behind an explicit preservation flag', () => {
        const importer = readFileSync('scripts/import-auspicious-name-details.mjs', 'utf8');
        expect(importer).toContain("argv.includes('--preserve-db-extras')");
        expect(importer).toContain("'--review-file'");
        expect(importer).toContain('preservedDatabaseOnlyNames');
        expect(importer).toContain('mismatchedCsvRecords');
    });
});
