import { getCharValue } from '@/data/numerologyLookup';
export type NameKind = 'thai' | 'english' | 'nickname';
export type FavoriteName = { name: string; kind: NameKind };
export const FAVORITES_KEY = 'namemongkol:names:favorites:v1';
export const COMPARISON_SELECTION_KEY = 'namemongkol:compare-selection:v1';
export const MAX_FAVORITES = 50;
export const PENDING_FAVORITE_KEY = 'namemongkol:names:pending-favorite:v1';
export const favoritesStorageKey = (userId: string) =>
    `${FAVORITES_KEY}:${userId}`;
export const favoriteId = (item: FavoriteName) =>
    `${item.kind}:${item.name.normalize('NFC').trim().toLowerCase()}`;
export function parseFavorites(value: unknown): FavoriteName[] {
    if (!Array.isArray(value)) return [];
    const seen = new Set<string>();
    return value
        .flatMap((item) => {
            if (
                !item ||
                typeof item !== 'object' ||
                typeof item.name !== 'string' ||
                !['thai', 'english', 'nickname'].includes(item.kind)
            )
                return [];
            const name = item.name.normalize('NFC').trim();
            if (!name || name.length > 100 || /[<>\u0000-\u001f]/u.test(name))
                return [];
            const entry = { name, kind: item.kind as NameKind };
            const id = favoriteId(entry);
            if (seen.has(id)) return [];
            seen.add(id);
            return [entry];
        })
        .slice(0, MAX_FAVORITES);
}
export const canCompareFavorite = (item: FavoriteName) =>
    item.kind !== 'nickname' &&
    [...item.name].every((char) => getCharValue(char) !== undefined);
export function parseComparisonSelection(value: unknown): string[] | null {
    if (
        !value ||
        typeof value !== 'object' ||
        !('names' in value) ||
        !Array.isArray(value.names)
    )
        return null;
    if (
        value.names.length < 2 ||
        value.names.length > 5 ||
        !value.names.every(
            (name) => typeof name === 'string' && name.length <= 100,
        )
    )
        return null;
    const names = value.names.map((name) => name.normalize('NFC').trim());
    if (
        names.some(
            (name) => !name || !canCompareFavorite({ name, kind: 'thai' }),
        ) ||
        new Set(names.map((name) => name.toLowerCase())).size !== names.length
    )
        return null;
    return names;
}

export function writeFavorites(
    storage: Pick<Storage, 'setItem'>,
    items: FavoriteName[],
    key: string = FAVORITES_KEY,
): boolean {
    try {
        storage.setItem(key, JSON.stringify(items));
        return true;
    } catch {
        return false;
    }
}
