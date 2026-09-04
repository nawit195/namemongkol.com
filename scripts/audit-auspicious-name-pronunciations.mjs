import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseCsv } from './import-auspicious-name-details.mjs';
import {
    getPronunciationApprovalIssues,
    getPublicationPronunciationIssues,
    normalizePronunciationDraft,
    normalizePronunciationVariants,
} from './lib/thai-pronunciation.mjs';

const EXPECTED_ROWS = 7348;
const LEADING_VOWELS = new Set(['เ', 'แ', 'โ', 'ใ', 'ไ']);
const THAI_CONSONANT = /[ก-ฮ]/u;
const SOURCE_CSV = path.resolve('outputs/auspicious-names-7348-corrected-pronunciation.csv');
const SOURCE_REVIEW = path.resolve('outputs/auspicious-names-pronunciation-review.json');
const REVIEW_OUTPUT = path.resolve('outputs/auspicious-names-pronunciation-review.json');
const LEGACY_REPORT_OUTPUT = path.resolve('outputs/auspicious-names-pronunciation-audit.json');
const REVIEWED_CSV_OUTPUT = path.resolve('outputs/auspicious-names-7348-reviewed.csv');
const AUDIT_CSV_OUTPUT = path.resolve('outputs/auspicious-names-7348-audit.csv');
const AUDIT_JSON_OUTPUT = path.resolve('outputs/auspicious-names-7348-audit.json');

const ORST_DICTIONARY = {
    title: 'พจนานุกรม ฉบับราชบัณฑิตยสถาน',
    url: 'https://dictionary.orst.go.th/',
};

// Full-name overrides require roots and traceable sources. Model output or
// structural validation alone never qualifies a record for approval.
export const CURATED_NAME_EVIDENCE = {
    'เขตรกรินทร์': { pronunciation: 'เขด-ตระ-กะ-ริน', pronunciationVariants: ['เขด-กะ-ริน'], roots: ['เขตร', 'กรินทร์'], sources: [ORST_DICTIONARY] },
    'เขตรจิราวรรณ': { pronunciation: 'เขด-จิ-รา-วัน', pronunciationVariants: [], roots: ['เขตร', 'จิรา', 'วรรณ'], sources: [ORST_DICTIONARY] },
    'เขตรณัฐจิรา': { pronunciation: 'เขด-นัด-จิ-รา', pronunciationVariants: [], roots: ['เขตร', 'ณัฐ', 'จิรา'], sources: [ORST_DICTIONARY] },
    'เขตรญาลักษณ์': { pronunciation: 'เขด-ยา-ลัก', pronunciationVariants: [], roots: ['เขตร', 'ญา', 'ลักษณ์'], sources: [ORST_DICTIONARY] },
    'พัชรพล': { pronunciation: 'พัด-ชะ-ระ-พน', pronunciationVariants: [], roots: ['พัชร', 'พล'], sources: [ORST_DICTIONARY] },
};

function getInitial(name) {
    const characters = [...String(name ?? '').normalize('NFC').trim()];
    if (characters.length === 0) return 'ไม่ระบุ';
    if (!LEADING_VOWELS.has(characters[0])) return THAI_CONSONANT.test(characters[0]) ? characters[0] : 'ไม่ระบุ';
    return characters.slice(1).find((character) => THAI_CONSONANT.test(character)) ?? 'ไม่ระบุ';
}

function loadSourceReview() {
    if (!fs.existsSync(SOURCE_REVIEW)) return [];
    const records = JSON.parse(fs.readFileSync(SOURCE_REVIEW, 'utf8'));
    return Array.isArray(records) ? records : [];
}

