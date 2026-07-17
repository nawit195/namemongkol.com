import { Metadata } from 'next';
import Link from 'next/link';
import ClientPage from './ClientPage';
import { fetchPublicAggregateStats } from '@/lib/publicStats';
import { getLiveNameCountLabel } from '@/lib/nameCounts';
import { queryPublicNames } from '@/lib/publicNames';
import { siteUrl } from '@/lib/seo';

const baseUrl = siteUrl.replace(/\/$/, '');
const searchPageTitle = 'ค้นหาชื่อมงคลจากฐานข้อมูลล่าสุด พร้อมความหมาย เลขศาสตร์ และวันเกิดที่เหมาะสม | NameMongkol';
const searchPageDescription = 'ค้นหาชื่อมงคลจากฐานข้อมูลที่อัปเดตต่อเนื่อง สำหรับตั้งชื่อลูกชาย ตั้งชื่อลูกสาว หรือเปลี่ยนชื่อมงคล พร้อมความหมาย เลขศาสตร์ วันเกิดที่เหมาะสม และขั้นตอนวิเคราะห์ร่วมกับนามสกุล';

export const revalidate = 600;

export const metadata: Metadata = {
    title: { absolute: searchPageTitle },
    alternates: { canonical: `${baseUrl}/search` },
    description: searchPageDescription,
    keywords: ['ชื่อมงคล', 'ค้นหาชื่อมงคล', 'ตั้งชื่อลูก', 'ตั้งชื่อลูก 2569', 'ตั้งชื่อลูกชาย', 'ตั้งชื่อลูกสาว', 'เปลี่ยนชื่อมงคล', 'ชื่อความหมายดี', 'ชื่อเสริมดวง', 'ชื่อมงคลชาย', 'ชื่อมงคลหญิง', 'ชื่อมงคลตามวันเกิด', 'เลขศาสตร์ชื่อ', 'ถอดอักษรเป็นเลขศาสตร์', 'วิเคราะห์คู่เลขในชื่อ'],
    openGraph: {
        title: 'ค้นหาชื่อมงคลจากฐานข้อมูลล่าสุด พร้อมความหมายและเลขศาสตร์ | NameMongkol',
        description: 'ฐานรายชื่อมงคลสำหรับตั้งชื่อลูกชาย ตั้งชื่อลูกสาว และเปลี่ยนชื่อมงคล เลือกชื่อความหมายดีแล้วนำไปวิเคราะห์ชื่อ-นามสกุลเพื่อดูคู่เลขแบบละเอียด',
        url: `${baseUrl}/search`,
        siteName: 'NameMongkol',
        locale: 'th_TH',
        type: 'website',
        images: [`${baseUrl}/api/og?variant=default&title=ค้นหาชื่อมงคล&subtitle=ฐานข้อมูลอัปเดตต่อเนื่อง%20พร้อมความหมายและเลขศาสตร์&tag=Lucky%20Names`],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'ค้นหาชื่อมงคลจากฐานข้อมูลล่าสุด พร้อมความหมายและเลขศาสตร์ | NameMongkol',
        description: 'ค้นหาชื่อมงคลสำหรับตั้งชื่อลูกชาย ตั้งชื่อลูกสาว หรือเปลี่ยนชื่อมงคล พร้อมความหมาย เลขศาสตร์ และวันเกิดที่เหมาะสม',
        images: [`${baseUrl}/api/og?variant=default&title=ค้นหาชื่อมงคล`],
    },
};

