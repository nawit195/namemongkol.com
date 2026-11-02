'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    AlertTriangle,
    ChevronLeft,
    ChevronRight,
    Crown,
    Download,
    FileUp,
    Pencil,
    Plus,
    RefreshCw,
    Save,
    Search,
    Trash2,
    X,
} from 'lucide-react';
import type {
    PremiumAdminGender,
    PremiumAdminRecord,
    PremiumAdminReviewStatus,
} from '@/lib/adminPremiumNames';

const PAGE_SIZE = 30;

function getDownloadFilename(contentDisposition: string | null) {
    if (!contentDisposition) return null;
    const utf8Filename = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
    if (utf8Filename) {
        try {
            return decodeURIComponent(utf8Filename);
        } catch {
            return null;
        }
    }
    return contentDisposition.match(/filename="([^"]+)"/i)?.[1] ?? null;
}

type EditorValue = {
    record?: PremiumAdminRecord;
    name: string;
    gender: PremiumAdminGender;
    pronunciation: string;
    meaning: string;
};

type RecordsResponse = {
    success: boolean;
    records?: PremiumAdminRecord[];
    count?: number;
    page?: number;
    pageSize?: number;
    error?: string;
};

type SaveStats = {
    received: number;
    uniqueInPayload: number;
    inserted: number;
    skippedDuplicate: number;
    duplicatesInPayload: number;
    invalid: number;
};

const STATUS_LABELS: Record<PremiumAdminReviewStatus, string> = {
    pending: 'รอตรวจ',
    draft: 'ฉบับร่าง',
    approved: 'อนุมัติแล้ว',
    rejected: 'ไม่อนุมัติ',
};

const STATUS_CLASSES: Record<PremiumAdminReviewStatus, string> = {
    pending: 'border-slate-600 bg-slate-800 text-slate-300',
    draft: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
    approved: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    rejected: 'border-rose-500/30 bg-rose-500/10 text-rose-300',
};

const GENDER_LABELS: Record<PremiumAdminGender, string> = {
    male: 'ชาย',
    female: 'หญิง',
    neutral: 'ทุกเพศ',
};

