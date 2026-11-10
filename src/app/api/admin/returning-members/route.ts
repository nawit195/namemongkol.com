import {
    parseReturningMembersQuery,
    returningMembersSchema,
} from '@/lib/memberActivity';
import {
    activityAuth,
    activityFailure,
    activityResponse,
    activityService,
    activityUnavailable,
} from '@/lib/memberActivityServer';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
    try {
        const { client, user } = await activityAuth();
        if (!user) return activityFailure(401, 'กรุณาเข้าสู่ระบบเพื่อดูรายงาน');
        const { data: profile, error: profileError } = await client
            .from('user_profiles')
            .select('role')
            .eq('id', user.id)
            .maybeSingle();
        if (profileError) return activityUnavailable();
        if (profile?.role !== 'admin')
            return activityFailure(403, 'หน้านี้สำหรับผู้ดูแลระบบเท่านั้น');
        const query = parseReturningMembersQuery(
            new URL(request.url).searchParams,
        );
        if (!query)
            return activityFailure(
                400,
                'ช่วงวันที่ คำค้น หรือหมายเลขหน้าไม่ถูกต้อง (เลือกได้สูงสุด 365 วัน)',
            );
        const service = activityService();
        if (!service) return activityUnavailable();
        const { data, error } = await service.rpc('admin_returning_members', {
            p_date_from: query.from,
            p_date_to: query.to,
            p_search: query.search,
            p_source: query.source,
            p_page: query.page,
        });
        if (error) return activityUnavailable(error);
        const parsed = returningMembersSchema.safeParse(data);
        if (!parsed.success) return activityUnavailable();
        return activityResponse({
            success: true,
            ...parsed.data,
            filters: query,
        });
    } catch {
        return activityUnavailable();
    }
}
