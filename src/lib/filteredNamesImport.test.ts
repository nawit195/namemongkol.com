import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { planImport, buildImportSql } from '../../scripts/import-filtered-names.mjs';

const item = { name: 'กมล', pronunciation: 'กะ-มน', meaning: 'ใจ', englishName: 'KAMON' };
describe('filtered A-B names import', () => {
    it('uses only 1003 unique A-B records with one explicit English correction and a missing-data row', () => {
        const source = JSON.parse(readFileSync('scripts/data/filtered-names-ab-2026-11-14.json', 'utf8'));
        expect(source.sheet).toBe('A-B');
        expect(source.records).toHaveLength(1003);
        expect(planImport(source.records, []).stats.newNames).toBe(1003);
        expect(source.records.find((x: { name: string; englishName: string }) => x.name === 'นิรภัฏ').englishName).toBe('NIRAPHAT');
        expect(source.records.find((x: { name: string; englishName: string }) => x.name === 'นาวิน').englishName).toBe('');
    });
    it('normalizes duplicates and preserves reviewed, draft, hidden, and nonblank values', () => {
        const existing = { id: 'id', name: ' กมล ', gender: 'female', created_at: 'old', meaning: 'เดิม', pronunciation: '', pronunciation_status: 'rejected', english_name: null };
        const plan = planImport([item], [existing]);
        expect(plan.stats.existingNames).toBe(1);
        expect(plan.changes[0].patch).toEqual({ english_name: 'KAMON' });
        expect(planImport([item], [{ ...existing, publication_status: 'hidden' }]).changes).toEqual([]);
        expect(planImport([item], [{ ...existing, pronunciation_status: 'pending', pronunciation_draft: 'ร่าง' }]).changes[0].patch).toEqual({ english_name: 'KAMON' });
        expect(() => planImport([item, { ...item, name: 'กมล\u200b' }], [])).toThrow();
    });
    it('adds neutral names and leaves missing values unavailable; repeat import does nothing', () => {
        const first = planImport([item, { name: 'นาวิน' }], []);
        expect(first.changes[0].patch.gender).toBe('neutral');
        expect(first.changes[1].patch).toEqual({ name: 'นาวิน', gender: 'neutral' });
        expect(planImport([item], [first.changes[0].patch]).changes).toEqual([]);
        const pending = planImport([item], [{ name: item.name, meaning: null, meaning_status: 'draft' }]);
        expect(pending.changes[0].patch).toHaveProperty('meaning_status', 'pending');
    });
    it('locks the table and checks snapshots in the same transaction, escaping literals', () => {
        const sql = buildImportSql(planImport([{ ...item, meaning: "ใจ 'ดี'" }], []));
        expect(sql).toContain('BEGIN;');
        expect(sql).toContain('SHARE ROW EXCLUSIVE MODE');
        expect(sql).toContain("ใจ ''ดี''");
        expect(sql).toContain('Import snapshot changed');
        expect(sql).toContain('COMMIT;');
    });
});
