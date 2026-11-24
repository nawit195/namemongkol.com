'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
    ArrowLeft,
    ArrowRight,
    Award,
    Check,
    Coins,
    LockKeyhole,
    Search,
    SlidersHorizontal,
    Sparkles,
    X,
} from 'lucide-react';
import { supabase } from '@/utils/supabase';
import { FavoriteListButton } from '@/components/names/NamingProvider';
import {
    DEFAULT_NICKNAME_FILTERS,
    NICKNAME_DAYS,
    NICKNAME_GENDERS,
    NICKNAME_FREE_PER_INITIAL,
    NICKNAME_PREVIEW_POLICY,
    nicknameFilterParams,
    nicknameReturnUrl,
    normalizeNicknameFilters,
} from '@/lib/auspiciousNicknameShared';
import type {
    NicknameFilters,
    NicknameQueryResponse,
} from '@/types/auspiciousNickname';
import NicknameCard from './NicknameCard';
import NicknameLockedCard from './NicknameLockedCard';
import styles from './nicknames.module.css';

type Confirmation = {
    quote: string;
    count: number;
    credits: number;
    filters: NicknameFilters;
};
type PendingPurchase = {
    quote: string;
    requestId: string;
    filters: NicknameFilters;
};

export default function NicknameBrowser({
    initial,
}: {
    initial: NicknameQueryResponse;
}) {
    const searchParams = useSearchParams();
    const urlKey = searchParams.toString();
    const filters = useMemo(
        () =>
            normalizeNicknameFilters(
                Object.fromEntries(new URLSearchParams(urlKey)),
            ),
        [urlKey],
    );
    const [draft, setDraft] = useState(filters.q);
    const [authId, setAuthId] = useState<string | null | undefined>(undefined);
    const owner = filters.group === 'aplus' && authId ? authId : 'public';
    const requestKey = `${nicknameFilterParams(filters)}:${owner}`;
    const initialsKey = `${nicknameFilterParams({
        ...filters,
        initial: 'all',
        page: 1,
    })}:${owner}`;
    const [result, setResult] = useState({
        key: ':public',
        initialsKey: ':public',
        body: initial,
    });
    const body = result.key === requestKey ? result.body : null;
    const availableInitials =
        result.initialsKey === initialsKey
            ? result.body.initials.filter(
                  ({ initial: letter, count }) => Boolean(letter) && count > 0,
              )
            : [];
    const metadata =
        body ?? (result.key.endsWith(`:${owner}`) ? result.body : initial);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [retry, setRetry] = useState(0);
    const [purchasing, setPurchasing] = useState(false);
    const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
    const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const interactionQuery = useRef<string | null>(null);
    const purchaseBusy = useRef(false);
    const pending = useRef<PendingPurchase | null>(null);
    const authRef = useRef(authId);
    const confirmButton = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        let active = true;
        const setAccount = (id: string | null) => {
            if (active) {
                if (authRef.current !== id) {
                    setConfirmation(null);
                    pending.current = null;
                    setMessage('');
                    setError('');
                }
                authRef.current = id;
                setAuthId(id);
            }
        };
        void supabase.auth
            .getSession()
            .then(({ data }) => setAccount(data.session?.user.id ?? null));
        const { data } = supabase.auth.onAuthStateChange((_event, session) =>
            setAccount(session?.user.id ?? null),
        );
        return () => {
            active = false;
            data.subscription.unsubscribe();
        };
    }, []);
    useEffect(() => {
        // URL updates from typing must not replace newer input on the next frame.
        if (interactionQuery.current === filters.q) {
            interactionQuery.current = null;
            return;
        }
        const frame = requestAnimationFrame(() => setDraft(filters.q));
        return () => cancelAnimationFrame(frame);
    }, [filters.q]);
    useEffect(
        () => () => {
            if (searchTimer.current) clearTimeout(searchTimer.current);
        },
        [],
    );
    useEffect(() => {
        if (confirmation) confirmButton.current?.focus();
    }, [confirmation]);

    useEffect(() => {
        if (filters.group === 'aplus' && authId === undefined) return;
        const controller = new AbortController();
        let active = true;
        let timedOut = false;
        const timeout = setTimeout(() => {
            timedOut = true;
            controller.abort();
        }, 15_000);
        const frame = requestAnimationFrame(() => setError(''));
        async function load() {
            try {
                if (requestKey === ':public' && retry === 0) {
                    setResult({ key: requestKey, initialsKey, body: initial });
                    return;
                }
                const response =
                    owner === 'public'
                        ? await fetch(
                              `/api/public/nicknames?${nicknameFilterParams(filters)}&preview=${NICKNAME_PREVIEW_POLICY}`,
                              { signal: controller.signal },
                          )
                        : await fetch('/api/nicknames/query', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ filters }),
                              signal: controller.signal,
                              cache: 'no-store',
                          });
                const payload = await response.json();
                if (!response.ok || !payload.success)
                    throw new Error(
                        payload.error || 'โหลดรายชื่อไม่สำเร็จ กรุณาลองใหม่',
                    );
                if (active && !controller.signal.aborted)
                    setResult({ key: requestKey, initialsKey, body: payload });
            } catch (reason) {
                if (active && (!controller.signal.aborted || timedOut))
                    setError(
                        reason instanceof Error && !timedOut
                            ? reason.message
                            : 'โหลดรายชื่อนานเกินไป กรุณาลองใหม่',
                    );
            } finally {
                clearTimeout(timeout);
            }
        }
        void load();
        return () => {
            active = false;
            controller.abort();
            clearTimeout(timeout);
            cancelAnimationFrame(frame);
        };
    }, [filters, requestKey, initialsKey, owner, authId, initial, retry]);

    function changeFilters(patch: Partial<NicknameFilters>, replace = false) {
        if (purchaseBusy.current) return;
        if (searchTimer.current) clearTimeout(searchTimer.current);
        const next = normalizeNicknameFilters({
            ...filters,
            q: draft,
            page: 1,
            ...patch,
        });
        setConfirmation(null);
        pending.current = null;
        setError('');
        setMessage('');
        interactionQuery.current = next.q;
        window.history[replace ? 'replaceState' : 'pushState'](
            null,
            '',
            nicknameReturnUrl(next),
        );
        if (patch.page)
            document
                .getElementById('nickname-results')
                ?.scrollIntoView({ block: 'start' });
    }
    const returnUrl = nicknameReturnUrl(filters);
    const loginUrl = `/login?redirect=${encodeURIComponent(returnUrl)}`;
    const topupUrl = `/topup?returnTo=${encodeURIComponent(returnUrl)}`;
    const plus = filters.group === 'aplus';
    const signedIn = Boolean(
        authId && (!plus || !body || body.viewer.authenticated),
    );
    const ownedLoginRequired =
        plus && filters.view === 'owned' && authId !== undefined && !signedIn;
    const summary = body?.summary ?? initial.summary;

    function beginUnlock() {
        if (purchaseBusy.current || !body || body.purchase.count === 0) return;
        if (!signedIn) {
            window.location.assign(loginUrl);
            return;
        }
        if (
            body.viewer.credits !== null &&
            body.viewer.credits < body.purchase.cost
        ) {
            window.location.assign(topupUrl);
            return;
        }
        if (!body.accessReady || !body.purchase.quote) return;
        setError('');
        setConfirmation({
            quote: body.purchase.quote,
            count: body.purchase.count,
            credits: body.viewer.credits ?? 0,
            filters,
        });
        document
            .getElementById('nickname-results')
            ?.scrollIntoView({ block: 'start', behavior: 'instant' });
    }

    async function purchase() {
        if (!confirmation || purchaseBusy.current || !authId) return;
        purchaseBusy.current = true;
        setPurchasing(true);
        setError('');
        const submittedOwner = authId;
        const submitted = pending.current ?? {
            quote: confirmation.quote,
            requestId: crypto.randomUUID(),
            filters: confirmation.filters,
        };
        pending.current = submitted;
        try {
            const response = await fetch('/api/nicknames/unlock', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submitted),
                cache: 'no-store',
                signal: AbortSignal.timeout(20_000),
            });
            const payload = await response.json();
            if (response.status === 409) {
                pending.current = null;
                setConfirmation(null);
                setRetry((value) => value + 1);
            }
            if (response.status === 401) {
                window.location.assign(loginUrl);
                return;
            }
            if (!response.ok || !payload.success)
                throw new Error(
                    payload.error ||
                        'ยังยืนยันผลไม่ได้ กรุณาลองอีกครั้ง ระบบจะตรวจคำขอเดิมก่อนหักเครดิต',
                );
            if (authRef.current !== submittedOwner) return;
            setResult({ key: requestKey, initialsKey, body: payload });
            pending.current = null;
            setConfirmation(null);
            setMessage(
                `เปิดชื่อเล่น ${payload.receivedCount} ชื่อแล้ว กลับมาดูได้โดยไม่หักเครดิตซ้ำ`,
            );
            window.dispatchEvent(new Event('force_credits_update'));
        } catch (reason) {
            setError(
                reason instanceof Error && reason.name !== 'TimeoutError'
                    ? reason.message
                    : 'ยังยืนยันผลปลดล็อกไม่ได้ กดยืนยันอีกครั้งเพื่อตรวจคำขอเดิม',
            );
        } finally {
            purchaseBusy.current = false;
            setPurchasing(false);
        }
    }

    return (
        <main className={styles.page}>
            <nav className={styles.breadcrumbs} aria-label="เส้นทางหน้า">
                <Link prefetch={false} href="/search">
                    ค้นหาชื่อมงคล
                </Link>
                <span aria-hidden="true">/</span>
                <span>ชื่อเล่นมงคล</span>
            </nav>
            <header className={styles.header}>
                <div>
                    <p className={styles.eyebrow}>เลือกเสียงเรียกที่ชอบ</p>
                    <h1>ชื่อเล่นมงคล</h1>
                    <p>เลือกจากความหมาย วันเกิด และเลขศาสตร์</p>
                </div>
                <FavoriteListButton className={styles.favoritesTrigger} />
            </header>
            <div
                className={styles.tabs}
                role="group"
                aria-label="เลือกกลุ่มเกรด"
            >
                <button
                    type="button"
                    disabled={purchasing}
                    aria-pressed={!plus}
                    onClick={() =>
                        changeFilters({
                            group: 'ab',
                            grade: 'all',
                            view: 'all',
                        })
                    }
                >
                    <span className={styles.gradeIcon} aria-hidden="true">
                        <Award size={26} />
                        <Check size={11} className={styles.gradeSelected} />
                    </span>
                    <span className={styles.gradeCopy}>
                        <span className={styles.gradeTitle}>เกรด A และ B</span>
                        <small className={styles.gradeStatus}>ดูฟรีทุกชื่อ</small>
                    </span>
                    <span className={styles.gradeCount}>
                        <strong>{summary.ab.toLocaleString('th-TH')}</strong>
                        <small>รายชื่อ</small>
                    </span>
                </button>
                <button
                    type="button"
                    disabled={purchasing}
                    aria-pressed={plus}
                    onClick={() =>
                        changeFilters({
                            group: 'aplus',
                            grade: 'all',
                            view: 'all',
                        })
                    }
                >
                    <span className={styles.gradeIcon} aria-hidden="true">
                        <Sparkles size={26} />
                        <Check size={11} className={styles.gradeSelected} />
                    </span>
                    <span className={styles.gradeCopy}>
                        <span className={styles.gradeTitle}>เกรด A+</span>
                        <small className={styles.gradeStatus}>15 เครดิต / ชุด</small>
                    </span>
                    <span className={styles.gradeCount}>
                        <strong>{summary.aPlus.toLocaleString('th-TH')}</strong>
                        <small>รายชื่อ</small>
                    </span>
                </button>
            </div>
            {plus && (
                <div className={styles.wallet}>
                    <div>
                        <Coins size={18} aria-hidden="true" />
                        <span>
                            เครดิต{' '}
                            <strong>{body?.viewer.credits ?? '—'}</strong>
                        </span>
                        <span className={styles.walletPrice}>
                            15 เครดิต / สูงสุด 20 ชื่อ
                        </span>
                    </div>
                    <Link
                        prefetch={false}
                        href={signedIn ? topupUrl : loginUrl}
                    >
                        {signedIn ? 'เติมเครดิต' : 'เข้าสู่ระบบ'}
                    </Link>
                </div>
            )}
            <fieldset className={styles.filters} disabled={purchasing}>
                <legend className={styles.srOnly}>ตัวกรองชื่อเล่น</legend>
                <div className={styles.primaryFilters}>
                    <label className={styles.searchLabel}>
                        ค้นหาชื่อหรือความหมาย
                        <div className={styles.searchInput}>
                            <Search size={17} aria-hidden="true" />
                            <input
                                type="search"
                                value={draft}
                                maxLength={100}
                                placeholder="เช่น คิโบ หรือ ความหวัง"
                                onChange={(event) => {
                                    const value = event.target.value;
                                    setDraft(value);
                                    if (searchTimer.current)
                                        clearTimeout(searchTimer.current);
                                    searchTimer.current = setTimeout(
                                        () => changeFilters({ q: value }, true),
                                        300,
                                    );
                                }}
                            />
                        </div>
                    </label>
                    <label>
                        วันเกิด
                        <select
                            aria-label="วันเกิด"
                            value={filters.day}
                            onChange={(event) =>
                                changeFilters({
                                    day: event.target
                                        .value as NicknameFilters['day'],
                                })
                            }
                        >
                            <option value="all">ทุกวันเกิด</option>
                            {NICKNAME_DAYS.map((day) => (
                                <option key={day.key} value={day.key}>
                                    {day.label}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label>
                        เพศ
                        <select
                            aria-label="เพศ"
                            value={filters.gender}
                            onChange={(event) =>
                                changeFilters({
                                    gender: event.target
                                        .value as NicknameFilters['gender'],
                                })
                            }
                        >
                            <option value="all">ทั้งหมด</option>
                            <option value="male">ชาย รวมใช้ได้ทุกเพศ</option>
                            <option value="female">หญิง รวมใช้ได้ทุกเพศ</option>
                            <option value="unisex">ใช้ได้ทุกเพศ</option>
                        </select>
                    </label>
                </div>
                <div className={styles.filterFooter}>
                    <details className={styles.advanced}>
                        <summary>
                            <SlidersHorizontal size={14} aria-hidden="true" />
                            ตัวกรองเพิ่มเติม
                            {filters.score !== null || filters.grade !== 'all'
                                ? ' · ใช้อยู่'
                                : ''}
                        </summary>
                        <div>
                            <label>
                                ผลรวมชื่อ
                                <select
                                    aria-label="ผลรวมชื่อ"
                                    value={filters.score ?? ''}
                                    onChange={(event) =>
                                        changeFilters({
                                            score: event.target.value
                                                ? Number(event.target.value)
                                                : null,
                                        })
                                    }
                                >
                                    <option value="">ทุกผลรวม</option>
                                    {metadata.scores.map((score) => (
                                        <option key={score} value={score}>
                                            {score}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            {!plus && (
                                <label>
                                    เกรด
                                    <select
                                        aria-label="เกรด"
                                        value={filters.grade}
                                        onChange={(event) =>
                                            changeFilters({
                                                grade: event.target
                                                    .value as NicknameFilters['grade'],
                                            })
                                        }
                                    >
                                        <option value="all">A และ B</option>
                                        <option value="A">A</option>
                                        <option value="B">B</option>
                                    </select>
                                </label>
                            )}
                        </div>
                    </details>
                    <button
                        type="button"
                        className={styles.reset}
                        onClick={() => {
                            setDraft('');
                            changeFilters({
                                ...DEFAULT_NICKNAME_FILTERS,
                                group: filters.group,
                            });
                        }}
                    >
                        <X size={13} aria-hidden="true" />
                        ล้างตัวกรอง
                    </button>
                </div>
            </fieldset>
            <fieldset className={styles.alphabet} disabled={purchasing}>
                <legend>เลือกอักษรนำ</legend>
                <div>
                    <button
                        type="button"
                        aria-pressed={filters.initial === 'all'}
                        onClick={() => changeFilters({ initial: 'all' })}
                    >
                        ทั้งหมด
                    </button>
                    {availableInitials.map(({ initial: letter, count }) => (
                        <button
                            type="button"
                            key={letter}
                            aria-pressed={filters.initial === letter}
                            title={`${letter} ${count} ชื่อ`}
                            onClick={() => changeFilters({ initial: letter })}
                        >
                            {letter}
                        </button>
                    ))}
                </div>
            </fieldset>
            <div className={styles.resultHeader} id="nickname-results">
                <div>
                    <h2>
                        {plus ? 'ชื่อเล่นเกรด A+' : 'ชื่อเล่นเกรด A และ B'}
                        <span>
                            {body
                                ? `${body.total.toLocaleString('th-TH')} ชื่อ`
                                : 'กำลังค้นหา…'}
                        </span>
                    </h2>
                    {plus && body && filters.view !== 'owned' && (
                        <p className={styles.accessSummary}>
                            เปิดดูได้{' '}
                            {body.visibleTotal.toLocaleString('th-TH')} ชื่อ
                            <span aria-hidden="true"> · </span>
                            รอปลดล็อก {body.lockedCount.toLocaleString(
                                'th-TH',
                            )}{' '}
                            ชื่อ
                        </p>
                    )}
                </div>
                {plus && (
                    <label className={styles.owned}>
                        <input
                            type="checkbox"
                            disabled={!signedIn || purchasing}
                            checked={filters.view === 'owned'}
                            onChange={(event) =>
                                changeFilters({
                                    view: event.target.checked
                                        ? 'owned'
                                        : 'all',
                                })
                            }
                        />
                        ชื่อที่ปลดล็อกแล้ว
                    </label>
                )}
            </div>
            {message && (
                <p className={styles.success} role="status">
                    <Check size={17} aria-hidden="true" />
                    {message}
                </p>
            )}
            {error && (
                <div role="alert" className={styles.error}>
                    <p>{error}</p>
                    {!confirmation && (
                        <button
                            type="button"
                            onClick={() => setRetry((value) => value + 1)}
                        >
                            ลองใหม่
                        </button>
                    )}
                </div>
            )}
            {plus && body && !body.accessReady && body.viewer.authenticated && (
                <p className={styles.error} role="status">
                    ระบบตรวจสอบสิทธิ์ยังไม่พร้อม กรุณาลองใหม่ก่อนปลดล็อก
                </p>
            )}
            {plus &&
                body &&
                body.purchase.count > 0 &&
                filters.view !== 'owned' && (
                    <section
                        className={styles.unlock}
                        aria-labelledby="unlock-title"
                    >
                        <div>
                            <span className={styles.unlockIcon}>
                                <LockKeyhole size={19} aria-hidden="true" />
                            </span>
                            <div>
                                <h3 id="unlock-title">ปลดล็อกชื่อเล่น A+</h3>
                                <p>
                                    มี{' '}
                                    {body.lockedCount.toLocaleString('th-TH')}{' '}
                                    ชื่อที่ยังล็อกตามเงื่อนไขนี้
                                </p>
                                <small>
                                    เปิดชุดนี้ {body.purchase.count} ชื่อ · 15
                                    เครดิต · ชื่อที่เคยเปิดแล้วกลับมาดูได้เสมอ
                                </small>
                            </div>
                        </div>
                        {!signedIn ? (
                            <Link
                                prefetch={false}
                                className={styles.primary}
                                href={loginUrl}
                            >
                                เข้าสู่ระบบเพื่อปลดล็อก
                            </Link>
                        ) : body.viewer.credits !== null &&
                          body.viewer.credits < 15 ? (
                            <Link
                                prefetch={false}
                                className={styles.primary}
                                href={topupUrl}
                            >
                                เติมเครดิตเพื่อเปิดชื่อ
                            </Link>
                        ) : (
                            <button
                                type="button"
                                className={styles.primary}
                                disabled={
                                    !body.accessReady ||
                                    !body.purchase.quote ||
                                    purchasing
                                }
                                onClick={beginUnlock}
                            >
                                เปิด {body.purchase.count} ชื่อ · 15 เครดิต
                            </button>
                        )}
                        {confirmation && (
                            <div className={styles.confirmation}>
                                <h4>
                                    ยืนยันเปิดชื่อใหม่ {confirmation.count}{' '}
                                    ชื่อ?
                                </h4>
                                <p>
                                    {confirmation.filters.initial === 'all'
                                        ? 'ทุกอักษร'
                                        : `อักษร ${confirmation.filters.initial}`}{' '}
                                    ·{' '}
                                    {NICKNAME_DAYS.find(
                                        (day) =>
                                            day.key ===
                                            confirmation.filters.day,
                                    )?.label ?? 'ทุกวันเกิด'}{' '}
                                    ·{' '}
                                    {confirmation.filters.q
                                        ? `ค้นหา “${confirmation.filters.q}” · `
                                        : ''}
                                    {confirmation.filters.gender !== 'all'
                                        ? `${NICKNAME_GENDERS[confirmation.filters.gender]}${confirmation.filters.gender === 'unisex' ? '' : ' รวมใช้ได้ทุกเพศ'} · `
                                        : 'ทุกเพศ · '}
                                    {confirmation.filters.score !== null
                                        ? `ผลรวม ${confirmation.filters.score} · `
                                        : ''}
                                    ใช้ 15 เครดิต คงเหลือ{' '}
                                    {Math.max(0, confirmation.credits - 15)}{' '}
                                    เครดิต
                                </p>
                                <div>
                                    <button
                                        type="button"
                                        ref={confirmButton}
                                        className={styles.primary}
                                        disabled={purchasing}
                                        onClick={() => {
                                            void purchase();
                                        }}
                                    >
                                        {purchasing
                                            ? 'กำลังตรวจสอบและเปิดชื่อ…'
                                            : `ยืนยัน ${confirmation.count} ชื่อ · 15 เครดิต`}
                                    </button>
                                    <button
                                        type="button"
                                        disabled={purchasing}
                                        onClick={() => {
                                            setConfirmation(null);
                                            pending.current = null;
                                        }}
                                    >
                                        ยกเลิก
                                    </button>
                                </div>
                            </div>
                        )}
                    </section>
                )}
            {ownedLoginRequired ? (
                <div className={styles.empty}>
                    <h3>เข้าสู่ระบบเพื่อดูชื่อที่ปลดล็อก</h3>
                    <p>รายชื่อที่ซื้อไว้จะกลับมาแสดงเมื่อเข้าสู่บัญชีเดิม</p>
                    <Link
                        className={styles.primary}
                        prefetch={false}
                        href={loginUrl}
                    >
                        เข้าสู่ระบบ
                    </Link>
                </div>
            ) : body ? (
                <>
                    {body.data.length || body.lockedOnPage > 0 ? (
                        <div className={styles.grid}>
                            {body.data.map((item) => (
                                <NicknameCard
                                    key={item.id}
                                    item={item}
                                    selectedDay={filters.day}
                                />
                            ))}
                            {Array.from(
                                { length: body.lockedOnPage },
                                (_, index) => (
                                    <NicknameLockedCard
                                        key={`locked-${body.page}-${index}`}
                                        index={index}
                                        onUnlock={beginUnlock}
                                        disabled={
                                            purchasing ||
                                            (signedIn &&
                                                (!body.accessReady ||
                                                    !body.purchase.quote))
                                        }
                                    />
                                ),
                            )}
                        </div>
                    ) : (
                        <div className={styles.empty}>
                            <Search size={25} aria-hidden="true" />
                            <h3>
                                {filters.view === 'owned'
                                    ? 'ยังไม่มีชื่อที่ปลดล็อกตรงเงื่อนไขนี้'
                                    : 'ยังไม่พบชื่อที่ตรงเงื่อนไข'}
                            </h3>
                            <p>
                                ลองเปลี่ยนวันเกิด อักษรนำ หรือใช้คำค้นที่สั้นลง
                            </p>
                            <button
                                type="button"
                                disabled={purchasing}
                                onClick={() => {
                                    setDraft('');
                                    changeFilters({
                                        ...DEFAULT_NICKNAME_FILTERS,
                                        group: filters.group,
                                    });
                                }}
                            >
                                ล้างเงื่อนไขในหมวดนี้
                            </button>
                        </div>
                    )}
                    {body.totalPages > 1 && (
                        <nav
                            className={styles.pagination}
                            aria-label="หน้ารายชื่อ"
                        >
                            <button
                                type="button"
                                disabled={body.page <= 1 || purchasing}
                                onClick={() =>
                                    changeFilters({ page: body.page - 1 })
                                }
                            >
                                <ArrowLeft size={16} aria-hidden="true" />
                                ก่อนหน้า
                            </button>
                            <span>
                                หน้า {body.page} / {body.totalPages}
                            </span>
                            <button
                                type="button"
                                disabled={
                                    body.page >= body.totalPages || purchasing
                                }
                                onClick={() =>
                                    changeFilters({ page: body.page + 1 })
                                }
                            >
                                ถัดไป
                                <ArrowRight size={16} aria-hidden="true" />
                            </button>
                        </nav>
                    )}
                    {plus &&
                        filters.view !== 'owned' &&
                        body.lockedCount === 0 &&
                        body.total > 0 && (
                            <p className={styles.complete}>
                                <Check size={16} aria-hidden="true" />
                                เปิดดูชื่อที่ตรงเงื่อนไขนี้ครบแล้ว
                            </p>
                        )}
                </>
            ) : (
                !error && (
                    <div
                        className={styles.grid}
                        role="status"
                        aria-label="กำลังโหลดชื่อเล่น"
                    >
                        {[0, 1, 2].map((key) => (
                            <div className={styles.skeleton} key={key}>
                                <span />
                                <span />
                                <span />
                            </div>
                        ))}
                    </div>
                )
            )}
            <footer className={styles.footer}>
                <p>
                    เกรด ผลรวม และวันเกิดอ้างอิงจากชุดข้อมูลชื่อเล่นมงคล
                    ตัวอย่าง A+ ฟรีอักษรละสูงสุด {NICKNAME_FREE_PER_INITIAL}{' '}
                    ชื่อ เป็นชุดคงที่ของแต่ละอักษร
                </p>
                <div>
                    <Link prefetch={false} href="/names/boys/nicknames">
                        ไอเดียชื่อเล่นลูกชาย
                    </Link>
                    <Link prefetch={false} href="/names/girls/nicknames">
                        ไอเดียชื่อเล่นลูกสาว
                    </Link>
                    <Link prefetch={false} href="/premium-search">
                        ค้นหาชื่อจริงเกรด A+
                    </Link>
                </div>
            </footer>
        </main>
    );
}
