import React, { type Dispatch, type SetStateAction } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, BarChart3, RefreshCw } from 'lucide-react';
import { parsePageTrafficQuery, type PageTrafficReport } from '@/lib/pageTraffic';
import { shiftActivityDate } from '@/lib/memberActivityDates';
import styles from './pageTraffic.module.css';

type Selection = { from: string; to: string; q: string; page: number };
type Draft = Omit<Selection, 'page'>;
export type PageTrafficViewProps = {
    today: string; draft: Draft; query: Selection; data: PageTrafficReport | null;
    loading: boolean; error: string; denied: boolean;
    setDraft: Dispatch<SetStateAction<Draft>>;
    setQuery: Dispatch<SetStateAction<Selection>>;
    setError: (value: string) => void;
};
const count = (value: number) => value.toLocaleString('th-TH');
const date = (value: string) => new Date(`${value}T00:00:00+07:00`).toLocaleDateString('th-TH', { timeZone: 'Asia/Bangkok', day: 'numeric', month: 'short', year: 'numeric' });

export function PageTrafficView({ today, draft, query, data, loading, error, denied, setDraft, setQuery, setError }: PageTrafficViewProps) {
    const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / 50));
    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div><p className={styles.eyebrow}>สถิติเข้าชมเว็บไซต์ · เวลาไทย</p><h1><BarChart3 size={26} aria-hidden="true" />ผู้เข้าชมรายวัน</h1><p>ดูว่าแต่ละหน้ามีคนเข้าชมกี่ครั้ง และมีกี่เบราว์เซอร์ที่เข้าชมในวันนั้น</p></div>
                <Link href="/admin/analytics">ดูกิจกรรมการกดปุ่ม <ArrowRight size={15} aria-hidden="true" /></Link>
            </header>
            <form className={styles.filters} onSubmit={event => {
                event.preventDefault();
                const parsed = parsePageTrafficQuery(new URLSearchParams(draft));
                if (!parsed) { setError('เลือกช่วงวันที่ไม่เกิน 31 วัน และไม่เกินวันนี้'); return; }
                setQuery(parsed);
            }}>
                <label>ช่วงด่วน<select defaultValue="1" onChange={event => setDraft(previous => ({ ...previous, from: shiftActivityDate(today, 1 - Number(event.target.value)), to: today }))}><option value="1">วันนี้</option><option value="7">7 วันล่าสุด</option><option value="30">30 วันล่าสุด</option></select></label>
                <label>ตั้งแต่วันที่<input type="date" required max={today} value={draft.from} onChange={event => setDraft(previous => ({ ...previous, from: event.target.value }))} /></label>
                <label>ถึงวันที่<input type="date" required max={today} value={draft.to} onChange={event => setDraft(previous => ({ ...previous, to: event.target.value }))} /></label>
                <label className={styles.search}>ค้นหาเส้นทางหน้า<input type="search" placeholder="เช่น /nicknames หรือ /articles" maxLength={100} value={draft.q} onChange={event => setDraft(previous => ({ ...previous, q: event.target.value }))} /></label>
                <button type="submit" disabled={loading}><RefreshCw size={15} aria-hidden="true" />แสดงรายงาน</button>
            </form>
            <p className={styles.notes}>นับตาม Asia/Bangkok เริ่มจากการติดตั้งตัวนับใหม่ ไม่ใช้จำนวนคลิกย้อนหลังแทนยอดเข้าชม ไม่นับหน้าแอดมิน บอตที่ตรวจพบ และพรีวิว/localhost</p>
            {error && <div className={styles.alert} role="alert"><p>{error}</p>{denied ? <Link href="/login?redirect=%2Fadmin%2Fpage-traffic">เข้าสู่ระบบผู้ดูแล</Link> : <button type="button" onClick={() => setQuery(previous => ({ ...previous }))}>ลองใหม่</button>}</div>}
            <section aria-busy={loading}>
                {loading ? <p className={styles.empty} role="status">กำลังโหลดสถิติผู้เข้าชม…</p> : data && <>
                    <div className={styles.reportHeading}><h2>รายงาน {date(query.from)}{query.to !== query.from && ` ถึง ${date(query.to)}`}</h2><span>{data.total ? `${count(data.total)} รายการแยกหน้าและวัน` : 'ยังไม่มีข้อมูลในช่วงนี้'}</span></div>
                    <dl className={styles.summary}><div><dt>เปิดหน้าทั้งหมด</dt><dd>{count(data.summary.views)} <small>ครั้ง</small></dd></div><div><dt>ผู้เข้าชมไม่ซ้ำต่อวัน (รวม)</dt><dd>{count(data.summary.visitorDays)} <small>เบราว์เซอร์-วัน</small></dd></div><div><dt>หน้าที่มีผู้เข้าชม</dt><dd>{count(data.summary.pages)} <small>หน้า</small></dd></div></dl>
                    <p className={styles.notes}>ผู้เข้าชมไม่ซ้ำนับต่อเบราว์เซอร์ต่อวัน คนเดิมเปิดหลายหน้าไม่เพิ่มยอดรวมรายวัน แต่จะถูกนับในแต่ละหน้าที่เปิด เมื่อเลือกหลายวันจะแสดงผลรวมของแต่ละวัน</p>
                    {data.daily.length > 0 && <details className={styles.daily}><summary>ดูยอดรวมทั้งเว็บรายวันตามตัวกรอง</summary><div className={styles.tableWrap}><table><thead><tr><th>วันที่</th><th>ผู้เข้าชมไม่ซ้ำ</th><th>เปิดหน้า (ครั้ง)</th></tr></thead><tbody>{data.daily.map(row => <tr key={row.day}><td>{date(row.day)}</td><td>{count(row.visitors)}</td><td>{count(row.views)}</td></tr>)}</tbody></table></div></details>}
                    <div className={`${styles.tableWrap} ${styles.byPage}`}><table><caption>ผู้เข้าชมรายวันแยกตามหน้า</caption><thead><tr><th scope="col">วันที่</th><th scope="col">หน้าเว็บไซต์</th><th scope="col">ผู้เข้าชมไม่ซ้ำ</th><th scope="col">เปิดหน้า (ครั้ง)</th></tr></thead><tbody>{data.rows.length ? data.rows.map(row => <tr key={`${row.day}:${row.path}`}><td>{date(row.day)}</td><td><span className={styles.path}>{row.path}</span></td><td>{count(row.visitors)}</td><td>{count(row.views)}</td></tr>) : <tr><td colSpan={4} className={styles.empty}>ยังไม่มีผู้เข้าชมที่บันทึกในช่วงวันที่และเงื่อนไขนี้</td></tr>}</tbody></table></div>
                    {totalPages > 1 && <nav className={styles.pagination} aria-label="หน้ารายงาน"><button type="button" disabled={query.page <= 1} onClick={() => setQuery(previous => ({ ...previous, page: previous.page - 1 }))}><ArrowLeft size={15} />ก่อนหน้า</button><span>หน้า {query.page} / {totalPages}</span><button type="button" disabled={query.page >= totalPages} onClick={() => setQuery(previous => ({ ...previous, page: previous.page + 1 }))}>ถัดไป<ArrowRight size={15} /></button></nav>}
                </>}
            </section>
            <p className={styles.notes}>การปิดกั้นสถิติ การเปลี่ยนอุปกรณ์ ล้างข้อมูลเบราว์เซอร์ หรือปิด JavaScript อาจทำให้จำนวนต่างจากจำนวนบุคคลจริง</p>
        </div>
    );
}
