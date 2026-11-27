'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, BadgeCheck, CalendarDays, LockKeyhole, UsersRound } from 'lucide-react';
import type { PremiumNameData } from '@/utils/premiumDataParser';
import { analyzePairs } from '@/utils/analyzePairs';
import { calculateGrade } from '@/utils/gradeResult';
import { useLanguage } from '@/components/LanguageProvider';
import { FavoriteButton } from '@/components/names/NamingProvider';
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
    const grade = calculateGrade(item.totalScore, analyzePairs(item.name));
    const hasPronunciation = Boolean(item.pronunciation?.trim());
    const hasMeaning = Boolean(item.meaning?.trim());
    const hasDetails = hasPronunciation || hasMeaning;
    const reviewStatuses = [item.pronunciationStatus, item.meaningStatus].filter(Boolean);
    const pending = reviewStatuses.some(status => status === 'pending' || status === 'draft');
    const approved = hasPronunciation && hasMeaning && reviewStatuses.length === 2
        && reviewStatuses.every(status => status === 'approved');
    const reviewLabel = pending ? null : approved ? 'ตรวจสอบแล้ว' : 'ข้อมูลตามต้นทาง';

    return (
        <article className={styles.card} data-locked={!isUnlocked || undefined}>
            {!isUnlocked ? <div className={styles.lockLayer}>{onUnlock ? <button type="button" className={styles.lockButton} onClick={onUnlock} disabled={isUnlocking} aria-label={`ปลดล็อกรายชื่อหมวด ${unlockGroup || ''} 15 เครดิต`}><span><LockKeyhole size={15} aria-hidden="true" />{isUnlocking ? 'กำลังดำเนินการ…' : 'ปลดล็อกชุดนี้'}</span><small>15 เครดิต · สูงสุด 20 รายชื่อ</small></button> : <span><LockKeyhole size={15} aria-hidden="true" />ปลดล็อกเพื่อดูชื่อ</span>}</div> : null}
            <div className={styles.content} aria-hidden={!isUnlocked} inert={!isUnlocked || undefined}>
                <header className={styles.identity}>
                    <div className={styles.titleRow}>
                        <div className={styles.nameGroup}>
                            <h3 className={styles.name}>{item.name}</h3>
                            <span className={styles.grade} data-grade={grade} aria-label={`เกรดชื่อ ${grade}`} title="เกรดจากผลรวมชื่อและคู่เลข">เกรด <strong>{grade}</strong></span>
                        </div>
                        <span className={styles.score} aria-label={`ผลรวมชื่อ ${item.totalScore}`}>เลข <strong>{item.totalScore}</strong></span>
                    </div>
                    <p className={styles.reading}>
                        {item.englishName ? <span lang="en"><span className={styles.srOnly}>ชื่อภาษาอังกฤษ </span>{item.englishName}</span> : null}
                        {item.englishName && hasPronunciation ? <span aria-hidden="true"> · </span> : null}
                        {hasPronunciation ? <span><span className={styles.srOnly}>อ่านว่า </span>{item.pronunciation}</span> : null}
                        {!item.englishName && !hasPronunciation ? <span className={styles.missing}>กำลังจัดทำคำอ่าน</span> : null}
                    </p>
                    {item.pronunciationVariants?.length ? <p className={styles.reading}>อ่านได้อีกแบบ: {item.pronunciationVariants.join(', ')}</p> : null}
                    <p className={`${styles.meaning} ${hasMeaning ? '' : styles.missing}`}>{item.meaning || 'กำลังจัดทำความหมาย'}</p>
                    {hasDetails && reviewLabel ? <div className={styles.review}>
                        <span title={reviewLabel}>{approved ? <BadgeCheck size={12} aria-hidden="true" /> : null}{reviewLabel}</span>
                    </div> : null}
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
                    <div className={styles.pairs} aria-label="คู่เลขทั้งหมด">
                        <span className={styles.label}>คู่เลข</span>
                        <div className={styles.pairValues}>{item.scoreBreakdown.map((pair, index) => <span key={`${pair}-${index}`}>{pair}</span>)}
                            {!item.scoreBreakdown.length ? <span className={styles.missing}>ยังไม่มีข้อมูล</span> : null}
                        </div>
                    </div>
                </div>

                {isUnlocked ? <footer className={styles.actions}>
                    <Link prefetch={false} href={`/name-check?${new URLSearchParams({ name: item.name })}`} className={styles.analyze} aria-label={`วิเคราะห์ชื่อ ${item.name}`}>วิเคราะห์ชื่อ<ArrowUpRight size={15} aria-hidden="true" /></Link>
                    <FavoriteButton name={item.name} kind="thai" />
                </footer> : null}
            </div>
        </article>
    );
}
