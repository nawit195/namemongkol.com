import {
    buildComparisonSnapshot,
    comparisonInputSchema,
} from '@/lib/comparisonReport';
import { comparisonCost, orderComparisonRows } from '@/lib/comparisonPricing';
import { compareNames } from '@/lib/nameComparison';
import {
    reportAuth,
    reportFailure,
    reportFingerprint,
    reportResponse,
    reportService,
} from '@/lib/comparisonReportServer';
import { calculateEffectiveCredits } from '@/utils/credits';
export const dynamic = 'force-dynamic';
const unavailable = (error?: { code?: string } | null) =>
    reportFailure(
        503,
        ['42P01', '42883', 'PGRST202', 'PGRST205'].includes(error?.code ?? '')
            ? 'กรุณาติดตั้ง migration การเปรียบเทียบ 4–5 ชื่อก่อนใช้งาน เปรียบเทียบ 2–3 ชื่อฟรีได้ตามปกติ'
            : 'ระบบเปรียบเทียบแบบใช้เครดิตยังไม่พร้อม กรุณาลองใหม่ ไม่มีการเปิดผลโดยไม่ตรวจเครดิต',
        'COMPARISON_UNAVAILABLE',
    );
export async function POST(request: Request) {
    try {
        let body: unknown;
        try {
            body = await request.json();
        } catch {
            return reportFailure(400, 'ข้อมูลเปรียบเทียบไม่ถูกต้อง');
        }
        const parsed = comparisonInputSchema.safeParse(body);
        if (!parsed.success)
            return reportFailure(
                400,
                'กรอกชื่อไม่ซ้ำ 2–5 ชื่อและเลือกวันเกิดให้ถูกต้อง',
            );
        const cost = comparisonCost(parsed.data.names.length);
        if (!cost)
            return reportResponse({
                success: true,
                status: 'free',
                cost: 0,
                rows: compareNames(
                    parsed.data.names,
                    parsed.data.surname,
                    parsed.data.day,
                ),
            });
        const { client, user } = await reportAuth();
        if (!user || user.is_anonymous)
            return reportFailure(
                401,
                'กรุณาเข้าสู่ระบบเพื่อเปรียบเทียบมากกว่า 3 ชื่อ',
            );
        const service = reportService();
        if (!service) return unavailable();
        if (new URL(request.url).searchParams.get('preview') === '1') {
            const [existing, balance] = await Promise.all([
                client
                    .from('comparison_access')
                    .select('snapshot')
                    .eq('user_id', user.id)
                    .eq('fingerprint', reportFingerprint(parsed.data))
                    .maybeSingle(),
                client
                    .from('user_profiles')
                    .select(
                        'credits, welcome_credits, welcome_credits_granted_at',
                    )
                    .eq('id', user.id)
                    .maybeSingle(),
            ]);
            if (existing.error) return unavailable(existing.error);
            if (balance.error || !balance.data) return unavailable();
            const rows = existing.data
                ? orderComparisonRows(existing.data.snapshot.rows, parsed.data)
                : null;
            if (existing.data && !rows) return unavailable();
            return reportResponse({
                success: true,
                status: existing.data
                    ? 'already_unlocked'
                    : 'confirmation_required',
                cost: existing.data ? 0 : cost,
                remainingCredits: calculateEffectiveCredits(balance.data),
                ...(existing.data ? { rows } : {}),
            });
        }
        // No client-supplied identity, price, score or snapshot participates in the debit.
        const snapshot = buildComparisonSnapshot(parsed.data);
        const { data, error } = await service.rpc('unlock_comparison_access', {
            p_user_id: user.id,
            p_fingerprint: reportFingerprint(parsed.data),
            p_input: parsed.data,
            p_snapshot: snapshot,
        });
        if (error || !data || typeof data !== 'object')
            return unavailable(error);
        if (data.status === 'insufficient_credits')
            return reportResponse(
                {
                    success: false,
                    status: data.status,
                    cost,
                    remainingCredits: data.remaining_credits,
                },
                402,
            );
        if (
            !['unlocked', 'already_unlocked'].includes(data.status) ||
            !data.access?.snapshot?.rows
        )
            return unavailable();
        const rows = orderComparisonRows(
            data.access.snapshot.rows,
            parsed.data,
        );
        if (!rows) return unavailable();
        return reportResponse({
            success: true,
            status: data.status,
            cost: data.status === 'unlocked' ? cost : 0,
            remainingCredits: data.remaining_credits,
            rows,
        });
    } catch {
        return unavailable();
    }
}
