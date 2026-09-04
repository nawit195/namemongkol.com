import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const EXPECTED_COUNT = 285;
const SOURCE_PATH = path.resolve('outputs/auspicious-names-7348-audit.json');
const OUTPUT_PATH = path.resolve('outputs/auspicious-names-initial-kho-review.json');
const ORST_DICTIONARY = {
    title: 'พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. 2554',
    url: 'https://dictionary.orst.go.th/',
};

const PUBLISHED = {
    'ขจร': ['ขะ-จอน', [], ['ขจร']],
    'ขจรกัณฑ์': ['ขะ-จอน-กัน', [], ['ขจร', 'กัณฑ์']],
    'ขจรจบ': ['ขะ-จอน-จบ', [], ['ขจร', 'จบ']],
    'ขจรทองคำ': ['ขะ-จอน-ทอง-คำ', [], ['ขจร', 'ทองคำ']],
    'ขจรวรรณ': ['ขะ-จอน-วัน', [], ['ขจร', 'วรรณ']],
    'ขจรวรรณรักษ์': ['ขะ-จอน-วัน-นะ-รัก', [], ['ขจร', 'วรรณ', 'รักษ์']],
    'ขจรวัจน์': ['ขะ-จอน-วัด', [], ['ขจร', 'วัจน์']],
    'ขจรอุษา': ['ขะ-จอน-อุ-สา', [], ['ขจร', 'อุษา']],
    'ขรรค์': ['ขัน', [], ['ขรรค์']],
    'ขวัญ': ['ขวัน', [], ['ขวัญ']],
    'ขวัญกนก': ['ขวัน-กะ-หนก', [], ['ขวัญ', 'กนก']],
    'ขวัญกมล': ['ขวัน-กะ-มน', [], ['ขวัญ', 'กมล']],
    'ขวัญขจร': ['ขวัน-ขะ-จอน', [], ['ขวัญ', 'ขจร']],
    'ขวัญจร': ['ขวัน-จอน', [], ['ขวัญ', 'จร']],
    'ขวัญจิรา': ['ขวัน-จิ-รา', [], ['ขวัญ', 'จิรา']],
    'ขวัญใจ': ['ขวัน-ใจ', [], ['ขวัญ', 'ใจ']],
    'ขวัญชญา': ['ขวัน-ชะ-ยา', [], ['ขวัญ', 'ชญา']],
    'ขวัญธิดา': ['ขวัน-ทิ-ดา', [], ['ขวัญ', 'ธิดา']],
    'ขวัญนรี': ['ขวัน-นะ-รี', [], ['ขวัญ', 'นรี']],
    'ขวัญนารี': ['ขวัน-นา-รี', [], ['ขวัญ', 'นารี']],
    'ขวัญมนัท': ['ขวัน-มะ-นัด', [], ['ขวัญ', 'มนัท']],
    'ขวัญมนัส': ['ขวัน-มะ-นัด', [], ['ขวัญ', 'มนัส']],
    'ขวัญลักษณ์': ['ขวัน-ลัก', [], ['ขวัญ', 'ลักษณ์']],
    'ขวัญวร': ['ขวัน-วอน', [], ['ขวัญ', 'วร']],
    'ขวัญวรัชญ์': ['ขวัน-วะ-รัด', [], ['ขวัญ', 'วร', 'รัชญ์']],
    'ขวัญวิชญ์': ['ขวัน-วิด', [], ['ขวัญ', 'วิชญ์']],
    'ขวัญสรวง': ['ขวัน-สวง', [], ['ขวัญ', 'สรวง']],
    'ขวัญเอิง': ['ขวัน-เอิง', [], ['ขวัญ', 'เอิง']],
    'ขอนทอง': ['ขอน-ทอง', [], ['ขอน', 'ทอง']],
    'ขันคำ': ['ขัน-คำ', [], ['ขัน', 'คำ']],
    'ขันทอง': ['ขัน-ทอง', [], ['ขัน', 'ทอง']],
    'ขันทะ': ['ขัน-ทะ', [], ['ขันทะ']],
    'ขันธ์': ['ขัน', [], ['ขันธ์']],
    'ขันธม่วง': ['ขัน-ทะ-ม่วง', [], ['ขันธ', 'ม่วง']],
    'ขันธสรณ์': ['ขัน-ทะ-สอน', [], ['ขันธ', 'สรณ์']],
    'ขันธาวาร': ['ขัน-ทา-วาน', [], ['ขันธา', 'วาร']],
    'ขันธุลา': ['ขัน-ทุ-ลา', [], ['ขันธ', 'ตุลา']],
    'ขิม': ['ขิม', [], ['ขิม']],
    'ขิมจันทร์': ['ขิม-จัน', [], ['ขิม', 'จันทร์']],
    'ขิมนนท์': ['ขิม-นน', [], ['ขิม', 'นนท์']],
    'เขตประกร': ['เขด-ประ-กอน', [], ['เขต', 'ประกร']],
    'เขตอนันต์': ['เขด-อะ-นัน', [], ['เขต', 'อนันต์']],
    'เขมจิรา': ['เข-มะ-จิ-รา', ['เขม-จิ-รา'], ['เขม', 'จิรา']],
    'เขมนิจ': ['เข-มะ-นิด', [], ['เขม', 'นิจ']],
    'เขมินทรา': ['เข-มิน-ทรา', [], ['เขม', 'อินทรา']],
};

