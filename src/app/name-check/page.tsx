import { Metadata } from 'next';
import { Suspense } from 'react';
import ClientHome from '@/app/ClientHome';
import { HomeFallback } from '@/components/HomeFallback';
import { NameCheckSeoContent } from '@/components/NameCheckSeoContent';
import { nameCheckFaqItems, nameCheckHowTo } from '@/data/nameCheckSeo';
import { siteUrl } from '@/lib/seo';

export const metadata: Metadata = {
    title: 'วิเคราะห์ชื่อ นามสกุล ฟรี | ถอดอักษรเป็นเลขศาสตร์ เช็กคู่เลขในชื่อ | NameMongkol',
    alternates: { canonical: `${siteUrl.replace(/\/$/, '')}/name-check` },
    description:
        'เช็กชื่อจริง-นามสกุลแบบละเอียด ถอดตัวอักษรเป็นเลขศาสตร์ วิเคราะห์คู่เลขในชื่อและนามสกุล เช่น 14, 24, 65 พร้อมผลรวม ทักษาปกรณ์ อายตนะ 6 และนิรันดร์ศาสตร์',
    keywords:
        'วิเคราะห์ชื่อ นามสกุล ฟรี, ตรวจชื่อจริงนามสกุล, ถอดอักษรเป็นเลขศาสตร์, วิเคราะห์คู่เลขในชื่อ, คู่เลขในนามสกุล, เลขศาสตร์ชื่อ, เช็กชื่อมงคล, ทักษาปกรณ์, อักษรกาลกิณี',
    openGraph: {
        title: 'วิเคราะห์ชื่อ-นามสกุลฟรี ถอดอักษรเป็นเลขศาสตร์ | NameMongkol',
        description:
            'วิเคราะห์ชื่อจริง-นามสกุลแบบละเอียด เห็นทั้งผลรวมเลขศาสตร์ ตารางถอดอักษร และคู่เลขในชื่อ-นามสกุลเพื่ออ่านพลังรายคู่',
        url: `${siteUrl}/name-check`,
        siteName: 'NameMongkol',
        locale: 'th_TH',
        type: 'website',
        images: [
            `${siteUrl}/api/og?variant=default&title=วิเคราะห์ชื่อ-นามสกุลฟรี&subtitle=ถอดอักษรเป็นเลขศาสตร์+เช็กคู่เลขในชื่อ&tag=Name%20Analysis`,
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'วิเคราะห์ชื่อ-นามสกุลฟรี ถอดอักษรเป็นเลขศาสตร์ | NameMongkol',
        description: 'เช็กชื่อจริง-นามสกุล เห็นผลรวม ตารางถอดอักษร และคู่เลขในชื่อ-นามสกุล ไม่ใช่ดูเฉพาะผลรวมเลขศาสตร์',
        images: [`${siteUrl}/api/og?variant=default&title=วิเคราะห์ชื่อ-นามสกุลฟรี`],
    },
};

// ── JSON-LD Schemas ──────────────────────────────────────────────────────────

const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${siteUrl}/name-check#webpage`,
    url: `${siteUrl}/name-check`,
    name: 'วิเคราะห์ชื่อ นามสกุล ฟรี | ถอดอักษรเป็นเลขศาสตร์ เช็กคู่เลขในชื่อ | NameMongkol',
    description: 'หน้าเช็กชื่อจริง-นามสกุลแบบละเอียดสำหรับดูผลรวมเลขศาสตร์ ตารางถอดอักษรเป็นเลข และคู่เลขในชื่อ-นามสกุลพร้อมคำอธิบายพลังรายคู่',
    isPartOf: { '@id': `${siteUrl}/#website` },
    inLanguage: 'th-TH',
    breadcrumb: { '@id': `${siteUrl}/name-check#breadcrumb` },
    speakable: {
        '@type': 'SpeakableSpecification',
        cssSelector: ['h1', '#name-check-method', '#name-check-faq'],
    },
};

const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': `${siteUrl}/name-check#breadcrumb`,
    itemListElement: [
        {
            '@type': 'ListItem',
            position: 1,
            name: 'หน้าแรก',
            item: siteUrl,
        },
        {
            '@type': 'ListItem',
            position: 2,
            name: 'วิเคราะห์ชื่อ นามสกุล ฟรี',
            item: `${siteUrl}/name-check`,
        },
    ],
};

const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: nameCheckFaqItems.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
        },
    })),
};

const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: nameCheckHowTo.name,
    description: nameCheckHowTo.description,
    totalTime: nameCheckHowTo.totalTime,
    step: nameCheckHowTo.steps.map((item, index) => ({
        '@type': 'HowToStep',
        position: index + 1,
        name: item.name,
        text: item.text,
    })),
};

export default function NameCheckPage() {
    return (
        <>
            <script
                id="name-check-webpage-schema"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
            />
            <script
                id="name-check-breadcrumb-schema"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
            <script
                id="name-check-faq-schema"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            <script
                id="name-check-howto-schema"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
            />

            <section className="relative z-10 mx-auto pt-10 w-full max-w-5xl px-4 text-center sm:pt-16 md:pt-20 bg-[#f8f8fc]">
                <div className="rounded-[1.75rem] border border-[#ddddf0] bg-white px-5 py-8 shadow-sm relative overflow-hidden sm:px-8 md:px-12">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(215,177,106,0.08),transparent_70%)]" />
                    <div className="relative z-10">
                        <p className="mx-auto mb-4 inline-flex rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">
                            เครื่องมือวิเคราะห์ชื่อฟรี
                        </p>
                        <h1 className="text-3xl font-bold tracking-tight text-[#1a1a3e] sm:text-4xl md:text-5xl">
                            วิเคราะห์ชื่อ-นามสกุลฟรี ถอดอักษรเป็นเลขศาสตร์และเช็กคู่เลขในชื่อ
                        </h1>
                        <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-[#5a5a82] sm:text-base">
                            เช็กชื่อจริงและนามสกุลในหน้าเดียว ระบบจะถอดตัวอักษรเป็นค่าเลขศาสตร์ รวมคะแนนภาพรวม แล้วจับเลขที่อยู่ติดกันเป็นคู่เพื่ออ่านพลังและความหมายรายคู่ พร้อมตรวจทักษาปกรณ์ อายตนะ 6 และนิรันดร์ศาสตร์
                        </p>
                    </div>
                </div>
            </section>

            <Suspense fallback={<HomeFallback surface="name-check" />}>
                <ClientHome surface="name-check" />
            </Suspense>

            <NameCheckSeoContent />
        </>
    );
}
