import { describe, expect, it } from 'vitest';
import {
    buildPremiumAdminRecords,
    sanitizePremiumAdminRecords,
} from './adminPremiumNames';

describe('admin premium name helpers', () => {
    it('normalizes NFC, trims values, removes duplicates, and reports invalid input', () => {
        const result = sanitizePremiumAdminRecords([
            { name: '  กานต์  ', pronunciation: ' กาน ', gender: 'male' },
            { name: 'กานต์', meaning: 'ชื่อซ้ำ' },
            { name: 'ณวิธ', meaning: ' ผู้รู้ ', gender: 'invalid' },
            { name: '   ' },
        ]);

        expect(result).toEqual({
            records: [
                { name: 'กานต์', pronunciation: 'กาน', gender: 'male' },
                { name: 'ณวิธ', meaning: 'ผู้รู้' },
            ],
            received: 4,
            duplicatesInPayload: 1,
            invalid: 1,
        });
    });

    it('joins membership with shared details and preserves hidden review state', () => {
        const result = buildPremiumAdminRecords(
            [{ id: 1, name: 'กานต์', created_at: '2026-01-01T00:00:00Z' }, { id: 2, name: 'ชื่อใหม่' }],
            [{
                name: 'กานต์',
                gender: 'male',
                pronunciation: 'กาน',
                pronunciation_draft: 'กาน-นะ',
                pronunciation_status: 'draft',
                meaning: 'เป็นที่รัก',
                meaning_status: 'approved',
                publication_status: 'hidden',
            }],
        );

        expect(result[0]).toMatchObject({
            id: 1,
            name: 'กานต์',
            gender: 'male',
            pronunciation: 'กาน',
            pronunciationDraft: 'กาน-นะ',
            pronunciationStatus: 'draft',
            meaningStatus: 'approved',
            publicationStatus: 'hidden',
            hasSharedDetails: true,
        });
        expect(result[1]).toMatchObject({
            name: 'ชื่อใหม่',
            gender: 'neutral',
            pronunciationStatus: 'pending',
            meaningStatus: 'pending',
            publicationStatus: 'published',
            hasSharedDetails: false,
        });
    });
});
