import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import {
    getPronunciationIssues,
    normalizePronunciationText,
} from './lib/thai-pronunciation.mjs';

const EXPECTED_HEADERS = ['ชื่อมงคล', 'คำอ่าน', 'ความหมาย'];
const EXPECTED_ROW_COUNT = 7348;
const PAGE_SIZE = 1000;

export function parseCsv(input) {
    const text = input.replace(/^\uFEFF/, '');
    const rows = [];
    let row = [];
    let field = '';
    let quoted = false;

    for (let index = 0; index < text.length; index += 1) {
        const character = text[index];

        if (quoted) {
            if (character === '"') {
                if (text[index + 1] === '"') {
                    field += '"';
                    index += 1;
                } else {
                    quoted = false;
                }
            } else {
                field += character;
            }
            continue;
        }

        if (character === '"' && field.length === 0) {
            quoted = true;
        } else if (character === ',') {
            row.push(field);
            field = '';
        } else if (character === '\n' || character === '\r') {
            row.push(field);
            field = '';
            if (row.some((value) => value.length > 0)) rows.push(row);
            row = [];
            if (character === '\r' && text[index + 1] === '\n') index += 1;
        } else {
            field += character;
        }
    }

    if (quoted) throw new Error('CSV contains an unterminated quoted field.');
    row.push(field);
    if (row.some((value) => value.length > 0)) rows.push(row);
    return rows;
}

export function validateCsv(input, expectedRowCount = EXPECTED_ROW_COUNT) {
    const rows = parseCsv(input);
    if (rows.length === 0) throw new Error('CSV is empty.');

    const headers = rows[0].map((value) => value.trim());
    if (headers.length !== EXPECTED_HEADERS.length || headers.some((value, index) => value !== EXPECTED_HEADERS[index])) {
        throw new Error(`CSV headers must be exactly: ${EXPECTED_HEADERS.join(', ')}`);
    }

    const records = rows.slice(1).map((values, index) => {
        if (values.length !== EXPECTED_HEADERS.length) {
            throw new Error(`CSV row ${index + 2} has ${values.length} columns; expected ${EXPECTED_HEADERS.length}.`);
        }

        const [rawName, rawPronunciation, rawMeaning] = values;
        const name = rawName.trim();
        const pronunciation = normalizePronunciationText(rawPronunciation);
        const meaning = rawMeaning.trim();
        if (!name || !pronunciation || !meaning) {
            throw new Error(`CSV row ${index + 2} has a blank name, pronunciation or meaning.`);
        }
        const pronunciationIssues = getPronunciationIssues(pronunciation);
        if (pronunciationIssues.length > 0) {
            throw new Error(`CSV row ${index + 2} has an invalid pronunciation for ${name}: ${pronunciationIssues.join(', ')}.`);
        }
        return { name, pronunciation, meaning };
    });

    if (records.length !== expectedRowCount) {
        throw new Error(`CSV has ${records.length} data rows; expected ${expectedRowCount}.`);
    }

    const uniqueByName = new Map();
    for (const record of records) {
        const existing = uniqueByName.get(record.name);
        if (existing && (existing.pronunciation !== record.pronunciation || existing.meaning !== record.meaning)) {
            throw new Error(`Duplicate name has conflicting data: ${record.name}`);
        }
        uniqueByName.set(record.name, record);
    }

    return {
        records,
        uniqueRecords: [...uniqueByName.values()],
        duplicateRows: records.length - uniqueByName.size,
    };
}

function parseArguments(argv) {
    const fileIndex = argv.indexOf('--file');
    const file = fileIndex >= 0 ? argv[fileIndex + 1] : undefined;
    const reviewIndex = argv.indexOf('--review-file');
    const reviewFile = reviewIndex >= 0 ? argv[reviewIndex + 1] : undefined;
    if (!file) throw new Error('Provide the CSV path with --file <path>.');
    return {
        file: path.resolve(file),
        reviewFile: reviewFile ? path.resolve(reviewFile) : undefined,
        apply: argv.includes('--apply'),
        preserveDatabaseExtras: argv.includes('--preserve-db-extras'),
    };
}

