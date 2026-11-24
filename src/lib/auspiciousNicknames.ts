import 'server-only';
import catalog from '@/data/auspiciousNicknames.json';
import type {
    AuspiciousNickname,
    NicknameFilters,
    NicknameQueryResponse,
    VisibleNickname,
} from '@/types/auspiciousNickname';
import {
    nicknameInitial,
    NICKNAME_BATCH_SIZE,
    NICKNAME_PAGE_SIZE,
    NICKNAME_UNLOCK_COST,
    NICKNAME_FREE_PER_INITIAL,
} from './auspiciousNicknameShared';

const collator = new Intl.Collator('th');
const records = (catalog.records as AuspiciousNickname[]).toSorted((a, b) =>
    collator.compare(a.name, b.name),
);
const groups = {
    ab: records.filter((item) => item.grade !== 'A+'),
    aplus: records.filter((item) => item.grade === 'A+'),
};
const searchIndex = new WeakMap(
    records.map((item) => [
        item,
        `${item.name} ${item.meaning}`.toLocaleLowerCase('th'),
    ]),
);
const scores = {
    ab: [...new Set(groups.ab.map((item) => item.numerology))].sort(
        (a, b) => a - b,
    ),
    aplus: [...new Set(groups.aplus.map((item) => item.numerology))].sort(
        (a, b) => a - b,
    ),
};
export const NICKNAME_CATALOG_VERSION = catalog.version;
const previewCache = new WeakMap<AuspiciousNickname[], Set<string>>();
function previewIdsFor(group: AuspiciousNickname[]) {
    const cached = previewCache.get(group);
    if (cached) return cached;
    const counts = new Map<string, number>();
    const ids = new Set<string>();
    // Choose from the full, Thai-sorted catalog before applying user filters.
    // Searching for another name must never rotate the two free examples.
    for (const item of group) {
        const initial = nicknameInitial(item.name);
        const count = counts.get(initial) ?? 0;
        if (initial && count < NICKNAME_FREE_PER_INITIAL) {
            ids.add(item.id);
            counts.set(initial, count + 1);
        }
    }
    previewCache.set(group, ids);
    return ids;
}
export const NICKNAME_SUMMARY = catalog.summary;
const premiumGroups = new WeakMap<AuspiciousNickname[], AuspiciousNickname[]>();
function premiumGroup(premium: AuspiciousNickname[]) {
    if (!premium.length) return groups.aplus;
    let group = premiumGroups.get(premium);
    if (!group) {
        group = [
            ...new Map(
                [...groups.aplus, ...premium].map((item) => [item.id, item]),
            ).values(),
        ].sort((a, b) => collator.compare(a.name, b.name));
        premiumGroups.set(premium, group);
        for (const item of group)
            searchIndex.set(
                item,
                (item.name + ' ' + item.meaning).toLocaleLowerCase('th'),
            );
    }
    return group;
}

export function matchesNickname(
    item: AuspiciousNickname,
    filters: NicknameFilters,
    query = filters.q.toLocaleLowerCase('th'),
) {
    return (
        (filters.group === 'aplus'
            ? item.grade === 'A+'
            : item.grade !== 'A+') &&
        (!query ||
            (
                searchIndex.get(item) ??
                `${item.name} ${item.meaning}`.toLocaleLowerCase('th')
            ).includes(query)) &&
        (filters.day === 'all' || item.suitableDays.includes(filters.day)) &&
        (filters.gender === 'all' ||
            item.gender === filters.gender ||
            (filters.gender !== 'unisex' && item.gender === 'unisex')) &&
        (filters.initial === 'all' ||
            nicknameInitial(item.name) === filters.initial) &&
        (filters.score === null || item.numerology === filters.score) &&
        (filters.grade === 'all' || item.grade === filters.grade)
    );
}

