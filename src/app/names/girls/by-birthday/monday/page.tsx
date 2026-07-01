import { Metadata } from 'next';
import Link from 'next/link';
import { siteUrl } from '@/lib/seo';
import { mondayGirlNames } from '@/data/mondayGirlNames';
import { MondayThaksaTable } from '@/components/names/MondayThaksaTable';
import { DayNameTable } from '@/components/names/DayNameTable';
import { NamingFAQSection } from '@/components/names/NamingFAQSection';
import { RelatedPagesNav } from '@/components/names/RelatedPagesNav';

const baseUrl = siteUrl.replace(/\/$/, '');
const pageTitle = 'ตั้งชื่อลูกสาวเกิดวันจันทร์ 2569 รวมชื่อมงคล ไม่มีสระ พร้อมความหมาย | NameMongkol';
const pageDescription = 'รวมไอเดียตั้งชื่อลูกสาวเกิดวันจันทร์ 2569 ชื่อจริงมงคล ความหมายดี อ่านเพราะ พร้อมหลักอักษรทักษา อักษรกาลกิณี และวิธีเลือกชื่อให้เข้ากับนามสกุล';
const canonicalUrl = `${baseUrl}/names/girls/by-birthday/monday`;

export const metadata: Metadata = {
    title: { absolute: pageTitle },
    alternates: { canonical: canonicalUrl },
    description: pageDescription,
    keywords: [
        'ตั้งชื่อลูกสาวเกิดวันจันทร์', 
        'ชื่อลูกสาวเกิดวันจันทร์', 
        'ตั้งชื่อลูกสาววันจันทร์', 
        'ชื่อลูกสาวไม่มีสระ', 
        'ชื่อมงคลลูกสาววันจันทร์',
        'ชื่อจริงลูกสาวเกิดวันจันทร์',
        'ตั้งชื่อลูกสาวเกิดวันจันทร์ 2569'
    ],
    openGraph: {
        title: pageTitle,
        description: pageDescription,
        url: canonicalUrl,
        siteName: 'NameMongkol',
        locale: 'th_TH',
        type: 'website',
    },
};

const faqs = [
    {
        question: 'ลูกสาวเกิดวันจันทร์ห้ามใช้สระอะไรบ้าง?',
        answer: 'ตามหลักทักษาปกรณ์สำหรับผู้ที่เกิดวันจันทร์ "สระทั้งหมด" ถือเป็นอักษรกาลกิณีครับ ได้แก่ ะ อา อิ อี อุ อู เอ โอ รวมถึง อ.อ่าง ด้วย การตั้งชื่อจึงควรหลีกเลี่ยงการใช้อักษรเหล่านี้ขึ้นต้นชื่อครับ'
    },
    {
        question: 'ชื่อลูกสาวเกิดวันจันทร์ มีไม้หันอากาศ ( ั ) หรือ การันต์ ( ์ ) ได้ไหม?',
        answer: 'สามารถใช้ได้ครับ เพราะตามหลักโหราศาสตร์ไทยส่วนใหญ่ ไม้หันอากาศ และ การันต์ ไม่นับว่าเป็นสระ จึงมักนำมาประกอบในชื่อคนเกิดวันจันทร์ได้อย่างปลอดภัยครับ'
    },
    {
        question: 'อักษรวรรคไหนที่เหมาะกับลูกสาวเกิดวันจันทร์มากที่สุด?',
        answer: 'สำหรับผู้หญิง แนะนำให้ใช้อักษรวรรค "ศรี" (ด ต ถ ท ธ น) เพื่อเสริมเสน่ห์เมตตามหานิยม ให้คนรักคนเอ็นดู หรือวรรค "มูละ" (บ ป ผ ฝ พ ฟ ภ ม) เพื่อเสริมเรื่องทรัพย์สิน โชคลาภ และความมั่นคงในชีวิตครับ'
    },
    {
        question: 'จำเป็นต้องวิเคราะห์ชื่อกับนามสกุลก่อนใช้จริงไหม?',
        answer: 'จำเป็นมากครับ เพราะแม้ชื่อจะถูกโฉลกตามวันเกิด แต่เมื่อนำไปรวมกับนามสกุลแล้ว ผลรวมเลขศาสตร์อาจตกเลขเสียได้ ควรนำชื่อที่ชอบไปคำนวณร่วมกับนามสกุลเสมอ'
    }
];

