import { Metadata } from 'next';
import Link from 'next/link';
import { siteUrl } from '@/lib/seo';
import { girlNamesCurated } from '@/data/girlNamesCurated';
import { NameListSection } from '@/components/names/NameListSection';
import { NamingFAQSection } from '@/components/names/NamingFAQSection';
import { RelatedPagesNav } from '@/components/names/RelatedPagesNav';

const baseUrl = siteUrl.replace(/\/$/, '');
const pageTitle = 'ตั้งชื่อลูกสาว 2569 — 100+ ชื่อมงคลพร้อมความหมายดี เลขศาสตร์ วันเกิด | NameMongkol';
const pageDescription = 'รวมไอเดียตั้งชื่อลูกสาวมงคล 2569 กว่า 100 ชื่อ พร้อมความหมายดี ผลรวมเลขศาสตร์ วันเกิดที่เหมาะสม เลือกชื่อแล้วนำไปวิเคราะห์คู่กับนามสกุลได้ฟรี';

export const metadata: Metadata = {
    title: { absolute: pageTitle },
    alternates: { canonical: `${baseUrl}/names/girls` },
    description: pageDescription,
    keywords: ['ตั้งชื่อลูกสาว', 'ชื่อลูกสาว', 'ตั้งชื่อลูกสาว 2569', 'ชื่อลูกสาวความหมายดี', 'ชื่อมงคลลูกสาว', 'ตั้งชื่อลูก', 'ชื่อลูกสาวทันสมัย', 'ชื่อลูกสาวตามวันเกิด'],
    openGraph: {
        title: pageTitle,
        description: pageDescription,
        url: `${baseUrl}/names/girls`,
        siteName: 'NameMongkol',
        locale: 'th_TH',
        type: 'website',
    },
};

const faqs = [
    {
        question: 'หลักการตั้งชื่อลูกสาวที่ดีควรคำนึงถึงอะไรบ้าง?',
        answer: 'การตั้งชื่อลูกสาวที่ดีควรคำนึงถึง 3 ส่วนหลักคือ 1) ความหมายที่เป็นมงคล เสริมด้านความงาม ปัญญา หรือความสำเร็จ 2) ไม่ใช้อักษรกาลกิณีตามวันเกิด (ทักษาปกรณ์) 3) มีผลรวมเลขศาสตร์ที่เหมาะสมเมื่อรวมกับนามสกุล'
    },
    {
        question: 'ชื่อลูกสาวที่ขึ้นต้นด้วยอักษรใดเป็นที่นิยม?',
        answer: 'อักษรยอดนิยมมักเป็น พ, ภ, ม (หมวดริมฝีปาก) ที่ให้ความรู้สึกนุ่มนวล หรืออักษร ณ, ญ ที่ให้ความรู้สึกเป็นผู้หญิง นอกจากนี้การเลือกอักษรนำยังสามารถเลือกเพื่อเสริมดวงตามหลักทักษาได้ เช่น เสริมศรี เสริมมนตรี'
    },
    {
        question: 'ชื่อลูกสาวเกิดปีมะเมีย 2569 ควรตั้งอย่างไร?',
        answer: 'เด็กปีมะเมีย (ม้าไฟ) มีบุคลิกคล่องแคล่วว่องไว การตั้งชื่ออาจใช้ชื่อที่มีความหมายถึงแสงสว่าง ดวงดาว หรือความฉลาดหลักแหลม เพื่อส่งเสริมบุคลิกของปีเกิด แต่สิ่งสำคัญที่สุดยังคงเป็นการดูอักษรตามวันเกิด (จันทร์-อาทิตย์) ที่น้องเกิด'
    },
    {
        question: 'เลือกชื่อจากหน้านี้แล้วต้องทำอย่างไรต่อ?',
        answer: 'เมื่อได้ชื่อลูกสาวที่ถูกใจแล้ว ควรนำชื่อนั้นไปวิเคราะห์ร่วมกับ "นามสกุล" ในหน้า "วิเคราะห์ชื่อฟรี" ของเรา เพื่อดูผลรวมทั้งหมด และดูว่าเมื่อชื่อและนามสกุลมาอยู่รวมกัน จะเกิดเป็นคู่เลขที่ดีหรือไม่'
    }
];

