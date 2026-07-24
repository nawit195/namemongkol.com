import Link from 'next/link';
import { notFound } from 'next/navigation';
import { thaksaConfig, type DayKey } from '@/data/thaksa';
import { queryPublicNames } from '@/lib/publicNames';
import { siteUrl } from '@/lib/seo';

export const BIRTHDAY_DAY_KEYS = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'wednesday_night',
    'thursday',
    'friday',
    'saturday',
] as const satisfies readonly DayKey[];

export type BirthdayGender = 'boys' | 'girls';

const dayLabels: Record<DayKey, string> = {
    sunday: 'วันอาทิตย์',
    monday: 'วันจันทร์',
    tuesday: 'วันอังคาร',
    wednesday: 'วันพุธกลางวัน',
    wednesday_night: 'วันพุธกลางคืน',
    thursday: 'วันพฤหัสบดี',
    friday: 'วันศุกร์',
    saturday: 'วันเสาร์',
};

const genderCopy = {
    boys: { label: 'ลูกชาย', gender: 'male' as const, color: 'sky' },
    girls: { label: 'ลูกสาว', gender: 'female' as const, color: 'pink' },
};

export function isBirthdayDay(value: string): value is DayKey {
    return BIRTHDAY_DAY_KEYS.includes(value as DayKey);
}
export function getBirthdayPageCopy(gender: BirthdayGender, day: DayKey) {
    const genderInfo = genderCopy[gender];
    const dayLabel = dayLabels[day];
    const title = `ตั้งชื่อ${genderInfo.label}เกิด${dayLabel} 2569 ชื่อมงคลพร้อมความหมาย`;
    const description = `รวมไอเดียตั้งชื่อ${genderInfo.label}เกิด${dayLabel} 2569 พร้อมความหมาย ผลรวมเลขศาสตร์ อักษรมงคล และอักษรกาลกิณีตามหลักทักษาปกรณ์ ก่อนตรวจร่วมกับนามสกุล`;

    return { genderInfo, dayLabel, title, description };
}

function uniqueCharacters(characters: string[]) {
    return [...new Set(characters)].join(' ');
}

