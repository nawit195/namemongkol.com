'use client';

import { useCallback, useEffect, useState } from 'react';
import { Check, RefreshCw, Search, Volume2, X } from 'lucide-react';
import { getPronunciationApprovalIssues, normalizePronunciationText, normalizePronunciationVariants } from '@/lib/thaiPronunciation';
import LinguisticEvidenceEditor, { type EvidenceValue } from './LinguisticEvidenceEditor';

type PronunciationStatus = 'pending' | 'draft' | 'approved' | 'rejected';

type PronunciationRecord = {
    id: string;
    name: string;
    pronunciation: string | null;
    pronunciation_draft: string | null;
    pronunciation_variants: string[] | null;
    pronunciation_evidence: EvidenceValue | null;
    pronunciation_status: PronunciationStatus;
    pronunciation_source: string | null;
    pronunciation_review_notes: string | null;
    publication_status: 'published' | 'hidden' | null;
    publication_reason: string | null;
    publication_evidence: EvidenceValue | null;
};

const STATUS_LABELS: Record<PronunciationStatus, string> = {
    pending: 'รอตรวจ',
    draft: 'ร่างที่แก้แล้ว',
    approved: 'อนุมัติแล้ว',
    rejected: 'ไม่เผยแพร่',
};

const ISSUE_LABELS: Record<string, string> = {
    blank: 'ยังไม่มีคำอ่าน',
    'contains-space': 'มีช่องว่างภายในคำอ่าน',
    'dangling-separator': 'เครื่องหมายแบ่งพยางค์อยู่ต้นหรือท้าย',
    'invalid-vowel-sequence': 'ลำดับรูปสระไม่ถูกต้อง',
    'detached-leading-vowel': 'สระนำถูกแยกจากพยัญชนะ',
    'detached-thai-mark': 'เครื่องหมายภาษาไทยถูกแยกจากพยัญชนะ',
    'unsupported-character': 'มีอักขระที่ไม่รองรับ',
    'technical-pinthu': 'มีเครื่องหมายพินทุเชิงสัทศาสตร์',
    'missing-evidence': 'ยังไม่มีหลักฐานภาษา',
    'missing-roots': 'ยังไม่ระบุรากศัพท์ครบ',
    'missing-sources': 'ยังไม่มีแหล่งอ้างอิงที่ตรวจสอบได้',
};

const EMPTY_COUNTS: Record<PronunciationStatus, number> = { pending: 0, draft: 0, approved: 0, rejected: 0 };

