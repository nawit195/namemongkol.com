import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getPublishedCelebrityNames } from '@/lib/celebrityNames';
import { getCelebrityCatalog } from '@/lib/celebrityCatalog';
import { celebrityNamesUpdatedAt } from '@/data/celebrityNames';
import { CelebrityNameSearch } from '@/components/celebrity-names/CelebrityNameSearch';
import { CelebrityEditorialNotice } from '@/components/celebrity-names/CelebrityEditorialNotice';
import { ogImageUrl, siteUrl } from '@/lib/seo';
import styles from '@/components/celebrity-names/celebrity-names.module.css';

const title = 'ถอดรหัสชื่อคนดัง: กรณีศึกษาวิธีคำนวณชื่อ | NameMongkol';
const description = 'กรณีศึกษาอธิบายผลรวมและคู่เลขของชื่อ ด้วยเกณฑ์เลขศาสตร์ตามความเชื่อของ NameMongkol แยกบุคคลอ้างอิง ขอบเขตเกรดชื่อ แหล่งประวัติ และข้อมูลใบอนุญาตภาพ';
const canonical = `${siteUrl}/celebrity-names`;
const image = ogImageUrl({ variant: 'celebrity', title: 'ถอดรหัสชื่อคนดัง', subtitle: 'เข้าใจเกรด A+ เฉพาะชื่อ ผ่านวิธีคำนวณและแหล่งข้อมูลที่ตรวจสอบได้', tag: 'กรณีศึกษาเพื่อการเรียนรู้' });
export const metadata: Metadata = {
    title: { absolute: title }, description, alternates: { canonical },
    openGraph: { title, description, url: canonical, type: 'website', locale: 'th_TH', images: [{ url: image, width: 1200, height: 630, alt: 'ถอดรหัสชื่อคนดัง เกรด A+ เฉพาะชื่อตามเกณฑ์ NameMongkol' }] },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
};

export default function CelebrityNamesPage() {
    const entries = getCelebrityCatalog();
    const example = getPublishedCelebrityNames()[0];
    const jsonLd = {
        '@context': 'https://schema.org', '@graph': [
            { '@type': 'CollectionPage', '@id': `${canonical}#page`, url: canonical, name: title, description, inLanguage: 'th-TH', dateModified: celebrityNamesUpdatedAt, publisher: { '@id': `${siteUrl}/#organization` }, mainEntity: { '@id': `${canonical}#cases` } },
            { '@type': 'ItemList', '@id': `${canonical}#cases`, numberOfItems: entries.length, itemListElement: entries.map((entry, index) => ({ '@type': 'ListItem', position: index + 1, name: entry.name, url: entry.articleHref ? `${siteUrl}${entry.articleHref}` : `${canonical}#directory-${entry.slug}` })) },
            { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'หน้าแรก', item: siteUrl }, { '@type': 'ListItem', position: 2, name: 'ถอดรหัสชื่อคนดัง', item: canonical }] },
        ],
    };
    return <main className={styles.page}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
        <div className={styles.container}>
            <nav className={styles.breadcrumbs} aria-label="เส้นทางหน้าปัจจุบัน"><Link href="/">หน้าแรก</Link><span aria-hidden="true">/</span><span aria-current="page">ถอดรหัสชื่อคนดัง</span></nav>
            <header className={styles.hero}>
                <div>
                    <p className={styles.eyebrow}>กรณีศึกษาอธิบายเกณฑ์ของเว็บไซต์</p>
                    <h1>ถอดรหัสชื่อคนดัง<span>ดูวิธีคำนวณทีละขั้น</span></h1>
                    <p className={styles.intro}>ชื่อหนึ่งชื่อ ได้เกรด A+ เพราะอะไร? ดูตัวอักษร ผลรวม และคู่เลขทีละขั้น พร้อมแยกผลของชื่อออกจากนามสกุลอย่างชัดเจน</p>
                    <div className={styles.heroLinks}><a href="#celebrity-list-title" className={styles.primaryLink}>เลือกกรณีศึกษา <ArrowRight size={18} aria-hidden="true" /></a><Link href="/methodology" className={styles.textLink}>อ่านวิธีคำนวณของเว็บ</Link></div>
                </div>
                {example && <aside className={styles.specimen} aria-label={`ตัวอย่างผลรวมชื่อ ${example.name}`}>
                    <div className={styles.specimenHeader}><span>ตัวอย่างการคำนวณ</span><span className={styles.grade}>เกรดชื่อ A+</span></div>
                    <h2>{example.name}</h2><p>{example.nickname} · {example.surname}</p>
                    <div className={styles.formula} aria-label={`ผลบวกค่าตัวอักษรได้ ${example.analysis.nameSum}`}>{example.analysis.characters.map((item, index) => <span key={index}>{index > 0 ? '+ ' : ''}{item.value}</span>)}<span className={styles.formulaResult}><span>=</span><strong>{example.analysis.nameSum}</strong></span></div>
                    <div className={styles.explanation}><p>ผลรวมผ่านเกณฑ์ และคู่เลขในชื่ออยู่ในกลุ่มดีทุกคู่ จึงได้ A+ ตามเกณฑ์ชื่อเดี่ยวของ NameMongkol</p><Link href={`/articles/${example.slug}`} className={styles.textLink}>เปิดผังตัวอักษรและคู่เลข <ArrowRight size={16} aria-hidden="true" /></Link></div>
                </aside>}
            </header>
            <CelebrityEditorialNotice />
            <CelebrityNameSearch entries={entries} />
            <section className={styles.method} aria-labelledby="celebrity-method-title"><div><p className={styles.eyebrow}>อ่านชื่อให้เข้าใจ ก่อนเลือกใช้จริง</p><h2 id="celebrity-method-title">ตรวจอะไรบ้าง<br />ก่อนเป็นกรณีศึกษา</h2></div><ol>
                <li><strong>แยกชื่อและบุคคลให้ชัดเจน</strong><span>ข้อความที่คำนวณอาจเป็นชื่อในวงการหรือชื่อที่เคยใช้ ส่วนบุคคลอ้างอิงระบุตามแหล่งประวัติและแยกตัวเลือกเมื่อชื่อซ้ำ รายการที่ยังยืนยันไม่ได้หรือควรตรวจเพิ่มเติมจะพักการเผยแพร่ไว้ก่อน</span></li>
                <li><strong>คำนวณด้วยเกณฑ์เดียวกับเครื่องมือ</strong><span>แสดงค่าตัวอักษรและคู่เลข พร้อมแยกชื่อ นามสกุล และชื่อเต็มให้ตรวจซ้ำได้ที่ <Link href="/name-check">เครื่องมือวิเคราะห์ชื่อฟรี</Link></span></li>
                <li><strong>แสดงข้อมูลใบอนุญาตภาพตามหลักฐาน</strong><span>บันทึกหน้าข้อมูลภาพ ณ วันที่ตรวจ พร้อมเครดิตและใบอนุญาต ภาพที่หลักฐานยังไม่ครบจะพักการแสดง ข้อมูลเหล่านี้ไม่ได้ยืนยันการอนุญาตใช้ภาพลักษณ์เพื่อโฆษณา อ่าน <Link href="/celebrity-names/editorial-policy">แนวทางข้อมูลและภาพประกอบ</Link> เพิ่มเติม</span></li>
            </ol></section>
        </div>
    </main>;
}