const pillarFaqs = [
    {
        question: 'ชื่อมงคลคืออะไร',
        answer: 'ชื่อมงคลคือชื่อที่มีเสียงไพเราะ เป็นชื่อความหมายดี และผ่านการพิจารณาตามหลักที่เกี่ยวข้อง เช่น เลขศาสตร์ ทักษาปกรณ์ วันเกิด และอักษรกาลกิณี เพื่อให้ชื่อช่วยเสริมภาพลักษณ์ ความมั่นใจ และพลังที่ผู้ใช้ต้องการ',
    },
    {
        question: 'ชื่อมงคลตามวันเกิดดูอย่างไร',
        answer: 'การดูชื่อมงคลตามวันเกิดใช้หลักทักษาปกรณ์เป็นฐาน โดยตรวจว่าตัวอักษรในชื่อสัมพันธ์กับหมวดเดช ศรี มนตรี อายุ หรือหมวดอื่นที่ต้องการเสริม และหลีกเลี่ยงอักษรกาลกิณีประจำวันเกิด',
    },
    {
        question: 'ชื่อมงคลชายและชื่อมงคลหญิงควรเลือกต่างกันไหม',
        answer: 'ควรเลือกจากทั้งความหมาย เสียงเรียก บุคลิกที่ต้องการสื่อ และความเหมาะสมกับวันเกิด โดยการตั้งชื่อลูกชายมักเน้นพลัง ความมั่นคง ผู้นำ ส่วนการตั้งชื่อลูกสาวอาจเน้นเสน่ห์ ปัญญา ความสำเร็จ หรือความอ่อนโยนตามเป้าหมายของครอบครัว',
    },
    {
        question: 'ตั้งชื่อลูก 2569 ควรเริ่มจากอะไร',
        answer: 'การตั้งชื่อลูก 2569 ควรเริ่มจากรายชื่อที่อ่านง่าย ความหมายดี ไม่สะกดยาก แล้วค่อยคัดตามเพศ วันเกิด เลขศาสตร์ และความเข้ากันกับนามสกุล เพื่อให้ใช้ได้จริงทั้งในชีวิตประจำวันและเอกสารทางการ',
    },
    {
        question: 'เลือกชื่อมงคลจากหน้านี้แล้วต้องทำอะไรต่อ',
        answer: 'หลังเลือกชื่อที่ชอบ ควรนำชื่อไปวิเคราะห์ร่วมกับนามสกุลและวันเกิดในหน้าวิเคราะห์ชื่อ-นามสกุลฟรี เพื่อดูผลรวมเลขศาสตร์ คู่เลขในชื่อ-นามสกุล ทักษาปกรณ์ อายตนะ 6 และความสมพงศ์ก่อนใช้งานจริง',
    },
    {
        question: 'ชื่อมงคลสำหรับตั้งชื่อลูกควรดูปีเกิดด้วยไหม',
        answer: 'ดูได้เป็นส่วนเสริม โดยเฉพาะเมื่อต้องการชื่อที่เข้ากับบริบทปีเกิดหรือเทรนด์ชื่อในปีนั้น แต่ปัจจัยหลักยังควรเริ่มจากความหมาย วันเกิด เลขศาสตร์ และความเข้ากันกับนามสกุล',
    },
    {
        question: 'ค้นหาชื่อมงคลที่ NameMongkol เสียเงินไหม',
        answer: 'ค้นหารายชื่อมงคลพื้นฐานได้ฟรีจากฐานข้อมูลที่อัปเดตต่อเนื่อง หากต้องการคัดชื่อแบบละเอียดขึ้น เช่น ใส่นามสกุล เลือกอักษรนำ หรือคัดเกรดเชิงลึกสำหรับเปลี่ยนชื่อมงคล สามารถต่อยอดไปใช้ฟีเจอร์ Pro หรือวิเคราะห์ชื่อขั้นสูงได้',
    },
] as const;