export default function PronunciationReviewPanel() {
    const [status, setStatus] = useState<PronunciationStatus>('pending');
    const [query, setQuery] = useState('');
    const [records, setRecords] = useState<PronunciationRecord[]>([]);
    const [counts, setCounts] = useState(EMPTY_COUNTS);
    const [loading, setLoading] = useState(true);
    const [savingId, setSavingId] = useState<string | null>(null);
    const [message, setMessage] = useState('');

    const loadRecords = useCallback(async () => {
        setLoading(true);
        setMessage('');
        try {
            const params = new URLSearchParams({ view: 'pronunciation-review', status });
            if (query.trim()) params.set('q', query.trim());
            const response = await fetch(`/api/admin/names?${params}`, { cache: 'no-store' });
            const payload = await response.json();
            if (!response.ok || !payload.success) throw new Error(payload.error || 'โหลดข้อมูลไม่สำเร็จ');
            setRecords(payload.records ?? []);
            setCounts({ ...EMPTY_COUNTS, ...(payload.counts ?? {}) });
        } catch (error) {
            setMessage(error instanceof Error ? error.message : 'โหลดข้อมูลไม่สำเร็จ');
        } finally {
            setLoading(false);
        }
    }, [query, status]);

    useEffect(() => {
        void loadRecords();
    }, [loadRecords]);

    const updateRecord = async (record: PronunciationRecord, decision: 'save' | 'approved' | 'rejected') => {
        const draft = normalizePronunciationText(record.pronunciation_draft ?? record.pronunciation ?? '');
        const issues = getPronunciationApprovalIssues(draft, record.pronunciation_variants, record.pronunciation_evidence);
        if (decision === 'approved' && issues.length > 0) {
            setMessage(`ยังอนุมัติ ${record.name} ไม่ได้: ${issues.map((issue) => ISSUE_LABELS[issue] ?? issue).join(', ')}`);
            return;
        }

        setSavingId(record.id);
        setMessage('');
        try {
            const response = await fetch('/api/admin/names', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(decision === 'save'
                    ? { action: 'save_pronunciation_draft', id: record.id, pronunciationDraft: draft, pronunciationVariants: record.pronunciation_variants, pronunciationEvidence: record.pronunciation_evidence }
                    : { action: 'review_pronunciation', id: record.id, pronunciationDraft: draft, pronunciationVariants: record.pronunciation_variants, pronunciationEvidence: record.pronunciation_evidence, decision }),
            });
            const payload = await response.json();
            if (!response.ok || !payload.success) throw new Error(payload.error || 'บันทึกไม่สำเร็จ');
            await loadRecords();
        } catch (error) {
            setMessage(error instanceof Error ? error.message : 'บันทึกไม่สำเร็จ');
        } finally {
            setSavingId(null);
        }
    };

    const updatePublication = async (record: PronunciationRecord, publicationStatus: 'published' | 'hidden') => {
        setSavingId(record.id);
        setMessage('');
        try {
            const publicationReason = publicationStatus === 'hidden'
                ? record.publication_reason || 'ซ่อนจนกว่าจะยืนยันรากศัพท์และคำอ่านได้ครบ'
                : 'ตรวจรากศัพท์และคำอ่านแล้ว';
            const response = await fetch('/api/admin/names', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'set_name_publication',
                    id: record.id,
                    publicationStatus,
                    publicationReason,
                    publicationEvidence: record.publication_evidence ?? record.pronunciation_evidence ?? {},
                }),
            });
            const payload = await response.json();
            if (!response.ok || !payload.success) throw new Error(payload.error || 'บันทึกสถานะเผยแพร่ไม่สำเร็จ');
            await loadRecords();
        } catch (error) {
            setMessage(error instanceof Error ? error.message : 'บันทึกสถานะเผยแพร่ไม่สำเร็จ');
        } finally {
            setSavingId(null);
        }
    };

    return (
        <section className="space-y-5" aria-labelledby="pronunciation-review-heading">
            <div className="border-b border-slate-700 pb-5">
                <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-400/15 text-amber-300">
                        <Volume2 className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div>
                        <h2 id="pronunciation-review-heading" className="text-2xl font-black text-white">ตรวจและอนุมัติคำอ่าน</h2>
                        <p className="mt-1 text-sm leading-6 text-slate-400">หน้า Search ยังคงแสดงคำอ่านที่รอตรวจพร้อมสถานะ แต่การอนุมัติต้องมีรากศัพท์และแหล่งอ้างอิงครบ</p>
                    </div>
                </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="สถานะคำอ่าน">
                {(Object.keys(STATUS_LABELS) as PronunciationStatus[]).map((item) => (
                    <button
                        key={item}
                        type="button"
                        role="tab"
                        aria-selected={status === item}
                        onClick={() => setStatus(item)}
                        className={`min-h-11 shrink-0 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${status === item ? 'border-amber-400 bg-amber-400/15 text-amber-200' : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500'}`}
                    >
                        {STATUS_LABELS[item]} <span className="ml-1 tabular-nums">{counts[item].toLocaleString('th-TH')}</span>
                    </button>
                ))}
            </div>

            <form className="flex gap-2" onSubmit={(event) => { event.preventDefault(); void loadRecords(); }}>
                <label className="relative flex-1">
                    <span className="sr-only">ค้นหาชื่อเพื่อตรวจคำอ่าน</span>
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="ค้นหาชื่อที่ต้องการตรวจ"
                        className="min-h-11 w-full rounded-lg border border-slate-700 bg-slate-950 pl-10 pr-3 text-sm text-white outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                    />
                </label>
                <button type="submit" className="min-h-11 rounded-lg border border-slate-600 px-4 text-sm font-bold text-slate-200 hover:bg-slate-800">ค้นหา</button>
            </form>

            {message ? <p role="status" className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">{message}</p> : null}

            <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-950">
                {loading ? (
                    <div className="flex min-h-40 items-center justify-center gap-2 text-slate-400"><RefreshCw className="h-4 w-4 animate-spin" /> กำลังโหลด</div>
                ) : records.length === 0 ? (
                    <div className="min-h-40 p-8 text-center text-sm text-slate-400">ไม่พบรายการในสถานะนี้</div>
                ) : (
                    <div className="divide-y divide-slate-800">
                        {records.map((record) => <PronunciationReviewRow key={record.id} record={record} saving={savingId === record.id} onChange={(change) => setRecords((current) => current.map((item) => item.id === record.id ? { ...item, ...change } : item))} onAction={(decision) => void updateRecord(record, decision)} onPublication={(status) => void updatePublication(record, status)} />)}
                    </div>
                )}
            </div>
        </section>
    );
}

