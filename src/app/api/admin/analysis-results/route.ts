import { createClient as createServiceClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabaseServer';
import { buildAnalyzedNameRows } from '@/lib/adminAnalysisResultsScoring';
import {
    ANALYSIS_NAMES_PAGE_SIZE, analysisNamesDownloadFilename, buildAnalyzedNamesCsv,
    parseAnalysisNamesQuery, parseAnalysisNamesResult,
} from '@/lib/adminAnalysisResults';

export const dynamic = 'force-dynamic';
const PRIVATE_HEADERS = { 'Cache-Control': 'private, no-store', Vary: 'Cookie' };

function failure(status: number, error: string, code?: string) {
    return NextResponse.json({ success: false, error, ...(code ? { code } : {}) }, { status, headers: PRIVATE_HEADERS });
}

export async function GET(request: Request) {
    try {
        const authed = await createClient();
        const { data: { user }, error: authError } = await authed.auth.getUser();
        if (authError || !user) return failure(401, 'กรุณาเข้าสู่ระบบเพื่อดูรายชื่อ');
        const { data: profile, error: profileError } = await authed.from('user_profiles')
            .select('role').eq('id', user.id).maybeSingle();
        if (profileError) return failure(503, 'ไม่สามารถตรวจสอบสิทธิ์ได้ กรุณาลองใหม่');
        if (profile?.role !== 'admin') return failure(403, 'หน้านี้สำหรับผู้ดูแลระบบเท่านั้น');

        const query = parseAnalysisNamesQuery(new URL(request.url).searchParams);
        if (!query) return failure(400, 'คำค้นหรือหมายเลขหน้าไม่ถูกต้อง');
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!url || !key) return failure(503, 'ยังไม่ได้ตั้งค่าการเชื่อมต่อฐานข้อมูลสำหรับแอดมิน', 'CONFIGURATION_REQUIRED');
        const service = createServiceClient(url, key, {
            auth: { persistSession: false, autoRefreshToken: false },
        });
        const { data, error } = await service.rpc('admin_analysis_result_names', {
            p_search: query.search, p_page: query.page,
            p_page_size: ANALYSIS_NAMES_PAGE_SIZE, p_export: query.exportCsv,
        });
        if (error) {
            if (error.code === 'PGRST202' || error.code === '42883') {
                return failure(503, 'ยังไม่ได้ติดตั้งฟังก์ชันดึงรายชื่อในฐานข้อมูล กรุณาติดตั้ง SQL migration ก่อนใช้งาน', 'MIGRATION_REQUIRED');
            }
            console.error('Admin analysis names RPC failed', { code: error.code });
            return failure(503, 'โหลดรายชื่อไม่สำเร็จ กรุณาลองใหม่');
        }
        const result = parseAnalysisNamesResult(data);
        if (!result) return failure(503, 'ข้อมูลรายชื่อที่ได้รับไม่ถูกต้อง กรุณาลองใหม่');
        const rows = buildAnalyzedNameRows(result.names);

        if (query.exportCsv) {
            if (result.names.length !== result.total) return failure(503, 'ข้อมูลส่งออกไม่ครบ กรุณาลองใหม่');
            return new NextResponse(buildAnalyzedNamesCsv(rows), {
                headers: {
                    ...PRIVATE_HEADERS,
                    'Content-Type': 'text/csv; charset=utf-8',
                    'Content-Disposition': `attachment; filename="${analysisNamesDownloadFilename()}"`,
                    'X-Content-Type-Options': 'nosniff',
                },
            });
        }
        return NextResponse.json({
            success: true, ...result, rows, page: query.page, pageSize: ANALYSIS_NAMES_PAGE_SIZE,
            totalPages: Math.max(1, Math.ceil(result.total / ANALYSIS_NAMES_PAGE_SIZE)),
        }, { headers: PRIVATE_HEADERS });
    } catch {
        return failure(503, 'ไม่สามารถโหลดรายชื่อได้ในขณะนี้ กรุณาลองใหม่');
    }
}
