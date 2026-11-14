type PreviewFilterState = {
    day: string;
    gender: string;
    initial: string;
};

type PreviewSource<TName, TSummary> = {
    dataSource?: 'database' | 'fallback';
    data: TName[];
    featuredData?: TName[];
    total: number;
    summary: TSummary;
};

export type LetterPreviewResult<TName, TSummary> = {
    dataSource?: 'database' | 'fallback';
    data: TName[];
    total: number;
    totalPages: number;
    summary: TSummary;
};

const PREVIEW_SIZE = 10;
const SEARCH_PAGE_SIZE = 50;

export function createLetterPreviewResult<TName, TSummary>(
    result: PreviewSource<TName, TSummary>,
): LetterPreviewResult<TName, TSummary> {
    const previewNames = result.featuredData?.length ? result.featuredData : result.data;

    return {
        ...(result.dataSource ? { dataSource: result.dataSource } : {}),
        data: previewNames.slice(0, PREVIEW_SIZE),
        total: result.total,
        totalPages: Math.max(1, Math.ceil(result.total / SEARCH_PAGE_SIZE)),
        summary: result.summary,
    };
}

export async function buildLetterPreviewLookup<
    TLetter extends string,
    TName,
    TSummary,
>(
    letters: readonly TLetter[],
    loadResult: (letter: TLetter) => Promise<PreviewSource<TName, TSummary>>,
): Promise<Record<TLetter, LetterPreviewResult<TName, TSummary>>> {
    const entries = await Promise.all(letters.map(async (letter) => [
        letter,
        createLetterPreviewResult(await loadResult(letter)),
    ] as const));

    return Object.fromEntries(entries) as Record<TLetter, LetterPreviewResult<TName, TSummary>>;
}

export function shouldUseLetterPreview(filters: PreviewFilterState): boolean {
    return filters.day === 'all'
        && filters.gender === 'all'
        && filters.initial !== 'all';
}

export function getImmediateLetterResult<TInitialResult, TPreviewResult>(
    filters: PreviewFilterState,
    previews: Partial<Record<string, TPreviewResult>>,
    initialResult: TInitialResult,
): TInitialResult | TPreviewResult | undefined {
    if (filters.day !== 'all' || filters.gender !== 'all') return undefined;
    if (filters.initial === 'all') return initialResult;
    return shouldUseLetterPreview(filters) ? previews[filters.initial] : undefined;
}

export function mergeUniqueNames<TName extends { name: string }>(
    existing: TName[],
    incoming: TName[],
): TName[] {
    const seenNames = new Set(existing.map((item) => item.name));
    const merged = [...existing];

    for (const item of incoming) {
        if (seenNames.has(item.name)) continue;
        seenNames.add(item.name);
        merged.push(item);
    }

    return merged;
}

/**
 * Moves names that were not in the previous visible set to the front.
 * This keeps each 10-name rotation feeling fresh while retaining all names
 * returned by the API for pagination and unlock flows.
 */
export function prioritizeUnseenNames<TName extends { name: string }>(
    names: TName[],
    previousVisibleNames: readonly string[],
): TName[] {
    if (previousVisibleNames.length === 0) return names;

    const previousNames = new Set(previousVisibleNames);
    const unseen: TName[] = [];
    const seen: TName[] = [];

    for (const item of names) {
        if (previousNames.has(item.name)) {
            seen.push(item);
        } else {
            unseen.push(item);
        }
    }

    return [...unseen, ...seen];
}
