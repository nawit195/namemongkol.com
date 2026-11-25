import { createClient } from '@/utils/supabaseServer';
import { pageTrafficReportSchema, parsePageTrafficQuery } from '@/lib/pageTraffic';
import { trafficResponse, trafficService } from '@/lib/pageTrafficServer';

export async function GET(request: Request) {
    try {
        const client = await createClient();
        const { data: { user }, error: authError } = await client.auth.getUser();
        if (authError || !user || user.is_anonymous) return trafficResponse({ error: 'กรุณาเข้าสู่ระบบผู้ดูแล' }, 401);
        const { data: profile, error: profileError } = await client.from('user_profiles').select('role').eq('id', user.id).maybeSingle();
        if (profileError) return trafficResponse({ error: 'ตรวจสอบสิทธิ์ไม่สำเร็จ' }, 503);
        if (profile?.role !== 'admin') return trafficResponse({ error: 'สำหรับผู้ดูแลระบบเท่านั้น' }, 403);
        const query = parsePageTrafficQuery(new URL(request.url).searchParams);
        if (!query) return trafficResponse({ error: 'เลือกช่วงวันที่ไม่เกิน 31 วัน และไม่เกินวันนี้' }, 400);
        const service = trafficService();
        if (!service) return trafficResponse({ error: 'ระบบสถิติยังไม่พร้อม' }, 503);
        const { data, error } = await service.rpc('admin_page_traffic', {
            p_from: query.from, p_to: query.to, p_search: query.q, p_page: query.page,
        });
        const result = pageTrafficReportSchema.safeParse(data);
        if (error || !result.success) return trafficResponse({ error: 'โหลดสถิติไม่สำเร็จ กรุณาลองใหม่' }, 503);
        return trafficResponse({ success: true, ...result.data, filters: query });
    } catch { return trafficResponse({ error: 'โหลดสถิติไม่สำเร็จ กรุณาลองใหม่' }, 503); }
}
