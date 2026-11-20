import { createHash } from 'node:crypto';
import { PAID_WALLPAPERS } from '@/data/paidWallpapers';
import { paidWallpaperError, paidWallpaperRequest } from '@/lib/paidWallpaper';
import { WALLPAPER_ORIGINAL_BUCKET, WALLPAPER_PRIVATE_HEADERS, wallpaperAuth, wallpaperJson, wallpaperService, wallpaperUnavailable } from '@/lib/paidWallpaperServer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request: Request) {
    try {
        // Do not allow a third-party page to start a purchase using session cookies.
        const origin = request.headers.get('origin');
        if (origin && origin !== new URL(request.url).origin) return wallpaperJson({ error: 'แหล่งคำขอไม่ถูกต้อง' }, 403);
        const { user } = await wallpaperAuth();
        if (!user) return wallpaperJson({ error: 'กรุณาเข้าสู่ระบบก่อนดาวน์โหลด' }, 401);
        let body: unknown;
        try { body = await request.json(); } catch { return wallpaperJson({ error: 'ข้อมูลดาวน์โหลดไม่ถูกต้อง' }, 400); }
        const parsed = paidWallpaperRequest.safeParse(body);
        if (!parsed.success) return wallpaperJson({ error: 'ข้อมูลดาวน์โหลดไม่ถูกต้อง' }, 400);
        const service = wallpaperService();
        if (!service) return wallpaperUnavailable();
        const { productId, requestId, action } = parsed.data;
        const product = PAID_WALLPAPERS.find(item => item.id === productId)!;
        const { data: asset, error } = await service.from('wallpaper_products').select('id,cost,active,original_path,sha256,bytes').eq('id', productId).maybeSingle();
        if (error) return wallpaperUnavailable();
        if (!asset?.active) return wallpaperJson({ error: 'ภาพนี้ยังไม่พร้อมดาวน์โหลด' }, 404);
        if (asset.cost !== product.cost || asset.bytes !== product.bytes) return wallpaperUnavailable();

        // Read and verify the entire immutable file BEFORE charging. Never fall back to a public original.
        const { data: file, error: fileError } = await service.storage.from(WALLPAPER_ORIGINAL_BUCKET).download(asset.original_path);
        if (fileError || !file || file.size !== asset.bytes || file.size > 4_000_000) return wallpaperUnavailable();
        const bytes = new Uint8Array(await file.arrayBuffer());
        if (createHash('sha256').update(bytes).digest('hex') !== asset.sha256) return wallpaperUnavailable();
        const { data: receipt, error: rpcError } = await service.rpc('purchase_wallpaper_download', {
            p_user_id: user.id, p_product_id: productId, p_request_id: requestId,
            p_sha256: asset.sha256, p_retry_only: action === 'retry',
        });
        if (rpcError || !receipt) return wallpaperJson({ error: 'ยังยืนยันผลรายการไม่ได้ กรุณาลองรายการเดิมอีกครั้ง ระบบจะตรวจรายการก่อนและไม่หักซ้ำ', code: 'DOWNLOAD_RESULT_UNKNOWN' }, 503);
        if (receipt.status !== 'charged' && receipt.status !== 'retry') {
            const failure = paidWallpaperError(receipt.status);
            return wallpaperJson({ error: failure.error, code: receipt.status, remainingCredits: receipt.remaining_credits }, failure.status);
        }
        return new Response(bytes, { headers: {
            ...WALLPAPER_PRIVATE_HEADERS,
            'Content-Type': 'image/png', 'Content-Length': String(bytes.byteLength),
            'Content-Disposition': `attachment; filename="${product.downloadFilename}"`,
            'X-Download-Request-Id': requestId,
            'X-Download-Expires-At': receipt.expires_at,
            'X-Credits-Remaining': String(receipt.remaining_credits),
            'X-Download-Status': receipt.status,
        } });
    } catch { return wallpaperJson({ error: 'การส่งไฟล์ขัดข้อง กรุณาลองรายการเดิมอีกครั้งเพื่อตรวจผลโดยไม่เริ่มรายการเสียเครดิตใหม่', code: 'DOWNLOAD_RESULT_UNKNOWN' }, 503); }
}
