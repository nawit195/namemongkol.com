import { Metadata } from 'next';
import Link from 'next/link';
import ClientPage from './ClientPage';
import { siteUrl } from '@/lib/seo';


export const metadata: Metadata = {
    title: 'เปรียบเทียบชื่อหลายชื่อ จัดเกรดและส่งออกผล | NameMongkol',
    alternates: { canonical: `${siteUrl.replace(/\/$/, '')}/name-analysis` },
    description: 'เปรียบเทียบรายชื่อพร้อมกันสูงสุด 1,000 ชื่อ จัดเกรดจากเลขศาสตร์ คู่เลข ทักษา และอักษรกาลกิณี แล้วส่งออกผลเป็น CSV/PDF ก่อนตรวจชื่อที่เลือกกับนามสกุล',
    keywords: 'เปรียบเทียบชื่อหลายชื่อ, วิเคราะห์รายชื่อจำนวนมาก, จัดเกรดชื่อมงคล, คัดรายชื่อมงคล, Export CSV วิเคราะห์ชื่อ, Export PDF รายชื่อ, Bulk name analysis',
    openGraph: {
        title: 'เปรียบเทียบชื่อหลายชื่อ จัดเกรดและส่งออกผล | NameMongkol',
        description: 'วิเคราะห์รายชื่อพร้อมกันสูงสุด 1,000 ชื่อ จัดเกรด เปรียบเทียบ และ Export CSV/PDF',
        url: `${siteUrl}/name-analysis`,
        siteName: 'NameMongkol',
        locale: 'th_TH',
        type: 'website',
        images: [`${siteUrl}/api/og?variant=default&title=${encodeURIComponent('เช็คชื่อมงคล วิเคราะห์หลายชื่อ')}&subtitle=${encodeURIComponent('ตรวจเลขศาสตร์ ทักษา กาลกิณี จัดเกรด A+')}&tag=${encodeURIComponent('Bulk Analysis')}`],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'เปรียบเทียบชื่อหลายชื่อและจัดเกรด | NameMongkol',
        description: 'เครื่องมือสำหรับคัดและเปรียบเทียบรายชื่อจำนวนมาก ไม่ใช่หน้าตรวจชื่อกับนามสกุลแบบรายบุคคล',
    },
};

