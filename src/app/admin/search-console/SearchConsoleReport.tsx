import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { kindLabels, signedPercent, sortLabels, type GscReport, type GscImport, type GscPreview } from './searchConsoleUi';
import styles from './searchConsole.module.css';

const count = (value: number) => value.toLocaleString('th-TH');
const decimal = (value: number) => value.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export function SearchConsolePreview({ preview, busy, onConfirm }: { preview: GscPreview; busy: boolean; onConfirm: () => void }) {
    return <section className={styles.preview} aria-labelledby="gsc-preview-title">
        <h3 id="gsc-preview-title">ตรวจสอบผ่าน · ยังไม่ได้บันทึกข้อมูล</h3>
        <p>{preview.scope.from} ถึง {preview.scope.to} (PT) · {count(preview.rowCount)} แถว · {preview.files.length} มิติ</p>
        <dl className={styles.previewScope}>
            <div><dt>พร็อพเพอร์ตี</dt><dd>{preview.scope.property}</dd></div>
            <div><dt>ประเทศ / อุปกรณ์</dt><dd>{preview.scope.country} / {preview.scope.device}</dd></div>
            <div><dt>ตัวกรองอื่น</dt><dd>{preview.scope.filters || 'ไม่มี'}</dd></div>
        </dl>
        {preview.warnings.length > 0 && <ul className={styles.previewWarnings}>{preview.warnings.map((warning, index) => <li key={index}>{warning}</li>)}</ul>}
        <div className={styles.tableWrap}><table><caption>ตัวอย่างผลรวมแต่ละไฟล์ ไม่รวมยอดข้ามมิติ</caption><thead><tr><th scope="col">ไฟล์ / มิติ</th><th scope="col">แถว</th><th scope="col">คลิก</th><th scope="col">การแสดงผล</th><th scope="col">CTR</th><th scope="col">อันดับเฉลี่ย</th></tr></thead><tbody>{preview.files.map(file => <tr key={file.kind}>
            <th scope="row" className={styles.rowKey}>{file.name}<small className={styles.dimensionLabel}>{kindLabels[file.kind]}</small></th><td>{count(file.rows)}</td><td>{count(file.summary.clicks)}</td><td>{count(file.summary.impressions)}</td><td>{file.summary.impressions ? `${decimal(file.summary.ctr)}%` : '—'}</td><td>{file.summary.impressions ? decimal(file.summary.position) : '—'}</td>
        </tr>)}</tbody></table></div>
        <p className={styles.notes}>ตรวจช่วงวันที่ ตัวกรอง และชนิดไฟล์อีกครั้งก่อนยืนยัน ชุดที่นำเข้าจะถูกบันทึกเป็นเวอร์ชันแยก และไฟล์เดิมที่ส่งซ้ำจะเปิดรายงานเดิม</p>
        <button type="button" className={styles.primary} disabled={busy} onClick={onConfirm}>{busy ? 'กำลังยืนยันนำเข้า…' : 'ยืนยันนำเข้า'}</button>
    </section>;
}

