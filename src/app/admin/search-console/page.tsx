'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { FilePlus2, RefreshCw, Search, Upload, X } from 'lucide-react';
import {
    GSC_FILE_KINDS, MAX_UPLOAD_BYTES, compatibleComparison, defaultGscScope,
    gscImportListSchema, gscImportResultSchema, gscReportResponseSchema, gscPreviewResponseSchema,
    gscScopeSchema, inferGscFileKind, kindLabels, mergeImportHistory, defaultGscView, gscReportParams, GSC_SORTS, sortLabels,
    type GscFileKind, type GscImport, type GscReport, type GscScope, type GscPreview, type GscView, type GscSort,
} from './searchConsoleUi';
import { SearchConsolePreview, SearchConsoleReport } from './SearchConsoleReport';
import styles from './searchConsole.module.css';

type UploadFile = { id: number; kind: GscFileKind; file: File | null };
type Selection = GscView & { id: string; kind: GscFileKind; page: number; q: string; compare: string };
const emptySelection: Selection = { id: '', kind: 'queries', page: 1, q: '', compare: '', ...defaultGscView('queries') };
function importSelection(item: GscImport, preferredKind?: GscFileKind): Selection {
    const kind = preferredKind && item.kinds.includes(preferredKind) ? preferredKind : item.kinds.includes('queries') ? 'queries' : item.kinds[0];
    return { ...emptySelection, id: item.id, kind, ...defaultGscView(kind) };
}
const importLabel = (item: GscImport) => `${item.scope.from} – ${item.scope.to} · ${item.scope.country} / ${item.scope.device} · ${item.rowCount.toLocaleString('th-TH')} แถว`;
const importTime = (value: string) => new Date(value).toLocaleString('th-TH', { timeZone: 'Asia/Bangkok', dateStyle: 'medium', timeStyle: 'short' });