function PronunciationReviewRow({ record, saving, onChange, onAction, onPublication }: {
    record: PronunciationRecord;
    saving: boolean;
    onChange: (value: Partial<PronunciationRecord>) => void;
    onAction: (decision: 'save' | 'approved' | 'rejected') => void;
    onPublication: (status: 'published' | 'hidden') => void;
}) {
    const draft = record.pronunciation_draft ?? record.pronunciation ?? '';
    const variants = normalizePronunciationVariants(record.pronunciation_variants);
    const issues = getPronunciationApprovalIssues(draft, variants, record.pronunciation_evidence);

    return (
        <article className="grid gap-4 p-4 lg:grid-cols-[12rem_1fr_auto] lg:items-start">
            <div>
                <h3 className="text-lg font-black text-white">{record.name}</h3>
                <p className={`mt-1 text-xs font-bold ${record.publication_status === 'hidden' ? 'text-rose-300' : 'text-emerald-300'}`}>
                    {record.publication_status === 'hidden' ? 'ซ่อนจากหน้าสาธารณะ' : 'เผยแพร่ชื่อ'}
                </p>
                <p className="mt-1 text-xs text-slate-500">{record.pronunciation_source || 'ยังไม่มีแหล่งที่มา'}</p>
                {record.pronunciation_review_notes ? <p className="mt-2 text-xs leading-5 text-slate-400">{record.pronunciation_review_notes}</p> : null}
            </div>
            <div>
                <input
                    value={draft}
                    onChange={(event) => onChange({ pronunciation_draft: event.target.value })}
                    aria-label={`คำอ่านชื่อ ${record.name}`}
                    className="min-h-11 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 text-base font-semibold text-slate-100 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                />
                <input
                    value={variants.join(' / ')}
                    onChange={(event) => onChange({ pronunciation_variants: event.target.value.split('/').map((item) => normalizePronunciationText(item)).filter(Boolean) })}
                    aria-label={`คำอ่านอื่นของชื่อ ${record.name}`}
                    placeholder="คำอ่านอื่น คั่นด้วย /"
                    className="mt-2 min-h-11 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 text-sm text-slate-100 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                />
                <LinguisticEvidenceEditor value={record.pronunciation_evidence} onChange={(value) => onChange({ pronunciation_evidence: value })} />
                <p className={`mt-2 text-xs leading-5 ${issues.length > 0 ? 'text-amber-300' : 'text-emerald-300'}`}>
                    {issues.length > 0 ? issues.map((issue) => ISSUE_LABELS[issue] ?? issue).join(' · ') : 'รูปแบบพร้อมสำหรับอนุมัติ'}
                </p>
            </div>
            <div className="flex gap-2 lg:flex-col">
                <button type="button" disabled={saving || issues.length > 0} onClick={() => onAction('approved')} className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 text-sm font-bold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"><Check className="h-4 w-4" /> อนุมัติ</button>
                <button type="button" disabled={saving || !draft.trim()} onClick={() => onAction('save')} className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-600 px-3 text-sm font-semibold text-slate-200 hover:bg-slate-800 disabled:opacity-40">บันทึกร่าง</button>
                <button type="button" disabled={saving} onClick={() => onAction('rejected')} className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-rose-500/50 px-3 text-sm font-semibold text-rose-300 hover:bg-rose-500/10 disabled:opacity-40"><X className="h-4 w-4" /> ไม่เผยแพร่คำอ่าน</button>
                {record.publication_status === 'hidden' ? (
                    <button type="button" disabled={saving} onClick={() => onPublication('published')} className="inline-flex min-h-11 items-center justify-center rounded-lg border border-sky-500/50 px-3 text-sm font-semibold text-sky-300 hover:bg-sky-500/10 disabled:opacity-40">กู้คืนชื่อ</button>
                ) : (
                    <button type="button" disabled={saving} onClick={() => onPublication('hidden')} className="inline-flex min-h-11 items-center justify-center rounded-lg border border-rose-700/60 bg-rose-950/20 px-3 text-sm font-semibold text-rose-200 hover:bg-rose-950/40 disabled:opacity-40">ซ่อนทั้งชื่อ</button>
                )}
            </div>
        </article>
    );
}
