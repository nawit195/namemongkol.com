import { describe, expect, test } from 'vitest';
import { HORSE_WALLPAPERS } from '@/data/horseWallpapers';
import { paidWallpaperError, paidWallpaperRequest, parseWallpaperAttempt, wallpaperAttemptAfterFailure } from './paidWallpaper';

const requestId = '10000000-0000-4000-8000-000000000001';
const productId = HORSE_WALLPAPERS[0].id;
const attempt = { requestId, productId, userId: 'member-a', startedAt: 1000 };

describe('paid wallpaper requests and safe retries', () => {
    test('only catalog products and explicit actions are accepted; browser cannot supply price or user ID', () => {
        const request = { productId, requestId, action: 'start' };
        expect(paidWallpaperRequest.safeParse(request).success).toBe(true);
        for (const invalid of [{ ...request, price: 0 }, { ...request, userId: 'other' }, { ...request, productId: '../private.png' }, { ...request, action: undefined }, { ...request, requestId: 'x' }]) {
            expect(paidWallpaperRequest.safeParse(invalid).success).toBe(false);
        }
    });
    test('a pending attempt survives reload only for its owner and image within 30 minutes', () => {
        const raw = JSON.stringify(attempt);
        expect(parseWallpaperAttempt(raw, 'member-a', productId, 2000)?.requestId).toBe(requestId);
        expect(parseWallpaperAttempt(raw, 'member-b', productId, 2000)).toBeNull();
        expect(parseWallpaperAttempt(raw, 'member-a', 'other', 2000)).toBeNull();
        expect(parseWallpaperAttempt(raw, 'member-a', productId, 1_801_000)).toBeNull();
        expect(parseWallpaperAttempt(raw, 'member-a', productId, 500)).toBeNull();
        expect(parseWallpaperAttempt('{bad', 'member-a', productId)).toBeNull();
    });
    test('server expiry supports Postgres UTC offsets and overrides approximate local time', () => {
        const raw = JSON.stringify({ ...attempt, expiresAt: '2026-11-19T03:30:00.123456+00:00' });
        expect(parseWallpaperAttempt(raw, 'member-a', productId, Date.parse('2026-11-19T03:29:00Z'))).not.toBeNull();
        expect(parseWallpaperAttempt(raw, 'member-a', productId, Date.parse('2026-11-19T03:31:00Z'))).toBeNull();
    });
    test('expired and missing retries are conflicts requiring explicit confirmation, never a new automatic charge', () => {
        expect(paidWallpaperError('expired').status).toBe(409);
        expect(paidWallpaperError('attempt_not_found').status).toBe(409);
        expect(paidWallpaperError('insufficient_credits').status).toBe(402);
        expect(paidWallpaperError('unavailable').status).toBe(404);
    });
    test('a rejected new purchase preserves an earlier valid retry instead of replacing it with an unpaid request', () => {
        const current = { ...attempt, requestId: '10000000-0000-4000-8000-000000000002', startedAt: 2000 };
        expect(wallpaperAttemptAfterFailure(current, attempt, 402, undefined, 3000)).toEqual(attempt);
        expect(wallpaperAttemptAfterFailure(current, attempt, 503, 'WALLPAPER_NOT_READY', 3000)).toEqual(attempt);
        expect(wallpaperAttemptAfterFailure(current, null, 402, undefined, 3000)).toBeNull();
    });
    test('ambiguous failures preserve the current request while missing or expired retries are cleared', () => {
        expect(wallpaperAttemptAfterFailure(attempt, null, 503, 'DOWNLOAD_RESULT_UNKNOWN', 3000)).toEqual(attempt);
        expect(wallpaperAttemptAfterFailure(attempt, null, 408, undefined, 3000)).toEqual(attempt);
        expect(wallpaperAttemptAfterFailure(attempt, null, 429, undefined, 3000)).toEqual(attempt);
        expect(wallpaperAttemptAfterFailure(attempt, attempt, 409, 'expired', 3000)).toBeNull();
        expect(wallpaperAttemptAfterFailure(attempt, attempt, 409, 'attempt_not_found', 3000)).toBeNull();
    });
    test('failed purchases cannot restore an expired attempt or one belonging to another account/image', () => {
        const current = { ...attempt, requestId: '10000000-0000-4000-8000-000000000002', startedAt: 2000 };
        expect(wallpaperAttemptAfterFailure(current, { ...attempt, userId: 'other' }, 402, undefined, 3000)).toBeNull();
        expect(wallpaperAttemptAfterFailure(current, { ...attempt, productId: 'other' }, 402, undefined, 3000)).toBeNull();
        expect(wallpaperAttemptAfterFailure(current, attempt, 402, undefined, 1_801_000)).toBeNull();
    });
});
