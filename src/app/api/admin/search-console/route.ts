import { GSC_MAX_BYTES, gscCoverageWarnings, normalizeGscUpload, summarizeGscRows } from '@/lib/searchConsole';
import { gscAdmin,gscImportMetadata,gscResponse } from '@/lib/searchConsoleServer';
import { gscEditorialReview } from '@/lib/gscEditorialReview';

export async function GET(request: Request) {
    try {
        const auth=await gscAdmin();if(auth.response)return auth.response;
        const page = new URL(request.url).searchParams.get('page') ?? '1';
        if (!/^[1-9]\d*$/.test(page) || Number(page)>100000) return gscResponse({success:false,error:'หน้าประวัติไม่ถูกต้อง'},400);
        const offset=(Number(page)-1)*50;
        const {data,error,count}=await auth.service.from('search_console_imports').select('id,created_at,scope,kinds,row_count',{count:'exact'}).order('created_at',{ascending:false}).order('id',{ascending:false}).range(offset,offset+49);
        if(error||!data)return gscResponse({success:false,error:'โหลดประวัตินำเข้าไม่สำเร็จ'},503);
        const imports=data.map(gscImportMetadata);
        if(imports.some(item=>!item))return gscResponse({success:false,error:'รูปแบบข้อมูลรายงานไม่ถูกต้อง'},503);
        return gscResponse({success:true,imports,total:count??0,page:Number(page),pageSize:50});
    }catch{return gscResponse({success:false,error:'โหลดประวัตินำเข้าไม่สำเร็จ'},503);}
}
export async function POST(request:Request) {
    const origin=request.headers.get('origin');
    if((origin&&origin!==new URL(request.url).origin)||request.headers.get('sec-fetch-site')==='cross-site')return gscResponse({success:false,error:'ไม่อนุญาตคำขอข้ามเว็บไซต์'},403);
    try {
        const auth=await gscAdmin();if(auth.response)return auth.response;
        if(!request.headers.get('content-type')?.includes('application/json'))return gscResponse({success:false,error:'ต้องส่งข้อมูล JSON'},415);
        if(Number(request.headers.get('content-length'))>GSC_MAX_BYTES)return gscResponse({success:false,error:'ชุดนำเข้าต้องไม่เกิน 3 MB'},413);
        const text=await request.text();
        if(Buffer.byteLength(text,'utf8')>GSC_MAX_BYTES)return gscResponse({success:false,error:'ชุดนำเข้าต้องไม่เกิน 3 MB'},413);
        let parsed:ReturnType<typeof normalizeGscUpload>;
        try {parsed=normalizeGscUpload(JSON.parse(text));}catch(error){return gscResponse({success:false,error:error instanceof Error?error.message:'ไฟล์นำเข้าไม่ถูกต้อง'},400);}
        if (new URL(request.url).searchParams.get('validate') === '1') {
            const source = JSON.parse(text) as { files: { name: string; kind: typeof parsed.kinds[number] }[] };
            return gscResponse({ success: true, preview: {
                scope: parsed.scope, kinds: parsed.kinds, rowCount: parsed.rows.length, contentHash: parsed.contentHash,
                review: gscEditorialReview(parsed.rows),
                files: source.files.map(file => { const rows = parsed.rows.filter(row => row.kind === file.kind); return { name: file.name, kind: file.kind, rows: rows.length, summary: summarizeGscRows(rows) }; }),
                warnings: [...new Set(parsed.kinds.flatMap(kind => gscCoverageWarnings(kind, parsed.rows.filter(row => row.kind === kind).length)))],
            } });
        }
        const previewHash = request.headers.get('x-gsc-preview-hash');
        if (!previewHash) return gscResponse({ success: false, error: 'กรุณาตรวจสอบตัวอย่างก่อนยืนยันนำเข้า' }, 400);
        if (previewHash !== parsed.contentHash) return gscResponse({ success: false, error: 'ไฟล์หรือขอบเขตเปลี่ยนหลังดูตัวอย่าง กรุณาตรวจสอบอีกครั้ง' }, 409);
        const {data,error}=await auth.service.rpc('import_search_console',{p_user_id:auth.user.id,p_scope:parsed.scope,p_scope_key:parsed.scopeKey,p_content_hash:parsed.contentHash,p_kinds:parsed.kinds,p_rows:parsed.rows});
        if(error||!data||typeof data.id!=='string'||typeof data.duplicate!=='boolean')return gscResponse({success:false,error:'บันทึกข้อมูลไม่สำเร็จ ไม่มีการนำเข้าบางส่วน'},503);
        return gscResponse({success:true,id:data.id,duplicate:data.duplicate});
    }catch{return gscResponse({success:false,error:'บันทึกข้อมูลไม่สำเร็จ กรุณาลองใหม่'},503);}
}