function readPronunciationReviews(file, expectedNames) {
    if (!file) {
        return new Map([...expectedNames].map((name) => [name, {
            name,
            confidence: 'medium',
            source: 'csv-import-unreviewed',
            note: 'นำเข้าจาก CSV โดยไม่มีผลตรวจคำอ่านประกอบ',
        }]));
    }
    if (!fs.existsSync(file)) throw new Error(`Pronunciation review file not found: ${file}`);
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (!Array.isArray(parsed)) throw new Error('Pronunciation review file must contain an array.');
    const reviews = new Map();
    for (const value of parsed) {
        const name = typeof value?.name === 'string' ? value.name.trim() : '';
        const confidence = typeof value?.confidence === 'string' ? value.confidence : '';
        if (!name || !['high', 'medium', 'low'].includes(confidence)) {
            throw new Error('Pronunciation review contains an invalid name or confidence.');
        }
        reviews.set(name, {
            name,
            confidence,
            source: typeof value.source === 'string' ? value.source.trim() : 'pronunciation-review',
            note: typeof value.note === 'string' ? value.note.trim() : '',
        });
    }
    const missing = [...expectedNames].filter((name) => !reviews.has(name));
    if (missing.length > 0) throw new Error(`Pronunciation review is missing ${summarizeNames(missing)} names.`);
    return reviews;
}

async function fetchDatabaseRows(supabase, includePronunciation) {
    const columns = [
        'id',
        'name',
        ...(includePronunciation ? ['pronunciation'] : []),
        'meaning',
        'meaning_draft',
        'meaning_status',
        'meaning_source',
        'meaning_review_notes',
        'meaning_reviewed_at',
        'meaning_reviewed_by',
    ].join(', ');
    const rows = [];

    for (let from = 0; ; from += PAGE_SIZE) {
        const { data, error } = await supabase
            .from('auspicious_names')
            .select(columns)
            .order('id', { ascending: true })
            .range(from, from + PAGE_SIZE - 1);

        if (error) return { rows: [], error };
        if (!data?.length) break;
        rows.push(...data);
        if (data.length < PAGE_SIZE) break;
    }

    return { rows, error: null };
}

function compareNameSets(csvRecords, databaseRows) {
    const csvNames = new Set(csvRecords.map((record) => record.name));
    const databaseNames = new Set(databaseRows.map((record) => String(record.name).trim()));
    const missingInDatabase = [...csvNames].filter((name) => !databaseNames.has(name));
    const missingInCsv = [...databaseNames].filter((name) => !csvNames.has(name));
    return { missingInDatabase, missingInCsv };
}

function summarizeNames(names) {
    const sample = names.slice(0, 12).join(', ');
    return `${names.length}${sample ? ` (${sample}${names.length > 12 ? ', ...' : ''})` : ''}`;
}

function writeBackup(databaseRows) {
    const directory = path.join(process.cwd(), 'outputs', 'backups');
    fs.mkdirSync(directory, { recursive: true });
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const target = path.join(directory, `auspicious-names-before-pronunciation-${stamp}.json`);
    fs.writeFileSync(target, `${JSON.stringify(databaseRows, null, 2)}\n`, 'utf8');
    return target;
}

