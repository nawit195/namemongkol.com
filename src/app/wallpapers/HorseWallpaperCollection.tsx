'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowDownToLine, Check, Coins, LoaderCircle, Monitor, RotateCcw, Smartphone, X } from 'lucide-react';
import { HORSE_WALLPAPERS, WALLPAPER_RETRY_MINUTES, type PaidWallpaperProduct } from '@/data/horseWallpapers';
import { parseWallpaperAttempt, wallpaperAttemptAfterFailure, wallpaperAttemptKey, type WallpaperDownloadAttempt } from '@/lib/paidWallpaper';
import { WallpaperTimeoutError, withWallpaperTimeout } from '@/lib/wallpaperRequest';
import { supabase } from '@/utils/supabase';
import styles from './horse-wallpapers.module.css';

type Filter = 'all' | 'mobile' | 'desktop';
interface Catalog {
    userId: string | null;
    remainingCredits: number | null;
    products: (PaidWallpaperProduct & { available: boolean })[];
    error?: string;
}
const initialCatalog: Catalog = { userId: null, remainingCredits: null, products: HORSE_WALLPAPERS.map(product => ({ ...product, available: false })) };
const loginPath = (productId: string) => `/login?redirect=${encodeURIComponent(`/wallpapers?collection=horses&image=${productId}`)}`;

