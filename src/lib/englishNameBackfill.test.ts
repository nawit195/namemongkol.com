import { describe, expect, it } from 'vitest';
import { planEnglishBackfill, buildEnglishBackfillSql } from '../../scripts/prepare-english-name-backfill.mjs';

const row = { id: '00000000-0000-0000-0000-000000000001', name: 'นาวิน', pronunciation: 'นา-วิน', english_name: null };
const romanizer = () => ({ englishName: 'NAWIN', syllables: [{ thai: 'นา', roman: 'NA' }, { thai: 'วิน', roman: 'WIN' }], issues: [] });

describe('English spelling backfill', () => {
    it('keeps existing spellings and hidden/rejected/reviewed rows untouched', () => {
        for (const protectedValues of [{ english_name: 'Nawin' }, { publication_status: 'hidden' }, { pronunciation_status: 'rejected' }, { english_name_status: 'approved' }, { english_name_status: 'rejected' }]) {
            expect(planEnglishBackfill([{ ...row, ...protectedValues }], [], romanizer).changes).toEqual([]);
        }
        expect(row.english_name).toBeNull();
    });
    it('reuses only valid unambiguous same-name source spellings, marking all additions pending', () => {
        const plan = planEnglishBackfill([row], [{ name: ' นาวิน\u200b', english_name: 'Na-Win' }], romanizer);
        expect(plan.changes[0]).toMatchObject({ englishName: 'Na-Win', source: 'premium-source', status: 'pending', reading: null });
        expect(planEnglishBackfill([row], [{ name: 'นาวิน', english_name: 'ผิดช่อง' }], romanizer).changes[0].source).toBe('rtgs-reading-v1');
        expect(planEnglishBackfill([row], [{ name: 'นาวิน', english_name: 'Nawin' }, { name: 'นาวิน', english_name: 'Navin' }], romanizer).skipped[0].reason).toBe('conflicting-premium-spellings');
    });
    it('records the exact reading used and skips unresolved syllables', () => {
        const plan = planEnglishBackfill([row], [], romanizer);
        expect(plan.changes[0]).toMatchObject({ beforeEnglish: null, beforePronunciation: 'นา-วิน', reading: 'นา-วิน', status: 'pending' });
        expect(planEnglishBackfill([row], [], () => ({ issues: ['ambiguous'] })).changes).toEqual([]);
        expect(planEnglishBackfill([{ ...row, pronunciation: '' }], [], romanizer).skipped[0].reason).toBe('missing-pronunciation');
    });
    it('plans every row beyond one database page, detects duplicates, and makes repeat planning empty', () => {
        const rows = Array.from({ length: 1205 }, (_, index) => ({ ...row, id: String(index), name: `ชื่อ${index}` }));
        const plan = planEnglishBackfill(rows, [], romanizer);
        expect(plan.changes).toHaveLength(1205);
        expect(plan.stats.fromRomanization).toBe(1205);
        expect(planEnglishBackfill(rows.map(item => ({ ...item, english_name: 'NAWIN' })), [], romanizer).changes).toEqual([]);
        expect(planEnglishBackfill(rows.map(item => ({ ...item, english_name_draft: 'NAWIN', english_name_status: 'pending' })), [], romanizer).changes).toEqual([]);
        expect(() => planEnglishBackfill([row, { ...row, id: 'another' }], [], romanizer)).toThrow(/Duplicate/);
    });
    it('guards every row and source before a four-column-only atomic update, safely quoting input', () => {
        const plan = planEnglishBackfill([{ ...row, name: "นาวิน' $english_backfill_guard$", pronunciation: "นา-'วิน" }], [], romanizer);
        const sql = buildEnglishBackfillSql(plan);
        expect(sql).toContain('BEGIN;');
        expect(sql).toContain('SHARE ROW EXCLUSIVE MODE');
        expect(sql).toContain('English backfill snapshot changed');
        expect(sql).toContain('English backfill source changed');
        expect(sql).toContain("นาวิน'' $english_backfill_guard$");
        expect(sql).toContain('DO $english_backfill_guard$');
        expect(sql).toContain('ON COMMIT DROP');
        expect(sql).toContain("nullif(btrim(n.english_name),'') IS NULL");
        expect(sql).toContain('SET english_name_draft=');
        expect(sql).not.toContain('SET english_name=');
        expect(sql).not.toContain('SET pronunciation=');
        expect(sql.endsWith('COMMIT;')).toBe(true);
    });
    it('rejects unsafe proposals and creates an empty no-op transaction', () => {
        expect(buildEnglishBackfillSql({ changes: [] })).toBe('BEGIN;\nCOMMIT;');
        expect(() => buildEnglishBackfillSql({ changes: [{ ...row, englishName: '=SUM(A1)', status: 'pending', source: 'premium-source' }] })).toThrow(/Unsafe/);
        expect(() => buildEnglishBackfillSql({ changes: [{ ...row, englishName: 'NAWIN', status: 'approved', source: 'premium-source' }] })).toThrow(/Unsafe/);
    });
});