export async function runImport({ file, reviewFile, apply, preserveDatabaseExtras = false }, dependencies = {}) {
    if (!fs.existsSync(file)) throw new Error(`CSV file not found: ${file}`);
    const parsed = validateCsv(fs.readFileSync(file, 'utf8'));
    const pronunciationReviews = readPronunciationReviews(
        reviewFile,
        new Set(parsed.uniqueRecords.map((record) => record.name)),
    );

    const require = createRequire(import.meta.url);
    const dotenv = dependencies.dotenv ?? require('dotenv');
    dotenv.config({ path: path.join(process.cwd(), '.env.local') });
    dotenv.config();
    const createClient = dependencies.createClient ?? require('@supabase/supabase-js').createClient;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) throw new Error('Supabase URL and service-role key are required.');

    const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
    let pronunciationAvailable = true;
    let databaseResult = await fetchDatabaseRows(supabase, true);

    if (databaseResult.error && /pronunciation/i.test(databaseResult.error.message ?? '')) {
        pronunciationAvailable = false;
        databaseResult = await fetchDatabaseRows(supabase, false);
    }
    if (databaseResult.error) throw new Error(`Database read failed: ${databaseResult.error.message}`);

    const databaseRows = databaseResult.rows;
    const names = compareNameSets(parsed.uniqueRecords, databaseRows);
    if (databaseRows.length !== EXPECTED_ROW_COUNT) {
        throw new Error(`Database has ${databaseRows.length} rows; expected ${EXPECTED_ROW_COUNT}.`);
    }
    if (names.missingInDatabase.length || (names.missingInCsv.length && !preserveDatabaseExtras)) {
        throw new Error(`Name mismatch. CSV names missing in DB: ${summarizeNames(names.missingInDatabase)}; DB names missing in CSV: ${summarizeNames(names.missingInCsv)}.`);
    }

    const databaseByName = new Map();
    for (const row of databaseRows) {
        const name = String(row.name).trim();
        if (!databaseByName.has(name)) databaseByName.set(name, row);
    }
    const emptyMeaningsToFill = parsed.uniqueRecords.filter((record) => {
        const row = databaseByName.get(record.name);
        return !(row?.meaning ?? '').trim();
    }).length;
    const meaningsToChange = parsed.uniqueRecords.filter((record) => {
        const row = databaseByName.get(record.name);
        return (row?.meaning ?? '').trim() !== record.meaning;
    }).length;

    const summary = {
        csvRows: parsed.records.length,
        uniqueNames: parsed.uniqueRecords.length,
        duplicateRows: parsed.duplicateRows,
        databaseRows: databaseRows.length,
        emptyMeaningsToFill,
        meaningsToChange,
        preservedDatabaseOnlyNames: names.missingInCsv.length,
        pronunciationColumnReady: pronunciationAvailable,
        pronunciationReview: {
            high: [...pronunciationReviews.values()].filter((review) => review.confidence === 'high').length,
            medium: [...pronunciationReviews.values()].filter((review) => review.confidence === 'medium').length,
            low: [...pronunciationReviews.values()].filter((review) => review.confidence === 'low').length,
        },
    };

    if (!apply) return { mode: 'dry-run', summary };
    if (!pronunciationAvailable) {
        throw new Error('Run scripts/migration-auspicious-name-pronunciation.sql in Supabase SQL Editor before --apply.');
    }

    const backupPath = writeBackup(databaseRows);
    const records = parsed.uniqueRecords.map((record) => {
        const review = pronunciationReviews.get(record.name);
        return {
            ...record,
            pronunciation_status: review.confidence === 'high' ? 'approved' : review.confidence === 'medium' ? 'draft' : 'pending',
            pronunciation_source: review.source,
            pronunciation_review_notes: review.note || null,
        };
    });
    const { data, error } = await supabase.rpc('admin_import_auspicious_name_details', {
        records,
    });
    if (error) throw new Error(`Import RPC failed: ${error.message}`);

    const verification = await fetchDatabaseRows(supabase, true);
    if (verification.error) throw new Error(`Post-import verification failed: ${verification.error.message}`);
    const verifiedByName = new Map(verification.rows.map((row) => [String(row.name).trim(), row]));
    const mismatchedCsvRecords = parsed.uniqueRecords.filter((record) => {
        const row = verifiedByName.get(record.name);
        return (row?.pronunciation ?? '').trim() !== record.pronunciation
            || (row?.meaning ?? '').trim() !== record.meaning;
    });
    if (verification.rows.length !== EXPECTED_ROW_COUNT || mismatchedCsvRecords.length > 0) {
        throw new Error(`Post-import verification failed: ${verification.rows.length} rows, ${mismatchedCsvRecords.length} CSV records mismatched.`);
    }

    return {
        mode: 'apply',
        summary,
        backupPath,
        verifiedCsvNames: parsed.uniqueRecords.length,
        rpcResult: data,
    };
}

async function main() {
    try {
        const result = await runImport(parseArguments(process.argv.slice(2)));
        console.log(JSON.stringify(result, null, 2));
    } catch (error) {
        console.error(error instanceof Error ? error.message : error);
        process.exitCode = 1;
    }
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
    await main();
}
