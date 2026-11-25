'use client';

import { useEffect, useState } from 'react';
import type { ArticleNameGroup } from '@/lib/articleNameTables';
import styles from './article-name-filter.module.css';

export function ArticleNameFilter({ groups, total, unique, suitable, monday }: { groups: ArticleNameGroup[]; total: number; unique: number; suitable: number; monday: boolean }) {
    const [query, setQuery] = useState('');
    const [group, setGroup] = useState('');
    const [onlySuitable, setOnlySuitable] = useState(false);
    const [matches, setMatches] = useState(total);
    useEffect(() => {
        const root = document.getElementById('article-name-tables');
        if (!root) return;
        const text = query.normalize('NFC').trim().toLocaleLowerCase('th');
        let count = 0;
        root.querySelectorAll<HTMLTableRowElement>('[data-name-row]').forEach(row => {
            const visible = (!group || row.dataset.nameGroup === group) && (!onlySuitable || row.dataset.nameSuitable === 'true') && (!text || (row.dataset.nameSearch ?? '').normalize('NFC').toLocaleLowerCase('th').includes(text));
            row.hidden = !visible;
            if (visible) count++;
        });
        root.querySelectorAll<HTMLTableElement>('[data-name-table]').forEach(table => {
            table.hidden = ![...table.querySelectorAll<HTMLTableRowElement>('[data-name-row]')].some(row => !row.hidden);
            const section = table.closest<HTMLElement>('[data-name-section]');
            if (section) section.hidden = table.hidden;
        });
        setMatches(count);
        return () => { root.querySelectorAll<HTMLElement>('[data-name-row], [data-name-table], [data-name-section]').forEach(element => { element.hidden = false; }); };
    }, [query, group, onlySuitable]);
    return <section className={styles.filter} aria-labelledby="article-name-filter-title">
        <div className={styles.heading}><h2 id="article-name-filter-title">เลือกชื่อจากความหมายที่ชอบ</h2><span>{total.toLocaleString('th-TH')} รายการ · {unique.toLocaleString('th-TH')} ชื่อไม่ซ้ำ</span></div>
        <div className={styles.fields}>
            <label>ค้นหาชื่อหรือความหมาย<input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="เช่น ธน หรือ ความสุข" aria-controls="article-name-tables" /></label>
            <label>หมวดความหมาย<select value={group} onChange={event => setGroup(event.target.value)} aria-controls="article-name-tables"><option value="">ทุกหมวด</option>{groups.map(item => <option key={item.id} value={item.id}>{item.label} ({item.count})</option>)}</select></label>
        </div>
        {monday && <label className={styles.check}><input type="checkbox" checked={onlySuitable} onChange={event => setOnlySuitable(event.target.checked)} aria-controls="article-name-tables" /><span>เฉพาะชื่อที่ผ่านตัวกรองอักษรวันจันทร์ของระบบ ({suitable} รายการ)</span></label>}
        <div className={styles.status}><p role="status" aria-live="polite">พบ {matches.toLocaleString('th-TH')} รายการ</p><button type="button" disabled={!matches} onClick={() => { const row = document.querySelector<HTMLElement>('#article-name-tables [data-name-row]:not([hidden])'); row?.scrollIntoView({ block: 'center' }); row?.querySelector<HTMLAnchorElement>('a')?.focus({ preventScroll: true }); }}>ดูรายชื่อที่พบ ↓</button><button type="button" onClick={() => { setQuery(''); setGroup(''); setOnlySuitable(false); }} disabled={!query && !group && !onlySuitable}>ล้างตัวกรอง</button></div>
        <p className={styles.note}>รายชื่อและความหมายเป็นไอเดียจากต้นฉบับของเว็บไซต์ บางชื่อปรากฏหลายหมวด คำอ่านที่ยังไม่มีข้อมูลยืนยันจะไม่แสดง ควรตรวจความหมายและลองเรียกคู่กับนามสกุลก่อนใช้จริง</p>
        {!monday && <p className={styles.note}>วันเกิดในตารางคำนวณจากอักษรของชื่อด้วยตัวกรองทักษาของเว็บไซต์ ไม่ใช่ผลรวมเมื่อใช้กับนามสกุล และไม่รับประกันผลลัพธ์ในชีวิต</p>}
        {monday && <p className={styles.note}>รายการทั้งหมดไม่ได้ผ่านเกณฑ์วันจันทร์ทุกชื่อ ตัวกรองใช้กฎเดียวกับชุดรายชื่อของระบบ รวมไม้หันอากาศและเครื่องหมายตามเกณฑ์ที่เว็บไซต์ใช้ เป็นแนวทางตามความเชื่อ ไม่ใช่ข้อบังคับในการตั้งชื่อ</p>}
        <noscript><p>รายชื่อทั้งหมดอยู่ในตารางด้านล่าง เปิด JavaScript เพื่อใช้ช่องค้นหาและตัวกรอง</p></noscript>
    </section>;
}
