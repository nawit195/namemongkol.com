// Read-only verification of every existing row and imported field.
import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { nameKey } from './import-filtered-names.mjs';
import { planPremiumImport } from './import-premium-aplus.mjs';

dotenv.config({ path: '.env.local', quiet: true });
const [sourcePath, directoryPath] = process.argv.slice(2);
if (!sourcePath || !directoryPath) throw new Error('Provide A+ manifest and backup directory');
const directory = path.resolve(directoryPath);
const source = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
const before = JSON.parse(fs.readFileSync(path.join(directory, 'before.json'), 'utf8'));
const plan = JSON.parse(fs.readFileSync(path.join(directory, 'plan.json'), 'utf8'));
if (source.sheet !== 'A+' || source.sha256 !== plan.source.sha256) throw new Error('Source mismatch');
const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { auth: { persistSession: false } });
const after = [];
for (let from = 0;; from += 1000) {
    const { data, error } = await client.from('premium_names').select('*').order('id').range(from, from + 999);
    if (error) throw new Error(error.message);
    after.push(...data);
    if (data.length < 1000) break;
}
const changes = new Map(plan.changes.map(change => [nameKey(change.name), change]));
const byName = new Map(after.map(row => [nameKey(row.name), row]));
if (byName.size !== after.length || after.length !== before.length + plan.stats.newNames) throw new Error('Duplicate name or incorrect total');
for (const row of before) {
    const found = byName.get(nameKey(row.name));
    const expected = { ...row, ...(changes.get(nameKey(row.name))?.patch ?? {}) };
    for (const [field, value] of Object.entries(expected)) {
        if (JSON.stringify(found?.[field]) !== JSON.stringify(value)) throw new Error(`Existing value changed unexpectedly: ${row.name}/${field}`);
    }
}
for (const change of plan.changes) {
    const found = byName.get(nameKey(change.name));
    for (const [field, value] of Object.entries(change.patch)) if (found?.[field] !== value) throw new Error(`Missing imported value: ${change.name}/${field}`);
    if (!change.before && (found.meaning_status !== 'pending' || found.pronunciation_status !== 'pending')) throw new Error('Invalid new-name defaults');
}
if (planPremiumImport(source.records, after).changes.length) throw new Error('Repeat import would write more rows');
const result = { verified: true, source: source.records.length, inserted: plan.stats.newNames, existing: plan.stats.existingNames, enriched: plan.stats.updatedNames, databaseTotal: after.length, repeatChanges: 0, preservedExisting: before.length };
fs.writeFileSync(path.join(directory, 'verification.json'), JSON.stringify(result, null, 2));
console.log(JSON.stringify(result));
