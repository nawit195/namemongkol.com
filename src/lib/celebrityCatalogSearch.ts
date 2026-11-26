import type { CelebrityCardData, CelebrityCatalogPerson } from '@/types/celebrityCatalog';

export const CELEBRITY_PAGE_SIZE = 24;
export const normalizeCelebrityQuery = (text: string) => text.normalize('NFC').trim().toLocaleLowerCase('th');

export function defaultCelebrityPerson(entry: CelebrityCardData): CelebrityCatalogPerson {
    return entry.people.find(person => person.portrait) ?? entry.people.find(person => person.referenceStatus === 'matched') ?? entry.people[0];
}

/** Match all people, then select the matching identity, so a surname search shows the right portrait. */
export function searchCelebrityCatalog(entries: readonly CelebrityCardData[], query: string) {
    const normalized = normalizeCelebrityQuery(query);
    return entries.flatMap(entry => {
        if (!normalized || normalizeCelebrityQuery(entry.name).includes(normalized)) {
            return [{ entry, personId: defaultCelebrityPerson(entry).id }];
        }
        const person = entry.people.find(person => normalizeCelebrityQuery(`${entry.name} ${person.surname} ${person.nickname} ${person.referenceName} ${person.occupations.join(' ')}`).includes(normalized));
        return person ? [{ entry, personId: person.id }] : [];
    });
}

export function celebrityAnalysisHref(name: string) {
    const parameters = new URLSearchParams({ name, mode: 'prefill' });
    return `/name-check?${parameters}`;
}
