import { Metadata } from 'next';
import { siteUrl } from '@/lib/seo';
import { englishNames } from '@/data/englishNames';
import { NamingFAQSection } from '@/components/names/NamingFAQSection';
import { RelatedPagesNav } from '@/components/names/RelatedPagesNav';

const baseUrl = siteUrl.replace(/\/$/, '');
const pageTitle = 'ตั้งชื่อลูกชาย ภาษาอังกฤษ 2569 — 100+ ชื่อเท่ๆ พร้อมความหมาย คำอ่าน | NameMongkol';
const pageDescription = 'รวมไอเดียตั้งชื่อลูกชาย ภาษาอังกฤษ 2569 คัดมาให้แล้วว่าความหมายดี เป็นผู้นำ ออกเสียงง่าย เขียนเป็นภาษาไทยเท่ๆ พร้อมคำแปลและความหมาย';

export const metadata: Metadata = {
    title: { absolute: pageTitle },
    alternates: { canonical: `${baseUrl}/names/boys/english-names` },
    description: pageDescription,
    keywords: ['ตั้งชื่อลูกชาย ภาษาอังกฤษ', 'ชื่อลูกชาย ภาษาอังกฤษ', 'ชื่ออินเตอร์ลูกชาย', 'ชื่อลูกชายอังกฤษ ความหมายดี'],
    openGraph: {
        title: pageTitle,
        description: pageDescription,
        url: `${baseUrl}/names/boys/english-names`,
        siteName: 'NameMongkol',
        locale: 'th_TH',
        type: 'website',
    },
};

const faqs = [
    {
        question: 'ชื่ออินเตอร์ลูกชายที่นิยมในไทยมักเป็นชื่อแบบไหน?',
        answer: 'มักนิยมชื่อที่มีความยาว 2 พยางค์ (เช่น Arthur, Lucas, Leo) เพราะเรียกง่าย เข้ากับบริบทสังคมไทย และเมื่อเขียนเป็นภาษาไทยแล้วได้ผลรวมเลขศาสตร์ที่ดี'
    },
    {
        question: 'หากพ่อแม่มีเชื้อสายจีน จะตั้งชื่อภาษาอังกฤษให้ลูกชายดีไหม?',
        answer: 'สามารถตั้งได้ครับ หลายครอบครัวเลือกที่จะมีทั้งชื่อจริงภาษาไทย ชื่อเล่นภาษาจีน และใช้ชื่อภาษาอังกฤษเป็นชื่อกลาง (Middle Name) เพื่อให้เป็นสากลเวลาติดต่อต่างประเทศ'
    }
];

export default function BoysEnglishNamesPage() {
    const webPageJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        '@id': `${baseUrl}/names/boys/english-names#webpage`,
        'url': `${baseUrl}/names/boys/english-names`,
        'name': pageTitle,
        'description': pageDescription,
    };

    const breadcrumbJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'หน้าแรก', 'item': baseUrl },
            { '@type': 'ListItem', 'position': 2, 'name': 'ตั้งชื่อลูกชาย', 'item': `${baseUrl}/names/boys` },
            { '@type': 'ListItem', 'position': 3, 'name': 'ภาษาอังกฤษ', 'item': `${baseUrl}/names/boys/english-names` },
        ],
    };
    
    // Filter male and unisex names
    const maleEnglishNames = englishNames.filter(n => n.gender === 'male' || n.gender === 'unisex');

    // Group by style
    const classicNames = maleEnglishNames.filter(n => n.style === 'classic');
    const modernNames = maleEnglishNames.filter(n => n.style === 'modern' || n.style === 'cute');
    const uniqueNames = maleEnglishNames.filter(n => n.style === 'unique');

    const renderNameGroup = (title: string, desc: string, names: typeof englishNames) => (
        <div className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">{title}</h2>
            <p className="text-slate-500 mb-6">{desc}</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {names.map((name, idx) => (
                    <div key={idx} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-sky-300 transition-colors">
                        <div className="flex items-center justify-between mb-1">
                            <h3 className="text-xl font-bold text-sky-700">{name.name}</h3>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{name.origin}</span>
                        </div>
                        <p className="text-sm font-medium text-slate-700 mb-2">อ่านว่า: {name.thai}</p>
                        <p className="text-sm text-slate-500">{name.meaning}</p>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
            
            <section className="w-full bg-white px-4 pt-12 pb-8 text-[#1a1a3e]">
                <div className="mx-auto max-w-4xl text-center">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-500 mb-4">English Baby Boy Names</p>
                    <h1 className="text-3xl font-bold leading-snug sm:text-4xl text-slate-900 mb-6">
                        ตั้งชื่อลูกชาย ภาษาอังกฤษ<br className="hidden sm:block" />รวมชื่ออินเตอร์ เท่ๆ ความหมายดี
                    </h1>
                    <p className="mx-auto max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                        รวมไอเดียชื่อภาษาอังกฤษสำหรับลูกชาย เน้นความหมายที่เป็นผู้นำ แข็งแกร่ง และประสบความสำเร็จ 
                        พร้อมคำอ่านภาษาไทยที่คุณสามารถนำไปคำนวณผลรวมเลขศาสตร์ได้ทันที
                    </p>
                </div>
            </section>

            <section className="w-full bg-[#f8f8fc] px-4 py-12">
                <div className="mx-auto max-w-5xl">
                    {classicNames.length > 0 && renderNameGroup('Classic & Strong', 'ชื่อสไตล์คลาสสิก แข็งแกร่ง มั่นคง เป็นผู้นำ', classicNames)}
                    {modernNames.length > 0 && renderNameGroup('Modern & Cool', 'ชื่อทันสมัย เท่ๆ และกำลังเป็นที่นิยมทั่วโลก', modernNames)}
                    {uniqueNames.length > 0 && renderNameGroup('Unique & Special', 'ชื่อแปลกใหม่ มีเอกลักษณ์เฉพาะตัว ไม่ซ้ำใคร', uniqueNames)}
                </div>
            </section>

            <NamingFAQSection faqs={faqs} />
            <RelatedPagesNav currentPath="/names/boys/english-names" />
        </>
    );
}
