// Run only against an isolated in-memory PostgreSQL instance, never the live database.
// Usage: node scripts/test-admin-analysis-result-names.mjs <path-to-pglite-package>
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';

const packagePath = process.argv[2];
if (!packagePath) throw new Error('Provide the path to a temporary @electric-sql/pglite installation.');
const require = createRequire(import.meta.url);
const { PGlite } = require(path.resolve(packagePath));
const db = new PGlite();
try {
    await db.exec(`
        CREATE ROLE anon;
        CREATE ROLE authenticated;
        CREATE ROLE service_role BYPASSRLS;
        CREATE TABLE public.analysis_results (name text, surname text);
        GRANT SELECT ON public.analysis_results TO anon, authenticated, service_role;
        INSERT INTO public.analysis_results (name, surname) VALUES
            (' กานต์ ', 'ครอบครัวหนึ่ง'), ('กานต์', 'ครอบครัวสอง'),
            ('ณัฐ', 'หนึ่ง'), ('ณัฐ', 'สอง'),
            (NULL, 'หนึ่ง'), ('', 'สอง'), ('   ', 'สาม'),
            ('Alice', 'หนึ่ง'), ('alice', 'สอง'), ('ทดสอบ%_', 'หนึ่ง');
        INSERT INTO public.analysis_results (name, surname)
            SELECT 'ชื่อ' || lpad(i::text, 4, '0'), 'ตัวอย่าง' FROM generate_series(1, 1501) AS i;
    `);
    const migration = await readFile(new URL('./migration-admin-analysis-result-names.sql', import.meta.url), 'utf8');
    await db.exec(migration);
    await db.exec(migration); // Safe to apply again during setup.

    const query = async (search = '', page = 1, exportCsv = false) => {
        const result = await db.query('SELECT public.admin_analysis_result_names($1, $2, 50, $3) AS result', [search, page, exportCsv]);
        return result.rows[0].result;
    };
    const all = await query('', 1, true);
    assert.equal(all.total, 1506);
    assert.equal(all.names.length, 1506);
    assert.equal(new Set(all.names).size, 1506);
    assert.equal(all.names.filter((name) => name === 'กานต์').length, 1);
    assert.ok(all.names.includes('Alice') && all.names.includes('alice'));
    assert.ok(!all.names.some((name) => !name || name !== name.trim()));
    assert.deepEqual(all.names, [...all.names].sort());

    const first = await query();
    const second = await query('', 2);
    const last = await query('', 31);
    assert.equal(first.total, 1506);
    assert.equal(first.names.length, 50);
    assert.deepEqual(first.names, all.names.slice(0, 50));
    assert.deepEqual(second.names, all.names.slice(50, 100));
    assert.deepEqual(last.names, all.names.slice(1500));
    assert.deepEqual(await query('', 100), { names: [], total: 1506 });
    assert.deepEqual(await query('กานต์'), { names: ['กานต์'], total: 1 });
    assert.deepEqual(await query('ณั'), { names: ['ณัฐ'], total: 1 });
    assert.deepEqual(await query('%_'), { names: ['ทดสอบ%_'], total: 1 });
    assert.deepEqual(await query('missing'), { names: [], total: 0 });
    assert.equal((await query('ชื่อ', 25, true)).names.length, 1501);
    await assert.rejects(query('', 0), (error) => error.code === '22023');

    for (const role of ['anon', 'authenticated']) {
        await db.exec(`SET ROLE ${role}`);
        await assert.rejects(query(), (error) => error.code === '42501');
        await db.exec('RESET ROLE');
    }
    await db.exec('SET ROLE service_role');
    assert.equal((await query()).total, 1506);
    await db.exec('RESET ROLE');
    const rows = await db.query('SELECT count(*)::int AS count FROM public.analysis_results');
    assert.equal(rows.rows[0].count, 1511); // All original records remain unchanged.
    console.log('PostgreSQL migration checks passed: deduplication, whitespace, 1506 unique names, pagination, Thai/literal search, full export, grants and idempotency.');
} finally {
    await db.close();
}
