import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { parseCsv } from './import-auspicious-name-details.mjs';
import { getPronunciationIssues, normalizePronunciationText } from './lib/thai-pronunciation.mjs';

const REQUIRED_HEADERS = ['ชื่อมงคล', 'คำอ่าน', 'ความหมาย'];
const PAGE_SIZE = 25;

function summarizeNames(names) {
    const sample = names.slice(0, 12).join(', ');
    return `${names.length}${sample ? ` (${sample}${names.length > 12 ? ', ...' : ''})` : ''}`;
}

function normalizeText(value) {
    return String(value ?? '').normalize('NFC').trim();
}

export function parseNameTextCsv(input, source = 'CSV') {
    const rows = parseCsv(input);
    if (rows.length === 0) throw new Error(`${source} is empty.`);

    const headers = rows[0].map((header) => normalizeText(header));
    const columnByHeader = new Map(headers.map((header, index) => [header, index]));
    const missingHeaders = REQUIRED_HEADERS.filter((header) => !columnByHeader.has(header));
    if (missingHeaders.length > 0) throw new Error(`${source} is missing required columns: ${missingHeaders.join(', ')}.`);

    return rows.slice(1).map((row, index) => {
        const line = index + 2;
        if (row.length !== headers.length) {
            throw new Error(`${source} row ${line} has ${row.length} columns; expected ${headers.length}.`);
        }

        const name = normalizeText(row[columnByHeader.get('ชื่อมงคล')]);
        const pronunciation = normalizePronunciationText(row[columnByHeader.get('คำอ่าน')]);
        const meaning = normalizeText(row[columnByHeader.get('ความหมาย')]);
        if (!name || !pronunciation || !meaning) {
            throw new Error(`${source} row ${line} has a blank name, pronunciation or meaning.`);
        }
        const pronunciationIssues = getPronunciationIssues(pronunciation);
        if (pronunciationIssues.length > 0) {
            throw new Error(`${source} row ${line} has an invalid pronunciation for ${name}: ${pronunciationIssues.join(', ')}.`);
        }
        return { name, pronunciation, meaning };
    });
}

export function combineNameTextRecords(fileContents) {
    const recordsByName = new Map();
    let sourceRows = 0;

    for (const { file, content } of fileContents) {
        const records = parseNameTextCsv(content, file);
        sourceRows += records.length;
        for (const record of records) {
            const existing = recordsByName.get(record.name);
            if (existing && (existing.pronunciation !== record.pronunciation || existing.meaning !== record.meaning)) {
                throw new Error(`Duplicate name has conflicting data: ${record.name}`);
            }
            recordsByName.set(record.name, record);
        }
    }

    return { sourceRows, records: [...recordsByName.values()] };
}

function parseArguments(argv) {
    const files = [];
    for (let index = 0; index < argv.length; index += 1) {
        if (argv[index] === '--file') {
            const file = argv[index + 1];
            if (!file || file.startsWith('--')) throw new Error('Each --file option requires a CSV path.');
            files.push(path.resolve(file));
            index += 1;
        }
    }
    if (files.length === 0) throw new Error('Provide at least one CSV with --file <path>.');
    return { files, apply: argv.includes('--apply') };
}

async function fetchDatabaseRows(client, names) {
    const rows = [];
    for (let offset = 0; offset < names.length; offset += PAGE_SIZE) {
        const { data, error } = await client
            .from('auspicious_names')
            .select('id, name, pronunciation, meaning')
            .in('name', names.slice(offset, offset + PAGE_SIZE));
        if (error) throw new Error(`Database read failed: ${error.message}`);
        rows.push(...(data ?? []));
    }
    return rows;
}

function writeBackup(rows) {
    const directory = path.resolve('outputs/backups');
    fs.mkdirSync(directory, { recursive: true });
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const target = path.join(directory, `auspicious-names-text-before-import-${stamp}.json`);
    fs.writeFileSync(target, `${JSON.stringify(rows, null, 2)}\n`, 'utf8');
    return target;
}

