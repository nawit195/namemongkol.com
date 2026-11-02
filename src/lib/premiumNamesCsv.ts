import type { PremiumAdminRecord, PremiumAdminReviewStatus } from '@/lib/adminPremiumNames';

const CSV_HEADERS = [
    'ชื่อ Premium',
    'เพศ',
    'คำอ่านที่เผยแพร่',
    'คำอ่านฉบับร่าง',
    'สถานะคำอ่าน',
    'ความหมายที่เผยแพร่',
    'ความหมายฉบับร่าง',
    'สถานะความหมาย',
    'สถานะเผยแพร่',
    'วันที่เพิ่ม Premium',
] as const;

const FORMULA_PREFIX = /^[\t\r\n ]*[=+\-@]/;

const GENDER_LABELS: Record<PremiumAdminRecord['gender'], string> = {
    male: 'ชาย',
    female: 'หญิง',
    neutral: 'ทุกเพศ',
};

const REVIEW_STATUS_LABELS: Record<PremiumAdminReviewStatus, string> = {
    pending: 'รอตรวจ',
    draft: 'ฉบับร่าง',
    approved: 'อนุมัติแล้ว',
    rejected: 'ไม่อนุมัติ',
};

function csvCell(value: string) {
    const protectedValue = FORMULA_PREFIX.test(value) ? `'${value}` : value;
    return `"${protectedValue.replace(/"/g, '""')}"`;
}

export function buildPremiumNamesCsv(records: readonly PremiumAdminRecord[]) {
    const rows = records.map((record) => [
        record.name,
        GENDER_LABELS[record.gender],
        record.pronunciation ?? '',
        record.pronunciationDraft ?? '',
        REVIEW_STATUS_LABELS[record.pronunciationStatus],
        record.meaning ?? '',
        record.meaningDraft ?? '',
        REVIEW_STATUS_LABELS[record.meaningStatus],
        record.publicationStatus === 'published' ? 'แสดง' : 'ซ่อน',
        record.createdAt ?? '',
    ].map(csvCell).join(','));

    return `\uFEFF${[CSV_HEADERS.map(csvCell).join(','), ...rows].join('\r\n')}\r\n`;
}
