// Read-only dry run. SQL is saved for review, never executed by this script.
import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { planImport } from './import-filtered-names.mjs';
import { buildPublicWorkbookImportSql } from './lib/public-workbook-import.mjs';

dotenv.config({ path: '.env.local', quiet: true });
const sourcePath = process.argv[2];
if (!sourcePath) throw new Error('Provide an extracted A-B source manifest');
const source = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
if (source.sheet !== 'A-B' || !source.records?.length) throw new Error('Expected nonempty A-B source');
const directory = path.resolve(process.argv[3] || 'scratch/filtered-names-import/2026-11-17');
fs.mkdirSync(directory, { recursive: true });
for (const file of ['before.json', 'plan.json', 'import.sql']) {
    if (fs.existsSync(path.join(directory, file))) throw new Error(`Backup exists: ${file}; choose a new directory`);
}
const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { auth: { persistSession: false } });
const existing = [];
for (let from = 0;; from += 1000) {
    const { data, error } = await client.from('auspicious_names').select('*').order('id').range(from, from + 999);
    if (error) throw new Error(error.message);
    existing.push(...data);
    if (data.length < 1000) break;
}
const plan = planImport(source.records, existing);
for (const change of plan.changes) {
    if ('meaning' in change.patch) change.patch.meaning_source = `xlsx:${source.sourceFile}:A-B:${source.sha256}`;
    if ('english_name' in change.patch) change.patch.english_name_source = `xlsx:${source.sourceFile}:A-B:${source.sha256}`;
}
fs.writeFileSync(path.join(directory, 'before.json'), JSON.stringify(existing, null, 2));
fs.writeFileSync(path.join(directory, 'plan.json'), JSON.stringify({ source: { file: source.sourceFile, sha256: source.sha256, sheet: source.sheet }, ...plan }, null, 2));
fs.writeFileSync(path.join(directory, 'import.sql'), buildPublicWorkbookImportSql(plan));
console.log(JSON.stringify({ databaseBefore: existing.length, ...plan.stats, skipped: plan.skipped.length, conflicts: plan.conflicts.length }));
