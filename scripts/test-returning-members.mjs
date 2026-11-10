import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import path from 'node:path';
const require=createRequire(import.meta.url);
if(!process.argv[2])throw new Error('Pass the local @electric-sql/pglite module path');
const {PGlite}=require(path.resolve(process.argv[2]));
const db=new PGlite();
const A='10000000-0000-4000-8000-000000000001',B='10000000-0000-4000-8000-000000000002',ADMIN='10000000-0000-4000-8000-000000000003',ANON='10000000-0000-4000-8000-000000000004',CONVERTED='10000000-0000-4000-8000-000000000005';
const migration=await readFile(new URL('../supabase/migrations/20261110062709_member_activity_returning_members.sql',import.meta.url),'utf8');
try {
 await db.exec(`CREATE ROLE anon;CREATE ROLE authenticated;CREATE ROLE service_role BYPASSRLS;CREATE SCHEMA auth;
 CREATE TABLE auth.users(id uuid PRIMARY KEY,is_anonymous boolean DEFAULT false,created_at timestamptz DEFAULT now()-interval '2 years',email_confirmed_at timestamptz DEFAULT now()-interval '2 years',phone_confirmed_at timestamptz);
 CREATE TABLE public.user_profiles(id uuid PRIMARY KEY REFERENCES auth.users(id),first_name text,last_name text,email text,tier text,role text);
 GRANT SELECT ON public.user_profiles TO service_role;
 CREATE TABLE public.user_action_events(user_id uuid,created_at timestamptz,page_path text);
 CREATE TABLE public.analysis_history(user_id uuid,created_at timestamptz);
 CREATE TABLE public.credit_transactions(user_id uuid,created_at timestamptz,type text);`);
 for(const id of [A,B,ADMIN,ANON,CONVERTED]){await db.query('INSERT INTO auth.users(id,is_anonymous) VALUES($1,$2)',[id,id===ANON]);await db.query("INSERT INTO public.user_profiles VALUES($1,$2,null,$3,'free',$4)",[id,id===A?'มาลี':id===B?null:'ชื่อทดสอบ',`${id.slice(-1)}@example.test`,id===ADMIN?'admin':'user']);}
 const today=(await db.query("SELECT (now() AT TIME ZONE 'Asia/Bangkok')::date::text AS day")).rows[0].day;
 const start=new Date(today+'T00:00:00+07:00'),prior=new Date(+start-86400000),before=new Date(+start-1);
 await db.query('UPDATE auth.users SET email_confirmed_at=$1 WHERE id=$2',[start,CONVERTED]);
 await db.query("INSERT INTO user_action_events SELECT $1,$2::timestamptz+g*interval '1 second','/search' FROM generate_series(1,1500) g",[A,prior]);
 for(const [id,at,route] of [[A,before,'/names'],[A,start,'/search'],[B,start,'/names'],[ADMIN,prior,'/names'],[ADMIN,start,'/names'],[ANON,prior,'/names'],[ANON,start,'/names'],[CONVERTED,prior,'/names'],[CONVERTED,start,'/names'],[B,prior,'/admin/users']])await db.query('INSERT INTO user_action_events VALUES($1,$2,$3)',[id,at,route]);
 await db.query('INSERT INTO analysis_history VALUES($1,$2),($3,$4)',[A,prior,B,start]);
 await db.query("INSERT INTO credit_transactions VALUES($1,$2,'spend'),($3,$4,'topup')",[A,start,B,prior]);
 await db.exec(migration);
 const report=async(from=prior.toLocaleDateString('en-CA',{timeZone:'Asia/Bangkok'}),to=today,source='all',page=1,search='')=>{
  await db.exec('SET ROLE service_role');try{return(await db.query('SELECT public.admin_returning_members($1,$2,$3,$4,$5) AS value',[from,to,search,source,page])).rows[0].value;}finally{await db.exec('RESET ROLE');}
 };
 const old=await report();assert.equal(old.total,1);assert.equal(old.members[0].id,A);assert.equal(old.members[0].activeDays,2);assert.equal(old.members[0].source,'legacy');assert.equal(old.coverage.legacySources.length,3);
 assert.equal((await report(undefined,undefined,'observed')).total,0);
 const observed=async(id,day,at)=>db.query("INSERT INTO public.member_activity_days VALUES($1,$2,'observed',$3,$3) ON CONFLICT DO NOTHING",[id,day,at]);
 await observed(A,prior.toLocaleDateString('en-CA',{timeZone:'Asia/Bangkok'}),prior);
 assert.equal((await report()).members[0].source,'mixed');assert.equal((await report()).members[0].activeDays,2);assert.equal((await report(undefined,undefined,'observed')).total,0);
 await observed(A,today,start);await observed(B,today,start);
 const fresh=await report(undefined,undefined,'observed');assert.equal(fresh.total,1);assert.equal(fresh.members[0].observedDays,2);assert.equal(fresh.members[0].legacyOnlyDays,0);
 await db.exec('SET ROLE service_role');
 for(let i=0;i<2;i++)assert.equal((await db.query('SELECT record_member_activity($1) AS value',[B])).rows[0].value.recorded,true);
 assert.equal((await db.query('SELECT record_member_activity($1) AS value',[ADMIN])).rows[0].value.recorded,false);
 await db.exec('RESET ROLE');
 assert.equal((await db.query("SELECT count(*)::int AS n FROM member_activity_days WHERE user_id=$1 AND source='observed'",[B])).rows[0].n,1);
 assert.equal((await report(today,today)).total,0); // Multiple sources/clicks in one day never qualify.
 await db.exec(`INSERT INTO auth.users(id) SELECT ('20000000-0000-4000-8000-'||lpad(g::text,12,'0'))::uuid FROM generate_series(1,1105) g;
 INSERT INTO user_profiles SELECT id,'สมาชิกทดสอบ'||row_number() OVER(ORDER BY id),null,id::text||'@example.test','pro','user' FROM auth.users WHERE id::text LIKE '20000000%';`);
 await db.query("INSERT INTO member_activity_days SELECT id,$1::date,'observed',$2::timestamptz,$2::timestamptz FROM user_profiles WHERE id::text LIKE '20000000%'",[today,start]);
 await db.query("INSERT INTO member_activity_days SELECT id,$1::date,'observed',$2::timestamptz,$2::timestamptz FROM user_profiles WHERE id::text LIKE '20000000%'",[prior.toLocaleDateString('en-CA',{timeZone:'Asia/Bangkok'}),prior]);
 const one=await report(),two=await report(undefined,undefined,'all',2),last=await report(undefined,undefined,'all',23);
 assert.equal(one.total,1106);assert.equal(one.members.length,50);assert.equal(last.members.length,6);assert.equal(new Set([...one.members,...two.members].map(r=>r.id)).size,100);
 assert.equal((await report(undefined,undefined,'all',1,'สมาชิกทดสอบ')).total,1105);assert.equal((await report(undefined,undefined,'all',1,'มาลี')).total,1);assert.equal((await report(undefined,undefined,'all',1,'%')).total,0);
 assert.ok(one.members.every(r=>![ADMIN,ANON,CONVERTED].includes(r.id)));
 await assert.rejects(report('2025-01-01',today),e=>e.code==='22023');
 for(const role of ['anon','authenticated']){
  await db.exec(`SET ROLE ${role}`);
  for(const sql of ['SELECT * FROM member_activity_days','SELECT * FROM member_activity_coverage',"SELECT public.admin_returning_members(current_date-7,current_date)",`SELECT public.record_member_activity('${A}')`])await assert.rejects(db.query(sql),e=>e.code==='42501');
  await db.exec('RESET ROLE');
 }
 await db.query('DELETE FROM user_profiles WHERE id=$1',[B]);await db.query('DELETE FROM auth.users WHERE id=$1',[B]);assert.equal((await db.query('SELECT count(*)::int AS n FROM member_activity_days WHERE user_id=$1',[B])).rows[0].n,0);
 console.log('PASS: Thai midnight, 1500+ events, 1106 returning members, 50-row pagination, exact search/counts, legacy/new overlap, 2 distinct days in range, anonymous/admin/pre-upgrade exclusion, server-date upsert, RLS/service-only RPC, deleted users.');
} catch(error){console.error({message:error.message,code:error.code,detail:error.detail,position:error.position});process.exitCode=1;} finally {await db.close();}

if(!process.exitCode){
 const empty=new PGlite();try{
  await empty.exec(`CREATE ROLE anon;CREATE ROLE authenticated;CREATE ROLE service_role BYPASSRLS;CREATE SCHEMA auth;CREATE TABLE auth.users(id uuid PRIMARY KEY);CREATE TABLE public.user_profiles(id uuid PRIMARY KEY,first_name text,last_name text,email text,tier text,role text);GRANT SELECT ON user_profiles TO service_role;`);
  await empty.exec(migration);
  const result=(await empty.query("SELECT admin_returning_members((now() AT TIME ZONE 'Asia/Bangkok')::date-29,(now() AT TIME ZONE 'Asia/Bangkok')::date) AS value")).rows[0].value;
  assert.deepEqual(result.coverage.legacySources,[]);assert.equal(result.total,0);console.log('PASS: missing optional legacy tables do not block migration or new report.');
 }catch(error){console.error({message:error.message,code:error.code});process.exitCode=1;}finally{await empty.close();}
}