export default function MondayGirlNamesPage() {
    // จัดกลุ่มชื่อตามธีม
    const auspiciousNames = mondayGirlNames.filter(n => n.theme === 'auspicious');
    const charmNames = mondayGirlNames.filter(n => n.theme === 'charm');
    const wisdomNames = mondayGirlNames.filter(n => n.theme === 'wisdom');
    const wealthNames = mondayGirlNames.filter(n => n.theme === 'wealth');
    const shortNames = mondayGirlNames.filter(n => n.theme === 'short');
    const noVowelNames = mondayGirlNames.filter(n => n.theme === 'no-vowel');

    const webPageJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        '@id': `${canonicalUrl}#webpage`,
        'url': canonicalUrl,
        'name': pageTitle,
        'description': pageDescription,
        'inLanguage': 'th-TH'
    };

    const faqJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': faqs.map(faq => ({
            '@type': 'Question',
            'name': faq.question,
            'acceptedAnswer': {
                '@type': 'Answer',
                'text': faq.answer
            }
        }))
    };

    const breadcrumbJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'หน้าแรก', 'item': baseUrl },
            { '@type': 'ListItem', 'position': 2, 'name': 'ตั้งชื่อลูกสาว', 'item': `${baseUrl}/names/girls` },
            { '@type': 'ListItem', 'position': 3, 'name': 'ตามวันเกิด', 'item': `${baseUrl}/names/girls/by-birthday` },
            { '@type': 'ListItem', 'position': 4, 'name': 'ลูกสาวเกิดวันจันทร์', 'item': canonicalUrl },
        ],
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
            
            {/* Hero Section */}
            <section className="w-full bg-white px-4 pt-12 pb-8 text-[#1a1a3e]">
                <div className="mx-auto max-w-4xl text-center">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-pink-500 mb-4">Monday Girl Names</p>
                    <h1 className="text-3xl font-bold leading-snug sm:text-4xl text-slate-900 mb-6">
                        ตั้งชื่อลูกสาวเกิดวันจันทร์ 2569<br className="hidden sm:block" />รวมชื่อมงคล ไม่มีสระ พร้อมความหมาย
                    </h1>
                    <p className="mx-auto max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                        คุณพ่อคุณแม่ที่กำลังหาชื่อให้ลูกสาวที่เกิดวันจันทร์ คงทราบดีว่า <strong className="text-pink-600">ข้อห้ามสำคัญคือการใช้สระ</strong> 
                        ซึ่งทำให้การตั้งชื่อเด็กวันจันทร์นั้นท้าทายกว่าวันอื่นๆ บทความนี้ NameMongkol ได้คัดสรรชื่อที่ถูกต้องตามหลักทักษาปกรณ์ 
                        ความหมายดี และไม่มีสระกาลกิณีมาให้เลือกถึง {mondayGirlNames.length} ชื่อ แบ่งตามหมวดหมู่เสริมดวงให้ค้นหาง่ายที่สุด
                    </p>
                </div>
            </section>

            {/* Content Section */}
            <section className="w-full bg-[#f8f8fc] px-4 py-12">
                <div className="mx-auto max-w-4xl space-y-16">
                    
                    {/* Section 1: Principles */}
                    <div className="bg-white rounded-2xl p-6 sm:p-10 shadow-sm border border-slate-200">
                        <h2 className="text-2xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">
                            ลูกสาวเกิดวันจันทร์ ตั้งชื่ออย่างไรให้เป็นมงคล
                        </h2>
                        <div className="prose prose-slate max-w-none text-slate-700 space-y-6">
                            <p>
                                การตั้งชื่อลูกให้เป็นสิริมงคลตามความเชื่อไทย จะพิจารณา 3 องค์ประกอบหลักร่วมกัน ได้แก่:
                            </p>
                            <div className="grid sm:grid-cols-3 gap-6">
                                <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                                    <h3 className="font-bold text-lg text-amber-700 mb-2">1. ความหมายดี</h3>
                                    <p className="text-sm">ชื่อมีความไพเราะ ความหมายเป็นสิริมงคล สร้างความประทับใจเมื่อแรกได้ยิน</p>
                                </div>
                                <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                                    <h3 className="font-bold text-lg text-amber-700 mb-2">2. หลักทักษาปกรณ์</h3>
                                    <p className="text-sm">หลีกเลี่ยงอักษร &quot;กาลกิณี&quot; และเลือกใช้อักษรในวรรคที่ต้องการเสริมพลัง (เช่น ศรี, เดช, มูละ)</p>
                                </div>
                                <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                                    <h3 className="font-bold text-lg text-amber-700 mb-2">3. เลขศาสตร์และนามสกุล</h3>
                                    <p className="text-sm">ผลรวมเลขศาสตร์ของชื่อเมื่อบวกกับนามสกุล ต้องตกอยู่ในเกณฑ์ดี ไม่มีดาวบาปเคราะห์</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-10">
                            <h2 className="text-2xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">
                                หลักทักษาปกรณ์สำหรับลูกสาวเกิดวันจันทร์
                            </h2>
                            <p className="text-slate-700 mb-6">
                                กฎเหล็กที่สำคัญที่สุดของคนเกิดวันจันทร์คือ <strong className="text-red-600 bg-red-50 px-2 py-0.5 rounded">ห้ามใช้สระและอ.อ่างเด็ดขาด</strong> เนื่องจากเป็นวรรคกาลกิณี 
                                ลองดูตารางอักษรทักษาด้านล่างนี้เพื่อทำความเข้าใจว่าอักษรตัวไหน เสริมดวงด้านใดครับ:
                            </p>
                            <MondayThaksaTable />
                        </div>
                    </div>

                    {/* Section 2: Name Lists */}
                    <div className="bg-white rounded-2xl p-6 sm:p-10 shadow-sm border border-slate-200" id="name-lists">
                        <h2 className="text-2xl font-bold text-slate-900 mb-8 border-b border-slate-100 pb-4">
                            รวมไอเดียตั้งชื่อลูกสาวเกิดวันจันทร์ 2569 (ไม่มีสระ)
                        </h2>
                        
                        <DayNameTable 
                            title="1. ชื่อมงคล ความหมายดีเลิศ" 
                            description="กลุ่มชื่อที่มีความหมายโดยรวมเป็นสิริมงคล นำพาสิ่งดีๆ เข้ามาในชีวิต"
                            names={auspiciousNames} 
                        />
                        
                        <DayNameTable 
                            title="2. เสริมเสน่ห์ เมตตามหานิยม" 
                            description="กลุ่มชื่อที่ช่วยให้เป็นที่รัก น่าเอ็นดู มักมีผู้อุปถัมภ์ค้ำชู (เน้นอักษรวรรคศรี และมนตรี)"
                            names={charmNames} 
                        />

                        <DayNameTable 
                            title="3. เสริมความรู้ ปัญญา และความก้าวหน้า" 
                            description="กลุ่มชื่อที่มีความหมายเกี่ยวกับความฉลาดหลักแหลม นักปราชญ์ และความสำเร็จในการเรียน/การงาน"
                            names={wisdomNames} 
                        />

                        <DayNameTable 
                            title="4. เสริมโชคลาภ และความมั่นคง" 
                            description="กลุ่มชื่อที่เสริมเรื่องความมั่งคั่ง ทรัพย์สินเงินทอง (เน้นอักษรวรรคมูละ)"
                            names={wealthNames} 
                        />

                        <DayNameTable 
                            title="5. ชื่อสั้น 2 พยางค์ น่ารัก จำง่าย" 
                            description="เหมาะสำหรับคุณพ่อคุณแม่ที่ชอบชื่อสั้นๆ กระชับ แต่ยังคงความหมายที่เป็นมงคล"
                            names={shortNames} 
                        />

                        <DayNameTable 
                            title="6. ชื่อสุดเก๋ ไร้สระแบบ 100%" 
                            description="กลุ่มชื่อที่พึ่งพาพยัญชนะล้วน หลีกเลี่ยงสระได้อย่างสมบูรณ์แบบ แต่อ่านออกมาแล้วไพเราะ"
                            names={noVowelNames} 
                        />
                    </div>

                    {/* Section 3: Next Steps & Tools */}
                    <div className="bg-amber-50 rounded-2xl p-6 sm:p-10 border border-amber-200">
                        <h2 className="text-2xl font-bold text-amber-900 mb-4">
                            วิธีเลือกชื่อให้เข้ากับนามสกุล
                        </h2>
                        <p className="text-amber-800 mb-6">
                            ได้ชื่อที่ถูกใจแล้ว อย่าเพิ่งด่วนตัดสินใจนำไปใช้นะครับ! ชื่อที่ดีที่สุดจะต้องเหมาะสมและส่งเสริมกับ <strong>"นามสกุล"</strong> ของคุณด้วย 
                            เราขอแนะนำให้นำชื่อที่คุณเลือกจากตารางด้านบน มาตรวจสอบผลรวมเลขศาสตร์กับนามสกุลผ่านระบบของเรา
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <Link href="/name-check" className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-full font-bold transition-colors">
                                วิเคราะห์ชื่อ + นามสกุล ฟรี
                            </Link>
                            <Link href="/name-generator" className="bg-white text-amber-700 hover:bg-amber-50 border border-amber-300 px-6 py-3 rounded-full font-bold transition-colors">
                                ให้ AI ตั้งชื่อมงคลให้
                            </Link>
                            <Link href="/search" className="bg-white text-amber-700 hover:bg-amber-50 border border-amber-300 px-6 py-3 rounded-full font-bold transition-colors">
                                ค้นหาชื่อวันจันทร์เพิ่มเติม (5,000+ ชื่อ)
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQs */}
            <NamingFAQSection faqs={faqs} title="คำถามที่พบบ่อย (ลูกสาวเกิดวันจันทร์)" />
            
            {/* Related Pages */}
            <RelatedPagesNav currentPath="/names/girls/by-birthday/monday" />
        </>
    );
}
