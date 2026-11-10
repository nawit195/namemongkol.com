'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { FileText, Download, History } from 'lucide-react';
import { COMPARISON_REPORT_COST, type ComparisonInput, type ComparisonReport, type ComparisonReportListItem } from '@/lib/comparisonReport';
import type { NameComparison } from '@/lib/nameComparison';
import { trackEvent } from '@/lib/analytics';
import { supabase } from '@/utils/supabase';
import { ComparisonReportContent } from './ComparisonReportContent';
import styles from './comparison.module.css';

export const COMPARISON_DRAFT_KEY = 'namemongkol:comparison-draft:v1';
const API = '/api/compare-names/reports';
type Quote = { input: ComparisonInput; balance: number; cost: number };
const track = (event: string, count?: number) => void trackEvent(`compare_names.report.${event}`, { metadata: { ...(count ? { count } : {}), cost: COMPARISON_REPORT_COST } });

async function readResponse(response: Response) {
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || (response.status === 402 ? 'เครดิตไม่เพียงพอ กรุณาเติมเครดิตแล้วลองใหม่' : 'เปิดรายงานไม่สำเร็จ กรุณาลองใหม่'));
    return body;
}

export function ComparisonReports({ rows }: { rows: NameComparison[] | null }) {
    const [history, setHistory] = useState<ComparisonReportListItem[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [reload, setReload] = useState(0);
    const [signedIn, setSignedIn] = useState<boolean | null>(null);
    const [available, setAvailable] = useState(false);
    const [balance, setBalance] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [historyError, setHistoryError] = useState('');
    const [report, setReport] = useState<ComparisonReport | null>(null);
    const [quote, setQuote] = useState<Quote | null>(null);
    const [downloading, setDownloading] = useState(false);
    const [downloadError, setDownloadError] = useState('');
    const dialog = useRef<HTMLDialogElement>(null);
    const exportRef = useRef<HTMLDivElement>(null);
    const activeReport = useRef<HTMLElement>(null);
    const requestVersion = useRef(0);
    const authUserId = useRef<string | null | undefined>(undefined);
    const invalidateRequests = useCallback(() => { requestVersion.current++; }, []);

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true); setHistoryError(''); setAvailable(false);
        fetch(`${API}?page=${page}`, { signal: controller.signal, cache: 'no-store' }).then(async response => {
            if (response.status === 401) {
                if (!controller.signal.aborted) { setSignedIn(false); setHistory([]); setReport(null); setBalance(null); setTotal(0); }
                return;
            }
            const body = await readResponse(response);
            if (!controller.signal.aborted) { setSignedIn(true); setHistory(body.reports); setTotal(body.total); setBalance(body.remainingCredits); setAvailable(body.available); }
        }).catch(() => { if (!controller.signal.aborted) setHistoryError('ระบบรายงานยังไม่พร้อม หรือติดต่อไม่ได้ การเปรียบเทียบ 2–3 ชื่อฟรียังใช้ได้'); })
            .finally(() => { if (!controller.signal.aborted) setLoading(false); });
        return () => controller.abort();
    }, [page, reload]);

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            const nextUserId = session?.user.id ?? null;
            if (event === 'INITIAL_SESSION') { authUserId.current = nextUserId; return; }
            if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
                // Supabase also emits SIGNED_IN when the same session regains focus.
                if (authUserId.current === nextUserId) return;
                authUserId.current = nextUserId;
                requestVersion.current++;
                setReport(null); setQuote(null); dialog.current?.close(); setHistory([]); setBalance(null);
                setReload(value => value + 1);
            }
        });
        return () => { subscription.unsubscribe(); invalidateRequests(); };
    }, [invalidateRequests]);

    useEffect(() => { requestVersion.current++; setQuote(null); setReport(null); setDownloadError(''); dialog.current?.close(); setError(''); }, [rows]);

    const login = useCallback((input?: ComparisonInput) => {
        if (input) {
            try { sessionStorage.setItem(COMPARISON_DRAFT_KEY, JSON.stringify(input)); }
            catch { setError('เบราว์เซอร์ไม่อนุญาตให้เก็บแบบฟอร์ม กรุณาจดชื่อไว้ก่อนเข้าสู่ระบบ'); return; }
        }
        window.location.assign('/login?redirect=%2Fcompare-names');
    }, []);

    function showReport(value: ComparisonReport) {
        setReport(value); setDownloadError('');
        requestAnimationFrame(() => { activeReport.current?.focus({ preventScroll: true }); activeReport.current?.scrollIntoView({ behavior: 'instant', block: 'start' }); });
    }

    async function preview() {
        if (!rows?.length || busy) return;
        const input = { names: rows.map(row => row.name), surname: rows[0].surname, day: rows[0].day };
        track('unlock_click', rows.length);
        if (signedIn === false) { login(input); return; }
        const version = ++requestVersion.current;
        setBusy(true); setError('');
        try {
            const response = await fetch(`${API}?preview=1`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input), cache: 'no-store' });
            if (version !== requestVersion.current) return;
            if (response.status === 401) { login(input); return; }
            const body = await readResponse(response);
            if (version !== requestVersion.current) return;
            setBalance(body.remainingCredits);
            if (body.report) { showReport(body.report); track('unlock_reopen', rows.length); return; }
            setQuote({ input, balance: body.remainingCredits, cost: body.cost });
            dialog.current?.showModal();
            track('unlock_confirmation', rows.length);
            if (body.remainingCredits < body.cost) track('unlock_insufficient', rows.length);
        } catch (failure) { if (version === requestVersion.current) setError(failure instanceof Error ? failure.message : 'เปิดรายงานไม่สำเร็จ'); }
        finally { setBusy(false); }
    }

    async function purchase() {
        if (!quote || busy) return;
        const version = ++requestVersion.current;
        setBusy(true); setError('');
        track('unlock_confirm', quote.input.names.length);
        try {
            const response = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(quote.input), cache: 'no-store' });
            const body = await response.json();
            if (version !== requestVersion.current) return;
            if (response.status === 401) { dialog.current?.close(); login(quote.input); return; }
            if (response.status === 402) {
                setBalance(body.remainingCredits); setQuote(previous => previous ? { ...previous, balance: body.remainingCredits } : null);
                track('unlock_insufficient', quote.input.names.length); return;
            }
            if (!response.ok) throw new Error(body.error || 'บันทึกไม่สำเร็จ กรุณาลองใหม่');
            setBalance(body.remainingCredits); dialog.current?.close(); setQuote(null); showReport(body.report);
            track(body.status === 'already_unlocked' ? 'unlock_reopen' : 'unlock_success', quote.input.names.length);
            setPage(1); setReload(value => value + 1);
        } catch (failure) { if (version === requestVersion.current) setError(failure instanceof Error ? failure.message : 'บันทึกไม่สำเร็จ หากการเชื่อมต่อขาดให้ลองใหม่ ชุดเดิมไม่หักซ้ำ'); }
        finally { setBusy(false); }
    }

    async function openSaved(id: string) {
        if (busy) return;
        const version = ++requestVersion.current;
        setBusy(true); setError('');
        try {
            const body = await readResponse(await fetch(`${API}/${id}`, { cache: 'no-store' }));
            if (version === requestVersion.current) { showReport(body.report); track('unlock_reopen'); }
        } catch (failure) { if (version === requestVersion.current) setError(failure instanceof Error ? failure.message : 'เปิดรายงานไม่สำเร็จ'); }
        finally { setBusy(false); }
    }

    async function download(format: 'pdf' | 'csv') {
        if (!report || downloading) return;
        setDownloading(true); setDownloadError('');
        try {
            const exports = await import('@/lib/comparisonReportDownload');
            if (format === 'csv') exports.downloadComparisonCsv(report);
            else {
                if (!exportRef.current) throw new Error('Report not ready');
                await exports.downloadComparisonPdf(report, exportRef.current);
            }
            track(`download_${format}`, report.snapshot.rows.length);
        } catch { setDownloadError('ดาวน์โหลดไม่สำเร็จ กรุณาลองใหม่ได้โดยไม่เสียเครดิตเพิ่ม'); }
        finally { setDownloading(false); }
    }

    return <div className={styles.reports}>
        {rows && <section className={styles.reportOffer} aria-labelledby="report-offer-title">
            <FileText size={24} aria-hidden="true" /><h2 id="report-offer-title">เก็บผลไว้คุยกับคนในครอบครัว</h2>
            <p>รายงานสรุปจุดเด่นและข้อควรพิจารณา แยกกลุ่มเกรดสูงสุดกับชื่อที่ไม่มีกาลกิณี พร้อมประวัติและ PDF/CSV</p>
            <details className={styles.reportExample}><summary>ดูตัวอย่างสิ่งที่จะได้รับ</summary><p>เช่น “ชื่อ ก ได้เกรดสูงสุด แต่พบกาลกิณีในชื่อ ส่วนชื่อ ข ไม่มีกาลกิณี แต่เกรดต่ำกว่า” รายงานจะแสดงทั้งสองเกณฑ์แยกกัน ไม่ฟันธงแทนคุณ</p></details>
            <button type="button" className={styles.reportPrimary} disabled={busy || loading || !!historyError || (signedIn === true && !available)} onClick={preview}>{busy ? 'กำลังตรวจสอบ…' : 'บันทึกและเปิดรายงานสรุป · 5 เครดิต'}</button>
            <p className={styles.reportMeta}>ชุดเดิมเปิดซ้ำและดาวน์โหลดได้ตลอด ไม่หักเพิ่ม · {balance !== null ? `เครดิตคงเหลือ ${balance}` : 'เข้าสู่ระบบเมื่อเปิดรายงาน'} · ยืนยันก่อนหักเครดิต</p>
            {!loading && signedIn === true && !available && <p className={styles.reportMeta}>บริการบันทึกรายงานยังไม่พร้อม การเปรียบเทียบ 2–3 ชื่อฟรียังใช้ได้ตามปกติ</p>}
        </section>}

        {error && !quote && <p role="alert" className={styles.reportWarning}>{error}</p>}
        {report && <section ref={activeReport} tabIndex={-1} className={styles.reportPanel} aria-label="รายงานที่บันทึกแล้ว">
            <div className={styles.reportActions}><button type="button" onClick={() => download('pdf')} disabled={downloading}><Download size={16} aria-hidden="true" />{downloading ? 'กำลังเตรียมไฟล์…' : 'ดาวน์โหลด PDF'}</button><button type="button" onClick={() => download('csv')} disabled={downloading}>ดาวน์โหลด CSV</button></div>
            {downloadError && <p role="alert" className={styles.reportWarning}>{downloadError}</p>}
            <ComparisonReportContent report={report} />
            <div className={styles.reportExport} aria-hidden="true" inert><div ref={exportRef}><ComparisonReportContent report={report} exportMode /></div></div>
        </section>}

        <section className={styles.reportHistory} aria-labelledby="report-history-title" aria-busy={loading}>
            <h2 id="report-history-title"><History size={21} aria-hidden="true" /> รายงานของฉัน</h2>
            {loading ? <p role="status">กำลังโหลดรายงาน…</p> : historyError ? <div><p role="alert">{historyError}</p><button type="button" onClick={() => setReload(value => value + 1)}>ลองใหม่</button></div>
                : signedIn === false ? <p>รายงานที่ซื้อจะผูกกับบัญชีของคุณ <button type="button" onClick={() => login()}>เข้าสู่ระบบเพื่อดูรายงาน</button></p>
                    : !history.length ? <p>ยังไม่มีรายงานที่บันทึกไว้ เปรียบเทียบชื่อก่อน แล้วเลือกเปิดรายงานเมื่อพร้อม</p>
                        : <><ul>{history.map(item => <li key={item.id}><div><strong>{item.input.names.join(' · ')}</strong><p>{item.input.surname ? `นามสกุล ${item.input.surname} · ` : ''}{new Date(item.created_at).toLocaleDateString('th-TH', { timeZone: 'Asia/Bangkok' })} · {item.credits_spent} เครดิต</p></div><button type="button" disabled={busy} onClick={() => openSaved(item.id)}>เปิดรายงาน<span className="sr-only"> {item.input.names.join(' ')}</span></button></li>)}</ul><nav aria-label="หน้าประวัติรายงาน" className={styles.reportPagination}><button type="button" disabled={page <= 1 || loading} onClick={() => setPage(value => value - 1)}>ก่อนหน้า</button><span>หน้า {page} / {Math.max(1, Math.ceil(total / 20))}</span><button type="button" disabled={page * 20 >= total || loading} onClick={() => setPage(value => value + 1)}>ถัดไป</button></nav></>}
        </section>

        <dialog ref={dialog} className={styles.reportDialog} onCancel={event => { if (busy) event.preventDefault(); else setQuote(null); }} onClose={() => { if (!busy) setQuote(null); }} aria-labelledby="report-confirm-title">
            {quote && <><h2 id="report-confirm-title">ยืนยันเปิดรายงาน {quote.input.names.length} ชื่อ</h2><p>ใช้ {quote.cost} เครดิต · เปิดชุดเดิมซ้ำและดาวน์โหลดได้ตลอด</p><p>เครดิตคงเหลือ {quote.balance}{quote.balance >= quote.cost ? ` → หลังซื้อ ${quote.balance - quote.cost} เครดิต` : ' เครดิต'}</p><p className={styles.reportMeta}>เปลี่ยนชื่อ นามสกุล หรือวันเกิด ถือเป็นชุดใหม่ที่ใช้เครดิตอีกครั้ง</p>
                {quote.balance < quote.cost && <p className={styles.reportWarning}>เครดิตไม่เพียงพอ ต้องการอีก {quote.cost - quote.balance} เครดิต</p>}
                {error && <p role="alert" className={styles.reportWarning}>{error} หากการเชื่อมต่อขาดให้ลองใหม่ ชุดเดิมไม่หักซ้ำ</p>}
                <div className={styles.reportActions}><button type="button" disabled={busy} onClick={() => { dialog.current?.close(); setQuote(null); }}>ยกเลิก</button>{quote.balance < quote.cost ? <Link href="/topup?redirect=%2Fcompare-names">ไปเติมเครดิต</Link> : <button type="button" className={styles.reportPrimary} disabled={busy} onClick={purchase}>{busy ? 'กำลังบันทึก…' : `ยืนยัน · ใช้ ${quote.cost} เครดิต`}</button>}</div></>}
        </dialog>
    </div>;
}
