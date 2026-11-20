import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { FINANCE_COLLECTION_COPY, FINANCE_WALLPAPERS, FINANCE_WALLPAPER_PATH } from '@/data/financeWallpapers';
import { paidWallpaperPath } from '@/data/paidWallpapers';
import styles from './finance-wallpapers.module.css';

export default function FinanceWallpaperGallery({ detailed = false }: { detailed?: boolean }) {
    return (
        <section className={styles.section} aria-labelledby="finance-collection-heading">
            <div className={styles.sectionHead}>
                <div>
                    <p className={styles.eyebrow}>คอลเลกชันมรกตและทอง · 4289</p>
                    <h2 id="finance-collection-heading">{detailed ? FINANCE_COLLECTION_COPY.heading : 'วอลเปเปอร์เสริมดวงการเงิน'}</h2>
                    <p className={styles.subheading}>4 ภาพสำหรับมือถือ · ดูตัวอย่างฟรี · ดาวน์โหลดใหม่ 15 เครดิตต่อภาพ</p>
                </div>
                {!detailed && <Link href={FINANCE_WALLPAPER_PATH} className={styles.collectionLink}>ดูคอลเลกชันการเงินทั้งหมด <ArrowRight size={16} aria-hidden="true" /></Link>}
            </div>
            <div className={styles.grid}>
                {FINANCE_WALLPAPERS.map((product, index) => {
                    const href = paidWallpaperPath('finance', product.id);
                    return <article className={styles.card} key={product.id}>
                        <Link id={`card-${product.id}`} href={href} scroll={!detailed} className={styles.artwork} aria-label={`ดูรายละเอียด ${product.name}`}>
                            <Image src={product.preview} alt={product.alt} width={product.width} height={product.height} sizes="(min-width: 1024px) 24vw, 48vw" preload={index === 0} />
                        </Link>
                        <h3>{product.name}</h3>
                        <p className={styles.meaning}>{product.auspiciousMeaning}</p>
                        <p className={styles.price}>15 เครดิต / ดาวน์โหลดใหม่</p>
                        {detailed && <>
                            <p className={styles.spec}>{product.width} × {product.height} px · PNG · {(product.bytes / 1_000_000).toFixed(2)} MB</p>
                            <details className={styles.details}>
                                <summary>แนวคิดและความหมายของภาพ</summary>
                                <p>{product.description}</p>
                                <p><strong>ความหมายมงคลตามความเชื่อ: </strong>{product.auspiciousMeaning}</p>
                            </details>
                        </>}
                        <Link href={href} scroll={!detailed} className={styles.action} aria-label={`ดูภาพและดาวน์โหลด ${product.name}`}>ดูภาพและดาวน์โหลด <ArrowRight size={15} aria-hidden="true" /></Link>
                    </article>;
                })}
            </div>
            {detailed && <p className={styles.note}>เลือกใช้ได้ทุกวันเกิด ภาพและเลขมงคลเป็นสัญลักษณ์ตามความเชื่อสำหรับสร้างกำลังใจ ไม่ได้รับประกันรายได้หรือโชคลาภ ทุกการดาวน์โหลดใหม่มีการยืนยันก่อนใช้เครดิต ลองรายการเดิมซ้ำได้ฟรีภายใน 30 นาที</p>}
        </section>
    );
}
