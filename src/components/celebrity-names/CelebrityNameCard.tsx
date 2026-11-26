'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Check } from 'lucide-react';
import type { CelebrityCardData } from '@/types/celebrityCatalog';
import { celebrityAnalysisHref, defaultCelebrityPerson } from '@/lib/celebrityCatalogSearch';
import { CelebrityPortrait } from './CelebrityPortrait';
import { celebrityEditorialPolicy } from '@/data/celebrityEditorialPolicy';
import styles from './celebrity-names.module.css';

export function CelebrityNameCard({ entry, initialPersonId }: { entry: CelebrityCardData; initialPersonId?: string }) {
    const [personId, setPersonId] = useState(initialPersonId ?? defaultCelebrityPerson(entry).id);
    const person = entry.people.find(person => person.id === personId) ?? defaultCelebrityPerson(entry);
    const href = entry.articleHref ?? celebrityAnalysisHref(entry.name);
    return <article className={styles.card} id={entry.slug}>
        <figure className={styles.portrait}>
            <CelebrityPortrait portrait={person.portrait} nickname={person.nickname} awaitingEvidence={person.portraitStatus === 'awaiting-evidence'} />
            <figcaption className={styles.photoCredit}>
                {person.portrait ? <>
                    <a href={person.portrait.sourceUrl} target="_blank" rel="noopener noreferrer">ภาพ: {person.portrait.credit}</a>
                    <span aria-hidden="true"> · </span>
                    <a href={person.portrait.licenseUrl} target="_blank" rel="noopener noreferrer">{person.portrait.license}</a>
                    <span> · ปรับขนาดและจัดกรอบภาพ</span>
                </> : 'ข้อมูลอ้างอิงของชื่อ แสดงโดยไม่มีภาพประกอบ'}
            </figcaption>
        </figure>
        <div className={styles.cardBody}>
            <div className={styles.cardTop}>
                <h3 className={styles.personName}>{entry.name}</h3>
                <span className={styles.grade} aria-label={`เกรดชื่อ ${entry.name} A+ ตามเกณฑ์ NameMongkol`}>เกรดชื่อ A+</span>
            </div>
            <p className={styles.fullName}>บุคคลอ้างอิง: {person.nickname}{person.nickname !== person.referenceName ? ` · ${person.referenceName}` : ''}</p>
            {entry.people.length > 1 && <div className={styles.personSelector}>
                <label htmlFor={`${entry.slug}-person`}>บุคคลที่ใช้ชื่อ “{entry.name}” · {entry.people.length} รายการ</label>
                <select id={`${entry.slug}-person`} value={person.id} onChange={event => setPersonId(event.target.value)}>
                    {entry.people.map(option => <option key={option.id} value={option.id}>{option.nickname} · {option.referenceName}</option>)}
                </select>
            </div>}
            {person.occupations.length > 0 && <p className={styles.occupations}>{person.occupations.join(' · ')}</p>}
            <p className={styles.reference}>
                {person.source ? <><a href={person.source.url} target="_blank" rel="noopener noreferrer" title={person.source.title}>ประวัติอ้างอิง</a>{person.roleSource && person.roleSource.url !== person.source.url && <> · <a href={person.roleSource.url} target="_blank" rel="noopener noreferrer" title={person.roleSource.title}>อ้างอิงบทบาท</a></>}</> : <span>รอยืนยันบุคคล · ข้อมูลชื่อตามไฟล์</span>}
            </p>
            <details className={styles.sourceDetails}>
                <summary>ข้อมูลอ้างอิงและภาพประกอบ</summary>
                <p>ชื่อที่คำนวณ: “{entry.name}” ตามชุดข้อมูล อาจเป็นชื่อในวงการหรือชื่อที่เคยใช้</p>
                <p>ตรวจแหล่งประวัติ: <time dateTime={person.checkedAt}>{person.checkedAt}</time></p>
                {person.portrait && person.portraitEvidence && <>
                    <p>ชื่อไฟล์ต้นทาง: {person.portraitEvidence.title}</p>
                    <p>{person.portraitEvidence.status === 'own-work-declaration' ? 'ผู้เผยแพร่ระบุว่าเป็นผลงานของตนและประกาศใบอนุญาต' : person.portraitEvidence.status === 'external-review-recorded' ? 'มีบันทึกการทบทวนใบอนุญาตจากแหล่งภายนอกใน Commons' : 'แหล่งภาพระบุสถานะสาธารณสมบัติ'}</p>
                    <p><a href={person.portraitEvidence.evidenceUrl} target="_blank" rel="noopener noreferrer">หลักฐานหน้าข้อมูลภาพ ณ วันที่ตรวจ</a> · <time dateTime={person.portraitEvidence.checkedAt}>{person.portraitEvidence.checkedAt}</time></p>
                </>}
                <p>{celebrityEditorialPolicy.imageScope}</p>
                <Link href={`${celebrityEditorialPolicy.path}#requests`} prefetch={false}>ขอแก้ไขข้อมูลหรือแจ้งสิทธิ์ภาพ</Link>
            </details>
            <div className={styles.cardFacts}>
                <span>ผลรวม “{entry.name}” <strong>{entry.sum}</strong></span>
                <span><Check size={15} aria-hidden="true" /> คู่เลขดี {entry.goodPairs}/{entry.pairCount}</span>
            </div>
            <Link href={href} prefetch={false} className={styles.cardLink}>
                {entry.articleHref ? 'ดูวิธีคำนวณชื่อนี้' : 'เปิดชื่อนี้ในเครื่องมือ'} <ArrowUpRight size={17} aria-hidden="true" />
                <span className={styles.srOnly}> {entry.name}</span>
            </Link>
            <p className={styles.analysisNote}>เกณฑ์เลขศาสตร์ตามความเชื่อของ NameMongkol{!entry.articleHref && <><br />โปรดระบุนามสกุลและวันเกิดที่ต้องการทดลองในฟอร์ม</>}</p>
        </div>
    </article>;
}
