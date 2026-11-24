import { readFile } from 'node:fs/promises';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local', quiet: true });

const file = process.argv[2] ?? '.local/nicknames-import/aplus.json';
const source = JSON.parse(await readFile(file, 'utf8'));
const manifest = JSON.parse(await readFile('src/data/auspiciousNicknames.json', 'utf8'));
if (source.version !== manifest.version || source.records.length !== manifest.summary.aPlus) throw new Error('Private catalog does not match the public manifest');
if (source.records.some(item => item.grade !== 'A+' || !/^nn_[a-f0-9]{20}$/.test(item.id))) throw new Error('Invalid private catalog');
const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const { error } = await admin.from('nickname_catalog').upsert(source.records.map(record => ({ catalog_version: source.version, id: record.id, record })), { onConflict: 'catalog_version,id' });
if (error) throw new Error(error.message);
const check = await admin.from('nickname_catalog').select('id', { count: 'exact', head: true }).eq('catalog_version', source.version);
if (check.error || check.count !== source.records.length) throw new Error('Published count mismatch');
console.log(JSON.stringify({ version: source.version, published: check.count }));
