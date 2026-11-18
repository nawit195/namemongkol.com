// Read-only dry run. Save a complete before-snapshot and SQL for review.
import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { planPremiumImport } from './import-premium-aplus.mjs';
import { buildPublicWorkbookImportSql } from './lib/public-workbook-import.mjs';

dotenv.config({ path: '.env.local', quiet: true });
const [sourcePath, outputPath] = process.argv.slice(2);
if (!sourcePath || !outputPath) throw new Error('Provide A+ manifest and backup directory');
const source = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
if (source.sheet !== 'A+' || !source.records?.length) throw new Error('Expected nonempty A+ source');
const directory = path.resolve(outputPath);
fs.mkdirSync(directory, { recursive: true });
for (const file of ['before.json', 'plan.json', 'import.sql']) {
    if (fs.existsSync(path.join(directory, file))) throw new Error(`Backup exists: ${file}; choose a new directory`);
}
const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { auth: { persistSession: false } });
const existing = [];
for (let from = 0;; from += 1000) {
    const { data, error } = await client.from('premium_names').select('*').order('id').range(from, from + 999);
    if (error) throw new Error(error.message);
    existing.push(...data);
    if (data.length < 1000) break;
}
const plan = planPremiumImport(source.records, existing);
fs.writeFileSync(path.join(directory, 'before.json'), JSON.stringify(existing, null, 2));
fs.writeFileSync(path.join(directory, 'plan.json'), JSON.stringify({ source: { file: source.sourceFile, sha256: source.sha256, sheet: source.sheet }, ...plan }, null, 2));
const sql = buildPublicWorkbookImportSql(plan, 'premium_names');
fs.writeFileSync(path.join(directory, 'import.sql'), sql);
console.log(JSON.stringify({ databaseBefore: existing.length, ...plan.stats, skipped: plan.skipped.length, conflicts: plan.conflicts.length, sqlBytes: Buffer.byteLength(sql) }));
