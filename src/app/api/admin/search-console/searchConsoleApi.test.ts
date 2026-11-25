import {afterEach,beforeEach,describe,expect,it,vi} from 'vitest';
vi.mock('server-only',()=>({}));
const mocks=vi.hoisted(()=>({user:{id:'10000000-0000-4000-8000-000000000001',is_anonymous:false} as {id:string;is_anonymous:boolean}|null,role:'admin',rpc:vi.fn(),range:vi.fn(),serviceCreated:vi.fn(),imports:[] as Record<string,unknown>[],profileError:false}));
vi.mock('@/utils/supabaseServer',()=>({createClient:async()=>({auth:{getUser:async()=>({data:{user:mocks.user},error:null})},from:()=>{const query={select:()=>query,eq:()=>query,maybeSingle:async()=>({data:{role:mocks.role},error:mocks.profileError?{}:null})};return query;}})}));
vi.mock('@supabase/supabase-js',()=>({createClient:()=>{mocks.serviceCreated();return{rpc:mocks.rpc,from:()=>{let id:string|null=null;const query={select:()=>query,order:()=>query,range:mocks.range,eq:(_column:string,value:string)=>{id=value;return query;},maybeSingle:async()=>({data:mocks.imports.find(value=>value.id===id)??null,error:null})};return query;}};}}));
import {GET,POST} from './route';
import {GET as detail} from './[id]/route';
import {normalizeGscUpload} from '@/lib/searchConsole';
const currentId='20000000-0000-4000-8000-000000000001',previousId='20000000-0000-4000-8000-000000000002';
const scope={property:'https://www.namemongkol.com/',searchType:'web',from:'2026-10-01',to:'2026-10-28',country:'all',device:'all',filters:''};
const upload={scope,files:[{name:'Queries.csv',kind:'queries',csv:'Top queries,Clicks,Impressions,Position\nชื่อมงคล,10,100,4'}]};
const url='https://www.namemongkol.com/api/admin/search-console';
const request=(body:unknown=upload,origin='https://www.namemongkol.com')=>new Request(url,{method:'POST',headers:{origin,'content-type':'application/json','x-gsc-preview-hash':normalizeGscUpload(upload).contentHash},body:JSON.stringify(body)});
const context={params:Promise.resolve({id:currentId})};
const data={total:1,sourceRows:1000,rows:[{kind:'queries',key:'ชื่อมงคล',query:'ชื่อมงคล',clicks:10,impressions:100,position:4,ctr:10}],summary:{clicks:10,impressions:100,position:4,ctr:10}};
beforeEach(()=>{vi.clearAllMocks();vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL','https://test.supabase.co');vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY','gsc-api-test-key');mocks.user={id:'10000000-0000-4000-8000-000000000001',is_anonymous:false};mocks.role='admin';mocks.profileError=false;mocks.imports=[{id:currentId,created_at:'2026-10-29T00:00:00Z',scope,kinds:['queries'],row_count:1000},{id:previousId,created_at:'2026-10-01T00:00:00Z',scope:{...scope,from:'2026-09-03',to:'2026-09-30'},kinds:['queries'],row_count:1000}];mocks.range.mockResolvedValue({data:mocks.imports,count:101,error:null});mocks.rpc.mockImplementation(async(name:string)=>({data:name==='import_search_console'?{id:currentId,duplicate:false}:data,error:null}));});
afterEach(()=>vi.unstubAllEnvs());
describe('Search Console admin boundary',()=>{
 it('requires a verified database admin for every endpoint',async()=>{
  for(const identity of [null,{id:'member',is_anonymous:true},{id:'member',is_anonymous:false}]){
   mocks.user=identity;mocks.role='member';
   for(const response of [await GET(new Request(url)),await POST(request()),await detail(new Request(url+'/'+currentId),context)]){
    expect(response.status).toBe(identity&&!identity.is_anonymous?403:401);expect(response.headers.get('cache-control')).toContain('no-store');
   }
  }
  expect(mocks.serviceCreated).not.toHaveBeenCalled();expect(mocks.rpc).not.toHaveBeenCalled();
 });
 it('pages all persisted history and never exposes normalized metric rows in the list',async()=>{
  const response=await GET(new Request(url+'?page=3'));expect(response.status).toBe(200);expect(mocks.range).toHaveBeenCalledWith(100,149);
  const body=await response.json();expect(body.total).toBe(101);expect(body.pageSize).toBe(50);expect(body.imports[0]).not.toHaveProperty('rows');
  expect((await GET(new Request(url+'?page=-1'))).status).toBe(400);
 });
 it('rejects cross-origin, malformed, oversized or incomplete input before a database write',async()=>{
  expect((await POST(request(upload,'https://evil.test'))).status).toBe(403);
  expect((await POST(request({...upload,scope:{...scope,to:'2099-01-01'}}))).status).toBe(400);
  expect((await POST(request({...upload,files:[{name:'bad.csv',kind:'queries',csv:'query,clicks,impressions,position\nq,1,10,2\nbad,no,10,2'}]}))).status).toBe(400);
  expect((await POST(request({...upload,files:[{...upload.files[0],csv:'ก'.repeat(1024*1024)}]}))).status).toBe(413);
  expect(mocks.rpc).not.toHaveBeenCalled();
 });
 it('imports all validated rows in one transaction and returns immutable idempotency results',async()=>{
  const response=await POST(request());expect(response.status).toBe(200);expect(await response.json()).toEqual({success:true,id:currentId,duplicate:false});
  const [name,args]=mocks.rpc.mock.calls[0];expect(name).toBe('import_search_console');expect(args.p_user_id).toBe(mocks.user!.id);expect(args.p_rows).toHaveLength(1);expect(args.p_rows[0].identityHash).toMatch(/^[a-f0-9]{64}$/);
  mocks.rpc.mockResolvedValue({data:{id:currentId,duplicate:true},error:null});expect((await (await POST(request())).json()).duplicate).toBe(true);
 });
 it('previews strictly parsed metadata and metrics without writing, and refuses absent or stale confirmation hashes',async()=>{
  const preview=await POST(new Request(url+'?validate=1',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(upload)}));
  expect(preview.status).toBe(200);const body=await preview.json();expect(body.preview.rowCount).toBe(1);expect(body.preview.files[0].summary).toEqual({clicks:10,impressions:100,ctr:10,position:4});expect(body.preview.contentHash).toBe(normalizeGscUpload(upload).contentHash);expect(mocks.rpc).not.toHaveBeenCalled();
  const missing=request();missing.headers.delete('x-gsc-preview-hash');expect((await POST(missing)).status).toBe(400);
  const stale=request();stale.headers.set('x-gsc-preview-hash','stale');expect((await POST(stale)).status).toBe(409);expect(mocks.rpc).not.toHaveBeenCalled();
 });
 it('keeps dimensions separate, preserves row coverage notes and handles comparison zero baselines',async()=>{
  const response=await detail(new Request(url+'/'+currentId+'?kind=queries&q=ชื่อ'),context);const body=await response.json();
  expect(body.report.warnings.join(' ')).toContain('1,000');
  expect(body.report.warnings.join(' ')).toContain('ไม่ระบุความสัมพันธ์');expect(body.report.kind).toBe('queries');
  expect((await detail(new Request(url+'/'+currentId+'?kind=pages'),context)).status).toBe(400);
  mocks.rpc.mockResolvedValueOnce({data,error:null}).mockResolvedValueOnce({data:{...data,summary:{clicks:0,impressions:0,ctr:0,position:0}},error:null});
  const compared=await detail(new Request(url+'/'+currentId+'?compare='+previousId+'&q=ชื่อ'),context);
  expect(compared.status).toBe(200);const result=await compared.json();expect(result.report.comparison.delta.clicks).toBeNull();expect(result.report.comparison.delta.impressions).toBeNull();expect(result.report.comparison.delta.position).toBeNull();expect(result.report.comparison.delta.ctr).toBeNull();
  expect(mocks.rpc.mock.calls.slice(-2).every(call=>call[1].p_search==='ชื่อ')).toBe(true);
 });
 it('rejects mismatched scopes, overlapping windows and malformed DB output',async()=>{
  mocks.imports[1].scope={...scope,country:'TH',from:'2026-09-03',to:'2026-09-30'};
  expect((await detail(new Request(url+'/'+currentId+'?compare='+previousId),context)).status).toBe(400);
  mocks.imports[1].scope={...scope};expect((await detail(new Request(url+'/'+currentId+'?compare='+previousId),context)).status).toBe(400);
  mocks.rpc.mockResolvedValue({data:{},error:null});expect((await detail(new Request(url+'/'+currentId),context)).status).toBe(503);
 });
 it('applies the same sort and opportunity filter before paging and comparison summaries',async()=>{
  const response=await detail(new Request(url+'/'+currentId+'?page=2&q=ชื่อ&sort=ctr&order=asc&opportunity=1&compare='+previousId),context);
  expect(response.status).toBe(200);const body=await response.json();
  expect(body.report).toMatchObject({sort:'ctr',order:'asc',opportunity:true,page:2});
  expect(mocks.rpc.mock.calls).toHaveLength(2);
  for(const [name,args] of mocks.rpc.mock.calls){expect(name).toBe('search_console_report_filtered');expect(args).toMatchObject({p_search:'ชื่อ',p_sort:'ctr',p_order:'asc',p_opportunity:true});}
  expect(mocks.rpc.mock.calls.map(call=>call[1].p_page)).toEqual([2,1]);
 });
 it('uses stable defaults per dimension and rejects invalid sorting or daily opportunities',async()=>{
  let response=await detail(new Request(url+'/'+currentId),context);
  expect((await response.json()).report).toMatchObject({sort:'clicks',order:'desc',opportunity:false});
  mocks.imports[0].kinds=['daily'];
  response=await detail(new Request(url+'/'+currentId+'?kind=daily'),context);
  expect(response.status).toBe(200);expect((await response.json()).report).toMatchObject({sort:'dimension',order:'asc',opportunity:false});
  expect(mocks.rpc).toHaveBeenLastCalledWith('search_console_report_filtered',expect.objectContaining({p_kind:'daily',p_sort:'dimension',p_order:'asc',p_opportunity:false}));
  mocks.rpc.mockClear();
  for(const query of ['sort=unknown','order=up','opportunity=true','opportunity=2','kind=daily&opportunity=1','sort=clicks%3BDROP%20TABLE']) expect((await detail(new Request(url+'/'+currentId+'?'+query),context)).status).toBe(400);
  expect(mocks.rpc).not.toHaveBeenCalled();
 });
 it('rejects fractional counts and zero measured ranks during preview before any save',async()=>{
  for(const metrics of ['1.00000000000000000001,10,1','9007199254740991.1,10,1','1,100,0']){
   const input={...upload,files:[{...upload.files[0],csv:'Top queries,Clicks,Impressions,Position\nq,'+metrics}]};
   const response=await POST(new Request(url+'?validate=1',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(input)}));
   expect(response.status).toBe(400);
  }
  expect(mocks.rpc).not.toHaveBeenCalled();
 });
});
