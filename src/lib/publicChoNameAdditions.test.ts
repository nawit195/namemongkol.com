import { describe, expect, it, vi } from 'vitest';
vi.mock('server-only', () => ({}));
vi.mock('next/cache', () => ({ unstable_cache: (fn: unknown) => fn }));
vi.mock('@supabase/supabase-js', () => ({ createClient: () => ({ from: () => ({
    select: () => ({ order: () => ({ range: async () => ({ data: [], error: null }) }) }),
}) }) }));

import { publicInitialChoNames } from '@/data/publicInitialChoNames';
import { mergePublicChoNames } from './publicChoNameAdditions';
import { queryPublicNames } from './publicNames';
import { analyzeName } from '@/utils/nameAnalysis';
import { premiumSearchNamesRaw } from '@/data/premiumSearchNames';

describe('free search ช additions', () => {
    it('includes exactly 30 unique names with supplied readings and meanings, score 25 and grade B', () => {
        const records = mergePublicChoNames([]);
        expect(records).toHaveLength(30);
        expect(new Set(records.map((item) => item.name)).size).toBe(30);
        for (const source of publicInitialChoNames) {
            expect(source.name.startsWith('ช')).toBe(true);
            expect(source.pronunciation).not.toBe('');
            expect(source.meaning).not.toBe('');
            expect(records.find((item) => item.name === source.name)).toMatchObject({
                ...source, numerology: 25, grade: 'B', pronunciationStatus: 'pending', meaningStatus: 'pending',
            });
            expect(analyzeName(source.name)?.pairs.map((pair) => `${pair.pair}${pair.type === 'GREEN' ? '🟢' : '❌'}`))
                .toEqual(['24🟢', '45🟢', '54🟢', '44🟢', '45🟢', '51🟢']);
            expect(premiumSearchNamesRaw.split('\n')).not.toContain(source.name);
        }
    });

    it('does not duplicate database names or overwrite reviews or hidden decisions', () => {
        const local = mergePublicChoNames([])[0];
        const reviewed = { ...local, name: ` ${local.name} `, meaning: 'ตรวจสอบแล้ว', meaningStatus: 'approved' as const };
        const result = mergePublicChoNames([reviewed]);
        expect(result).toHaveLength(30);
        expect(result[0].meaning).toBe('ตรวจสอบแล้ว');
        expect(result[0].meaningStatus).toBe('approved');
        expect(mergePublicChoNames([reviewed], [local.name])).toHaveLength(29);
        expect(mergePublicChoNames([{ ...local, meaning: '', pronunciation: '' }])[0]).toMatchObject({
            meaning: local.meaning, pronunciation: local.pronunciation,
        });
        expect(mergePublicChoNames([{ ...local, meaningStatus: 'rejected', pronunciationStatus: 'rejected' }])[0])
            .toMatchObject({ meaning: undefined, pronunciation: undefined });
    });

    it('indexes additions before pagination, and applies day/gender filters', async () => {
        const first = await queryPublicNames({ initial: 'ช', limit: 15 });
        const second = await queryPublicNames({ initial: 'ช', limit: 15, page: 2 });
        const visible = [...first.data, ...second.data];
        for (const source of publicInitialChoNames) expect(visible.some((item) => item.name === source.name)).toBe(true);
        expect(first.summary.grades.B).toBeGreaterThanOrEqual(30);
        expect(first.facets.initials).toContain('ช');
        const saturday = await queryPublicNames({ initial: 'ช', day: 'saturday', gender: 'male', limit: 50 });
        for (const source of publicInitialChoNames) {
            expect(saturday.data.some((item) => item.name === source.name)).toBe(source.suitableDays.includes('saturday'));
        }
        const unrelated = await queryPublicNames({ initial: 'ฑ', limit: 50 });
        expect(unrelated.data.some((item) => publicInitialChoNames.some((source) => source.name === item.name))).toBe(false);
    });
});
