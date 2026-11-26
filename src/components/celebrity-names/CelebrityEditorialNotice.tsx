import Link from 'next/link';
import { Info } from 'lucide-react';
import { celebrityEditorialPolicy as policy } from '@/data/celebrityEditorialPolicy';
import styles from './celebrity-names.module.css';

export function CelebrityEditorialNotice() {
    return <aside className={styles.notice} aria-label="ขอบเขตของกรณีศึกษา">
        <Info size={20} aria-hidden="true" />
        <div>
            <strong>ตัวอย่างอธิบายวิธีคำนวณชื่อ</strong>
            <p>{policy.gradeScope}</p>
            <p>{policy.nonEndorsement}</p>
            <div className={styles.noticeLinks}>
                <Link href={policy.path}>แนวทางข้อมูลและภาพประกอบ</Link>
                <Link href={`${policy.path}#requests`}>ขอแก้ไขหรือถอดข้อมูล</Link>
            </div>
        </div>
    </aside>;
}