export async function BirthdayDayLandingPage({ gender, day }: { gender: BirthdayGender; day: DayKey }) {
    if (!isBirthdayDay(day)) notFound();

    const { genderInfo, dayLabel, title, description } = getBirthdayPageCopy(gender, day);
    const canonical = `${siteUrl}/names/${gender}/by-birthday/${day}`;
    const result = await queryPublicNames({ day, gender: genderInfo.gender, page: 1, limit: 40 });
    const config = thaksaConfig[day];
    const parentPath = `/names/${gender}/by-birthday`;
    const filterHash = `#gender=${genderInfo.gender}&day=${day}`;
    const faq = [
        {
            question: `ตั้งชื่อ${genderInfo.label}เกิด${dayLabel}ควรหลีกเลี่ยงอักษรใด`,
            answer: `ตามหลักทักษาปกรณ์ควรตรวจอักษรกาลกิณีของ${dayLabel} ได้แก่ ${uniqueCharacters(config.kali)} และควรตรวจชื่อร่วมกับนามสกุลก่อนใช้จริง`,
        },
        {
            question: 'เลือกจากผลรวมเลขศาสตร์อย่างเดียวได้ไหม',
            answer: 'ไม่ควรดูผลรวมอย่างเดียว ควรพิจารณาความหมาย เสียงอ่าน อักษรตามวันเกิด คู่เลข และความเข้ากันกับนามสกุลร่วมกัน',
        },
        {
            question: 'รายชื่อในหน้านี้ใช้ได้กับทุกนามสกุลหรือไม่',
            answer: 'รายชื่อเป็นตัวเลือกเบื้องต้น ความเหมาะสมขั้นสุดท้ายขึ้นอยู่กับผลรวมและคู่เลขเมื่อรวมกับนามสกุลของแต่ละคน',
        },
    ];
    const itemListJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        'name': title,
        'numberOfItems': result.total,
        'itemListElement': result.data.map((item, index) => ({
            '@type': 'ListItem',
            'position': index + 1,
            'name': item.name,
            'description': item.meaning,
            'url': `${siteUrl}/name-check?name=${encodeURIComponent(item.name)}`,
        })),
    };
    const breadcrumbJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
            { '@type': 'ListItem', position: 1, name: 'หน้าแรก', item: siteUrl },
            { '@type': 'ListItem', position: 2, name: `ตั้งชื่อ${genderInfo.label}`, item: `${siteUrl}/names/${gender}` },
            { '@type': 'ListItem', position: 3, name: 'ตั้งชื่อตามวันเกิด', item: `${siteUrl}${parentPath}` },
            { '@type': 'ListItem', position: 4, name: dayLabel, item: canonical },
        ],
    };
    const faqJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': faq.map((item) => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
    };

    return (
        <main className="min-h-screen bg-[#f8f8fc] text-[#1a1a3e]">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

            <section className="border-b border-[#ddddf0] bg-white px-4 pb-12 pt-28 sm:pt-32">
                <div className="mx-auto max-w-5xl">
                    <nav aria-label="เส้นทางหน้า" className="text-sm text-[#5a5a82]">
                        <Link prefetch={false} href={`/names/${gender}`} className="hover:text-amber-700">ตั้งชื่อ{genderInfo.label}</Link>
                        <span className="px-2" aria-hidden="true">/</span>
                        <Link prefetch={false} href={parentPath} className="hover:text-amber-700">ตามวันเกิด</Link>
                        <span className="px-2" aria-hidden="true">/</span>
                        <span aria-current="page">{dayLabel}</span>
                    </nav>
                    <p className="mt-8 text-xs font-bold uppercase tracking-[0.18em] text-amber-700">ชื่อมงคลตามหลักทักษาปกรณ์</p>
                    <h1 className="mt-3 max-w-4xl text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">{title}</h1>
                    <p className="mt-5 max-w-[70ch] text-base leading-8 text-[#5a5a82] sm:text-lg">{description}</p>
                    <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                        <Link prefetch={false}
                            href={`/names/by-birthday/${day}`}
                            data-track={`seo.birthday.${gender}.${day}.overview`}
                            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-slate-950 px-5 py-3 font-bold text-white transition-colors hover:bg-slate-800"
                        >
                            ชื่อมงคลคนเกิด{dayLabel} ทั้งผู้ชายและผู้หญิง
                        </Link>
                        <Link prefetch={false}
                            href={`/search${filterHash}`}
                            data-track={`seo.birthday.${gender}.${day}.search`}
                            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 font-bold text-slate-800 transition-colors hover:border-amber-400 hover:bg-amber-50"
                        >
                            ค้นชื่อ{genderInfo.label}เพิ่ม
                        </Link>
                        <Link prefetch={false}
                            href="/premium-search"
                            data-track={`seo.birthday.${gender}.${day}.premium`}
                            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-amber-500 px-5 py-3 font-bold text-slate-950 transition-colors hover:bg-amber-400"
                        >
                            คัดชื่อร่วมกับนามสกุลแบบ Premium
                        </Link>
                    </div>
                </div>
            </section>

            <section className="px-4 py-12">
                <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[0.8fr_1.2fr]">
                    <div>
                        <h2 className="text-2xl font-bold">หลักอักษรสำหรับ{dayLabel}</h2>
                        <p className="mt-3 leading-7 text-[#5a5a82]">
                            ใช้ข้อมูลส่วนนี้คัดรายชื่อเบื้องต้น แล้วตรวจผลรวมและคู่เลขร่วมกับนามสกุลอีกครั้ง วิธีนี้ช่วยลดการเลือกจากผลรวมตัวเลขเพียงอย่างเดียว
                        </p>
                        <dl className="mt-6 divide-y divide-slate-800 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 text-slate-100">
                            <div className="p-5">
                                <dt className="font-bold text-amber-300">เดช</dt>
                                <dd className="mt-2 text-sm leading-6 text-slate-300">{uniqueCharacters(config.dech)}</dd>
                            </div>
                            <div className="p-5">
                                <dt className="font-bold text-emerald-300">ศรีและมนตรี</dt>
                                <dd className="mt-2 text-sm leading-6 text-slate-300">{uniqueCharacters([...config.si, ...config.montri])}</dd>
                            </div>
                            <div className="p-5">
                                <dt className="font-bold text-rose-300">กาลกิณีที่ควรตรวจ</dt>
                                <dd className="mt-2 text-sm leading-6 text-slate-300">{uniqueCharacters(config.kali)}</dd>
                            </div>
                        </dl>
                        <p className="mt-5 text-sm leading-6 text-[#5a5a82]">
                            อ่านรายละเอียดเกี่ยวกับที่มาของการคำนวณได้ที่ <Link prefetch={false} href="/methodology" className="font-semibold text-amber-700 hover:underline">วิธีคำนวณและข้อจำกัดของ NameMongkol</Link>
                        </p>
                    </div>

                    <div>
                        <div className="flex items-end justify-between gap-4">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-700">ตัวอย่างจากฐานข้อมูล</p>
                                <h2 className="mt-2 text-2xl font-bold">{result.data.length} ชื่อ{genderInfo.label}ที่เหมาะกับ{dayLabel}</h2>
                            </div>
                            <span className="text-sm text-[#5a5a82]">พบทั้งหมด {result.total} ชื่อ</span>
                        </div>
                        <div className="mt-5 overflow-hidden rounded-2xl border border-[#ddddf0] bg-white shadow-sm">
                            <div className="hidden grid-cols-[1fr_2fr_0.7fr] bg-slate-50 px-5 py-3 text-sm font-bold text-slate-600 sm:grid">
                                <span>ชื่อ</span><span>ความหมาย</span><span className="text-center">ผลรวม</span>
                            </div>
                            <ul className="divide-y divide-[#eeeef6]">
                                {result.data.map((item) => (
                                    <li key={item.name} className="grid gap-2 px-5 py-4 sm:grid-cols-[1fr_2fr_0.7fr] sm:items-center">
                                        <Link prefetch={false} href={`/name-check?name=${encodeURIComponent(item.name)}`} className="font-bold text-sky-700 hover:underline">{item.name}</Link>
                                        <span className="text-sm leading-6 text-[#5a5a82]">{item.meaning || 'รออัปเดตความหมาย'}</span>
                                        <span className="w-fit rounded-lg bg-amber-50 px-3 py-1 text-sm font-bold text-amber-800 sm:justify-self-center">{item.numerology}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            <section className="border-y border-[#ddddf0] bg-white px-4 py-12">
                <div className="mx-auto max-w-5xl">
                    <h2 className="text-2xl font-bold">ดูชื่อมงคลวันเกิดอื่น</h2>
                    <div className="mt-5 flex flex-wrap gap-2">
                        {BIRTHDAY_DAY_KEYS.filter((key) => key !== day).map((key) => (
                            <Link prefetch={false} key={key} href={`/names/${gender}/by-birthday/${key}`} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-amber-400 hover:bg-amber-50">
                                {dayLabels[key]}
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            <section className="px-4 py-12">
                <div className="mx-auto max-w-5xl">
                    <h2 className="text-2xl font-bold">คำถามที่พบบ่อย</h2>
                    <div className="mt-6 divide-y divide-[#ddddf0] border-y border-[#ddddf0]">
                        {faq.map((item) => (
                            <article key={item.question} className="py-6">
                                <h3 className="font-bold">{item.question}</h3>
                                <p className="mt-2 max-w-[70ch] text-sm leading-7 text-[#5a5a82]">{item.answer}</p>
                            </article>
                        ))}
                    </div>
                    <div className="mt-10 rounded-2xl bg-slate-950 p-6 text-slate-100 sm:p-8">
                        <h2 className="text-2xl font-bold">ชื่อที่ดีต้องเข้ากับนามสกุลด้วย</h2>
                        <p className="mt-3 max-w-[65ch] leading-7 text-slate-300">เลือกรายชื่อที่ชอบ 5–10 ชื่อ แล้วตรวจผลรวม คู่เลข และความสมพงศ์กับนามสกุลก่อนตัดสินใจ</p>
                        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                            <Link prefetch={false} href="/name-check" data-track={`seo.birthday.${gender}.${day}.name_check`} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-600 px-5 py-3 font-bold hover:bg-slate-900">วิเคราะห์ชื่อฟรี</Link>
                            <Link prefetch={false} href="/premium-search" data-track={`seo.birthday.${gender}.${day}.premium_footer`} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-amber-400 px-5 py-3 font-bold text-slate-950 hover:bg-amber-300">ให้ระบบช่วยคัดชื่อ Premium</Link>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
