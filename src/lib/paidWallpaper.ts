import { z } from 'zod';
import { HORSE_WALLPAPERS, WALLPAPER_RETRY_MINUTES } from '@/data/horseWallpapers';

export const paidWallpaperRequest = z.object({
    productId: z.enum(HORSE_WALLPAPERS.map(product => product.id) as [string, ...string[]]),
    requestId: z.uuid(),
    action: z.enum(['start', 'retry']),
}).strict();

export interface WallpaperDownloadAttempt {
    requestId: string;
    productId: string;
    userId: string;
    startedAt: number;
    expiresAt?: string;
}

export function wallpaperAttemptKey(userId: string, productId: string) {
    return `wallpaper-download:v1:${userId}:${productId}`;
}

export function parseWallpaperAttempt(raw: string | null, userId: string, productId: string, now = Date.now()): WallpaperDownloadAttempt | null {
    try {
        const value = z.object({ requestId: z.uuid(), productId: z.string(), userId: z.string(), startedAt: z.number().finite(), expiresAt: z.iso.datetime({ offset: true }).optional() }).parse(JSON.parse(raw || 'null'));
        const expiry = value.expiresAt ? Date.parse(value.expiresAt) : value.startedAt + WALLPAPER_RETRY_MINUTES * 60_000;
        return value.userId === userId && value.productId === productId && value.startedAt <= now && expiry > now ? value : null;
    } catch { return null; }
}

export function wallpaperAttemptAfterFailure(
    current: WallpaperDownloadAttempt,
    previous: WallpaperDownloadAttempt | null,
    status: number,
    code?: string,
    now = Date.now(),
): WallpaperDownloadAttempt | null {
    // An uncertain response may have committed. Preserve its key so retry cannot charge again.
    const definitelyFailed = [400, 401, 402, 403, 404, 409].includes(status)
        || (status === 503 && ['WALLPAPER_NOT_READY', 'asset_changed'].includes(code ?? ''));
    if (!definitelyFailed) return current;
    // A failed retry must not reintroduce that same missing/expired request.
    if (!previous || previous.requestId === current.requestId) return null;
    return parseWallpaperAttempt(JSON.stringify(previous), current.userId, current.productId, now);
}

export function paidWallpaperError(status: string): { status: number; error: string } {
    const errors: Record<string, { status: number; error: string }> = {
        insufficient_credits: { status: 402, error: 'เครดิตไม่เพียงพอสำหรับดาวน์โหลดภาพนี้' },
        expired: { status: 409, error: 'หมดเวลาลองดาวน์โหลดรายการเดิมแล้ว หากต้องการดาวน์โหลดใหม่ กรุณายืนยันอีกครั้ง' },
        attempt_not_found: { status: 409, error: 'ไม่พบรายการที่หักเครดิตสำหรับการลองซ้ำ กรุณาเริ่มรายการใหม่ ระบบยังไม่หักเครดิตจากการลองซ้ำนี้' },
        request_conflict: { status: 409, error: 'รหัสรายการไม่ตรงกับภาพที่เลือก กรุณาเริ่มรายการใหม่' },
        unavailable: { status: 404, error: 'ภาพนี้ยังไม่พร้อมดาวน์โหลด กรุณาลองใหม่ภายหลัง' },
        asset_changed: { status: 503, error: 'ไฟล์ภาพมีการเปลี่ยนแปลง ระบบยังไม่หักเครดิต กรุณาลองใหม่ภายหลัง' },
    };
    return errors[status] || { status: 503, error: 'ระบบดาวน์โหลดยังไม่พร้อม กรุณาลองใหม่' };
}
