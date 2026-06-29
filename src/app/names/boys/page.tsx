import { Metadata } from 'next';
import Link from 'next/link';
import { siteUrl } from '@/lib/seo';
import { boyNamesCurated } from '@/data/boyNamesCurated';
import { NameListSection } from '@/components/names/NameListSection';
import { NamingFAQSection } from '@/components/names/NamingFAQSection';
import { RelatedPagesNav } from '@/components/names/RelatedPagesNav';

const baseUrl = siteUrl.replace(/\/$/, '');
const pageTitle = 'ตั้งชื่อลูกชาย 2569 — 100+ ชื่อมงคลพร้อมความหมายดี เลขศาสตร์ วันเกิด | NameMongkol';
const pageDescription = 'รวมไอเดียตั้งชื่อลูกชายมงคล 2569 กว่า 100 ชื่อ พร้อมความหมายดี ผลรวมเลขศาสตร์ วันเกิดที่เหมาะสม เลือกชื่อแล้วนำไปวิเคราะห์คู่กับนามสกุลได้ฟรี';

export const metadata: Metadata = {
    title: { absolute: pageTitle },
    alternates: { canonical: `${baseUrl}/names/boys` },
    description: pageDescription,
    keywords: ['ตั้งชื่อลูกชาย', 'ชื่อลูกชาย', 'ตั้งชื่อลูกชาย 2569', 'ชื่อลูกชายความหมายดี', 'ชื่อมงคลลูกชาย', 'ตั้งชื่อลูก', 'ชื่อลูกชายทันสมัย', 'ชื่อลูกชายตามวันเกิด'],
    openGraph: {
        title: pageTitle,
        description: pageDescription,
        url: `${baseUrl}/names/boys`,
        siteName: 'NameMongkol',
        locale: 'th_TH',
        type: 'website',
    },
};

const faqs = [
    {
        question: 'ตั้งชื่อลูกชายควรเลือกอักษรหมวดไหนดี?',
        answer: 'ชื่อลูกชายมักนิยมใช้อักษรในกลุ่ม เดช (อำนาจ บารมี) หรือ อายุ (สุขภาพแข็งแรง) ตามหลักทักษาปกรณ์ของวันเกิดน้อง เพื่อเสริมความเป็นผู้นำและความเข้มแข็ง'
    },
    {
        question: 'ชื่อลูกชายที่ดีควรมีความหมายแนวไหน?',
        answer: 'มักนิยมความหมายที่เกี่ยวกับ ความรู้ (วิชญ์, ปราชญ์), ความกล้าหาญและความเป็นผู้นำ (วุฒิ, พล), หรือความสำเร็จและโชคลาภ (ธน, ทรัพย์)'
    },
    {
        question: 'เกิดปีมะเมีย 2569 ตั้งชื่อลูกชายอย่างไรให้เป็นมงคล?',
        answer: 'ปีมะเมียเป็นธาตุไฟ เด็กผู้ชายปีนี้จะมีความกระตือรือร้นและมั่นใจสูง การตั้งชื่อที่เสริมด้านสติปัญญาและความใจเย็น จะช่วยสร้างสมดุลให้กับพื้นดวงได้ดีมาก'
    },
    {
        question: 'ได้ชื่อลูกชายที่ถูกใจแล้ว ต้องทำอะไรต่อ?',
        answer: 'ขั้นตอนสำคัญคือการตรวจสอบ "นามสกุล" ว่าเข้ากับชื่อหรือไม่ โดยนำชื่อไปเช็กในหน้าวิเคราะห์ชื่อฟรี เพื่อดูว่าเมื่อรวมกันแล้ว คู่เลขที่ได้เป็นสิริมงคล ไม่มีเลขอุบัติเหตุหรือเลขเหน็ดเหนื่อยแฝงอยู่'
    }
];

