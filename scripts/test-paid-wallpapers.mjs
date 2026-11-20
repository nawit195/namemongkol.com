import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { assets as financeAssets } from './finance-wallpaper-assets.mjs';
const require = createRequire(import.meta.url);
if (!process.argv[2]) throw new Error('Provide the temporary @electric-sql/pglite package path');
const { PGlite } = require(path.resolve(process.argv[2]));
const db = new PGlite();
const memberA = '10000000-0000-4000-8000-000000000001';
const memberB = '10000000-0000-4000-8000-000000000002';
let sequence = 100;
const id = () => `10000000-0000-4000-8000-${String(sequence++).padStart(12, '0')}`;
const hashes = {
    ...Object.fromEntries(financeAssets.map(asset => [asset.id, asset.sha256])),
    'eight-horses-jade-mist': 'a7825179d4d6efa270deed159acba8bab7e6c91b2ab9cc8393f5763193b7995a',
    'eight-horses-waterfall': '42fafd2566604dbffafec8e24ba3e06cacc9fb52cd4925e3ba97a071e0ae687c',
};
const product = 'eight-horses-jade-mist';
try {
    await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;
        CREATE SCHEMA auth; CREATE TABLE auth.users(id uuid PRIMARY KEY);
        CREATE SCHEMA storage; CREATE TABLE storage.buckets(id text PRIMARY KEY,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
        CREATE TABLE storage.objects(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),bucket_id text); ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
        GRANT USAGE ON SCHEMA storage TO anon,authenticated; GRANT SELECT,INSERT ON storage.objects TO anon,authenticated;
        CREATE POLICY future_broad_access ON storage.objects FOR ALL TO anon,authenticated USING(true) WITH CHECK(true);
        CREATE TABLE public.user_profiles(id uuid PRIMARY KEY REFERENCES auth.users(id),credits integer,welcome_credits integer,welcome_credits_granted_at timestamptz);
        CREATE TABLE public.credit_transactions(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),user_id uuid,amount integer,type text,description text);
        GRANT SELECT,UPDATE ON public.user_profiles TO service_role;
        GRANT INSERT,SELECT ON public.credit_transactions TO service_role;
        INSERT INTO auth.users VALUES('${memberA}'),('${memberB}');
        INSERT INTO public.user_profiles VALUES('${memberA}',15,0,null),('${memberB}',15,0,null);
        CREATE FUNCTION guard_credits() RETURNS trigger LANGUAGE plpgsql AS $$BEGIN
            IF current_setting('app.bypass_credit_check',true) IS DISTINCT FROM 'true' THEN RAISE EXCEPTION 'Protected credits'; END IF; RETURN NEW;
        END$$;
        CREATE TRIGGER guarded_balance BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION guard_credits();`);
    await db.exec(await readFile(new URL('../supabase/migrations/20261119033338_paid_horse_wallpapers.sql', import.meta.url), 'utf8'));
    assert.equal((await db.query('SELECT count(*)::int AS n FROM public.wallpaper_products WHERE active')).rows[0].n, 0);
    assert.equal((await db.query('SELECT public FROM storage.buckets')).rows[0].public, false);
    await db.exec('UPDATE public.wallpaper_products SET active=true');
    const financeMigration = await readFile(new URL('../supabase/migrations/20261120052112_paid_finance_wallpapers.sql', import.meta.url), 'utf8');
    await db.exec(financeMigration);
    assert.equal((await db.query("SELECT count(*)::int AS n FROM public.wallpaper_products WHERE active AND id LIKE 'eight-horses-%'")).rows[0].n,4);
    assert.equal((await db.query("SELECT count(*)::int AS n FROM public.wallpaper_products WHERE NOT active AND id LIKE 'finance-%'")).rows[0].n,4);
    // Rerunning the catalog migration preserves existing entries and active states.
    await db.exec(financeMigration);
    await db.exec("UPDATE public.wallpaper_products SET active=true WHERE id LIKE 'finance-%'");
    const reset = async (purchased, welcome = 0, age = '1 day') => {
        await db.exec(`SELECT set_config('app.bypass_credit_check','true',false)`);
        await db.query(`UPDATE public.user_profiles SET credits=$1,welcome_credits=$2,welcome_credits_granted_at=now()-$3::interval WHERE id=$4`, [purchased,welcome,age,memberA]);
        await db.exec(`SELECT set_config('app.bypass_credit_check','',false)`);
    };
    const purchase = async (request = id(), retry = false, user = memberA, image = product, hash = hashes[image]) => {
        await db.exec('SET ROLE service_role');
        try { return (await db.query('SELECT public.purchase_wallpaper_download($1,$2,$3,$4,$5) AS result', [user,image,request,hash,retry])).rows[0].result; }
        finally { await db.exec('RESET ROLE'); }
    };
    for (const credits of [0,14]) { await reset(credits); assert.equal((await purchase()).status, 'insufficient_credits'); }
    await reset(15);
    const firstId = id();
    const first = await purchase(firstId);
    assert.equal(first.status,'charged'); assert.equal(first.remaining_credits,0);
    assert.equal((await purchase(firstId)).status,'retry');
    assert.equal((await purchase(firstId,true)).status,'retry');
    assert.equal((await purchase(id(),true)).status,'attempt_not_found');
    assert.equal((await purchase(firstId,true,memberA,'eight-horses-waterfall')).status,'request_conflict');
    assert.equal((await purchase(firstId,true,memberB)).status,'attempt_not_found');
    assert.equal((await purchase(firstId,false,memberB)).status,'charged');
    assert.equal((await db.query(`SELECT count(*)::int AS n FROM public.credit_transactions WHERE user_id=$1 AND type='spend'`,[memberA])).rows[0].n,1);
    assert.equal((await purchase()).status,'insufficient_credits');
    await reset(30);
    assert.equal((await purchase()).status,'charged');
    assert.equal((await purchase()).status,'charged'); // Intentional separate downloads each cost 15.
    await db.query(`UPDATE public.wallpaper_downloads SET created_at=now()-interval '31 minutes',expires_at=now()-interval '1 minute' WHERE user_id=$1 AND request_id=$2`,[memberA,firstId]);
    assert.equal((await purchase(firstId)).status,'expired');
    await reset(5,10);
    assert.equal((await purchase()).remaining_credits,0);
    assert.deepEqual((await db.query('SELECT credits,welcome_credits FROM public.user_profiles WHERE id=$1',[memberA])).rows[0],{credits:0,welcome_credits:0});
    await reset(14,100,'31 days');
    assert.equal((await purchase()).status,'insufficient_credits');
    await reset(15,100,'31 days');
    assert.equal((await purchase()).remaining_credits,0);
    assert.equal((await db.query(`SELECT count(*)::int AS n FROM public.credit_transactions WHERE type='expire'`)).rows[0].n,1);
    await reset(15);
    assert.equal((await purchase(id(),false,memberA,product,'f'.repeat(64))).status,'asset_changed');
    assert.equal((await db.query('SELECT credits FROM public.user_profiles WHERE id=$1',[memberA])).rows[0].credits,15);
    await db.exec(`CREATE FUNCTION fail_ledger() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'Simulated ledger failure'; END $$;
        CREATE TRIGGER fail_ledger BEFORE INSERT ON public.credit_transactions FOR EACH ROW EXECUTE FUNCTION fail_ledger();`);
    const failedId = id();
    await assert.rejects(purchase(failedId), /Simulated ledger failure/);
    assert.equal((await db.query('SELECT credits FROM public.user_profiles WHERE id=$1',[memberA])).rows[0].credits,15);
    assert.equal((await db.query('SELECT count(*)::int AS n FROM public.wallpaper_downloads WHERE request_id=$1',[failedId])).rows[0].n,0);
    await db.exec('DROP TRIGGER fail_ledger ON public.credit_transactions');
    await reset(30);
    const simultaneous = id();
    await db.exec('SET ROLE service_role');
    const duplicateResults = await Promise.all([1,2].map(() => db.query('SELECT public.purchase_wallpaper_download($1,$2,$3,$4,false) AS result',[memberA,product,simultaneous,hashes[product]])));
    await db.exec('RESET ROLE');
    assert.deepEqual(duplicateResults.map(result => result.rows[0].result.status).sort(), ['charged','retry']);
    assert.equal((await db.query('SELECT credits FROM public.user_profiles WHERE id=$1',[memberA])).rows[0].credits,15);
    for (const asset of financeAssets) {
        for (const credits of [0,14]) {
            await reset(credits);
            assert.equal((await purchase(id(),false,memberA,asset.id)).status,'insufficient_credits');
        }
        await reset(15);
        const receipt = id();
        assert.equal((await purchase(receipt,false,memberA,asset.id)).status,'charged');
        assert.equal((await purchase(receipt,true,memberA,asset.id)).status,'retry');
        assert.equal((await purchase(receipt,true,memberA,product)).status,'request_conflict');
        assert.equal((await purchase(receipt,true,memberB,asset.id)).status,'attempt_not_found');
        assert.equal((await db.query('SELECT credits FROM public.user_profiles WHERE id=$1',[memberA])).rows[0].credits,0);
        assert.equal((await db.query('SELECT count(*)::int AS n FROM public.wallpaper_downloads WHERE user_id=$1 AND request_id=$2',[memberA,receipt])).rows[0].n,1);
        await db.query("UPDATE public.wallpaper_downloads SET created_at=now()-interval '31 minutes',expires_at=now()-interval '1 minute' WHERE user_id=$1 AND request_id=$2",[memberA,receipt]);
        assert.equal((await purchase(receipt,true,memberA,asset.id)).status,'expired');
    }
    await db.exec(`INSERT INTO storage.objects(bucket_id) VALUES ('premium-wallpaper-originals'),('wallpapers')`);
    for (const role of ['anon','authenticated']) {
        await db.exec(`SET ROLE ${role}`);
        await assert.rejects(db.query('SELECT public.purchase_wallpaper_download($1,$2,$3,$4,false)',[memberA,product,id(),hashes[product]]),/permission denied/);
        await assert.rejects(db.query('SELECT * FROM public.wallpaper_downloads'),/permission denied/);
        await assert.rejects(db.query('SELECT * FROM public.wallpaper_products'),/permission denied/);
        assert.equal((await db.query('SELECT count(*)::int AS n FROM storage.objects')).rows[0].n,1);
        await assert.rejects(db.query(`INSERT INTO storage.objects(bucket_id) VALUES ('premium-wallpaper-originals')`),/row-level security/);
        await db.exec('RESET ROLE');
    }
    console.log('PASS: horse and finance catalogs, additive migration, 0/14/15 credits, idempotency, explicit new downloads, owner isolation, retry expiry, welcome priority/expiry, checksum, rollback, role permissions.');
} finally { await db.close(); }
