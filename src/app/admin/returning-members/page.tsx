'use client';
import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/utils/supabase';
import {
    parseReturningMembersQuery,
    returningMembersSchema,
    shiftActivityDate,
    thaiActivityDate,
    type ReturningMembersResult,
} from '@/lib/memberActivity';
import { ReturningMembersView } from './ReturningMembersView';

export default function ReturningMembersPage() {
    const today = thaiActivityDate();
    const [period, setPeriod] = useState('30'),
        [from, setFrom] = useState(() =>
            shiftActivityDate(thaiActivityDate(), -29),
        ),
        [to, setTo] = useState(() => thaiActivityDate());
    const [source, setSource] = useState('all'),
        [search, setSearch] = useState(''),
        [query, setQuery] = useState(''),
        [page, setPage] = useState(1),
        [refresh, setRefresh] = useState(0);
    const [data, setData] = useState<ReturningMembersResult | null>(null),
        [loading, setLoading] = useState(true),
        [error, setError] = useState('');
    const [denied, setDenied] = useState<'unauthorized' | 'forbidden' | null>(
        null,
    );
    const version = useRef(0),
        pending = useRef<AbortController | null>(null);
    useEffect(() => {
        const timer = setTimeout(() => setQuery(search.trim()), 300);
        return () => clearTimeout(timer);
    }, [search]);
    useEffect(() => {
        let owner: string | null | undefined;
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
            const next = session?.user.id ?? null;
            if (
                event === 'SIGNED_OUT' ||
                (owner !== undefined && owner !== next)
            ) {
                version.current++;
                pending.current?.abort();
                setData(null);
                setError('');
                setDenied(next ? null : 'unauthorized');
                setRefresh((value) => value + 1);
            }
            owner = next;
        });
        return () => subscription.unsubscribe();
    }, []);
    useEffect(() => {
        const controller = new AbortController();
        pending.current = controller;
        const requestId = ++version.current;
        const frame = requestAnimationFrame(() => {
            setLoading(true);
            setError('');
            setDenied(null);
            setData(null);
            const params = new URLSearchParams({
                source,
                search: query,
                page: String(page),
            });
            if (period === 'custom') {
                params.set('from', from);
                params.set('to', to);
            } else params.set('days', period);
            if (!parseReturningMembersQuery(params)) {
                setError(
                    'เลือกช่วงวันที่ให้ถูกต้อง ไม่เกินวันนี้ และรวมไม่เกิน 365 วัน',
                );
                setLoading(false);
                return;
            }
            fetch(`/api/admin/returning-members?${params}`, {
                signal: controller.signal,
                cache: 'no-store',
            })
                .then(async (response) => {
                    if (
                        requestId !== version.current ||
                        controller.signal.aborted
                    )
                        return;
                    if (response.status === 401 || response.status === 403) {
                        setDenied(
                            response.status === 401
                                ? 'unauthorized'
                                : 'forbidden',
                        );
                        return;
                    }
                    const body = await response.json();
                    if (
                        requestId !== version.current ||
                        controller.signal.aborted
                    )
                        return;
                    if (!response.ok)
                        throw new Error(
                            body.error || 'โหลดข้อมูลไม่สำเร็จ กรุณาลองใหม่',
                        );
                    const result = returningMembersSchema.safeParse(body);
                    if (!result.success)
                        throw new Error('ข้อมูลรายงานไม่ถูกต้อง กรุณาลองใหม่');
                    const lastPage = Math.max(
                        1,
                        Math.ceil(result.data.total / 50),
                    );
                    if (page > lastPage) {
                        setPage(lastPage);
                        return;
                    }
                    setData(result.data);
                })
                .catch((failure) => {
                    if (
                        requestId === version.current &&
                        !controller.signal.aborted
                    )
                        setError(
                            failure instanceof Error
                                ? failure.message
                                : 'โหลดข้อมูลไม่สำเร็จ กรุณาลองใหม่',
                        );
                })
                .finally(() => {
                    if (
                        requestId === version.current &&
                        !controller.signal.aborted
                    )
                        setLoading(false);
                });
        });
        return () => {
            cancelAnimationFrame(frame);
            controller.abort();
        };
    }, [period, from, to, source, query, page, refresh]);
    const change = (setter: (value: string) => void) => (value: string) => {
        setPage(1);
        setter(value);
    };
    const pendingSearch = search.trim() !== query;
    return (
        <ReturningMembersView
            data={pendingSearch ? null : data}
            loading={loading || pendingSearch}
            error={pendingSearch ? '' : error}
            denied={denied}
            period={period}
            from={from}
            to={to}
            today={today}
            source={source}
            search={search}
            page={page}
            onPeriod={(value) => {
                setPeriod(value);
                setPage(1);
                if (value !== 'custom') {
                    setFrom(shiftActivityDate(today, 1 - Number(value)));
                    setTo(today);
                }
            }}
            onFrom={change(setFrom)}
            onTo={change(setTo)}
            onSource={change(setSource)}
            onSearch={change(setSearch)}
            onPage={setPage}
            onRefresh={() => setRefresh((value) => value + 1)}
        />
    );
}