export default function BoysNamesPage() {
    const webPageJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        '@id': `${baseUrl}/names/boys#webpage`,
        'url': `${baseUrl}/names/boys`,
        'name': pageTitle,
        'description': pageDescription,
        'inLanguage': 'th-TH',
    };

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

    const breadcrumbJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'หน้าแรก', 'item': baseUrl },
            { '@type': 'ListItem', 'position': 2, 'name': 'ตั้งชื่อลูกชาย', 'item': `${baseUrl}/names/boys` },
        ],
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
            
            {/* Header Hero Section */}
            <section className="w-full bg-white px-4 pt-12 pb-8 text-[#1a1a3e]">
                <div className="mx-auto max-w-5xl text-center">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-500 mb-4">Baby Boy Names</p>
                    <h1 className="text-3xl font-bold leading-snug sm:text-4xl text-slate-900 mb-6">
                        ตั้งชื่อลูกชาย — รวมชื่อมงคลสำหรับลูกชาย<br className="hidden sm:block" />พร้อมความหมายดี 2569
                    </h1>
                    <p className="mx-auto max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
                        ต้อนรับลูกชายด้วยรายชื่อมงคลที่คัดสรรมาอย่างดี เสริมด้านความเป็นผู้นำ สติปัญญา และความมั่นคง 
                        คุณสามารถเลือกอักษรและวันเกิดตามหลักทักษาปกรณ์ เมื่อได้ชื่อที่ชอบแล้วอย่าลืมนำไปเช็กคู่กับนามสกุล
                    </p>
                </div>
            </section>

            {/* Main Interactive List */}
            <NameListSection names={boyNamesCurated} genderLabel="ลูกชาย" />

            {/* SEO Content Section */}
            <section className="w-full bg-white px-4 py-12">
                <div className="mx-auto max-w-4xl prose prose-slate">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">3 เทคนิคตั้งชื่อลูกชายให้เป็นสิริมงคล</h2>
                    <div className="grid gap-6 sm:grid-cols-3 mb-8">
                        <div className="rounded-xl bg-sky-50 p-6 border border-sky-100">
                            <h3 className="font-bold text-sky-800 text-lg mb-2">1. เลี่ยงกาลกิณี</h3>
                            <p className="text-sm text-slate-600">ข้อห้ามสำคัญที่สุด คือในชื่อต้องไม่มีอักษรกาลกิณีประจำวันเกิดของน้องโดยเด็ดขาด</p>
                        </div>
                        <div className="rounded-xl bg-emerald-50 p-6 border border-emerald-100">
                            <h3 className="font-bold text-emerald-800 text-lg mb-2">2. เสริมเดช/ศรี</h3>
                            <p className="text-sm text-slate-600">หากต้องการให้ลูกเป็นผู้นำ ให้ใช้อักษรวรรค &ldquo;เดช&rdquo; หากต้องการให้เป็นที่รัก ให้ใช้ &ldquo;ศรี&rdquo;</p>
                        </div>
                        <div className="rounded-xl bg-amber-50 p-6 border border-amber-100">
                            <h3 className="font-bold text-amber-800 text-lg mb-2">3. ผลรวมดี</h3>
                            <p className="text-sm text-slate-600">ผลรวมเลขศาสตร์เมื่อรวมกับนามสกุล ต้องไม่ตกเลขเสียหรือเลขที่ส่งผลเรื่องอุบัติเหตุ</p>
                        </div>
                    </div>
                    <p className="text-slate-600 leading-7">
                        การตั้งชื่อลูกชายในปัจจุบันมักเน้นชื่อที่สะกดง่าย อ่านง่ายทั้งภาษาไทยและอังกฤษ เพื่อให้สะดวกต่อการใช้ชีวิตในอนาคต 
                        แต่ยังคงพลังของความเป็นมงคลไว้ครบถ้วน สำหรับใครที่ยังไม่มีนามสกุลในใจ สามารถลองนำชื่อไปวิเคราะห์เดี่ยวๆ ก่อนได้
                    </p>
                    <div className="mt-8 text-center">
                        <Link href="/name-check" className="inline-flex items-center justify-center rounded-xl bg-sky-500 px-6 py-3 font-bold text-white shadow-lg shadow-sky-500/30 transition-all hover:-translate-y-0.5 hover:bg-sky-400">
                            วิเคราะห์ชื่อลูกชายร่วมกับนามสกุล (ฟรี)
                        </Link>
                    </div>
                </div>
            </section>

            <NamingFAQSection faqs={faqs} />
            <RelatedPagesNav currentPath="/names/boys" />
        </>
    );
}
