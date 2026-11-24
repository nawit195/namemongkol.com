import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
if (!process.argv[2]) throw new Error('Provide the temporary @electric-sql/pglite package path');
const { PGlite } = require(path.resolve(process.argv[2]));
const db = new PGlite();
const memberA = '10000000-0000-4000-8000-000000000001';
const memberB = '10000000-0000-4000-8000-000000000002';
let sequence = 100;
const id = () => `10000000-0000-4000-8000-${String(sequence++).padStart(12, '0')}`;
const catalog = JSON.parse(await readFile(new URL('../src/data/auspiciousNicknames.json', import.meta.url), 'utf8'));
const sample = { ...catalog.records[0], grade: 'A+' };
const names = Array.from({ length: 60 }, (_, index) => ({ ...sample, id: 'nn_' + (index + 1).toString(16).padStart(20, '0'), name: 'ชื่อทดสอบ' + index }));
let assertions = 0;
const equal = (a, b) => { assert.deepEqual(a, b); assertions++; };

try {
    await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;
        CREATE SCHEMA auth; CREATE TABLE auth.users(id uuid PRIMARY KEY);
        CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
        CREATE FUNCTION auth.role() RETURNS text LANGUAGE sql STABLE AS $$ SELECT current_setting('request.jwt.claim.role',true) $$;
        GRANT USAGE ON SCHEMA auth TO service_role, authenticated;
        CREATE TABLE public.user_profiles(id uuid PRIMARY KEY REFERENCES auth.users(id), credits integer NOT NULL, welcome_credits integer, welcome_credits_granted_at timestamptz);
        CREATE TABLE public.credit_transactions(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),user_id uuid,amount integer,type text,description text);
        GRANT SELECT, UPDATE ON public.user_profiles TO service_role;
        GRANT SELECT, INSERT ON public.credit_transactions TO service_role;
        INSERT INTO auth.users VALUES('${memberA}'),('${memberB}');
        INSERT INTO public.user_profiles VALUES('${memberA}',100,0,null),('${memberB}',0,0,null);
        CREATE FUNCTION guard_credits() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
            IF current_setting('app.bypass_credit_check',true) IS DISTINCT FROM 'true' THEN RAISE EXCEPTION 'Protected credits'; END IF; RETURN NEW;
        END $$;
        CREATE TRIGGER guarded_balance BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION guard_credits();`);
    await db.exec(await readFile(new URL('../supabase/migrations/20261123083028_nickname_unlocks.sql', import.meta.url), 'utf8'));
    await db.exec(await readFile(new URL('../supabase/migrations/20261123085143_private_nickname_catalog.sql', import.meta.url), 'utf8'));
    await db.query('INSERT INTO public.nickname_catalog(catalog_version,id,record) VALUES($1,$2,$3)', [catalog.version, names[0].id, JSON.stringify(names[0])]);
    const reset = async (purchased, welcome = 0, age = '1 day') => {
        await db.exec("SELECT set_config('app.bypass_credit_check','true',false)");
        await db.query('UPDATE public.user_profiles SET credits=$1,welcome_credits=$2,welcome_credits_granted_at=now()-$3::interval WHERE id=$4', [purchased, welcome, age, memberA]);
        await db.exec("SELECT set_config('app.bypass_credit_check','',false)");
    };
    const purchase = async (snapshot, request = id(), hash = sequence.toString(16).padStart(64, '0'), owner = memberA) => {
        await db.exec("SELECT set_config('request.jwt.claim.role','service_role',false); SET ROLE service_role");
        try { return (await db.query('SELECT public.unlock_nickname_batch($1,$2,$3,$4,$5,$6) AS result', [owner, request, hash, catalog.version, JSON.stringify({ group: 'aplus' }), JSON.stringify(snapshot)])).rows[0].result; }
        finally { await db.exec('RESET ROLE'); }
    };
    const balance = async () => (await db.query('SELECT credits,welcome_credits FROM public.user_profiles WHERE id=$1', [memberA])).rows[0];
    const receipt = id();
    const quoteHash = 'a'.repeat(64);
    equal((await purchase(names.slice(0, 20), receipt, quoteHash)).status, 'unlocked');
    equal(await balance(), { credits: 85, welcome_credits: 0 });
    equal((await purchase(names.slice(0, 20), receipt, quoteHash)).status, 'already_unlocked');
    equal((await purchase(names.slice(0, 20), id(), quoteHash)).status, 'already_unlocked');
    equal(await balance(), { credits: 85, welcome_credits: 0 });
    equal((await db.query('SELECT count(*)::int AS n FROM public.nickname_entitlements')).rows[0].n, 20);
    equal((await purchase(names.slice(19, 39))).status, 'stale_quote');
    equal(await balance(), { credits: 85, welcome_credits: 0 });
    equal((await purchase([names[20]])).received_count, 1);
    equal(await balance(), { credits: 70, welcome_credits: 0 });

    await reset(5, 10);
    equal((await purchase(names.slice(21, 24))).remaining_credits, 0);
    equal(await balance(), { credits: 0, welcome_credits: 0 });
    await reset(14, 100, '31 days');
    equal((await purchase(names.slice(24, 26))).status, 'insufficient_credits');
    equal(await balance(), { credits: 14, welcome_credits: 100 });
    await reset(15, 100, '31 days');
    equal((await purchase(names.slice(24, 26))).status, 'unlocked');
    equal(await balance(), { credits: 0, welcome_credits: 0 });
    equal((await db.query("SELECT count(*)::int AS n FROM public.credit_transactions WHERE type='expire'")).rows[0].n, 1);

    // A ledger failure rolls back the wallet debit, snapshots and per-name rights.
    await reset(30);
    await db.exec("CREATE FUNCTION fail_ledger() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'Simulated ledger failure'; END $$; CREATE TRIGGER fail_ledger BEFORE INSERT ON public.credit_transactions FOR EACH ROW EXECUTE FUNCTION fail_ledger()");
    const failedId = id();
    await assert.rejects(purchase(names.slice(26, 29), failedId), /Simulated ledger failure/); assertions++;
    equal(await balance(), { credits: 30, welcome_credits: 0 });
    equal((await db.query('SELECT count(*)::int AS n FROM public.nickname_unlocks WHERE request_id=$1', [failedId])).rows[0].n, 0);
    await db.exec('DROP TRIGGER fail_ledger ON public.credit_transactions');
    await assert.rejects(purchase([]), /1 to 20/); assertions++;
    await assert.rejects(purchase(names.slice(26, 47)), /1 to 20/); assertions++;
    await assert.rejects(purchase([names[26], names[26]]), /Invalid nickname snapshot/); assertions++;

    await db.exec("SELECT set_config('request.jwt.claim.role','service_role',false); SET ROLE service_role");
    const duplicateId = id();
    const argumentsList = [memberA, duplicateId, 'b'.repeat(64), catalog.version, '{}', JSON.stringify(names.slice(26, 29))];
    const simultaneous = await Promise.all([1, 2].map(() => db.query('SELECT public.unlock_nickname_batch($1,$2,$3,$4,$5,$6) AS result', argumentsList)));
    await db.exec('RESET ROLE');
    equal(simultaneous.map(item => item.rows[0].result.status).sort(), ['already_unlocked', 'unlocked']);
    equal(await balance(), { credits: 15, welcome_credits: 0 });

    // A different authenticated user cannot read another customer's snapshots.
    await db.query("SELECT set_config('request.jwt.claim.sub',$1,false)", [memberB]);
    await db.exec('SET ROLE authenticated');
    await assert.rejects(db.query('SELECT * FROM public.nickname_catalog'), /permission denied/); assertions++;
    equal((await db.query('SELECT count(*)::int AS n FROM public.nickname_unlocks')).rows[0].n, 0);
    equal((await db.query('SELECT count(*)::int AS n FROM public.nickname_entitlements')).rows[0].n, 0);
    await assert.rejects(db.query('SELECT public.unlock_nickname_batch($1,$2,$3,$4,$5,$6)', argumentsList), /permission denied/); assertions++;
    await assert.rejects(db.query('DELETE FROM public.nickname_entitlements'), /permission denied/); assertions++;
    await db.exec('RESET ROLE');
    await db.query("SELECT set_config('request.jwt.claim.sub',$1,false)", [memberA]);
    await db.exec('SET ROLE authenticated');
    assert.ok((await db.query('SELECT count(*)::int AS n FROM public.nickname_unlocks')).rows[0].n > 0); assertions++;
    await db.exec('RESET ROLE; SET ROLE anon');
    await assert.rejects(db.query('SELECT * FROM public.nickname_catalog'), /permission denied/); assertions++;
    await assert.rejects(db.query('SELECT * FROM public.nickname_unlocks'), /permission denied/); assertions++;
    await db.exec('RESET ROLE');
    console.log(`Nickname PostgreSQL checks passed: ${assertions} assertions (billing, retries, partial batches, rollback, RLS).`);
} finally {
    await db.close();
}
