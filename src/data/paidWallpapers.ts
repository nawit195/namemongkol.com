import { HORSE_WALLPAPERS } from './horseWallpapers';
import { FINANCE_WALLPAPERS, FINANCE_WALLPAPER_PATH } from './financeWallpapers';
import type { PaidWallpaperCollection } from './paidWallpaperTypes';

export const PAID_WALLPAPERS = [
    ...HORSE_WALLPAPERS.map(product => ({ ...product, collection: 'horses' as const })),
    ...FINANCE_WALLPAPERS.map(product => ({ ...product, collection: 'finance' as const })),
];

export const paidCollectionPath = (collection: PaidWallpaperCollection) =>
    collection === 'finance' ? FINANCE_WALLPAPER_PATH : '/wallpapers?collection=horses';

export const paidWallpaperPath = (collection: PaidWallpaperCollection, productId: string) =>
    `${paidCollectionPath(collection)}${collection === 'finance' ? '?' : '&'}image=${encodeURIComponent(productId)}`;
