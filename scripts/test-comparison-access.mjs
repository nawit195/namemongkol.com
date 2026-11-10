import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const packagePath = process.argv[2];
if (!packagePath) throw new Error('Pass the temporary @electric-sql/pglite package path');
const { PGlite } = require(path.resolve(packagePath));
const db = new PGlite();
const userA = '10000000-0000-4000-8000-000000000001';
const userB = '10000000-0000-4000-8000-000000000002';
const input = { names: ['ปัญญา', 'กานต์', 'ศิริ', 'ณัฐ'], surname: '', day: 'monday' };
const snapshot = { input, rows: ['ปัญญา','กานต์','ศิริ','ณัฐ'].map(name=>({name})), formulaVersion: 'fixture-v1' };
const fingerprint = char => char.repeat(64);
try {
    await db.exec(`
        CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;
        CREATE SCHEMA auth;
        CREATE TABLE auth.users(id uuid PRIMARY KEY);
        CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$SELECT nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
        GRANT USAGE ON SCHEMA auth TO authenticated,service_role;
        CREATE TABLE public.user_profiles(id uuid PRIMARY KEY REFERENCES auth.users(id),credits integer,welcome_credits integer,welcome_credits_granted_at timestamptz);
        CREATE TABLE public.credit_transactions(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),user_id uuid,amount integer,type text,description text);
        GRANT SELECT,UPDATE ON public.user_profiles TO service_role;
        GRANT INSERT,SELECT ON public.credit_transactions TO service_role;
        INSERT INTO auth.users VALUES('${userA}'),('${userB}');
        INSERT INTO public.user_profiles VALUES('${userA}',10,0,null),('${userB}',10,0,null);
        CREATE FUNCTION public.guard_test_credits() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
          IF current_setting('app.bypass_credit_check',true) IS DISTINCT FROM 'true' THEN RAISE EXCEPTION 'Protected balance'; END IF; RETURN NEW;
        END $$;
        CREATE TRIGGER guard_test BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION public.guard_test_credits();
    `);
    const migration=await readFile(new URL('../supabase/migrations/20261110045223_comparison_access_credits.sql',import.meta.url),'utf8');
    await db.exec(await readFile(new URL('../supabase/migrations/20261106100738_comparison_reports.sql',import.meta.url),'utf8'));
    await db.exec(await readFile(new URL('../supabase/migrations/20261106103315_comparison_report_snapshot_limit.sql',import.meta.url),'utf8'));
    await db.exec(migration);
    const purchase=async(key,user=userA,payload=input,saved={...snapshot,input:payload})=>{
        await db.exec('SET ROLE service_role');
        try{return (await db.query('SELECT public.unlock_comparison_access($1,$2,$3,$4) AS result',[user,fingerprint(key),payload,saved])).rows[0].result;}
        finally{await db.exec('RESET ROLE');}
    };
    const reset=async(credits,welcome=0,age='1 day')=>{
        await db.exec("SELECT set_config('app.bypass_credit_check','true',false)");
        await db.query("UPDATE public.user_profiles SET credits=$1,welcome_credits=$2,welcome_credits_granted_at=now()-$3::interval WHERE id=$4",[credits,welcome,age,userA]);
        await db.exec("SELECT set_config('app.bypass_credit_check','',false)");
    };
    for(const credits of [0,9]){await reset(credits);assert.equal((await purchase('a')).status,'insufficient_credits');}
    await reset(10);const first=await purchase('a');assert.equal(first.remaining_credits,0);assert.equal(first.status,'unlocked');
    const retry=await purchase('a');assert.equal(retry.status,'already_unlocked');assert.equal(retry.access.id,first.access.id);
    assert.equal((await db.query("SELECT count(*)::int AS count FROM public.credit_transactions WHERE type='spend' AND user_id=$1",[userA])).rows[0].count,1);
    assert.equal((await purchase('b')).status,'insufficient_credits');assert.equal((await purchase('a',userB)).status,'unlocked');
    await reset(8,7);assert.equal((await purchase('c')).remaining_credits,5);
    assert.deepEqual((await db.query('SELECT credits,welcome_credits FROM public.user_profiles WHERE id=$1',[userA])).rows[0],{credits:5,welcome_credits:0});
    await reset(9,100,'31 days');assert.equal((await purchase('d')).status,'insufficient_credits');
    await reset(10,100,'31 days');assert.equal((await purchase('d')).remaining_credits,0);
    assert.equal((await db.query("SELECT count(*)::int AS count FROM public.credit_transactions WHERE type='expire'",[])).rows[0].count,1);
    await reset(10);
    await db.exec("CREATE FUNCTION fail_access_ledger() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'Simulated ledger failure'; END $$; CREATE TRIGGER fail_ledger BEFORE INSERT ON public.credit_transactions FOR EACH ROW EXECUTE FUNCTION fail_access_ledger();");
    await assert.rejects(purchase('e'),/Simulated ledger failure/);
    assert.equal((await db.query('SELECT credits FROM public.user_profiles WHERE id=$1',[userA])).rows[0].credits,10);
    assert.equal((await db.query('SELECT count(*)::int AS count FROM public.comparison_access WHERE fingerprint=$1',[fingerprint('e')])).rows[0].count,0);
    await db.exec('DROP TRIGGER fail_ledger ON public.credit_transactions');
    for(const n of [3,6]){const payload={...input,names:Array(n).fill('ทดสอบ')};await assert.rejects(purchase('e',userA,payload,{...snapshot,input:payload,rows:Array(n).fill({name:'ทดสอบ'})}),/Invalid report size/);}
    await assert.rejects(purchase('e',userA,input,{...snapshot,input:{...input,day:'friday'}}),/Invalid report payload/);
    const raw=key=>db.query('SELECT public.unlock_comparison_access($1,$2,$3,$4) AS result',[userA,fingerprint(key),input,snapshot]);
    await reset(10);await db.exec('SET ROLE service_role');const same=await Promise.all([raw('f'),raw('f')]);await db.exec('RESET ROLE');
    assert.deepEqual(same.map(r=>r.rows[0].result.status).sort(),['already_unlocked','unlocked']);
    await reset(10);await db.exec('SET ROLE service_role');const different=await Promise.all([raw('0'),raw('1')]);await db.exec('RESET ROLE');
    assert.deepEqual(different.map(r=>r.rows[0].result.status).sort(),['insufficient_credits','unlocked']);
    assert.equal((await db.query('SELECT credits FROM public.user_profiles WHERE id=$1',[userA])).rows[0].credits,0);
    await reset(10);await db.exec('SET ROLE service_role');
    const cross=await Promise.all([raw('2'),db.query('SELECT public.unlock_comparison_report($1,$2,$3,$4) AS result',[userA,fingerprint('3'),input,snapshot])]);
    await db.exec('RESET ROLE');assert.deepEqual(cross.map(r=>r.rows[0].result.status).sort(),['insufficient_credits','unlocked']);
    for(const role of ['anon','authenticated']){
        await db.exec(`SET ROLE ${role}`);
        await assert.rejects(db.query('SELECT public.unlock_comparison_access($1,$2,$3,$4)',[userA,fingerprint('f'),input,snapshot]),e=>e.code==='42501');
        await assert.rejects(db.query('INSERT INTO public.comparison_access(user_id,fingerprint,input,snapshot) VALUES($1,$2,$3,$4)',[userA,fingerprint('f'),input,snapshot]),e=>e.code==='42501');
        await db.exec('RESET ROLE');
    }
    await db.query("SELECT set_config('request.jwt.claim.sub',$1,false)",[userA]);await db.exec('SET ROLE authenticated');
    const visible=(await db.query('SELECT user_id FROM public.comparison_access')).rows;assert.ok(visible.length&&visible.every(r=>r.user_id===userA));await db.exec('RESET ROLE');
    assert.match(migration,/FOR UPDATE/);
    console.log('PASS: 0/9/10 credits; welcome priority/expiry; idempotent retries and queued concurrent same/different sets; shared report balance lock; rollback; 4–5 validation; RLS and service-only writes. PGlite queues one connection; production multi-connection load testing is not simulated.');
}finally{await db.close();}
