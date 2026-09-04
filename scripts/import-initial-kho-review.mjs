import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

const EXPECTED_COUNT = 285;
// Keep PostgREST `.in()` URLs comfortably below proxy/header limits for Thai UTF-8 names.
const PAGE_SIZE = 25;
const DEFAULT_REVIEW_FILE = path.resolve('outputs/auspicious-names-initial-kho-review.json');
const LEADING_VOWELS = new Set(['เ', 'แ', 'โ', 'ใ', 'ไ']);
const THAI_CONSONANT = /[ก-ฮ]/u;

function formatDatabaseError(error) {
    return [error?.message, error?.details, error?.hint, error?.code]
        .filter((value, index, values) => value && values.indexOf(value) === index)
        .join(' | ');
}

function getInitial(name) {
    const characters = [...String(name ?? '').normalize('NFC').trim()];
    if (characters.length === 0) return '';
    if (!LEADING_VOWELS.has(characters[0])) return THAI_CONSONANT.test(characters[0]) ? characters[0] : '';
    return characters.slice(1).find((character) => THAI_CONSONANT.test(character)) ?? '';
}

export function validateInitialKhoReview(value) {
    const records = Array.isArray(value?.records) ? value.records : [];
    if (value?.initial !== 'ข' || value?.expectedCount !== EXPECTED_COUNT || records.length !== EXPECTED_COUNT) {
        throw new Error(`Review must contain exactly ${EXPECTED_COUNT} initial-ข records.`);
    }

    const names = new Set();
    for (const record of records) {
        const name = typeof record?.name === 'string' ? record.name.normalize('NFC').trim() : '';
        if (!name || getInitial(name) !== 'ข' || names.has(name)) throw new Error(`Invalid or duplicate initial-ข name: ${name || '(blank)'}.`);
        names.add(name);
        if (!['published', 'hidden'].includes(record.publicationStatus)) throw new Error(`Invalid publication status for ${name}.`);
        if (!['approved', 'rejected'].includes(record.pronunciationStatus)) throw new Error(`Invalid pronunciation status for ${name}.`);
        if (typeof record.publicationReason !== 'string' || !record.publicationReason.trim()) throw new Error(`Missing publication reason for ${name}.`);

        if (record.publicationStatus === 'published') {
            if (record.pronunciationStatus !== 'approved' || typeof record.pronunciation !== 'string' || !record.pronunciation.trim()) {
                throw new Error(`Published record is missing an approved pronunciation: ${name}.`);
            }
            for (const evidenceKey of ['pronunciationEvidence', 'publicationEvidence']) {
                const evidence = record[evidenceKey];
                if (!Array.isArray(evidence?.roots) || evidence.roots.length === 0 || !Array.isArray(evidence?.sources) || evidence.sources.length === 0) {
                    throw new Error(`Published record is missing ${evidenceKey}: ${name}.`);
                }
            }
        } else if (record.pronunciationStatus !== 'rejected') {
            throw new Error(`Hidden record must reject its unverified pronunciation: ${name}.`);
        }
    }

    const published = records.filter((record) => record.publicationStatus === 'published').length;
    const hidden = records.filter((record) => record.publicationStatus === 'hidden').length;
    if (published + hidden !== EXPECTED_COUNT) throw new Error('Review contains an unresolved publication state.');
    return { records, counts: { total: records.length, published, hidden, pending: 0 } };
}

const REVIEW_COLUMNS = [
    'id', 'name', 'pronunciation', 'pronunciation_draft', 'pronunciation_variants',
    'pronunciation_status', 'pronunciation_evidence',
    'publication_status', 'publication_reason', 'publication_evidence', 'publication_reviewed_at',
].join(', ');
const LEGACY_COLUMNS = 'id, name, pronunciation';

async function fetchRows(supabase, names, columns = REVIEW_COLUMNS) {
    const rows = [];
    for (let offset = 0; offset < names.length; offset += PAGE_SIZE) {
        const { data, error } = await supabase
            .from('auspicious_names')
            .select(columns)
            .in('name', names.slice(offset, offset + PAGE_SIZE));
        if (error) return { rows: [], error };
        rows.push(...(data ?? []));
    }
    return { rows, error: null };
}

function writeBackup(rows) {
    const directory = path.resolve('outputs/backups');
    fs.mkdirSync(directory, { recursive: true });
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const target = path.join(directory, `initial-kho-before-review-${stamp}.json`);
    fs.writeFileSync(target, `${JSON.stringify(rows, null, 2)}\n`, 'utf8');
    return target;
}

function toRpcRecord(record) {
    return {
        name: record.name,
        pronunciation: record.pronunciation,
        pronunciation_variants: record.pronunciationVariants,
        pronunciation_status: record.pronunciationStatus,
        pronunciation_evidence: record.pronunciationEvidence,
        publication_status: record.publicationStatus,
        publication_reason: record.publicationReason,
        publication_evidence: record.publicationEvidence,
    };
}

