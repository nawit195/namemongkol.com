'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Eye } from 'lucide-react';

type ArticleViewCounts = Record<string, number>;

type ArticleViewStatsContextValue = {
    counts: ArticleViewCounts;
    loading: boolean;
};

const ArticleViewStatsContext = createContext<ArticleViewStatsContextValue | null>(null);

function getSessionId() {
    const existing = getStorageItem('nm_sid');
    if (existing) return existing;

    const next = `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    setStorageItem('nm_sid', next);
    return next;
}

function getStorageItem(key: string) {
    try {
        return sessionStorage.getItem(key);
    } catch {
        return null;
    }
}

function setStorageItem(key: string, value: string) {
    try {
        sessionStorage.setItem(key, value);
    } catch {
        // Some privacy modes disable storage; view counting can continue without dedupe.
    }
}

async function fetchArticleViewCounts(slugs: string[]) {
    if (slugs.length === 0) return {};

    const params = new URLSearchParams();
    slugs.forEach((slug) => params.append('slug', slug));

    const response = await fetch(`/api/articles/views?${params.toString()}`);
    if (!response.ok) return {};

    const payload = await response.json() as { counts?: ArticleViewCounts };
    return payload.counts ?? {};
}

function formatViewCount(value: number | null) {
    if (value === null) return '—';
    return new Intl.NumberFormat('th-TH').format(value);
}

function getCounterClasses(variant: 'card' | 'detail') {
    if (variant === 'detail') {
        return 'inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 shadow-sm';
    }

    return 'inline-flex min-h-8 items-center gap-1.5 rounded-full border border-amber-400/30 bg-slate-950/70 px-2.5 py-1 text-[10px] font-semibold text-amber-300 shadow-sm';
}

export function ArticleViewStatsProvider({ slugs, children }: { slugs: string[]; children: ReactNode }) {
    const uniqueSlugs = useMemo(() => Array.from(new Set(slugs.filter(Boolean))), [slugs]);
    const [counts, setCounts] = useState<ArticleViewCounts>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        fetchArticleViewCounts(uniqueSlugs)
            .then((nextCounts) => {
                if (mounted) setCounts(nextCounts);
            })
            .catch(() => {
                if (mounted) setCounts({});
            })
            .finally(() => {
                if (mounted) setLoading(false);
            });

        return () => {
            mounted = false;
        };
    }, [uniqueSlugs]);

    return (
        <ArticleViewStatsContext.Provider value={{ counts, loading }}>
            {children}
        </ArticleViewStatsContext.Provider>
    );
}

export function ArticleViewCounter({
    slug,
    variant = 'card',
    className = '',
}: {
    slug: string;
    variant?: 'card' | 'detail';
    className?: string;
}) {
    const context = useContext(ArticleViewStatsContext);
    const rawCount = context?.counts[slug];
    const isLoading = context?.loading ?? false;
    const count = typeof rawCount === 'number' ? rawCount : null;
    const label = variant === 'detail'
        ? `คนอ่าน ${formatViewCount(count)} ครั้ง`
        : `อ่าน ${formatViewCount(count)}`;

    return (
        <span
            className={`${getCounterClasses(variant)} ${className}`}
            aria-label={isLoading && count === null ? 'กำลังโหลดสถิติคนอ่าน' : label}
            title={isLoading && count === null ? 'กำลังโหลดสถิติคนอ่าน' : label}
        >
            <Eye size={variant === 'detail' ? 14 : 12} aria-hidden="true" />
            <span>{variant === 'detail' ? label : `อ่าน ${formatViewCount(count)}`}</span>
        </span>
    );
}

export function ArticleViewTracker({ slug }: { slug: string }) {
    const [counts, setCounts] = useState<ArticleViewCounts>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        fetchArticleViewCounts([slug])
            .then((nextCounts) => {
                if (mounted) setCounts(nextCounts);
            })
            .catch(() => {
                if (mounted) setCounts({});
            })
            .finally(() => {
                if (mounted) setLoading(false);
            });

        return () => {
            mounted = false;
        };
    }, [slug]);

    useEffect(() => {
        const key = `namemongkol:article-viewed:${slug}`;
        if (getStorageItem(key)) return;

        const payload = {
            event_name: 'view',
            button_key: 'articles.detail.view',
            page_path: `/articles/${slug}`,
            user_id: null,
            session_id: getSessionId(),
            referrer: document.referrer,
            metadata: { slug },
        };

        fetch('/api/analytics/ingest', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            keepalive: true,
        }).then((response) => {
            if (!response.ok) return;
            setStorageItem(key, '1');
            setCounts((current) => ({
                ...current,
                [slug]: (current[slug] ?? 0) + 1,
            }));
        }).catch(() => {
            // View stats must never interrupt reading.
        });
    }, [slug]);

    return (
        <ArticleViewStatsContext.Provider value={{ counts, loading }}>
            <ArticleViewCounter slug={slug} variant="detail" />
        </ArticleViewStatsContext.Provider>
    );
}
