'use client';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { PublicNameRecord } from '@/lib/publicNames';
import type { DayKey } from '@/types';
import { namingBirthdayLinks } from '@/data/babyNaming';
import { FavoriteButton, trackNaming } from './NamingProvider';
import styles from './naming.module.css';

import { publicNameChoice, type NameChoice } from '@/lib/nameChoices';
const firstLetter = (name: string) =>
    name.match(/[ก-ฮA-Za-z]/u)?.[0].toUpperCase() ?? '';
const styleLabels: Record<string, string> = {
    thai: 'แบบไทย',
    inter: 'อินเตอร์',
    cute: 'น่ารัก',
    cool: 'เรียบเท่',
    classic: 'คลาสสิก',
    modern: 'ร่วมสมัย',
    unique: 'มีเอกลักษณ์',
};

export function NameBrowser({
    initialItems,
    initialTotal,
    remoteDay,
    remote = false,
    title,
    description,
    listId = 'names-list',
}: {
    initialItems: NameChoice[];
    initialTotal?: number;
    remoteDay?: DayKey;
    remote?: boolean;
    title: string;
    description?: string;
    listId?: string;
}) {
    const [search, setSearch] = useState('');
    const [query, setQuery] = useState('');
    const [day, setDay] = useState<string>(remoteDay ?? 'all');
    const [letter, setLetter] = useState('all');
    const [style, setStyle] = useState('all');
    const [page, setPage] = useState(1);
    const [items, setItems] = useState(initialItems);
    const [total, setTotal] = useState(initialTotal ?? initialItems.length);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [retry, setRetry] = useState(0);
    useEffect(() => {
        const timer = setTimeout(() => setQuery(search.trim()), 250);
        return () => clearTimeout(timer);
    }, [search]);
    useEffect(() => {
        if (!remote) return;
        const controller = new AbortController();
        const frame = requestAnimationFrame(() => {
            if (
                !query &&
                day === (remoteDay ?? 'all') &&
                letter === 'all' &&
                page === 1 &&
                retry === 0
            ) {
                setItems(initialItems);
                setTotal(initialTotal ?? initialItems.length);
                setLoading(false);
                setError('');
                return;
            }
            setLoading(true);
            setError('');
            if (page === 1) setItems([]);
            const params = new URLSearchParams({
                reviewed: '1',
                discovery: '1',
                gender: 'neutral',
                limit: '30',
                page: String(page),
                q: query,
                day,
                initial: letter,
            });
            fetch(`/api/public/names?${params}`, { signal: controller.signal })
                .then(async (response) => {
                    if (!response.ok) throw new Error('Unavailable');
                    const body = await response.json();
                    if (!body.success || !Array.isArray(body.data))
                        throw new Error('Invalid names');
                    if (controller.signal.aborted) return;
                    const next = (body.data as PublicNameRecord[]).map(
                        publicNameChoice,
                    );
                    setItems((previous) =>
                        page === 1
                            ? next
                            : [
                                  ...new Map(
                                      [...previous, ...next].map((item) => [
                                          item.name
                                              .normalize('NFC')
                                              .toLowerCase(),
                                          item,
                                      ]),
                                  ).values(),
                              ],
                    );
                    setTotal(body.total);
                })
                .catch(() => {
                    if (!controller.signal.aborted)
                        setError(
                            'โหลดรายชื่อไม่สำเร็จ กรุณาลองใหม่ รายชื่อที่เก็บไว้ยังอยู่',
                        );
                })
                .finally(() => {
                    if (!controller.signal.aborted) setLoading(false);
                });
        });
        return () => {
            cancelAnimationFrame(frame);
            controller.abort();
        };
    }, [
        remote,
        remoteDay,
        query,
        day,
        letter,
        page,
        retry,
        initialItems,
        initialTotal,
    ]);
    const local = useMemo(
        () =>
            initialItems.filter(
                (item) =>
                    (!search.trim() ||
                        `${item.name} ${item.meaning ?? ''}`
                            .toLowerCase()
                            .includes(search.trim().toLowerCase())) &&
                    (day === 'all' ||
                        item.suitableDays?.includes(day as DayKey)) &&
                    (letter === 'all' || firstLetter(item.name) === letter) &&
                    (style === 'all' || item.style === style),
            ),
        [initialItems, search, day, letter, style],
    );
    const visible = remote ? items : local.slice(0, page * 30);
    const count = remote ? total : local.length;
    const letters = remote
        ? Array.from('กขฃคฅฆงจฉชซฌญฎฏฐฑฒณดตถทธนบปผฝพฟภมยรลวศษสหฬอฮ')
        : [
              ...new Set(initialItems.map((item) => firstLetter(item.name))),
          ].sort();
    const stylesAvailable = [
        ...new Set(
            initialItems.flatMap((item) => (item.style ? [item.style] : [])),
        ),
    ];
    function reset() {
        setSearch('');
        setQuery('');
        setDay(remoteDay ?? 'all');
        setLetter('all');
        setStyle('all');
        setPage(1);
        setRetry(0);
    }
    return (
        <section className={styles.section} aria-labelledby={`${listId}-title`}>
            <h2 id={`${listId}-title`}>{title}</h2>
            {description && <p>{description}</p>}
            <div className={styles.filters}>
                <label>
                    ค้นหาชื่อหรือความหมาย
                    <input
                        type="search"
                        value={search}
                        maxLength={100}
                        placeholder="เช่น ความสุข หรือชื่อที่สนใจ"
                        onChange={(event) => {
                            setSearch(event.target.value);
                            setPage(1);
                        }}
                    />
                </label>
                {(remote || initialItems.some((item) => item.suitableDays)) && (
                    <label>
                        วันเกิด
                        <select
                            value={day}
                            disabled={!!remoteDay}
                            onChange={(event) => {
                                setDay(event.target.value);
                                setPage(1);
                            }}
                        >
                            <option value="all">ทุกวันเกิด</option>
                            {namingBirthdayLinks.map(([key, label]) => (
                                <option key={key} value={key}>
                                    {label}
                                </option>
                            ))}
                        </select>
                    </label>
                )}
                <label>
                    อักษรแรก
                    <select
                        value={letter}
                        onChange={(event) => {
                            setLetter(event.target.value);
                            setPage(1);
                        }}
                    >
                        <option value="all">ทุกอักษร</option>
                        {letters.map((value) => (
                            <option key={value} value={value}>
                                {value}
                            </option>
                        ))}
                    </select>
                </label>
                {!!stylesAvailable.length && (
                    <label>
                        แนวชื่อ
                        <select
                            value={style}
                            onChange={(event) => {
                                setStyle(event.target.value);
                                setPage(1);
                            }}
                        >
                            <option value="all">ทุกแนว</option>
                            {stylesAvailable.map((value) => (
                                <option key={value} value={value}>
                                    {styleLabels[value] ?? value}
                                </option>
                            ))}
                        </select>
                    </label>
                )}
                <button
                    type="button"
                    className={styles.secondary}
                    onClick={reset}
                >
                    ล้างตัวกรอง
                </button>
            </div>
            <p role="status" className={styles.resultCount}>
                {loading
                    ? 'กำลังโหลดรายชื่อ…'
                    : `แสดง ${visible.length.toLocaleString('th-TH')} จาก ${count.toLocaleString('th-TH')} ชื่อ`}
            </p>
            {error && (
                <div role="alert" className={styles.warning}>
                    {error}{' '}
                    <button
                        type="button"
                        className={styles.secondary}
                        onClick={() => setRetry((value) => value + 1)}
                    >
                        ลองใหม่
                    </button>
                </div>
            )}
            {!loading && !error && !visible.length && (
                <p className={styles.empty}>
                    ไม่พบชื่อที่ตรงเงื่อนไข ลองเปลี่ยนคำค้นหรือล้างตัวกรอง
                </p>
            )}
            <div className={styles.cards}>
                {visible.map((item) => (
                    <article
                        key={`${item.kind}:${item.name}`}
                        className={styles.card}
                    >
                        <h3>{item.name}</h3>
                        {item.pronunciation && (
                            <p className={styles.meta}>
                                คำอ่าน: {item.pronunciation}
                            </p>
                        )}
                        {item.approximateReading && (
                            <p className={styles.meta}>
                                เสียงเรียกภาษาไทยโดยประมาณ:{' '}
                                {item.approximateReading}
                            </p>
                        )}
                        <p>{item.meaning}</p>
                        {item.numerology !== undefined && (
                            <p className={styles.meta}>
                                ผลรวมชื่อ {item.numerology} · เกรด {item.grade}{' '}
                                · คำนวณเฉพาะชื่อจริง
                            </p>
                        )}
                        {item.origin && (
                            <p className={styles.meta}>ที่มา: {item.origin}</p>
                        )}
                        <div className={styles.cardActions}>
                            <FavoriteButton name={item.name} kind={item.kind} />
                            {item.kind !== 'nickname' && (
                                <Link
                                    href={`/name-check?name=${encodeURIComponent(item.name)}`}
                                    data-track="funnel.search.name_analyze"
                                >
                                    วิเคราะห์ชื่อนี้
                                    <span className="sr-only">
                                        {' '}
                                        {item.name}
                                    </span>
                                </Link>
                            )}
                            {item.sourceUrl && (
                                <a
                                    href={item.sourceUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    ที่มาความหมาย
                                    <span className="sr-only">
                                        {' '}
                                        {item.name}
                                    </span>
                                </a>
                            )}
                        </div>
                    </article>
                ))}
            </div>
            {visible.length < count && (
                <div className={styles.more}>
                    <button
                        type="button"
                        className={styles.primary}
                        disabled={
                            loading ||
                            !!error ||
                            (remote && query !== search.trim())
                        }
                        onClick={() => {
                            setPage((value) => value + 1);
                            trackNaming(
                                'load_more',
                                remote
                                    ? 'neutral'
                                    : (initialItems[0]?.kind ?? 'thai'),
                                visible.length,
                            );
                        }}
                    >
                        ดูรายชื่อเพิ่มอีก 30 ชื่อ
                    </button>
                </div>
            )}
            {!!visible.length && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': 'ItemList',
                            name: title,
                            numberOfItems: visible.length,
                            itemListElement: visible.map((item, index) => ({
                                '@type': 'ListItem',
                                position: index + 1,
                                item: {
                                    '@type': 'DefinedTerm',
                                    name: item.name,
                                    description: item.meaning,
                                },
                            })),
                        }).replace(/</g, '\\u003c'),
                    }}
                />
            )}
        </section>
    );
}
