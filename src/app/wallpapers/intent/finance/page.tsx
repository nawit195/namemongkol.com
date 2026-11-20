import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import FinanceWallpaperGallery from '../../FinanceWallpaperGallery';
import PaidWallpaperCollection from '../../PaidWallpaperCollection';
import { FINANCE_COLLECTION_COPY, FINANCE_FAQS, FINANCE_WALLPAPERS, FINANCE_WALLPAPER_PATH } from '@/data/financeWallpapers';
import { paidWallpaperPath } from '@/data/paidWallpapers';
import { ogImageUrl, siteUrl } from '@/lib/seo';
import styles from '../../finance-wallpapers.module.css';

const canonical = `${siteUrl}${FINANCE_WALLPAPER_PATH}`;
const title = 'วอลเปเปอร์เสริมดวงการเงิน 4289 | NameMongkol';
const description = 'เลือกวอลเปเปอร์เสริมดวงการเงิน 4289 คอลเลกชันมรกตและทอง 4 ภาพ: ต้นไม้ทอง ปลาคาร์ป ฝูงม้า และเรือสำเภา ดูตัวอย่างฟรี ดาวน์โหลด PNG เต็มขนาด 15 เครดิตต่อภาพ';
const socialImage = ogImageUrl({ title: 'วอลเปเปอร์เสริมดวงการเงิน', subtitle: 'คอลเลกชันมรกตและทอง 4289 · 4 ภาพ · ดาวน์โหลด 15 เครดิต', tag: 'Wallpapers' });

export const metadata: Metadata = {
    title: { absolute: title }, description,
    keywords: ['วอลเปเปอร์เสริมดวงการเงิน', 'วอลเปเปอร์เรียกทรัพย์', 'วอลเปเปอร์การเงิน 4289', 'วอลเปเปอร์ปลาคาร์ป', 'วอลเปเปอร์เรือสำเภา'],
    alternates: { canonical },
    openGraph: { title, description, url: canonical, siteName: 'NameMongkol', locale: 'th_TH', type: 'website', images: [socialImage] },
    twitter: { card: 'summary_large_image', title, description, images: [socialImage] },
};

const collectionJsonLd = {
    '@context': 'https://schema.org', '@type': 'CollectionPage', '@id': canonical,
    name: 'วอลเปเปอร์เสริมดวงการเงิน 4289', description, url: canonical, inLanguage: 'th-TH',
    isPartOf: { '@type': 'WebSite', name: 'NameMongkol', url: siteUrl },
    mainEntity: {
        '@type': 'ItemList', numberOfItems: FINANCE_WALLPAPERS.length,
        itemListElement: FINANCE_WALLPAPERS.map((product, index) => ({
            '@type': 'ListItem', position: index + 1,
            url: `${siteUrl}${paidWallpaperPath('finance', product.id)}`,
            item: {
                '@type': 'ImageObject', '@id': `${canonical}#${product.id}`, name: product.name,
                description: product.description, caption: product.alt,
                contentUrl: `${siteUrl}${product.preview}`, encodingFormat: 'image/webp',
                width: 640, height: Math.round(product.height * 640 / product.width),
                creditText: 'NameMongkol', creator: { '@type': 'Organization', name: 'NameMongkol', url: siteUrl },
            },
        })),
    },
};
const breadcrumbJsonLd = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'หน้าหลัก', item: siteUrl },
        { '@type': 'ListItem', position: 2, name: 'วอลเปเปอร์มงคล', item: `${siteUrl}/wallpapers` },
        { '@type': 'ListItem', position: 3, name: 'วอลเปเปอร์เสริมดวงการเงิน', item: canonical },
    ],
};
const faqJsonLd = {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: FINANCE_FAQS.map(faq => ({ '@type': 'Question', name: faq.question, acceptedAnswer: { '@type': 'Answer', text: faq.answer } })),
};

