'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, BadgeCheck, CalendarDays, ChevronDown, Clock3, LockKeyhole, UsersRound } from 'lucide-react';
import type { PremiumNameData } from '@/utils/premiumDataParser';
import { useLanguage } from '@/components/LanguageProvider';
import styles from './PremiumNameCard.module.css';

interface NameCardProps {
    item: PremiumNameData;
    isUnlocked: boolean;
    onUnlock?: () => void;
    isUnlocking?: boolean;
    unlockGroup?: string;
}

const DAYS: Record<string, { key: string; tone: string }> = {
    'อาทิตย์': { key: 'sunday', tone: 'sun' },
    'จันทร์': { key: 'monday', tone: 'mon' },
    'อังคาร': { key: 'tuesday', tone: 'tue' },
    'พุธ(กลางวัน)': { key: 'wednesday', tone: 'wed' },
    'พุธ(กลางคืน)': { key: 'wednesday_night', tone: 'night' },
    'พฤหัสบดี': { key: 'thursday', tone: 'thu' },
    'ศุกร์': { key: 'friday', tone: 'fri' },
    'เสาร์': { key: 'saturday', tone: 'sat' },
};
const GENDERS = { male: 'ชาย', female: 'หญิง', neutral: 'ไม่ระบุ' };

export default function PremiumNameCard({ item, isUnlocked, onUnlock, isUnlocking = false, unlockGroup }: NameCardProps) {
    const { t } = useLanguage();
    const hasPronunciation = Boolean(item.pronunciation?.trim());
    const hasMeaning = Boolean(item.meaning?.trim());
    const hasDetails = hasPronunciation || hasMeaning;
    const reviewStatuses = [item.pronunciationStatus, item.meaningStatus].filter(Boolean);
    const pending = reviewStatuses.some(status => status === 'pending' || status === 'draft');
    const approved = hasPronunciation && hasMeaning && reviewStatuses.length === 2
        && reviewStatuses.every(status => status === 'approved');
    const previewPairs = item.scoreBreakdown.slice(0, 4);
    const remainingPairs = item.scoreBreakdown.length - previewPairs.length;
    const reviewLabel = pending ? 'ข้อมูลเบื้องต้น · รอตรวจสอบ' : approved ? 'ตรวจสอบแล้ว' : 'ข้อมูลตามต้นทาง';

    return (
        <article className={styles.card} data-locked={!isUnlocked || undefined}>
            {!isUnlocked ? <div className={styles.lockLayer}>{onUnlock ? <button type="button" className={styles.lockButton} onClick={onUnlock} disabled={isUnlocking} aria-label={`ปลดล็อกรายชื่อหมวด ${unlockGroup || ''} 15 เครดิต`}><span><LockKeyhole size={15} aria-hidden="true" />{isUnlocking ? 'กำลังดำเนินการ…' : 'ปลดล็อกชุดนี้'}</span><small>15 เครดิต · สูงสุด 20 รายชื่อ</small></button> : <span><LockKeyhole size={15} aria-hidden="true" />ปลดล็อกเพื่อดูชื่อ</span>}</div> : null}
            <div className={styles.content} aria-hidden={!isUnlocked} inert={!isUnlocked || undefined}>
                <header className={styles.identity}>
                    <div className={styles.titleRow}>
                        <h3 className={styles.name}>{item.name}</h3>
                        <span className={styles.score} aria-label={`ผลรวมชื่อ ${item.totalScore}`}>เลข <strong>{item.totalScore}</strong></span>
                    </div>
                    <p className={styles.reading}>
                        {item.englishName ? <span lang="en"><span className={styles.srOnly}>ชื่อภาษาอังกฤษ </span>{item.englishName}</span> : null}
                        {item.englishName && hasPronunciation ? <span aria-hidden="true"> · </span> : null}
                        {hasPronunciation ? <span><span className={styles.srOnly}>อ่านว่า </span>{item.pronunciation}</span> : null}
                        {!item.englishName && !hasPronunciation ? <span className={styles.missing}>คำอ่านอยู่ระหว่างจัดทำ</span> : null}
                    </p>
                    <p className={`${styles.meaning} ${hasMeaning ? '' : styles.missing}`}>{item.meaning || 'กำลังจัดทำรายละเอียดชื่อ'}</p>
                    <div className={styles.review}>
                        {hasDetails ? <span title={reviewLabel}>{approved ? <BadgeCheck size={12} aria-hidden="true" /> : pending ? <Clock3 size={12} aria-hidden="true" /> : null}{reviewLabel}</span> : null}
                    </div>
                </header>

                <div className={styles.facts}>
                    <section className={styles.days} aria-label="วันเกิดที่เหมาะสม">
                        <div className={styles.factHeading}><p className={styles.label}><CalendarDays size={13} aria-hidden="true" />เหมาะกับวันเกิด</p>{item.gender !== 'neutral' ? <span className={styles.gender}><UsersRound size={13} aria-hidden="true" />{GENDERS[item.gender]}</span> : null}</div>
                        <div className={styles.tags}>
                            {item.suitableDays.length ? item.suitableDays.map((day, index) => {
                                const config = DAYS[day];
                                const label = config ? t(`pages.premiumSearch.days.${config.key}`).replace(/^วัน/, '') : day;
                                return <span key={`${day}-${index}`} className={styles.day} data-day={config?.tone}>{label}</span>;
                            }) : <span className={styles.missing}>ยังไม่มีข้อมูลวันเกิด</span>}
                        </div>
                    </section>
                    <div className={styles.pairs} aria-label="ตัวอย่างคู่เลข">
                        <span className={styles.label}>คู่เลข</span>
                        <div className={styles.pairValues}>{previewPairs.map((pair, index) => <span key={`${pair}-${index}`}>{pair}</span>)}
                            {remainingPairs > 0 ? <span className={styles.morePairs}>+{remainingPairs}<span className={styles.srOnly}> คู่ ดูทั้งหมดในรายละเอียด</span></span> : null}
                            {!previewPairs.length ? <span className={styles.missing}>ยังไม่มีข้อมูล</span> : null}
                        </div>
                    </div>
                </div>

                {isUnlocked ? <footer className={styles.actions}>
                    <Link prefetch={false} href={`/name-check?${new URLSearchParams({ name: item.name })}`} className={styles.analyze} aria-label={`วิเคราะห์ชื่อ ${item.name}`}>วิเคราะห์ชื่อ<ArrowUpRight size={15} aria-hidden="true" /></Link>
                    <details className={styles.details}>
                        <summary aria-label={`รายละเอียดชื่อ ${item.name}`}><span className={styles.whenClosed}>รายละเอียด</span><span className={styles.whenOpen}>ย่อรายละเอียด</span><ChevronDown size={15} aria-hidden="true" /></summary>
                        <div className={styles.extra}>
                            <dl>
                                <div><dt>ชื่อภาษาอังกฤษ</dt><dd lang="en">{item.englishName || '—'}</dd><dd className={styles.note}>{item.englishName ? 'ตัวเลือกการสะกดตามต้นทาง ควรยืนยันก่อนใช้ในเอกสาร' : 'ยังไม่มีข้อมูล'}</dd></div>
                                <div><dt>คำอ่าน</dt><dd>{item.pronunciation || 'กำลังจัดทำคำอ่าน'}</dd>{item.pronunciationVariants?.length ? <dd className={styles.note}>อ่านได้อีกแบบ: {item.pronunciationVariants.join(', ')}</dd> : null}</div>
                                <div><dt>ความหมาย</dt><dd>{item.meaning || 'กำลังจัดทำความหมาย'}</dd></div>
                                <div><dt>หมวดชื่อ</dt><dd>{GENDERS[item.gender]}</dd></div>
                                <div><dt>สถานะข้อมูลภาษา</dt><dd className={styles.note}>{hasDetails ? reviewLabel : 'อยู่ระหว่างจัดทำ'}</dd></div>
                                <div><dt>คู่เลขทั้งหมด</dt><dd className={styles.allPairs}>{item.scoreBreakdown.length ? item.scoreBreakdown.map((pair, index) => <span key={`${pair}-${index}`}>{pair}</span>) : 'ยังไม่มีข้อมูล'}</dd></div>
                            </dl>
                        </div>
                    </details>
                </footer> : null}
            </div>
        </article>
    );
}
