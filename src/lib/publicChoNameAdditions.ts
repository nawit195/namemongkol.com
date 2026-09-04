import { publicInitialChoNames } from '@/data/publicInitialChoNames';
import { analyzeName } from '@/utils/nameAnalysis';
import type { PublicNameRecord } from './publicNames';

const normalize = (name: string) => name.normalize('NFC').replace(/[\s\u200B\u200C\u200D\uFEFF]+/g, '');

const additions: PublicNameRecord[] = publicInitialChoNames.map((item) => ({
    ...item,
    gender: 'neutral',
    numerology: analyzeName(item.name)!.sum,
    grade: analyzeName(item.name)!.grade,
    pronunciationStatus: 'pending',
    meaningStatus: 'pending',
    createdAt: '2026-09-04T00:00:00+07:00',
}));

// Merge before indexing/pagination; never republish names hidden by an admin.
export function mergePublicChoNames(names: PublicNameRecord[], hiddenNames: string[] = []): PublicNameRecord[] {
    const blocked = new Set(hiddenNames.map(normalize));
    const byName = new Map(names.map((item) => [normalize(item.name), item]));
    for (const item of additions) {
        const key = normalize(item.name);
        if (blocked.has(key)) continue;
        const existing = byName.get(key);
        byName.set(key, existing ? {
            ...existing,
            // Keep reviewed values/rejections, filling only missing unreviewed details.
            pronunciation: existing.pronunciationStatus === 'rejected' ? undefined : existing.pronunciation?.trim() || item.pronunciation,
            pronunciationStatus: existing.pronunciationStatus === 'rejected' || existing.pronunciation?.trim()
                ? existing.pronunciationStatus : 'pending',
            meaning: existing.meaningStatus === 'rejected' ? undefined : existing.meaning?.trim() || item.meaning,
            meaningStatus: existing.meaningStatus === 'rejected' || existing.meaning?.trim()
                ? existing.meaningStatus : 'pending',
            suitableDays: [...item.suitableDays],
        } : { ...item, suitableDays: [...item.suitableDays] });
    }
    return [...byName.entries()].filter(([key]) => !blocked.has(key)).map(([, item]) => item);
}
