'use client';

import { useEffect, useState } from 'react';
import { pageTrafficReportSchema, type PageTrafficReport } from '@/lib/pageTraffic';
import { thaiActivityDate } from '@/lib/memberActivityDates';
import { PageTrafficView } from './PageTrafficView';

export default function PageTrafficPage() {
    const today = thaiActivityDate();
    const [draft, setDraft] = useState({ from: today, to: today, q: '' });
    const [query, setQuery] = useState({ ...draft, page: 1 });
    const [data, setData] = useState<PageTrafficReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [denied, setDenied] = useState(false);
    useEffect(() => {
        const controller = new AbortController();
        let active = true;
        async function load() {
            setLoading(true); setError(''); setDenied(false); setData(null);
            const params = new URLSearchParams({ ...query, page: String(query.page) });
            try {
                const response = await fetch(`/api/admin/page-traffic?${params}`, { cache: 'no-store', signal: controller.signal });
                const body = await response.json();
                if (!active) return;
                if (response.status === 401 || response.status === 403) setDenied(true);
                if (!response.ok) throw new Error(body.error || 'โหลดข้อมูลไม่สำเร็จ');
                const parsed = pageTrafficReportSchema.safeParse(body);
                if (!parsed.success) throw new Error('ข้อมูลรายงานไม่ถูกต้อง');
                const lastPage = Math.max(1, Math.ceil(parsed.data.total / 50));
                if (query.page > lastPage) { setQuery(previous => ({ ...previous, page: lastPage })); return; }
                setData(parsed.data);
            } catch (failure) {
                if (active) setError(failure instanceof Error ? failure.message : 'โหลดข้อมูลไม่สำเร็จ');
            } finally { if (active) setLoading(false); }
        }
        void load();
        return () => { active = false; controller.abort(); };
    }, [query]);
    return <PageTrafficView {...{ today, draft, query, data, loading, error, denied, setDraft, setQuery, setError }} />;
}
