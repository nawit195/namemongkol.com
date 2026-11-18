import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { nameKey, planImport, buildImportSql } from './import-filtered-names.mjs';
export function planPremiumImport(records, existing) {
    const plan = planImport(records, existing);
    for (const row of plan.changes) if (!row.before) delete row.patch.gender;
    return plan;
}
async function main() {
    dotenv.config({ path: '.env.local', quiet: true });
    const source = JSON.parse(fs.readFileSync('scripts/data/premium-aplus-2026-11-14.json', 'utf8'));
    if (source.sheet !== 'A+' || source.records.length !== 531) throw new Error('Unexpected source');
    const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
    const existing = [];
    for (let from = 0;; from += 1000) {
        const { data, error } = await client.from('premium_names').select('*').order('id').range(from, from + 999);
        if (error) throw new Error(error.message);
        existing.push(...data);
        if (data.length < 1000) break;
    }
    const directory = path.resolve('scratch/premium-aplus-import');
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
        const repeat = planPremiumImport(source.records, existing);
        if (repeat.changes.length) throw new Error('Repeat import is not empty');
        const result = { verified: true, databaseTotal: existing.length, importedNames: source.records.length, ...applied.stats, repeatChanges: 0 };
        fs.writeFileSync(path.join(directory, 'verification.json'), JSON.stringify(result, null, 2));
        console.log(JSON.stringify(result));
        return;
    }
    const plan = planPremiumImport(source.records, existing);
    fs.mkdirSync(directory, { recursive: true });
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const file = path.join(directory, `${stamp}.json`);
    fs.writeFileSync(file, JSON.stringify({ source: { sha256: source.sha256, sheet: source.sheet }, ...plan }, null, 2));
    fs.writeFileSync(path.join(directory, 'latest.sql'), buildImportSql(plan, 'premium_names'));
    fs.writeFileSync(path.join(directory, 'latest-plan.json'), JSON.stringify({ backup: file, stats: plan.stats, conflicts: plan.conflicts, skipped: plan.skipped }, null, 2));
    console.log(JSON.stringify({ ...plan.stats, preservedConflicts: plan.conflicts.length, skipped: plan.skipped.length, backup: file }));
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) main().catch(error => { console.error(error.message); process.exitCode = 1; });
