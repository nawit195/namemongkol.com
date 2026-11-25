import React from 'react';
import Link from 'next/link';
import styles from './namingIntentLinks.module.css';

const journeys = {
    search: {
        title: 'ค้นหาชื่อจริง แล้วตรวจร่วมกับนามสกุล',
        description: 'หน้านี้ใช้สำรวจชื่อจริงจากความหมาย วันเกิด และเงื่อนไขที่สนใจ หากกำลังตั้งชื่อลูกหรือเลือกชื่อเล่น มีหมวดเฉพาะให้เริ่มได้ตรงความต้องการ',
        links: [
            { href: '/meaning', label: 'อ่านความหมายชื่อและที่มาของข้อมูล' },
            { href: '/name-check', label: 'วิเคราะห์ชื่อและนามสกุลฟรี' },
            { href: '/names', label: 'คู่มือตั้งชื่อลูกพร้อมความหมาย' },
            { href: '/nicknames', label: 'ค้นหาชื่อเล่นมงคลตามวันเกิด' },
        ],
    },
    baby: {
        title: 'เลือกชื่อจริงและชื่อเล่นให้ลูกได้คนละแนว',
        description: 'ชื่อจริงอาจสะท้อนความหมายที่ครอบครัวให้คุณค่า ส่วนชื่อเล่นอาจเลือกจากเสียงเรียกหรือเรื่องราวที่ชอบ หมวดชื่อเล่นต่อไปนี้คัดจากชุดข้อมูลชื่อเล่นแยกจากฐานชื่อจริง และแสดงความหมายกับเกณฑ์ต้นฉบับ',
        links: [
            { href: '/nicknames/meaning/happiness', label: 'ชื่อเล่นสื่อถึงความสุขและความยินดี' },
            { href: '/nicknames/unisex', label: 'ชื่อเล่นใช้ได้ทุกเพศพร้อมความหมาย' },
            { href: '/articles/name-meaning-vs-numerology', label: 'เลือกอย่างไรเมื่อความหมายที่ชอบกับผลรวมไม่ตรงใจ' },
        ],
    },
    analysis: {
        title: 'หลังวิเคราะห์ชื่อ ควรเลือกขั้นตอนใดต่อ',
        description: 'หากยังใช้ชื่อเดิมได้ตามความพอใจ ไม่จำเป็นต้องเปลี่ยนชื่อจากคะแนนเพียงอย่างเดียว หากต้องการตัวเลือกเพิ่ม ให้คัดชื่อจริงที่ชอบก่อน แล้วเปรียบเทียบทั้งความหมาย เสียงอ่าน และนามสกุลร่วมกัน',
        links: [
            { href: '/search', label: 'ค้นหาตัวเลือกชื่อจริงพร้อมความหมาย' },
            { href: '/compare-names', label: 'เปรียบเทียบชื่อจริงที่เลือกไว้' },
            { href: '/articles/name-meaning-vs-numerology', label: 'คู่มือพิจารณาความหมายร่วมกับผลรวมชื่อ' },
        ],
    },
    premium: {
        title: 'Pro ใช้คัดชื่อจริงสำหรับการเปลี่ยนชื่อ',
        description: 'หากต้องการชื่อเรียกสั้น ๆ ให้เริ่มจากหมวดชื่อเล่นโดยเฉพาะ เกรดในชุดข้อมูลชื่อเล่นเป็นข้อมูลคนละชุดกับผลวิเคราะห์ชื่อจริง การเปิดชื่อ Pro ไม่ใช่ข้อจำเป็นสำหรับการเลือกชื่อเล่น',
        links: [
            { href: '/nicknames', label: 'เลือกชื่อเล่นมงคลและตัวอย่างดูฟรี' },
            { href: '/name-check', label: 'ตรวจชื่อจริงและนามสกุลปัจจุบันฟรี' },
        ],
    },
} as const;

/** Server-rendered next steps, with a distinct purpose for each search landing page. */
export function NamingIntentLinks({ context }: { context: keyof typeof journeys }) {
    const journey = journeys[context];
    return (
        <nav className={styles.navigation} aria-labelledby={`naming-intent-${context}`}>
            <h2 id={`naming-intent-${context}`}>{journey.title}</h2>
            <p>{journey.description}</p>
            <ul>{journey.links.map(link => <li key={link.href}><Link prefetch={false} href={link.href}>{link.label}<span aria-hidden="true"> ↗</span></Link></li>)}</ul>
        </nav>
    );
}