export default async function SearchPage() {
    const [aggregate, initialNames] = await Promise.all([
        fetchPublicAggregateStats(),
        queryPublicNames({ page: 1, limit: 30 }),
    ]);
    const liveNamesCount = aggregate.stats.totalNames;
    const liveNamesLabel = getLiveNameCountLabel(liveNamesCount);

    const webPageJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        '@id': `${baseUrl}/search#webpage`,
        'url': `${baseUrl}/search`,
        'name': searchPageTitle,
        'description': searchPageDescription,
        'inLanguage': 'th-TH',
        'isPartOf': { '@id': `${baseUrl}/#website` },
        'speakable': {
            '@type': 'SpeakableSpecification',
            'cssSelector': ['h1', '#auspicious-name-pillar', '#search-next-step', '#search-faq'],
        },
    };

    // Enhanced JSON-LD Schema
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        'name': `ค้นหาชื่อมงคล ${liveNamesLabel} สำหรับตั้งชื่อลูกและเปลี่ยนชื่อ - NameMongkol`,
        'alternateName': 'NameMongkol Free Auspicious Name Search',
        'description': `ระบบค้นหารายชื่อมงคล ${liveNamesLabel} สำหรับตั้งชื่อลูกและเปลี่ยนชื่อ พร้อมชื่อความหมายดี เลขศาสตร์ เพศ วันเกิดที่เหมาะสม และลิงก์ต่อไปวิเคราะห์ชื่อ-นามสกุลแบบละเอียด`,
        'url': `${baseUrl}/search`,
        'applicationCategory': 'LifestyleApplication',
        'operatingSystem': 'Web',
        'offers': {
            '@type': 'Offer',
            'price': '0',
            'priceCurrency': 'THB',
            'description': 'ค้นหาชื่อมงคลฟรี ไม่มีค่าใช้จ่าย'
        },
        'featureList': [
            `ฐานข้อมูลชื่อมงคล ${liveNamesLabel}`,
            'กรองชื่อมงคลตามวันเกิด',
            'กรองตามเพศสำหรับตั้งชื่อลูกชายและตั้งชื่อลูกสาว',
            'กรองตามผลรวมเลขศาสตร์',
            'แสดงวันที่ใช้ได้และห้ามใช้',
            'แสดงชื่อความหมายดีและความหมายของชื่อ',
            'เป็นจุดเริ่มต้นก่อนนำชื่อไปวิเคราะห์คู่เลขกับนามสกุลในหน้าวิเคราะห์ชื่อ-นามสกุลฟรี'
        ]
    };

    // FAQ Schema
    const faqs = pillarFaqs.map((faq) => ({
        question: faq.question,
        answer: faq.answer.replace('ฐานข้อมูลที่อัปเดตต่อเนื่อง', `ฐานข้อมูล ${liveNamesLabel}`),
    }));

    const faqJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': faqs.map((faq) => ({
            '@type': 'Question',
            'name': faq.question,
            'acceptedAnswer': {
                '@type': 'Answer',
                'text': faq.answer,
            },
        })),
    };

    // ItemList Schema for better search visibility
    const itemListJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        'name': `รายชื่อมงคล ${liveNamesLabel} สำหรับตั้งชื่อลูกและเปลี่ยนชื่อ`,
        'description': 'รวมรายชื่อมงคลพร้อมความหมาย เลขศาสตร์ เพศ และวันเกิดที่เหมาะสมสำหรับตั้งชื่อลูกชาย ตั้งชื่อลูกสาว และเปลี่ยนชื่อมงคล',
        numberOfItems: initialNames.total,
        'itemListOrder': 'https://schema.org/ItemListOrderAscending',
        'itemListElement': initialNames.data.slice(0, 20).map((item, index) => ({
            '@type': 'ListItem',
            'position': index + 1,
            'name': item.name,
            'description': item.meaning,
            'url': `${baseUrl}/name-check?name=${encodeURIComponent(item.name)}`,
        })),
    };

    const breadcrumbJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
            {
                '@type': 'ListItem',
                'position': 1,
                'name': 'หน้าแรก',
                'item': baseUrl,
            },
            {
                '@type': 'ListItem',
                'position': 2,
                'name': `ชื่อมงคล ${liveNamesLabel} สำหรับตั้งชื่อลูกและเปลี่ยนชื่อ`,
                'item': `${baseUrl}/search`,
            },
        ],
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />
            <ClientPage initialNames={initialNames.data} initialTotal={initialNames.total} />
            <section id="auspicious-name-pillar" className="w-full bg-[#f8f8fc] px-4 pb-12 pt-12 text-[#1a1a3e]">
                <div className="mx-auto max-w-5xl">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-600">Auspicious Name Guide</p>
                    <h2 className="mt-3 text-2xl font-bold leading-snug sm:text-3xl">ชื่อมงคลคืออะไร และควรเลือกจากอะไรบ้าง</h2>
                    <p className="mt-4 max-w-3xl text-sm leading-7 text-[#5a5a82] sm:text-base">
                        ชื่อมงคลคือชื่อที่รวมเสียงไพเราะ ชื่อความหมายดี เลขศาสตร์ และความเหมาะสมกับวันเกิดไว้ด้วยกัน หน้านี้จึงเป็นจุดเริ่มต้นสำหรับคนที่กำลังตั้งชื่อลูก 2569 ตั้งชื่อลูกชาย ตั้งชื่อลูกสาว หรือเปลี่ยนชื่อมงคล ก่อนนำชื่อที่สนใจไปวิเคราะห์ร่วมกับนามสกุลอีกครั้ง
                    </p>
                    <div className="mt-7 grid gap-4 md:grid-cols-2">
                        <article className="rounded-xl border border-amber-100 bg-white p-5 shadow-sm">
                            <h3 className="font-bold text-amber-700">วิธีเลือกชื่อมงคลให้เหมาะกับวันเกิด</h3>
                            <p className="mt-2 text-sm leading-6 text-[#5a5a82]">
                                เริ่มจากดูชื่อมงคลตามวันเกิดตามหลักทักษาปกรณ์ เลี่ยงอักษรกาลกิณี แล้วเลือกอักษรที่เสริมด้านเดช ศรี มนตรี อายุ หรือมูละตามเป้าหมายของเจ้าของชื่อ
                            </p>
                        </article>
                        <article className="rounded-xl border border-sky-100 bg-white p-5 shadow-sm">
                            <h3 className="font-bold text-sky-700">ชื่อมงคลชาย / ชื่อมงคลหญิง</h3>
                            <p className="mt-2 text-sm leading-6 text-[#5a5a82]">
                                การตั้งชื่อลูกชายมักเน้นความมั่นคง ภาวะผู้นำ และความสำเร็จ ส่วนการตั้งชื่อลูกสาวอาจเน้นเสน่ห์ ปัญญา ความอ่อนโยน หรือโชคลาภ โดยยังควรตรวจเลขศาสตร์และวันเกิดประกอบ
                            </p>
                        </article>
                        <article className="rounded-xl border border-emerald-100 bg-white p-5 shadow-sm">
                            <h3 className="font-bold text-emerald-700">เลือกตามเลขศาสตร์และชื่อความหมายดี</h3>
                            <p className="mt-2 text-sm leading-6 text-[#5a5a82]">
                                ชื่อที่น่าใช้ควรอ่านง่าย มีความหมายเป็นมงคล และมีผลรวมเลขศาสตร์ที่เข้ากับเป้าหมายชีวิต ไม่ควรดูเฉพาะผลรวมเลขอย่างเดียวโดยไม่ตรวจความหมายและเสียงเรียก
                            </p>
                        </article>
                        <article className="rounded-xl border border-purple-100 bg-white p-5 shadow-sm">
                            <h3 className="font-bold text-purple-700">หลังเลือกชื่อแล้วควรวิเคราะห์ร่วมกับนามสกุลอย่างไร</h3>
                            <p className="mt-2 text-sm leading-6 text-[#5a5a82]">
                                เมื่อลิสต์ชื่อที่ชอบได้แล้ว ควรนำไปเช็กในหน้า <Link href="/name-check" className="font-semibold text-purple-700 hover:underline">วิเคราะห์ชื่อ-นามสกุลฟรี</Link> เพื่อดูผลรวม เลขคู่ และความสมพงศ์กับนามสกุลก่อนตัดสินใจ
                            </p>
                        </article>
                    </div>
                </div>
            </section>

            <section className="w-full border-t border-slate-200 bg-white px-4 py-12 text-[#1a1a3e]">
                <div className="mx-auto max-w-5xl">
                    <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
                        <div>
                            <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-amber-500">Naming Ideas</p>
                            <h2 className="text-2xl font-bold">ดูไอเดียตั้งชื่อลูกตามหมวดหมู่</h2>
                            <p className="mt-4 text-sm leading-7 text-slate-600">
                                ลิงก์กลุ่มตั้งชื่อลูกถูกย้ายออกจาก Sidebar เพื่อให้เมนูหลักไม่รก แต่ยังเข้าถึงได้จากหน้านี้สำหรับคนที่ต้องการไอเดียตั้งชื่อลูกชาย ตั้งชื่อลูกสาว ชื่อภาษาอังกฤษ หรือชื่อเล่น
                            </p>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <Link href="/names/girls" className="rounded-xl border border-pink-200 bg-pink-50 px-5 py-3 font-medium text-pink-700 shadow-sm transition-colors hover:bg-pink-100">
                                ตั้งชื่อลูกสาว
                            </Link>
                            <Link href="/names/boys" className="rounded-xl border border-sky-200 bg-sky-50 px-5 py-3 font-medium text-sky-700 shadow-sm transition-colors hover:bg-sky-100">
                                ตั้งชื่อลูกชาย
                            </Link>
                            <Link href="/names/girls/english-names" className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 font-medium text-slate-700 transition-colors hover:bg-slate-100">
                                ชื่อภาษาอังกฤษ ลูกสาว
                            </Link>
                            <Link href="/names/boys/english-names" className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 font-medium text-slate-700 transition-colors hover:bg-slate-100">
                                ชื่อภาษาอังกฤษ ลูกชาย
                            </Link>
                            <Link href="/names/girls/nicknames" className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 font-medium text-slate-700 transition-colors hover:bg-slate-100">
                                ชื่อเล่นลูกสาว
                            </Link>
                            <Link href="/names/boys/nicknames" className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 font-medium text-slate-700 transition-colors hover:bg-slate-100">
                                ชื่อเล่นลูกชาย
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <section className="w-full bg-[linear-gradient(135deg,#f8f8fc_0%,#eef1f5_48%,#e8ecf2_100%)] px-4 py-14 text-[#1a1a3e]" aria-labelledby="search-plans-title">
                <div className="mx-auto max-w-5xl">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">เลือกขั้นตอนที่เหมาะกับคุณ</p>
                    <h2 id="search-plans-title" className="mt-3 text-2xl font-bold sm:text-3xl">เริ่มฟรี แล้วค่อยเพิ่มความละเอียดเมื่อมีชื่อในใจ</h2>
                    <p className="mt-3 max-w-[70ch] text-sm leading-7 text-slate-700 sm:text-base">
                        การค้นหาชื่อช่วยสร้างรายชื่อเบื้องต้น ส่วนการวิเคราะห์ร่วมกับนามสกุลและการคัดแบบ Premium ช่วยลดเวลาตรวจทีละชื่อก่อนตัดสินใจใช้งานจริง
                    </p>
                    <div className="mt-8 overflow-hidden rounded-2xl border border-[#d9dee7] bg-white/80 shadow-[0_14px_32px_rgba(15,23,42,0.07)]">
                        <div className="grid grid-cols-[1.25fr_1fr_1fr] bg-[linear-gradient(90deg,#f6f7f9_0%,#eef1f5_52%,#e8ecf2_100%)] text-sm">
                            <div className="p-4 font-semibold text-slate-700">ความสามารถ</div>
                            <div className="p-4 font-bold text-sky-700">ฟรี</div>
                            <div className="p-4 font-bold text-amber-800">Premium</div>
                        </div>
                        {[
                            ['ค้นหารายชื่อและความหมาย', 'มี', 'มี'],
                            ['กรองตามวันเกิดและอักษรนำ', 'พื้นฐาน', 'ละเอียด'],
                            ['คัดร่วมกับนามสกุลและเป้าหมายชีวิต', 'ตรวจทีละชื่อ', 'คัดให้เป็นชุด'],
                            ['ดูเฉพาะชื่อเกรดสูง', 'บางส่วน', 'ครบกว่า'],
                        ].map(([feature, free, premium]) => (
                            <div key={feature} className="grid grid-cols-[1.25fr_1fr_1fr] border-t border-[#d9dee7] text-sm">
                                <div className="p-4 text-slate-800">{feature}</div>
                                <div className="p-4 text-sky-800">{free}</div>
                                <div className="p-4 font-medium text-amber-900">{premium}</div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                        <Link
                            href="/name-check"
                            data-track="seo.search.compare.free_analysis"
                            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-sky-200 bg-white/80 px-5 py-3 text-sm font-bold text-sky-800 transition-colors hover:border-sky-300 hover:bg-sky-50"
                        >
                            วิเคราะห์ชื่อฟรี
                        </Link>
                        <Link
                            href="/premium-search"
                            data-track="seo.search.compare.premium"
                            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-gradient-to-r from-[#e8c87e] to-[#c9933a] px-5 py-3 text-sm font-bold text-slate-950 shadow-[0_8px_18px_rgba(201,147,58,0.2)] transition-colors hover:from-[#f0d997] hover:to-[#d4a54e]"
                        >
                            คัดชื่อมงคลแบบ Premium
                        </Link>
                    </div>
                </div>
            </section>

            <section id="search-faq" className="w-full bg-[#f8f8fc] px-4 py-12 text-[#1a1a3e]">
                <div className="mx-auto max-w-5xl">
                    <h2 className="text-2xl font-bold">คำถามที่พบบ่อยเกี่ยวกับชื่อมงคล</h2>
                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                        {faqs.map((faq) => (
                            <div key={faq.question} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                                <h3 className="font-semibold text-[#1a1a3e]">{faq.question}</h3>
                                <p className="mt-2 text-sm leading-6 text-[#5a5a82]">{faq.answer}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section id="search-next-step" className="w-full bg-[#f8f8fc] px-4 pb-20 pt-10 text-slate-900">
                <div className="mx-auto max-w-4xl rounded-2xl border border-slate-800 bg-slate-950/90 p-6 text-slate-200 shadow-2xl shadow-slate-950/15 sm:p-8">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-300/80">Next Step</p>
                    <h2 className="mt-3 text-2xl font-bold text-white">ฐานชื่อคือจุดเริ่มต้น ก่อนตรวจคู่เลขแบบละเอียด</h2>
                    <p className="mt-4 text-sm leading-7 text-slate-300 sm:text-base">
                        หน้า Search ช่วยให้เริ่มจากชื่อที่ความหมายดีและมีผลรวมเลขศาสตร์น่าสนใจ แต่ก่อนใช้จริงควรนำชื่อที่เลือกไปวิเคราะห์ร่วมกับนามสกุล เพราะ NameMongkol จะถอดตัวอักษรเป็นเลขศาสตร์ แล้วจับเลขที่อยู่ติดกันเป็นคู่ เช่น 14, 24, 65 เพื่ออ่านพลังและความหมายเชิงลึกของชื่อ ไม่ใช่ดูเฉพาะผลรวมตัวเลขเท่านั้น
                    </p>
                    <Link href="/name-check" data-track="seo.search.next_step.name_check" className="mt-6 inline-flex rounded-xl bg-amber-400 px-5 py-3 text-sm font-bold text-slate-950 transition-colors hover:bg-amber-300">
                        วิเคราะห์ชื่อ-นามสกุลฟรี
                    </Link>
                </div>
            </section>
        </>
    );
}
