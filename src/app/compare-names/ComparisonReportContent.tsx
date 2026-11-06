import { thaksaConfig } from '@/data/thaksaConfig';
import type { ComparisonReport } from '@/lib/comparisonReport';
import { ComparisonTable } from './ComparisonTable';
import styles from './comparison.module.css';

export function ComparisonReportContent({ report, exportMode = false }: { report: ComparisonReport; exportMode?: boolean }) {
    const { snapshot } = report;
    const { summary } = snapshot;
    return <article className={styles.savedReport}>
        <p className={styles.eyebrow}>NAMEMONGKOL · รายงานที่บันทึกแล้ว</p>
        <h3>รายงานสรุปเปรียบเทียบ {snapshot.rows.length} ชื่อ</h3>
        <p className={styles.reportMeta}>{thaksaConfig[snapshot.input.day as keyof typeof thaksaConfig]?.name} · {snapshot.input.surname ? `นามสกุล ${snapshot.input.surname}` : 'เฉพาะชื่อจริง'} · {new Date(report.created_at).toLocaleDateString('th-TH', { timeZone: 'Asia/Bangkok' })}</p>
        <p className={styles.reportMeta}>บันทึกด้วย {report.credits_spent} เครดิต · เปิดซ้ำและดาวน์โหลดได้ตลอด · สูตร {snapshot.formulaVersion} / {snapshot.summaryVersion}</p>
        {summary.allGradeC && <p className={styles.reportWarning}>ทุกชื่อได้เกรด C เพราะพบคู่เลขเสีย ควรอ่านข้อควรพิจารณาของแต่ละชื่อก่อนตัดสินใจ</p>}
        <dl className={styles.reportGroups}>
            <div><dt>เกรดสูงสุดในชุด: {summary.topGrade}</dt><dd>{summary.highestGradeNames.join(' · ')}</dd></div>
            <div><dt>ไม่มีกาลกิณีในชื่อจริง</dt><dd>{summary.noKaliNames.join(' · ') || 'ไม่มีชื่อในกลุ่มนี้'}</dd></div>
            <div><dt>เกรดสูงสุดและไม่มีกาลกิณีในชื่อจริง</dt><dd>{summary.bothNames.join(' · ') || 'ไม่มีชื่อที่อยู่ในทั้งสองกลุ่ม ไม่ฟันธงว่าชื่อใดดีที่สุด'}</dd></div>
        </dl>
        {summary.surnameWarning && <p className={styles.reportWarning}>{summary.surnameWarning} — เป็นข้อควรพิจารณาร่วมของทุกชื่อในชุดนี้</p>}
        <div className={styles.reportNotes}>{summary.notes.map(note => <section key={note.name}><h4>{note.name}</h4><p>{note.text}</p></section>)}</div>
        <ComparisonTable rows={snapshot.rows} includeDetailLinks={!exportMode} />
        <p className={styles.tableNote}>{summary.disclaimer} · รายงานเก็บผล ณ วันที่บันทึก ไม่คำนวณใหม่เมื่อเปิดซ้ำ</p>
    </article>;
}
