import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { romanizeReading } from './lib/thai-romanization.mjs';

const GENERATED_SOURCE = 'rtgs-reading-v1';
const REVIEW_FIELDS = ['publication_status', 'pronunciation_status', 'english_name_status', 'english_name_source', 'english_name_reading'];
const keyOf = value => String(value ?? '').normalize('NFC').replace(/[\s\u200b\u200c\u200d\ufeff]+/gu, '');
const blank = value => value == null || !String(value).trim();
const validEnglish = value => typeof value === 'string' && value.length <= 180 && /^[A-Za-z]+(?:[ .'-][A-Za-z]+)*$/u.test(value);
const sha256 = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');

/** Prepare suggestions only. No existing spelling or linguistic review is approved here. */
export function planEnglishBackfill(names, premium = [], romanizer = romanizeReading) {
    const premiumByName = new Map();
    for (const row of premium) {
        const nameKey = keyOf(row.name);
        const english = typeof row.english_name === 'string' ? row.english_name.normalize('NFC').trim() : '';
        if (!nameKey || !english) continue;
        const values = premiumByName.get(nameKey) ?? new Set();
        values.add(english);
        premiumByName.set(nameKey, values);
    }
    const seenIds = new Set(), seenNames = new Set(), changes = [], skipped = [];
    const stats = { total: names.length, existing: 0, existingDrafts: 0, missing: 0, fromPremium: 0, fromRomanization: 0, proposed: 0, skipped: 0 };
    for (const row of names) {
        const id = String(row.id ?? ''), nameKey = keyOf(row.name);
        if (!id || !nameKey || seenIds.has(id) || seenNames.has(nameKey)) throw new Error('Duplicate or empty public name/id in snapshot');
        seenIds.add(id); seenNames.add(nameKey);
        if (!blank(row.english_name)) { stats.existing++; continue; }
        stats.missing++;
        if (!blank(row.english_name_draft)) { stats.existingDrafts++; continue; }
        const skip = (reason, issues = []) => skipped.push({ id, name: row.name, pronunciation: row.pronunciation ?? null, reason, issues });
        if (row.publication_status === 'hidden') { skip('hidden'); continue; }
        if (row.pronunciation_status === 'rejected') { skip('rejected-pronunciation'); continue; }
        if (row.english_name_status === 'approved' || row.english_name_status === 'rejected') { skip('preserve-reviewed-english'); continue; }
        const premiumValues = premiumByName.get(nameKey);
        if (premiumValues?.size > 1) { skip('conflicting-premium-spellings'); continue; }
        const premiumEnglish = premiumValues?.values().next().value;
        let englishName, source, reading = null;
        if (premiumEnglish && validEnglish(premiumEnglish)) {
            englishName = premiumEnglish; source = 'premium-source'; stats.fromPremium++;
        } else {
            if (blank(row.pronunciation)) { skip('missing-pronunciation'); continue; }
            const result = romanizer(row.pronunciation);
            if (!result.englishName || !validEnglish(result.englishName) || result.issues?.length) {
                skip('pronunciation-needs-review', result.issues ?? ['invalid-romanization']); continue;
            }
            englishName = result.englishName; source = GENERATED_SOURCE; reading = row.pronunciation; stats.fromRomanization++;
        }
        changes.push({
            id, name: row.name,
            beforeEnglish: row.english_name ?? null,
            beforeDraft: row.english_name_draft ?? null,
            beforePronunciation: row.pronunciation ?? null,
            beforeReview: Object.fromEntries(REVIEW_FIELDS.map(field => [field, row[field] ?? null])),
            englishName, status: 'pending', source, reading,
        });
    }
    stats.proposed = changes.length; stats.skipped = skipped.length;
    return { version: GENERATED_SOURCE, snapshotChecksum: sha256(names), sourceChecksum: sha256(premium), stats, changes, skipped };
}

const quote = value => `'${String(value).replace(/'/gu, "''")}'`;
function doBlock(body) {
    let delimiter = '$english_backfill_guard$';
    while (body.includes(delimiter)) delimiter = delimiter.slice(0, -1) + 'x$';
    return `DO ${delimiter}\n${body}\n${delimiter};`;
}

/** Guard the entire batch before updating; exact replays are harmless. */
export function buildEnglishBackfillSql(plan) {
    if (!Array.isArray(plan.changes)) throw new Error('Missing changes');
    for (const item of plan.changes) {
        if (!item.id || !item.name || !validEnglish(item.englishName) || item.status !== 'pending'
            || !['premium-source', GENERATED_SOURCE].includes(item.source)
            || (item.source === GENERATED_SOURCE && (!item.reading || item.reading !== item.beforePronunciation))) {
            throw new Error('Unsafe English backfill change');
        }
    }
    if (!plan.changes.length) return 'BEGIN;\nCOMMIT;';
    const payload = quote(JSON.stringify(plan.changes));
    const jsonKey = key => quote(key);
    const beforeReview = REVIEW_FIELDS.map(field => `(to_jsonb(n)->>${jsonKey(field)}) IS NOT DISTINCT FROM (s."beforeReview"->>${jsonKey(field)})`).join('\n          AND ');
    const matchedNameAndReading = `n.id::text=s.id AND n.name=s.name AND n.pronunciation IS NOT DISTINCT FROM s."beforePronunciation"`;
    const previouslyApplied = `n.english_name IS NOT DISTINCT FROM s."beforeEnglish" AND n.english_name_draft=s."englishName" AND n.english_name_status=s.status AND n.english_name_source=s.source AND n.english_name_reading IS NOT DISTINCT FROM s.reading`;
    const premiumKeySql = column => `regexp_replace(normalize(${column}, NFC), '[\\s​‌‍﻿]+', '', 'g')`;
    return [
        'BEGIN;',
        "SET LOCAL lock_timeout = '5s';",
        'LOCK TABLE public.auspicious_names IN SHARE ROW EXCLUSIVE MODE;',
        `CREATE TEMP TABLE english_backfill_stage ON COMMIT DROP AS SELECT * FROM jsonb_to_recordset(${payload}::jsonb) AS x(id text, name text, "beforeEnglish" text, "beforeDraft" text, "beforePronunciation" text, "beforeReview" jsonb, "englishName" text, status text, source text, reading text);`,
        doBlock(`BEGIN
    IF (SELECT count(*) FROM english_backfill_stage) <> ${plan.changes.length}
       OR EXISTS (SELECT id FROM english_backfill_stage GROUP BY id HAVING count(*) > 1)
       OR EXISTS (
        SELECT 1 FROM english_backfill_stage s LEFT JOIN public.auspicious_names n ON n.id::text=s.id
        WHERE NOT COALESCE((${matchedNameAndReading}) AND (
          (n.english_name IS NOT DISTINCT FROM s."beforeEnglish" AND n.english_name_draft IS NOT DISTINCT FROM s."beforeDraft" AND ${beforeReview})
          OR (${previouslyApplied})
        ), false)
       ) THEN RAISE EXCEPTION 'English backfill snapshot changed'; END IF;
    IF EXISTS (
        SELECT 1 FROM english_backfill_stage s WHERE s.source='premium-source' AND NOT EXISTS (
          SELECT 1 FROM public.premium_names p WHERE ${premiumKeySql('p.name')}=${premiumKeySql('s.name')} AND btrim(p.english_name)=s."englishName"
        )
    ) THEN RAISE EXCEPTION 'English backfill source changed'; END IF;
END`),
        `UPDATE public.auspicious_names n SET english_name_draft=s."englishName", english_name_status=s.status, english_name_source=s.source, english_name_reading=s.reading
FROM english_backfill_stage s WHERE n.id::text=s.id AND nullif(btrim(n.english_name),'') IS NULL AND nullif(btrim(n.english_name_draft),'') IS NULL;`,
        'COMMIT;',
    ].join('\n');
}

async function main() {
    const input = path.resolve(process.argv[2] ?? 'scratch/english-names/before.json');
    const directory = path.resolve(process.argv[3] ?? 'scratch/english-names');
    const snapshot = JSON.parse(fs.readFileSync(input, 'utf8'));
    const plan = planEnglishBackfill(snapshot.names, snapshot.premium);
    fs.mkdirSync(directory, { recursive: true });
    fs.writeFileSync(path.join(directory, 'plan.json'), JSON.stringify(plan, null, 2));
    fs.writeFileSync(path.join(directory, 'backfill.sql'), buildEnglishBackfillSql(plan));
    fs.writeFileSync(path.join(directory, 'needs-review.json'), JSON.stringify(plan.skipped, null, 2));
    console.log(JSON.stringify({ ...plan.stats, snapshotChecksum: plan.snapshotChecksum, sourceChecksum: plan.sourceChecksum }));
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) main().catch(error => { console.error(error.message); process.exitCode = 1; });
