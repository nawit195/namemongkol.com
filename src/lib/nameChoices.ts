import type { PublicNameRecord } from '@/lib/publicNames';
import type { NameKind } from '@/lib/nameFavorites';
import type { DayKey } from '@/types';
export type NameChoice = {
    name: string;
    kind: NameKind;
    meaning?: string;
    pronunciation?: string;
    approximateReading?: string;
    numerology?: number;
    grade?: string;
    suitableDays?: DayKey[];
    style?: string;
    sourceUrl?: string;
    origin?: string;
};
export const publicNameChoice = (item: PublicNameRecord): NameChoice => ({
    name: item.name,
    kind: 'thai',
    meaning: item.meaning,
    pronunciation:
        item.pronunciationStatus === 'approved'
            ? item.pronunciation
            : undefined,
    numerology: item.numerology,
    grade: item.grade,
    suitableDays: item.suitableDays,
});
