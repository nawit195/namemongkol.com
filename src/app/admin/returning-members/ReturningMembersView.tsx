import Link from 'next/link';
import { RefreshCw, UsersRound } from 'lucide-react';
import type { ReturningMembersResult } from '@/lib/memberActivity';
import styles from './returningMembers.module.css';

export type ReturningMembersViewProps = {
    data: ReturningMembersResult | null;
    loading: boolean;
    error: string;
    denied: 'unauthorized' | 'forbidden' | null;
    period: string;
    from: string;
    to: string;
    today: string;
    source: string;
    search: string;
    page: number;
    onPeriod: (value: string) => void;
    onFrom: (value: string) => void;
    onTo: (value: string) => void;
    onSource: (value: string) => void;
    onSearch: (value: string) => void;
    onPage: (value: number) => void;
    onRefresh: () => void;
};
const labels = {
    observed: 'บันทึกใหม่',
    legacy: 'ย้อนหลัง',
    mixed: 'ใหม่และย้อนหลัง',
};
const sourceNames: Record<string, string> = {
    user_action_events: 'กิจกรรมที่เคยบันทึก',
    analysis_history: 'ประวัติใช้เครื่องมือ',
    credit_transactions: 'รายการใช้เครดิต',
};
function date(value: string) {
    return new Date(value).toLocaleDateString('th-TH', {
        timeZone: 'Asia/Bangkok',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}
export function ReturningMembersView(p: ReturningMembersViewProps) {
    const pages = Math.max(1, Math.ceil((p.data?.total ?? 0) / 50));
    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div>
                    <p className={styles.eyebrow}>รายงานสมาชิก</p>
                    <h1>สมาชิกที่กลับมาใช้งาน</h1>
                    <p>
                        สมาชิกที่ใช้งานอย่างน้อย 2 วันแยกกันในช่วงที่เลือก
                        นับวันตามเวลาประเทศไทย
                        การใช้งานหลายครั้งในวันเดียวกันนับเป็นหนึ่งวัน
                    </p>
                </div>
                <button
                    className={styles.button}
                    type="button"
                    disabled={p.loading}
                    onClick={p.onRefresh}
                >
                    <RefreshCw size={17} aria-hidden="true" />
                    รีเฟรช
                </button>
            </header>
            <section
                className={styles.filters}
                aria-label="ตัวกรองสมาชิกที่กลับมาใช้งาน"
            >
                <label>
                    ช่วงเวลา
                    <select
                        value={p.period}
                        onChange={(e) => p.onPeriod(e.target.value)}
                    >
                        <option value="7">7 วันล่าสุด</option>
                        <option value="30">30 วันล่าสุด</option>
                        <option value="90">90 วันล่าสุด</option>
                        <option value="custom">กำหนดช่วงเอง</option>
                    </select>
                </label>
                <label>
                    แหล่งข้อมูล
                    <select
                        value={p.source}
                        onChange={(e) => p.onSource(e.target.value)}
                    >
                        <option value="all">รวมข้อมูลย้อนหลัง</option>
                        <option value="observed">
                            ข้อมูลที่บันทึกใหม่เท่านั้น
                        </option>
                    </select>
                </label>
                <label className={styles.search}>
                    ค้นหาชื่อหรืออีเมล
                    <input
                        type="search"
                        value={p.search}
                        maxLength={100}
                        placeholder="พิมพ์ชื่อหรืออีเมลสมาชิก"
                        onChange={(e) => p.onSearch(e.target.value)}
                    />
                </label>
                {p.period === 'custom' && (
                    <>
                        <label>
                            ตั้งแต่วันที่
                            <input
                                type="date"
                                value={p.from}
                                max={p.to || p.today}
                                onChange={(e) => p.onFrom(e.target.value)}
                            />
                        </label>
                        <label>
                            ถึงวันที่
                            <input
                                type="date"
                                value={p.to}
                                min={p.from}
                                max={p.today}
                                onChange={(e) => p.onTo(e.target.value)}
                            />
                        </label>
                        <p className={styles.hint}>
                            เลือกช่วงรวมวันเริ่มและวันสิ้นสุดได้สูงสุด 365 วัน
                        </p>
                    </>
                )}
            </section>
            {p.denied ? (
                <section role="alert" className={styles.notice}>
                    <h2>
                        {p.denied === 'unauthorized'
                            ? 'กรุณาเข้าสู่ระบบ'
                            : 'สำหรับผู้ดูแลระบบเท่านั้น'}
                    </h2>
                    <p>
                        {p.denied === 'unauthorized'
                            ? 'เข้าสู่ระบบด้วยบัญชีแอดมินเพื่อดูรายงานสมาชิก'
                            : 'บัญชีนี้ไม่มีสิทธิ์ดูข้อมูลสมาชิก'}
                    </p>
                    {p.denied === 'unauthorized' && (
                        <Link
                            className={styles.button}
                            href="/login?redirect=%2Fadmin%2Freturning-members"
                        >
                            เข้าสู่ระบบ
                        </Link>
                    )}
                </section>
            ) : (
                <>
                    <div className={styles.summary} aria-busy={p.loading}>
                        <div>
                            <span>สมาชิกที่กลับมาใช้งาน</span>
                            <strong>
                                {p.loading
                                    ? '…'
                                    : (p.data?.summary.returningMembers.toLocaleString(
                                          'th-TH',
                                      ) ?? '—')}
                            </strong>
                            <small>ใช้งานตั้งแต่ 2 วันในช่วงนี้</small>
                        </div>
                        <div>
                            <span>สมาชิกที่พบการใช้งาน</span>
                            <strong>
                                {p.loading
                                    ? '…'
                                    : (p.data?.summary.activeMembers.toLocaleString(
                                          'th-TH',
                                      ) ?? '—')}
                            </strong>
                            <small>อย่างน้อยหนึ่งวัน ตามตัวกรองเดียวกัน</small>
                        </div>
                    </div>
                    <aside className={styles.coverage}>
                        <h2>ขอบเขตของข้อมูล</h2>
                        <p>
                            ข้อมูลย้อนหลังอาจไม่ครบ
                            เพราะกิจกรรมคลิกเดิมมีการสุ่มเก็บ
                            และประวัติบางส่วนถูกล้างตามแพ็กเกจ ป้าย “ย้อนหลัง”
                            จึงเป็นหลักฐานกิจกรรมที่เคยผูกบัญชี
                            ไม่ใช่จำนวนครั้งที่เข้าเว็บทั้งหมด
                        </p>
                        {p.data && (
                            <p className={styles.meta}>
                                ระบบพร้อมบันทึกข้อมูลใหม่ตั้งแต่{' '}
                                {date(p.data.coverage.trackingStartedAt)} ·{' '}
                                {p.data.coverage.legacyImportedAt
                                    ? `นำเข้าประวัติเมื่อ ${date(p.data.coverage.legacyImportedAt)}`
                                    : 'ยังไม่มีการนำเข้าประวัติ'}
                                <br />
                                แหล่งย้อนหลัง:{' '}
                                {p.data.coverage.legacySources.length
                                    ? p.data.coverage.legacySources
                                          .map((source) => sourceNames[source])
                                          .join(' · ')
                                    : 'ไม่พบแหล่งประวัติเดิม'}
                            </p>
                        )}
                    </aside>
                    {p.error && (
                        <div role="alert" className={styles.notice}>
                            <p>{p.error}</p>
                            <button
                                className={styles.button}
                                type="button"
                                onClick={p.onRefresh}
                                disabled={p.loading}
                            >
                                ลองใหม่
                            </button>
                        </div>
                    )}
                    <section
                        className={styles.results}
                        aria-label="รายชื่อสมาชิกที่กลับมาใช้งาน"
                        aria-busy={p.loading}
                    >
                        <p role="status" className={styles.resultCount}>
                            {p.loading
                                ? 'กำลังโหลดข้อมูลสมาชิก…'
                                : p.error
                                  ? 'ยังแสดงข้อมูลไม่ได้'
                                  : `พบสมาชิกเข้าเกณฑ์ ${(p.data?.total ?? 0).toLocaleString('th-TH')} คน · เรียงจำนวนวันที่ใช้งานมากที่สุด แล้ววันที่ล่าสุด`}
                        </p>
                        <div
                            className={styles.tableWrap}
                            tabIndex={0}
                            role="region"
                            aria-label="ตารางสมาชิก เลื่อนซ้ายขวาเพื่อดูทุกคอลัมน์"
                        >
                            <table>
                                <caption className={styles.srOnly}>
                                    สมาชิกที่ใช้งานอย่างน้อยสองวันในช่วงที่เลือก
                                </caption>
                                <thead>
                                    <tr>
                                        <th>สมาชิก</th>
                                        <th>แพ็กเกจ</th>
                                        <th>วันที่ใช้งาน</th>
                                        <th>วันแรกในช่วง</th>
                                        <th>วันที่พบล่าสุด</th>
                                        <th>แหล่งข้อมูล</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {p.loading ? (
                                        <tr>
                                            <td colSpan={6}>กำลังโหลด…</td>
                                        </tr>
                                    ) : p.error ? (
                                        <tr>
                                            <td colSpan={6}>
                                                โหลดข้อมูลไม่สำเร็จ
                                                กดลองใหม่ด้านบน
                                            </td>
                                        </tr>
                                    ) : !p.data?.members.length ? (
                                        <tr>
                                            <td colSpan={6}>
                                                <UsersRound
                                                    size={24}
                                                    aria-hidden="true"
                                                />
                                                <p>
                                                    ไม่พบสมาชิกที่ใช้งานตั้งแต่สองวันในช่วงที่เลือก
                                                    ลองขยายช่วงเวลาหรือเปลี่ยนตัวกรอง
                                                </p>
                                            </td>
                                        </tr>
                                    ) : (
                                        p.data.members.map((member) => (
                                            <tr key={member.id}>
                                                <td>
                                                    <strong>
                                                        {[
                                                            member.firstName,
                                                            member.lastName,
                                                        ]
                                                            .filter(Boolean)
                                                            .join(' ')
                                                            .trim() ||
                                                            'สมาชิกไม่ระบุชื่อ'}
                                                    </strong>
                                                    <span
                                                        className={styles.meta}
                                                    >
                                                        {member.email ||
                                                            'ไม่ระบุอีเมล'}
                                                    </span>
                                                </td>
                                                <td>
                                                    {(
                                                        {
                                                            free: 'Free',
                                                            pro: 'Pro',
                                                            vvip: 'VVIP',
                                                        } as Record<
                                                            string,
                                                            string
                                                        >
                                                    )[member.tier ?? 'free'] ??
                                                        member.tier}
                                                </td>
                                                <td>
                                                    <strong>
                                                        {member.activeDays} วัน
                                                    </strong>
                                                    <span
                                                        className={styles.meta}
                                                    >
                                                        ใหม่{' '}
                                                        {member.observedDays} ·
                                                        ย้อนหลังอย่างเดียว{' '}
                                                        {member.legacyOnlyDays}
                                                    </span>
                                                </td>
                                                <td>
                                                    {date(member.firstSeenAt)}
                                                </td>
                                                <td>
                                                    {date(member.lastSeenAt)}
                                                </td>
                                                <td>
                                                    <span
                                                        className={styles.badge}
                                                        data-source={
                                                            member.source
                                                        }
                                                    >
                                                        {labels[member.source]}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <footer className={styles.pagination}>
                            <span>
                                หน้า {p.page} / {pages} · หน้าละ 50 คน
                            </span>
                            <div>
                                <button
                                    className={styles.button}
                                    type="button"
                                    disabled={
                                        p.loading || !!p.error || p.page <= 1
                                    }
                                    onClick={() => p.onPage(p.page - 1)}
                                >
                                    ก่อนหน้า
                                </button>
                                <button
                                    className={styles.button}
                                    type="button"
                                    disabled={
                                        p.loading ||
                                        !!p.error ||
                                        p.page >= pages
                                    }
                                    onClick={() => p.onPage(p.page + 1)}
                                >
                                    ถัดไป
                                </button>
                            </div>
                        </footer>
                    </section>
                </>
            )}
        </div>
    );
}
