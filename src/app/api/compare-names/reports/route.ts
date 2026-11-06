import { buildComparisonSnapshot, comparisonInputSchema, COMPARISON_REPORT_COST, COMPARISON_REPORT_PAGE_SIZE } from '@/lib/comparisonReport';
import { reportAuth, reportDatabaseFailure, reportFailure, reportFingerprint, reportResponse, reportService } from '@/lib/comparisonReportServer';
import { calculateEffectiveCredits } from '@/utils/credits';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { client, user } = await reportAuth();
        if (!user) return reportFailure(401, 'กรุณาเข้าสู่ระบบเพื่อดูรายงาน');
        const pageText = new URL(request.url).searchParams.get('page') ?? '1';
        const page = Number(pageText);
        if (!/^[1-9]\d*$/.test(pageText) || !Number.isSafeInteger(page) || page > 100000) return reportFailure(400, 'หมายเลขหน้าไม่ถูกต้อง');
        const from = (page - 1) * COMPARISON_REPORT_PAGE_SIZE;
        const [history, balance] = await Promise.all([
            client.from('comparison_reports').select('id, created_at, credits_spent, input', { count: 'exact' }).eq('user_id', user.id).order('created_at', { ascending: false }).order('id', { ascending: false }).range(from, from + COMPARISON_REPORT_PAGE_SIZE - 1),
            client.from('user_profiles').select('credits, welcome_credits, welcome_credits_granted_at').eq('id', user.id).maybeSingle(),
        ]);
        if (history.error) return reportDatabaseFailure(history.error);
        if (balance.error || !balance.data) return reportFailure(503, 'ไม่สามารถตรวจสอบเครดิตได้ กรุณาลองใหม่');
        return reportResponse({ success: true, reports: history.data, total: history.count ?? 0, page, pageSize: COMPARISON_REPORT_PAGE_SIZE,
            remainingCredits: calculateEffectiveCredits(balance.data), cost: COMPARISON_REPORT_COST, available: !!reportService() });
    } catch { return reportDatabaseFailure(); }
}

export async function POST(request: Request) {
    try {
        const { client, user } = await reportAuth();
        if (!user) return reportFailure(401, 'กรุณาเข้าสู่ระบบก่อนเปิดรายงาน');
        let body: unknown;
        try { body = await request.json(); } catch { return reportFailure(400, 'ข้อมูลรายงานไม่ถูกต้อง'); }
        const parsed = comparisonInputSchema.safeParse(body);
        if (!parsed.success) return reportFailure(400, 'กรอกชื่อไม่ซ้ำ 2–5 ชื่อและเลือกวันเกิดให้ถูกต้อง');
        const service = reportService();
        if (!service) return reportFailure(503, 'ระบบรายงานยังไม่ได้ตั้งค่า ตารางฟรียังใช้ได้', 'CONFIGURATION_REQUIRED');
        if (new URL(request.url).searchParams.get('preview') === '1') {
            const [existing, balance] = await Promise.all([
                client.from('comparison_reports').select('id, created_at, credits_spent, snapshot').eq('user_id', user.id).eq('fingerprint', reportFingerprint(parsed.data)).maybeSingle(),
                client.from('user_profiles').select('credits, welcome_credits, welcome_credits_granted_at').eq('id', user.id).maybeSingle(),
            ]);
            if (existing.error) return reportDatabaseFailure(existing.error);
            if (balance.error || !balance.data) return reportFailure(503, 'ไม่สามารถตรวจสอบเครดิตได้');
            return reportResponse({ success: true, report: existing.data, remainingCredits: calculateEffectiveCredits(balance.data), cost: COMPARISON_REPORT_COST });
        }
        const snapshot = buildComparisonSnapshot(parsed.data);
        const { data, error } = await service.rpc('unlock_comparison_report', {
            p_user_id: user.id, p_fingerprint: reportFingerprint(parsed.data), p_input: parsed.data, p_snapshot: snapshot,
        });
        if (error) return reportDatabaseFailure(error);
        if (!data || typeof data !== 'object') return reportDatabaseFailure();
        if (data.status === 'insufficient_credits') return reportResponse({ success: false, status: data.status, remainingCredits: data.remaining_credits, cost: COMPARISON_REPORT_COST }, 402);
        if (!['unlocked', 'already_unlocked'].includes(data.status) || !data.report) return reportDatabaseFailure();
        return reportResponse({ success: true, status: data.status, remainingCredits: data.remaining_credits, report: data.report });
    } catch { return reportDatabaseFailure(); }
}
