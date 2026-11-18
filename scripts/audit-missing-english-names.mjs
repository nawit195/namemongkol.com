import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local', quiet: true });
const sourceFile = process.argv[2];
const client = !sourceFile && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } }) : null;
async function readAll(table) {
    if (!client) throw new Error('Provide a saved snapshot path or configure the Supabase server environment. No credentials are printed.');
    const rows = [];
    for (let from = 0;; from += 1000) {
        const { data, error } = await client.from(table).select('*').order('id').range(from, from + 999);
        if (error) throw new Error(error.message);
        rows.push(...data);
        if (data.length < 1000) return rows;
    }
}
const { names, premium } = sourceFile
    ? JSON.parse(fs.readFileSync(path.resolve(sourceFile), 'utf8'))
    : await Promise.all([readAll('auspicious_names'), readAll('premium_names')]).then(([names, premium]) => ({ names, premium }));
const missing = names.filter(row => !row.english_name?.trim());
const syllables = [...new Set(missing.flatMap(row => row.pronunciation?.normalize('NFC').split(/[-\s]+/u).filter(Boolean) ?? []))].sort();
const directory = path.resolve('scratch/english-names');
fs.mkdirSync(directory, { recursive: true });
if (!sourceFile) fs.writeFileSync(path.join(directory, 'before.json'), JSON.stringify({ capturedAt: new Date().toISOString(), names, premium }, null, 2));
fs.writeFileSync(path.join(directory, 'syllables.json'), JSON.stringify(syllables, null, 2));
const summary = { total: names.length, withEnglish: names.length - missing.length, missing: missing.length, syllables: syllables.length, premiumMatches: missing.filter(row => premium.some(p => p.name === row.name && p.english_name?.trim())).length };
fs.writeFileSync(path.join(directory, 'audit.json'), JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary));
