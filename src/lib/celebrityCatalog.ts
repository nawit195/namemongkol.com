import catalog from '@/data/celebrityCatalog.json';
import { getPublishedCelebrityNames } from './celebrityNames';
import { calculateScore } from '@/utils/calculateScore';
import { analyzePairs } from '@/utils/analyzePairs';
import { calculateGrade } from '@/utils/gradeResult';
import type { CelebrityCardData, CelebrityCatalogGroup, CelebrityCatalogPerson } from '@/types/celebrityCatalog';
import { celebrityImageEvidence, reviewedCelebrityPortrait } from './celebrityImageReview';
import { celebrityPublicationHolds } from '@/data/celebrityEditorialPolicy';

export const celebrityCatalogUpdatedAt = catalog.updatedAt;
export const celebrityCatalogInputSummary = catalog.inputSummary;

/** The name directory is independent of the three editorial articles. No bulk article generation. */
export function getCelebrityCatalog(groups: readonly CelebrityCatalogGroup[] = catalog.groups as CelebrityCatalogGroup[]): CelebrityCardData[] {
    const reviewed = getPublishedCelebrityNames();
    const heldIds: readonly string[] = [...celebrityPublicationHolds.unresolvedIdentity, ...celebrityPublicationHolds.ageReview];
    const entries = groups.flatMap(group => {
        const people = group.people.filter(person => person.referenceStatus === 'matched' && person.source && !heldIds.includes(person.id));
        if (!people.length) return [];
        const sum = calculateScore(group.name);
        const pairs = analyzePairs(group.name);
        if (sum !== group.workbookSum || calculateGrade(sum, pairs) !== 'A+') {
            throw new Error(`Celebrity catalog score mismatch at source row ${group.sourceRow}`);
        }
        const editorial = reviewed.find(entry => entry.name === group.name);
        return [{
            slug: `name-${group.sourceRow}`, name: group.name, sum,
            goodPairs: pairs.filter(pair => pair.grade === 'good').length, pairCount: pairs.length,
            ...(editorial ? { articleHref: `/articles/${editorial.slug}` } : {}),
            people: people.map((person): CelebrityCatalogPerson => {
                const resolved: CelebrityCatalogPerson = editorial && editorial.surname === person.surname ? {
                    ...person, nickname: editorial.nickname, occupations: editorial.occupations,
                    portrait: editorial.portrait, source: editorial.source, roleSource: editorial.occupationSources[0],
                    referenceName: `${editorial.name} ${editorial.surname}`,
                    referenceStatus: 'matched', checkedAt: editorial.verifiedAt,
                } : person;
                // Revalidate every portrait against the current register, including stale bulk imports.
                const portrait = resolved.portrait ? reviewedCelebrityPortrait(resolved.portrait) : null;
                return { ...resolved, portrait,
                    portraitStatus: portrait ? 'available' : person.portrait || person.portraitStatus === 'awaiting-evidence' ? 'awaiting-evidence' : 'not-available',
                    portraitEvidence: portrait ? celebrityImageEvidence(portrait) ?? undefined : undefined };
            }),
        }];
    });
    const featured = ['กรภัทร์', 'ภัทรานิษฐ์', 'ณัฐวรรธน์'];
    const order = (entry: CelebrityCardData) => {
        const index = featured.indexOf(entry.name);
        return index >= 0 ? index : entry.people.some(person => person.portrait) ? 3 : 4;
    };
    // Keep the original case studies first, then photo-ready groups. Stable sorting preserves workbook order within each group.
    return entries.sort((left, right) => order(left) - order(right));
}
