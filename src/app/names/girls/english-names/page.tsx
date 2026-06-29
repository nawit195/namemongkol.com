import { Metadata } from 'next';
import { siteUrl } from '@/lib/seo';
import { englishNames } from '@/data/englishNames';
import { NamingFAQSection } from '@/components/names/NamingFAQSection';
import { RelatedPagesNav } from '@/components/names/RelatedPagesNav';

const baseUrl = siteUrl.replace(/\/$/, '');
const pageTitle = 'ตั้งชื่อลูกสาว ภาษาอังกฤษ 2569 — 100+ ชื่อสวยๆ พร้อมความหมาย คำอ่าน | NameMongkol';
const pageDescription = 'รวมไอเดียตั้งชื่อลูกสาว ภาษาอังกฤษ 2569 คัดมาให้แล้วว่าความหมายดี ออกเสียงง่าย เขียนเป็นภาษาไทยสวยงาม พร้อมคำแปลและความหมาย';

export const metadata: Metadata = {
    title: { absolute: pageTitle },
    alternates: { canonical: `${baseUrl}/names/girls/english-names` },
    description: pageDescription,
    keywords: ['ตั้งชื่อลูกสาว ภาษาอังกฤษ', 'ชื่อลูกสาว ภาษาอังกฤษ', 'ชื่ออินเตอร์ลูกสาว', 'ชื่อลูกสาวอังกฤษ ความหมายดี'],
    openGraph: {
        title: pageTitle,
        description: pageDescription,
        url: `${baseUrl}/names/girls/english-names`,
        siteName: 'NameMongkol',
        locale: 'th_TH',
        type: 'website',
    },
};

const faqs = [
    {
        question: 'ตั้งชื่อลูกสาวเป็นภาษาอังกฤษสามารถตรวจเลขศาสตร์ได้ไหม?',
        answer: 'ทำได้ครับ ในระบบเลขศาสตร์จะถอดรหัสจาก "ตัวสะกดภาษาไทย" เป็นหลัก ดังนั้นหากคุณพ่อคุณแม่ตั้งชื่อลูกเป็นภาษาอังกฤษ ให้นำคำอ่านที่สะกดเป็นภาษาไทย (เช่น Alice = อลิส) มาใช้คำนวณผลรวมเลขศาสตร์'
    },
    {
        question: 'การเลือกชื่ออินเตอร์ควรคำนึงถึงอะไร?',
        answer: 'ควรเลือกชื่อที่ 1) ออกเสียงง่ายทั้งสำหรับคนไทยและต่างชาติ 2) เมื่อเขียนเป็นภาษาไทยแล้วไม่มีอักษรกาลกิณีของวันเกิดน้อง 3) ความหมายดีทั้งในภาษาต้นทางและเมื่อแปลเป็นไทย'
    }
];

export default function GirlsEnglishNamesPage() {
    const webPageJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        '@id': `${baseUrl}/names/girls/english-names#webpage`,
        'url': `${baseUrl}/names/girls/english-names`,
        'name': pageTitle,
        'description': pageDescription,
    };

    const breadcrumbJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'หน้าแรก', 'item': baseUrl },
            { '@type': 'ListItem', 'position': 2, 'name': 'ตั้งชื่อลูกสาว', 'item': `${baseUrl}/names/girls` },
            { '@type': 'ListItem', 'position': 3, 'name': 'ภาษาอังกฤษ', 'item': `${baseUrl}/names/girls/english-names` },
        ],
    };
    
    // Filter female and unisex names
    const femaleEnglishNames = englishNames.filter(n => n.gender === 'female' || n.gender === 'unisex');

    // Group by style
    const classicNames = femaleEnglishNames.filter(n => n.style === 'classic');
    const modernNames = femaleEnglishNames.filter(n => n.style === 'modern' || n.style === 'cute');
    const uniqueNames = femaleEnglishNames.filter(n => n.style === 'unique');

    const renderNameGroup = (title: string, desc: string, names: typeof englishNames) => (
        <div className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">{title}</h2>
            <p className="text-slate-500 mb-6">{desc}</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {names.map((name, idx) => (
                    <div key={idx} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-1">
                            <h3 className="text-xl font-bold text-pink-600">{name.name}</h3>
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
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-pink-500 mb-4">English Baby Girl Names</p>
                    <h1 className="text-3xl font-bold leading-snug sm:text-4xl text-slate-900 mb-6">
                        ตั้งชื่อลูกสาว ภาษาอังกฤษ<br className="hidden sm:block" />รวมชื่ออินเตอร์ ความหมายดี
                    </h1>
                    <p className="mx-auto max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                        รวมไอเดียชื่อภาษาอังกฤษสำหรับลูกสาว พร้อมคำอ่านภาษาไทยและความหมาย 
                        สามารถนำคำอ่านภาษาไทยไปคำนวณผลรวมเลขศาสตร์และเช็กอักษรกาลกิณีได้เช่นเดียวกับชื่อไทย
                    </p>
                </div>
            </section>

            <section className="w-full bg-[#f8f8fc] px-4 py-12">
                <div className="mx-auto max-w-5xl">
                    {classicNames.length > 0 && renderNameGroup('Classic & Elegant', 'ชื่อสไตล์คลาสสิก หรูหรา สง่างาม ไพเราะตลอดกาล', classicNames)}
                    {modernNames.length > 0 && renderNameGroup('Modern & Cute', 'ชื่อทันสมัย น่ารัก และกำลังเป็นที่นิยม', modernNames)}
                    {uniqueNames.length > 0 && renderNameGroup('Unique & Special', 'ชื่อแปลกใหม่ ไม่ซ้ำใคร มีเอกลักษณ์เฉพาะตัว', uniqueNames)}
                </div>
            </section>

            <NamingFAQSection faqs={faqs} />
            <RelatedPagesNav currentPath="/names/girls/english-names" />
        </>
    );
}