export default function GirlsNamesPage() {
    const webPageJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        '@id': `${baseUrl}/names/girls#webpage`,
        'url': `${baseUrl}/names/girls`,
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
            { '@type': 'ListItem', 'position': 2, 'name': 'ตั้งชื่อลูกสาว', 'item': `${baseUrl}/names/girls` },
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
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-pink-500 mb-4">Baby Girl Names</p>
                    <h1 className="text-3xl font-bold leading-snug sm:text-4xl text-slate-900 mb-6">
                        ตั้งชื่อลูกสาว — รวมชื่อมงคลสำหรับลูกสาว<br className="hidden sm:block" />พร้อมความหมายดี 2569
                    </h1>
                    <p className="mx-auto max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
                        ต้อนรับสมาชิกใหม่ของครอบครัวด้วยรายชื่อลูกสาวความหมายดี ทันสมัย และเป็นมงคลตามหลักเลขศาสตร์และทักษาปกรณ์ 
                        คุณสามารถค้นหาและกรองชื่อตามวันเกิดหรือหมวดอักษรได้ เมื่อได้ชื่อที่ถูกใจแล้ว อย่าลืมนำไปวิเคราะห์ร่วมกับนามสกุลเพื่อดูความสมพงศ์
                    </p>
                </div>
            </section>

            {/* Main Interactive List */}
            <NameListSection names={girlNamesCurated} genderLabel="ลูกสาว" />

            {/* SEO Content Section */}
            <section className="w-full bg-white px-4 py-12">
                <div className="mx-auto max-w-4xl prose prose-slate">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">หลักการตั้งชื่อลูกสาวให้เป็นสิริมงคล</h2>
                    <div className="grid gap-6 sm:grid-cols-2 mb-8">
                        <div className="rounded-xl bg-pink-50 p-6 border border-pink-100">
                            <h3 className="font-bold text-pink-800 text-lg mb-2">1. ความหมายต้องดีและเหมาะสม</h3>
                            <p className="text-sm text-slate-600">ชื่อผู้หญิงมักเน้นความหมายที่สื่อถึงความงดงาม (เช่น กัญญา, ลลิล), ความฉลาดหลักแหลม (เช่น ญาดา, ปัณฑิตา), หรือความสำเร็จและโชคลาภ (เช่น ธัญชนก)</p>
                        </div>
                        <div className="rounded-xl bg-sky-50 p-6 border border-sky-100">
                            <h3 className="font-bold text-sky-800 text-lg mb-2">2. เลี่ยงอักษรกาลกิณี</h3>
                            <p className="text-sm text-slate-600">ตรวจสอบวันเกิดของน้อง (จันทร์-อาทิตย์) และหลีกเลี่ยงอักษรที่เป็นกาลกิณีในวันนั้นๆ เพื่อไม่ให้มีอุปสรรคมาขัดขวางความเจริญก้าวหน้า</p>
                        </div>
                    </div>
                    <p className="text-slate-600 leading-7">
                        การตั้งชื่อลูกสาวในยุคปัจจุบัน นิยมชื่อที่ออกเสียงง่าย เขียนง่าย และมีความเป็นสากล แต่ยังคงแฝงความหมายมงคลแบบไทยๆ เอาไว้ 
                        เมื่อคุณพ่อคุณแม่เลือกชื่อที่ชอบได้แล้ว ขั้นตอนที่สำคัญที่สุดคือการตรวจสอบ <strong>&ldquo;ผลรวมเลขศาสตร์&rdquo;</strong> เมื่อนำชื่อนั้นมารวมกับนามสกุลของครอบครัว
                    </p>
                    <div className="mt-8 text-center">
                        <Link prefetch={false} href="/name-check" className="inline-flex items-center justify-center rounded-xl bg-amber-500 px-6 py-3 font-bold text-white shadow-lg shadow-amber-500/30 transition-all hover:-translate-y-0.5 hover:bg-amber-400">
                            วิเคราะห์ชื่อร่วมกับนามสกุล (ฟรี)
                        </Link>
                    </div>
                </div>
            </section>

            <NamingFAQSection faqs={faqs} />
            <RelatedPagesNav currentPath="/names/girls" />
        </>
    );
}
