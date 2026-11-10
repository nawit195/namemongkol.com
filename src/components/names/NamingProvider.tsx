'use client';
import {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
    type ReactNode,
} from 'react';
import { Heart, X, ArrowRightLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
    favoritesStorageKey,
    PENDING_FAVORITE_KEY,
    COMPARISON_SELECTION_KEY,
    MAX_FAVORITES,
    favoriteId,
    parseFavorites,
    writeFavorites,
    parseComparisonSelection,
    canCompareFavorite,
    type FavoriteName,
} from '@/lib/nameFavorites';
import { supabase } from '@/utils/supabase';
import { comparisonCost } from '@/lib/comparisonPricing';
import { trackEvent } from '@/lib/analytics';
import styles from './naming.module.css';

type FavoriteContext = {
    items: FavoriteName[];
    toggle: (item: FavoriteName) => void;
};
const Context = createContext<FavoriteContext | null>(null);
export const trackNaming = (event: string, kind: string, count?: number) =>
    void trackEvent(`names.${event}`, {
        metadata: { kind, ...(count !== undefined ? { count } : {}) },
    });

export function NamingProvider({ children }: { children: ReactNode }) {
    const router = useRouter();
    const [items, setItems] = useState<FavoriteName[]>([]);
    const [message, setMessage] = useState('');
    const [selected, setSelected] = useState<string[]>([]);
    const drawer = useRef<HTMLDialogElement>(null);
    const account = useRef<string | null>(null);
    const itemsRef = useRef<FavoriteName[]>([]);
    const authVersion = useRef(0);
    const busy = useRef(false);
    const [signedIn, setSignedIn] = useState(false);
    function persist(next: FavoriteName[], userId: string) {
        if (account.current !== userId) return;
        itemsRef.current = next;
        setItems(next);
        try {
            if (
                !writeFavorites(localStorage, next, favoritesStorageKey(userId))
            )
                setMessage(
                    'เก็บได้ชั่วคราวในหน้านี้ เบราว์เซอร์ไม่อนุญาตให้บันทึกบนอุปกรณ์',
                );
        } catch {
            setMessage(
                'เก็บได้ชั่วคราวในหน้านี้ เบราว์เซอร์ไม่อนุญาตให้บันทึกบนอุปกรณ์',
            );
        }
    }
    function loadAccount(userId: string | null) {
        if (account.current === userId) return;
        account.current = userId;
        itemsRef.current = [];
        setItems([]);
        setSelected([]);
        setSignedIn(!!userId);
        drawer.current?.close();
        if (!userId) return;
        let restored: FavoriteName[] = [];
        try {
            const raw = localStorage.getItem(favoritesStorageKey(userId));
            restored = raw ? parseFavorites(JSON.parse(raw)) : [];
        } catch {
            setMessage(
                'เบราว์เซอร์ไม่อนุญาตให้บันทึก คุณยังเก็บชื่อชั่วคราวในหน้านี้ได้หลังเข้าสู่ระบบ',
            );
        }
        try {
            const raw = sessionStorage.getItem(PENDING_FAVORITE_KEY);
            sessionStorage.removeItem(PENDING_FAVORITE_KEY);
            const pending = raw
                ? parseFavorites([JSON.parse(raw)])[0]
                : undefined;
            if (
                pending &&
                restored.length < MAX_FAVORITES &&
                !restored.some(
                    (item) => favoriteId(item) === favoriteId(pending),
                )
            ) {
                restored = [...restored, pending];
                setMessage(
                    'เข้าสู่ระบบแล้ว เพิ่มชื่อที่เลือกไว้ในชื่อที่ชอบแล้ว',
                );
            }
        } catch {
            /* A pending favorite is optional, never a payment instruction. */
        }
        persist(restored, userId);
    }
    useEffect(() => {
        let cancelled = false;
        const requestState = authVersion;
        const verify = async () => {
            const version = ++authVersion.current;
            try {
                const {
                    data: { user },
                    error,
                } = await supabase.auth.getUser();
                if (!cancelled && version === authVersion.current)
                    loadAccount(
                        !error && user && !user.is_anonymous ? user.id : null,
                    );
            } catch {
                if (!cancelled && version === authVersion.current)
                    loadAccount(null);
            }
        };
        void verify();
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'SIGNED_OUT') {
                authVersion.current++;
                loadAccount(null);
            } else if (event === 'SIGNED_IN' || event === 'USER_UPDATED')
                setTimeout(() => {
                    if (!cancelled) void verify();
                }, 0);
        });
        const update = (event: StorageEvent) => {
            if (
                account.current &&
                (event.key === favoritesStorageKey(account.current) ||
                    event.key === null)
            ) {
                try {
                    const raw = localStorage.getItem(
                        favoritesStorageKey(account.current),
                    );
                    const next = raw ? parseFavorites(JSON.parse(raw)) : [];
                    itemsRef.current = next;
                    setItems(next);
                    setSelected([]);
                } catch {
                    /* Keep current in-memory names. */
                }
            }
        };
        window.addEventListener('storage', update);
        return () => {
            cancelled = true;
            requestState.current++;
            subscription.unsubscribe();
            window.removeEventListener('storage', update);
        };
        // The subscription owns account changes; refs ensure callbacks never use another account's names.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    async function requireAccount(pending?: FavoriteName) {
        const version = authVersion.current;
        try {
            const {
                data: { user },
                error,
            } = await supabase.auth.getUser();
            if (version !== authVersion.current) return null;
            if (!error && user && !user.is_anonymous) {
                loadAccount(user.id);
                return user.id;
            }
        } catch {
            /* Require a verified signed-in user even if auth is unavailable. */
        }
        loadAccount(null);
        if (pending) {
            try {
                sessionStorage.setItem(
                    PENDING_FAVORITE_KEY,
                    JSON.stringify(pending),
                );
            } catch {
                /* Login still works; select the name again afterward. */
            }
        }
        window.location.assign(
            `/login?redirect=${encodeURIComponent(window.location.pathname)}`,
        );
        return null;
    }
    async function toggle(item: FavoriteName) {
        if (busy.current) return;
        busy.current = true;
        try {
            const userId = await requireAccount(item);
            if (!userId) return;
            const current = itemsRef.current;
            const id = favoriteId(item);
            const exists = current.some((entry) => favoriteId(entry) === id);
            if (!exists && current.length >= MAX_FAVORITES) {
                setMessage(
                    'เก็บได้สูงสุด 50 รายการ ลบบางชื่อก่อนเพิ่มชื่อใหม่',
                );
                return;
            }
            setMessage(
                exists ? 'นำชื่อออกจากรายการแล้ว' : 'เพิ่มชื่อที่ชอบแล้ว',
            );
            persist(
                exists
                    ? current.filter((entry) => favoriteId(entry) !== id)
                    : [
                          ...current,
                          { ...item, name: item.name.normalize('NFC').trim() },
                      ],
                userId,
            );
            setSelected((previous) => previous.filter((value) => value !== id));
            trackNaming(
                exists ? 'favorite_remove' : 'favorite_add',
                item.kind,
                exists ? current.length - 1 : current.length + 1,
            );
        } finally {
            busy.current = false;
        }
    }
    async function openFavorites() {
        if (await requireAccount()) drawer.current?.showModal();
    }
    const picked = items.filter((item) => selected.includes(favoriteId(item)));
    const names = [
        ...new Map(
            picked.map((item) => [item.name.toLowerCase(), item.name]),
        ).values(),
    ];
    async function compare() {
        const owner = account.current;
        const userId = await requireAccount();
        if (!userId || userId !== owner) return;
        const valid = parseComparisonSelection({ names });
        if (!valid) {
            setMessage('เลือกชื่อจริงหรือชื่ออังกฤษที่ไม่ซ้ำกัน 2–5 ชื่อ');
            return;
        }
        try {
            sessionStorage.setItem(
                COMPARISON_SELECTION_KEY,
                JSON.stringify({ version: 1, names: valid }),
            );
        } catch {
            setMessage(
                'ไม่สามารถส่งชื่ออัตโนมัติได้ กรุณาจดชื่อแล้วกรอกในหน้าเปรียบเทียบ',
            );
            return;
        }
        trackNaming('compare_selection', 'given', valid.length);
        drawer.current?.close();
        router.push('/compare-names');
    }
    return (
        <Context.Provider value={{ items, toggle }}>
            <div className={styles.scope}>
                {children}
                <div className={styles.favoriteBar}>
                    <div>
                        <strong>
                            <Heart size={18} aria-hidden="true" /> ชื่อที่ชอบ{' '}
                            <span>{items.length} / 50</span>
                        </strong>
                        <span className={styles.barHint}>
                            เลือกไว้ก่อน ค่อยคุยกันในครอบครัว
                        </span>
                    </div>
                    <button type="button" onClick={openFavorites}>
                        {signedIn ? 'เปิดรายการ' : 'เข้าสู่ระบบเพื่อเก็บชื่อ'}
                    </button>
                </div>
                <p
                    role="status"
                    aria-live="polite"
                    className={styles.favoriteStatus}
                >
                    {message}
                </p>
                <dialog
                    ref={drawer}
                    className={styles.drawer}
                    aria-labelledby="favorite-title"
                >
                    <div className={styles.drawerHeading}>
                        <h2 id="favorite-title">ชื่อที่ชอบ ({items.length})</h2>
                        <button
                            type="button"
                            aria-label="ปิดรายการชื่อที่ชอบ"
                            onClick={() => drawer.current?.close()}
                        >
                            <X size={20} />
                        </button>
                    </div>
                    <p>
                        เลือกชื่อจริงหรือชื่ออังกฤษ 2–3 ชื่อเปรียบเทียบฟรี หรือ
                        4–5 ชื่อใช้ 10 เครดิตต่อชุด โดยยืนยันในหน้าเปรียบเทียบ
                        ชื่อเล่นเก็บเป็นไอเดียแยก ไม่รวมในการเปรียบเทียบชื่อจริง
                    </p>
                    {!items.length ? (
                        <p className={styles.empty}>
                            ยังไม่มีชื่อที่เก็บไว้
                            กดหัวใจข้างชื่อที่ถูกใจเพื่อเริ่มเลือก
                        </p>
                    ) : (
                        <ul className={styles.favoriteList}>
                            {items.map((item) => {
                                const id = favoriteId(item);
                                return (
                                    <li key={id}>
                                        <label>
                                            <input
                                                type="checkbox"
                                                disabled={
                                                    !canCompareFavorite(item)
                                                }
                                                checked={selected.includes(id)}
                                                onChange={(event) => {
                                                    if (
                                                        event.target.checked &&
                                                        selected.length >= 5
                                                    ) {
                                                        setMessage(
                                                            'เลือกเปรียบเทียบได้ครั้งละไม่เกิน 5 รายการ',
                                                        );
                                                        return;
                                                    }
                                                    setSelected((previous) =>
                                                        event.target.checked
                                                            ? [...previous, id]
                                                            : previous.filter(
                                                                  (value) =>
                                                                      value !==
                                                                      id,
                                                              ),
                                                    );
                                                }}
                                            />
                                            <span>
                                                <strong>{item.name}</strong>
                                                <small>
                                                    {item.kind === 'nickname'
                                                        ? 'ชื่อเล่น'
                                                        : item.kind ===
                                                            'english'
                                                          ? 'ชื่ออังกฤษ'
                                                          : 'ชื่อจริงไทย'}
                                                </small>
                                            </span>
                                        </label>
                                        <button
                                            type="button"
                                            aria-label={`นำ ${item.name} ออกจากรายการ`}
                                            onClick={() => toggle(item)}
                                        >
                                            ลบ
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                    <p role="status">{message}</p>
                    <button
                        type="button"
                        className={styles.primary}
                        disabled={names.length < 2 || names.length > 5}
                        onClick={compare}
                    >
                        <ArrowRightLeft size={18} aria-hidden="true" />{' '}
                        {comparisonCost(names.length)
                            ? 'ไปเปรียบเทียบ · 10 เครดิต'
                            : `เปรียบเทียบฟรี ${names.length} ชื่อ`}
                    </button>
                    <p className={styles.note}>
                        เก็บชื่อหลังเข้าสู่ระบบ แยกรายการตามบัญชีบนอุปกรณ์นี้
                        การเก็บชื่อไม่เสียเครดิต การเปรียบเทียบ 4–5 ชื่อใช้ 10
                        เครดิตต่อชุด ส่วนรายงานสรุป 5 เครดิตเป็นบริการแยก
                    </p>
                </dialog>
            </div>
        </Context.Provider>
    );
}
export function FavoriteButton({ name, kind }: FavoriteName) {
    const context = useContext(Context);
    if (!context) return null;
    const pressed = context.items.some(
        (item) => favoriteId(item) === favoriteId({ name, kind }),
    );
    return (
        <button
            type="button"
            className={styles.favoriteButton}
            aria-pressed={pressed}
            aria-label={`${pressed ? 'นำ' : 'เก็บ'} ${name} ${pressed ? 'ออกจากรายการ' : 'ไว้ในชื่อที่ชอบ'}`}
            onClick={() => context.toggle({ name, kind })}
        >
            <Heart
                size={17}
                fill={pressed ? 'currentColor' : 'none'}
                aria-hidden="true"
            />
            {pressed ? 'เก็บแล้ว' : 'เก็บชื่อ'}
        </button>
    );
}
