import Link from 'next/link';
import { ArrowRight, BookOpen, ChevronRight } from 'lucide-react';
import { nameMeaningSchema, serializeMeaningSchema, type NameMeaningModel } from '@/lib/nameMeaning';
import styles from './meaning.module.css';

export default function MeaningDetail({ model }: { model: NameMeaningModel }) {
    const { name, entry, related } = model;
    const analysisPath = `/name-check?${new URLSearchParams({ name })}`;
    return <main className={styles.page}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeMeaningSchema(nameMeaningSchema(model)) }} />
        <div className={styles.container}>
            <nav className={styles.breadcrumb} aria-label="เส้นทางนำทาง">
                <Link href="/">หน้าหลัก</Link><ChevronRight size={14} aria-hidden="true" />
                <Link href="/meaning">ความหมายชื่อ</Link><ChevronRight size={14} aria-hidden="true" /><span aria-current="page">{name}</span>
            </nav>
            <header className={styles.header}>
                <p className={styles.eyebrow}>ความหมายและข้อมูลภาษา</p>
                <h1>ความหมายชื่อ <span>{name}</span></h1>
            </header>
            <div className={styles.detailLayout}>
                <div className={styles.readingColumn}>
                    {entry ? <>
                        <section className={styles.definition} aria-labelledby="meaning-definition">
                            <h2 id="meaning-definition">{name} หมายถึงอะไร?</h2>
                            <p className={styles.meaning}>{entry.meaning}</p>
                            <p className={styles.caption}>ตามข้อมูลความหมายที่เว็บไซต์เผยแพร่</p>
                            <Link prefetch={false} className={styles.mobileAnalysis} href={analysisPath}>วิเคราะห์ชื่อนี้ <ArrowRight size={17} aria-hidden="true" /></Link>
                        </section>
                        <section className={styles.reading} aria-labelledby="meaning-reading">
                            <h2 id="meaning-reading">คำอ่าน</h2>
                            {entry.pronunciation ? <>
                                <p className={styles.pronunciation}>{entry.pronunciation}</p>
                                {entry.pronunciationVariants.length > 0 && <p>คำอ่านเพิ่มเติมในระบบ: {entry.pronunciationVariants.join(' / ')}</p>}
                                <p className={styles.caption}>เป็นคำอ่านที่อนุมัติให้เผยแพร่ในระบบเว็บไซต์ ไม่ใช่การรับรองคำอ่านจากพจนานุกรมภายนอก</p>
                            </> : <p>ยังไม่มีคำอ่านที่ยืนยันให้เผยแพร่ในหน้านี้ จึงไม่แสดงคำอ่านเดิมหรือคาดเดาเสียงอ่าน</p>}
                        </section>
                        <section className={styles.source} aria-labelledby="meaning-source">
                            <h2 id="meaning-source">ที่มาของข้อมูล</h2>
                            <p>{entry.source === 'catalog' ? 'ข้อมูลความหมายที่เผยแพร่ในฐานข้อมูล NameMongkol' : 'ข้อมูลความหมายจากรายการชื่อที่เว็บไซต์คัดเลือก'}</p>
                            <p className={styles.caption}>หน้านี้ยังไม่มีเอกสารอ้างอิงภายนอกแนบ</p>
                            <details>
                                <summary>ขอบเขตข้อมูลและรากศัพท์</summary>
                                <dl>
                                    <div><dt>การอ้างอิง</dt><dd>ยังไม่ยืนยันว่าความหมายนี้ผ่านการรับรองจากพจนานุกรมหรือผู้เชี่ยวชาญภาษา</dd></div>
                                    <div><dt>รากศัพท์</dt><dd>ยังไม่มีข้อมูลอ้างอิงสำหรับการแยกรากศัพท์ จึงไม่ระบุภาษาต้นทางหรือแยกคำขึ้นเอง</dd></div>
                                </dl>
                            </details>
                        </section>
                    </> : <section className={styles.unavailable}>
                        <BookOpen size={25} aria-hidden="true" />
                        <h2>ยังไม่มีความหมายที่พร้อมเผยแพร่</h2>
                        <p>ยังไม่มีข้อมูลความหมายชื่อ “{name}” ที่พร้อมเผยแพร่ในชุดหน้าความหมายที่คัดเลือกนี้ จึงไม่ใช้คำทำนายหรือผลรวมเลขศาสตร์มาแทนความหมาย</p>
                        <p>รายชื่อในชุดนี้เป็นเพียงส่วนหนึ่งของฐานข้อมูลเว็บไซต์ คุณยังเลือกดูรายชื่ออื่นหรือใช้เครื่องมือวิเคราะห์ชื่อได้</p>
                        <Link href="/meaning">ดูชื่อที่มีข้อมูลความหมาย <ArrowRight size={16} aria-hidden="true" /></Link>
                    </section>}
                    {related.length > 0 && <section className={styles.related} aria-labelledby="meaning-related">
                        <h2 id="meaning-related">ชื่อที่มีแนวความหมายใกล้กัน</h2>
                        <p>คัดจากกลุ่มชื่อที่กำหนดไว้และถ้อยคำในความหมายที่เผยแพร่ ความใกล้กันนี้ไม่ใช้ยืนยันว่ามีรากศัพท์เดียวกัน</p>
                        <ul className={styles.relatedList}>{related.map(item => <li key={item.name}>
                            <Link prefetch={false} href={item.path}><strong>{item.name}</strong><ArrowRight size={16} aria-hidden="true" /></Link>
                            <p>{item.meaning}</p><small>{item.reason}</small>
                        </li>)}</ul>
                    </section>}
                </div>
                <aside className={styles.aside}>
                    <section className={styles.analysis} aria-labelledby="meaning-analysis">
                        <p className={styles.asideLabel}>ดูอีกด้านของชื่อ</p>
                        <h2 id="meaning-analysis">วิเคราะห์ชื่อ {name}</h2>
                        <p>เลขศาสตร์และทักษาเป็นการตีความตามความเชื่อ แยกจากความหมายทางภาษา และไม่ใช้รับรองอนาคตของเจ้าของชื่อ</p>
                        <Link prefetch={false} href={analysisPath}>วิเคราะห์ชื่อนี้ <ArrowRight size={17} aria-hidden="true" /></Link>
                    </section>
                    <section className={styles.guideLinks} aria-labelledby="meaning-guides">
                        <h2 id="meaning-guides">อ่านก่อนเลือกชื่อ</h2>
                        <Link href="/articles/name-meaning-vs-numerology">ความหมายชื่อกับเลขศาสตร์ต่างกันอย่างไร <ChevronRight size={17} aria-hidden="true" /></Link>
                        <Link href="/articles/real-name-nickname-numerology">เลือกชื่อจริงและชื่อเล่นให้ใช้ได้ในชีวิตประจำวัน <ChevronRight size={17} aria-hidden="true" /></Link>
                        <Link href="/search">ค้นหาชื่ออื่นในฐานข้อมูล <ChevronRight size={17} aria-hidden="true" /></Link>
                    </section>
                </aside>
            </div>
        </div>
    </main>;
}