export function queryNicknames(
    filters: NicknameFilters,
    purchased: AuspiciousNickname[] = [],
    premium: AuspiciousNickname[] = [],
) {
    // Purchased snapshots survive a catalog update or removal.
    const owned = new Map(purchased.map((item) => [item.id, item]));
    const group = filters.group === 'aplus' ? premiumGroup(premium) : groups.ab;
    const previewIds =
        filters.group === 'aplus' ? previewIdsFor(group) : new Set<string>();
    const merged =
        filters.group === 'aplus' && purchased.length > 0
            ? [
                  ...new Map(
                      [...group, ...purchased].map((item) => [item.id, item]),
                  ).values(),
              ].sort((a, b) => collator.compare(a.name, b.name))
            : group;
    const query = filters.q.toLocaleLowerCase('th');
    const withoutInitial = { ...filters, initial: 'all' };
    const initialMatches = merged.filter(
        (item) =>
            matchesNickname(item, withoutInitial, query) &&
            (filters.view !== 'owned' || owned.has(item.id)),
    );
    const matching =
        filters.initial === 'all'
            ? initialMatches
            : initialMatches.filter(
                  (item) => nicknameInitial(item.name) === filters.initial,
              );
    const visible = matching.filter(
        (item) =>
            filters.group === 'ab' ||
            (filters.view === 'owned'
                ? owned.has(item.id)
                : owned.has(item.id) || previewIds.has(item.id)),
    );
    const plusCatalog = filters.group === 'aplus' && filters.view !== 'owned';
    const pages: AuspiciousNickname[][] = [[]];
    if (plusCatalog) {
        let paidSlots = 0;
        for (const item of matching) {
            if (!previewIds.has(item.id) && paidSlots === NICKNAME_BATCH_SIZE) {
                pages.push([]);
                paidSlots = 0;
            }
            pages[pages.length - 1].push(item);
            if (!previewIds.has(item.id)) paidSlots++;
        }
    }
    const totalPages = plusCatalog
        ? pages.length
        : Math.max(1, Math.ceil(visible.length / NICKNAME_PAGE_SIZE));
    const page = Math.min(filters.page, totalPages);
    let pageRecords = plusCatalog
        ? pages[page - 1]
        : visible.slice(
              (page - 1) * NICKNAME_PAGE_SIZE,
              page * NICKNAME_PAGE_SIZE,
          );
    if (plusCatalog && filters.initial !== 'all') {
        const onPage = new Set(pageRecords.map((item) => item.id));
        pageRecords = [
            ...matching.filter(
                (item) => previewIds.has(item.id) && !onPage.has(item.id),
            ),
            ...pageRecords,
        ];
    }
    const canView = (item: AuspiciousNickname) =>
        filters.group === 'ab' || owned.has(item.id) || previewIds.has(item.id);
    const candidates = plusCatalog
        ? pageRecords.filter((item) => !canView(item))
        : [];
    const byInitial = new Map<string, number>();
    for (const item of initialMatches) {
        const initial = nicknameInitial(item.name);
        byInitial.set(initial, (byInitial.get(initial) ?? 0) + 1);
    }
    const data: VisibleNickname[] = pageRecords.filter(canView).map((item) => ({
        id: item.id,
        name: item.name,
        grade: item.grade,
        numerology: item.numerology,
        meaning: item.meaning,
        gender: item.gender,
        suitableDays: item.suitableDays,
        pairs: item.pairs,
        access:
            filters.group === 'ab'
                ? 'free'
                : owned.has(item.id)
                  ? 'purchased'
                  : 'preview',
    }));
    const response: NicknameQueryResponse = {
        success: true,
        data,
        total: filters.view === 'owned' ? visible.length : matching.length,
        visibleTotal: visible.length,
        lockedCount:
            filters.view === 'owned' ? 0 : matching.length - visible.length,
        lockedOnPage: candidates.length,
        page,
        totalPages,
        initials: [...byInitial]
            .sort(([a], [b]) => collator.compare(a, b))
            .map(([initial, count]) => ({ initial, count })),
        scores:
            filters.group === 'ab'
                ? scores.ab
                : [...new Set(group.map((item) => item.numerology))].sort(
                      (a, b) => a - b,
                  ),
        summary: NICKNAME_SUMMARY,
        catalogVersion: NICKNAME_CATALOG_VERSION,
        viewer: { authenticated: false, credits: null },
        accessReady: false,
        purchase: {
            cost: NICKNAME_UNLOCK_COST,
            count: candidates.length,
            quote: null,
        },
    };
    return { response, candidates };
}
