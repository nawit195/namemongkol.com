import { Metadata } from 'next';
import { siteUrl } from '@/lib/seo';
import { nicknames } from '@/data/nicknames';
import { NamingFAQSection } from '@/components/names/NamingFAQSection';
import { RelatedPagesNav } from '@/components/names/RelatedPagesNav';

const baseUrl = siteUrl.replace(/\/$/, '');
const pageTitle = 'ตั้งชื่อเล่นลูกสาว 2569 — 100+ ชื่อเล่นน่ารัก ทันสมัย ทั้งไทยและอังกฤษ | NameMongkol';
const pageDescription = 'รวมไอเดียตั้งชื่อเล่นลูกสาว 2569 น่ารักๆ ทันสมัย มีทั้งชื่อเล่นแบบไทย ชื่ออินเตอร์ และชื่อเล่นยอดฮิต พร้อมตัวอย่างชื่อจริงที่เข้ากัน';

export const metadata: Metadata = {
    title: { absolute: pageTitle },
    alternates: { canonical: `${baseUrl}/names/girls/nicknames` },
    description: pageDescription,
    keywords: ['ตั้งชื่อเล่นลูกสาว', 'ชื่อเล่นลูกสาว', 'ชื่อเล่นลูกสาวน่ารัก', 'ชื่อเล่นลูกสาวอินเตอร์', 'ชื่อเล่นลูกสาว 2569'],
    openGraph: {
        title: pageTitle,
        description: pageDescription,
        url: `${baseUrl}/names/girls/nicknames`,
        siteName: 'NameMongkol',
        locale: 'th_TH',
        type: 'website',
    },
};

const faqs = [
    {
        question: 'ชื่อเล่นต้องใช้อักษรตามวันเกิดหรือตรวจเลขศาสตร์ไหม?',
        answer: 'โดยทั่วไปชื่อเล่นไม่ต้องซีเรียสเรื่องกาลกิณีและเลขศาสตร์เท่ากับชื่อจริง เพราะไม่ได้ใช้ในทางนิตินัย แต่ถ้าอยากให้สบายใจเต็ม 100% ก็สามารถหลีกเลี่ยงอักษรกาลกิณีของวันเกิดได้เช่นกัน'
    },
    {
        question: 'วิธีตั้งชื่อเล่นให้ลูกสาวควรมีหลักการอย่างไร?',
        answer: 'ควรเป็นชื่อที่ 1) เรียกง่าย (1-2 พยางค์) 2) มีเสียงที่น่าฟัง 3) ไม่เป็นคำพ้องเสียงที่มีความหมายไม่ดี และ 4) ถ้าเป็นไปได้ควรมีความหมายที่คล้องจองกับชื่อจริง'
    }
];

export default function GirlsNicknamesPage() {
    const webPageJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        '@id': `${baseUrl}/names/girls/nicknames#webpage`,
        'url': `${baseUrl}/names/girls/nicknames`,
        'name': pageTitle,
        'description': pageDescription,
    };

    const breadcrumbJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'หน้าแรก', 'item': baseUrl },
            { '@type': 'ListItem', 'position': 2, 'name': 'ตั้งชื่อลูกสาว', 'item': `${baseUrl}/names/girls` },
            { '@type': 'ListItem', 'position': 3, 'name': 'ชื่อเล่น', 'item': `${baseUrl}/names/girls/nicknames` },
        ],
    };

    // Filter female and unisex nicknames
    const femaleNicknames = nicknames.filter(n => n.gender === 'female' || n.gender === 'unisex');

    // Group by style
    const thaiNames = femaleNicknames.filter(n => n.style === 'thai');
    const interNames = femaleNicknames.filter(n => n.style === 'inter');
    const cuteNames = femaleNicknames.filter(n => n.style === 'cute');
    const coolNames = femaleNicknames.filter(n => n.style === 'cool');

    const renderNicknameGroup = (title: string, names: typeof nicknames) => (
        <div className="mb-10">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <span className="w-2 h-6 bg-pink-500 rounded-full inline-block"></span>
                {title}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {names.map((name, idx) => (
                    <div key={idx} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-pink-300 transition-colors">
                        <h3 className="text-xl font-bold text-pink-600 mb-1">น้อง{name.name}</h3>
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
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-pink-500 mb-4">Baby Girl Nicknames</p>
                    <h1 className="text-3xl font-bold leading-snug sm:text-4xl text-slate-900 mb-6">
                        ตั้งชื่อเล่นลูกสาว 2569<br className="hidden sm:block" />รวมชื่อน่ารัก ทันสมัย เรียกง่าย
                    </h1>
                    <p className="mx-auto max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                        หาไอเดียตั้งชื่อเล่นให้ลูกสาว มีทั้งหมวดชื่อไทยความหมายดี หมวดชื่ออินเตอร์ทันสมัย 
                        และหมวดชื่อน่ารักๆ พร้อมคำแนะนำชื่อจริงที่คล้องจองกัน
                    </p>
                </div>
            </section>

            <section className="w-full bg-[#f8f8fc] px-4 py-12">
                <div className="mx-auto max-w-5xl">
                    {cuteNames.length > 0 && renderNicknameGroup('หมวดน่ารัก อ่อนหวาน', cuteNames)}
                    {interNames.length > 0 && renderNicknameGroup('หมวดอินเตอร์ ทันสมัย', interNames)}
                    {thaiNames.length > 0 && renderNicknameGroup('หมวดชื่อไทย ความหมายดี', thaiNames)}
                    {coolNames.length > 0 && renderNicknameGroup('หมวดเท่ๆ ไม่ซ้ำใคร', coolNames)}
                </div>
            </section>

            <NamingFAQSection faqs={faqs} />
            <RelatedPagesNav currentPath="/names/girls/nicknames" />
        </>
    );
}
