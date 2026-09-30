export type SearchNameLike = { name: string };

/**
 * Selects unique positions without shuffling the source collection itself.
 * The random source is injectable so the ordering behavior stays testable.
 */
export function sampleRandomIndexes(
    total: number,
    count: number,
    random: () => number = Math.random,
): number[] {
    const size = Math.max(0, Math.floor(total));
    const sampleSize = Math.min(size, Math.max(0, Math.floor(count)));
    const indexes = Array.from({ length: size }, (_, index) => index);

    for (let index = 0; index < sampleSize; index += 1) {
        const remaining = size - index;
        const offset = Math.min(remaining - 1, Math.floor(random() * remaining));
        const selectedIndex = index + Math.max(0, offset);
        [indexes[index], indexes[selectedIndex]] = [indexes[selectedIndex], indexes[index]];
    }

    return indexes.slice(0, sampleSize);
}

/**
 * Places the sampled names first and leaves every other name in canonical order.
 */
export function reorderFirstPageWithFeatured<T extends SearchNameLike>(
    canonicalFirstPage: T[],
    featuredNames: T[],
): T[] {
    const featuredKeys = new Set<string>();
    const uniqueFeatured = featuredNames.filter((item) => {
        if (featuredKeys.has(item.name)) return false;
        featuredKeys.add(item.name);
        return true;
    });

    return [
        ...uniqueFeatured,
        ...excludeFeaturedNames(canonicalFirstPage, featuredKeys),
    ];
}

export function excludeFeaturedNames<T extends SearchNameLike>(
    names: T[],
    featuredKeys: ReadonlySet<string>,
): T[] {
    return names.filter((item) => !featuredKeys.has(item.name));
}