function csvCell(value) {
    const text = String(value ?? '');
    return /[",\r\n]/u.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function toCsv(headers, records) {
    return `\uFEFF${[headers, ...records].map((row) => row.map(csvCell).join(',')).join('\r\n')}\r\n`;
}

function addCount(target, key) {
    target[key] = (target[key] ?? 0) + 1;
}

export function buildLinguisticAudit(csvText, sourceReviewRecords = []) {
    const rows = parseCsv(csvText);
    const headers = rows.shift();
    if (JSON.stringify(headers) !== JSON.stringify(['ชื่อมงคล', 'คำอ่าน', 'ความหมาย'])) throw new Error('CSV headers must be ชื่อมงคล, คำอ่าน, ความหมาย.');
    if (rows.length !== EXPECTED_ROWS) throw new Error(`Expected ${EXPECTED_ROWS} rows; received ${rows.length}.`);

    const priorByName = new Map(sourceReviewRecords.map((record) => [record.name, record]));
    const records = [];
    const statusCounts = {
        pronunciation: { pending: 0, draft: 0, approved: 0, rejected: 0 },
        meaning: { pending: 0, draft: 0, approved: 0, rejected: 0 },
    };
    const categoryCounts = {};
    const issueCounts = {};

    for (const [rawName, rawPronunciation, rawMeaning] of rows) {
        const name = rawName.normalize('NFC').trim();
        const prior = priorByName.get(name) ?? {};
        const curated = CURATED_NAME_EVIDENCE[name];
        const pronunciation = normalizePronunciationDraft(curated?.pronunciation ?? rawPronunciation);
        const pronunciationVariants = normalizePronunciationVariants(curated?.pronunciationVariants ?? prior.pronunciationVariants ?? []);
        const meaning = rawMeaning.trim();
        if (!name || !pronunciation || !meaning) throw new Error(`Blank data found for ${name || '(unknown name)'}.`);

        const pronunciationEvidence = curated ? {
            method: 'curated-full-name-review', roots: curated.roots, sources: curated.sources,
            note: 'ตรวจจากองค์ประกอบศัพท์ที่มีแหล่งอ้างอิง',
        } : {
            method: 'legacy-csv-structural-audit', roots: [], sources: [],
            note: 'มีคำอ่านสำหรับแสดงผล แต่ยังไม่มีหลักฐานคำเต็มหรือรากศัพท์ครบทุกส่วน จึงรอผู้ตรวจภาษา',
            priorSource: prior.source ?? null,
        };
        const pronunciationIssues = curated
            ? getPronunciationApprovalIssues(pronunciation, pronunciationVariants, pronunciationEvidence)
            : [...new Set([...getPublicationPronunciationIssues(pronunciation), 'missing-official-evidence'])];
        const pronunciationStatus = pronunciationIssues.length === 0 ? 'approved' : 'pending';
        const meaningEvidence = {
            method: 'legacy-csv-pending-root-review', roots: [], sources: [],
            note: 'คงความหมายเดิมไว้ให้ผู้ใช้เห็นระหว่างรอตรวจนิยามรากศัพท์และแหล่งอ้างอิง',
        };
        const meaningStatus = 'pending';
        const initial = getInitial(name);
        const note = pronunciationStatus === 'approved' ? 'หลักฐานคำอ่านครบ พร้อมอนุมัติ' : `รอตรวจ: ${pronunciationIssues.join(', ')}`;

        statusCounts.pronunciation[pronunciationStatus] += 1;
        statusCounts.meaning[meaningStatus] += 1;
        categoryCounts[initial] ??= { total: 0, approved: 0, pending: 0 };
        categoryCounts[initial].total += 1;
        categoryCounts[initial][pronunciationStatus] += 1;
        pronunciationIssues.forEach((issue) => addCount(issueCounts, issue));

        records.push({
            name, pronunciation, pronunciationDraft: pronunciation, pronunciationVariants,
            pronunciationStatus, pronunciationEvidence, meaning, meaningStatus, meaningEvidence,
            source: pronunciationStatus === 'approved' ? 'orst-curated-review' : 'legacy-csv-pending-evidence',
            note, issues: pronunciationIssues, initial,
        });
    }

    const report = {
        generatedAt: new Date().toISOString(), sourceRows: rows.length,
        uniqueNames: new Set(records.map((record) => record.name)).size,
        statusCounts, issueCounts,
        categoryCounts: Object.fromEntries(Object.entries(categoryCounts).sort(([a], [b]) => a.localeCompare(b, 'th'))),
        references: [ORST_DICTIONARY],
        policy: 'Existing readings remain visible while pending. Approval requires complete roots and traceable sources; AI or PyThaiNLP output is never approval evidence by itself.',
    };
    return { report, records };
}

export const buildPronunciationAudit = buildLinguisticAudit;

function writeOutputs(report, records) {
    fs.writeFileSync(REVIEW_OUTPUT, `${JSON.stringify(records, null, 2)}\n`, 'utf8');
    fs.writeFileSync(LEGACY_REPORT_OUTPUT, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
    fs.writeFileSync(AUDIT_JSON_OUTPUT, `${JSON.stringify({ report, records }, null, 2)}\n`, 'utf8');
    fs.writeFileSync(REVIEWED_CSV_OUTPUT, toCsv(['ชื่อ', 'คำอ่าน', 'ความหมาย'], records.map((record) => [record.name, [record.pronunciation, ...record.pronunciationVariants].join(' / '), record.meaning])));
    fs.writeFileSync(AUDIT_CSV_OUTPUT, toCsv(
        ['ชื่อ', 'คำอ่านหลัก', 'คำอ่านอื่น', 'สถานะคำอ่าน', 'สถานะความหมาย', 'รากศัพท์', 'แหล่งอ้างอิง', 'หมายเหตุ'],
        records.map((record) => [record.name, record.pronunciation, record.pronunciationVariants.join(' / '), record.pronunciationStatus, record.meaningStatus, record.pronunciationEvidence.roots.join(' + '), record.pronunciationEvidence.sources.map((source) => source.url).join(' | '), record.note]),
    ));
}

function main() {
    const { report, records } = buildLinguisticAudit(fs.readFileSync(SOURCE_CSV, 'utf8'), loadSourceReview());
    writeOutputs(report, records);
    console.log(JSON.stringify({ sourceRows: report.sourceRows, uniqueNames: report.uniqueNames, statusCounts: report.statusCounts, outputs: [REVIEWED_CSV_OUTPUT, AUDIT_CSV_OUTPUT, AUDIT_JSON_OUTPUT] }, null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) main();