function createEditor(record?: PremiumAdminRecord): EditorValue {
    return {
        record,
        name: record?.name ?? '',
        gender: record?.gender ?? 'neutral',
        pronunciation: record?.pronunciationDraft ?? record?.pronunciation ?? '',
        meaning: record?.meaningDraft ?? record?.meaning ?? '',
    };
}
function parseBulkRecords(input: string) {
    const lines = input
        .split(/\r?\n/)
        .flatMap((line) => line.includes('|') ? [line] : line.split(','))
        .map((line) => line.trim())
        .filter(Boolean);

    return lines.map((line) => {
        const [name = '', pronunciation = '', meaning = '', rawGender = 'neutral'] = line
            .split('|')
            .map((part) => part.trim());
        const gender: PremiumAdminGender = rawGender === 'male' || rawGender === 'female'
            ? rawGender
            : 'neutral';
        return { name, pronunciation, meaning, gender };
    }).filter((record) => record.name);
}
function StatusBadge({ status }: { status: PremiumAdminReviewStatus }) {
    return (
        <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-bold ${STATUS_CLASSES[status]}`}>
            {STATUS_LABELS[status]}
        </span>
    );
}

function DraftValue({
    published,
    draft,
    emptyLabel,
}: {
    published?: string;
    draft?: string;
    emptyLabel: string;
}) {
    if (draft && draft !== published) {
        return (
            <div className="space-y-1">
                <p className="line-clamp-2 text-slate-200">{draft}</p>
                {published ? <p className="line-clamp-1 text-xs text-slate-500">เผยแพร่: {published}</p> : null}
            </div>
        );
    }
    return <p className={published ? 'line-clamp-2 text-slate-200' : 'text-slate-500'}>{published || emptyLabel}</p>;
}

function EditorPanel({
    value,
    saving,
    onChange,
    onSave,
    onClose,
}: {
    value: EditorValue;
    saving: boolean;
    onChange: (value: EditorValue) => void;
    onSave: () => void;
    onClose: () => void;
}) {
    const update = <Key extends keyof EditorValue>(key: Key, next: EditorValue[Key]) => onChange({ ...value, [key]: next });
    const inputClass = 'mt-1.5 min-h-11 w-full rounded-lg border border-slate-600 bg-slate-950 px-3 text-sm text-slate-100 outline-none transition-colors focus:border-amber-400 focus:ring-2 focus:ring-amber-400/15 disabled:cursor-not-allowed disabled:bg-slate-900 disabled:text-slate-500';

    return (
        <section className="rounded-2xl border border-amber-500/25 bg-slate-900 p-4 shadow-xl shadow-slate-950/20 sm:p-6" aria-labelledby="premium-editor-title">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-xs font-bold tracking-[0.14em] text-amber-400">{value.record ? 'EDIT SHARED DETAILS' : 'ADD PREMIUM NAME'}</p>
                    <h2 id="premium-editor-title" className="mt-1 text-xl font-bold text-slate-100">
                        {value.record ? `แก้ไข ${value.record.name}` : 'เพิ่มรายชื่อ Premium'}
                    </h2>
                    <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-400">
                        คำอ่านและความหมายที่เปลี่ยนจะบันทึกเป็นฉบับร่าง เพื่อรอตรวจในหน้า “จัดการรายชื่อ”
                    </p>
                </div>
                <button type="button" onClick={onClose} aria-label="ปิดแบบฟอร์ม" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-amber-400">
                    <X className="h-5 w-5" />
                </button>
            </div>

            {value.record?.publicationStatus === 'hidden' ? (
                <div className="mt-4 flex gap-3 rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2.5 text-sm text-amber-200">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    ชื่อนี้ถูกซ่อนในข้อมูลหลัก จึงยังไม่แสดงบนหน้า Premium สาธารณะ
                </div>
            ) : null}

            <div className="mt-5 grid gap-4 md:grid-cols-2">
                <label className="text-sm font-medium text-slate-300">
                    ชื่อ
                    <input
                        autoFocus={!value.record}
                        disabled={Boolean(value.record)}
                        value={value.name}
                        maxLength={100}
                        onChange={(event) => update('name', event.target.value)}
                        className={inputClass}
                        placeholder="ชื่อภาษาไทย"
                    />
                    {value.record ? <span className="mt-1 block text-xs text-slate-500">หากต้องการเปลี่ยนชื่อ ให้เพิ่มชื่อใหม่แล้วนำชื่อเดิมออก</span> : null}
                </label>
                <label className="text-sm font-medium text-slate-300">
                    เพศ
                    <select value={value.gender} onChange={(event) => update('gender', event.target.value as PremiumAdminGender)} className={inputClass}>
                        <option value="neutral">ใช้ได้ทุกเพศ</option>
                        <option value="male">ชาย</option>
                        <option value="female">หญิง</option>
                    </select>
                </label>
                <label className="text-sm font-medium text-slate-300">
                    คำอ่านฉบับร่าง
                    <input
                        value={value.pronunciation}
                        maxLength={150}
                        onChange={(event) => update('pronunciation', event.target.value)}
                        className={inputClass}
                        placeholder="เช่น กาน-นะ"
                    />
                </label>
                <label className="text-sm font-medium text-slate-300 md:row-span-2">
                    ความหมายฉบับร่าง
                    <textarea
                        value={value.meaning}
                        maxLength={1000}
                        onChange={(event) => update('meaning', event.target.value)}
                        className={`${inputClass} min-h-28 py-3`}
                        placeholder="อธิบายความหมายของชื่อ"
                    />
                </label>
            </div>

            <div className="mt-5 flex justify-end">
                <button
                    type="button"
                    disabled={saving || !value.name.trim()}
                    onClick={onSave}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-amber-500 px-5 text-sm font-bold text-slate-950 transition-colors hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                </button>
            </div>
        </section>
    );
}

export default function AdminPremiumNamesPage() {
    const [records, setRecords] = useState<PremiumAdminRecord[]>([]);
    const [count, setCount] = useState(0);
    const [page, setPage] = useState(1);
    const [queryInput, setQueryInput] = useState('');
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [editor, setEditor] = useState<EditorValue | null>(null);
    const [showImport, setShowImport] = useState(false);
    const [importText, setImportText] = useState('');

    const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));
    const importPreview = useMemo(() => parseBulkRecords(importText), [importText]);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            setPage(1);
            setQuery(queryInput.normalize('NFC').trim());
        }, 250);
        return () => window.clearTimeout(timeoutId);
    }, [queryInput]);

    const loadRecords = useCallback(async (signal?: AbortSignal) => {
        setLoading(true);
        setError('');
        try {
            const params = new URLSearchParams({
                view: 'records',
                page: String(page),
                pageSize: String(PAGE_SIZE),
                ...(query ? { q: query } : {}),
            });
            const response = await fetch(`/api/admin/premium-names?${params}`, { cache: 'no-store', signal });
            const payload = await response.json() as RecordsResponse;
            if (!response.ok || !payload.success) throw new Error(payload.error || 'โหลดรายชื่อไม่สำเร็จ');
            setRecords(payload.records ?? []);
            setCount(payload.count ?? 0);
        } catch (loadError) {
            if (loadError instanceof DOMException && loadError.name === 'AbortError') return;
            setError(loadError instanceof Error ? loadError.message : 'โหลดรายชื่อไม่สำเร็จ');
        } finally {
            if (!signal?.aborted) setLoading(false);
        }
    }, [page, query]);

    useEffect(() => {
        const controller = new AbortController();
        void loadRecords(controller.signal);
        return () => controller.abort();
    }, [loadRecords]);

    const sendMutation = async (method: 'POST' | 'PATCH' | 'DELETE', body: unknown) => {
        setSaving(true);
        setMessage('');
        setError('');
        try {
            const response = await fetch('/api/admin/premium-names', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const payload = await response.json() as { success: boolean; error?: string; stats?: SaveStats };
            if (!response.ok || !payload.success) throw new Error(payload.error || 'บันทึกข้อมูลไม่สำเร็จ');
            await loadRecords();
            return payload;
        } catch (mutationError) {
            setError(mutationError instanceof Error ? mutationError.message : 'บันทึกข้อมูลไม่สำเร็จ');
            return null;
        } finally {
            setSaving(false);
        }
    };

    const saveEditor = async () => {
        if (!editor) return;
        if (editor.record) {
            const initialPronunciation = editor.record.pronunciationDraft ?? editor.record.pronunciation ?? '';
            const initialMeaning = editor.record.meaningDraft ?? editor.record.meaning ?? '';
            const changes: Record<string, unknown> = {};
            if (editor.gender !== editor.record.gender) changes.gender = editor.gender;
            if (editor.pronunciation.trim() !== initialPronunciation) changes.pronunciationDraft = editor.pronunciation;
            if (editor.meaning.trim() !== initialMeaning) changes.meaningDraft = editor.meaning;
            if (Object.keys(changes).length === 0) {
                setMessage('ยังไม่มีข้อมูลที่เปลี่ยนแปลง');
                return;
            }
            const payload = await sendMutation('PATCH', { id: editor.record.id, changes });
            if (payload) {
                setMessage(`บันทึกฉบับร่างของ ${editor.record.name} แล้ว`);
                setEditor(null);
            }
            return;
        }

        const payload = await sendMutation('POST', {
            records: [{
                name: editor.name,
                gender: editor.gender,
                pronunciation: editor.pronunciation,
                meaning: editor.meaning,
            }],
        });
        if (payload) {
            setMessage(payload.stats?.inserted
                ? `เพิ่ม ${editor.name.trim()} ในรายชื่อ Premium แล้ว`
                : `${editor.name.trim()} มีอยู่ใน Premium แล้ว และอัปเดตรายละเอียดที่ระบุ`);
            setEditor(null);
        }
    };

    const importRecords = async () => {
        if (importPreview.length === 0) return;
        const payload = await sendMutation('POST', { records: importPreview });
        if (!payload) return;
        const stats = payload.stats;
        setMessage(stats
            ? `เพิ่มใหม่ ${stats.inserted.toLocaleString('th-TH')} ชื่อ, ข้ามชื่อที่มีอยู่ ${stats.skippedDuplicate.toLocaleString('th-TH')} ชื่อ`
            : 'นำเข้ารายชื่อเรียบร้อย');
        setImportText('');
        setShowImport(false);
    };

    const downloadCsv = async () => {
        if (isExporting) return;
        setIsExporting(true);
        setError('');
        try {
            const params = new URLSearchParams({
                view: 'csv',
                ...(query ? { q: query } : {}),
            });
            const response = await fetch(`/api/admin/premium-names?${params}`, { cache: 'no-store' });
            if (!response.ok) {
                const payload = await response.json().catch(() => null) as { error?: string } | null;
                throw new Error(payload?.error || 'สร้างไฟล์ CSV ไม่สำเร็จ');
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = getDownloadFilename(response.headers.get('Content-Disposition'))
                ?? `premium-names-${new Date().toISOString().slice(0, 10)}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (downloadError) {
            setError(downloadError instanceof Error ? downloadError.message : 'สร้างไฟล์ CSV ไม่สำเร็จ');
        } finally {
            setIsExporting(false);
        }
    };

    const removeRecord = async (record: PremiumAdminRecord) => {
        const confirmed = window.confirm(`นำ “${record.name}” ออกจาก Premium ใช่หรือไม่?\n\nคำอ่าน ความหมาย และข้อมูลชื่อหลักจะยังคงอยู่`);
        if (!confirmed) return;
        const payload = await sendMutation('DELETE', { id: record.id });
        if (payload) {
            setMessage(`นำ ${record.name} ออกจาก Premium แล้ว โดยเก็บข้อมูลชื่อหลักไว้`);
            if (records.length === 1 && page > 1) setPage((current) => current - 1);
        }
    };

    return (
        <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-8">
            <header className="flex flex-col gap-5 border-b border-slate-700 pb-6 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <p className="text-xs font-bold tracking-[0.14em] text-amber-400">PREMIUM NAME DATABASE</p>
                    <h1 className="mt-2 flex items-center gap-3 text-2xl font-bold text-slate-100 sm:text-3xl">
                        <Crown className="h-7 w-7 text-amber-400" />
                        จัดการรายชื่อ Premium
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                        จัดการสมาชิก Premium และรายละเอียดร่วมที่ใช้ในหน้า Premium Search กับ Premium Analysis
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Link href="/admin/names" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-600 px-4 text-sm font-bold text-slate-200 transition-colors hover:border-slate-400 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400">
                        ไปจัดการข้อมูลชื่อหลัก
                    </Link>
                    <button type="button" onClick={() => void downloadCsv()} disabled={isExporting} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-emerald-500/40 px-4 text-sm font-bold text-emerald-300 transition-colors hover:bg-emerald-500/10 focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:cursor-not-allowed disabled:opacity-50">
                        {isExporting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                        {isExporting ? 'กำลังสร้าง CSV...' : 'ดาวน์โหลด CSV'}
                    </button>
                    <button type="button" onClick={() => setShowImport((current) => !current)} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-amber-500/40 px-4 text-sm font-bold text-amber-300 transition-colors hover:bg-amber-500/10 focus:outline-none focus:ring-2 focus:ring-amber-400">
                        <FileUp className="h-4 w-4" /> นำเข้าหลายชื่อ
                    </button>
                    <button type="button" onClick={() => setEditor(createEditor())} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-amber-500 px-4 text-sm font-bold text-slate-950 transition-colors hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-300">
                        <Plus className="h-4 w-4" /> เพิ่มชื่อ
                    </button>
                </div>
            </header>

            {message ? <div role="status" className="rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{message}</div> : null}
            {error ? <div role="alert" className="rounded-lg border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div> : null}

            {editor ? <EditorPanel value={editor} saving={saving} onChange={setEditor} onSave={saveEditor} onClose={() => setEditor(null)} /> : null}

            {showImport ? (
                <section className="rounded-2xl border border-slate-700 bg-slate-900 p-4 sm:p-6" aria-labelledby="premium-import-title">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <h2 id="premium-import-title" className="text-lg font-bold text-slate-100">นำเข้าหลายชื่อ</h2>
                            <p className="mt-1 text-sm leading-6 text-slate-400">หนึ่งชื่อต่อบรรทัด: ชื่อ | คำอ่าน | ความหมาย | male, female หรือ neutral</p>
                        </div>
                        <button type="button" onClick={() => setShowImport(false)} aria-label="ปิดส่วนนำเข้า" className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800"><X className="h-5 w-5" /></button>
                    </div>
                    <textarea
                        value={importText}
                        onChange={(event) => setImportText(event.target.value)}
                        className="mt-4 min-h-40 w-full rounded-lg border border-slate-600 bg-slate-950 p-3 font-mono text-sm leading-6 text-slate-200 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/15"
                        placeholder={'กานต์ | กาน | เป็นที่รัก | neutral\nณวิธ | นะ-วิด | ผู้รู้และนำทาง | male'}
                    />
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm text-slate-400">ตรวจพบ {importPreview.length.toLocaleString('th-TH')} รายการ, สูงสุด 500 รายการต่อครั้ง</p>
                        <button type="button" disabled={saving || importPreview.length === 0 || importPreview.length > 500} onClick={importRecords} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-amber-500 px-5 text-sm font-bold text-slate-950 hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50">
                            {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <FileUp className="h-4 w-4" />}
                            ยืนยันนำเข้า
                        </button>
                    </div>
                </section>
            ) : null}

            <section className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-900" aria-labelledby="premium-list-title">
                <div className="flex flex-col gap-4 border-b border-slate-700 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 id="premium-list-title" className="font-bold text-slate-100">รายชื่อทั้งหมด {count.toLocaleString('th-TH')} ชื่อ</h2>
                        <p className="mt-1 text-xs text-slate-500">ชื่อที่ซ่อนในข้อมูลหลักจะไม่ปรากฏบนหน้าสาธารณะ</p>
                    </div>
                    <div className="flex gap-2">
                        <label className="relative min-w-0 flex-1 sm:w-72 sm:flex-none">
                            <span className="sr-only">ค้นหารายชื่อ Premium</span>
                            <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                            <input
                                value={queryInput}
                                onChange={(event) => setQueryInput(event.target.value)}
                                className="min-h-11 w-full rounded-lg border border-slate-600 bg-slate-950 pl-9 pr-3 text-sm text-slate-100 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/15"
                                placeholder="ค้นหาชื่อ"
                            />
                        </label>
                        <button type="button" onClick={() => void loadRecords()} disabled={loading} aria-label="รีเฟรชรายชื่อ" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-800 disabled:opacity-50">
                            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="space-y-3 p-5" aria-label="กำลังโหลดรายชื่อ">
                        {[0, 1, 2, 3].map((item) => <div key={item} className="h-14 animate-pulse rounded-lg bg-slate-800" />)}
                    </div>
                ) : records.length === 0 ? (
                    <div className="px-5 py-14 text-center">
                        <Crown className="mx-auto h-8 w-8 text-slate-600" />
                        <p className="mt-3 font-bold text-slate-200">{query ? 'ไม่พบชื่อที่ค้นหา' : 'ยังไม่มีรายชื่อ Premium'}</p>
                        <p className="mt-1 text-sm text-slate-500">{query ? 'ลองค้นหาด้วยคำที่สั้นลง' : 'เริ่มต้นด้วยปุ่ม “เพิ่มชื่อ” ด้านบน'}</p>
                    </div>
                ) : (
                    <>
                        <div className="hidden overflow-x-auto md:block">
                            <table className="w-full min-w-[960px] text-left text-sm">
                                <thead className="bg-slate-950/70 text-xs text-slate-400">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold">ชื่อ</th>
                                        <th className="px-4 py-3 font-semibold">เพศ</th>
                                        <th className="px-4 py-3 font-semibold">คำอ่าน</th>
                                        <th className="px-4 py-3 font-semibold">ความหมาย</th>
                                        <th className="px-4 py-3 font-semibold">เผยแพร่</th>
                                        <th className="px-4 py-3 text-right font-semibold">จัดการ</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {records.map((record) => (
                                        <tr key={record.id} className="align-top text-slate-300 hover:bg-slate-800/35">
                                            <td className="px-4 py-4"><strong className="text-base text-slate-100">{record.name}</strong></td>
                                            <td className="px-4 py-4">{GENDER_LABELS[record.gender]}</td>
                                            <td className="max-w-52 px-4 py-4"><DraftValue published={record.pronunciation} draft={record.pronunciationDraft} emptyLabel="ยังไม่มีคำอ่าน" /><div className="mt-2"><StatusBadge status={record.pronunciationStatus} /></div></td>
                                            <td className="max-w-80 px-4 py-4"><DraftValue published={record.meaning} draft={record.meaningDraft} emptyLabel="ยังไม่มีความหมาย" /><div className="mt-2"><StatusBadge status={record.meaningStatus} /></div></td>
                                            <td className="px-4 py-4">
                                                <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-bold ${record.publicationStatus === 'published' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-amber-500/30 bg-amber-500/10 text-amber-300'}`}>
                                                    {record.publicationStatus === 'published' ? 'แสดง' : 'ซ่อน'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex justify-end gap-2">
                                                    <button type="button" onClick={() => setEditor(createEditor(record))} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-slate-600 px-3 text-xs font-bold text-slate-200 hover:border-amber-400 hover:text-amber-300"><Pencil className="h-3.5 w-3.5" />แก้ไข</button>
                                                    <button type="button" onClick={() => void removeRecord(record)} disabled={saving} aria-label={`นำ ${record.name} ออกจาก Premium`} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-600 text-rose-400 hover:border-rose-400 hover:bg-rose-500/10 disabled:opacity-50"><Trash2 className="h-4 w-4" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="divide-y divide-slate-800 md:hidden">
                            {records.map((record) => (
                                <article key={record.id} className="p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div><h3 className="text-lg font-bold text-slate-100">{record.name}</h3><p className="mt-0.5 text-xs text-slate-500">{GENDER_LABELS[record.gender]}</p></div>
                                        <span className={`rounded-full border px-2 py-1 text-xs font-bold ${record.publicationStatus === 'published' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-amber-500/30 bg-amber-500/10 text-amber-300'}`}>{record.publicationStatus === 'published' ? 'แสดง' : 'ซ่อน'}</span>
                                    </div>
                                    <dl className="mt-4 grid gap-4">
                                        <div><dt className="mb-1 flex items-center gap-2 text-xs font-bold text-slate-500">คำอ่าน <StatusBadge status={record.pronunciationStatus} /></dt><dd><DraftValue published={record.pronunciation} draft={record.pronunciationDraft} emptyLabel="ยังไม่มีคำอ่าน" /></dd></div>
                                        <div><dt className="mb-1 flex items-center gap-2 text-xs font-bold text-slate-500">ความหมาย <StatusBadge status={record.meaningStatus} /></dt><dd><DraftValue published={record.meaning} draft={record.meaningDraft} emptyLabel="ยังไม่มีความหมาย" /></dd></div>
                                    </dl>
                                    <div className="mt-4 flex gap-2">
                                        <button type="button" onClick={() => setEditor(createEditor(record))} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-slate-600 text-sm font-bold text-slate-200 hover:border-amber-400 hover:text-amber-300"><Pencil className="h-4 w-4" />แก้ไข</button>
                                        <button type="button" onClick={() => void removeRecord(record)} disabled={saving} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-rose-500/30 text-sm font-bold text-rose-300 hover:bg-rose-500/10 disabled:opacity-50"><Trash2 className="h-4 w-4" />นำออก</button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </>
                )}

                <div className="flex items-center justify-between gap-3 border-t border-slate-700 px-4 py-3">
                    <p className="text-xs text-slate-500">หน้า {page.toLocaleString('th-TH')} จาก {totalPages.toLocaleString('th-TH')}</p>
                    <div className="flex gap-2">
                        <button type="button" disabled={page <= 1 || loading} onClick={() => setPage((current) => Math.max(1, current - 1))} className="inline-flex min-h-10 items-center gap-1 rounded-lg border border-slate-600 px-3 text-sm font-bold text-slate-300 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft className="h-4 w-4" />ก่อนหน้า</button>
                        <button type="button" disabled={page >= totalPages || loading} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} className="inline-flex min-h-10 items-center gap-1 rounded-lg border border-slate-600 px-3 text-sm font-bold text-slate-300 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40">ถัดไป<ChevronRight className="h-4 w-4" /></button>
                    </div>
                </div>
            </section>
        </div>
    );
}
