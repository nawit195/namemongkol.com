'use client';

import Link from 'next/link';
import {
    ArrowUpRight,
    CalendarDays,
    Check,
    ChevronDown,
    Sparkles,
} from 'lucide-react';
import { FavoriteButton } from '@/components/names/NamingProvider';
import {
    NICKNAME_DAYS,
    NICKNAME_GENDERS,
} from '@/lib/auspiciousNicknameShared';
import type {
    NicknameFilters,
    VisibleNickname,
} from '@/types/auspiciousNickname';
import styles from './nicknames.module.css';

export default function NicknameCard({
    item,
    selectedDay,
}: {
    item: VisibleNickname;
    selectedDay: NicknameFilters['day'];
}) {
    const days = NICKNAME_DAYS.filter((day) =>
        item.suitableDays.includes(day.key),
    );
    const selected = days.find((day) => day.key === selectedDay);
    return (
        <article
            className={styles.card}
            data-grade={item.grade}
            aria-labelledby={`name-${item.id}`}
        >
            <div className={styles.cardHeading}>
                <div>
                    <h3 id={`name-${item.id}`}>{item.name}</h3>
                    <span className={styles.gender}>
                        {NICKNAME_GENDERS[item.gender]}
                    </span>
                </div>
                <div className={styles.badges}>
                    <span
                        className={
                            item.grade === 'A+'
                                ? styles.plusBadge
                                : styles.gradeBadge
                        }
                    >
                        {item.grade === 'A+' && (
                            <Sparkles size={12} aria-hidden="true" />
                        )}
                        เกรด {item.grade}
                    </span>
                    <span
                        className={styles.score}
                        aria-label={`เลขศาสตร์ ${item.numerology}`}
                    >
                        <span>เลข</span> <strong>{item.numerology}</strong>
                    </span>
                </div>
            </div>
            <p className={styles.meaning}>{item.meaning}</p>
            <details className={styles.facts}>
                <summary
                    className={styles.days}
                    aria-label={`วันเกิดและคู่เลขของชื่อ ${item.name}`}
                    title="เปิดข้อมูลวันเกิดและคู่เลข"
                >
                    <span className={styles.dayLabel}>
                        <CalendarDays size={14} aria-hidden="true" />
                        วันเกิด
                    </span>
                    {selected ? (
                        <span className={styles.selectedDay}>
                            <Check size={12} aria-hidden="true" />
                            {selected.label}
                        </span>
                    ) : (
                        <>
                            {days.slice(0, 3).map((day) => (
                                <span key={day.key} title={day.label}>
                                    {day.short}
                                </span>
                            ))}
                            {days.length > 3 && (
                                <span className={styles.moreDays}>
                                    +{days.length - 3} วัน
                                </span>
                            )}
                        </>
                    )}
                    <ChevronDown
                        size={14}
                        className={styles.dayChevron}
                        aria-hidden="true"
                    />
                </summary>
                <div className={styles.details}>
                    <h4>ความหมาย</h4>
                    <p>{item.meaning}</p>
                    <h4>วันเกิดที่ใช้ได้</h4>
                    <div className={styles.fullDays}>
                        {days.map((day) => (
                            <span key={day.key}>{day.label}</span>
                        ))}
                    </div>
                    <h4>คู่เลขตามข้อมูลต้นฉบับ</h4>
                    {item.pairs.length ? (
                        <>
                            <ol className={styles.pairs}>
                                {item.pairs.map((pair, index) => (
                                    <li
                                        key={`${index}-${pair.number}`}
                                        className={
                                            pair.status === 'green'
                                                ? styles.greenPair
                                                : styles.orangePair
                                        }
                                    >
                                        <span>{pair.number}</span>
                                        <span
                                            aria-label={
                                                pair.status === 'green'
                                                    ? 'สถานะสีเขียว'
                                                    : 'สถานะสีส้ม'
                                            }
                                        >
                                            {pair.status === 'green'
                                                ? '●'
                                                : '◆'}
                                        </span>
                                    </li>
                                ))}
                            </ol>
                            <p className={styles.sourceNote}>
                                เรียงตามคู่เลขและสถานะสีในชุดข้อมูลชื่อเล่น
                            </p>
                        </>
                    ) : (
                        <p className={styles.sourceNote}>
                            ยังไม่มีข้อมูลคู่เลข
                        </p>
                    )}
                    <p className={styles.sourceNote}>
                        เกรด {item.grade} และผลรวม {item.numerology}{' '}
                        อ้างอิงจากชุดข้อมูลชื่อเล่นมงคล
                    </p>
                </div>
            </details>
            <div className={styles.cardActions}>
                <Link
                    prefetch={false}
                    href={`/name-check?${new URLSearchParams({ name: item.name })}`}
                    className={styles.analyzeButton}
                    aria-label={`วิเคราะห์ชื่อ ${item.name}`}
                >
                    วิเคราะห์ชื่อ
                    <ArrowUpRight size={16} aria-hidden="true" />
                </Link>
                <FavoriteButton name={item.name} kind="nickname" />
            </div>
            {item.access === 'purchased' && (
                <span className={styles.accessNote}>
                    <Check size={12} aria-hidden="true" />
                    ปลดล็อกแล้ว
                </span>
            )}
            {item.access === 'preview' && (
                <span className={styles.accessNote}>ตัวอย่าง A+ ฟรี</span>
            )}
        </article>
    );
}
