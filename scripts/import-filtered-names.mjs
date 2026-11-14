import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

export const nameKey = value => value.normalize('NFC').replace(/[\s\u200b\u200c\u200d\ufeff]+/g, '');
const blank = value => value == null || !String(value).trim();
export function planImport(records, existing) {
    const map = new Map();
    for (const row of existing) {
        const key = nameKey(row.name);
        if (map.has(key)) throw new Error(`Ambiguous database name: ${row.name}`);
        map.set(key, row);
    }
    const seen = new Set(), changes = [], conflicts = [], skipped = [];
    const stats = { source: records.length, newNames: 0, existingNames: 0, updatedNames: 0, pronunciation: 0, meaning: 0, englishName: 0 };
    for (const item of records) {
        const key = nameKey(item.name);
        if (!key || seen.has(key)) throw new Error('Duplicate or empty source name');
        seen.add(key);
        if (item.englishName && !/^[A-Za-z][A-Za-z .'-]*$/.test(item.englishName)) throw new Error(`Invalid English: ${item.name}`);
        const before = map.get(key);
        if (before) stats.existingNames++;
        if (before?.publication_status === 'hidden') { skipped.push({ name: item.name, reason: 'hidden' }); continue; }
        /** @type {Record<string, string>} */
        const patch = {};
        for (const [source, column, status] of [['pronunciation', 'pronunciation', 'pronunciation_status'], ['meaning', 'meaning', 'meaning_status'], ['englishName', 'english_name', null]]) {
            if (!item[source]) continue;
            const state = status && before?.[status];
            if (before && (!blank(before[column]) || state === 'approved' || state === 'rejected' || (status && !blank(before[`${column}_draft`])))) {
                if (before[column] !== item[source]) conflicts.push({ name: item.name, field: column, reason: 'preserve-existing-or-review' });
                continue;
            }
            patch[column] = item[source];
            stats[source]++;
            if (status && before && status in before) patch[status] = 'pending';
        }
        if (!before) { stats.newNames++; changes.push({ before: null, name: item.name, patch: { name: item.name, gender: 'neutral', ...patch } }); }
        else if (Object.keys(patch).length) { stats.updatedNames++; changes.push({ before, name: before.name, patch }); }
    }
    return { stats, changes, conflicts, skipped };
}
const quote = value => `'${String(value).replace(/'/g, "''")}'`;
const guard = body => {
    let delimiter = '$import_guard$';
    while (body.includes(delimiter)) delimiter = delimiter.slice(0, -1) + 'x$';
    return `DO ${delimiter} ${body} ${delimiter};`;
};
export function buildImportSql(plan, table = 'auspicious_names') {
    if (!['auspicious_names', 'premium_names'].includes(table)) throw new Error('Invalid import table');
    const statements = ['BEGIN;', "SET LOCAL lock_timeout = '5s';", `LOCK TABLE public.${table} IN SHARE ROW EXCLUSIVE MODE;`];
    for (const change of plan.changes) {
        const entries = Object.entries(change.patch);
        if (!change.before) {
            statements.push(guard(`BEGIN IF EXISTS (SELECT 1 FROM public.${table} WHERE regexp_replace(normalize(name, NFC), '[\\s​‌‍﻿]+', '', 'g') = ${quote(nameKey(change.name))}) THEN RAISE EXCEPTION 'Import snapshot changed'; END IF; END`));
            statements.push(`INSERT INTO public.${table} (${entries.map(([key]) => key).join(',')}) VALUES (${entries.map(([, value]) => quote(value)).join(',')});`);
        } else {
            const strip = 'english_name' in change.before ? '' : " - 'english_name'";
            statements.push(guard(`BEGIN IF NOT EXISTS (SELECT 1 FROM public.${table} n WHERE id=${quote(change.before.id)} AND (to_jsonb(n)${strip})=${quote(JSON.stringify(change.before))}::jsonb) THEN RAISE EXCEPTION 'Import snapshot changed'; END IF; END`));
            statements.push(`UPDATE public.${table} SET ${entries.map(([key, value]) => `${key}=${quote(value)}`).join(',')} WHERE id=${quote(change.before.id)};`);
        }
    }
    statements.push('COMMIT;');
    return statements.join('\n');
}
async function main() {
    dotenv.config({ path: '.env.local', quiet: true });
    const source = JSON.parse(fs.readFileSync('scripts/data/filtered-names-ab-2026-11-14.json', 'utf8'));
    if (source.sheet !== 'A-B' || source.records.length !== 1003) throw new Error('Unexpected source');
    const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
    const existing = [];
    for (let from = 0;; from += 1000) {
        const { data, error } = await client.from('auspicious_names').select('*').order('id').range(from, from + 999);
        if (error) throw new Error(error.message);
        existing.push(...data);
        if (data.length < 1000) break;
    }
    const directory = path.resolve('scratch/filtered-names-import');
    if (process.argv.includes('--verify')) {
        const previous = JSON.parse(fs.readFileSync(path.join(directory, 'latest-plan.json'), 'utf8'));
        const applied = JSON.parse(fs.readFileSync(previous.backup, 'utf8'));
        const byName = new Map(existing.map(row => [nameKey(row.name), row]));
        for (const change of applied.changes) {
            const after = byName.get(nameKey(change.name));
            if (!after) throw new Error(`Missing imported name: ${change.name}`);
            for (const [key, value] of Object.entries({ ...change.before, ...change.patch })) {
                if (key !== 'updated_at' && JSON.stringify(after[key]) !== JSON.stringify(value)) throw new Error(`Verification mismatch: ${change.name} ${key}`);
            }
        }
        const repeat = planImport(source.records, existing);
        if (repeat.changes.length) throw new Error('Repeat import is not empty');
        const result = { verified: true, databaseTotal: existing.length, importedNames: source.records.length, ...applied.stats, repeatChanges: 0 };
        fs.writeFileSync(path.join(directory, 'verification.json'), JSON.stringify(result, null, 2));
        console.log(JSON.stringify(result));
        return;
    }
    const plan = planImport(source.records, existing);
    fs.mkdirSync(directory, { recursive: true });
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const file = path.join(directory, `${stamp}.json`);
    fs.writeFileSync(file, JSON.stringify({ source: { sha256: source.sha256, sheet: source.sheet }, ...plan }, null, 2));
    fs.writeFileSync(path.join(directory, 'latest.sql'), buildImportSql(plan));
    fs.writeFileSync(path.join(directory, 'latest-plan.json'), JSON.stringify({ backup: file, stats: plan.stats, conflicts: plan.conflicts, skipped: plan.skipped }, null, 2));
    console.log(JSON.stringify({ ...plan.stats, preservedConflicts: plan.conflicts.length, skipped: plan.skipped.length, backup: file }));
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) main().catch(error => { console.error(error.message); process.exitCode = 1; });
