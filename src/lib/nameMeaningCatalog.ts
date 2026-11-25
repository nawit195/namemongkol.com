import 'server-only';
import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { fetchAllPublicNames } from './publicNames';
import { buildMeaningCatalog, createNameMeaningModel, meaningDiscoverySeeds, normalizeMeaningName } from './nameMeaning';

// Only the bounded editorial seed list is stored here. The public-name adapter
// already caches/tag-invalidates database pages; no second full-catalog calculation.
export const getMeaningDiscoveryEntries = unstable_cache(
    async () => buildMeaningCatalog(await fetchAllPublicNames(true)),
    ['meaning-discovery-v1'],
    { revalidate: 600, tags: ['public-names'] },
);

export async function getMeaningDiscoveryNames() {
    return (await getMeaningDiscoveryEntries()).map(({ name, meaning, path }) => ({ name, meaning, path }));
}

export const getNameMeaningModel = cache(async (rawName: string) => {
    const name = normalizeMeaningName(rawName);
    if (!name) return null;
    // Arbitrary typed names must not trigger a full adapter scan or create an
    // unbounded per-name data cache. Expand discovery through editorial seeds.
    if (!meaningDiscoverySeeds.includes(name)) return createNameMeaningModel(name, []);
    const entries = await getMeaningDiscoveryEntries();
    return createNameMeaningModel(name, entries);
});