export default function FinanceWallpapersIntentPage() {
    return <div className={styles.page}>
        <div className={styles.inner}>
            {[collectionJsonLd, breadcrumbJsonLd, faqJsonLd].map((schema, index) => <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />)}
            <header className={styles.header}>
                <nav aria-label="เส้นทางหน้าปัจจุบัน" className={styles.breadcrumb}><Link href="/wallpapers">วอลเปเปอร์มงคล</Link><span aria-hidden="true">/</span><span>การเงิน</span></nav>
                <p className={styles.eyebrow}>มรกตและทอง · เลขมงคล 4289</p>
                <h1>วอลเปเปอร์เสริมดวงการเงิน</h1>
                <p className={styles.lead}>{FINANCE_COLLECTION_COPY.introduction}</p>
                <p className={styles.note}>{FINANCE_COLLECTION_COPY.inspiration}</p>
                <Link href="/wallpapers/custom" className={styles.collectionLink}>สร้างวอลเปเปอร์ส่วนตัวตามวันเกิด →</Link>
            </header>
            <nav aria-label="หมวดวอลเปเปอร์" className={styles.nav}>
                <Link href="/wallpapers">วันเกิด</Link>
                <Link href="/wallpapers/zodiac">ราศี</Link>
                <Link href="/wallpapers?collection=horses">ม้า 8 ตัว</Link>
                <Link href={FINANCE_WALLPAPER_PATH} aria-current="page">การเงิน</Link>
            </nav>
            <FinanceWallpaperGallery detailed />
            <Suspense fallback={null}><PaidWallpaperCollection collection="finance" showGallery={false} /></Suspense>
            <section className={styles.reading} aria-labelledby="finance-meaning-heading">
                <h2 id="finance-meaning-heading">เลือกวอลเปเปอร์การเงินให้เข้ากับเป้าหมาย</h2>
                <p>{FINANCE_COLLECTION_COPY.selectionGuide}</p>
                <p className={styles.note}>ใช้ภาพเป็นกำลังใจควบคู่กับการลงมือทำ เช่น ตั้งเป้าการออมและติดตามรายจ่าย ความหมายของภาพเป็นความเชื่อส่วนบุคคล ไม่ใช่คำรับรองผลด้านการเงิน</p>
            </section>
            <section className={styles.reading} aria-labelledby="finance-setup-heading">
                <h2 id="finance-setup-heading">วิธีตั้งวอลเปเปอร์บนมือถือ</h2>
                <ol>
                    <li>เลือกภาพและเปิดรายละเอียด เข้าสู่ระบบเพื่อตรวจเครดิต จากนั้นยืนยันดาวน์โหลดใหม่ 15 เครดิต</li>
                    <li>เมื่อเบราว์เซอร์รับไฟล์ PNG ให้บันทึกลงในรูปภาพหรือแกลเลอรีของอุปกรณ์</li>
                    <li>เปิดการตั้งค่าภาพพื้นหลัง เลือกภาพที่บันทึก แล้วปรับตำแหน่งให้ตัวเลขและจุดเด่นของภาพไม่ถูกนาฬิกาหรือไอคอนบัง</li>
                    <li>ตั้งเป็นหน้าจอล็อกหรือหน้าจอหลักตามต้องการ หากรับไฟล์ขัดข้อง ลองรายการเดิมซ้ำได้ภายใน 30 นาทีโดยไม่หักเครดิตเพิ่ม</li>
                </ol>
            </section>
            <section className={styles.reading} aria-labelledby="finance-faq-heading">
                <h2 id="finance-faq-heading">คำถามเกี่ยวกับวอลเปเปอร์เสริมดวงการเงิน</h2>
                {FINANCE_FAQS.map(faq => <details key={faq.question} className={styles.faq}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}
            </section>
            <p className={styles.note}>{FINANCE_COLLECTION_COPY.callToAction}</p>
            <Link href="/wallpapers" className={styles.collectionLink}>ดูวอลเปเปอร์มงคลทุกคอลเลกชัน →</Link>
        </div>
    </div>;
}
