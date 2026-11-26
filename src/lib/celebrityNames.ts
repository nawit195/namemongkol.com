import { celebrityNameCases, type CelebrityNameCase } from '@/data/celebrityNames';
import { calculateScore } from '@/utils/calculateScore';
import { analyzePairs } from '@/utils/analyzePairs';
import { calculateGrade } from '@/utils/gradeResult';
import { analyzeThaksa } from '@/utils/analyzeThaksa';
import { getCharValue } from '@/data/numerologyLookup';
import { thaksaConfig } from '@/data/thaksaConfig';
import { reviewedCelebrityPortrait } from './celebrityImageReview';

export function analyzeCelebrityName(entry: Pick<CelebrityNameCase, 'name' | 'surname'>) {
    const nameSum = calculateScore(entry.name);
    const surnameSum = calculateScore(entry.surname);
    const namePairs = analyzePairs(entry.name);
    const surnamePairs = analyzePairs(entry.surname);
    return {
        nameSum, surnameSum, fullNameSum: nameSum + surnameSum, namePairs, surnamePairs,
        nameGrade: calculateGrade(nameSum, namePairs),
        // The personal tool joins the two sets of pairs, without a pair across the name boundary.
        fullNameGrade: calculateGrade(nameSum + surnameSum, [...namePairs, ...surnamePairs]),
        characters: Array.from(entry.name).flatMap(character => {
            const value = getCharValue(character);
            return value === undefined ? [] : [{ character, value }];
        }),
        suitableDays: Object.entries(thaksaConfig)
            .filter(([key]) => analyzeThaksa(entry.name, key)?.hasKali === false)
            .map(([, day]) => day.name),
    };
}

/** Publication requires a checked, unambiguous identity and a reproducible A+ given name. */
export function getPublishedCelebrityNames(candidates: readonly CelebrityNameCase[] = celebrityNameCases) {
    return candidates.flatMap(entry => {
        if (entry.status !== 'published' || !entry.name.trim() || !entry.surname.trim() ||
            /[\r\n]/.test(entry.surname) || !entry.source.url.startsWith('https://') || !entry.verifiedAt) return [];
        const analysis = analyzeCelebrityName(entry);
        if (analysis.nameGrade !== 'A+' || analysis.nameSum !== entry.workbookSum) return [];
        return [{ ...entry, portrait: reviewedCelebrityPortrait(entry.portrait), analysis }];
    });
}

export type PublishedCelebrityName = ReturnType<typeof getPublishedCelebrityNames>[number];
export const celebrityEditorialSlugs = [
    ...celebrityNameCases.filter(entry => entry.status === 'published').map(entry => entry.slug),
    'case-study-khemanit-name-analysis',
    'supajee-suthampun-numerology-a-plus',
];
