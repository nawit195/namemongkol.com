import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
// @ts-expect-error The executable importer is plain ESM and intentionally has no runtime dependency on TypeScript.
import { parseCsv, validateCsv } from '../../scripts/import-auspicious-name-details.mjs';
// @ts-expect-error The shared validation helper is plain ESM for the executable importer.
import { getPronunciationIssues, normalizePronunciationText } from '../../scripts/lib/thai-pronunciation.mjs';

describe('auspicious name CSV import', () => {
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

    it('keeps database-only names behind an explicit preservation flag', () => {
        const importer = readFileSync('scripts/import-auspicious-name-details.mjs', 'utf8');
        expect(importer).toContain("argv.includes('--preserve-db-extras')");
        expect(importer).toContain("'--review-file'");
        expect(importer).toContain('preservedDatabaseOnlyNames');
        expect(importer).toContain('mismatchedCsvRecords');
    });
});