export function SearchConsoleReport({ report, previous, onPage }: {
    report: GscReport; previous?: GscImport; onPage: (page: number) => void;
}) {
    const totalPages = Math.max(1, Math.ceil(report.total / report.pageSize));
    const joint = report.kind === 'query-pages';
    return <>
        <div className={styles.reportHeading}>
            <div><h2>{kindLabels[report.kind]} · {report.scope.from} ถึง {report.scope.to} <small>(PT)</small></h2><p>ผลรวมจากแถวที่นำเข้าในมิตินี้ ตามตัวกรองปัจจุบัน</p></div>
            <span>{count(report.total)} แถว</span>
        </div>
        <p className={styles.notes}>เรียงตาม{sortLabels[report.sort]} ({report.order === 'asc' ? 'น้อยไปมาก' : 'มากไปน้อย'}){report.opportunity ? ' · เฉพาะอันดับเฉลี่ย 4–15 ที่มีการแสดงผล ยอดสรุปและการเปรียบเทียบใช้ตัวกรองนี้ด้วย รายชื่อในแต่ละช่วงอาจต่างกันตามอันดับ' : ''}</p>
        {report.warnings.length > 0 && <div className={styles.notice} role="note"><ul>{report.warnings.map((warning, index) => <li key={index}>{warning}</li>)}</ul></div>}
        <dl className={styles.metrics}>
            <div><dt>คลิก</dt><dd>{count(report.summary.clicks)}</dd></div>
            <div><dt>การแสดงผล</dt><dd>{count(report.summary.impressions)}</dd></div>
            <div><dt>CTR จากแถวที่นำเข้า</dt><dd>{report.summary.impressions ? `${decimal(report.summary.ctr)}%` : '—'}</dd></div>
            <div><dt>อันดับเฉลี่ยถ่วงน้ำหนัก</dt><dd>{report.summary.impressions ? decimal(report.summary.position) : '—'}</dd></div>
        </dl>
        <p className={styles.notes}>ข้อมูลแต่ละมิติแสดงแยกกัน ไม่รวมยอดข้ามไฟล์คำค้นหา หน้าเว็บไซต์ และรายวัน ยอดจากตารางอาจต่างจากยอดรวมใน Search Console</p>
        {report.comparison && <section className={styles.comparison} aria-label="เทียบช่วงก่อนหน้า">
            <h3>เทียบกับ {previous ? `${previous.scope.from} ถึง ${previous.scope.to} (PT)` : 'ชุดข้อมูลที่เลือก'}</h3>
            <dl className={styles.changes}>
                <div><dt>คลิก</dt><dd>{signedPercent(report.comparison.delta.clicks)}</dd></div>
                <div><dt>การแสดงผล</dt><dd>{signedPercent(report.comparison.delta.impressions)}</dd></div>
                <div><dt>CTR เปลี่ยน</dt><dd>{report.comparison.delta.ctr === null ? '—' : <>{report.comparison.delta.ctr > 0 ? '+' : ''}{decimal(report.comparison.delta.ctr)} <small>จุดเปอร์เซ็นต์</small></>}</dd></div>
                <div><dt>อันดับเฉลี่ยเปลี่ยน</dt><dd>{report.comparison.delta.position === null ? '—' : <>{report.comparison.delta.position > 0 ? '+' : ''}{decimal(report.comparison.delta.position)}</>}</dd></div>
            </dl>
            <p className={styles.notes}>อันดับเฉลี่ยที่ลดลงหมายถึงอันดับดีขึ้น เปอร์เซ็นต์การเปลี่ยนคลิกและการแสดงผลจะไม่มีค่าหากฐานเดิมเป็นศูนย์ ส่วน CTR และอันดับเฉลี่ยจะไม่มีค่าเปรียบเทียบหากช่วงใดไม่มีการแสดงผล</p>
        </section>}
        <div className={styles.tableWrap}>
            <table>
                <caption>{kindLabels[report.kind]}จากไฟล์ที่นำเข้า</caption>
                <thead><tr><th scope="col">{report.kind === 'daily' ? 'วันที่ (PT)' : report.kind === 'pages' ? 'หน้าเว็บไซต์' : 'คำค้นหา'}</th>{joint && <th scope="col">หน้าเว็บไซต์</th>}<th scope="col">คลิก</th><th scope="col">การแสดงผล</th><th scope="col">CTR</th><th scope="col">อันดับเฉลี่ย</th></tr></thead>
                <tbody>{report.rows.length ? report.rows.map(row => <tr key={row.key}>
                    <th scope="row" className={styles.rowKey}>{report.kind === 'daily' ? row.date ?? row.key : report.kind === 'pages' ? row.path ?? row.key : row.query ?? row.key}</th>
                    {joint && <td className={styles.rowKey}>{row.path}</td>}
                    <td>{count(row.clicks)}</td><td>{count(row.impressions)}</td><td>{row.impressions ? `${decimal(row.ctr)}%` : '—'}</td><td>{row.impressions ? decimal(row.position) : '—'}</td>
                </tr>) : <tr><td colSpan={joint ? 6 : 5} className={styles.empty}>ยังไม่มีแถวที่ตรงกับคำค้นหานี้</td></tr>}</tbody>
            </table>
        </div>
        {report.kind !== 'query-pages' && <p className={styles.notes}>รายงานมิตินี้ไม่ได้ระบุความสัมพันธ์ระหว่างคำค้นกับหน้าเว็บไซต์ จึงไม่ใช้สรุปว่าหน้าใดแข่งขันกันสำหรับคำค้นเดียวกัน</p>}
        {totalPages > 1 && <nav className={styles.pagination} aria-label="หน้าตาราง Search Console">
            <button type="button" disabled={report.page <= 1} onClick={() => onPage(report.page - 1)}><ArrowLeft size={15} aria-hidden="true" />ก่อนหน้า</button>
            <span>หน้า {report.page} / {totalPages}</span>
            <button type="button" disabled={report.page >= totalPages} onClick={() => onPage(report.page + 1)}>ถัดไป<ArrowRight size={15} aria-hidden="true" /></button>
        </nav>}
    </>;
}
