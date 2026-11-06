import { reportAuth, reportDatabaseFailure, reportFailure, reportResponse } from '@/lib/comparisonReportServer';

export const dynamic = 'force-dynamic';
export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const { client, user } = await reportAuth();
        if (!user) return reportFailure(401, 'กรุณาเข้าสู่ระบบเพื่อดูรายงาน');
        const { id } = await context.params;
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return reportFailure(404, 'ไม่พบรายงาน');
        const { data, error } = await client.from('comparison_reports').select('id, created_at, credits_spent, snapshot').eq('id', id).eq('user_id', user.id).maybeSingle();
        if (error) return reportDatabaseFailure(error);
        return data ? reportResponse({ success: true, report: data }) : reportFailure(404, 'ไม่พบรายงาน');
    } catch { return reportDatabaseFailure(); }
}
