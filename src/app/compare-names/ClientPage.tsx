'use client';

import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import {
    ArrowRight,
    ArrowRightLeft,
    Check,
    Plus,
    ShieldCheck,
} from 'lucide-react';
import { supabase } from '@/utils/supabase';
import { comparisonCost } from '@/lib/comparisonPricing';
import type { ComparisonInput } from '@/lib/comparisonReport';
import { thaksaConfig } from '@/data/thaksaConfig';
import {
    compareNames,
    sortComparisons,
    validateComparison,
    type ComparisonOrder,
    type NameComparison,
} from '@/lib/nameComparison';
import { NameInput } from './NameInput';
import { ComparisonTable } from './ComparisonTable';
import { ComparisonReports, COMPARISON_DRAFT_KEY } from './ComparisonReports';
import { comparisonInputSchema } from '@/lib/comparisonReport';
import { trackEvent } from '@/lib/analytics';
import {
    COMPARISON_SELECTION_KEY,
    parseComparisonSelection,
} from '@/lib/nameFavorites';
import styles from './comparison.module.css';

type NameSlot = { id: number; value: string };

export default function CompareNamesClient() {
    const [names, setNames] = useState<NameSlot[]>([
        { id: 0, value: '' },
        { id: 1, value: '' },
    ]);
    const nextId = useRef(2);
    const [surname, setSurname] = useState('');
    const [day, setDay] = useState('');
    const [attempted, setAttempted] = useState(false);
    const [hasCompared, setHasCompared] = useState(false);
    const [result, setResult] = useState<NameComparison[] | null>(null);
    const [order, setOrder] = useState<ComparisonOrder>('grade');
    const [busy, setBusy] = useState(false);
    const busyRef = useRef(false);
    const purchaseVersion = useRef(0);
    const purchaseDialog = useRef<HTMLDialogElement>(null);
    const [quote, setQuote] = useState<{
        input: ComparisonInput;
        balance: number;
        cost: number;
    } | null>(null);
    const [purchaseError, setPurchaseError] = useState('');
    const resultRef = useRef<HTMLElement>(null);
    const formRef = useRef<HTMLFormElement>(null);
    const errors = validateComparison(
        names.map((item) => item.value),
        surname,
        day,
    );
    const sorted = useMemo(
        () => (result ? sortComparisons(result, order) : []),
        [result, order],
    );

    // Prefill from the individual analysis entry, after hydration, without making this page dynamic.
    useEffect(() => {
        const frame = requestAnimationFrame(() => {
            try {
                const draft = sessionStorage.getItem(COMPARISON_DRAFT_KEY);
                if (draft) {
                    sessionStorage.removeItem(COMPARISON_DRAFT_KEY);
                    const parsed = comparisonInputSchema.safeParse(
                        JSON.parse(draft),
                    );
                    if (parsed.success) {
                        sessionStorage.removeItem(COMPARISON_SELECTION_KEY);
                        setNames(
                            parsed.data.names.map((value, id) => ({
                                id,
                                value,
                            })),
                        );
                        nextId.current = parsed.data.names.length;
                        setSurname(parsed.data.surname);
                        setDay(parsed.data.day);
                        return;
                    }
                }
            } catch {
                /* A blocked or invalid draft must never prevent free comparisons. */
            }
            try {
                const selection = sessionStorage.getItem(
                    COMPARISON_SELECTION_KEY,
                );
                if (selection) {
                    sessionStorage.removeItem(COMPARISON_SELECTION_KEY);
                    const picked = parseComparisonSelection(
                        JSON.parse(selection),
                    );
                    if (picked) {
                        setNames(picked.map((value, id) => ({ id, value })));
                        nextId.current = picked.length;
                        setDay('');
                        setSurname('');
                        return;
                    }
                }
            } catch {
                /* Stored selections are optional; never auto-submit or purchase. */
            }
            const params = new URLSearchParams(window.location.search);
            const name = params.get('name');
            if (name)
                setNames([
                    { id: 0, value: name.slice(0, 100) },
                    { id: 1, value: '' },
                ]);
            setSurname((params.get('surname') ?? '').slice(0, 100));
            const initialDay = params.get('day') ?? '';
            if (Object.hasOwn(thaksaConfig, initialDay)) setDay(initialDay);
        });
        return () => cancelAnimationFrame(frame);
    }, []);

    useEffect(() => {
        let owner: string | null | undefined;
        const requestState = purchaseVersion;
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            const id = session?.user.id ?? null;
            if (
                _event === 'SIGNED_OUT' ||
                (owner !== undefined && owner !== id)
            ) {
                purchaseVersion.current++;
                busyRef.current = false;
                setBusy(false);
                setResult((current) =>
                    current && current.length > 3 ? null : current,
                );
                setQuote(null);
                setPurchaseError('');
                purchaseDialog.current?.close();
            }
            owner = id;
        });
        return () => {
            requestState.current++;
            subscription.unsubscribe();
        };
    }, []);

    function invalidate() {
        purchaseVersion.current++;
        busyRef.current = false;
        setBusy(false);
        setQuote(null);
        setPurchaseError('');
        purchaseDialog.current?.close();
        setResult(null);
    }
    function showResult(rows: NameComparison[]) {
        setResult(rows);
        setHasCompared(true);
        void trackEvent('compare_names.analyze_success', {
            metadata: { count: rows.length },
        });
        requestAnimationFrame(() => {
            resultRef.current?.focus({ preventScroll: true });
            resultRef.current?.scrollIntoView({
                behavior: window.matchMedia('(prefers-reduced-motion: reduce)')
                    .matches
                    ? 'instant'
                    : 'smooth',
                block: 'start',
            });
        });
    }
    function saveDraft(input: ComparisonInput) {
        try {
            sessionStorage.setItem(COMPARISON_DRAFT_KEY, JSON.stringify(input));
            return true;
        } catch {
            setPurchaseError(
                'เบราว์เซอร์ไม่อนุญาตให้เก็บแบบฟอร์ม กรุณาจดชื่อก่อนเข้าสู่ระบบหรือเติมเครดิต',
            );
            return false;
        }
    }
    function login(input: ComparisonInput) {
        if (saveDraft(input))
            window.location.assign('/login?redirect=%2Fcompare-names');
    }
    async function previewPaid() {
        if (busyRef.current) return;
        busyRef.current = true;
        setBusy(true);
        setPurchaseError('');
        const input = { names: names.map((item) => item.value), surname, day };
        const version = ++purchaseVersion.current;
        try {
            const response = await fetch(
                '/api/compare-names/compare?preview=1',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(input),
                    cache: 'no-store',
                    signal: AbortSignal.timeout(15000),
                },
            );
            if (version !== purchaseVersion.current) return;
            if (response.status === 401) {
                login(input);
                return;
            }
            const body = await response.json();
            if (version !== purchaseVersion.current) return;
            if (!response.ok)
                throw new Error(
                    body.error || 'ตรวจสอบเครดิตไม่สำเร็จ กรุณาลองใหม่',
                );
            if (
                body.status === 'already_unlocked' &&
                Array.isArray(body.rows)
            ) {
                showResult(body.rows);
                return;
            }
            if (
                body.status !== 'confirmation_required' ||
                body.cost !== 10 ||
                !Number.isFinite(body.remainingCredits)
            )
                throw new Error('ไม่สามารถตรวจสอบราคาได้ กรุณาลองใหม่');
            setQuote({
                input,
                balance: body.remainingCredits,
                cost: body.cost,
            });
            purchaseDialog.current?.showModal();
            void trackEvent('compare_names.extended.confirmation', {
                metadata: { count: input.names.length, cost: 10 },
            });
        } catch (error) {
            if (version === purchaseVersion.current)
                setPurchaseError(
                    error instanceof Error
                        ? error.message
                        : 'ตรวจสอบเครดิตไม่สำเร็จ',
                );
        } finally {
            if (version === purchaseVersion.current) {
                busyRef.current = false;
                setBusy(false);
            }
        }
    }
    async function purchase() {
        if (!quote || busyRef.current) return;
        busyRef.current = true;
        setBusy(true);
        setPurchaseError('');
        const version = ++purchaseVersion.current;
        try {
            const response = await fetch('/api/compare-names/compare', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(quote.input),
                cache: 'no-store',
                signal: AbortSignal.timeout(15000),
            });
            if (version !== purchaseVersion.current) return;
            if (response.status === 401) {
                purchaseDialog.current?.close();
                login(quote.input);
                return;
            }
            const body = await response.json();
            if (version !== purchaseVersion.current) return;
            if (response.status === 402) {
                setQuote((current) =>
                    current
                        ? { ...current, balance: body.remainingCredits }
                        : null,
                );
                setPurchaseError('เครดิตไม่เพียงพอ กรุณาเติมเครดิต');
                return;
            }
            if (!response.ok || !Array.isArray(body.rows))
                throw new Error(
                    body.error ||
                        'เปิดผลไม่สำเร็จ กรุณาลองใหม่ ชุดเดิมไม่หักเครดิตซ้ำ',
                );
            purchaseDialog.current?.close();
            setQuote(null);
            showResult(body.rows);
            void trackEvent(
                'compare_names.extended.' +
                    (body.status === 'already_unlocked' ? 'reopen' : 'success'),
                {
                    metadata: {
                        count: quote.input.names.length,
                        cost: body.status === 'already_unlocked' ? 0 : 10,
                    },
                },
            );
        } catch (error) {
            if (version === purchaseVersion.current)
                setPurchaseError(
                    error instanceof Error
                        ? error.message
                        : 'เปิดผลไม่สำเร็จ กรุณาลองใหม่ ชุดเดิมไม่หักเครดิตซ้ำ',
                );
        } finally {
            if (version === purchaseVersion.current) {
                busyRef.current = false;
                setBusy(false);
            }
        }
    }

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setAttempted(true);
        if (!errors.valid) {
            requestAnimationFrame(() =>
                formRef.current
                    ?.querySelector<HTMLElement>('[aria-invalid="true"]')
                    ?.focus(),
            );
            return;
        }
        if (comparisonCost(names.length)) {
            void previewPaid();
            return;
        }
        showResult(
            compareNames(
                names.map((item) => item.value),
                surname,
                day,
            ),
        );
    }

    return (
        <>
            <form
                ref={formRef}
                onSubmit={submit}
                noValidate
                className={styles.form}
                aria-label="ข้อมูลเปรียบเทียบชื่อ"
            >
                <div className={styles.formHeading}>
                    <span className={styles.step}>01</span>
                    <div>
                        <h2>ชื่อที่อยากเปรียบเทียบ</h2>
                        <p>เลือกจากฐานข้อมูล หรือพิมพ์ชื่อที่คุณมีในใจ</p>
                    </div>
                    <span className={styles.count}>
                        {names.length} / 5 ชื่อ
                    </span>
                </div>
                <div className={styles.nameGrid}>
                    {names.map((item, index) => (
                        <NameInput
                            key={item.id}
                            number={index + 1}
                            value={item.value}
                            error={attempted ? errors.names[index] : undefined}
                            onChange={(value) => {
                                setNames((current) =>
                                    current.map((slot) =>
                                        slot.id === item.id
                                            ? { ...slot, value }
                                            : slot,
                                    ),
                                );
                                invalidate();
                            }}
                            onRemove={
                                names.length > 2
                                    ? () => {
                                          setNames((current) =>
                                              current.filter(
                                                  (slot) => slot.id !== item.id,
                                              ),
                                          );
                                          invalidate();
                                          requestAnimationFrame(() =>
                                              formRef.current
                                                  ?.querySelector<HTMLInputElement>(
                                                      '[role="combobox"]',
                                                  )
                                                  ?.focus(),
                                          );
                                      }
                                    : undefined
                            }
                        />
                    ))}
                    {names.length < 5 && (
                        <button
                            type="button"
                            className={styles.addName}
                            onClick={() => {
                                const id = nextId.current++;
                                setNames((current) => [
                                    ...current,
                                    { id, value: '' },
                                ]);
                                invalidate();
                                requestAnimationFrame(() => {
                                    const inputs =
                                        formRef.current?.querySelectorAll<HTMLInputElement>(
                                            '[role="combobox"]',
                                        );
                                    inputs?.[inputs.length - 1]?.focus();
                                });
                            }}
                        >
                            <Plus size={20} aria-hidden="true" /> เพิ่มชื่อ
                        </button>
                    )}
                </div>
                <p className={styles.formHint}>
                    พิมพ์อย่างน้อย 2 ตัวอักษรเพื่อค้นหา
                    เปรียบเทียบชื่อจริงของคนเดียวกันได้ครั้งละ 2–5 ชื่อ
                </p>
                <div className={styles.sharedHeading}>
                    <span className={styles.step}>02</span>
                    <h2>ข้อมูลร่วมสำหรับทุกชื่อ</h2>
                </div>
                <div className={styles.sharedFields}>
                    <div>
                        <label htmlFor="compare-surname">
                            นามสกุล <span>(ไม่บังคับ)</span>
                        </label>
                        <input
                            id="compare-surname"
                            value={surname}
                            maxLength={100}
                            placeholder="ใช้นามสกุลเดียวกันทุกชื่อ"
                            aria-invalid={attempted && !!errors.surname}
                            aria-describedby={
                                attempted && errors.surname
                                    ? 'surname-error'
                                    : undefined
                            }
                            onChange={(event) => {
                                setSurname(event.target.value);
                                invalidate();
                            }}
                        />
                        {attempted && errors.surname && (
                            <p id="surname-error" className={styles.error}>
                                {errors.surname}
                            </p>
                        )}
                    </div>
                    <div>
                        <label htmlFor="compare-day">วันเกิด</label>
                        <select
                            id="compare-day"
                            value={day}
                            aria-invalid={attempted && !!errors.day}
                            aria-describedby={
                                attempted && errors.day
                                    ? 'day-error'
                                    : undefined
                            }
                            onChange={(event) => {
                                setDay(event.target.value);
                                invalidate();
                            }}
                        >
                            <option value="" disabled>
                                เลือกวันเกิด
                            </option>
                            {Object.entries(thaksaConfig).map(
                                ([key, config]) => (
                                    <option key={key} value={key}>
                                        {config.name}
                                    </option>
                                ),
                            )}
                        </select>
                        {attempted && errors.day && (
                            <p id="day-error" className={styles.error}>
                                {errors.day}
                            </p>
                        )}
                    </div>
                    <button
                        type="submit"
                        className={styles.primary}
                        disabled={busy}
                    >
                        <ArrowRightLeft size={19} aria-hidden="true" />{' '}
                        {busy
                            ? 'กำลังตรวจสอบ…'
                            : comparisonCost(names.length)
                              ? 'เปรียบเทียบ 4–5 ชื่อ · 10 เครดิต'
                              : 'เปรียบเทียบชื่อฟรี'}
                    </button>
                </div>
                <div className={styles.formFooter}>
                    <ShieldCheck size={16} aria-hidden="true" />
                    <span>
                        เปรียบเทียบ 2–3 ชื่อฟรี ไม่ต้องสมัคร · 4–5 ชื่อใช้ 10
                        เครดิตต่อชุดและต้องเข้าสู่ระบบ · รายงานสรุปแยก 5 เครดิต
                    </span>
                </div>
                {attempted && !errors.valid && (
                    <p role="alert" className={styles.error}>
                        {errors.form ||
                            'ตรวจสอบข้อมูลที่ระบุไว้ก่อนเปรียบเทียบอีกครั้ง'}
                    </p>
                )}
            </form>

            {purchaseError && !quote && (
                <p role="alert" className={styles.reportWarning}>
                    {purchaseError}
                </p>
            )}
            <dialog
                ref={purchaseDialog}
                className={styles.reportDialog}
                aria-labelledby="extended-confirm-title"
                onCancel={(event) => {
                    if (busy) event.preventDefault();
                    else setQuote(null);
                }}
                onClose={() => {
                    if (!busy) setQuote(null);
                }}
            >
                {quote && (
                    <>
                        <h2 id="extended-confirm-title">
                            ยืนยันเปรียบเทียบ {quote.input.names.length} ชื่อ
                        </h2>
                        <p>
                            ใช้ {quote.cost} เครดิตต่อชุด ·
                            เปิดชุดเดิมซ้ำไม่หักเพิ่ม
                        </p>
                        <p>
                            เครดิตคงเหลือ {quote.balance} เครดิต
                            {quote.balance >= quote.cost
                                ? ` → หลังใช้ ${quote.balance - quote.cost} เครดิต`
                                : ''}
                        </p>
                        <p className={styles.reportMeta}>
                            เพิ่มหรือลบชื่อ เปลี่ยนนามสกุลหรือวันเกิด
                            ถือเป็นชุดใหม่ รายงานสรุป PDF/CSV เป็นบริการแยก 5
                            เครดิต
                        </p>
                        {quote.balance < quote.cost && (
                            <p className={styles.reportWarning}>
                                เครดิตไม่เพียงพอ ต้องการอีก{' '}
                                {quote.cost - quote.balance} เครดิต
                            </p>
                        )}
                        {purchaseError && (
                            <p role="alert" className={styles.reportWarning}>
                                {purchaseError}
                            </p>
                        )}
                        <div className={styles.reportActions}>
                            <button
                                type="button"
                                disabled={busy}
                                onClick={() => {
                                    purchaseDialog.current?.close();
                                    setQuote(null);
                                }}
                            >
                                ยกเลิก
                            </button>
                            {quote.balance < quote.cost ? (
                                <Link
                                    href="/topup?redirect=%2Fcompare-names"
                                    onClick={(event) => {
                                        if (!saveDraft(quote.input))
                                            event.preventDefault();
                                    }}
                                >
                                    ไปเติมเครดิต
                                </Link>
                            ) : (
                                <button
                                    type="button"
                                    className={styles.reportPrimary}
                                    disabled={busy}
                                    onClick={purchase}
                                >
                                    {busy
                                        ? 'กำลังเปิดผล…'
                                        : `ยืนยัน · ใช้ ${quote.cost} เครดิต`}
                                </button>
                            )}
                        </div>
                    </>
                )}
            </dialog>
            <div role="status" className={styles.changeStatus}>
                {hasCompared && !result
                    ? 'ข้อมูลเปลี่ยนแล้ว กดเปรียบเทียบชื่อเพื่อดูผลล่าสุด'
                    : result
                      ? `เปรียบเทียบแล้ว ${result.length} ชื่อ`
                      : ''}
            </div>

            {result ? (
                <section
                    ref={resultRef}
                    tabIndex={-1}
                    className={styles.results}
                    aria-labelledby="comparison-results-title"
                >
                    <div className={styles.resultHeading}>
                        <div>
                            <p className={styles.eyebrow}>ผลเปรียบเทียบ</p>
                            <h2 id="comparison-results-title">
                                เห็นความต่าง แล้วเลือกชื่อที่ใช่
                            </h2>
                            <p className={styles.resultContext}>
                                {thaksaConfig[result[0].day].name}
                                {result[0].surname
                                    ? ` · นามสกุล ${result[0].surname}`
                                    : ' · เปรียบเทียบเฉพาะชื่อจริง'}
                            </p>
                        </div>
                        <div className={styles.order}>
                            <label htmlFor="comparison-order">เรียงตาม</label>
                            <select
                                id="comparison-order"
                                value={order}
                                onChange={(event) =>
                                    setOrder(
                                        event.target.value as ComparisonOrder,
                                    )
                                }
                            >
                                <option value="grade">เกรด A+ → C</option>
                                <option value="input">ลำดับที่กรอก</option>
                            </select>
                        </div>
                    </div>
                    <p className={styles.methodNote}>
                        เกรดพิจารณาผลรวมเลขศาสตร์และคู่เลข
                        ส่วนกาลกิณีตรวจแยกตามวันเกิด ชื่อเกรด A+
                        จึงยังอาจมีกาลกิณีได้ เมื่อเกรดเท่ากันจะคงลำดับที่กรอก
                    </p>
                    <p className={styles.scrollHint}>
                        เลื่อนตารางซ้าย–ขวาเพื่อดูทุกชื่อ{' '}
                        <ArrowRight size={15} aria-hidden="true" />
                    </p>
                    <ComparisonTable rows={sorted} />
                    <p className={styles.tableNote}>
                        คู่เลขนับแยกในชื่อและนามสกุล ไม่สร้างคู่เลขข้ามรอยต่อ
                        ผลลัพธ์เป็นข้อมูลประกอบการพิจารณาตามศาสตร์ความเชื่อ{' '}
                        <Link href="/methodology">อ่านหลักการคำนวณ</Link>
                    </p>
                </section>
            ) : (
                <section
                    className={styles.empty}
                    aria-label="สิ่งที่จะได้รับจากการเปรียบเทียบ"
                >
                    <ArrowRightLeft size={27} aria-hidden="true" />
                    <h2>ไม่ต้องจำผลทีละชื่อ</h2>
                    <p>
                        กรอกชื่อที่สนใจ แล้วดูเลขศาสตร์ คู่เลข กาลกิณี
                        และอายตนะเคียงข้างกัน
                    </p>
                    <div>
                        <span>
                            <Check size={15} aria-hidden="true" />{' '}
                            สูตรเดียวกับหน้าวิเคราะห์ชื่อ
                        </span>
                        <span>
                            <Check size={15} aria-hidden="true" />{' '}
                            ดูผลละเอียดต่อได้ทุกชื่อ
                        </span>
                    </div>
                </section>
            )}
            <ComparisonReports rows={result} />
        </>
    );
}
