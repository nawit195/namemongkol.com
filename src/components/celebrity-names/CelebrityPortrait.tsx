'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { CelebrityPortrait as PortraitData } from '@/data/celebrityNames';
import styles from './celebrity-names.module.css';

export function CelebrityPortrait({ portrait, nickname, awaitingEvidence = false }: { portrait: PortraitData | null; nickname: string; awaitingEvidence?: boolean }) {
    const [failedSrc, setFailedSrc] = useState<string | null>(null);
    return <div className={styles.portraitFrame}>
        {!portrait ? <div className={styles.portraitFallback} role="img" aria-label={`ยังไม่แสดงภาพของ${nickname}`}><strong>{nickname}</strong><span>{awaitingEvidence ? 'พักภาพระหว่างตรวจหลักฐานเพิ่มเติม' : 'ยังไม่มีภาพประกอบที่พร้อมแสดง'}</span></div> : failedSrc === portrait.src ?
            <div className={styles.portraitFallback} role="img" aria-label={`ไม่สามารถโหลดภาพของ${nickname}`}><strong>{nickname}</strong><span>ไม่สามารถโหลดภาพได้</span></div> :
            <Image src={portrait.src} alt={portrait.alt} fill sizes="(max-width: 600px) 85vw, (max-width: 1023px) 46vw, 360px" className={styles.portraitImage} style={{ objectPosition: portrait.objectPosition }} onError={() => setFailedSrc(portrait.src)} />}
    </div>;
}
