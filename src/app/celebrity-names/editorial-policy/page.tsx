import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { celebrityEditorialPolicy as policy } from '@/data/celebrityEditorialPolicy';
import { siteUrl } from '@/lib/seo';
import styles from '@/components/celebrity-names/celebrity-names.module.css';

const title = 'แนวทางข้อมูลและภาพประกอบกรณีศึกษาชื่อ | NameMongkol';
const description = 'วัตถุประสงค์ ขอบเขตเกรดชื่อ แหล่งประวัติ ข้อมูลใบอนุญาตภาพ และช่องทางขอแก้ไขหรือถอดข้อมูลในกรณีศึกษาชื่อของ NameMongkol';
export const metadata: Metadata = {
    title: { absolute: title }, description, alternates: { canonical: `${siteUrl}${policy.path}` },
    openGraph: { title, description, url: `${siteUrl}${policy.path}`, type: 'website', locale: 'th_TH' },
};

export default function CelebrityEditorialPolicyPage() {
    return <main className={styles.page}>
        <div className={`${styles.container} ${styles.policyContent}`}>
            <Link href="/celebrity-names" className={styles.textLink}><ArrowLeft size={17} aria-hidden="true" /> กลับไปกรณีศึกษาชื่อ</Link>
            <header className={styles.policyHeader}><p className={styles.eyebrow}>ข้อมูลประกอบการอ่านกรณีศึกษา</p><h1>แนวทางข้อมูล<br />และภาพประกอบ</h1><p>ปรับปรุงวันที่ <time dateTime={policy.updatedAt}>26 พฤศจิกายน 2569</time></p></header>
            <section><h2>จุดประสงค์และขอบเขตของเกรด</h2><p>{policy.purpose} แสดงวิธีถอดตัวอักษร ผลรวม และคู่เลขให้ตรวจซ้ำได้</p><p>{policy.gradeScope} เกรดไม่ได้เป็นการประเมินคุณค่าของบุคคล หรือหลักฐานพิสูจน์ผลต่อชีวิต การงาน หรือรายได้</p><p>{policy.nonEndorsement}</p><p><Link href="/methodology">อ่านวิธีคำนวณและข้อจำกัดของเว็บไซต์</Link></p></section>
            <section><h2>ข้อมูลบุคคลและแหล่งอ้างอิง</h2><p>ใช้ชื่อ ชื่อเล่น และบทบาทจากหน้าประวัติที่เผยแพร่ต่อสาธารณะ โดยแสดงลิงก์และวันที่ตรวจแหล่งข้อมูล บางข้อความชื่อเป็นชื่อในวงการ ชื่อที่เคยใช้ หรือมีตัวสะกดต่างจากหน้าประวัติ จึงแยกชื่อที่ใช้คำนวณออกจากชื่อบุคคลอ้างอิง</p><p>ชื่อเดียวอาจตรงกับหลายบุคคล ภาพ เครดิต บทบาท และแหล่งประวัติจะเปลี่ยนตามบุคคลที่เลือก ไม่ใช้ภาพหรือข้อมูลของอีกคนแทน รายการที่ยังยืนยันไม่ได้หรือมีเงื่อนไขที่ต้องตรวจเพิ่มเติมจะพักการเผยแพร่</p><p>เนื้อหานี้ไม่เผยแพร่วันเกิดจริง ที่อยู่ เบอร์ติดต่อ ข้อมูลครอบครัว หรือข้อมูลจากประวัติการศึกษาเพื่อจับคู่ตัวบุคคล ผลความเหมาะสมตามวันเกิดในบทความเป็นการทดลองชื่อกับแต่ละวันตามเกณฑ์ของเว็บ</p></section>
            <section><h2>ภาพ เครดิต และหลักฐานใบอนุญาต</h2><p>ภาพประกอบที่แสดงมีเครดิต ลิงก์หน้าไฟล์ และลิงก์ใบอนุญาต พร้อมหน้าข้อมูลภาพฉบับที่ตรวจและวันที่ตรวจในเมนู “ข้อมูลอ้างอิงและภาพประกอบ” ของการ์ด</p><ul><li>กรณีผู้เผยแพร่ระบุว่าเป็นผลงานของตน เราแสดงสถานะตามคำประกาศนั้น</li><li>กรณีภาพจากเว็บไซต์ภายนอก เราตรวจว่ามีบันทึกการทบทวนใบอนุญาตใน Wikimedia Commons</li><li>ภาพที่ยังรอทบทวน มีข้อสงสัยเรื่องสิทธิ หรือหลักฐานยังไม่ครบ จะใช้ช่องพักภาพแทน</li></ul><p>ภาพอาจถูกปรับขนาดและจัดกรอบเพื่อแสดงผล โดยระบุไว้ข้างภาพ เงื่อนไขใบอนุญาตแต่ละภาพอาจแตกต่างกัน</p><p>{policy.imageScope} การให้เครดิตหรือมีภาพอยู่ใน Commons ไม่ใช่การรับรองว่าสิทธิทุกประเภทครบถ้วนสำหรับทุกวัตถุประสงค์</p><p><a href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noopener noreferrer">เงื่อนไข CC BY 3.0</a> · <a href="https://commons.wikimedia.org/wiki/Commons:Reusing_content_outside_Wikimedia" target="_blank" rel="noopener noreferrer">แนวทางนำภาพ Commons ไปใช้ต่อ</a></p></section>
            <section id="requests" className={styles.requestSection}><h2>ขอแก้ไขข้อมูลหรือแจ้งสิทธิ์ภาพ</h2><p>เจ้าของข้อมูล เจ้าของสิทธิ หรือผู้มีอำนาจแทน สามารถแจ้งแก้ไข คัดค้าน ขอระงับหรือถอดข้อมูลและภาพ ผ่าน LINE Official Account ที่เว็บไซต์ใช้อยู่</p><ol><li>ระบุ URL ของหน้าและรายการที่เกี่ยวข้อง</li><li>อธิบายสิ่งที่ขอแก้ไขหรือข้อกังวลเรื่องสิทธิ พร้อมแหล่งอ้างอิงถ้ามี</li><li>แจ้งช่องทางติดต่อกลับ และความเกี่ยวข้องกับข้อมูลหรือภาพเท่าที่จำเป็น</li></ol><p>ไม่ต้องส่งบัตรประชาชน ข้อมูลการเงิน หรือข้อมูลส่วนตัวที่ไม่เกี่ยวข้องในการแจ้งครั้งแรก หากจำเป็นต้องยืนยันสิทธิ ทีมงานจะประสานขอข้อมูลเพิ่มเติมเฉพาะที่จำเป็น</p><p>ทีมงานจะพิจารณาตรวจสอบและตอบกลับตามเงื่อนไขที่กฎหมายกำหนด รายการที่มีข้อสงสัยสามารถพักการเผยแพร่ระหว่างตรวจสอบได้</p><a href={policy.contactUrl} target="_blank" rel="noopener noreferrer" className={styles.primaryLink}>ติดต่อเรื่องข้อมูลหรือสิทธิ์ภาพ <ArrowUpRight size={18} aria-hidden="true" /></a><p><Link href="/privacy#editorial-data">ข้อมูลอ้างอิงในนโยบายความเป็นส่วนตัว</Link></p></section>
        </div>
    </main>;
}
