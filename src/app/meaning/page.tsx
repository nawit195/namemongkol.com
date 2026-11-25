import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowRight, Search } from 'lucide-react';
import type { Metadata } from 'next';
import { getMeaningDiscoveryEntries } from '@/lib/nameMeaningCatalog';
import { meaningHubSchema, meaningPath, normalizeMeaningName, serializeMeaningSchema } from '@/lib/nameMeaning';
import { ogImageUrl, siteUrl } from '@/lib/seo';
import styles from './meaning.module.css';

export const revalidate = 600;
const title = 'ความหมายชื่อและข้อมูลคำอ่าน';
const description = 'อ่านความหมายชื่อจากข้อมูลที่เว็บไซต์เผยแพร่ พร้อมสถานะคำอ่าน ที่มาของข้อมูล และชื่อที่มีแนวความหมายใกล้กัน แยกจากการวิเคราะห์เลขศาสตร์';
type Props = { searchParams: Promise<{ name?: string | string[] }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
    const query = await searchParams;
    const image = ogImageUrl({ variant: 'article', title, subtitle: 'เริ่มจากความหมายที่ชอบ แล้วค่อยเลือกชื่อที่ใช้ได้จริง', tag: 'ความหมายชื่อ' });
    return { title, description, alternates: { canonical: `${siteUrl}/meaning` }, robots: { index: !query.name, follow: true },
        openGraph: { title: `${title} | NameMongkol`, description, url: `${siteUrl}/meaning`, type: 'website', locale: 'th_TH', images: [image] },
        twitter: { card: 'summary_large_image', title: `${title} | NameMongkol`, description, images: [image] },
    };
}

export default async function MeaningHub({ searchParams }: Props) {
    const query = await searchParams;
    const requested = typeof query.name === 'string' ? query.name : '';
    const normalized = normalizeMeaningName(requested);
    if (normalized) redirect(meaningPath(normalized));
    const entries = await getMeaningDiscoveryEntries();
    return <main className={styles.page}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeMeaningSchema(meaningHubSchema(entries)) }} />
        <div className={styles.container}>
            <nav className={styles.breadcrumb} aria-label="เส้นทางนำทาง"><Link href="/">หน้าหลัก</Link><span aria-hidden="true">/</span><span aria-current="page">ความหมายชื่อ</span></nav>
            <header className={styles.hubHeader}>
                <p className={styles.eyebrow}>เลือกชื่อจากความหมาย</p>
                <h1>ความหมายชื่อ<br /><span>เริ่มจากสิ่งที่อยากสื่อ</span></h1>
                <p>อ่านความหมาย คำอ่านที่พร้อมเผยแพร่ และที่มาของข้อมูลก่อนเลือกชื่อที่ชอบ ส่วนเลขศาสตร์ดูแยกได้ในขั้นตอนวิเคราะห์ชื่อ</p>
                <form action="/meaning" method="get" className={styles.lookup}>
                    <label htmlFor="meaning-name">ค้นหาในชุดความหมายชื่อคัดสรร</label>
                    <div><input id="meaning-name" name="name" type="search" maxLength={60} required defaultValue={requested} placeholder="เช่น ธนกร หรือ ณิชา" /><button type="submit"><Search size={18} aria-hidden="true" />ค้นหา</button></div>
                    {query.name && <p className={styles.formError} role="alert">กรุณาระบุชื่อภาษาไทย โดยไม่ใส่คำนำหน้า ตัวเลข หรือสัญลักษณ์</p>}
                </form>
            </header>
            <section className={styles.discovery} aria-labelledby="meaning-examples">
                <div className={styles.sectionHeading}><h2 id="meaning-examples">เริ่มอ่านจากชื่อเหล่านี้</h2><span>{entries.length} ชื่อที่มีข้อมูลความหมาย</span></div>
                <p className={styles.intro}>คัดรายชื่อเริ่มต้นจากฐานข้อมูลและรายการที่เว็บไซต์รวบรวม ความหมายแต่ละชื่อแสดงตามข้อมูลที่เผยแพร่ และระบุข้อจำกัดของแหล่งอ้างอิงในหน้ารายชื่อ</p>
                {entries.length ? <ul className={styles.discoveryList}>{entries.map(item => <li key={item.name}>
                    <Link prefetch={false} href={item.path}><strong>{item.name}</strong><ArrowRight size={16} aria-hidden="true" /></Link><p>{item.meaning}</p>
                </li>)}</ul> : <p className={styles.empty}>ยังไม่มีรายชื่อพร้อมแสดงในขณะนี้ ลองกลับมาใหม่ หรือเลือกดูรายชื่อจากหน้าค้นหา</p>}
            </section>
            <section className={styles.hubGuidance} aria-labelledby="meaning-next">
                <div><h2 id="meaning-next">ความหมายที่ชอบ เป็นจุดเริ่มต้นของการเลือกชื่อ</h2><p>ลองเรียกออกเสียง พิจารณาการสะกด และคุยกับครอบครัวก่อนตัดสินใจ ความหมายของคำกับคะแนนเลขศาสตร์เป็นคนละข้อมูล</p></div>
                <div className={styles.guideLinks}>
                    <Link href="/articles/name-meaning-vs-numerology">ทำความเข้าใจความหมายชื่อกับเลขศาสตร์ <ArrowRight size={17} aria-hidden="true" /></Link>
                    <Link href="/articles/real-name-nickname-numerology">แนวทางเลือกชื่อจริงและชื่อเล่น <ArrowRight size={17} aria-hidden="true" /></Link>
                    <Link href="/search">ค้นหารายชื่อเพิ่มเติม <ArrowRight size={17} aria-hidden="true" /></Link>
                </div>
            </section>
        </div>
    </main>;
}
