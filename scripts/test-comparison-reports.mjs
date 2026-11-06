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
const input = { names: ['ปัญญา', 'กานต์'], surname: '', day: 'monday' };
const snapshot = { input, rows: [{ name: 'ปัญญา' }, { name: 'กานต์' }], formulaVersion: 'fixture-v1' };
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
        INSERT INTO public.user_profiles VALUES('${userA}',5,0,null),('${userB}',5,0,null);
        CREATE FUNCTION public.guard_test_credits() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
          IF current_setting('app.bypass_credit_check',true) IS DISTINCT FROM 'true' THEN RAISE EXCEPTION 'Protected balance'; END IF; RETURN NEW;
        END $$;
        CREATE TRIGGER guard_test BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION public.guard_test_credits();
    `);
    const migration = await readFile(new URL('../supabase/migrations/20261106100738_comparison_reports.sql', import.meta.url), 'utf8');
    await db.exec(migration);
    await db.exec(await readFile(new URL('../supabase/migrations/20261106103315_comparison_report_snapshot_limit.sql', import.meta.url), 'utf8'));
    const purchase = async (key, user = userA, data = snapshot) => {
        await db.exec('SET ROLE service_role');
        try { return (await db.query('SELECT public.unlock_comparison_report($1,$2,$3,$4) AS result', [user, fingerprint(key), input, data])).rows[0].result; }
        finally { await db.exec('RESET ROLE'); }
    };
    const reset = async (credits, welcome = 0, age = '1 day') => {
        await db.exec(`SELECT set_config('app.bypass_credit_check','true',false)`);
        await db.query(`UPDATE public.user_profiles SET credits=$1,welcome_credits=$2,welcome_credits_granted_at=now()-$3::interval WHERE id=$4`, [credits,welcome,age,userA]);
        await db.exec(`SELECT set_config('app.bypass_credit_check','',false)`);
    };
    for (const credits of [0,4]) {
        await reset(credits);
        assert.equal((await purchase('a')).status,'insufficient_credits');
    }
    await reset(5);
    const first = await purchase('a');
    assert.equal(first.status,'unlocked'); assert.equal(first.remaining_credits,0);
    assert.equal((await purchase('a')).status,'already_unlocked');
    assert.equal((await purchase('a')).report.id,first.report.id);
    assert.equal((await db.query(`SELECT count(*)::integer AS count FROM public.credit_transactions WHERE type='spend' AND user_id=$1`,[userA])).rows[0].count,1);
    assert.equal((await purchase('b')).status,'insufficient_credits');
    assert.equal((await purchase('a',userB)).status,'unlocked'); // Ownership is per account.
    await reset(3,2);
    assert.equal((await purchase('c')).remaining_credits,0);
    assert.deepEqual((await db.query('SELECT credits,welcome_credits FROM public.user_profiles WHERE id=$1',[userA])).rows[0],{credits:0,welcome_credits:0});
    await reset(4,100,'31 days');
    assert.equal((await purchase('d')).status,'insufficient_credits');
    await reset(5,100,'31 days');
    assert.equal((await purchase('d')).remaining_credits,0);
    assert.equal((await db.query(`SELECT count(*)::integer AS count FROM public.credit_transactions WHERE type='expire'`,[])).rows[0].count,1);

    // Force a late failure after balance update and report INSERT: everything must roll back.
    await reset(5);
    await db.exec(`CREATE FUNCTION fail_report_transaction() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'Simulated ledger failure'; END $$;
        CREATE TRIGGER simulated_failure BEFORE INSERT ON public.credit_transactions FOR EACH ROW EXECUTE FUNCTION fail_report_transaction();`);
    await assert.rejects(purchase('e'), /Simulated ledger failure/);
    assert.equal((await db.query('SELECT credits FROM public.user_profiles WHERE id=$1',[userA])).rows[0].credits,5);
    assert.equal((await db.query('SELECT count(*)::integer AS count FROM public.comparison_reports WHERE fingerprint=$1',[fingerprint('e')])).rows[0].count,0);
    await db.exec('DROP TRIGGER simulated_failure ON public.credit_transactions');
    assert.equal((await purchase('e')).status,'unlocked');
    const old = await purchase('e',userA,{...snapshot,formulaVersion:'newer'});
    assert.equal(old.report.snapshot.formulaVersion,'fixture-v1');
    assert.equal(old.status,'already_unlocked');

    // Concurrent callers through PGlite's single-connection queue; the production row lock
    // provides the same serialization across PostgreSQL connections (not load-tested here).
    await reset(5);
    const rawPurchase = key => db.query('SELECT public.unlock_comparison_report($1,$2,$3,$4) AS result',[userA,fingerprint(key),input,snapshot]);
    await db.exec('SET ROLE service_role');
    const duplicateCalls = await Promise.all([rawPurchase('f'),rawPurchase('f')]);
    await db.exec('RESET ROLE');
    assert.deepEqual(duplicateCalls.map(result=>result.rows[0].result.status).sort(),['already_unlocked','unlocked']);
    assert.equal((await db.query('SELECT count(*)::integer AS count FROM public.comparison_reports WHERE fingerprint=$1',[fingerprint('f')])).rows[0].count,1);
    await reset(5);
    await db.exec('SET ROLE service_role');
    const differentSets = await Promise.all([rawPurchase('0'),rawPurchase('1')]);
    await db.exec('RESET ROLE');
    assert.deepEqual(differentSets.map(result=>result.rows[0].result.status).sort(),['insufficient_credits','unlocked']);
    assert.equal((await db.query('SELECT credits FROM public.user_profiles WHERE id=$1',[userA])).rows[0].credits,0);

    // The report may legitimately exceed 250 KB at the form's 100-character limit.
    await reset(5);
    const largeSnapshot = { ...snapshot, fixtureDescription: 'ก'.repeat(200000) };
    assert.equal((await purchase('9',userA,largeSnapshot)).status,'unlocked');

    for (const role of ['anon','authenticated']) {
        await db.exec(`SET ROLE ${role}`);
        await assert.rejects(db.query('SELECT public.unlock_comparison_report($1,$2,$3,$4)',[userA,fingerprint('f'),input,snapshot]),error=>error.code==='42501');
        await assert.rejects(db.query('INSERT INTO public.comparison_reports(user_id,fingerprint,input,snapshot) VALUES($1,$2,$3,$4)',[userA,fingerprint('f'),input,snapshot]),error=>error.code==='42501');
        await db.exec('RESET ROLE');
    }
    await db.query(`SELECT set_config('request.jwt.claim.sub',$1,false)`,[userA]);
    await db.exec('SET ROLE authenticated');
    const visible = (await db.query('SELECT user_id FROM public.comparison_reports')).rows;
    assert.ok(visible.length>0 && visible.every(row=>row.user_id===userA));
    await db.exec('RESET ROLE');
    assert.match(migration,/FOR UPDATE/i);
    console.log('PASS: 0/4/5 credits, welcome priority/expiry, concurrent queued requests, idempotent retry, immutable snapshots, rollback, owner RLS, service-only RPC and protected writes.');
} finally { await db.close(); }
