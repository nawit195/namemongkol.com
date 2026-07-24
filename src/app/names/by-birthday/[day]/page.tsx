import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { queryPublicNames } from '@/lib/publicNames';
import { siteUrl } from '@/lib/seo';
import { thaksaConfig, type DayKey } from '@/data/thaksa';

const DAYS = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'wednesday_night',
    'thursday',
    'friday',
    'saturday',
] as const satisfies readonly DayKey[];

const DAY_LABELS: Record<DayKey, string> = {
    sunday: 'วันอาทิตย์',
    monday: 'วันจันทร์',
    tuesday: 'วันอังคาร',
    wednesday: 'วันพุธกลางวัน',
    wednesday_night: 'วันพุธกลางคืน',
    thursday: 'วันพฤหัสบดี',
    friday: 'วันศุกร์',
    saturday: 'วันเสาร์',
};

export const dynamicParams = false;
export const revalidate = 600;

export function generateStaticParams() {
    return DAYS.map((day) => ({ day }));
}

function isDay(value: string): value is DayKey {
    return DAYS.includes(value as DayKey);
}

function uniqueCharacters(characters: string[]) {
    return [...new Set(characters)].join(' ');
}

function getCopy(day: DayKey) {
    const dayLabel = DAY_LABELS[day];
    return {
        dayLabel,
        title: `ชื่อมงคลคนเกิด${dayLabel} 2569 | ผู้ชาย ผู้หญิง พร้อมความหมาย | NameMongkol`,
        heading: `ชื่อมงคลคนเกิด${dayLabel} 2569`,
        description: `รวมชื่อมงคลคนเกิด${dayLabel} 2569 ทั้งผู้ชายและผู้หญิง พร้อมความหมาย ผลรวมเลขศาสตร์ อักษรมงคล และอักษรกาลกิณี เพื่อใช้คัดชื่อก่อนตรวจร่วมกับนามสกุล`,
    };
}

export async function generateMetadata({ params }: { params: Promise<{ day: string }> }): Promise<Metadata> {
    const { day } = await params;
    if (!isDay(day)) return {};

    const copy = getCopy(day);
    const canonical = `${siteUrl}/names/by-birthday/${day}`;
    return {
        title: { absolute: copy.title },
        description: copy.description,
        alternates: { canonical },
        openGraph: {
            title: copy.title,
            description: copy.description,
            url: canonical,
            siteName: 'NameMongkol',
            locale: 'th_TH',
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: copy.title,
            description: copy.description,
        },
    };
}

function genderPath(gender: 'boys' | 'girls', day: DayKey) {
    if (gender === 'girls' && day === 'monday') return '/articles/monday-girl-names-2569-no-sara';
    return `/names/${gender}/by-birthday/${day}`;
}