// JSON-LD Schemas for SEO
const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${siteUrl}/name-analysis`,
    'url': `${siteUrl}/name-analysis`,
    'name': 'เปรียบเทียบชื่อหลายชื่อ จัดเกรดและส่งออกผล | NameMongkol',
    'description': 'เครื่องมือเปรียบเทียบรายชื่อพร้อมกันสูงสุด 1,000 ชื่อ ตรวจผลรวม คู่เลข ทักษา และกาลกิณีเพื่อจัดเกรดและส่งออกผล',
    'inLanguage': 'th-TH',
    'isPartOf': {
        '@type': 'WebSite',
        'name': 'NameMongkol',
        'url': siteUrl,
    },
};

const softwareAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': 'เช็คชื่อมงคล วิเคราะห์หลายชื่อพร้อมกัน | NameMongkol',
    'description': 'ระบบเช็คชื่อมงคลออนไลน์ วิเคราะห์หลายชื่อพร้อมกันสูงสุด 1,000 ชื่อ ถอดอักษรเป็นเลขศาสตร์ ตรวจคู่เลข ทักษา กาลกิณี จัดเกรด A+ เปรียบเทียบชื่อ Export CSV/PDF',
    'url': `${siteUrl}/name-analysis`,
    'applicationCategory': 'LifestyleApplication',
    'operatingSystem': 'Web Browser',
    'offers': {
        '@type': 'Offer',
        'price': '5',
        'priceCurrency': 'THB',
        'description': 'ใช้งานผ่านระบบเครดิต เริ่มต้น 5 เครดิตสำหรับการวิเคราะห์ 1-10 ชื่อ',
    },
    'featureList': [
        'วิเคราะห์ชื่อพร้อมกันสูงสุด 1,000 ชื่อ',
        'ถอดตัวอักษรแต่ละตัวเป็นค่าเลขศาสตร์',
        'วิเคราะห์คู่เลขในชื่อเพื่ออ่านพลังและความหมายรายคู่',
        'จัดเกรดความมงคลโดยดูทั้งผลรวม คู่เลข และอักษรกาลกิณี',
        'ตรวจสอบวันที่ใช้ได้ตามทักษาปกรณ์',
        'Export ผลลัพธ์เป็น CSV และ PDF',
        'บันทึกประวัติการวิเคราะห์',
    ],
    'screenshot': `${siteUrl}/api/og?variant=default&title=Bulk%20Name%20Analysis`,
};

const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': [
        {
            '@type': 'Question',
            'name': 'เช็คชื่อมงคล ออนไลน์ ทำอย่างไร?',
            'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'สามารถเช็คชื่อมงคลออนไลน์ได้ที่ NameMongkol โดยวางรายชื่อที่ต้องการตรวจ ระบบจะถอดตัวอักษรเป็นค่าเลขศาสตร์ ตรวจผลรวม คู่เลข ทักษา กาลกิณี และจัดเกรดอัตโนมัติ รองรับการวิเคราะห์สูงสุด 1,000 ชื่อพร้อมกัน',
            },
        },
        {
            '@type': 'Question',
            'name': 'วิเคราะห์หลายชื่อพร้อมกัน ทำได้สูงสุดกี่ชื่อ?',
            'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'ระบบ Bulk Analysis ของ NameMongkol รองรับการวิเคราะห์หลายชื่อพร้อมกันสูงสุด 1,000 ชื่อต่อครั้ง โดยจะตรวจผลรวมเลขศาสตร์ คู่เลขในชื่อ อักษรกาลกิณี และจัดเกรดทุกชื่ออัตโนมัติ พร้อม Export ผลเป็น CSV หรือ PDF',
            },
        },
        {
            '@type': 'Question',
            'name': 'ทำไมการเช็คชื่อไม่ควรดูแค่ผลรวมเลขศาสตร์?',
            'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'ชื่อที่ผลรวมดีอาจมีคู่เลขบางตำแหน่งที่ควรระวัง หรือมีอักษรกาลกิณีตามวันเกิด การเช็คชื่อมงคลที่ดีต้องดูทั้งผลรวม คู่เลข ทักษา และอักษรกาลกิณีร่วมกัน จึงจะเห็นภาพรวมครบ',
            },
        },
        {
            '@type': 'Question',
            'name': 'เช็คชื่อมงคล เหมาะกับใครบ้าง?',
            'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'เหมาะกับพ่อแม่ที่กำลังตั้งชื่อลูกและมีหลายตัวเลือก ผู้ที่ต้องการเปลี่ยนชื่อเพื่อเสริมดวง นักเลขศาสตร์ที่ต้องคัดกรองชื่อจำนวนมาก หรือทีม HR ที่ต้องตรวจสอบรายชื่อพนักงาน ก่อนนำชื่อที่ดีที่สุดไปวิเคราะห์ร่วมกับนามสกุลในหน้าวิเคราะห์ชื่อ-นามสกุลฟรี',
            },
        },
    ],
};

const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    'name': 'วิธีเช็คชื่อมงคล วิเคราะห์หลายชื่อพร้อมกันออนไลน์',
    'description': 'ขั้นตอนเช็คชื่อมงคลและคัดหลายชื่อพร้อมกัน ตรวจผลรวมเลขศาสตร์ คู่เลข ทักษา กาลกิณี จัดเกรด A+',
    'step': [
        {
            '@type': 'HowToStep',
            'position': 1,
            'name': 'วางรายชื่อ',
            'text': 'พิมพ์หรือวางรายชื่อที่ต้องการวิเคราะห์ลงในช่อง โดยใส่ 1 ชื่อต่อ 1 บรรทัด รองรับสูงสุด 1,000 ชื่อ',
        },
        {
            '@type': 'HowToStep',
            'position': 2,
            'name': 'เริ่มวิเคราะห์',
            'text': 'ระบบจะถอดอักษรเป็นเลขศาสตร์ ตรวจผลรวม คู่เลขในชื่อ และอักษรกาลกิณีของแต่ละชื่อโดยอัตโนมัติ',
        },
        {
            '@type': 'HowToStep',
            'position': 3,
            'name': 'เปรียบเทียบผลลัพธ์และ Export',
            'text': 'ดูเกรด ผลรวมเลขศาสตร์ คู่เลขในชื่อ และคำอธิบายพลังรายคู่ จากนั้นจัดเรียงรายชื่อหรือส่งออกเป็น CSV/PDF เพื่อนำชื่อที่สนใจไปวิเคราะห์กับนามสกุลแบบละเอียด',
        },
    ],
    'totalTime': 'PT2M',
};

const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
        {
            '@type': 'ListItem',
            'position': 1,
            'name': 'หน้าแรก',
            'item': siteUrl,
        },
        {
            '@type': 'ListItem',
            'position': 2,
            'name': 'เช็คชื่อมงคล วิเคราะห์หลายชื่อพร้อมกัน',
            'item': `${siteUrl}/name-analysis`,
        },
    ],
};

export default function NameAnalysisPage() {
    return (
        <>
            {/* SSR H1 for Googlebot — keep visually hidden to avoid duplicate visible H1 in client UI */}
            <h1 className="sr-only">เปรียบเทียบชื่อหลายชื่อ จัดเกรดและส่งออกผล CSV หรือ PDF</h1>

            <script
                id="name-analysis-webpage-schema"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
            />
            <script
                id="name-analysis-software-schema"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }}
            />
            <script
                id="name-analysis-faq-schema"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            <script
                id="name-analysis-howto-schema"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
            />
            <script
                id="name-analysis-breadcrumb-schema"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
            <ClientPage />

            <section id="bulk-pair-analysis-seo" className="w-full bg-[#f8f8fc] px-4 pt-12 text-[#1a1a3e]">
                <div className="mx-auto max-w-4xl rounded-2xl border border-[#ddddf0] bg-white p-6 sm:p-8 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-600">Bulk Name Comparison</p>
                    <h2 className="mt-3 text-2xl font-bold text-[#1a1a3e]">เปรียบเทียบรายชื่อจำนวนมากก่อนตรวจชื่อกับนามสกุล</h2>
                    <p className="mt-4 text-sm leading-7 text-[#5a5a82] sm:text-base">
                        จุดเด่นของ NameMongkol คือการ<strong>เช็คชื่อมงคล</strong>แบบละเอียด โดยถอดตัวอักษรแต่ละตัวเป็นค่าเลขศาสตร์ แล้วจับเลขที่อยู่ติดกันเป็นคู่ เช่น 14, 24, 65 เพื่ออ่านพลังส่งเสริม จุดที่ควรระวัง และความหมายเชิงลึกของชื่อ ไม่ใช่ดูเฉพาะผลรวมตัวเลขเท่านั้น ระบบ<strong>วิเคราะห์หลายชื่อพร้อมกัน</strong>นี้ช่วยให้คุณเปรียบเทียบชื่อได้เร็วขึ้น เห็นทั้งผลรวมเลขศาสตร์ คู่เลขในชื่อ ทักษา อักษรกาลกิณี และเกรดความมงคล ก่อนนำชื่อที่สนใจไปตรวจร่วมกับนามสกุลในหน้า <a href="/name-check" className="text-indigo-600 hover:underline font-semibold">วิเคราะห์ชื่อ-นามสกุลฟรี</a>
                    </p>
                </div>
            </section>

            {/* SSR Internal Links (lightweight) — helps crawlers discover related pages without relying on JS */}
            <div className="w-full bg-[#f8f8fc] text-[#1a1a3e] px-4 pb-24">
                <div className="max-w-4xl mx-auto border-t border-[#ddddf0] pt-10">
                    <p className="text-xs font-bold text-[#8e8eaa] uppercase tracking-widest mb-4">
                        บริการอื่นๆ ที่เกี่ยวข้อง
                    </p>
                    <div className="flex flex-wrap gap-2">
                        <Link href="/name-check" className="text-xs bg-white border border-[#ddddf0] hover:bg-[#f3f3f9] hover:border-indigo-300 hover:text-indigo-600 px-3 py-1.5 rounded-full text-[#5a5a82] transition-colors shadow-sm">
                            วิเคราะห์ชื่อ-นามสกุล (ฟรี)
                        </Link>
                        <Link href="/about" className="text-xs bg-white border border-[#ddddf0] hover:bg-[#f3f3f9] hover:border-indigo-300 hover:text-indigo-600 px-3 py-1.5 rounded-full text-[#5a5a82] transition-colors shadow-sm">
                            เกี่ยวกับ NameMongkol
                        </Link>
                        <Link href="/name-generator" className="text-xs bg-white border border-[#ddddf0] hover:bg-[#f3f3f9] hover:border-indigo-300 hover:text-indigo-600 px-3 py-1.5 rounded-full text-[#5a5a82] transition-colors shadow-sm">
                            สร้างชื่อมงคลด้วย AI
                        </Link>
                        <Link href="/search" className="text-xs bg-white border border-[#ddddf0] hover:bg-[#f3f3f9] hover:border-indigo-300 hover:text-indigo-600 px-3 py-1.5 rounded-full text-[#5a5a82] transition-colors shadow-sm">
                            ค้นหาชื่อมงคลฟรี 5,000+ ชื่อ
                        </Link>
                        <Link href="/premium-search" className="text-xs bg-white border border-[#ddddf0] hover:bg-[#f3f3f9] hover:border-indigo-300 hover:text-indigo-600 px-3 py-1.5 rounded-full text-[#5a5a82] transition-colors shadow-sm">
                            เปลี่ยนชื่อมงคล Pro
                        </Link>
                        <Link href="/premium-analysis" className="text-xs bg-white border border-[#ddddf0] hover:bg-[#f3f3f9] hover:border-indigo-300 hover:text-indigo-600 px-3 py-1.5 rounded-full text-[#5a5a82] transition-colors shadow-sm">
                            วิเคราะห์ชื่อขั้นสูง (Premium)
                        </Link>
                        <Link href="/phone-analysis" className="text-xs bg-white border border-[#ddddf0] hover:bg-[#f3f3f9] hover:border-indigo-300 hover:text-indigo-600 px-3 py-1.5 rounded-full text-[#5a5a82] transition-colors shadow-sm">
                            เช็คเบอร์มงคลกราฟพลังงาน 6 ด้าน
                        </Link>
                        <Link href="/palm-analysis" className="text-xs bg-white border border-[#ddddf0] hover:bg-[#f3f3f9] hover:border-indigo-300 hover:text-indigo-600 px-3 py-1.5 rounded-full text-[#5a5a82] transition-colors shadow-sm">
                            วิเคราะห์ลายมือออนไลน์ด้วย AI
                        </Link>
                        <Link href="/wallpapers" className="text-xs bg-white border border-[#ddddf0] hover:bg-[#f3f3f9] hover:border-indigo-300 hover:text-indigo-600 px-3 py-1.5 rounded-full text-[#5a5a82] transition-colors shadow-sm">
                            วอลเปเปอร์มงคลเสริมดวง ดาวน์โหลดฟรี
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
