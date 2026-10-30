import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { analysisDetailHref, type NameComparison } from '@/lib/nameComparison';
import styles from './comparison.module.css';

const gradeStyle = { 'A+': styles.gradeGood, A: styles.gradeGood, B: styles.gradeNeutral, C: styles.gradeCaution };

export function ComparisonTable({ rows }: { rows: NameComparison[] }) {
  const hasSurname = !!rows[0]?.surname;
  const metrics: { label: string; detail?: string; render: (row: NameComparison) => React.ReactNode }[] = [
    { label: 'เกรดเลขศาสตร์', detail: hasSurname ? 'ชื่อและนามสกุลร่วมกัน' : 'จากชื่อจริง', render: row => <span className={`${styles.grade} ${gradeStyle[row.grade]}`}>{row.grade}</span> },
    { label: 'ผลรวมชื่อ', render: row => <span className={styles.number}>{row.nameScore}</span> },
    { label: 'ผลรวมนามสกุล', render: row => hasSurname ? <span className={styles.number}>{row.surnameScore}</span> : 'ไม่ได้ระบุ' },
    { label: 'ผลรวมทั้งหมด', render: row => <span className={styles.totalNumber}>{row.totalScore}</span> },
    { label: 'คู่เลขในชื่อ', render: row => <PairList pairs={row.namePairs} /> },
    { label: 'คู่เลขในนามสกุล', render: row => hasSurname ? <PairList pairs={row.surnamePairs} /> : 'ไม่ได้ระบุ' },
    { label: 'กาลกิณีในชื่อ', render: row => row.thaksa?.hasKali ? <span className={styles.caution}>พบ: {row.thaksa.kaliChars.join(' ')}</span> : <span className={styles.good}>ไม่พบกาลกิณี</span> },
    { label: 'กาลกิณีในนามสกุล', render: row => !hasSurname ? 'ไม่ได้ระบุ' : row.thaksa?.surnameHasKali ? <span className={styles.caution}>พบ: {row.thaksa.surnameKaliChars?.join(' ')}</span> : <span className={styles.good}>ไม่พบกาลกิณี</span> },
    { label: 'อายตนะ 6', render: row => <div><span className={styles.number}>{row.ayatana.score}</span><p className={styles.ayatanaTitle}>{row.ayatana.title}</p><p className={styles.ayatanaDescription}>{row.ayatana.desc}</p></div> },
  ];
  return (
    <div className={styles.tableScroll} role="region" aria-label="ตารางเปรียบเทียบชื่อ เลื่อนแนวนอนเพื่อดูทุกชื่อ" tabIndex={0}>
      <table className={styles.table}>
        <caption className="sr-only">เปรียบเทียบชื่อ {rows.length} ชื่อตามเลขศาสตร์ คู่เลข ทักษา และอายตนะ</caption>
        <thead><tr><th scope="col" className={styles.corner}>ข้อมูลเปรียบเทียบ</th>{rows.map(row => <th scope="col" key={row.inputIndex}><span className={styles.columnLabel}>ชื่อที่ {row.inputIndex + 1}</span><span className={styles.columnName}>{row.name}</span></th>)}</tr></thead>
        <tbody>
          {metrics.map(metric => <tr key={metric.label}><th scope="row">{metric.label}{metric.detail && <span className={styles.metricDetail}>{metric.detail}</span>}</th>{rows.map(row => <td key={row.inputIndex}>{metric.render(row)}</td>)}</tr>)}
          <tr><th scope="row">อ่านผลต่อ</th>{rows.map(row => <td key={row.inputIndex}><Link prefetch={false} href={analysisDetailHref(row)} className={styles.detailLink}>ดูผลวิเคราะห์ละเอียด <ArrowUpRight size={16} aria-hidden="true" /><span className="sr-only">ของ {row.name}</span></Link></td>)}</tr>
        </tbody>
      </table>
    </div>
  );
}

function PairList({ pairs }: { pairs: NameComparison['namePairs'] }) {
  if (!pairs.length) return <span>ไม่มีคู่เลข</span>;
  return (
    <div className={styles.pairList}>
      {pairs.map((pair, index) => {
        const toneClass = pair.grade === 'good' ? styles.good : pair.grade === 'bad' ? styles.caution : styles.neutral;
        const gradeLabel = pair.grade === 'good' ? 'ดี' : pair.grade === 'bad' ? 'ควรระวัง' : 'กลาง';

        return (
          <details className={styles.pairItem} key={`${pair.pair}-${index}`}>
            <summary className={styles.pairHeading} title="แตะหรือกดเพื่อดูรายละเอียด">
              <span className={`${styles.pairNumber} ${toneClass}`}>
                <span className="sr-only">คู่เลข{gradeLabel} </span>
                {pair.pair}
              </span>
              <strong>{pair.title}</strong>
            </summary>
            <p>{pair.description}</p>
          </details>
        );
      })}
    </div>
  );
}
