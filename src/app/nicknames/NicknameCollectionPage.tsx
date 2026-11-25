import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { FavoriteListButton } from '@/components/names/NamingProvider';
import { getNicknameCollection, getPublishedNicknameCollections, nicknameCollectionSchema } from '@/lib/nicknameCollections';
import NicknameCard from './NicknameCard';
import styles from './nicknames.module.css';

export default function NicknameCollectionPage({ collectionKey }: { collectionKey: string }) {
    const collection = getNicknameCollection(collectionKey);
    if (!collection) notFound();
    return (
        <main className={`${styles.page} ${styles.collectionPage}`}>
            <nav className={styles.breadcrumbs} aria-label="เส้นทางหน้า">
                <Link prefetch={false} href="/">หน้าแรก</Link><span aria-hidden="true">/</span>
                <Link prefetch={false} href="/nicknames">ชื่อเล่นมงคล</Link><span aria-hidden="true">/</span>
                <span>{collection.label}</span>
            </nav>
            <header className={styles.header}>
                <div>
                    <p className={styles.eyebrow}>คัดตามความหมายและแนวชื่อ</p>
                    <h1>{collection.title}</h1>
                    <p>{collection.entries.length} ไอเดียจากชุดชื่อเล่นเกรด A และ B ที่เปิดดูฟรี</p>
                </div>
                <FavoriteListButton className={styles.favoritesTrigger} />
            </header>
            <p className={styles.collectionIntro}>{collection.intro}</p>
            <div className={styles.collectionGuide}>
                <h2>เลือกชื่อในหมวดนี้อย่างไร</h2>
                <p>{collection.guide}</p>
                <p>ความหมาย เกรด เพศ และวันเกิดแสดงตามชุดข้อมูลชื่อเล่นต้นฉบับ เหตุผลด้านล่างแต่ละการ์ดอธิบายการคัดเข้าหมวดเพิ่มเติม</p>
            </div>
            <section id="names" aria-label={collection.title}>
                <div className={styles.grid}>
                    {collection.entries.map(({ item, reason }) => (
                        <div key={item.id} className={styles.collectionEntry}>
                            <NicknameCard item={item} selectedDay="all" />
                            <p className={styles.collectionReason}><strong>เหตุผลที่เลือก:</strong> {reason}</p>
                        </div>
                    ))}
                </div>
            </section>
            <section className={styles.collectionAnswer}>
                <h2>{collection.question}</h2>
                <p>{collection.answer}</p>
                <p>เกรดและวันเกิดเป็นเกณฑ์ของชุดข้อมูลและศาสตร์ที่ครอบครัวเลือกใช้ ควรพิจารณาความหมาย เสียงเรียก และความชอบของเจ้าของชื่อร่วมกัน</p>
            </section>
            <nav className={styles.collectionNav} aria-label="หมวดชื่อเล่นที่เกี่ยวข้อง">
                {getPublishedNicknameCollections().filter(item => item.key !== collection.key).map(item => (
                    <Link key={item.key} prefetch={false} href={item.path}>{item.label}<ArrowRight size={14} aria-hidden="true" /></Link>
                ))}
            </nav>
            <div className={styles.collectionReturn}>
                <Link prefetch={false} href={collection.key === 'unisex' ? '/nicknames?gender=unisex' : '/nicknames'}>
                    <ArrowLeft size={15} aria-hidden="true" />เลือกชื่อเล่นตามวันเกิดและเลขศาสตร์ต่อ
                </Link>
                <Link prefetch={false} href="/names">ดูแนวทางตั้งชื่อจริงให้ลูก<ArrowRight size={15} aria-hidden="true" /></Link>
            </div>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(nicknameCollectionSchema(collection)).replace(/</g, '\\u003c') }} />
        </main>
    );
}