export default function HorseWallpaperCollection() {
    const router = useRouter();
    const params = useSearchParams();
    const [filter, setFilter] = useState<Filter>('all');
    const [selected, setSelected] = useState<PaidWallpaperProduct | null>(null);
    const [catalog, setCatalog] = useState<Catalog>(initialCatalog);
    // Used for login navigation only. Purchases still require the server-verified catalog identity.
    const [memberId, setMemberId] = useState<string | null | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const [catalogError, setCatalogError] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [confirm, setConfirm] = useState(false);
    const [busy, setBusy] = useState(false);
    const [pending, setPending] = useState<WallpaperDownloadAttempt | null>(null);
    const [storageBlocked, setStorageBlocked] = useState(false);
    const dialogRef = useRef<HTMLDialogElement>(null);
    const requestLock = useRef(false);
    const identity = useRef<string | null>(null);
    const activeProduct = useRef<string | null>(null);
    const loadController = useRef<AbortController | null>(null);
    const authIdentity = useRef<string | null | undefined>(undefined);
    const attempts = useRef(new Map<string, WallpaperDownloadAttempt>());
    const trigger = useRef<HTMLElement | null>(null);
    const downloadIntent = useRef<string | null>(null);

    const refresh = useCallback(async (replace = false) => {
        // Repeated focus events must not keep restarting the timeout.
        if (loadController.current && !replace) return;
        loadController.current?.abort();
        const controller = new AbortController();
        loadController.current = controller;
        setLoading(true);
        try {
            const data = await withWallpaperTimeout(async signal => {
                const response = await fetch('/api/wallpapers/products', { cache: 'no-store', signal });
                if (!response.ok) throw new Error('ระบบดาวน์โหลดภาพชุดนี้ยังไม่พร้อม คุณยังเปิดดูภาพตัวอย่างได้');
                return await response.json() as Catalog;
            }, 12_000, controller.signal);
            if (controller.signal.aborted || loadController.current !== controller) return;
            identity.current = data.userId;
            setMemberId(data.userId);
            setCatalog(data);
            setCatalogError(data.error ?? '');
        } catch (failure) {
            if (controller.signal.aborted || loadController.current !== controller) return;
            identity.current = null;
            setCatalog(initialCatalog);
            setCatalogError(failure instanceof WallpaperTimeoutError ? 'ตรวจสอบสิทธิ์นานกว่าปกติ กรุณาลองใหม่ การตรวจสอบสิทธิ์ไม่หักเครดิต' : failure instanceof Error ? failure.message : 'โหลดข้อมูลไม่สำเร็จ');
        } finally {
            if (loadController.current === controller) {
                loadController.current = null;
                if (!controller.signal.aborted) setLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        void refresh();
        let authRefresh: ReturnType<typeof setTimeout> | undefined;
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            const nextUser = session?.user && !session.user.is_anonymous ? session.user.id : null;
            setMemberId(nextUser);
            if (authIdentity.current === nextUser) return;
            authIdentity.current = nextUser;
            loadController.current?.abort();
            identity.current = null;
            setCatalog(initialCatalog);
            setLoading(true);
            setPending(null);
            setConfirm(false);
            setMessage('');
            setError('');
            // Leave the Auth callback before querying Supabase-dependent routes.
            clearTimeout(authRefresh);
            authRefresh = setTimeout(() => { void refresh(true); }, 0);
        });
        const onFocus = () => { void refresh(); };
        window.addEventListener('focus', onFocus);
        return () => { subscription.unsubscribe(); clearTimeout(authRefresh); loadController.current?.abort(); loadController.current = null; window.removeEventListener('focus', onFocus); };
    }, [refresh]);

    const selectedId = selected?.id;
    useEffect(() => {
        if (memberId === null && selectedId && downloadIntent.current === selectedId) {
            downloadIntent.current = null;
            router.push(loginPath(selectedId));
        }
    }, [memberId, selectedId, router]);

    useEffect(() => {
        const userId = catalog.userId;
        setMessage('');
        setError('');
        if (!selectedId || !userId) { setConfirm(false); setPending(null); return; }
        const key = wallpaperAttemptKey(userId, selectedId);
        let saved = attempts.current.get(key) || null;
        try { saved = parseWallpaperAttempt(sessionStorage.getItem(key), userId, selectedId) || saved; }
        catch { setStorageBlocked(true); }
        const valid = saved ? parseWallpaperAttempt(JSON.stringify(saved), userId, selectedId) : null;
        setPending(valid);
    }, [selectedId, catalog.userId]);

    useEffect(() => {
        const image = params.get('image');
        const product = HORSE_WALLPAPERS.find(product => product.id === image);
        if (product) { activeProduct.current = product.id; setConfirm(false); setSelected(product); }
    }, [params]);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!selected || !dialog) return;
        if (!dialog.open) dialog.showModal();
        const before = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { dialog.close(); document.body.style.overflow = before; trigger.current?.focus(); };
    }, [selected]);

    function close() {
        downloadIntent.current = null;
        activeProduct.current = null;
        setSelected(null);
        setConfirm(false);
        if (params.get('image')) router.replace('/wallpapers?collection=horses', { scroll: false });
    }

    function openProduct(product: PaidWallpaperProduct, element: HTMLElement, purchase = false) {
        downloadIntent.current = purchase ? product.id : null;
        if (purchase && memberId === null) {
            downloadIntent.current = null;
            router.push(loginPath(product.id));
            return;
        }
        trigger.current = element;
        activeProduct.current = product.id;
        setError('');
        setMessage('');
        setConfirm(purchase && !loading && !!catalog.userId && catalog.products.some(item => item.id === product.id && item.available));
        setSelected(product);
    }

    function saveAttempt(attempt: WallpaperDownloadAttempt) {
        const key = wallpaperAttemptKey(attempt.userId, attempt.productId);
        attempts.current.set(key, attempt);
        if (identity.current === attempt.userId && activeProduct.current === attempt.productId) setPending(attempt);
        try { sessionStorage.setItem(key, JSON.stringify(attempt)); }
        catch { setStorageBlocked(true); }
    }

    async function download(retry: boolean) {
        if (!selected || !catalog.userId || requestLock.current || identity.current !== catalog.userId) return;
        const owner = catalog.userId;
        const product = selected;
        const previousAttempt = pending;
        const attempt = retry ? pending : { requestId: crypto.randomUUID(), userId: owner, productId: product.id, startedAt: Date.now() };
        if (!attempt) return;
        requestLock.current = true;
        setBusy(true);
        setConfirm(false);
        setError('');
        setMessage('');
        saveAttempt(attempt);
        try {
            const { response, blob, failure } = await withWallpaperTimeout(async signal => {
                const response = await fetch('/api/wallpapers/download', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' }, signal,
                    body: JSON.stringify({ productId: product.id, requestId: attempt.requestId, action: retry ? 'retry' : 'start' }),
                });
                return response.ok
                    ? { response, blob: await response.blob(), failure: null }
                    : { response, blob: null, failure: await response.json() };
            }, 75_000);
            if (!response.ok) {
                const retained = wallpaperAttemptAfterFailure(attempt, previousAttempt, response.status, failure?.code);
                if (retained) {
                    saveAttempt(retained);
                } else {
                    const key = wallpaperAttemptKey(owner, product.id);
                    attempts.current.delete(key);
                    try { sessionStorage.removeItem(key); } catch { /* Memory still works. */ }
                    if (identity.current === owner && activeProduct.current === product.id) setPending(null);
                }
                if (response.status === 401 && identity.current === owner) {
                    identity.current = null;
                    setMemberId(null);
                    setCatalog(initialCatalog);
                    router.push(loginPath(product.id));
                    return;
                }
                throw new Error(failure?.error || 'ดาวน์โหลดไม่สำเร็จ กรุณาลองรายการเดิมอีกครั้ง');
            }
            const expiry = response.headers.get('X-Download-Expires-At');
            if (expiry) saveAttempt({ ...attempt, expiresAt: expiry });
            // Read the entire response before offering a browser save. A broken transfer keeps the retry key.
            if (!blob || blob.type !== 'image/png' || blob.size !== product.bytes) throw new Error('รับไฟล์ไม่ครบ กรุณาลองดาวน์โหลดรายการเดิมอีกครั้ง');
            if (identity.current !== owner) return;
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = product.downloadFilename;
            document.body.appendChild(link);
            link.click();
            link.remove();
            setTimeout(() => URL.revokeObjectURL(url), 60_000);
            const balance = Number(response.headers.get('X-Credits-Remaining'));
            if (Number.isFinite(balance)) setCatalog(previous => ({ ...previous, remainingCredits: balance }));
            window.dispatchEvent(new Event('force_credits_update'));
            if (activeProduct.current === product.id) setMessage(response.headers.get('X-Download-Status') === 'retry' ? 'ส่งไฟล์ให้เบราว์เซอร์แล้ว โดยไม่หักเครดิตเพิ่ม' : 'หัก 15 เครดิตและส่งไฟล์ให้เบราว์เซอร์แล้ว');
        } catch (failure) {
            if (identity.current === owner && activeProduct.current === product.id) setError(failure instanceof WallpaperTimeoutError ? 'การรับไฟล์ใช้เวลานานกว่าปกติ หากรายการสำเร็จแล้วอาจมีการหักเครดิต กรุณากด “ลองรายการเดิมอีกครั้ง” เพื่อตรวจรายการเดิมโดยไม่หักเพิ่ม' : failure instanceof Error ? failure.message : 'การเชื่อมต่อขัดข้อง กรุณาลองรายการเดิมอีกครั้ง');
        } finally {
            requestLock.current = false;
            setBusy(false);
            void refresh();
        }
    }

    const selectedAvailable = selected && catalog.products.some(product => product.id === selected.id && product.available);
    const hasBalance = catalog.remainingCredits !== null && catalog.remainingCredits >= (selected?.cost ?? 15);
    const shown = HORSE_WALLPAPERS.filter(product => filter === 'all' || product.device === filter);

    return (
        <section id="eight-horses" className={styles.collection} aria-labelledby="horse-heading">
            <div className={styles.intro}>
                <div>
                    <p className={styles.eyebrow}>คอลเลกชันพิเศษ · 4 ภาพ</p>
                    <h2 id="horse-heading">อาชามงคล 8 ตัว</h2>
                    <p>ภูผา สายน้ำ และความมุ่งมั่นที่ก้าวไปพร้อมกัน เลือกภาพสำหรับหน้าจอของคุณ</p>
                </div>
                <div className={styles.price}><Coins size={18} aria-hidden="true" /><span><strong>15 เครดิต</strong><small>ต่อภาพต่อการดาวน์โหลดใหม่</small></span></div>
            </div>
            <div className={styles.filters} aria-label="ประเภทอุปกรณ์">
                {([['all', 'ทั้งหมด'], ['mobile', 'มือถือ'], ['desktop', 'คอมพิวเตอร์']] as const).map(([value, label]) => (
                    <button type="button" key={value} aria-pressed={filter === value} onClick={() => setFilter(value)}>{value === 'mobile' ? <Smartphone size={16} /> : value === 'desktop' ? <Monitor size={16} /> : null}{label}</button>
                ))}
            </div>
            {catalogError ? <div className={styles.notice} role="status">{catalogError}<button type="button" onClick={() => { void refresh(); }} disabled={loading}><RotateCcw size={14} />{loading ? 'กำลังตรวจสอบ' : 'ตรวจสอบอีกครั้ง'}</button></div> : null}
            <div className={styles.grid}>
                {shown.map(product => (
                    <article key={product.id} className={styles.card}>
                        <button type="button" className={`${styles.artwork} ${product.device === 'mobile' ? styles.portrait : styles.landscape}`} onClick={event => openProduct(product, event.currentTarget)} aria-label={`ดูภาพ ${product.name}`}>
                            <Image src={product.preview} alt={product.alt} width={product.width} height={product.height} unoptimized />
                            <span className={styles.device}>{product.device === 'mobile' ? <Smartphone size={14} /> : <Monitor size={14} />}{product.device === 'mobile' ? 'สำหรับมือถือ' : 'สำหรับคอมพิวเตอร์'}</span>
                            <span className={styles.previewLabel}>ภาพตัวอย่าง</span>
                        </button>
                        <div className={styles.cardBody}>
                            <p className={styles.palette}>{product.palette}</p>
                            <h3>{product.name}</h3>
                            <p className={styles.spec}>{product.width} × {product.height} px · PNG ต้นฉบับ</p>
                            <p className={styles.description}>{product.description}</p>
                            <p className={styles.meaning}><strong>ความหมายมงคลตามความเชื่อ</strong>{product.auspiciousMeaning}</p>
                            <div className={styles.cardActions}>
                                <button type="button" className={styles.previewAction} onClick={event => openProduct(product, event.currentTarget)} aria-label={`ดูรายละเอียด ${product.name}`}>ดูภาพ</button>
                                <button type="button" className={styles.downloadAction} onClick={event => openProduct(product, event.currentTarget, true)} aria-label={`ดาวน์โหลด ${product.name} ใช้ 15 เครดิต`}><ArrowDownToLine size={17} aria-hidden="true" /><span>ดาวน์โหลด · 15 เครดิต</span></button>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
            <p className={styles.footnote}>ม้า 8 ตัวเป็นสัญลักษณ์ตามความเชื่อและใช้เป็นแรงบันดาลใจ ภาพไม่ได้รับประกันความสำเร็จหรือโชคลาภ ดาวน์โหลดใหม่คิดเครดิตทุกครั้ง หากรับไฟล์ขัดข้องให้ลองรายการเดิมซ้ำได้ฟรีภายใน {WALLPAPER_RETRY_MINUTES} นาที</p>
            {selected ? (
                <dialog ref={dialogRef} className={styles.dialog} onCancel={event => { event.preventDefault(); close(); }} onClick={event => { if (event.target === event.currentTarget) close(); }} aria-labelledby="horse-detail-title" aria-describedby="horse-detail-description">
                    <div className={styles.dialogContent}>
                        <button type="button" className={styles.close} onClick={close} aria-label="ปิดรายละเอียดภาพ" autoFocus><X size={22} /></button>
                        <div className={styles.fullPreview}><Image src={selected.preview} alt={selected.alt} width={selected.width} height={selected.height} loading="eager" unoptimized /></div>
                        <div className={styles.detail}>
                            <p className={styles.eyebrow}>{selected.device === 'mobile' ? 'วอลเปเปอร์มือถือ' : 'วอลเปเปอร์คอมพิวเตอร์'}</p>
                            <h2 id="horse-detail-title">{selected.name}</h2>
                            <p id="horse-detail-description">{selected.description}</p>
                            <p className={styles.meaning}><strong>ความหมายมงคลตามความเชื่อ</strong>{selected.auspiciousMeaning}</p>
                            <dl className={styles.specs}><div><dt>ขนาดต้นฉบับ</dt><dd>{selected.width} × {selected.height} px</dd></div><div><dt>ไฟล์ดาวน์โหลด</dt><dd>PNG · {(selected.bytes / 1_000_000).toFixed(2)} MB</dd></div><div><dt>เครดิตต่อครั้ง</dt><dd>15 เครดิต</dd></div></dl>
                            <p className={styles.paymentNote}>หักเครดิตทุกการดาวน์โหลดใหม่ ลองรายการเดิมซ้ำฟรีภายใน 30 นาที</p>
                            {catalogError ? <div className={styles.notice} role="status">{catalogError}<button type="button" onClick={() => { void refresh(); }} disabled={loading}><RotateCcw size={14} />{loading ? 'กำลังตรวจสอบ' : 'ลองตรวจสอบสิทธิ์อีกครั้ง'}</button></div> : null}
                            {memberId === null ? <>
                                <Link className={styles.primary} href={loginPath(selected.id)}><ArrowDownToLine size={18} aria-hidden="true" />เข้าสู่ระบบเพื่อดาวน์โหลด · 15 เครดิต</Link>
                                <p className={styles.paymentNote}>เข้าสู่ระบบแล้วจะกลับมาที่ภาพนี้ เพื่อตรวจเครดิตและยืนยันดาวน์โหลดด้วยตนเอง</p>
                            </> : loading ? <>
                                <button type="button" className={styles.primary} disabled><ArrowDownToLine size={18} aria-hidden="true" />ดาวน์โหลด · 15 เครดิต</button>
                                <p className={`${styles.paymentNote} ${styles.inlineStatus}`} role="status"><LoaderCircle size={16} className="animate-spin" aria-hidden="true" />กำลังตรวจสอบสิทธิ์ กรุณารอสักครู่</p>
                            </> : !selectedAvailable ? <>
                                <button type="button" className={styles.primary} disabled aria-describedby={catalogError ? undefined : 'horse-download-unavailable'}><ArrowDownToLine size={18} aria-hidden="true" />ดาวน์โหลด · 15 เครดิต</button>
                                {!catalogError ? <p id="horse-download-unavailable" role="status" className={styles.paymentNote}>ภาพนี้ยังไม่พร้อมดาวน์โหลด ระบบยังไม่หักเครดิต กรุณาลองใหม่ภายหลัง</p> : null}
                            </> : !catalog.userId ? <Link className={styles.primary} href={loginPath(selected.id)}><ArrowDownToLine size={18} aria-hidden="true" />เข้าสู่ระบบเพื่อดาวน์โหลด · 15 เครดิต</Link> : (
                                <>
                                    <p className={styles.balance}>เครดิตคงเหลือ <strong>{catalog.remainingCredits?.toLocaleString('th-TH')}</strong></p>
                                    {confirm ? <div className={styles.confirm}>
                                        <h3>ยืนยันดาวน์โหลดภาพนี้?</h3>
                                        <p>ใช้ 15 เครดิต คงเหลือหลังดาวน์โหลด <strong>{Math.max(0, (catalog.remainingCredits ?? 0) - selected.cost)}</strong> เครดิต</p>
                                        <p>การกดยืนยันเริ่มรายการใหม่และหักเครดิต แม้เคยดาวน์โหลดภาพนี้แล้ว</p>
                                        <button type="button" className={styles.primary} disabled={busy || !hasBalance} onClick={() => { void download(false); }}>ยืนยันใช้ 15 เครดิต <Check size={17} /></button>
                                        <button type="button" className={styles.secondary} onClick={() => setConfirm(false)}>ยกเลิก</button>
                                    </div> : <button type="button" className={styles.primary} disabled={busy || !hasBalance} onClick={() => { setError(''); setMessage(''); setConfirm(true); }}>{busy ? <LoaderCircle size={18} className="animate-spin" /> : <ArrowDownToLine size={18} />}{busy ? 'กำลังเตรียมไฟล์' : 'ดาวน์โหลดใหม่ · 15 เครดิต'}</button>}
                                    {!hasBalance ? <p className={styles.paymentNote}>เครดิตไม่พอสำหรับรายการใหม่ <Link href="/topup">เติมเครดิต</Link></p> : null}
                                    {pending ? <button type="button" className={styles.retry} disabled={busy} onClick={() => { void download(true); }}><RotateCcw size={16} />ลองรายการเดิมอีกครั้ง · ไม่หักเพิ่ม</button> : null}
                                    {pending ? <p className={styles.paymentNote}>สิทธิ์ลองซ้ำ 30 นาทีจากรายการเดิม การลองซ้ำไม่เริ่มรายการเสียเครดิตใหม่</p> : null}
                                </>
                            )}
                            {error ? <p className={styles.error} role="alert">{error}</p> : null}
                            {message ? <p className={styles.success} role="status">{message} หากยังไม่ได้ไฟล์ ให้ใช้ปุ่มลองรายการเดิมอีกครั้ง</p> : null}
                            {storageBlocked ? <p className={styles.paymentNote}>เบราว์เซอร์ไม่อนุญาตให้จำรายการ หากต้องลองซ้ำให้เปิดหน้านี้ไว้ การรีเฟรชอาจทำให้ปุ่มลองซ้ำหายไป</p> : null}
                        </div>
                    </div>
                </dialog>
            ) : null}
        </section>
    );
}