export default function SearchConsolePage() {
    const [imports, setImports] = useState<GscImport[]>([]);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [historyMoreLoading, setHistoryMoreLoading] = useState(false);
    const [historyPage, setHistoryPage] = useState(1);
    const [historyTotal, setHistoryTotal] = useState(0);
    const historyRequestVersion = useRef(0);
    const historyMoreController = useRef<AbortController | null>(null);
    const [historyVersion, setHistoryVersion] = useState(0);
    const [historyError, setHistoryError] = useState('');
    const [denied, setDenied] = useState(false);
    const [selection, setSelection] = useState<Selection>(emptySelection);
    const [loaded, setLoaded] = useState<{ key: string; report: GscReport } | null>(null);
    const [reportLoading, setReportLoading] = useState(false);
    const [reportError, setReportError] = useState('');
    const [reportVersion, setReportVersion] = useState(0);
    const [queryDraft, setQueryDraft] = useState('');
    const [showImport, setShowImport] = useState(false);
    const [scope, setScope] = useState<GscScope>(() => defaultGscScope());
    const [files, setFiles] = useState<UploadFile[]>([{ id: 0, kind: 'queries', file: null }]);
    const nextFileId = useRef(1);
    const [scopeConfirmed, setScopeConfirmed] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [validating, setValidating] = useState(false);
    const [validated, setValidated] = useState<{ body: string; preview: GscPreview } | null>(null);
    const [uploadError, setUploadError] = useState('');
    const [uploadMessage, setUploadMessage] = useState('');
    const requestKey = JSON.stringify({ ...selection, version: reportVersion });
    const uploadBusy = uploading || validating;
    const report = loaded?.key === requestKey ? loaded.report : null;
    const currentImport = imports.find(item => item.id === selection.id);
    const currentScope = currentImport?.scope ?? report?.scope;
    const availableKinds = currentImport?.kinds ?? report?.kinds ?? [];
    const comparisons = currentScope ? imports.filter(item => item.id !== selection.id && item.kinds.includes(selection.kind) && compatibleComparison(currentScope, item.scope)) : [];
    const defaultView = defaultGscView(selection.kind);
    const canClearTable = Boolean(selection.q || selection.compare || selection.opportunity || selection.sort !== defaultView.sort || selection.order !== defaultView.order);

    useEffect(() => {
        historyMoreController.current?.abort();
        const controller = new AbortController();
        const version = ++historyRequestVersion.current;
        let active = true;
        async function loadHistory() {
            setHistoryLoading(true); setHistoryMoreLoading(false); setHistoryError('');
            try {
                const response = await fetch('/api/admin/search-console', { cache: 'no-store', signal: controller.signal });
                const body = await response.json();
                if (!active || version !== historyRequestVersion.current) return;
                if (response.status === 401 || response.status === 403) {
                    setDenied(true); setImports([]); setLoaded(null); setSelection(emptySelection); setValidated(null);
                }
                if (!response.ok) throw new Error(body.error || 'โหลดประวัติรายงานไม่สำเร็จ');
                const parsed = gscImportListSchema.safeParse(body);
                if (!parsed.success) throw new Error('รูปแบบประวัติรายงานไม่ถูกต้อง');
                setDenied(false);
                setImports(previous => mergeImportHistory(previous, parsed.data.imports));
                setHistoryPage(parsed.data.page); setHistoryTotal(parsed.data.total);
                if (!parsed.data.imports.length) setShowImport(true);
                setSelection(previous => {
                    if (previous.id) return previous;
                    const first = parsed.data.imports[0];
                    return first ? importSelection(first) : emptySelection;
                });
            } catch (failure) {
                if (active && version === historyRequestVersion.current) setHistoryError(failure instanceof Error ? failure.message : 'โหลดประวัติรายงานไม่สำเร็จ');
            } finally { if (active && version === historyRequestVersion.current) setHistoryLoading(false); }
        }
        void loadHistory();
        return () => { active = false; controller.abort(); historyMoreController.current?.abort(); };
    }, [historyVersion]);

    useEffect(() => {
        if (!selection.id) return;
        const controller = new AbortController();
        let active = true;
        async function loadReport() {
            setReportLoading(true); setReportError('');
            const params = gscReportParams(selection);
            try {
                const response = await fetch(`/api/admin/search-console/${encodeURIComponent(selection.id)}?${params}`, { cache: 'no-store', signal: controller.signal });
                const body = await response.json();
                if (!active) return;
                if (response.status === 401 || response.status === 403) {
                    setDenied(true); setLoaded(null); setImports([]); setValidated(null);
                }
                if (!response.ok) throw new Error(body.error || 'โหลดรายละเอียดรายงานไม่สำเร็จ');
                const parsed = gscReportResponseSchema.safeParse(body);
                if (!parsed.success || parsed.data.report.id !== selection.id || parsed.data.report.kind !== selection.kind) throw new Error('รูปแบบข้อมูลรายงานไม่ถูกต้อง');
                const lastPage = Math.max(1, Math.ceil(parsed.data.report.total / 50));
                if (selection.page > lastPage) {
                    setSelection(previous => ({ ...previous, page: lastPage }));
                    return;
                }
                setDenied(false); setLoaded({ key: requestKey, report: parsed.data.report });
                const { id, createdAt, scope, kinds, rowCount } = parsed.data.report;
                setImports(previous => mergeImportHistory(previous, [{ id, createdAt, scope, kinds, rowCount }]));
            } catch (failure) {
                if (active) { setLoaded(null); setReportError(failure instanceof Error ? failure.message : 'โหลดรายละเอียดรายงานไม่สำเร็จ'); }
            } finally { if (active) setReportLoading(false); }
        }
        void loadReport();
        return () => { active = false; controller.abort(); };
    }, [selection, requestKey]);

    function updateScope<K extends keyof GscScope>(key: K, value: GscScope[K]) {
        setScope(previous => ({ ...previous, [key]: value })); setScopeConfirmed(false); setValidated(null);
    }
    async function loadMoreHistory() {
        if (historyLoading || historyMoreLoading) return;
        const version = ++historyRequestVersion.current;
        const controller = new AbortController();
        historyMoreController.current = controller;
        setHistoryMoreLoading(true); setHistoryError('');
        try {
            const response = await fetch(`/api/admin/search-console?page=${historyPage + 1}`, { cache: 'no-store', signal: controller.signal });
            const body = await response.json();
            if (version !== historyRequestVersion.current || controller.signal.aborted) return;
            if (response.status === 401 || response.status === 403) { setDenied(true); setImports([]); setLoaded(null); setSelection(emptySelection); setValidated(null); }
            if (!response.ok) throw new Error(body.error || 'โหลดประวัติเพิ่มไม่สำเร็จ');
            const parsed = gscImportListSchema.safeParse(body);
            if (!parsed.success) throw new Error('รูปแบบประวัติรายงานไม่ถูกต้อง');
            setImports(previous => mergeImportHistory(previous, parsed.data.imports));
            setHistoryPage(parsed.data.page); setHistoryTotal(parsed.data.total);
        } catch (failure) {
            if (version === historyRequestVersion.current && !controller.signal.aborted) setHistoryError(failure instanceof Error ? failure.message : 'โหลดประวัติเพิ่มไม่สำเร็จ');
        } finally { if (version === historyRequestVersion.current) setHistoryMoreLoading(false); }
    }
    function chooseImport(id: string) {
        const next = imports.find(item => item.id === id);
        if (!next) return;
        setQueryDraft('');
        setSelection(importSelection(next, selection.kind));
    }
    function changeFile(id: number, file: File | null) {
        setFiles(previous => previous.map(item => item.id === id ? { ...item, file, kind: file ? inferGscFileKind(file.name) ?? item.kind : item.kind } : item));
        setUploadError(''); setScopeConfirmed(false); setValidated(null);
    }
    function addFile() {
        const kind = GSC_FILE_KINDS.find(value => !files.some(item => item.kind === value));
        if (kind) {
            const id = nextFileId.current++;
            setFiles(previous => [...previous, { id, kind, file: null }]); setScopeConfirmed(false); setValidated(null);
        }
    }
    async function validateUpload(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (uploadBusy) return;
        setUploadError(''); setUploadMessage(''); setValidated(null);
        const country = scope.country.trim().toLowerCase() === 'all' ? 'all' : scope.country.trim().toUpperCase();
        const parsedScope = gscScopeSchema.safeParse({ ...scope, country, filters: scope.filters.normalize('NFC').trim() });
        if (!parsedScope.success || scope.from > scope.to) { setUploadError('ตรวจช่วงวันที่ ประเทศ และตัวกรองให้ถูกต้อง'); return; }
        if (!scopeConfirmed) { setUploadError('กรุณายืนยันว่าช่วงวันที่และตัวกรองตรงกับไฟล์ส่งออก'); return; }
        if (files.some(item => !item.file)) { setUploadError('เลือกไฟล์ CSV ให้ครบทุกแถว หรือเอาแถวที่ไม่ใช้ออก'); return; }
        if (new Set(files.map(item => item.kind)).size !== files.length) { setUploadError('นำเข้าได้มิติละหนึ่งไฟล์ต่อชุด กรุณาตรวจชนิดไฟล์'); return; }
        if (files.reduce((sum, item) => sum + (item.file?.size ?? 0), 0) > MAX_UPLOAD_BYTES) { setUploadError('ขนาดไฟล์รวมต้องไม่เกิน 3 MiB'); return; }
        setValidating(true);
        try {
            const payload = { scope: parsedScope.data, files: await Promise.all(files.map(async item => ({ name: item.file!.name, kind: item.kind, csv: await item.file!.text() }))) };
            const body = JSON.stringify(payload);
            if (new TextEncoder().encode(body).byteLength > MAX_UPLOAD_BYTES) throw new Error('ข้อมูลรวมหลังเข้ารหัสเกิน 3 MiB กรุณาแบ่งชุดไฟล์ให้เล็กลง');
            const response = await fetch('/api/admin/search-console?validate=1', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body, cache: 'no-store', signal: AbortSignal.timeout(45_000),
            });
            const result = await response.json();
            if (response.status === 401 || response.status === 403) {
                setDenied(true); setImports([]); setLoaded(null); setSelection(emptySelection); setValidated(null);
            }
            if (!response.ok) throw new Error(result.error || 'ตรวจสอบไฟล์ไม่สำเร็จ');
            const parsed = gscPreviewResponseSchema.safeParse(result);
            if (!parsed.success) throw new Error('ข้อมูลตัวอย่างไม่ถูกต้อง กรุณาตรวจสอบไฟล์อีกครั้ง');
            setValidated({ body, preview: parsed.data.preview });
        } catch (failure) {
            setUploadError(failure instanceof Error && failure.name !== 'TimeoutError' ? failure.message : 'ตรวจสอบไฟล์ไม่สำเร็จ กรุณาลองใหม่ ยังไม่มีการบันทึกข้อมูล');
        } finally { setValidating(false); }
    }
    async function confirmImport() {
        if (!validated || uploadBusy || !scopeConfirmed) return;
        const submitted = validated;
        setUploading(true); setUploadError('');
        try {
            const response = await fetch('/api/admin/search-console', {
                method: 'POST', headers: { 'Content-Type': 'application/json', 'X-GSC-Preview-Hash': submitted.preview.contentHash },
                body: submitted.body, cache: 'no-store', signal: AbortSignal.timeout(45_000),
            });
            const result = await response.json();
            if (response.status === 401 || response.status === 403) { setDenied(true); setImports([]); setLoaded(null); setSelection(emptySelection); setValidated(null); }
            if (response.status === 409) setValidated(null);
            if (!response.ok) throw new Error(result.error || 'ยืนยันนำเข้าไม่สำเร็จ');
            const parsed = gscImportResultSchema.safeParse(result);
            if (!parsed.success) throw new Error('ยังยืนยันผลนำเข้าไม่ได้ ลองยืนยันชุดเดิมอีกครั้ง ระบบจะตรวจชุดข้อมูลซ้ำ');
            const kind = submitted.preview.kinds[0];
            setSelection({ ...emptySelection, id: parsed.data.id, kind, ...defaultGscView(kind) });
            setQueryDraft(''); setHistoryVersion(previous => previous + 1);
            setUploadMessage(parsed.data.duplicate ? 'พบชุดข้อมูลนี้อยู่แล้ว เปิดรายงานเดิมให้แล้ว' : 'นำเข้าและบันทึกรายงานชุดใหม่แล้ว');
            setFiles([{ id: nextFileId.current++, kind: 'queries', file: null }]);
            setScopeConfirmed(false); setShowImport(false); setValidated(null);
        } catch (failure) {
            setUploadError(failure instanceof Error && failure.name !== 'TimeoutError' ? failure.message : 'ยังยืนยันผลนำเข้าไม่ได้ ลองยืนยันชุดเดิมอีกครั้ง ระบบจะตรวจชุดข้อมูลซ้ำ');
        } finally { setUploading(false); }
    }

    return <div className={styles.page}>
        <header className={styles.header}>
            <div><p className={styles.eyebrow}>ข้อมูลจาก Google Search</p><h1>Search Console</h1><p>ดูคำค้น หน้าเว็บไซต์ และโอกาสปรับ SEO จากไฟล์ที่ส่งออกจริง</p></div>
            <div className={styles.headerActions}>
                <Link href="/admin/page-traffic">ผู้เข้าชมรายวัน</Link>
                {!denied && <button type="button" disabled={uploadBusy} className={styles.primary} aria-expanded={showImport} aria-controls="gsc-import" onClick={() => setShowImport(previous => !previous)}><Upload size={16} aria-hidden="true" />{showImport ? 'ซ่อนฟอร์มนำเข้า' : 'นำเข้า CSV'}</button>}
            </div>
        </header>
        <div className={styles.notice}><p>วันที่ในรายงานนี้ใช้ Pacific Time (PT) ตาม Search Console ต่างจากรายงานผู้เข้าชมรายวันที่ใช้เวลาไทย ข้อมูลมาจากการนำเข้า CSV และไม่ได้ดึงจาก Google อัตโนมัติ</p></div>
        {uploadMessage && <p className={styles.success} role="status">{uploadMessage}</p>}
        {(historyError || denied) && <div className={styles.alert} role="alert"><p>{historyError || reportError || 'กรุณาเข้าสู่ระบบผู้ดูแล'}</p>{denied ? <Link href="/login?redirect=%2Fadmin%2Fsearch-console">เข้าสู่ระบบผู้ดูแล</Link> : <button type="button" onClick={() => setHistoryVersion(previous => previous + 1)}>ลองใหม่</button>}</div>}
        {!denied && <section id="gsc-import" hidden={!showImport} className={styles.panel} aria-labelledby="gsc-import-title">
            <h2 id="gsc-import-title">นำเข้าข้อมูลจาก Search Console</h2>
            <p className={styles.notes}>ส่งออกจากรายงานผลการค้นหาแบบ Web แล้วเลือกชนิดให้ตรงกับไฟล์ Queries, Pages หรือ Chart รองรับมิติละหนึ่งไฟล์ รวมไม่เกิน 4 ไฟล์, 3 MiB และ 20,000 แถวต่อชุด</p>
            <form onSubmit={validateUpload}>
                <fieldset disabled={uploadBusy} className={styles.uploadFields}>
                    <legend className={styles.srOnly}>ข้อมูลชุดนำเข้า</legend>
                    <label className={styles.wide}>พร็อพเพอร์ตี<select value={scope.property} onChange={event => updateScope('property', event.target.value as GscScope['property'])}><option value="https://www.namemongkol.com/">https://www.namemongkol.com/</option><option value="sc-domain:namemongkol.com">Domain: namemongkol.com</option></select></label>
                    <label>ตั้งแต่วันที่ (PT)<input type="date" required value={scope.from} onChange={event => updateScope('from', event.target.value)} /></label>
                    <label>ถึงวันที่ (PT)<input type="date" required min={scope.from || undefined} value={scope.to} onChange={event => updateScope('to', event.target.value)} /></label>
                    <label>ประเทศ<input type="text" maxLength={3} list="gsc-countries" required value={scope.country} onChange={event => updateScope('country', event.target.value)} /><datalist id="gsc-countries"><option value="all">ทุกประเทศ</option><option value="TH">ประเทศไทย</option></datalist><small>ใช้ all หรือรหัส 2 ตัว เช่น TH</small></label>
                    <label>อุปกรณ์<select value={scope.device} onChange={event => updateScope('device', event.target.value as GscScope['device'])}><option value="all">ทุกอุปกรณ์</option><option value="mobile">มือถือ</option><option value="desktop">เดสก์ท็อป</option><option value="tablet">แท็บเล็ต</option></select></label>
                    <label className={styles.full}>ตัวกรองอื่นใน Search Console<textarea rows={2} maxLength={500} value={scope.filters} placeholder="เช่น กรองคำค้นที่มี ชื่อเล่น · เว้นว่างเมื่อไม่มีตัวกรองอื่น" onChange={event => updateScope('filters', event.target.value)} /></label>
                    <div className={`${styles.fileList} ${styles.full}`}>
                        {files.map((item, index) => <div className={styles.fileRow} key={item.id}>
                            <label>ชนิดไฟล์ {index + 1}<select value={item.kind} onChange={event => { setFiles(previous => previous.map(row => row.id === item.id ? { ...row, kind: event.target.value as GscFileKind } : row)); setScopeConfirmed(false); setValidated(null); }}>{GSC_FILE_KINDS.map(kind => <option value={kind} key={kind}>{kindLabels[kind]}</option>)}</select></label>
                            <label>ไฟล์ CSV<input type="file" accept=".csv,text/csv,text/plain" required onChange={event => changeFile(item.id, event.target.files?.[0] ?? null)} /></label>
                            {files.length > 1 && <button type="button" aria-label={`เอาไฟล์ ${index + 1} ออก`} onClick={() => { setFiles(previous => previous.filter(row => row.id !== item.id)); setScopeConfirmed(false); setValidated(null); }}><X size={16} aria-hidden="true" /></button>}
                        </div>)}
                        {files.length < 4 && <button type="button" className={styles.addFile} onClick={addFile}><FilePlus2 size={16} aria-hidden="true" />เพิ่มไฟล์อีกมิติ</button>}
                    </div>
                    <p className={`${styles.notes} ${styles.full}`}>Queries และ Pages เป็นคนละตาราง ระบบจะไม่จับคู่คำค้นกับหน้าขึ้นเอง หากมีไฟล์แบบ query + page จริง ให้เลือก “คำค้นหาและหน้า” วันของไฟล์รายวันต้องอยู่ในช่วงที่ระบุ และควรใช้ข้อมูลวันที่สมบูรณ์</p>
                    <label className={`${styles.confirm} ${styles.full}`}><input type="checkbox" checked={scopeConfirmed} onChange={event => { setScopeConfirmed(event.target.checked); if (!event.target.checked) setValidated(null); }} required /><span>ยืนยันว่าช่วงวันที่ พร็อพเพอร์ตี และตัวกรองข้างต้นตรงกับไฟล์ที่ส่งออกจาก Search Console</span></label>
                    <div className={`${styles.submitRow} ${styles.full}`}><button type="submit" className={styles.primary}><Upload size={16} aria-hidden="true" />{validating ? 'กำลังตรวจสอบไฟล์…' : 'ตรวจสอบและดูตัวอย่าง'}</button><span>ขั้นตอนนี้ยังไม่บันทึกข้อมูล และไม่ต้องส่งรหัสผ่าน Google</span></div>
                </fieldset>
            </form>
            {uploadError && <p className={styles.alert} role="alert">{uploadError}</p>}
            {validated && <SearchConsolePreview preview={validated.preview} busy={uploadBusy} onConfirm={() => { void confirmImport(); }} />}
        </section>}
        {!denied && <>
            <section className={styles.controls} aria-label="เลือกรายงาน Search Console">
                <label className={styles.historySelect}>ชุดข้อมูลที่นำเข้า<select value={selection.id} disabled={historyLoading || !imports.length} onChange={event => chooseImport(event.target.value)}>{!imports.length && <option value="">{historyLoading ? 'กำลังโหลดประวัติ…' : 'ยังไม่มีชุดข้อมูล'}</option>}{imports.map(item => <option key={item.id} value={item.id}>{importLabel(item)} · นำเข้า {importTime(item.createdAt)}</option>)}</select></label>
                <button type="button" disabled={historyLoading || historyMoreLoading} onClick={() => { setHistoryVersion(previous => previous + 1); setReportVersion(previous => previous + 1); }}><RefreshCw size={16} aria-hidden="true" />รีเฟรช</button>
            </section>
            {imports.length < historyTotal && historyPage * 50 < historyTotal && <div className={styles.historyMore}><span>โหลดประวัติแล้ว {imports.length.toLocaleString('th-TH')} จาก {historyTotal.toLocaleString('th-TH')} ชุด</span><button type="button" disabled={historyLoading || historyMoreLoading} onClick={() => { void loadMoreHistory(); }}>{historyMoreLoading ? 'กำลังโหลด…' : 'โหลดประวัติเพิ่ม'}</button></div>}
            {currentImport && <p className={styles.notes}>{currentImport.scope.property} · Web · {currentImport.scope.country === 'all' ? 'ทุกประเทศ' : currentImport.scope.country} · {currentImport.scope.device} · นำเข้า {importTime(currentImport.createdAt)} (เวลาไทย){currentImport.scope.filters ? ` · ตัวกรองอื่น: ${currentImport.scope.filters}` : ''}</p>}
            {availableKinds.length > 0 && <div className={styles.tabs} role="group" aria-label="เลือกมิติข้อมูล">{availableKinds.map(kind => <button type="button" key={kind} aria-pressed={selection.kind === kind} onClick={() => { setQueryDraft(''); setSelection(previous => ({ ...previous, kind, page: 1, q: '', compare: '', ...defaultGscView(kind) })); }}>{kindLabels[kind]}</button>)}</div>}
            {selection.id && <div className={styles.reportControls}>
                <form onSubmit={event => { event.preventDefault(); setSelection(previous => ({ ...previous, q: queryDraft.trim(), page: 1 })); }}><label>ค้นหาแถวในมิตินี้<div className={styles.searchField}><input type="search" maxLength={200} value={queryDraft} onChange={event => setQueryDraft(event.target.value)} placeholder={selection.kind === 'daily' ? 'YYYY-MM-DD' : 'คำค้นหรือเส้นทางหน้า'} /><button type="submit"><Search size={16} aria-hidden="true" />ค้นหา</button></div></label></form>
                <label>เทียบกับช่วงข้อมูล<select value={selection.compare} onChange={event => setSelection(previous => ({ ...previous, compare: event.target.value, page: 1 }))}><option value="">ไม่เปรียบเทียบ</option>{comparisons.map(item => <option value={item.id} key={item.id}>{importLabel(item)}</option>)}</select><small>เฉพาะตัวกรองเดียวกัน จำนวนวันเท่ากัน และช่วงวันที่ไม่ทับกัน</small></label>
                <div className={styles.viewControls}>
                    <label>เรียงตารางตาม<select value={selection.sort} onChange={event => setSelection(previous => ({ ...previous, sort: event.target.value as GscSort, page: 1 }))}>{GSC_SORTS.map(sort => <option key={sort} value={sort}>{sortLabels[sort]}</option>)}</select></label>
                    <label>ลำดับ<select value={selection.order} onChange={event => setSelection(previous => ({ ...previous, order: event.target.value as GscView['order'], page: 1 }))}><option value="desc">มากไปน้อย</option><option value="asc">น้อยไปมาก</option></select></label>
                    <div className={styles.viewActions}>
                        {selection.kind !== 'daily' && <label className={styles.opportunityFilter}><input type="checkbox" checked={selection.opportunity} onChange={event => setSelection(previous => ({ ...previous, opportunity: event.target.checked, page: 1 }))} /><span>เฉพาะอันดับเฉลี่ย 4–15</span></label>}
                        <button type="button" disabled={!canClearTable} onClick={() => { setQueryDraft(''); setSelection(previous => ({ ...previous, q: '', compare: '', page: 1, ...defaultGscView(previous.kind) })); }}>ล้างตัวกรองตาราง</button>
                    </div>
                </div>
            </div>}
            {reportError && !denied && <div className={styles.alert} role="alert"><p>{reportError}</p><button type="button" onClick={() => setReportVersion(previous => previous + 1)}>ลองใหม่</button></div>}
            <section aria-busy={historyLoading || (Boolean(selection.id) && reportLoading)} aria-label="ผลรายงาน Search Console">
                {historyLoading || (selection.id && reportLoading) ? <p className={styles.empty} role="status">กำลังโหลดรายงาน…</p> : report ? <SearchConsoleReport report={report} previous={imports.find(item => item.id === selection.compare)} onPage={page => setSelection(previous => ({ ...previous, page }))} /> : !imports.length && !historyError ? <div className={styles.empty}><h2>เริ่มจากไฟล์ Search Console ชุดแรก</h2><p>นำเข้า CSV เพื่อดูคำค้นและหน้าที่มีโอกาสปรับ SEO ข้อมูลนี้แยกจากยอดเข้าชมในระบบของเว็บไซต์</p></div> : null}
            </section>
        </>}
    </div>;
}
