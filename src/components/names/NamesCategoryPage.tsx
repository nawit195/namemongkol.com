import type { Metadata } from 'next';
import Link from 'next/link';
import { babyNamingCategories, namingBirthdayLinks } from '@/data/babyNaming';
import { boyNamesCurated } from '@/data/boyNamesCurated';
import { girlNamesCurated } from '@/data/girlNamesCurated';
import { nicknames } from '@/data/nicknames';
import { englishNames } from '@/data/englishNames';
import { fetchReviewedNamesDataset, queryPublicNames } from '@/lib/publicNames';
import { publicNameChoice, type NameChoice } from '@/lib/nameChoices';
import { reviewedNameKey, editorialNameKeys } from '@/lib/reviewedNames';
import { siteUrl } from '@/lib/seo';
import type { DayKey } from '@/types';
import { thaksaConfig } from '@/data/thaksaConfig';
import {
    NamingShell,
    NamingCategories,
    NamingDays,
    NamingNextStep,
    NamingJsonLd,
    namingBreadcrumbSchema,
} from './NamingShell';
import { NamingGuide } from './NamingGuide';
import { NameBrowser } from './NameBrowser';
import styles from './naming.module.css';
export type NamingGender = 'boys' | 'girls';
export type NamingMode =
    | 'given'
    | 'nicknames'
    | 'english-names'
    | 'by-birthday';
