import { HORSE_WALLPAPERS, HORSE_WALLPAPER_COST } from '@/data/horseWallpapers';
import { wallpaperAuth, wallpaperJson, wallpaperService, wallpaperUnavailable } from '@/lib/paidWallpaperServer';
import { calculateEffectiveCredits } from '@/utils/credits';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const service = wallpaperService();
        if (!service) return wallpaperUnavailable();
        const [{ data, error }, { client, user }] = await Promise.all([
            service.from('wallpaper_products').select('id,cost,active').in('id', HORSE_WALLPAPERS.map(product => product.id)),
            wallpaperAuth(),
        ]);
        if (error) return wallpaperUnavailable();
        let remainingCredits: number | null = null;
        if (user) {
            const balance = await client.from('user_profiles').select('credits,welcome_credits,welcome_credits_granted_at').eq('id', user.id).maybeSingle();
            if (balance.error || !balance.data) return wallpaperUnavailable();
            remainingCredits = calculateEffectiveCredits(balance.data);
        }
        return wallpaperJson({
            userId: user?.id ?? null, remainingCredits,
            products: HORSE_WALLPAPERS.map(product => ({ ...product, available: data?.some(row => row.id === product.id && row.active && row.cost === HORSE_WALLPAPER_COST) ?? false })),
        });
    } catch { return wallpaperUnavailable(); }
}
