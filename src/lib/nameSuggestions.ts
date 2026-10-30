import type { PublicNameReviewStatus } from '@/lib/publicNames';

export type NameSuggestion = {
  name: string;
  pronunciation?: string;
  pronunciationStatus?: PublicNameReviewStatus;
  meaning?: string;
  meaningStatus?: PublicNameReviewStatus;
};

// Accept only records already filtered through the public catalog publication rules.
export function selectNameSuggestions<T extends NameSuggestion>(records: T[], query: string): NameSuggestion[] {
  const term = query.trim().toLocaleLowerCase('en');
  if (term.length < 2 || term.length > 100) return [];
  const rank = (name: string) => name === term ? 0 : name.startsWith(term) ? 1 : 2;
  const seen = new Set<string>();
  return records
    .filter(record => record.name.toLocaleLowerCase('en').includes(term))
    .sort((a, b) => rank(a.name.toLocaleLowerCase('en')) - rank(b.name.toLocaleLowerCase('en')) || a.name.localeCompare(b.name, 'th'))
    .filter(record => {
      const key = record.name.toLocaleLowerCase('en');
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 8)
    .map(record => ({
      name: record.name,
      ...(record.pronunciation && record.pronunciationStatus !== 'rejected' ? { pronunciation: record.pronunciation } : {}),
      ...(record.pronunciationStatus ? { pronunciationStatus: record.pronunciationStatus } : {}),
      ...(record.meaning && record.meaningStatus !== 'rejected' ? { meaning: record.meaning } : {}),
      ...(record.meaningStatus ? { meaningStatus: record.meaningStatus } : {}),
    }));
}
