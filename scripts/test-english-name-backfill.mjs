import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { planEnglishBackfill, buildEnglishBackfillSql } from './prepare-english-name-backfill.mjs';

// Usage: node scripts/test-english-name-backfill.mjs /path/to/@electric-sql/pglite [optional-snapshot.json]
// Runs wholly in an in-memory PostgreSQL-compatible database, never Supabase.
if (!process.argv[2]) throw new Error('Supply an installed @electric-sql/pglite package path.');
const { PGlite } = createRequire(import.meta.url)(path.resolve(process.argv[2]));
const uuid = value => `00000000-0000-0000-0000-${String(value).padStart(12, '0')}`;
const fixture = {
    names: [
        ...Array.from({ length: 1205 }, (_, index) => ({
            id: uuid(index + 1), name: index === 0 ? 'นาวิน' : `ชื่อ${index}`, pronunciation: 'นา-วิน', english_name: null, meaning: `ความหมาย ${index}`,
        })),
        { id: uuid(2000), name: "ชื่อ' $english_backfill_guard$", pronunciation: 'สะ-อาด', english_name: null, meaning: "ข้อความ 'เดิม'" },
        { id: uuid(2001), name: 'ชื่อเดิม', pronunciation: 'ชื่อ-เดิม', english_name: 'Keep-Original', meaning: 'คงเดิม' },
    ],
    premium: [{ name: 'นาวิน', english_name: 'Na-Win' }],
};
const snapshot = process.argv[3] ? JSON.parse(readFileSync(process.argv[3], 'utf8')) : fixture;
const plan = planEnglishBackfill(snapshot.names, snapshot.premium);
assert(plan.changes.length > 1000, 'The transaction fixture must exceed one API page.');
const sourceChange = plan.changes.find(item => item.source === 'premium-source');
assert(sourceChange, 'The fixture must include a premium-source spelling.');
const db = new PGlite();
try {
    await db.exec(`CREATE TABLE public.auspicious_names(id uuid PRIMARY KEY,name text,pronunciation text,english_name text,meaning text); CREATE TABLE public.premium_names(name text,english_name text);`);
    await db.exec(readFileSync('supabase/migrations/20261114084445_public_names_english_review.sql', 'utf8'));
    await db.query(`INSERT INTO public.auspicious_names(id,name,pronunciation,english_name,meaning) SELECT id,name,pronunciation,english_name,meaning FROM jsonb_to_recordset($1::jsonb) AS x(id uuid,name text,pronunciation text,english_name text,meaning text)`, [JSON.stringify(snapshot.names)]);
    await db.query(`INSERT INTO public.premium_names SELECT name,english_name FROM jsonb_to_recordset($1::jsonb) AS x(name text,english_name text)`, [JSON.stringify(snapshot.premium)]);
    const originalFieldsHash = async () => (await db.query(`SELECT md5(string_agg(row(id,name,pronunciation,english_name,meaning)::text,'' ORDER BY id)) hash FROM public.auspicious_names`)).rows[0].hash;
    const before = await originalFieldsHash();
    await db.exec(buildEnglishBackfillSql(plan));
    assert.equal(await originalFieldsHash(), before, 'Published spellings, readings and meanings must remain unchanged.');
    assert.equal((await db.query(`SELECT count(*)::int n FROM public.auspicious_names WHERE english_name_draft IS NOT NULL`)).rows[0].n, plan.changes.length);
    assert.equal((await db.query(`SELECT count(*)::int n FROM public.auspicious_names WHERE english_name_draft IS NOT NULL AND english_name_status <> 'pending'`)).rows[0].n, 0);
    await db.exec(buildEnglishBackfillSql(plan));
    const rows = (await db.query('SELECT * FROM public.auspicious_names ORDER BY id')).rows;
    assert.equal(planEnglishBackfill(rows, snapshot.premium).changes.length, 0, 'Repeated planning must propose no writes.');

    // Force one eligible row back to its original state, then invalidate another.
    // The eligible row must stay empty when the whole transaction is rejected.
    const [first, last] = [plan.changes[0], plan.changes.at(-1)];
    await db.query(`UPDATE public.auspicious_names SET english_name_draft=NULL,english_name_status=NULL,english_name_source=NULL,english_name_reading=NULL WHERE id=$1`, [first.id]);
    await db.query(`UPDATE public.auspicious_names SET pronunciation=pronunciation||'-ใหม่' WHERE id=$1`, [last.id]);
    await assert.rejects(db.exec(buildEnglishBackfillSql(plan)), /English backfill snapshot changed/);
    await db.exec('ROLLBACK;');
    assert.equal((await db.query('SELECT english_name_draft FROM public.auspicious_names WHERE id=$1', [first.id])).rows[0].english_name_draft, null);

    await db.query('UPDATE public.auspicious_names SET pronunciation=$1 WHERE id=$2', [last.beforePronunciation, last.id]);
    await db.query('UPDATE public.premium_names SET english_name=$1 WHERE name=$2', ['CHANGED', sourceChange.name]);
    await assert.rejects(db.exec(buildEnglishBackfillSql(plan)), /English backfill source changed/);
    await db.exec('ROLLBACK;');
    assert.equal((await db.query('SELECT english_name_draft FROM public.auspicious_names WHERE id=$1', [first.id])).rows[0].english_name_draft, null);
    console.log(JSON.stringify({ passed: true, rows: snapshot.names.length, drafts: plan.changes.length, unchangedPublishedFields: true, replayNoOp: true, staleSnapshotRollback: true, sourceChangeRollback: true }));
} finally {
    await db.close();
}
