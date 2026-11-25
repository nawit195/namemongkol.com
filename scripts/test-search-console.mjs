import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile,readdir} from 'node:fs/promises';
import {createRequire} from 'node:module';
import path from 'node:path';
const require=createRequire(import.meta.url);
const {PGlite}=require(path.resolve(process.argv[2]));
const db=new PGlite();let checks=0;
const equal=(a,b)=>{assert.deepEqual(a,b);checks++;};
const hash=value=>createHash('sha256').update(value).digest('hex');
const user='10000000-0000-4000-8000-000000000001';
const scope={property:'https://www.namemongkol.com/',searchType:'web',from:'2026-10-01',to:'2026-10-28',country:'all',device:'all',filters:''};
const row=(key,clicks=1,impressions=10,position=3,kind='queries')=>({kind,key,query:kind==='queries'?key:undefined,path:kind==='pages'?key:undefined,clicks,impressions,position,identityHash:hash(kind+':'+key)});
const ingest=(content,rows,sc=scope)=>db.query('select public.import_search_console($1,$2,$3,$4,$5,$6) as result',[user,JSON.stringify(sc),hash('scope'),hash(content),[...new Set(rows.map(row=>row.kind))],JSON.stringify(rows)]).then(result=>result.rows[0].result);
const report=(id,kind='queries',page=1,q='')=>db.query('select public.search_console_report($1,$2,$3,$4) as report',[id,kind,page,q]).then(result=>result.rows[0].report);
const filteredReport=(id,kind='queries',page=1,q='',sort='clicks',order='desc',opportunity=false)=>db.query('select public.search_console_report_filtered($1,$2,$3,$4,$5,$6,$7) as report',[id,kind,page,q,sort,order,opportunity]).then(result=>result.rows[0].report);
try{
 await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role;
 CREATE SCHEMA auth; CREATE TABLE auth.users(id uuid PRIMARY KEY); INSERT INTO auth.users VALUES('${user}');
 GRANT USAGE ON SCHEMA auth TO service_role; GRANT SELECT ON auth.users TO service_role;
 ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;`);
 const files=await readdir('supabase/migrations');
 for(const suffix of ['_search_console_imports.sql','_search_console_report_filters.sql']){
  const file=files.find(file=>file.endsWith(suffix));assert(file,`Missing migration ${suffix}`);
  await db.exec(await readFile('supabase/migrations/'+file,'utf8'));
 }
 await db.exec('SET ROLE service_role;');
 const rows=Array.from({length:1201},(_,i)=>row('คำค้น'+i));
 rows[0]=row('คำค้น0',10,100,1);rows[1]=row('คำค้น1',20,200,5);
 const imported=await ingest('first',rows);equal(imported.duplicate,false);
 for(const table of ['search_console_imports','search_console_rows'])for(const permission of ['UPDATE','DELETE','TRUNCATE'])equal((await db.query(`select has_table_privilege('service_role','public.${table}',$1) as allowed`,[permission])).rows[0].allowed,false);
 equal((await ingest('first',rows)).id,imported.id);equal((await ingest('first',rows)).duplicate,true);
 const revised=await ingest('revised',rows.map((value,i)=>i===0?{...value,clicks:11}:value));equal(revised.duplicate,false);assert.notEqual(imported.id,revised.id);checks++;
 const data=await report(imported.id);equal(data.total,1201);equal(data.sourceRows,1201);equal(data.rows.length,50);equal(data.summary.clicks,1229);equal(data.summary.impressions,12290);
 assert(Math.abs(data.summary.position-(1199*10*3+100+200*5)/12290)<1e-10);checks++;
 equal((await report(imported.id,'queries',25)).rows.length,1);
 equal((await report(imported.id,'queries',1,'คำค้น0')).summary,{clicks:10,impressions:100,ctr:10,position:1});
 equal((await report(imported.id,'pages')).rows,[]);
 equal((await report(imported.id,'queries',1,'missing')).summary,{clicks:0,impressions:0,ctr:0,position:0});
 const before=(await db.query('select count(*)::int as count from public.search_console_imports')).rows[0].count;
 await assert.rejects(ingest('bad-duplicate',[row('same'),row('same')]));checks++;
 equal((await db.query('select count(*)::int as count from public.search_console_imports')).rows[0].count,before);
 await assert.rejects(ingest('bad-row',[row('fine'),row('bad',-1)]));checks++;
 equal((await db.query('select count(*)::int as count from public.search_console_imports')).rows[0].count,before);
 // A long Unicode query/page key must not exceed a B-tree index tuple limit.
 const long=await ingest('long',[row('คำ'.repeat(500))]);equal((await report(long.id)).rows.length,1);
 // More than 1,000 qualifying rows: filters must run before both summary and pages.
 const rankedRows=Array.from({length:2401},(_,i)=>row('rank-'+String(i).padStart(4,'0'),i%17,10+i%5,i%20+1));
 const rankedQueries=[...rankedRows,row('no-impressions',0,0,0),row('below-boundary',1,10,3.999),row('above-boundary',1,10,15.001)];
 const ranking=await ingest('ranking-filters',[
  ...rankedQueries,row('https://www.namemongkol.com/search',7,70,4,'pages'),
  {...row('["joint","/names"]',3,30,5,'query-pages'),query:'joint',path:'https://www.namemongkol.com/names'},
  {...row('2026-10-02',2,20,2,'daily'),date:'2026-10-02'},
  {...row('2026-10-01',1,10,3,'daily'),date:'2026-10-01'},
 ]);
 const eligible=rankedQueries.filter(value=>value.impressions>0&&value.position>=4&&value.position<=15);
 equal(eligible.length,1440);
 const opportunities=await filteredReport(ranking.id,'queries',1,'','position','asc',true);
 equal(opportunities.total,eligible.length);equal(opportunities.sourceRows,rankedQueries.length);
 const totals=values=>({clicks:values.reduce((sum,value)=>sum+value.clicks,0),impressions:values.reduce((sum,value)=>sum+value.impressions,0)});
 const assertSummary=(summary,values)=>{
  const sum=totals(values);equal(summary.clicks,sum.clicks);equal(summary.impressions,sum.impressions);
  const ctr=sum.impressions?sum.clicks/sum.impressions*100:0;
  const position=sum.impressions?values.reduce((total,value)=>total+value.position*value.impressions,0)/sum.impressions:0;
  assert(Math.abs(summary.ctr-ctr)<1e-10);checks++;assert(Math.abs(summary.position-position)<1e-10);checks++;
 };
 assertSummary(opportunities.summary,eligible);
 const compare=(field,direction)=>(a,b)=>{
  const value=entry=>field==='dimension'?entry.key:field==='ctr'?(entry.impressions?entry.clicks/entry.impressions*100:null):field==='position'?(entry.impressions?entry.position:null):entry[field];
  const av=value(a),bv=value(b);
  if(av===null&&bv!==null)return 1;if(av!==null&&bv===null)return -1;
  if(av!==bv){const sign=av<bv?-1:1;return direction==='asc'?sign:-sign;}
  return a.key<b.key?-1:a.key>b.key?1:0;
 };
 for(const sort of ['clicks','impressions','ctr','position','dimension'])for(const order of ['asc','desc'])for(const opportunity of [false,true]){
  const expected=[...(opportunity?eligible:rankedQueries)].sort(compare(sort,order));
  for(const page of [1,2,Math.ceil(expected.length/50)]){
   const actual=await filteredReport(ranking.id,'queries',page,'',sort,order,opportunity);
   equal(actual.rows.map(value=>value.key),expected.slice((page-1)*50,page*50).map(value=>value.key));
   equal(actual.total,expected.length);
  }
 }
 const allOpportunityKeys=[];
 for(let page=1;page<=Math.ceil(eligible.length/50);page++)allOpportunityKeys.push(...(await filteredReport(ranking.id,'queries',page,'','dimension','asc',true)).rows.map(value=>value.key));
 equal(new Set(allOpportunityKeys).size,eligible.length);equal(allOpportunityKeys.length,eligible.length);
 const searched=eligible.filter(value=>value.key.includes('rank-00'));
 const searchReport=await filteredReport(ranking.id,'queries',1,'rank-00','impressions','desc',true);
 equal(searchReport.total,searched.length);assertSummary(searchReport.summary,searched);
 equal((await filteredReport(ranking.id,'pages',1,'','clicks','desc',true)).summary,{clicks:7,impressions:70,ctr:10,position:4});
 equal((await filteredReport(ranking.id,'query-pages',1,'','clicks','desc',true)).total,1);
 equal((await filteredReport(ranking.id,'daily',1,'','dimension','asc')).rows.map(value=>value.date),['2026-10-01','2026-10-02']);
 equal((await filteredReport(ranking.id,'queries',1,'missing','clicks','desc',true)).summary,{clicks:0,impressions:0,ctr:0,position:0});
 await assert.rejects(filteredReport(ranking.id,'daily',1,'','dimension','asc',true));checks++;
 await assert.rejects(filteredReport(ranking.id,'queries',1,'','unknown'));checks++;
 await assert.rejects(filteredReport(ranking.id,'queries',1,'','clicks','invalid'));checks++;
 await assert.rejects(filteredReport(ranking.id,'queries',1,'',null));checks++;
 equal((await report(ranking.id)).total,rankedQueries.length); // Original four-arg RPC remains callable.
 for(const role of ['anon','authenticated']){
  await db.exec(`RESET ROLE; SET ROLE ${role};`);
  await assert.rejects(db.query('select * from public.search_console_imports'));checks++;
  await assert.rejects(db.query('select * from public.search_console_rows'));checks++;
  await assert.rejects(ingest('forged',[row('forged')]));checks++;
  await assert.rejects(report(imported.id));checks++;
  await assert.rejects(filteredReport(ranking.id));checks++;
 }
 await db.exec(`RESET ROLE; DELETE FROM auth.users WHERE id='${user}'; SET ROLE service_role;`);
 equal((await db.query('select created_by from public.search_console_imports where id=$1',[imported.id])).rows[0].created_by,null);
 equal((await report(imported.id)).total,1201);
 console.log(`Search Console PostgreSQL checks passed: ${checks} assertions (1440 filtered rows, all sort directions, immutable imports, rollback, pagination, weighted aggregates and roles).`);
}finally{await db.close();}