const labels = { boys: 'ลูกชาย', girls: 'ลูกสาว' };
const unique = <T extends { name: string }>(items: T[]) => [
    ...new Map(
        items.map((item) => [reviewedNameKey(item.name), item]),
    ).values(),
];
export function categoryCopy(gender: NamingGender, mode: NamingMode = 'given') {
    const suffix = mode === 'given' ? '' : `/${mode}`;
    const title =
        mode === 'nicknames'
            ? `ชื่อเล่น${labels[gender]} พร้อมความหมายและไอเดียเสียงเรียก`
            : mode === 'english-names'
              ? `ชื่อภาษาอังกฤษ${labels[gender]} พร้อมความหมายและที่มา`
              : mode === 'by-birthday'
                ? `ตั้งชื่อ${labels[gender]}ตามวันเกิด`
                : `ตั้งชื่อ${labels[gender]} พร้อมความหมาย`;
    const description =
        mode === 'nicknames'
            ? 'ค้นหาชื่อเล่นจากคำที่ชอบ กรองแนวชื่อและเก็บไว้คุยกับครอบครัว ชื่อใช้ได้ทุกเพศระบุแยกไว้ โดยไม่ผูกชื่อกับบุคลิกหรืออนาคต'
            : mode === 'english-names'
              ? 'เลือกชื่อภาษาอังกฤษจากความหมายและที่มา คำอ่านไทยเป็นเสียงโดยประมาณ ควรลองออกเสียงกับเจ้าของภาษาแล้วอ่านคู่กับนามสกุล'
              : mode === 'by-birthday'
                ? 'เลือกวันเกิดจริง รวมวันพุธกลางวันและกลางคืน เพื่อดูรายชื่อและตรวจอักษรตามหลักทักษาที่ระบบใช้ เป็นทางเลือกตามความเชื่อของครอบครัว'
                : 'เริ่มจากชุดคัดสรรเดิม แล้วดูชื่อที่ใช้ได้ทุกเพศเพิ่มเติม ค้นหาจากชื่อ ความหมาย อักษร และวันเกิด พร้อมเก็บชื่อที่ชอบไว้เปรียบเทียบฟรี';
    return { title, description, path: `/names/${gender}${suffix}` };
}
export function categoryMetadata(
    gender: NamingGender,
    mode: NamingMode = 'given',
): Metadata {
    const { title, description, path } = categoryCopy(gender, mode);
    return {
        title: { absolute: `${title} | NameMongkol` },
        description,
        alternates: { canonical: siteUrl + path },
        openGraph: {
            title,
            description,
            url: siteUrl + path,
            type: 'website',
            locale: 'th_TH',
        },
    };
}
export async function EditorialNames({
    gender,
    day,
}: {
    gender: NamingGender;
    day?: DayKey;
}) {
    const { allNames } = await fetchReviewedNamesDataset(false);
    const keys = new Set(
        (gender === 'boys' ? boyNamesCurated : girlNamesCurated).map((item) =>
            reviewedNameKey(item.name),
        ),
    );
    const items = allNames
        .filter(
            (item) =>
                keys.has(reviewedNameKey(item.name)) &&
                (!day || item.suitableDays.includes(day)),
        )
        .map(publicNameChoice);
    return (
        <NameBrowser
            title={`ชุดคัดสรรชื่อ${labels[gender]}`}
            description="คงหมวดจากชุดคัดสรรเดิม แสดงเฉพาะชื่อสาธารณะที่ผ่านเงื่อนไขเผยแพร่ คะแนนและวันเกิดคำนวณใหม่จากชื่อจริงด้วยสูตรปัจจุบัน"
            initialItems={items}
            remoteDay={day}
            listId="editorial-names"
        />
    );
}
export async function DiscoveryNames({ day }: { day?: DayKey }) {
    const result = await queryPublicNames({
        reviewedOnly: true,
        discoveryOnly: true,
        gender: 'neutral',
        day: day ?? 'all',
        limit: 30,
        page: 1,
    });
    return (
        <NameBrowser
            title="ชื่อที่ใช้ได้ทุกเพศ"
            description={
                result.total
                    ? 'รายชื่อเพิ่มเติมจากฐานสาธารณะ แสดงเฉพาะความหมายที่ตรวจแล้ว ไม่ซ้ำกับชุดคัดสรรด้านบน ตัวกรองวันเกิดหมายถึงไม่พบกาลกิณีในชื่อจริงตามระบบ ไม่รวมผลของนามสกุล'
                    : 'กำลังเตรียมรายชื่อเพิ่มเติมที่ตรวจสอบความหมายแล้ว ขณะนี้ยังไม่มีชื่อผ่านเกณฑ์ในส่วนนี้ เลือกจากชุดคัดสรรหรือหมวดชื่อเล่นและชื่ออังกฤษได้ก่อน'
            }
            initialItems={result.data.map(publicNameChoice)}
            initialTotal={result.total}
            remote
            remoteDay={day}
            listId="discovery-names"
        />
    );
}
export async function NamesCategoryPage({
    gender,
    mode = 'given',
}: {
    gender: NamingGender;
    mode?: NamingMode;
}) {
    const copy = categoryCopy(gender, mode);
    const parent = `/names/${gender}`;
    const category =
        babyNamingCategories.find((item) => item.href === copy.path) ??
        babyNamingCategories.find((item) => item.href === parent)!;
    const crumbs = [
        { href: '/', label: 'หน้าแรก' },
        { href: '/names', label: 'ตั้งชื่อลูก' },
        ...(mode === 'given'
            ? []
            : [{ href: parent, label: `ตั้งชื่อ${labels[gender]}` }]),
    ];
    let items: NameChoice[] = [];
    if (mode === 'nicknames')
        items = unique(
            nicknames.filter(
                (item) =>
                    item.gender === 'unisex' ||
                    item.gender === (gender === 'boys' ? 'male' : 'female'),
            ),
        ).map((item) => ({
            ...item,
            kind: 'nickname',
            meaning:
                item.gender === 'unisex'
                    ? `${item.meaning ?? ''} · ใช้ได้ทุกเพศ`
                    : item.meaning,
        }));
    if (mode === 'english-names')
        items = unique(
            englishNames.filter(
                (item) =>
                    item.gender === 'unisex' ||
                    item.gender === (gender === 'boys' ? 'male' : 'female'),
            ),
        ).map((item) => ({
            ...item,
            kind: 'english',
            approximateReading: item.thai,
            meaning:
                item.gender === 'unisex'
                    ? `${item.meaning} · ใช้ได้ทุกเพศ`
                    : item.meaning,
        }));
    return (
        <NamingShell
            {...copy}
            image={
                mode === 'by-birthday'
                    ? '/images/names/birthday-calendar-v1.webp'
                    : category.image
            }
            imageAlt={
                mode === 'by-birthday'
                    ? 'ปฏิทินว่าง รองเท้าทารก และดอกไม้ในโทนอุ่น'
                    : category.imageAlt
            }
            backHref={mode === 'given' ? '/names' : parent}
            backLabel={
                mode === 'given'
                    ? 'กลับหน้าตั้งชื่อลูก'
                    : `กลับหมวด${labels[gender]}`
            }
            crumbs={crumbs}
        >
            <NamingJsonLd
                value={namingBreadcrumbSchema([
                    ...crumbs,
                    { href: copy.path, label: copy.title },
                ])}
            />
            {mode === 'given' ? (
                <>
                    <EditorialNames gender={gender} />
                    <DiscoveryNames />
                </>
            ) : mode === 'by-birthday' ? (
                <NamingDays gender={gender} />
            ) : (
                <NameBrowser
                    initialItems={items}
                    title={`${copy.title} (${items.length} ชื่อ)`}
                    description="จำนวนหลังตัดชื่อซ้ำ กดหัวใจเพื่อเก็บไว้บนอุปกรณ์นี้"
                />
            )}
            {mode === 'given' && (
                <section className={styles.section}>
                    <Link
                        className={styles.secondary}
                        href={`${parent}/by-birthday`}
                    >
                        เลือกชื่อ{labels[gender]}ตามวันเกิด →
                    </Link>
                </section>
            )}
            <NamingCategories gender={gender} currentHref={copy.path} />
            <NamingGuide />
            <NamingNextStep />
        </NamingShell>
    );
}
export async function NamesBirthdayPage({
    day,
    gender,
}: {
    day: DayKey;
    gender?: NamingGender;
}) {
    const label = namingBirthdayLinks.find(([key]) => key === day)![1];
    const title = `ตั้งชื่อ${gender ? labels[gender] : 'ลูก'}เกิด${label} พร้อมความหมาย`;
    const description =
        'ดูรายชื่อที่ไม่พบอักษรกาลกิณีในชื่อจริงตามทักษาของระบบ ตรวจความหมาย เสียงอ่าน และผลเมื่อใช้กับนามสกุลก่อนตัดสินใจ วันเกิดเป็นเกณฑ์ตามความเชื่อ ไม่รับประกันผลชีวิต';
    const path = `/names/${gender ? gender + '/' : ''}by-birthday/${day}`;
    const parent = gender
        ? `/names/${gender}/by-birthday`
        : '/names#naming-birthdays';
    const crumbs = [
        { href: '/', label: 'หน้าแรก' },
        { href: '/names', label: 'ตั้งชื่อลูก' },
        ...(gender
            ? [
                  {
                      href: `/names/${gender}`,
                      label: `ตั้งชื่อ${labels[gender]}`,
                  },
                  { href: parent, label: 'เลือกวันเกิด' },
              ]
            : []),
    ];
    const { allNames } = await fetchReviewedNamesDataset(false);
    const examples = allNames
        .filter(
            (item) =>
                editorialNameKeys.has(reviewedNameKey(item.name)) &&
                item.suitableDays.includes(day),
        )
        .map(publicNameChoice);
    return (
        <NamingShell
            title={title}
            description={description}
            image="/images/names/birthday-calendar-v1.webp"
            imageAlt="ปฏิทินและของใช้ทารกสำหรับเลือกชื่อตามวันเกิด"
            backHref={parent}
            backLabel="กลับไปเลือกวันเกิด"
            crumbs={crumbs}
        >
            <NamingJsonLd
                value={namingBreadcrumbSchema([
                    ...crumbs,
                    { href: path, label },
                ])}
            />
            <section className={styles.section}>
                <h2>ข้อพิจารณาตามหลักทักษา: {label}</h2>
                <p>
                    อักษรกาลกิณีที่สูตรระบบตรวจ:{' '}
                    {thaksaConfig[day].kali.join(' ')}{' '}
                    การเลือกวันพุธควรแยกกลางวัน–กลางคืนให้ตรงวันเกิดจริง{' '}
                    <Link href="/methodology">อ่านวิธีคำนวณและข้อจำกัด</Link>
                </p>
            </section>
            {gender ? (
                <EditorialNames gender={gender} day={day} />
            ) : (
                <NameBrowser
                    initialItems={examples}
                    remoteDay={day}
                    title="ตัวอย่างชื่อจากชุดคัดสรรเดิม"
                    listId="editorial-names"
                />
            )}
            <DiscoveryNames day={day} />
            <NamingDays gender={gender} />
            <NamingCategories gender={gender} />
            <NamingGuide />
            <NamingNextStep />
        </NamingShell>
    );
}
