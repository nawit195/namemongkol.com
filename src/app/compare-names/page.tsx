import type { Metadata } from 'next';
import Link from 'next/link';
import { canonicalUrl, ogImageUrl } from '@/lib/seo';
import CompareNamesClient from './ClientPage';
import { CompareNamesViewStats } from './CompareNamesViewStats';
import styles from './comparison.module.css';

const title = 'เปรียบเทียบชื่อมงคลฟรี 2–5 ชื่อ | NameMongkol';
const description = 'เปรียบเทียบชื่อจริง 2–5 ชื่อกับนามสกุลและวันเกิดเดียวกัน ค้นหาชื่อหรือพิมพ์เอง ดูเกรด เลขศาสตร์ คู่เลข กาลกิณี และอายตนะข้างกัน ฟรี ไม่ต้องสมัคร';
export const metadata: Metadata = {
  title: { absolute: title }, description,
  alternates: { canonical: canonicalUrl('/compare-names') },
  openGraph: { title, description, url: canonicalUrl('/compare-names'), locale: 'th_TH', type: 'website', images: [ogImageUrl({ title: 'เปรียบเทียบชื่อมงคลฟรี', subtitle: 'เห็นผลข้างกัน เลือกชื่อที่ใช่', tag: 'Name Comparison' })] },
  twitter: { card: 'summary_large_image', title, description },
};

export default function CompareNamesPage() {
  return <main className={styles.page}>
    <div className={styles.content}>
      <nav aria-label="เส้นทางหน้าเว็บ" className={styles.breadcrumb}><Link href="/">หน้าหลัก</Link><span aria-hidden="true">/</span><span>เปรียบเทียบชื่อ</span></nav>
      <header className={styles.hero}><div className={styles.heroMeta}><p className={styles.eyebrow}>NAME COMPARISON · ฟรี</p><CompareNamesViewStats /></div><h1>หลายชื่อในใจ<br /><span>เทียบให้เห็น ก่อนตัดสินใจ</span></h1><p className={styles.intro}>เปรียบเทียบ 2–5 ชื่อด้วยวันเกิดและนามสกุลเดียวกัน<br className={styles.desktopBreak} /> เห็นทั้งจุดเด่นและข้อควรพิจารณาในตารางเดียว</p></header>
      <CompareNamesClient />
      <footer className={styles.pageFooter}><p>มีรายชื่อจำนวนมากที่ต้องการคัดกรอง?</p><Link href="/name-analysis">ไปเครื่องมือวิเคราะห์รายชื่อจำนวนมาก</Link><span>บริการใช้เครดิตสำหรับจัดเกรดและส่งออกผล</span></footer>
    </div>
  </main>;
}