export async function runInitialKhoImport({ reviewFile = DEFAULT_REVIEW_FILE, apply = false }, dependencies = {}) {
    const review = validateInitialKhoReview(JSON.parse(fs.readFileSync(reviewFile, 'utf8')));
    const require = createRequire(import.meta.url);
    const dotenv = dependencies.dotenv ?? require('dotenv');
    dotenv.config({ path: path.resolve('.env.local') });
    dotenv.config();
    const createClient = dependencies.createClient ?? require('@supabase/supabase-js').createClient;
    const supabaseUrl = dependencies.supabaseUrl ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = dependencies.serviceRoleKey ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) throw new Error('Supabase URL and service-role key are required.');
    const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
    const names = review.records.map((record) => record.name);

    let reviewColumnsReady = true;
    let database = await fetchRows(supabase, names);
    if (database.error && /(pronunciation_|publication_)/i.test(database.error.message ?? '')) {
        reviewColumnsReady = false;
        database = await fetchRows(supabase, names, LEGACY_COLUMNS);
    }
    if (database.error) throw new Error(`Database read failed: ${formatDatabaseError(database.error)}`);
    const databaseNames = new Set(database.rows.map((row) => String(row.name).normalize('NFC').trim()));
    const missingNames = names.filter((name) => !databaseNames.has(name));
    if (database.rows.length !== EXPECTED_COUNT || missingNames.length > 0) {
        throw new Error(`Database review set mismatch: ${database.rows.length} rows; ${missingNames.length} names missing.`);
    }

    const summary = {
        ...review.counts,
        databaseRows: database.rows.length,
        publicationColumnsReady: reviewColumnsReady,
    };
    if (!apply) return { mode: 'dry-run', summary };
    if (!reviewColumnsReady) throw new Error('Run the pronunciation migrations and scripts/migration-auspicious-name-publication.sql before --apply.');

    const revalidate = dependencies.revalidate ?? (async () => {
        const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
        const secret = process.env.REVALIDATE_SECRET;
        if (!secret) throw new Error('REVALIDATE_SECRET is required before --apply.');
        const response = await fetch(`${siteUrl}/api/admin/revalidate-public-names`, {
            method: 'POST',
            headers: { 'x-revalidate-secret': secret },
        });
        if (!response.ok) throw new Error(`Cache revalidation failed (${response.status}).`);
    });
    if (!dependencies.revalidate && !process.env.REVALIDATE_SECRET) {
        throw new Error('REVALIDATE_SECRET is required before --apply.');
    }

    const backupPath = (dependencies.writeBackup ?? writeBackup)(database.rows);
    const rpcRecords = review.records.map(toRpcRecord);
    const { data, error } = await supabase.rpc('admin_apply_name_linguistic_review', { records: rpcRecords });
    if (error) throw new Error(`Linguistic review RPC failed: ${formatDatabaseError(error)}`);

    const verification = await fetchRows(supabase, names);
    if (verification.error) throw new Error(`Post-import verification failed: ${formatDatabaseError(verification.error)}`);
    const verifiedByName = new Map(verification.rows.map((row) => [String(row.name).normalize('NFC').trim(), row]));
    const mismatches = review.records.filter((record) => {
        const row = verifiedByName.get(record.name);
        const expectedPronunciation = record.publicationStatus === 'published' ? record.pronunciation : '';
        return (row?.pronunciation ?? '').trim() !== (expectedPronunciation ?? '')
            || row?.pronunciation_status !== record.pronunciationStatus
            || row?.publication_status !== record.publicationStatus
            || JSON.stringify(row?.pronunciation_variants ?? []) !== JSON.stringify(record.pronunciationVariants);
    });
    if (verification.rows.length !== EXPECTED_COUNT || mismatches.length > 0) {
        throw new Error(`Post-import verification failed: ${verification.rows.length} rows; ${mismatches.length} mismatches.`);
    }

    await revalidate();
    return { mode: 'apply', summary, backupPath, rpcResult: data, verifiedRows: verification.rows.length, revalidated: true };
}

function parseArguments(argv) {
    const fileIndex = argv.indexOf('--file');
    return {
        reviewFile: path.resolve(fileIndex >= 0 ? argv[fileIndex + 1] : DEFAULT_REVIEW_FILE),
        apply: argv.includes('--apply'),
    };
}

async function main() {
    const result = await runInitialKhoImport(parseArguments(process.argv.slice(2)));
    console.log(JSON.stringify(result, null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
    main().catch((error) => {
        console.error(error instanceof Error ? error.message : error);
        process.exitCode = 1;
    });
}
