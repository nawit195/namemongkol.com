import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { babyNamingCategories, namingBirthdayLinks } from '@/data/babyNaming';
import { siteUrl } from '@/lib/seo';
import styles from './naming.module.css';
export type NamingCrumb = { href: string; label: string };
export function NamingNavigation({
    backHref,
    backLabel,
    crumbs,
    current,
}: {
    backHref: string;
    backLabel: string;
    crumbs: NamingCrumb[];
    current: string;
}) {
    return (
        <div className={styles.navigation}>
            <Link href={backHref} className={styles.back}>
                <ArrowLeft size={17} aria-hidden="true" />
                {backLabel}
            </Link>
            <nav
                aria-label="เส้นทางหน้าปัจจุบัน"
                className={styles.breadcrumbs}
            >
                {crumbs.map((crumb) => (
                    <span key={crumb.href}>
                        <Link href={crumb.href}>{crumb.label}</Link>
                        <span aria-hidden="true"> / </span>
                    </span>
                ))}
                <span aria-current="page">{current}</span>
            </nav>
        </div>
    );
}
export function NamingShell({
    title,
    description,
    image,
    imageAlt,
    backHref,
    backLabel,
    crumbs,
    children,
    eyebrow = 'เลือกชื่อด้วยความหมายที่ครอบครัวชอบ',
}: {
    title: string;
    description: string;
    image: string;
    imageAlt: string;
    backHref: string;
    backLabel: string;
    crumbs: NamingCrumb[];
    children: ReactNode;
    eyebrow?: string;
}) {
    return (
        <main className={styles.page}>
            <NamingNavigation
                backHref={backHref}
                backLabel={backLabel}
                crumbs={crumbs}
                current={title}
            />
            <header className={styles.hero}>
                <div>
                    <p className={styles.eyebrow}>{eyebrow}</p>
                    <h1>{title}</h1>
                    <p>{description}</p>
                </div>
                <div className={styles.heroImage}>
                    <Image
                        src={image}
                        alt={imageAlt}
                        fill
                        sizes="(max-width: 600px) 100vw, 420px"
                        loading="eager"
                    />
                </div>
            </header>
            {children}
        </main>
    );
}
export function NamingCategories({ gender, currentHref }: { gender?: 'boys' | 'girls'; currentHref?: string }) {
    const items = gender
        ? babyNamingCategories.filter((item) =>
              item.href.startsWith(`/names/${gender}`),
          )
        : babyNamingCategories;
    return (
        <section className={styles.section}>
            <h2>เลือกหมวดชื่อที่อยากเริ่มดู</h2>
            <div className={styles.categoryGrid}>
                {items.filter(item => item.href !== currentHref).map((item) => (
                    <Link
                        prefetch={false}
                        key={item.href}
                        href={item.href}
                        className={styles.category}
                        data-track="names.category_select"
                        data-track-meta={JSON.stringify({kind:item.href.includes('nicknames')?'nickname':item.href.includes('english-names')?'english':'thai',count:1})}
                    >
                        <Image
                            src={item.image}
                            alt={item.imageAlt}
                            width={90}
                            height={112}
                        />
                        <div>
                            <strong>{item.label} →</strong>
                            <p>{item.text}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
export function NamingDays({ gender }: { gender?: 'boys' | 'girls' }) {
    return (
        <section className={styles.section} id="naming-birthdays">
            <h2>เลือกชื่อตามวันเกิด</h2>
            <div className={styles.dayLinks}>
                {namingBirthdayLinks.map(([day, label]) => (
                    <Link
                        key={day}
                        data-track="names.category_select"
                        data-track-meta={JSON.stringify({kind:'birthday',count:1})}
                        href={
                            gender === 'girls' && day === 'monday'
                                ? '/articles/monday-girl-names-2569-no-sara'
                                : `/names/${gender ? gender + '/' : ''}by-birthday/${day}`
                        }
                    >
                        {label}
                    </Link>
                ))}
            </div>
            <p>
                ยังไม่รู้วันเกิด เริ่มเลือกจากความหมายและเสียงอ่านก่อนได้
                ทักษาเป็นทางเลือกตามความเชื่อ
            </p>
        </section>
    );
}
export function NamingNextStep() {
    return (
        <aside className={styles.cta}>
            <h2>มีชื่อที่ชอบแล้ว ลองอ่านคู่กับนามสกุล</h2>
            <p>
                ตรวจผลรวม คู่เลข และทักษาในเครื่องมือฟรี โดยไม่ต้องสมัคร
                ผลเป็นข้อมูลตามความเชื่อประกอบการพิจารณา
            </p>
            <Link href="/name-check">วิเคราะห์ชื่อและนามสกุลฟรี →</Link>
        </aside>
    );
}
export function NamingJsonLd({ value }: { value: unknown }) {
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
                __html: JSON.stringify(value).replace(/</g, '\\u003c'),
            }}
        />
    );
}
export function namingBreadcrumbSchema(crumbs: NamingCrumb[]) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: crumbs.map((crumb, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: crumb.label,
            item: siteUrl + crumb.href,
        })),
    };
}
