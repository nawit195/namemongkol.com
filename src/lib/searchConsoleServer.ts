import 'server-only';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabaseServer';
import { NextResponse } from 'next/server';
import { gscKinds, gscScopeSchema, type GscImport, type GscKind, type GscReportOptions } from './searchConsole';
import { z } from 'zod';

export function gscResponse(body: unknown, status=200) {
    return NextResponse.json(body,{status,headers:{'Cache-Control':'private, no-store',Vary:'Cookie'}});
}
export async function gscAdmin() {
    const client = await createClient();
    const {data:{user},error} = await client.auth.getUser();
    if(error || !user || user.is_anonymous) return {response:gscResponse({success:false,error:'กรุณาเข้าสู่ระบบผู้ดูแล'},401)};
    const {data:profile,error:profileError} = await client.from('user_profiles').select('role').eq('id',user.id).maybeSingle();
    if(profileError) return {response:gscResponse({success:false,error:'ตรวจสอบสิทธิ์ไม่สำเร็จ'},503)};
    if(profile?.role!=='admin') return {response:gscResponse({success:false,error:'สำหรับผู้ดูแลระบบเท่านั้น'},403)};
    const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
    if(!url||!key) return {response:gscResponse({success:false,error:'ระบบรายงานยังไม่พร้อม'},503)};
    return {user,service:createServiceClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}})};
}
const storedImportSchema = z.object({id:z.uuid(),created_at:z.string(),scope:gscScopeSchema,kinds:z.array(z.enum(gscKinds)).min(1).max(4),row_count:z.number().int().min(1).max(20000)});
export function gscImportMetadata(value: unknown): GscImport | null {
    const parsed=storedImportSchema.safeParse(value);
    return parsed.success?{id:parsed.data.id,createdAt:parsed.data.created_at,scope:parsed.data.scope,kinds:parsed.data.kinds,rowCount:parsed.data.row_count}:null;
}
const metric=z.number().finite().nonnegative();
export const gscSummarySchema=z.object({clicks:metric.int().safe(),impressions:metric.int().safe(),ctr:metric,position:metric});
export const gscDataSchema=z.object({total:z.number().int().nonnegative().safe(),sourceRows:z.number().int().nonnegative().safe(),summary:gscSummarySchema,rows:z.array(z.object({
    key:z.string(),query:z.string().optional(),path:z.string().optional(),date:z.string().optional(),kind:z.enum(gscKinds),
    clicks:metric.int().safe(),impressions:metric.int().safe(),ctr:metric,position:metric,
})).max(50)});
export async function readGscData(service: NonNullable<Awaited<ReturnType<typeof gscAdmin>>['service']>,id:string,kind:GscKind,page:number,search:string,options:GscReportOptions) {
    const {data,error}=await service.rpc('search_console_report_filtered',{p_import_id:id,p_kind:kind,p_page:page,p_search:search,p_sort:options.sort,p_order:options.order,p_opportunity:options.opportunity});
    const parsed=gscDataSchema.safeParse(data);
    if(error||!parsed.success)throw Error('โหลดข้อมูลรายงานไม่สำเร็จ');
    return parsed.data;
}
