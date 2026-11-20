import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import ClientPage from '../../ClientPage';
import { siteUrl, ogImageUrl } from '@/lib/seo';
import { REVIEWED_DAY_WALLPAPERS } from '@/data/wallpaperDayContent';
import styles from '../../finance-wallpapers.module.css';

const DAY_META: Record<string, { label: string; desc: string; keywords: string[] }> = {
    sunday: {
        label: 'วันอาทิตย์',
        desc: 'ดาวน์โหลดวอลเปเปอร์มงคลวันอาทิตย์ ฟรี! สิงห์ทองคำนำโชค ดอกบัวทอง ยันต์ศักดิ์สิทธิ์ เลขมงคล 159 เสริมอำนาจบารมี โชคลาภก้อนใหญ่ สีแดง-ทอง ออกแบบตามหลักโหราศาสตร์ไทยและฮวงจุ้ย',
        keywords: ['วอลเปเปอร์วันอาทิตย์', 'สีมงคลวันอาทิตย์', 'เสริมดวงวันอาทิตย์', 'วอลเปเปอร์สิงห์ทอง', 'เลข 159 เสริมดวง', 'พื้นหลังมงคลวันอาทิตย์', 'วอลเปเปอร์มงคล', 'วอลเปเปอร์เสริมบารมี'],
    },
    monday: {
        label: 'วันจันทร์',
        desc: 'ดาวน์โหลดวอลเปเปอร์มงคลวันจันทร์ ฟรี! เทพพระจันทร์ประทับดอกบัว พร้อมสิงห์คู่ เหรียญทองนำโชค เลขมงคล 246 เสริมเสน่ห์ เมตตามหานิยม สีขาว-เงิน ออกแบบตามหลักโหราศาสตร์ไทย',
        keywords: ['วอลเปเปอร์วันจันทร์', 'สีมงคลวันจันทร์', 'เสริมดวงวันจันทร์', 'วอลเปเปอร์เมตตามหานิยม', 'วอลเปเปอร์เสน่ห์', 'เลข 246 เสริมดวง', 'พื้นหลังมงคลวันจันทร์', 'วอลเปเปอร์พระจันทร์'],
    },
    tuesday: {
        label: 'วันอังคาร',
        desc: 'ดาวน์โหลดวอลเปเปอร์มงคลวันอังคาร ฟรี! พระปางไสยาสน์ทองคำบนดอกบัว มณฑลยันต์ศักดิ์สิทธิ์ สิงห์คู่นำโชค เลขมงคล 356 เสริมความกล้าหาญ ก้าวหน้าในการงาน สีชมพู-ทอง ตามหลักโหราศาสตร์',
        keywords: ['วอลเปเปอร์วันอังคาร', 'สีมงคลวันอังคาร', 'เสริมดวงวันอังคาร', 'วอลเปเปอร์พระปางไสยาสน์', 'เลข 356 เสริมดวง', 'พื้นหลังมงคลวันอังคาร', 'วอลเปเปอร์เสริมการงาน', 'วอลเปเปอร์มณฑลยันต์'],
    },
    wednesday: {
        label: 'วันพุธ(กลางวัน)',
        desc: 'ดาวน์โหลดวอลเปเปอร์มงคลวันพุธกลางวัน ฟรี! พระแม่ลักษมีเทพีแห่งความมั่งคั่ง ช้างมงคลโปรยน้ำ ดอกบัวทอง เลขมงคล 456 เสริมวาจาเรียกทรัพย์ ค้าขายร่ำรวย สีเขียวมรกต ตามหลักฮวงจุ้ย',
        keywords: ['วอลเปเปอร์วันพุธ', 'วอลเปเปอร์วันพุธกลางวัน', 'สีมงคลวันพุธ', 'เสริมดวงวันพุธ', 'วอลเปเปอร์พระแม่ลักษมี', 'เลข 456 เสริมดวง', 'วอลเปเปอร์ค้าขายร่ำรวย', 'วอลเปเปอร์เรียกทรัพย์', 'พื้นหลังมงคลวันพุธ'],
    },
    wednesday_night: {
        label: 'วันพุธ(กลางคืน)',
        desc: 'ดาวน์โหลดวอลเปเปอร์มงคลวันพุธกลางคืน ฟรี! พระราหูอมจันทร์ ยันต์ทองศักดิ์สิทธิ์ มณีเขียวมรกต เลขมงคล 789 เสริมพลังป้องกันภัย แคล้วคลาด สีดำ-เขียว ออกแบบตามหลักโหราศาสตร์ไทย',
        keywords: ['วอลเปเปอร์วันพุธกลางคืน', 'เสริมดวงวันพุธกลางคืน', 'วอลเปเปอร์ราหู', 'สีมงคลวันพุธกลางคืน', 'วอลเปเปอร์พระราหูอมจันทร์', 'เลข 789 เสริมดวง', 'วอลเปเปอร์ป้องกันภัย', 'วอลเปเปอร์แคล้วคลาด', 'พื้นหลังมงคลวันพุธกลางคืน'],
    },
    thursday: {
        label: 'วันพฤหัสบดี',
        desc: 'ดาวน์โหลดวอลเปเปอร์มงคลวันพฤหัสบดี ฟรี! พระพุทธรูปทองคำปางสมาธิ วงยันต์อักขระขอม คัมภีร์ทองอัญมณี เลขมงคล 659 เสริมสติปัญญา ผู้ใหญ่อุปถัมภ์ สีส้ม-ทอง ตามหลักโหราศาสตร์ไทย',
        keywords: ['วอลเปเปอร์วันพฤหัสบดี', 'สีมงคลวันพฤหัสบดี', 'เสริมดวงวันพฤหัสบดี', 'วอลเปเปอร์พระพุทธรูปทองคำ', 'เลข 659 เสริมดวง', 'วอลเปเปอร์เสริมปัญญา', 'พื้นหลังมงคลวันพฤหัสบดี', 'วอลเปเปอร์เสริมการเรียน'],
    },
    friday: {
        label: 'วันศุกร์',
        desc: 'ดาวน์โหลดวอลเปเปอร์มงคลวันศุกร์ ฟรี! พระพุทธรูปเรืองแสงฟ้าคราม ดอกบัวทิพย์ พระแม่ลักษมี เมฆมงคลจีน เลขมงคล 624 เสริมโชคลาภ ความรัก ทรัพย์สินพูนทวี สีฟ้า-เขียว ตามหลักฮวงจุ้ย',
        keywords: ['วอลเปเปอร์วันศุกร์', 'สีมงคลวันศุกร์', 'เสริมดวงวันศุกร์', 'วอลเปเปอร์เสริมความรัก', 'เลข 624 เสริมดวง', 'วอลเปเปอร์เสริมทรัพย์สิน', 'พื้นหลังมงคลวันศุกร์', 'วอลเปเปอร์ดอกบัว'],
    },
    saturday: {
        label: 'วันเสาร์',
        desc: 'ดาวน์โหลดวอลเปเปอร์มงคลวันเสาร์ ฟรี! พระนาคปรก 7 เศียร เสือคู่ทองคำ อักษรจีน招財(เรียกทรัพย์) เลขมงคล 156 เสริมอำนาจ ปกป้องคุ้มครอง ความสำเร็จยั่งยืน สีม่วง-ทอง ตามหลักโหราศาสตร์',
        keywords: ['วอลเปเปอร์วันเสาร์', 'สีมงคลวันเสาร์', 'เสริมดวงวันเสาร์', 'วอลเปเปอร์พระนาคปรก', 'เลข 156 เสริมดวง', 'วอลเปเปอร์เสือคู่นำโชค', 'พื้นหลังมงคลวันเสาร์', 'วอลเปเปอร์เรียกทรัพย์จีน', 'วอลเปเปอร์เสริมอำนาจ'],
    },
};

