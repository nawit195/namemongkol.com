import { LockKeyhole } from 'lucide-react';
import {
    NICKNAME_BATCH_SIZE,
    NICKNAME_UNLOCK_COST,
} from '@/lib/auspiciousNicknameShared';
import styles from './nicknames.module.css';

export default function NicknameLockedCard({
    index,
    onUnlock,
    disabled,
}: {
    index: number;
    onUnlock: () => void;
    disabled: boolean;
}) {
    return (
        <article
            className={`${styles.card} ${styles.lockedCard}`}
            aria-label={`ชื่อเล่น A+ ที่รอปลดล็อก รายการที่ ${index + 1}`}
        >
            {/* Decorative shapes only: no private nickname is sent behind the blur. */}
            <div className={styles.lockedPreview} aria-hidden="true">
                <div className={styles.lockedPreviewHeading}>
                    <i />
                    <i />
                </div>
                <div className={styles.lockedPreviewLine} />
                <div className={styles.lockedPreviewShortLine} />
                <div className={styles.lockedPreviewDays}>
                    <i />
                    <i />
                    <i />
                </div>
                <div className={styles.lockedPreviewLine} />
                <div className={styles.lockedPreviewActions}>
                    <i />
                    <i />
                </div>
            </div>
            <div className={styles.lockOverlay}>
                <button
                    type="button"
                    className={styles.lockButton}
                    onClick={onUnlock}
                    disabled={disabled}
                >
                    <span>
                        <LockKeyhole size={15} aria-hidden="true" />
                        ปลดล็อกชุดนี้
                    </span>
                    <small>
                        {NICKNAME_UNLOCK_COST} เครดิต · สูงสุด{' '}
                        {NICKNAME_BATCH_SIZE} รายชื่อ
                    </small>
                </button>
            </div>
        </article>
    );
}
