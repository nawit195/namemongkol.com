import type { PublicNameRecord } from './publicNames';
import { boyNamesCurated } from '@/data/boyNamesCurated';
import { girlNamesCurated } from '@/data/girlNamesCurated';
import { calculateScore } from '@/utils/calculateScore';
import { analyzePairs } from '@/utils/analyzePairs';
import { calculateGrade } from '@/utils/gradeResult';
import { analyzeThaksa } from '@/utils/analyzeThaksa';
import { thaksaConfig } from '@/data/thaksaConfig';
import type { DayKey } from '@/types';

export const reviewedNameKey = (name: string) =>
    name.normalize('NFC').trim().toLowerCase();
const curated = new Map(
    [...boyNamesCurated, ...girlNamesCurated].map((item) => [
        reviewedNameKey(item.name),
        item.meaning,
    ]),
);
export const editorialNameKeys = new Set(curated.keys());

export function prepareReviewedNames(
    records: readonly PublicNameRecord[],
): PublicNameRecord[] {
    const seen = new Set<string>();
    const blocked = new Set(
        records
            .filter(
                (item) =>
                    item.meaningStatus && item.meaningStatus !== 'approved',
            )
            .map((item) => reviewedNameKey(item.name)),
    );
    return records.flatMap((item) => {
        const name = item.name.normalize('NFC').trim();
        const key = reviewedNameKey(name);
        const meaning =
            item.meaningStatus === 'approved'
                ? item.meaning?.trim()
                : item.meaningStatus === undefined
                  ? curated.get(key)
                  : undefined;
        if (!name || !meaning || blocked.has(key) || seen.has(key)) return [];
        seen.add(key);
        const numerology = calculateScore(name);
        return [
            {
                ...item,
                name,
                meaning,
                numerology,
                grade: calculateGrade(numerology, analyzePairs(name)),
                suitableDays: (Object.keys(thaksaConfig) as DayKey[]).filter(
                    (day) => analyzeThaksa(name, day, '')?.hasKali === false,
                ),
                pronunciation:
                    item.pronunciationStatus === 'approved'
                        ? item.pronunciation
                        : undefined,
                pronunciationVariants:
                    item.pronunciationStatus === 'approved'
                        ? item.pronunciationVariants
                        : [],
            },
        ];
    });
}
