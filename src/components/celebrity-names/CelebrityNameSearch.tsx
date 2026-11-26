'use client';

import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import type { CelebrityCardData } from '@/types/celebrityCatalog';
import { CELEBRITY_PAGE_SIZE, searchCelebrityCatalog } from '@/lib/celebrityCatalogSearch';
import { CelebrityNameCard } from './CelebrityNameCard';
import styles from './celebrity-names.module.css';

export function CelebrityNameSearch({ entries }: { entries: CelebrityCardData[] }) {
    const [query, setQuery] = useState('');
    const [page, setPage] = useState(1);
    const heading = useRef<HTMLHeadingElement>(null);
    const visible = searchCelebrityCatalog(entries, query);
    const pageCount = Math.ceil(visible.length / CELEBRITY_PAGE_SIZE);
    const currentPage = Math.min(page, Math.max(1, pageCount));
    const start = (currentPage - 1) * CELEBRITY_PAGE_SIZE;
    const changeQuery = (value: string) => { setQuery(value); setPage(1); };
    const changePage = (value: number) => {
        setPage(value);
        heading.current?.focus({ preventScroll: true });
        heading.current?.scrollIntoView({ block: 'start' });
    };
    return <section aria-labelledby="celebrity-list-title" className={styles.catalog}>
        <div className={styles.catalogHeading}>
            <div>
                <h2 id="celebrity-list-title" ref={heading} tabIndex={-1}>เริ่มจากชื่อที่คุณคุ้นเคย</h2>
                <p role="status">{visible.length ? `แสดง ${start + 1}–${Math.min(start + CELEBRITY_PAGE_SIZE, visible.length)} จาก ${visible.length} ชื่อ` : 'ไม่พบชื่อที่ค้นหา'}{query.trim() ? ` · จากทั้งหมด ${entries.length} ชื่อ` : ''}</p>
            </div>
            <div className={styles.search}>
                <label htmlFor="celebrity-name-query" className={styles.srOnly}>ค้นหาชื่อ ชื่อเล่น นามสกุล หรือบทบาท</label>
                <Search size={19} aria-hidden="true" />
                <input id="celebrity-name-query" type="search" value={query} onChange={event => changeQuery(event.target.value)} placeholder="ชื่อ ชื่อเล่น นามสกุล หรือบทบาท" maxLength={100} />
                {query && <button type="button" onClick={() => changeQuery('')} aria-label="ล้างคำค้น"><X size={18} aria-hidden="true" /></button>}
            </div>
        </div>
        <p className={styles.catalogNote}>หนึ่งการ์ดต่อข้อความชื่อ · เลือกบุคคลอ้างอิงได้เมื่อชื่อซ้ำ มีทั้งชื่อในวงการและชื่อที่เคยใช้ เกรดคำนวณจากข้อความชื่อ ส่วนภาพและประวัติแยกตามบุคคล</p>
        {pageCount > 1 && <nav className={`${styles.pagination} ${styles.paginationTop}`} aria-label="เปลี่ยนหน้ารายชื่อ">
            <button type="button" disabled={currentPage === 1} onClick={() => changePage(currentPage - 1)}><ChevronLeft size={18} aria-hidden="true" /> ก่อนหน้า</button>
            <span>หน้า {currentPage} / {pageCount}</span>
            <button type="button" disabled={currentPage === pageCount} onClick={() => changePage(currentPage + 1)}>ถัดไป <ChevronRight size={18} aria-hidden="true" /></button>
        </nav>}
        {visible.length ? <div className={styles.cardGrid}>{visible.slice(start, start + CELEBRITY_PAGE_SIZE).map(({ entry, personId }) => <CelebrityNameCard key={`${entry.slug}:${personId}`} entry={entry} initialPersonId={personId} />)}</div> :
            <div className={styles.empty}><p>ลองค้นหาชื่อ นามสกุล หรือบทบาทอื่น</p><button type="button" onClick={() => changeQuery('')}>ดูรายชื่อทั้งหมด</button></div>}
        {pageCount > 1 && <nav className={styles.pagination} aria-label="หน้ารายชื่อคนดัง">
            <button type="button" disabled={currentPage === 1} onClick={() => changePage(currentPage - 1)}><ChevronLeft size={18} aria-hidden="true" /> ก่อนหน้า</button>
            <span>หน้า {currentPage} / {pageCount}</span>
            <button type="button" disabled={currentPage === pageCount} onClick={() => changePage(currentPage + 1)}>ถัดไป <ChevronRight size={18} aria-hidden="true" /></button>
        </nav>}
        <details className={styles.directory}>
            <summary>ดูดัชนีรายชื่อครบ {entries.length} ชื่อ</summary>
            <p>เลือกชื่อเพื่อเปิดการ์ดและตัวเลือกบุคคล</p>
            <ul>{entries.map(entry => <li key={entry.slug} id={`directory-${entry.slug}`}><button type="button" onClick={() => { changeQuery(entry.name); heading.current?.focus({ preventScroll: true }); heading.current?.scrollIntoView({ block: 'start' }); }}>{entry.name}</button></li>)}</ul>
        </details>
    </section>;
}
