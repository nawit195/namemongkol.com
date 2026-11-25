import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
const require = createRequire(import.meta.url);
const { PGlite } = require(path.resolve(process.argv[2]));
const db = new PGlite();
let checks = 0;
const equal = (a,b) => { assert.deepEqual(a,b); checks++; };
try {
    await db.exec('CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role; ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;');
    const files = await readdir('supabase/migrations');
    await db.exec(await readFile('supabase/migrations/'+files.find(file => file.endsWith('_daily_page_traffic.sql')), 'utf8'));
    // Model existing Supabase defaults, then apply the append-only correction.
    equal((await db.query("SELECT has_table_privilege('service_role','public.page_view_events','UPDATE') AS allowed")).rows[0].allowed, true);
    const permissions = files.find(file => file.endsWith('_daily_page_traffic_permissions.sql'));
    assert.ok(permissions, 'Daily traffic permissions follow-up migration is required');
    await db.exec(await readFile('supabase/migrations/'+permissions, 'utf8'));
    for (const privilege of ['SELECT','INSERT','UPDATE','DELETE','TRUNCATE']) {
        equal((await db.query('SELECT has_table_privilege($1,$2,$3) AS allowed', ['service_role','public.page_view_events',privilege])).rows[0].allowed, ['SELECT','INSERT'].includes(privilege));
    }
    await db.exec(`INSERT INTO public.page_view_events(event_id,visit_date,page_path,visitor_hash)
        SELECT md5(i::text)::uuid,'2026-11-23','/nicknames',repeat('a',64) FROM generate_series(1,1200) i;
        INSERT INTO public.page_view_events VALUES(md5('1201')::uuid,'2026-11-23','/search',repeat('a',64),now()),
        (md5('1202')::uuid,'2026-11-23','/nicknames',repeat('b',64),now()),
        (md5('1203')::uuid,'2026-11-24','/nicknames',repeat('c',64),now());
        INSERT INTO public.page_view_events VALUES(md5('1203')::uuid,'2026-11-24','/nicknames',repeat('c',64),now()) ON CONFLICT(event_id) DO NOTHING;
        SET ROLE service_role;`);
    const report = (from,to,q='',page=1) => db.query('select public.admin_page_traffic($1::date,$2::date,$3,$4) as report',[from,to,q,page]).then(result=>result.rows[0].report);
    const data = await report('2026-11-23','2026-11-24');
    equal(data.summary,{views:1203,visitorDays:3,pages:2}); equal(data.total,3);
    equal(data.rows.find(row=>row.day==='2026-11-23'&&row.path==='/nicknames'),{day:'2026-11-23',path:'/nicknames',views:1201,visitors:2});
    equal(data.daily.find(row=>row.day==='2026-11-23'),{day:'2026-11-23',views:1202,visitors:2});
    equal((await report('2026-11-23','2026-11-24','/search')).summary,{views:1,visitorDays:1,pages:1});
    equal((await report('2026-11-23','2026-11-24','missing')).rows,[]);
    await db.exec('RESET ROLE;');
    await db.exec(`INSERT INTO public.page_view_events SELECT md5(('page'||i)::text)::uuid,'2026-11-24','/page-'||i,repeat('d',64),now() FROM generate_series(1,100) i; SET ROLE service_role;`);
    const paged = await report('2026-11-24','2026-11-24','/page-',2);equal(paged.total,100);equal(paged.rows.length,50);equal(paged.summary.views,100);equal(paged.summary.visitorDays,1);
    for(const args of [['2026-01-01','2026-03-01','',1],['2026-11-24','2026-11-23','',1],['2026-11-23','2026-11-24','',0]]) { await assert.rejects(report(...args)); checks++; }
    await db.exec('RESET ROLE; SET ROLE anon;');
    await assert.rejects(db.query('select * from public.page_view_events'));checks++;
    await assert.rejects(report('2026-11-23','2026-11-24'));checks++;
    await db.exec('RESET ROLE; SET ROLE authenticated;');
    await assert.rejects(db.query('select * from public.page_view_events'));checks++;
    await assert.rejects(report('2026-11-23','2026-11-24'));checks++;
    await assert.rejects(db.exec(`INSERT INTO public.page_view_events VALUES(gen_random_uuid(),'2026-11-24','/forged',repeat('e',64),now())`));checks++;
    console.log(`Page traffic PostgreSQL checks passed: ${checks} assertions (over 1000 views, unique daily visitors, pagination, deduplication, Supabase defaults and append-only roles).`);
} finally { await db.close(); }
