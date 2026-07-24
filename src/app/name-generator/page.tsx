import { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import ClientPage from './ClientPage';
import { siteUrl } from '@/lib/seo';

const baseUrl = siteUrl.replace(/\/$/, '');

const seoTitle = 'สร้างชื่อมงคล AI Grade A+ | ตั้งชื่อมงคลตามวันเกิด พร้อมเลขศาสตร์ | NameMongkol';
const seoDescription = 'สร้างชื่อมงคลด้วย AI Grade A+ สำหรับตั้งชื่อลูก เปลี่ยนชื่อ หรือชื่อแบรนด์ ระบบคัดชื่อจากอักษรที่ต้องการ พร้อมพิจารณาผลรวมเลขศาสตร์และความเป็นมงคล ใช้งานง่ายบน NameMongkol';
const ogImage = `${baseUrl}/api/og?variant=default&title=${encodeURIComponent('สร้างชื่อมงคลด้วย AI Grade A+')}&subtitle=${encodeURIComponent('ตั้งชื่อลูก เปลี่ยนชื่อ และชื่อแบรนด์ พร้อมเลขศาสตร์')}&tag=${encodeURIComponent('AI Name Generator')}`;

const faqItems = [
    {
        question: 'สร้างชื่อมงคล AI คืออะไร?',
        answer: 'สร้างชื่อมงคล AI คือระบบช่วยแนะนำชื่อใหม่โดยใช้ AI ประมวลผลจากอักษรที่ผู้ใช้เลือก พร้อมพิจารณาความเหมาะสมของชื่อ ความหมาย และผลรวมเลขศาสตร์ เพื่อให้ได้รายชื่อที่สามารถนำไปใช้พิจารณาได้ง่ายขึ้น',
    },
    {
        question: 'ระบบนี้ใช้ตั้งชื่อลูกได้ไหม?',
        answer: 'ใช้ได้ เหมาะสำหรับคุณพ่อคุณแม่ที่ต้องการไอเดียตั้งชื่อลูกให้มีความหมายดี อ่านไพเราะ และมีความเป็นมงคล โดยสามารถนำรายชื่อที่ได้ไปพิจารณาร่วมกับวันเกิดและนามสกุลเพิ่มเติม',
    },
    {
        question: 'ใช้สำหรับเปลี่ยนชื่อได้หรือไม่?',
        answer: 'ใช้ได้ ระบบเหมาะสำหรับผู้ที่ต้องการเปลี่ยนชื่อใหม่และอยากได้ตัวเลือกชื่อหลายแบบ โดยสามารถเลือกอักษรนำหน้าและดูผลรวมประกอบก่อนตัดสินใจ',
    },
    {
        question: 'ชื่อที่ระบบสร้างเป็นชื่อ Grade A+ ทุกชื่อไหม?',
        answer: 'ระบบจะพยายามคัดชื่อที่มีผลรวมและองค์ประกอบที่ดี แต่บางอักษรอาจสร้างชื่อ Grade A+ ได้น้อย หรืออาจไม่ได้ผลลัพธ์ตามจำนวนที่ต้องการ หากอักษรนั้นมีข้อจำกัดด้านผลรวมเลขศาสตร์หรือเงื่อนไขการตั้งชื่อ',
    },
    {
        question: 'หลังจากได้ชื่อแล้วควรทำอะไรต่อ?',
        answer: 'หลังจากได้ชื่อที่สนใจ ควรนำชื่อไปวิเคราะห์เพิ่มเติมร่วมกับนามสกุล วันเกิด และความหมาย เพื่อให้มั่นใจว่าชื่อนั้นเหมาะสมกับผู้ใช้จริงมากที่สุด',
    },
    {
        question: 'ระบบนี้ใช้ตั้งชื่อร้านหรือชื่อแบรนด์ได้ไหม?',
        answer: 'ใช้ได้ เหมาะสำหรับผู้ที่ต้องการไอเดียชื่อร้าน ชื่อแบรนด์ หรือชื่อธุรกิจที่อ่านง่าย จำง่าย และมีความเป็นมงคล โดยสามารถนำชื่อที่ได้ไปคัดเลือกต่อให้เหมาะกับภาพลักษณ์ของธุรกิจ',
    },
];

const targetAudiences = [
    'คุณพ่อคุณแม่ที่ต้องการตั้งชื่อลูกให้มีความหมายดี',
    'ผู้ที่ต้องการเปลี่ยนชื่อเพื่อเสริมความมั่นใจ',
    'เจ้าของกิจการที่ต้องการตั้งชื่อร้านหรือชื่อแบรนด์',
    'ผู้ที่ต้องการชื่อที่อ่านง่าย จำง่าย และมีความเป็นมงคล',
    'ผู้ที่ต้องการคัดชื่อโดยอิงผลรวมเลขศาสตร์',
];

const featureItems = [
    'สร้างรายชื่อได้จำนวนมากภายในครั้งเดียว',
    'เลือกอักษรนำหน้าที่ต้องการได้',
    'เหมาะสำหรับตั้งชื่อลูก เปลี่ยนชื่อ และชื่อแบรนด์',
    'มีผลรวมเลขศาสตร์ประกอบการพิจารณา',
    'ช่วยลดเวลาค้นหาชื่อด้วยตัวเอง',
    'ใช้งานง่าย เหมาะกับผู้ใช้ทั่วไป',
    'มีระบบคัดชื่อ Grade A+ เพื่อช่วยให้เลือกชื่อได้มั่นใจขึ้น',
];

const internalLinks = [
    { href: '/name-analysis', label: 'วิเคราะห์ชื่อมงคล' },
    { href: '/premium-analysis', label: 'วิเคราะห์ชื่อแบบ Premium' },
    { href: '/name-analysis', label: 'คัดกรองชื่อมงคล' },
    { href: '/reviews', label: 'รีวิวจากผู้ใช้งานจริง' },
    { href: '/articles', label: 'บทความตั้งชื่อมงคล' },
];

export const metadata: Metadata = {
    title: seoTitle,
    alternates: { canonical: `${baseUrl}/name-generator` },
    description: seoDescription,
    keywords: [
        'สร้างชื่อมงคล AI',
        'ตั้งชื่อมงคล',
        'AI ตั้งชื่อมงคล',
        'ตั้งชื่อมงคลตามวันเกิด',
        'ชื่อมงคลตามวันเกิด',
        'ตั้งชื่อลูกมงคล',
        'เปลี่ยนชื่อมงคล',
        'วิเคราะห์ชื่อมงคล',
        'ชื่อมงคล Grade A+',
        'เครื่องมือตั้งชื่อมงคล',
        'ชื่อมงคลเลขศาสตร์',
        'ตั้งชื่อร้านมงคล',
        'ชื่อแบรนด์มงคล',
    ],
    openGraph: {
        title: seoTitle,
        description: seoDescription,
        url: `${baseUrl}/name-generator`,
        siteName: 'NameMongkol',
        locale: 'th_TH',
        type: 'website',
        images: [ogImage],
    },
    twitter: {
        card: 'summary_large_image',
        title: seoTitle,
        description: seoDescription,
        images: [ogImage],
    },
};

export default function NameGeneratorPage() {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'WebPage',
                '@id': `${baseUrl}/name-generator#webpage`,
                url: `${baseUrl}/name-generator`,
                name: seoTitle,
                description: seoDescription,
                inLanguage: 'th-TH',
                isPartOf: { '@id': `${baseUrl}/#website` },
                mainEntity: { '@id': `${baseUrl}/name-generator#software` },
            },
            {
                '@type': 'SoftwareApplication',
                '@id': `${baseUrl}/name-generator#software`,
                name: 'NameMongkol AI Name Generator',
                alternateName: 'สร้างชื่อมงคลด้วย AI Grade A+',
                description: seoDescription,
                url: `${baseUrl}/name-generator`,
                applicationCategory: 'LifestyleApplication',
                operatingSystem: 'Web',
                offers: {
                    '@type': 'Offer',
                    price: '0',
                    priceCurrency: 'THB',
                },
                featureList: featureItems,
            },
            {
                '@type': 'BreadcrumbList',
                '@id': `${baseUrl}/name-generator#breadcrumb`,
                itemListElement: [
                    {
                        '@type': 'ListItem',
                        position: 1,
                        name: 'หน้าแรก',
                        item: baseUrl,
                    },
                    {
                        '@type': 'ListItem',
                        position: 2,
                        name: 'สร้างชื่อมงคลด้วย AI',
                        item: `${baseUrl}/name-generator`,
                    },
                ],
            },
            {
                '@type': 'HowTo',
                '@id': `${baseUrl}/name-generator#howto`,
                name: 'วิธีสร้างชื่อมงคลด้วย AI Grade A+',
                description: 'ขั้นตอนการใช้ NameMongkol AI Name Generator เพื่อสร้างชื่อมงคลสำหรับตั้งชื่อลูก เปลี่ยนชื่อ หรือชื่อแบรนด์',
                step: [
                    {
                        '@type': 'HowToStep',
                        position: 1,
                        name: 'เลือกอักษรนำหน้า',
                        text: 'เลือกอักษรนำหน้าที่ต้องการให้ AI ใช้เป็นจุดเริ่มต้นในการสร้างชื่อมงคล',
                    },
                    {
                        '@type': 'HowToStep',
                        position: 2,
                        name: 'ให้ AI สร้างรายชื่อ',
                        text: 'ระบบจะสร้างรายชื่อมงคลเป็นชุด พร้อมพิจารณาเสียงอ่าน ความหมาย และผลรวมเลขศาสตร์',
                    },
                    {
                        '@type': 'HowToStep',
                        position: 3,
                        name: 'นำชื่อไปวิเคราะห์ต่อ',
                        text: 'เลือกชื่อที่สนใจแล้วนำไปตรวจร่วมกับนามสกุล วันเกิด และความหมาย เพื่อประเมินความเหมาะสมก่อนใช้งานจริง',
                    },
                ],
            },
            {
                '@type': 'FAQPage',
                '@id': `${baseUrl}/name-generator#faq`,
                mainEntity: faqItems.map((item) => ({
                    '@type': 'Question',
                    name: item.question,
                    acceptedAnswer: {
                        '@type': 'Answer',
                        text: item.answer,
                    },
                })),
            },
        ],
    };

    return (
        <>
            <Script
                id="name-generator-json-ld"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <section id="name-generator-tool">
                <ClientPage />
            </section>
            <section className="site-grid-surface px-4 pb-24 text-[#5a5a82]">
                <div className="mx-auto max-w-5xl border-t border-[#ddddf0] pt-12">
                    <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.08em] text-[#a67828]">
                        AI Name Generator SEO Guide
                    </p>
                    <h2 className="text-balance text-2xl font-extrabold text-[#15163f] sm:text-3xl">
                        สร้างชื่อมงคล AI คืออะไร
                    </h2>
                    <p className="mt-4 max-w-3xl text-sm leading-7 sm:text-base">
                        ระบบช่วยสร้างชื่อมงคลด้วย AI สำหรับผู้ที่ต้องการตั้งชื่อลูก เปลี่ยนชื่อใหม่ หรือออกแบบชื่อแบรนด์ โดยคัดเลือกชื่อที่มีความหมายดี อ่านไพเราะ และพิจารณาผลรวมเลขศาสตร์เพื่อให้ได้ชื่อที่เหมาะสมมากยิ่งขึ้น
                    </p>

                    <div className="mt-10 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
                        <article className="rounded-2xl border border-[#ddddf0] bg-[#fefeff] p-6 shadow-sm">
                            <h2 className="text-xl font-extrabold text-[#15163f]">
                                ทำไมต้องใช้ระบบสร้างชื่อมงคล AI
                            </h2>
                            <h3 className="mt-3 text-base font-extrabold text-[#7869a8]">
                                สร้างชื่อใหม่ได้เร็วกว่า คัดชื่อได้ตรงใจกว่า
                            </h3>
                            <p className="mt-3 text-sm leading-7">
                                การตั้งชื่อมงคลไม่ใช่แค่เลือกชื่อที่ฟังดูไพเราะเท่านั้น แต่ควรพิจารณาหลายปัจจัยร่วมกัน เช่น ความหมายของชื่อ อักษรนำหน้า ผลรวมเลขศาสตร์ ความเหมาะสมกับวันเกิด และความรู้สึกเมื่อนำไปใช้งานจริง
                            </p>
                            <p className="mt-3 text-sm leading-7">
                                ระบบสร้างชื่อมงคล AI ของ NameMongkol ช่วยประมวลผลและแนะนำรายชื่อที่เหมาะสม โดยออกแบบมาเพื่อช่วยให้คุณมีตัวเลือกชื่อที่หลากหลายมากขึ้น เหมาะสำหรับคนที่กำลังมองหาชื่อใหม่แต่ยังไม่รู้ว่าจะเริ่มจากตรงไหน
                            </p>
                        </article>

                        <article className="rounded-2xl border border-[#ddddf0] bg-[#fafafd] p-6 shadow-sm">
                            <h2 className="text-xl font-extrabold text-[#15163f]">
                                เครื่องมือตั้งชื่อมงคลนี้เหมาะกับใคร
                            </h2>
                            <p className="mt-3 text-sm leading-7">
                                เครื่องมือนี้เหมาะสำหรับผู้ที่ต้องการตั้งชื่อมงคลตามวันเกิด ตั้งชื่อลูกมงคล เปลี่ยนชื่อมงคล หรือหาไอเดียชื่อแบรนด์มงคลที่อ่านง่ายและจำง่าย
                            </p>
                            <ul className="mt-4 space-y-3 text-sm leading-6">
                                {targetAudiences.map((item) => (
                                    <li key={item} className="flex gap-3">
                                        <span className="mt-2 h-2 w-2 flex-none rounded-full bg-[#9b8ec4]" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </article>
                    </div>

                    <div className="mt-8 grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
                        <article className="rounded-2xl border border-[#e8c87e]/70 bg-[#fffaf0] p-6 shadow-sm">
                            <h2 className="text-xl font-extrabold text-[#15163f]">
                                ระบบสร้างชื่อมงคล AI ทำงานอย่างไร
                            </h2>
                            <h3 className="mt-3 text-base font-extrabold text-[#a67828]">
                                เลือกอักษรนำหน้า แล้วให้ AI ช่วยสร้างชื่อที่เหมาะสม
                            </h3>
                            <p className="mt-3 text-sm leading-7">
                                ผู้ใช้สามารถเลือกอักษรนำหน้าที่ต้องการ จากนั้นระบบจะช่วยสร้างรายชื่อมงคลออกมาเป็นชุด โดยคัดเลือกชื่อที่มีความเหมาะสมทั้งด้านเสียงอ่าน ความหมาย และผลรวมเลขศาสตร์ เพื่อให้ได้ชื่อที่สามารถนำไปพิจารณาต่อได้ง่ายขึ้น
                            </p>
                            <p className="mt-3 text-sm leading-7">
                                ระบบนี้เหมาะสำหรับการค้นหาไอเดียชื่อใหม่ โดยเฉพาะผู้ที่ต้องการชื่อจำนวนมากเพื่อเปรียบเทียบก่อนตัดสินใจ
                            </p>
                        </article>

                        <article className="rounded-2xl border border-[#ddddf0] bg-[#fefeff] p-6 shadow-sm">
                            <h2 className="text-xl font-extrabold text-[#15163f]">
                                จุดเด่นของการสร้างชื่อมงคล Grade A+
                            </h2>
                            <p className="mt-3 text-sm leading-7">
                                จุดเด่นของระบบสร้างชื่อมงคล AI Grade A+ คือช่วยให้เริ่มต้นคัดชื่อมงคลเลขศาสตร์ได้เร็วขึ้น โดยยังเปิดพื้นที่ให้ผู้ใช้เลือกชื่อที่ตรงกับความรู้สึกและบริบทการใช้งานจริง
                            </p>
                            <ul className="mt-4 grid gap-3 text-sm leading-6 sm:grid-cols-2">
                                {featureItems.map((item) => (
                                    <li key={item} className="flex gap-3">
                                        <span className="mt-2 h-2 w-2 flex-none rounded-full bg-emerald-400" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </article>
                    </div>

                    <article className="mt-8 rounded-2xl border border-[#ddddf0] bg-[#f3f3f9] p-6 shadow-sm">
                        <h2 className="text-xl font-extrabold text-[#15163f]">
                            ตั้งชื่อลูก เปลี่ยนชื่อ และชื่อแบรนด์ด้วย AI
                        </h2>
                        <div className="mt-4 grid gap-5 md:grid-cols-3">
                            <div>
                                <h3 className="font-extrabold text-[#7869a8]">ตั้งชื่อลูกมงคล</h3>
                                <p className="mt-2 text-sm leading-7">
                                    ใช้เป็นจุดเริ่มต้นสำหรับคุณพ่อคุณแม่ที่ต้องการชื่อมงคลตามวันเกิด มีความหมายดี และออกเสียงไพเราะ
                                </p>
                            </div>
                            <div>
                                <h3 className="font-extrabold text-[#7869a8]">เปลี่ยนชื่อมงคล</h3>
                                <p className="mt-2 text-sm leading-7">
                                    เหมาะกับผู้ที่ต้องการชื่อใหม่เพื่อเสริมความมั่นใจ พร้อมดูผลรวมเลขศาสตร์ประกอบก่อนตัดสินใจ
                                </p>
                            </div>
                            <div>
                                <h3 className="font-extrabold text-[#7869a8]">ตั้งชื่อร้านมงคล</h3>
                                <p className="mt-2 text-sm leading-7">
                                    ใช้หาไอเดียชื่อร้านหรือชื่อแบรนด์มงคลที่อ่านง่าย จำง่าย และนำไปต่อยอดกับภาพลักษณ์ธุรกิจได้
                                </p>
                            </div>
                        </div>
                    </article>

                    <div className="mt-8 grid gap-5 lg:grid-cols-2">
                        <article className="rounded-2xl border border-[#ddddf0] bg-[#fafafd] p-6 shadow-sm">
                            <h2 className="text-xl font-extrabold text-[#15163f]">
                                ข้อควรพิจารณาก่อนเลือกชื่อ
                            </h2>
                            <h3 className="mt-3 text-base font-extrabold text-slate-700">
                                ชื่อที่ดีควรดูมากกว่าแค่คะแนน
                            </h3>
                            <p className="mt-3 text-sm leading-7">
                                แม้ระบบ AI จะช่วยสร้างชื่อที่มีความน่าสนใจและมีผลรวมที่ดี แต่การเลือกชื่อควรพิจารณาหลายปัจจัยร่วมกัน เช่น ความหมาย ความเหมาะสมกับนามสกุล ความไพเราะเมื่อออกเสียง ความรู้สึกของผู้ใช้ชื่อ และความเหมาะสมกับวันเกิด
                            </p>
                            <p className="mt-3 text-sm leading-7">
                                สำหรับบางอักษรที่อยู่ในกลุ่มควรหลีกเลี่ยง ระบบอาจสร้างชื่อ Grade A+ ได้น้อยลง หรืออาจไม่พบชื่อที่เหมาะสมในบางกรณี เพราะการสร้างชื่อมงคลจำเป็นต้องคำนึงถึงผลรวมและหลักการประกอบชื่อร่วมกัน
                            </p>
                        </article>

                        <article className="rounded-2xl border border-[#ddddf0] bg-[#fefeff] p-6 shadow-sm">
                            <h2 className="text-xl font-extrabold text-[#15163f]">
                                ใช้คู่กับระบบวิเคราะห์ชื่อได้ดียิ่งขึ้น
                            </h2>
                            <p className="mt-3 text-sm leading-7">
                                หลังจากได้รายชื่อที่สนใจแล้ว แนะนำให้นำชื่อไปตรวจสอบเพิ่มเติมผ่านระบบ{' '}
                                <Link prefetch={false} href="/name-analysis" className="font-extrabold text-[#a67828] underline-offset-4 hover:underline">
                                    วิเคราะห์ชื่อมงคล
                                </Link>{' '}
                                เพื่อดูรายละเอียดเชิงลึก เช่น ผลรวมชื่อ ความหมายโดยรวม ความเหมาะสมของชื่อและนามสกุล รวมถึงแนวทางการเลือกชื่อที่เหมาะกับตัวคุณมากที่สุด
                            </p>
                            <div className="mt-5 flex flex-wrap gap-3 text-sm">
                                {internalLinks.map((link) => (
                                    <Link prefetch={false}
                                        key={`${link.href}-${link.label}`}
                                        href={link.href}
                                        className="rounded-full border border-[#ddddf0] bg-[#f8f8fc] px-4 py-2 font-bold text-[#5a5a82] shadow-sm transition-colors hover:border-[#9b8ec4] hover:bg-[#eeebf8]"
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                        </article>
                    </div>

                    <article className="mt-8 rounded-2xl border border-[#ddddf0] bg-[#fefeff] p-6 shadow-sm">
                        <h2 className="text-xl font-extrabold text-[#15163f]">
                            คำถามที่พบบ่อยเกี่ยวกับการสร้างชื่อมงคล
                        </h2>
                        <div className="mt-5 divide-y divide-[#ddddf0]">
                            {faqItems.map((item) => (
                                <div key={item.question} className="py-5 first:pt-0 last:pb-0">
                                    <h3 className="text-base font-extrabold text-[#15163f]">
                                        {item.question}
                                    </h3>
                                    <p className="mt-2 text-sm leading-7">
                                        {item.answer}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </article>

                    <div className="mt-8 rounded-2xl border border-[#e8c87e]/70 bg-[#fffaf0] p-6 text-center shadow-[0_12px_36px_rgba(201,147,58,0.10)]">
                        <h2 className="text-2xl font-extrabold text-[#15163f]">
                            เริ่มสร้างชื่อมงคลของคุณวันนี้
                        </h2>
                        <p className="mx-auto mt-3 max-w-3xl text-sm leading-7 text-[#6b5b3d] sm:text-base">
                            เลือกอักษรนำหน้าที่ต้องการ แล้วให้ระบบ AI ช่วยสร้างรายชื่อมงคล Grade A+ เพื่อเป็นไอเดียสำหรับตั้งชื่อลูก เปลี่ยนชื่อ หรือออกแบบชื่อแบรนด์ของคุณ
                        </p>
                        <Link prefetch={false}
                            href="#name-generator-tool"
                            className="mt-5 inline-flex min-h-12 items-center justify-center rounded-full bg-[#1a1a3e] px-6 py-3 text-sm font-extrabold text-[#f8f8fc] shadow-[0_8px_20px_rgba(26,26,62,0.16)] transition-colors hover:bg-[#292955] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#9b8ec4]/25"
                        >
                            เริ่มสร้าง 100 ชื่อ Grade A+
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}