function createRevalidator(dependencies) {
    if (dependencies.revalidate) return dependencies.revalidate;
    const secret = process.env.REVALIDATE_SECRET;
    if (!secret) throw new Error('REVALIDATE_SECRET is required before --apply.');
    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
    return async () => {
        const response = await fetch(`${siteUrl}/api/admin/revalidate-public-names`, {
            method: 'POST',
            headers: { 'x-revalidate-secret': secret },
        });
        if (!response.ok) throw new Error(`Cache revalidation failed (${response.status}).`);
    };
}

export async function runNameTextImport({ files, apply = false }, dependencies = {}) {
    if (!Array.isArray(files) || files.length === 0) {
        throw new Error('Provide at least one CSV file.');
    }
    const fileExists = dependencies.fileExists ?? fs.existsSync;
    const readFile = dependencies.readFile ?? fs.readFileSync;
    const fileContents = files.map((file) => {
        if (!fileExists(file)) throw new Error(`CSV file not found: ${file}`);
        return { file, content: readFile(file, 'utf8') };
    });
    const imported = combineNameTextRecords(fileContents);
    const require = createRequire(import.meta.url);
    const dotenv = dependencies.dotenv ?? require('dotenv');
    dotenv.config({ path: path.resolve('.env.local'), quiet: true });
    dotenv.config({ quiet: true });
    const createClient = dependencies.createClient ?? require('@supabase/supabase-js').createClient;
    const supabaseUrl = dependencies.supabaseUrl ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = dependencies.serviceRoleKey ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) throw new Error('Supabase URL and service-role key are required.');

    const client = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
    const databaseRows = await fetchDatabaseRows(client, imported.records.map((record) => record.name));
    const databaseByName = new Map(databaseRows.map((row) => [normalizeText(row.name), row]));
    const missingNames = imported.records.filter((record) => !databaseByName.has(record.name)).map((record) => record.name);
    if (databaseRows.length !== imported.records.length || missingNames.length > 0) {
        throw new Error(`Database name mismatch: expected ${imported.records.length} rows, found ${databaseRows.length}; missing ${summarizeNames(missingNames)}.`);
    }

    const recordsToChange = imported.records.filter((record) => {
        const database = databaseByName.get(record.name);
        return normalizeText(database?.pronunciation) !== record.pronunciation || normalizeText(database?.meaning) !== record.meaning;
    });
    const summary = {
        sourceFiles: files.length,
        sourceRows: imported.sourceRows,
        uniqueNames: imported.records.length,
        databaseRows: databaseRows.length,
        recordsToChange: recordsToChange.length,
    };
    if (!apply || recordsToChange.length === 0) {
        return { mode: apply ? 'no-changes' : 'dry-run', summary };
    }

    const revalidate = createRevalidator(dependencies);
    const backupPath = (dependencies.writeBackup ?? writeBackup)(recordsToChange.map((record) => databaseByName.get(record.name)));
    const { data, error } = await client.rpc('admin_import_auspicious_name_text', { records: recordsToChange });
    if (error) throw new Error(`Import RPC failed: ${error.message}`);

    const verificationRows = await fetchDatabaseRows(client, imported.records.map((record) => record.name));
    const verifiedByName = new Map(verificationRows.map((row) => [normalizeText(row.name), row]));
    const mismatches = imported.records.filter((record) => {
        const database = verifiedByName.get(record.name);
        return !database || normalizeText(database.pronunciation) !== record.pronunciation || normalizeText(database.meaning) !== record.meaning;
    });
    if (verificationRows.length !== imported.records.length || mismatches.length > 0) {
        throw new Error(`Post-import verification failed: ${verificationRows.length} rows, ${mismatches.length} mismatches.`);
    }

    await revalidate();
    return { mode: 'apply', summary, backupPath, rpcResult: data, verifiedRows: verificationRows.length, revalidated: true };
}

async function main() {
    try {
        console.log(JSON.stringify(await runNameTextImport(parseArguments(process.argv.slice(2))), null, 2));
    } catch (error) {
        console.error(error instanceof Error ? error.message : error);
        process.exitCode = 1;
    }
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) await main();
