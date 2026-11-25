import { z } from 'zod';
import { compatibleGscPeriods,gscCoverageWarnings,gscKinds,gscOrders,gscSorts,type GscKind,type GscReport,type GscReportOptions } from '@/lib/searchConsole';
import { gscAdmin,gscImportMetadata,gscResponse,readGscData } from '@/lib/searchConsoleServer';

export async function GET(request:Request,{params}:{params:Promise<{id:string}>}) {
    try {
        const auth=await gscAdmin();if(auth.response)return auth.response;
        const {id}=await params;
        const search=new URL(request.url).searchParams;
        const kind=search.get('kind')??'queries',page=search.get('page')??'1',q=(search.get('q')??'').normalize('NFC').trim(),compare=search.get('compare');
        if(!z.uuid().safeParse(id).success||!gscKinds.includes(kind as GscKind)||!/^\d+$/.test(page)||Number(page)<1||Number(page)>100000||q.length>200||(compare&&!z.uuid().safeParse(compare).success))return gscResponse({success:false,error:'ตัวกรองรายงานไม่ถูกต้อง'},400);
        const sort=search.get('sort')??(kind==='daily'?'dimension':'clicks'),order=search.get('order')??(kind==='daily'?'asc':'desc'),opportunity=search.get('opportunity');
        if(!gscSorts.includes(sort as GscReportOptions['sort'])||!gscOrders.includes(order as GscReportOptions['order'])||(opportunity!==null&&opportunity!=='0'&&opportunity!=='1')||(kind==='daily'&&opportunity==='1'))return gscResponse({success:false,error:'การเรียงหรือตัวกรองโอกาสไม่ถูกต้อง ตัวกรองอันดับ 4–15 ใช้กับตารางรายวันไม่ได้'},400);
        const options:GscReportOptions={sort:sort as GscReportOptions['sort'],order:order as GscReportOptions['order'],opportunity:opportunity==='1'};
        const columns='id,created_at,scope,kinds,row_count';
        const selected=await auth.service.from('search_console_imports').select(columns).eq('id',id).maybeSingle();
        if(selected.error)return gscResponse({success:false,error:'โหลดรายงานไม่สำเร็จ'},503);
        const metadata=gscImportMetadata(selected.data);
        if(!metadata)return gscResponse({success:false,error:'ไม่พบรายงาน'},404);
        if(!metadata.kinds.includes(kind as GscKind))return gscResponse({success:false,error:'รายงานนี้ไม่มีมิติข้อมูลที่เลือก'},400);
        const data=await readGscData(auth.service,id,kind as GscKind,Number(page),q,options);
        let comparison:GscReport['comparison']=null;
        if(compare){
            const previous=await auth.service.from('search_console_imports').select(columns).eq('id',compare).maybeSingle();
            if(previous.error)throw Error('Comparison unavailable');
            const previousMeta=gscImportMetadata(previous.data);
            if(!previousMeta||!previousMeta.kinds.includes(kind as GscKind)||!compatibleGscPeriods(metadata.scope,previousMeta.scope))return gscResponse({success:false,error:'เปรียบเทียบได้เฉพาะมิติและตัวกรองเดียวกัน ช่วงวันยาวเท่ากันและไม่ทับซ้อน'},400);
            const before=await readGscData(auth.service,compare,kind as GscKind,1,q,options);
            const delta=(current:number,baseline:number)=>baseline?(current-baseline)/baseline*100:null;
            const comparable = data.summary.impressions > 0 && before.summary.impressions > 0;
            comparison={id:compare,summary:before.summary,delta:{clicks:delta(data.summary.clicks,before.summary.clicks),impressions:delta(data.summary.impressions,before.summary.impressions),ctr:comparable?data.summary.ctr-before.summary.ctr:null,position:comparable?data.summary.position-before.summary.position:null}};
        }
        return gscResponse({success:true,report:{...metadata,...data,...options,kind,page:Number(page),pageSize:50,warnings:gscCoverageWarnings(kind as GscKind,data.sourceRows),comparison}});
    }catch{return gscResponse({success:false,error:'โหลดรายงานไม่สำเร็จ กรุณาลองใหม่'},503);}
}
