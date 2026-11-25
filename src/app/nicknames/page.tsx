import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { FavoriteListButton } from '@/components/names/NamingProvider';
import { siteUrl } from '@/lib/seo';
import { DEFAULT_NICKNAME_FILTERS } from '@/lib/auspiciousNicknameShared';
import { queryNicknames } from '@/lib/auspiciousNicknames';
import { NICKNAME_COLLECTION_LINKS } from '@/lib/nicknameCollectionLinks';
import NicknameBrowser from './NicknameBrowser';
import styles from './nicknames.module.css';

export const revalidate = 600;
const title = 'ชื่อเล่นมงคล พร้อมความหมายและวันเกิด';
const description =
    'ค้นหาชื่อเล่นมงคลเกรด A และ B ฟรี พร้อมความหมาย เพศ ผลรวมและวันเกิดที่ใช้ได้ เลือกชื่อเล่นเกรด A+ เพิ่มด้วยเครดิต และเก็บชื่อที่ถูกใจไว้เลือกภายหลัง';
const shareImage = `${siteUrl}/api/og?${new URLSearchParams({
    variant: 'default',
    title: 'ชื่อเล่นมงคล',
    subtitle: 'เลือกจากความหมาย วันเกิด และเลขศาสตร์',
})}`;
export const metadata: Metadata = {
    title,
    description,
    alternates: { canonical: `${siteUrl}/nicknames` },
    openGraph: {
        title,
        description,
        url: `${siteUrl}/nicknames`,
        locale: 'th_TH',
        type: 'website',
        images: [{ url: shareImage, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [shareImage] },
};

export default function NicknamesPage() {
    const initial = queryNicknames(DEFAULT_NICKNAME_FILTERS).response;
    return (
        <main className={styles.page}>
            <nav className={styles.breadcrumbs} aria-label="เส้นทางหน้า">
                <Link prefetch={false} href="/search">ค้นหาชื่อมงคล</Link>
                <span aria-hidden="true">/</span>
                <span aria-current="page">ชื่อเล่นมงคล</span>
            </nav>
            <header className={styles.header}>
                <div>
                    <p className={styles.eyebrow}>เลือกเสียงเรียกที่ชอบ</p>
                    <h1>ชื่อเล่นมงคล</h1>
                    <p>เลือกจากความหมาย วันเกิด และเลขศาสตร์</p>
                </div>
                <FavoriteListButton className={styles.favoritesTrigger} />
            </header>
            <nav className={styles.collectionNav} aria-label="เลือกชื่อเล่นตามความหมายและแนวชื่อ">
                {NICKNAME_COLLECTION_LINKS.map(collection => (
                    <Link key={collection.key} prefetch={false} href={collection.path}>
                        {collection.label}<ArrowRight size={14} aria-hidden="true" />
                    </Link>
                ))}
            </nav>
            <Suspense
                fallback={
                    <div className="py-12" role="status">
                        กำลังเตรียมชื่อเล่นมงคล…
                    </div>
                }
            >
                <NicknameBrowser initial={initial} />
            </Suspense>
            <section className={styles.nicknameSeo} aria-label="แนวทางเลือกชื่อเล่นมงคล">
                <h2>เริ่มเลือกชื่อเล่นจากความหมาย แล้วค่อยดูวันเกิดและเลขศาสตร์</h2>
                <p>ชื่อเล่นเป็นเสียงที่เจ้าของชื่อและคนรอบตัวใช้เรียกกันทุกวัน ลองเริ่มจากความหมายที่ชอบ เช่น แสงสว่าง ความสุข หรือแนวชื่อที่ใช้ได้ทุกเพศ แล้วใช้ตัวกรองวันเกิดและผลรวมช่วยจัดตัวเลือกให้แคบลง เกรดและวันเกิดแสดงตามชุดข้อมูลชื่อเล่นที่เว็บไซต์นำเข้า</p>
                <h3>ชื่อเล่นเกรด A และ B กับ A+ เปิดดูต่างกันอย่างไร?</h3>
                <p>รายชื่อเกรด A และ B เปิดดูฟรี ส่วน A+ มีตัวอย่างฟรีอักษรละสูงสุด 2 ชื่อ ชื่อที่เหลือปลดล็อกเป็นชุดโดยแสดงจำนวนและเครดิตให้ยืนยันก่อน ชื่อที่เคยปลดล็อกแล้วกลับมาดูผ่านบัญชีเดิมได้</p>
                <h3>เครื่องหมาย +1 วัน หรือ +3 วันในการ์ดหมายถึงอะไร?</h3>
                <p>เป็นจำนวนวันเกิดที่ใช้ได้เพิ่มเติมจากวันที่แสดงบนการ์ด แตะแถววันเกิดหรือลูกศรลงเพื่อดูวันทั้งหมด รวมถึงข้อมูลคู่เลขของชื่อนั้น</p>
                <h3>ควรเลือกชื่อเล่นให้ได้เกรดสูงที่สุดอย่างเดียวหรือไม่?</h3>
                <p>ใช้เกรดเป็นข้อมูลประกอบร่วมกับความหมาย ความสะดวกในการออกเสียง และความพอใจของเจ้าของชื่อกับครอบครัว ลองเรียกชื่อจริงและชื่อเล่นคู่กันก่อนเลือกใช้ โดยไม่ผูกชื่อกับบุคลิกหรือผลลัพธ์ในอนาคต</p>
                <p>หากกำลังเทียบชื่อจริงกับชื่อเล่น อ่านต่อได้ที่ <Link prefetch={false} href="/articles/real-name-nickname-numerology">ชื่อจริงกับชื่อเล่นต้องมีผลรวมเหมือนกันไหม</Link> พร้อมตัวอย่างที่ทดลองคำนวณตามได้</p>
            </section>
        </main>
    );
}
