import { Metadata } from 'next';
import { siteUrl } from '@/lib/seo';
import { nicknames } from '@/data/nicknames';
import { NamingFAQSection } from '@/components/names/NamingFAQSection';
import { RelatedPagesNav } from '@/components/names/RelatedPagesNav';

const baseUrl = siteUrl.replace(/\/$/, '');
const pageTitle = 'ตั้งชื่อเล่นลูกชาย 2569 — 100+ ชื่อเล่นเท่ๆ ทันสมัย ทั้งไทยและอังกฤษ | NameMongkol';
const pageDescription = 'รวมไอเดียตั้งชื่อเล่นลูกชาย 2569 เท่ๆ ทันสมัย มีทั้งชื่อเล่นแบบไทย ชื่ออินเตอร์ พร้อมตัวอย่างชื่อจริงที่เข้ากัน';

export const metadata: Metadata = {
    title: { absolute: pageTitle },
    alternates: { canonical: `${baseUrl}/names/boys/nicknames` },
    description: pageDescription,
    keywords: ['ตั้งชื่อเล่นลูกชาย', 'ชื่อเล่นลูกชาย', 'ชื่อเล่นลูกชายเท่ๆ', 'ชื่อเล่นลูกชายอินเตอร์', 'ชื่อเล่นลูกชาย 2569'],
    openGraph: {
        title: pageTitle,
        description: pageDescription,
        url: `${baseUrl}/names/boys/nicknames`,
        siteName: 'NameMongkol',
        locale: 'th_TH',
        type: 'website',
    },
};

const faqs = [
    {
        question: 'ชื่อเล่นลูกชายควรตั้งให้พ้องเสียงกับพ่อหรือแม่ดีไหม?',
        answer: 'เป็นที่นิยมมากครับ การนำพยางค์แรกของชื่อพ่อและแม่มารวมกัน หรือใช้พยัญชนะต้นเหมือนกัน นอกจากจะคล้องจองแล้ว ยังแสดงถึงสายใยความผูกพันของครอบครัวได้ดีอีกด้วย'
    },
    {
        question: 'หลักการตั้งชื่อเล่นลูกชายให้เป็นมงคลควรทำอย่างไร?',
        answer: 'เน้นชื่อที่เรียกง่าย พยางค์เดียวหรือสองพยางค์ ไม่เป็นคำที่มีความหมายสองแง่สองง่าม และถ้าจะให้ดีที่สุดคือ เลือกใช้พยัญชนะนำหน้าที่เป็น "เดช" หรือ "ศรี" ตามวันเกิดของลูก'
    }
];

export default function BoysNicknamesPage() {
    const webPageJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        '@id': `${baseUrl}/names/boys/nicknames#webpage`,
        'url': `${baseUrl}/names/boys/nicknames`,
        'name': pageTitle,
        'description': pageDescription,
    };

    const breadcrumbJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'หน้าแรก', 'item': baseUrl },
            { '@type': 'ListItem', 'position': 2, 'name': 'ตั้งชื่อลูกชาย', 'item': `${baseUrl}/names/boys` },
            { '@type': 'ListItem', 'position': 3, 'name': 'ชื่อเล่น', 'item': `${baseUrl}/names/boys/nicknames` },
        ],
    };

    // Filter male and unisex nicknames
    const maleNicknames = nicknames.filter(n => n.gender === 'male' || n.gender === 'unisex');

    // Group by style
    const thaiNames = maleNicknames.filter(n => n.style === 'thai');
    const interNames = maleNicknames.filter(n => n.style === 'inter');
    const coolNames = maleNicknames.filter(n => n.style === 'cool' || n.style === 'cute');

    const renderNicknameGroup = (title: string, names: typeof nicknames) => (
        <div className="mb-10">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <span className="w-2 h-6 bg-sky-500 rounded-full inline-block"></span>
                {title}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {names.map((name, idx) => (
                    <div key={idx} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-sky-300 transition-colors">
                        <h3 className="text-xl font-bold text-sky-700 mb-1">น้อง{name.name}</h3>
                        {name.meaning && name.meaning !== '-' && (
                            <p className="text-xs text-slate-500 mb-2 font-medium">แปลว่า: {name.meaning}</p>
                        )}
                        {name.examples && name.examples.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-slate-100">
                                <p className="text-[10px] text-slate-400 uppercase tracking-wide font-bold mb-1">ชื่อจริงที่เข้ากัน</p>
                                <p className="text-xs text-slate-700">{name.examples.join(', ')}</p>
                            </div>
                        )}
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
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-500 mb-4">Baby Boy Nicknames</p>
                    <h1 className="text-3xl font-bold leading-snug sm:text-4xl text-slate-900 mb-6">
                        ตั้งชื่อเล่นลูกชาย 2569<br className="hidden sm:block" />รวมชื่อเท่ๆ ทันสมัย เรียกง่าย
                    </h1>
                    <p className="mx-auto max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                        หาไอเดียตั้งชื่อเล่นให้ลูกชาย มีทั้งหมวดชื่อไทยความหมายดี หมวดชื่ออินเตอร์ทันสมัย 
                        และหมวดเท่ๆ คูลๆ พร้อมคำแนะนำชื่อจริงที่คล้องจองกัน
                    </p>
                </div>
            </section>

            <section className="w-full bg-[#f8f8fc] px-4 py-12">
                <div className="mx-auto max-w-5xl">
                    {thaiNames.length > 0 && renderNicknameGroup('หมวดชื่อไทย ความหมายดี', thaiNames)}
                    {interNames.length > 0 && renderNicknameGroup('หมวดอินเตอร์ ทันสมัย', interNames)}
                    {coolNames.length > 0 && renderNicknameGroup('หมวดเท่ๆ ไม่ซ้ำใคร', coolNames)}
                </div>
            </section>

            <NamingFAQSection faqs={faqs} />
            <RelatedPagesNav currentPath="/names/boys/nicknames" />
        </>
    );
}
