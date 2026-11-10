import type { Metadata } from 'next';
import Link from 'next/link';
import { fetchAllPublicNames } from '@/lib/publicNames';
import { prepareReviewedNames } from '@/lib/reviewedNames';
import { publicNameChoice } from '@/lib/nameChoices';
import { siteUrl } from '@/lib/seo';
import {
    babyNamingTitle,
    babyNamingDescription,
    selectBabyNameExamples,
} from '@/data/babyNaming';
import {
    NamingShell,
    NamingCategories,
    NamingDays,
    NamingNextStep,
    NamingJsonLd,
    namingBreadcrumbSchema,
} from '@/components/names/NamingShell';
import { NamingGuide } from '@/components/names/NamingGuide';
import { NameBrowser } from '@/components/names/NameBrowser';
import styles from '@/components/names/naming.module.css';
export const revalidate = 600;
const pageUrl = `${siteUrl}/names`;

export const metadata: Metadata = {
    title: { absolute: babyNamingTitle },
    description: babyNamingDescription,
    alternates: { canonical: pageUrl },
    openGraph: {
        title: babyNamingTitle,
        description: babyNamingDescription,
        url: pageUrl,
        locale: 'th_TH',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: babyNamingTitle,
        description: babyNamingDescription,
    },
};

export default async function BabyNamesPage() {
    const examples = selectBabyNameExamples(
        prepareReviewedNames(await fetchAllPublicNames(true)),
    );
    return (
        <NamingShell
            title="ตั้งชื่อลูก พร้อมความหมายและแนวทางเลือกชื่อ"
            description={babyNamingDescription}
            image="/images/names/family-hero-v1.webp"
            imageAlt="พ่อแม่ประคองทารกที่นอนหลับในบรรยากาศอบอุ่น"
            backHref="/"
            backLabel="กลับหน้าแรก"
            crumbs={[{ href: '/', label: 'หน้าแรก' }]}
        >
            <NamingJsonLd
                value={{
                    '@context': 'https://schema.org',
                    '@type': 'CollectionPage',
                    '@id': pageUrl + '#webpage',
                    url: pageUrl,
                    name: babyNamingTitle,
                    description: babyNamingDescription,
                    inLanguage: 'th-TH',
                    author: {
                        '@type': 'Organization',
                        name: 'ทีมงาน NameMongkol',
                        url: siteUrl + '/about',
                    },
                }}
            />
            <NamingJsonLd
                value={namingBreadcrumbSchema([
                    { href: '/', label: 'หน้าแรก' },
                    { href: '/names', label: 'ตั้งชื่อลูก' },
                ])}
            />
            <NamingCategories />
            <NamingDays />
            {examples.length ? (
                <NameBrowser
                    initialItems={examples.map(publicNameChoice)}
                    title={`${examples.length} ตัวอย่างชื่อลูกพร้อมความหมาย`}
                    description="ตัวอย่างจากหมวดคัดสรรเดิม คำอ่านแสดงเมื่ออนุมัติแล้ว คะแนนคำนวณใหม่จากชื่อจริงด้วยสูตรเดียวกับเครื่องมือวิเคราะห์"
                />
            ) : (
                <p className={styles.empty}>
                    กำลังเตรียมตัวอย่างที่ตรวจสอบความหมายแล้ว
                </p>
            )}
            <div className={styles.dayLinks}>
                <Link href="/names/boys">
                    ดูรายชื่อลูกชายและชื่อใช้ได้ทุกเพศ →
                </Link>
                <Link href="/names/girls">
                    ดูรายชื่อลูกสาวและชื่อใช้ได้ทุกเพศ →
                </Link>
            </div>
            <NamingGuide />
            <NamingNextStep />
        </NamingShell>
    );
}
