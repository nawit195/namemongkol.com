import React, { Suspense } from 'react';
import { Metadata } from 'next';
import ClientPage from './ClientPage';
import { PhoneSeoContent } from '@/components/PhoneSeoContent';
import { PhoneFAQSection } from '@/components/PhoneFAQSection';
import { phoneFaqs } from '@/lib/phoneSeo';
import { siteUrl } from '@/lib/seo';

const baseUrl = siteUrl.replace(/\/$/, '');
const phonePageUrl = `${baseUrl}/phone-analysis`;
const phonePageTitle = 'วิเคราะห์เบอร์มงคลฟรี | เช็คเบอร์โทรศัพท์ พร้อมกราฟพลังงาน 6 ด้าน | NameMongkol';
const phonePageDescription =
    'วิเคราะห์เบอร์มงคลฟรี เช็คเบอร์โทรศัพท์ด้วย AI ดูคู่เลข ผลรวมเบอร์ เกรด A-F และกราฟพลังงาน 6 ด้าน เหมาะสำหรับเช็กเบอร์ใหม่ เบอร์มือสอง และเบอร์เสริมดวง';

export const metadata: Metadata = {
    metadataBase: new URL(baseUrl),
    title: phonePageTitle,
    description: phonePageDescription,
    keywords: [
        'วิเคราะห์เบอร์มงคล',
        'เช็คเบอร์มงคล',
        'เบอร์มงคล',
        'วิเคราะห์เบอร์โทรศัพท์',
        'เช็คเบอร์โทรศัพท์',
        'กราฟพลังงานเบอร์ 6 ด้าน',
        'เกรดเบอร์ A-F',
        'คู่เลขมงคล',
        'ผลรวมเบอร์มงคล',
        'เบอร์มือถือมงคล',
        'เบอร์เสริมดวง',
        'เบอร์มือสอง',
        'AI วิเคราะห์เบอร์',
    ],
    openGraph: {
        title: phonePageTitle,
        description: phonePageDescription,
        url: phonePageUrl,
        siteName: 'NameMongkol',
        locale: 'th_TH',
        type: 'website',
        images: [`${baseUrl}/api/og?variant=phone`],
    },
    twitter: {
        card: 'summary_large_image',
        title: phonePageTitle,
        description: phonePageDescription,
        images: [`${baseUrl}/api/og?variant=phone`],
    },
    alternates: {
        canonical: phonePageUrl,
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
};

export default function PhoneAnalysisPage() {
    const softwareId = `${phonePageUrl}#software`;
    const webPageId = `${phonePageUrl}#webpage`;

    const jsonLd = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'WebPage',
                '@id': webPageId,
                url: phonePageUrl,
                name: phonePageTitle,
                description: phonePageDescription,
                inLanguage: 'th-TH',
                isPartOf: {
                    '@type': 'WebSite',
                    '@id': `${baseUrl}/#website`,
                    name: 'NameMongkol',
                    url: baseUrl,
                },
                about: { '@id': softwareId },
                mainEntity: { '@id': softwareId },
                speakable: {
                    '@type': 'SpeakableSpecification',
                    cssSelector: ['h1', '#phone-faq'],
                },
            },
            {
                '@type': 'SoftwareApplication',
                '@id': softwareId,
                name: 'ระบบวิเคราะห์เบอร์มงคล NameMongkol',
                url: phonePageUrl,
                description: phonePageDescription,
                applicationCategory: 'LifestyleApplication',
                operatingSystem: 'Web',
                provider: {
                    '@type': 'Organization',
                    '@id': `${baseUrl}/#organization`,
                    name: 'NameMongkol',
                    url: baseUrl,
                },
                offers: {
                    '@type': 'Offer',
                    price: '0',
                    priceCurrency: 'THB',
                    availability: 'https://schema.org/InStock',
                },
                featureList: [
                    'เช็คเบอร์โทรศัพท์ 10 หลัก',
                    'วิเคราะห์คู่เลขมงคลและคู่เลขที่ควรระวัง',
                    'ประเมินผลรวมเบอร์และเกรด A-F',
                    'แสดงกราฟพลังงานเบอร์ 6 ด้าน',
                    'ใช้เป็นข้อมูลประกอบการเลือกเบอร์ใหม่หรือเบอร์มือสอง',
                ],
            },
            {
                '@type': 'FAQPage',
                '@id': `${phonePageUrl}#faq`,
                mainEntity: phoneFaqs.map((faq) => ({
                    '@type': 'Question',
                    name: faq.question,
                    acceptedAnswer: {
                        '@type': 'Answer',
                        text: faq.answer,
                    },
                })),
            },
            {
                '@type': 'BreadcrumbList',
                '@id': `${phonePageUrl}#breadcrumb`,
                itemListElement: [
                    { '@type': 'ListItem', position: 1, name: 'หน้าแรก', item: baseUrl },
                    { '@type': 'ListItem', position: 2, name: 'วิเคราะห์เบอร์มงคล', item: phonePageUrl },
                ],
            },
            {
                '@type': 'HowTo',
                '@id': `${phonePageUrl}#howto`,
                name: 'วิธีวิเคราะห์เบอร์โทรศัพท์มงคล',
                description: 'ขั้นตอนการเช็คเบอร์มงคลฟรีบน NameMongkol เพื่อดูคู่เลข ผลรวม เกรดเบอร์ และกราฟพลังงาน 6 ด้าน',
                totalTime: 'PT1M',
                step: [
                    {
                        '@type': 'HowToStep',
                        position: 1,
                        name: 'กรอกเบอร์โทรศัพท์',
                        text: 'ใส่เบอร์โทรศัพท์ 10 หลักที่ต้องการตรวจสอบในช่องวิเคราะห์เบอร์',
                    },
                    {
                        '@type': 'HowToStep',
                        position: 2,
                        name: 'ให้ระบบวิเคราะห์คู่เลขและผลรวม',
                        text: 'ระบบจะตรวจคู่เลขสำคัญ ผลรวมเบอร์ และองค์ประกอบตัวเลขโดยรวม',
                    },
                    {
                        '@type': 'HowToStep',
                        position: 3,
                        name: 'อ่านผลเกรดและกราฟพลังงาน',
                        text: 'ดูเกรดเบอร์ A-F พร้อมกราฟพลังงาน 6 ด้านเพื่อเห็นจุดเด่นและจุดที่ควรระวัง',
                    },
                    {
                        '@type': 'HowToStep',
                        position: 4,
                        name: 'ใช้ข้อมูลประกอบการตัดสินใจ',
                        text: 'นำผลวิเคราะห์ไปประกอบการเลือกใช้เบอร์เดิม เปลี่ยนเบอร์ใหม่ หรือเช็กเบอร์มือสองก่อนซื้อ',
                    },
                ],
            },
        ],
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <div id="phone-analysis-tool">
                <Suspense fallback={
                    <div className="min-h-screen flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-400" />
                    </div>
                }>
                    <ClientPage />
                </Suspense>
            </div>

            <div className="w-full">
                <PhoneSeoContent />
                <PhoneFAQSection />
            </div>
        </>
    );
}