const VALID_DAYS = Object.keys(DAY_META);
type Props = { params: Promise<{ day: string }> };

export async function generateStaticParams() {
    return VALID_DAYS.map(day => ({ day }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { day } = await params;
    const meta = DAY_META[day];
    if (!meta) return {};
    const content = REVIEWED_DAY_WALLPAPERS[day];
    const title = content?.title || `วอลเปเปอร์มงคล${meta.label} เสริมดวง | NameMongkol`;
    const description = content?.metaDescription || meta.desc;
    const heading = content?.h1 || `วอลเปเปอร์เสริมดวงคนเกิด${meta.label}`;
    const socialImage = { url: ogImageUrl({ title: heading, subtitle: content ? `${content.meaning} · เลข ${content.code}` : 'ดูภาพและเงื่อนไขก่อนดาวน์โหลด', tag: 'Wallpapers' }), width: 1200, height: 630, alt: `ภาพปก ${heading}` };
    return {
        title: { absolute: title }, description,
        keywords: [...meta.keywords, 'วอลเปเปอร์มงคล', 'NameMongkol'],
        alternates: { canonical: `${siteUrl}/wallpapers/day/${day}` },
        openGraph: { title, description, url: `${siteUrl}/wallpapers/day/${day}`, siteName: 'NameMongkol', locale: 'th_TH', type: 'website', images: [socialImage] },
        twitter: { card: 'summary_large_image', title, description, images: [socialImage] },
    };
}

export default async function DayWallpapersPage({ params }: Props) {
    const { day } = await params;
    if (!VALID_DAYS.includes(day)) notFound();
    const meta = DAY_META[day];
    const content = REVIEWED_DAY_WALLPAPERS[day];
    const heading = content?.h1 || `วอลเปเปอร์เสริมดวงคนเกิด${meta.label}`;
    const description = content?.metaDescription || meta.desc;
    const canonical = `${siteUrl}/wallpapers/day/${day}`;
    const faqs = [
        { question: `วอลเปเปอร์${meta.label}ภาพนี้สื่อถึงอะไร?`, answer: content ? `ภาพ${content.name}ใช้โทน${content.palette} สื่อถึง${content.meaning} ${content.audience}` : `เลือกภาพสำหรับคนเกิด${meta.label}โดยอ่านคำอธิบายสีและสัญลักษณ์ แล้วเลือกแบบที่ชอบเพื่อใช้เป็นเครื่องเตือนใจถึงเป้าหมายของคุณ` },
        { question: `วอลเปเปอร์${meta.label}ดาวน์โหลดฟรีไหม?`, answer: `ภาพประจำ${meta.label}ดาวน์โหลดฟรีหลังเข้าสู่ระบบ ส่วนภาพพิเศษที่แสดงร่วมกันมีราคาเครดิตระบุบนปุ่ม ควรดูเงื่อนไขของภาพที่เลือกก่อนดาวน์โหลด` },
        { question: `ตั้งวอลเปเปอร์${meta.label}อย่างไรไม่ให้ภาพถูกตัด?`, answer: content?.setupTip || 'หลังบันทึกภาพ ให้เปิดการตั้งค่าภาพพื้นหลังแล้วปรับการซูมและตำแหน่งให้เห็นสัญลักษณ์สำคัญ ตรวจว่านาฬิกาและไอคอนไม่บังภาพก่อนยืนยัน' },
    ];
    const breadcrumbJsonLd = {
        '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'หน้าหลัก', item: siteUrl },
            { '@type': 'ListItem', position: 2, name: 'วอลเปเปอร์มงคล', item: `${siteUrl}/wallpapers` },
            { '@type': 'ListItem', position: 3, name: meta.label, item: canonical },
        ],
    };
    const collectionJsonLd = {
        '@context': 'https://schema.org', '@type': 'CollectionPage', '@id': canonical, url: canonical,
        name: heading, description, inLanguage: 'th-TH',
        ...(content ? { primaryImageOfPage: {
            '@type': 'ImageObject', contentUrl: `${siteUrl}${content.image}`,
            name: content.name, caption: content.alt, description: content.description,
            width: content.width, height: content.height, encodingFormat: 'image/webp', creditText: 'NameMongkol',
        } } : {}),
    };
    const faqJsonLd = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map(faq => ({ '@type': 'Question', name: faq.question, acceptedAnswer: { '@type': 'Answer', text: faq.answer } })) };
    return <>
        {[breadcrumbJsonLd, collectionJsonLd, faqJsonLd].map((schema, index) => <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\u003c') }} />)}
        <div className={`${styles.page} ${styles.dayIntroPage}`}>
            <div className={styles.inner}>
                <header className={styles.header}>
                    <nav aria-label="เส้นทางหน้าปัจจุบัน" className={styles.breadcrumb}><Link href="/wallpapers">วอลเปเปอร์มงคล</Link><span aria-hidden="true">/</span><span>{meta.label}</span></nav>
                    <h1>{heading}</h1>
                    <p className={styles.lead}>{content?.intro || `เลือกภาพพื้นหลังมือถือสำหรับคนเกิด${meta.label} อ่านความหมาย สี และเงื่อนไขดาวน์โหลดก่อนตั้งหน้าจอ`}</p>
                </header>
                {content && <section className={styles.dayPreview} aria-labelledby="day-primary-heading">
                    <figure>
                        <Link href={`/wallpapers/day/${day}?id=${content.id}`} scroll={false} aria-label={`ดูภาพ ${content.name}`}>
                            <Image src={content.image} alt={content.alt} width={content.width} height={content.height} sizes="(min-width: 640px) 200px, 112px" preload className={styles.dayPreviewImage} />
                        </Link>
                        <figcaption className={styles.spec}>{content.width} × {content.height} px · {content.palette}</figcaption>
                    </figure>
                    <div className={styles.dayPreviewBody}>
                        <h2 id="day-primary-heading">{content.name}</h2>
                        <Link href={`/wallpapers/day/${day}?id=${content.id}`} scroll={false} className={styles.action}>ดูภาพและดาวน์โหลดฟรี</Link>
                        <p className={styles.spec}>ภาพประจำวันนี้ดาวน์โหลดฟรีหลังเข้าสู่ระบบ ภาพพิเศษในรายการมีราคาเครดิตแยก</p>
                        <p className={styles.note}>{content.description}</p>
                        <p className={styles.note}>{content.audience}</p>
                    </div>
                </section>}
            </div>
        </div>
        <Suspense fallback={<p className="px-4 py-8 text-slate-600" role="status">กำลังเตรียมรายการวอลเปเปอร์{meta.label}…</p>}>
            <ClientPage initialCategory="day" initialDay={day} initialTab="collection" embedded />
        </Suspense>
        <div className={`${styles.page} ${styles.dayFooter}`}>
            <div className={styles.inner}>
                <section className={styles.reading} aria-labelledby="day-setup-heading">
                    <h2 id="day-setup-heading">วิธีดาวน์โหลดและตั้งวอลเปเปอร์{meta.label}</h2>
                    <ol>
                        <li>เลือกภาพและอ่านเงื่อนไขบนปุ่ม ภาพประจำวันดาวน์โหลดฟรีหลังเข้าสู่ระบบ ส่วนภาพพิเศษใช้เครดิตตามที่แจ้ง</li>
                        <li>กดดาวน์โหลดและบันทึกภาพลงในอุปกรณ์ จากนั้นเปิดการตั้งค่าภาพพื้นหลังของมือถือ</li>
                        <li>{content?.setupTip || 'เลือกหน้าจอล็อกหรือหน้าจอหลัก แล้วปรับตำแหน่งให้พอดีกับจอและไม่ถูกไอคอนบัง'}</li>
                    </ol>
                    <p className={styles.note}>สี สัญลักษณ์ และเลขในภาพใช้ประกอบความเชื่อและสร้างกำลังใจ ไม่ใช่การรับประกันผลด้านการเงิน การงาน หรือความปลอดภัย</p>
                </section>
                <section className={styles.reading} aria-labelledby="day-faq-heading">
                    <h2 id="day-faq-heading">คำถามเกี่ยวกับวอลเปเปอร์{meta.label}</h2>
                    {faqs.map(faq => <details key={faq.question} className={styles.faq}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}
                </section>
                <nav aria-label="คอลเลกชันวอลเปเปอร์ที่เกี่ยวข้อง" className={styles.nav}>
                    <Link href="/wallpapers">วอลเปเปอร์ทุกวันเกิด</Link>
                    <Link href="/wallpapers/intent/finance">วอลเปเปอร์เสริมดวงการเงิน</Link>
                    <Link href="/wallpapers/intent/work">วอลเปเปอร์ด้านการงาน</Link>
                    <Link href="/wallpapers/custom">สร้างวอลเปเปอร์ส่วนตัว</Link>
                </nav>
            </div>
        </div>
    </>;
}