function buildHiddenReason(name) {
    if (/^(?:เขร|เขว|เขวิ|โข|ไข)/u.test(name)) {
        return 'ไม่พบการแบ่งรากศัพท์ครบทุกส่วนจากแหล่งทางการ จึงซ่อนแทนการเดาคำอ่าน';
    }
    return 'รูปชื่อหรือองค์ประกอบยังไม่มีหลักฐานทางภาษาเพียงพอ จึงไม่เผยแพร่ชื่อและคำอ่าน';
}

export function buildInitialKhoReview(auditPayload) {
    const sourceRecords = Array.isArray(auditPayload?.records) ? auditPayload.records : [];
    const khoRecords = sourceRecords.filter((record) => record?.initial === 'ข');
    if (khoRecords.length !== EXPECTED_COUNT) {
        throw new Error(`Expected ${EXPECTED_COUNT} initial-ข records; received ${khoRecords.length}.`);
    }

    const seen = new Set();
    const records = khoRecords.map((record) => {
        const name = String(record.name ?? '').normalize('NFC').trim();
        if (!name || seen.has(name)) throw new Error(`Duplicate or blank initial-ข name: ${name || '(blank)'}.`);
        seen.add(name);
        const curated = PUBLISHED[name];
        const legacyPronunciation = String(record.pronunciationDraft ?? record.pronunciation ?? '').trim();

        if (!curated) {
            return {
                name,
                pronunciation: null,
                pronunciationVariants: [],
                pronunciationStatus: 'rejected',
                pronunciationEvidence: { method: 'initial-kho-conservative-review', roots: [], sources: [] },
                publicationStatus: 'hidden',
                publicationReason: buildHiddenReason(name),
                publicationEvidence: { method: 'initial-kho-conservative-review', roots: [], sources: [] },
                legacyPronunciation,
            };
        }

        const [pronunciation, pronunciationVariants, roots] = curated;
        return {
            name,
            pronunciation,
            pronunciationVariants,
            pronunciationStatus: 'approved',
            pronunciationEvidence: {
                method: 'curated-root-composition',
                roots,
                sources: [ORST_DICTIONARY],
                note: 'ตรวจรูปชื่อและประกอบคำอ่านจากรากศัพท์ที่ระบุ',
            },
            publicationStatus: 'published',
            publicationReason: 'แยกรากศัพท์ครบและมีแหล่งอ้างอิงสำหรับประกอบคำอ่าน',
            publicationEvidence: { method: 'curated-root-composition', roots, sources: [ORST_DICTIONARY] },
            legacyPronunciation,
        };
    });

    return {
        generatedAt: new Date().toISOString(),
        initial: 'ข',
        expectedCount: EXPECTED_COUNT,
        source: path.relative(process.cwd(), SOURCE_PATH).replaceAll('\\', '/'),
        policy: 'Publish only complete root compositions with traceable sources; hide rather than guess.',
        counts: {
            total: records.length,
            published: records.filter((record) => record.publicationStatus === 'published').length,
            hidden: records.filter((record) => record.publicationStatus === 'hidden').length,
            pending: 0,
        },
        records,
    };
}

function main() {
    const audit = JSON.parse(fs.readFileSync(SOURCE_PATH, 'utf8'));
    const review = buildInitialKhoReview(audit);
    fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(review, null, 2)}\n`, 'utf8');
    console.log(JSON.stringify({ output: OUTPUT_PATH, counts: review.counts }, null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) main();
