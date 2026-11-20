import { PAID_WALLPAPERS } from '@/data/paidWallpapers';
import { wallpaperAuth, wallpaperJson, wallpaperService, wallpaperUnavailable } from '@/lib/paidWallpaperServer';
import { calculateEffectiveCredits } from '@/utils/credits';
import { withWallpaperTimeout } from '@/lib/wallpaperRequest';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        return await withWallpaperTimeout(async () => {
            const service = wallpaperService();
            const [catalog, { client, user }] = await Promise.all([
                service ? service.from('wallpaper_products').select('id,cost,active').in('id', PAID_WALLPAPERS.map(product => product.id)) : null,
                wallpaperAuth(),
            ]);
            // Membership must remain readable even while the private catalog is unavailable.
            // This lets guests sign in before checking credits or preparing a paid file.
            const unavailable = (error: string) => wallpaperJson({
                userId: user?.id ?? null, remainingCredits: null, error,
                products: PAID_WALLPAPERS.map(product => ({ ...product, available: false })),
            });
            if (!catalog || catalog.error) return unavailable('ระบบดาวน์โหลดภาพชุดนี้ยังไม่พร้อม คุณยังดูภาพตัวอย่างและเข้าสู่ระบบได้ การตรวจสอบสิทธิ์ไม่หักเครดิต');
            let remainingCredits: number | null = null;
            if (user) {
                const balance = await client.from('user_profiles').select('credits,welcome_credits,welcome_credits_granted_at').eq('id', user.id).maybeSingle();
                if (balance.error || !balance.data) return unavailable('ยังตรวจสอบเครดิตไม่ได้ กรุณาลองใหม่ การตรวจสอบสิทธิ์ไม่หักเครดิต');
                remainingCredits = calculateEffectiveCredits(balance.data);
            }
            return wallpaperJson({
                userId: user?.id ?? null, remainingCredits,
                products: PAID_WALLPAPERS.map(product => ({ ...product, available: catalog.data?.some(row => row.id === product.id && row.active && row.cost === product.cost) ?? false })),
            });
        }, 10_000);
    } catch { return wallpaperUnavailable(); }
}