export default async function BirthdayOverviewPage({ params }: { params: Promise<{ day: string }> }) {
    const { day } = await params;
    if (!isDay(day)) notFound();

    const copy = getCopy(day);
    const canonical = `${siteUrl}/names/by-birthday/${day}`;
    const config = thaksaConfig[day];
    const [boys, girls] = await Promise.all([
        queryPublicNames({ day, gender: 'male', page: 1, limit: 12 }),
        queryPublicNames({ day, gender: 'female', page: 1, limit: 12 }),
    ]);
    const visibleNames = [...boys.data, ...girls.data];
    const faq = [
        {
            question: `คนเกิด${copy.dayLabel}ควรใช้อักษรใดในชื่อ`,
            answer: `ตามหลักทักษาปกรณ์สามารถพิจารณาอักษรกลุ่มเดช ศรี และมนตรี ได้แก่ ${uniqueCharacters([...config.dech, ...config.si, ...config.montri])} โดยควรดูความหมายและผลรวมร่วมด้วย`,
        },
        {
            question: `คนเกิด${copy.dayLabel}ควรหลีกเลี่ยงอักษรใด`,
            answer: `อักษรกาลกิณีของ${copy.dayLabel} ได้แก่ ${uniqueCharacters(config.kali)} ควรใช้เป็นข้อมูลประกอบ และตรวจชื่อร่วมกับนามสกุลก่อนตัดสินใจใช้จริง`,
        },
        {
            question: 'ชื่อมงคลผู้ชายและผู้หญิงใช้หลักเดียวกันหรือไม่',
            answer: 'ใช้หลักวันเกิดและเลขศาสตร์ร่วมกันได้ แต่ควรเลือกเสียงอ่าน ความหมาย และภาพลักษณ์ให้เหมาะกับผู้ใช้ชื่อแต่ละคน จึงแยกรายชื่อชายและหญิงให้เปรียบเทียบได้ชัดเจน',
        },
        {
            question: 'เลือกชื่อจากหน้านี้แล้วควรทำอะไรต่อ',
            answer: 'เลือกรายชื่อที่ชอบประมาณ 5–10 ชื่อ แล้วนำไปตรวจร่วมกับนามสกุล เพื่อดูผลรวม คู่เลข และองค์ประกอบของชื่อก่อนใช้งานจริง',
        },
    ];
    const schemas = [
        {
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            '@id': `${canonical}#webpage`,
            url: canonical,
            name: copy.title,
            description: copy.description,
            inLanguage: 'th-TH',
            isPartOf: { '@id': `${siteUrl}/#website` },
        },
        {
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: copy.heading,
            numberOfItems: boys.total + girls.total,
            itemListElement: visibleNames.map((item, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                name: item.name,
                description: item.meaning,
                url: `${siteUrl}/name-check?name=${encodeURIComponent(item.name)}`,
            })),
        },
        {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'หน้าแรก', item: siteUrl },
                { '@type': 'ListItem', position: 2, name: 'ค้นหาชื่อมงคล', item: `${siteUrl}/search` },
                { '@type': 'ListItem', position: 3, name: copy.heading, item: canonical },
            ],
        },
        {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faq.map((item) => ({
                '@type': 'Question',
                name: item.question,
                acceptedAnswer: { '@type': 'Answer', text: item.answer },
            })),
        },
    ];

    return (
        <main className="min-h-screen bg-[#f8f8fc] text-[#1a1a3e]">
            {schemas.map((schema, index) => (
                <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />
            ))}

            <section className="border-b border-[#ddddf0] bg-white px-4 pb-12 pt-28 sm:pt-32">
                <div className="mx-auto max-w-5xl">
                    <nav aria-label="เส้นทางหน้า" className="text-sm text-[#5a5a82]">
                        <Link prefetch={false} href="/search" className="hover:text-amber-700">ค้นหาชื่อมงคล</Link>
                        <span className="px-2" aria-hidden="true">/</span>
                        <span aria-current="page">{copy.dayLabel}</span>
                    </nav>
                    <p className="mt-8 text-xs font-bold uppercase tracking-[0.18em] text-amber-700">ชื่อมงคลตามวันเกิด</p>
                    <h1 className="mt-3 max-w-4xl text-3xl font-extrabold leading-tight sm:text-5xl">{copy.heading}</h1>
                    <p className="mt-5 max-w-[72ch] text-base leading-8 text-[#5a5a82] sm:text-lg">
                        ชื่อมงคลคนเกิด{copy.dayLabel}ควรพิจารณาทั้งความหมาย เสียงอ่าน อักษรตามหลักทักษาปกรณ์ และผลรวมเลขศาสตร์ หน้านี้รวบรวมตัวเลือกสำหรับผู้ชายและผู้หญิงจากฐานข้อมูล NameMongkol เพื่อช่วยคัดรายชื่อเบื้องต้นก่อนตรวจร่วมกับนามสกุล
                    </p>
                    <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                        <Link prefetch={false} href={genderPath('boys', day)} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#0f172a] px-5 py-3 font-bold text-white hover:bg-[#1e293b]">ดูชื่อมงคลผู้ชาย{copy.dayLabel}</Link>
                        <Link prefetch={false} href={genderPath('girls', day)} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-amber-300 bg-white px-5 py-3 font-bold text-amber-900 hover:bg-amber-50">ดูชื่อมงคลผู้หญิง{copy.dayLabel}</Link>
                    </div>
                </div>
            </section>

            <section className="px-4 py-12">
                <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[0.75fr_1.25fr]">
                    <div>
                        <h2 className="text-2xl font-bold">อักษรมงคลสำหรับคนเกิด{copy.dayLabel}</h2>
                        <p className="mt-3 leading-7 text-[#5a5a82]">ใช้ตารางนี้เป็นแนวคัดกรอง ไม่ควรตัดสินจากอักษรกลุ่มเดียวโดยไม่ดูความหมาย เสียงอ่าน และนามสกุลร่วมกัน</p>
                        <dl className="mt-6 divide-y divide-slate-800 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 text-slate-100">
                            <div className="p-5"><dt className="font-bold text-amber-300">เดช</dt><dd className="mt-2 text-sm leading-6 text-slate-300">{uniqueCharacters(config.dech)}</dd></div>
                            <div className="p-5"><dt className="font-bold text-emerald-300">ศรีและมนตรี</dt><dd className="mt-2 text-sm leading-6 text-slate-300">{uniqueCharacters([...config.si, ...config.montri])}</dd></div>
                            <div className="p-5"><dt className="font-bold text-rose-300">กาลกิณีที่ควรตรวจ</dt><dd className="mt-2 text-sm leading-6 text-slate-300">{uniqueCharacters(config.kali)}</dd></div>
                        </dl>
                        <p className="mt-5 text-sm leading-6 text-[#5a5a82]">ดูที่มาและข้อจำกัดได้ในหน้า <Link prefetch={false} href="/methodology" className="font-semibold text-amber-700 hover:underline">วิธีคำนวณของ NameMongkol</Link></p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        {([
                            { key: 'boys', label: 'ชื่อมงคลผู้ชาย', result: boys, path: genderPath('boys', day), color: 'sky' },
                            { key: 'girls', label: 'ชื่อมงคลผู้หญิง', result: girls, path: genderPath('girls', day), color: 'rose' },
                        ] as const).map((group) => (
                            <section key={group.key} aria-labelledby={`${group.key}-names`} className="overflow-hidden rounded-2xl border border-[#ddddf0] bg-white shadow-sm">
                                <div className="border-b border-[#eeeeF6] p-5">
                                    <h2 id={`${group.key}-names`} className="text-xl font-bold">{group.label}{copy.dayLabel}</h2>
                                    <p className="mt-1 text-sm text-[#5a5a82]">พบทั้งหมด {group.result.total.toLocaleString('th-TH')} ชื่อ</p>
                                </div>
                                <ul className="divide-y divide-[#eeeeF6]">
                                    {group.result.data.map((item) => (
                                        <li key={item.name} className="p-4">
                                            <div className="flex items-start justify-between gap-3">
                                                <Link prefetch={false} href={`/name-check?name=${encodeURIComponent(item.name)}`} className={`font-bold ${group.color === 'sky' ? 'text-sky-700' : 'text-rose-700'} hover:underline`}>{item.name}</Link>
                                                <span className="shrink-0 rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800">รวม {item.numerology}</span>
                                            </div>
                                            <p className="mt-2 text-sm leading-6 text-[#5a5a82]">{item.meaning || 'รออัปเดตความหมาย'}</p>
                                        </li>
                                    ))}
                                </ul>
                                <div className="border-t border-[#eeeeF6] p-4"><Link prefetch={false} href={group.path} className="font-bold text-amber-800 hover:underline">ดู{group.label}{copy.dayLabel}ทั้งหมด →</Link></div>
                            </section>
                        ))}
                    </div>
                </div>
            </section>

            <section className="border-y border-[#ddddf0] bg-white px-4 py-12">
                <div className="mx-auto max-w-5xl">
                    <h2 className="text-2xl font-bold">ชื่อมงคลตามวันเกิดอื่น</h2>
                    <div className="mt-5 flex flex-wrap gap-2">
                        {DAYS.filter((item) => item !== day).map((item) => (
                            <Link prefetch={false} key={item} href={`/names/by-birthday/${item}`} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:border-amber-400 hover:bg-amber-50">ชื่อมงคลคนเกิด{DAY_LABELS[item]}</Link>
                        ))}
                    </div>
                </div>
            </section>

            <section className="px-4 py-12">
                <div className="mx-auto max-w-5xl">
                    <h2 className="text-2xl font-bold">คำถามที่พบบ่อยเกี่ยวกับชื่อมงคลคนเกิด{copy.dayLabel}</h2>
                    <div className="mt-6 divide-y divide-[#ddddf0] border-y border-[#ddddf0]">
                        {faq.map((item) => <article key={item.question} className="py-6"><h3 className="font-bold">{item.question}</h3><p className="mt-2 max-w-[72ch] text-sm leading-7 text-[#5a5a82]">{item.answer}</p></article>)}
                    </div>
                    <div className="mt-10 rounded-2xl bg-slate-950 p-6 text-slate-100 sm:p-8">
                        <h2 className="text-2xl font-bold">ตรวจชื่อที่ชอบร่วมกับนามสกุล</h2>
                        <p className="mt-3 max-w-[65ch] leading-7 text-slate-300">ชื่อที่เหมาะกับวันเกิดยังอาจให้ผลรวมต่างกันเมื่อนำไปรวมกับนามสกุล เลือกชื่อไว้หลายตัวเลือกแล้วตรวจเปรียบเทียบก่อนตัดสินใจ</p>
                        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                            <Link prefetch={false} href="/name-check" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-amber-400 px-5 py-3 font-bold text-slate-950 hover:bg-amber-300">วิเคราะห์ชื่อและนามสกุลฟรี</Link>
                            <Link prefetch={false} href="/articles/auspicious-names-by-birthday-2026" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-600 px-5 py-3 font-bold hover:bg-slate-900">อ่านคู่มือชื่อมงคลตามวันเกิด</Link>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
