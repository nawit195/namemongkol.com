import {
    activityAuth,
    activityFailure,
    activityResponse,
    activityService,
    activityUnavailable,
} from '@/lib/memberActivityServer';
export const dynamic = 'force-dynamic';
export async function POST(request: Request) {
    try {
        const { user } = await activityAuth();
        if (!user) return activityFailure(401, 'กรุณาเข้าสู่ระบบ');
        if (new URL(request.url).searchParams.size)
            return activityFailure(400, 'ไม่รับตัวระบุสมาชิกหรือวันที่จาก URL');
        // No client timestamp, identity, path, search term, or tool content is accepted.
        const text = await request.text();
        if (text.trim() && text.trim() !== '{}')
            return activityFailure(
                400,
                'ไม่รับ user ID วันที่ หรือข้อมูลกิจกรรมจากเบราว์เซอร์',
            );
        const service = activityService();
        if (!service) return activityUnavailable();
        const { data, error } = await service.rpc('record_member_activity', {
            p_user_id: user.id,
        });
        if (
            error ||
            !data ||
            typeof data.recorded !== 'boolean' ||
            typeof data.activityDate !== 'string'
        )
            return activityUnavailable(error);
        return activityResponse({
            success: true,
            recorded: data.recorded,
            activityDate: data.activityDate,
        });
    } catch {
        return activityUnavailable();
    }
}
