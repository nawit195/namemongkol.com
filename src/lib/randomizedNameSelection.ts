export type NameLike = { name: string };

export function createSeededRandom(seed: string): () => number {
    let state = 2166136261;
    for (let index = 0; index < seed.length; index += 1) {
        state ^= seed.charCodeAt(index);
        state = Math.imul(state, 16777619);
    }

    return () => {
        state += 0x6D2B79F5;
        let value = state;
        value = Math.imul(value ^ (value >>> 15), value | 1);
        value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
        return ((value ^ (value >>> 14)) >>> 0) / 0x1_0000_0000;
    };
}

/** Selects unique positions without shuffling the source collection itself. */
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

export function selectSeededRandomItems<T>(items: T[], count: number, seed: string): T[] {
    return sampleRandomIndexes(items.length, count, createSeededRandom(seed))
        .map((index) => items[index]);
}

/** Places the sampled names first and leaves every other name in canonical order. */
export function reorderFirstPageWithFeatured<T extends NameLike>(
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

export function excludeFeaturedNames<T extends NameLike>(
    names: T[],
    featuredKeys: ReadonlySet<string>,
): T[] {
    return names.filter((item) => !featuredKeys.has(item.name));
}
