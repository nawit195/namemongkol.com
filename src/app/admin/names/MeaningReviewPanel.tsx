'use client';

import { useCallback, useEffect, useState } from 'react';
import { Check, RefreshCw, Search, Sparkles, X } from 'lucide-react';

type MeaningStatus = 'pending' | 'draft' | 'approved' | 'rejected';

type MeaningRecord = {
    id: string;
    name: string;
    gender: string;
    meaning: string | null;
    meaning_draft: string | null;
    meaning_status: MeaningStatus;
    meaning_source: string | null;
    meaning_review_notes: string | null;
};

const STATUS_LABELS: Record<MeaningStatus, string> = {
    pending: 'รอสร้างร่าง',
    draft: 'รอตรวจ',
    approved: 'อนุมัติแล้ว',
    rejected: 'ปฏิเสธ',
};

const EMPTY_COUNTS: Record<MeaningStatus, number> = { pending: 0, draft: 0, approved: 0, rejected: 0 };

export default function MeaningReviewPanel() {
    const [status, setStatus] = useState<MeaningStatus>('draft');
    const [query, setQuery] = useState('');
    const [records, setRecords] = useState<MeaningRecord[]>([]);
    const [counts, setCounts] = useState(EMPTY_COUNTS);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [savingId, setSavingId] = useState<string | null>(null);
    const [message, setMessage] = useState('');

    const loadRecords = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ view: 'meaning-review', status });
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

    const generateDrafts = async () => {
        setGenerating(true);
        setMessage('');
        try {
            const response = await fetch('/api/admin/names', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'generate_meaning_drafts' }),
            });
            const payload = await response.json();
            if (!response.ok || !payload.success) throw new Error(payload.error || 'สร้างร่างไม่สำเร็จ');
            setMessage(`ประมวลผล ${payload.processed} ชื่อ สร้างร่าง ${payload.drafted} ชื่อ และรอตรวจรากศัพท์ ${payload.blocked} ชื่อ`);
            setStatus(payload.drafted > 0 ? 'draft' : 'pending');
            await loadRecords();
        } catch (error) {
            setMessage(error instanceof Error ? error.message : 'สร้างร่างไม่สำเร็จ');
        } finally {
            setGenerating(false);
        }
    };

    const updateRecord = async (record: MeaningRecord, decision: 'save' | 'approved' | 'rejected') => {
        setSavingId(record.id);
        setMessage('');
        try {
            const response = await fetch('/api/admin/names', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(decision === 'save'
                    ? { action: 'save_meaning_draft', id: record.id, meaningDraft: record.meaning_draft }
                    : { action: 'review_meaning', id: record.id, meaningDraft: record.meaning_draft, decision }),
            });
            const payload = await response.json();
            if (!response.ok || !payload.success) throw new Error(payload.error || 'บันทึกไม่สำเร็จ');
            setRecords((current) => current.filter((item) => item.id !== record.id));
            setCounts((current) => ({
                ...current,
                [status]: Math.max(0, current[status] - 1),
                ...(decision === 'approved' ? { approved: current.approved + 1 } : {}),
                ...(decision === 'rejected' ? { rejected: current.rejected + 1 } : {}),
            }));
        } catch (error) {
            setMessage(error instanceof Error ? error.message : 'บันทึกไม่สำเร็จ');
        } finally {
            setSavingId(null);
        }
    };

    return (
        <section className="space-y-5" aria-labelledby="meaning-review-heading">
            <div className="flex flex-col gap-4 border-b border-slate-700 pb-5 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <h2 id="meaning-review-heading" className="text-2xl font-black text-white">ตรวจและอนุมัติความหมาย</h2>
                    <p className="mt-1 text-sm leading-6 text-slate-400">ชื่อจะขึ้นหน้า Search หลังผู้ดูแลตรวจและกดอนุมัติเท่านั้น</p>
                </div>
                <button
                    type="button"
                    onClick={generateDrafts}
                    disabled={generating || counts.pending === 0}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-bold text-slate-950 transition-colors hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <Sparkles className="h-4 w-4" />
                    {generating ? 'กำลังสร้างร่าง...' : 'สร้างร่างชุดถัดไป 20 ชื่อ'}
                </button>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="สถานะความหมาย">
                {(Object.keys(STATUS_LABELS) as MeaningStatus[]).map((item) => (
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
                    <span className="sr-only">ค้นหาชื่อ</span>
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
                        {records.map((record) => (
                            <article key={record.id} className="grid gap-4 p-4 lg:grid-cols-[12rem_1fr_auto] lg:items-start">
                                <div>
                                    <h3 className="text-lg font-black text-white">{record.name}</h3>
                                    <p className="mt-1 text-xs text-slate-500">{record.meaning_source || 'ยังไม่มีแหล่งที่มา'}</p>
                                    {record.meaning_review_notes ? <p className="mt-2 text-xs leading-5 text-slate-400">{record.meaning_review_notes}</p> : null}
                                </div>
                                <textarea
                                    value={record.meaning_draft ?? record.meaning ?? ''}
                                    onChange={(event) => setRecords((current) => current.map((item) => item.id === record.id ? { ...item, meaning_draft: event.target.value } : item))}
                                    rows={3}
                                    aria-label={`ร่างความหมายชื่อ ${record.name}`}
                                    className="w-full resize-y rounded-lg border border-slate-700 bg-slate-900 p-3 text-sm leading-6 text-slate-100 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                                />
                                <div className="flex gap-2 lg:flex-col">
                                    <button type="button" disabled={savingId === record.id} onClick={() => void updateRecord(record, 'approved')} className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 text-sm font-bold text-white hover:bg-emerald-500 disabled:opacity-50"><Check className="h-4 w-4" /> อนุมัติ</button>
                                    <button type="button" disabled={savingId === record.id} onClick={() => void updateRecord(record, 'save')} className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-600 px-3 text-sm font-semibold text-slate-200 hover:bg-slate-800 disabled:opacity-50">บันทึกร่าง</button>
                                    <button type="button" disabled={savingId === record.id} onClick={() => void updateRecord(record, 'rejected')} className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-rose-500/50 px-3 text-sm font-semibold text-rose-300 hover:bg-rose-500/10 disabled:opacity-50"><X className="h-4 w-4" /> ปฏิเสธ</button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
