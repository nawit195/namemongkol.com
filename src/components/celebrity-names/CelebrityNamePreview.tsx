import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getNameCalculationExamples } from '@/lib/nameCalculationExamples';
import styles from './celebrity-names.module.css';

export function CelebrityNamePreview() {
    const examples = getNameCalculationExamples();
    return <section className={styles.preview} aria-labelledby="name-example-title">
        <div className={styles.previewInner}>
            <div className={styles.previewHeading}>
                <div><p className={styles.eyebrow}>ตัวอักษร ผลรวม และคู่เลข</p><h2 id="name-example-title">เข้าใจเกรดชื่อ ก่อนเลือกใช้</h2><p>ดูตัวอย่างผลคำนวณจากข้อความชื่อ ด้วยเกณฑ์เดียวกับเครื่องมือของเว็บไซต์</p></div>
                <Link href="/methodology" className={styles.textLink}>อ่านวิธีคำนวณ <ArrowRight size={18} aria-hidden="true" /></Link>
            </div>
            <div className={styles.exampleLayout}>
                <table>
                    <caption>ตัวอย่างข้อความชื่อสำหรับสาธิต ไม่อ้างอิงบุคคลใด</caption>
                    <thead><tr><th scope="col">ตัวอย่างชื่อ</th><th scope="col">ผลรวม</th><th scope="col">เกรดชื่อ</th></tr></thead>
                    <tbody>{examples.map(example => <tr key={example.name}><th scope="row">{example.name}</th><td>{example.sum}</td><td>{example.grade}</td></tr>)}</tbody>
                </table>
                <div className={styles.exampleExplanation}>
                    <p>เกรดมาจากผลรวมและคู่เลขตามเกณฑ์เลขศาสตร์ที่ NameMongkol ใช้ เมื่อนำไปใช้กับนามสกุล ต้องคำนวณชื่อเต็มแยกอีกครั้ง</p>
                    <p>เป็นข้อมูลตามความเชื่อสำหรับประกอบการตัดสินใจ ไม่รับประกันผลต่อชีวิต การงาน หรือรายได้</p>
                    <Link href="/celebrity-names" className={styles.textLink}>ดูกรณีศึกษาที่มีแหล่งอ้างอิง <ArrowRight size={17} aria-hidden="true" /></Link>
                </div>
            </div>
        </div>
    </section>;
}
