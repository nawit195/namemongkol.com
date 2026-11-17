// Read-only smoke check; never runs a paid analysis or changes user credits.
import fs from 'node:fs';
import { nameKey } from './import-filtered-names.mjs';

const [sourcePath, directory] = process.argv.slice(2);
if (!sourcePath || !directory) throw new Error('Provide A+ manifest and backup directory');
const source = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
const response = await fetch('https://www.namemongkol.com/api/public/premium-names', { signal: AbortSignal.timeout(120000) });
if (!response.ok) throw new Error(`Premium API HTTP ${response.status}`);
const payload = await response.json();
if (!payload.success || !Array.isArray(payload.data) || payload.total !== payload.data.length) throw new Error('Invalid API response');
const byName = new Map(payload.data.map(row => [nameKey(row.name), row]));
const missing = source.records.filter(row => !byName.has(nameKey(row.name)));
if (missing.length) throw new Error(`${missing.length} source names absent from live shared catalog`);
const pages = await Promise.all(['/premium-search', '/premium-analysis'].map(async page => {
    const res = await fetch(`https://www.namemongkol.com${page}`, { signal: AbortSignal.timeout(120000) });
    if (!res.ok) throw new Error(`${page} HTTP ${res.status}`);
    const html = await res.text();
    return { path: page, status: res.status, title: html.match(/<title>(.*?)<\/title>/s)?.[1], containsNewCount: html.includes(payload.total.toLocaleString('en-US')) || html.includes(String(payload.total)) };
}));
const result = { verified: true, apiStatus: response.status, total: payload.total, sourceNamesPresent: source.records.length, pages };
fs.writeFileSync(`${directory}/live-verification.json`, JSON.stringify(result, null, 2));
console.log(JSON.stringify(result));
