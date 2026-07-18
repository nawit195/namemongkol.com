import type { Metadata } from 'next';
import { getPublicPetNames } from '@/lib/petNames';
import { siteUrl } from '@/lib/seo';
import { PET_NAME_FAQS } from '@/data/petNameContent';
import ClientPage from './ClientPage';
import { PetNameSeoContent } from './PetNameSeoContent';

const title = 'ชื่อสัตว์เลี้ยงมงคล | ตั้งชื่อหมา ตั้งชื่อแมว ความหมายดี | NameMongkol';
const description = 'ค้นหาชื่อสัตว์เลี้ยงมงคล ตั้งชื่อหมาและตั้งชื่อแมวตามคาแรกเตอร์ ภาษา และความหมาย ทดลองดู 3 ชื่อฟรี พร้อมเลือกปลดล็อกชุดชื่อและคะแนนละเอียด';

export const revalidate = 600;

export const metadata: Metadata = {
    title,
    description,
    alternates: { canonical: `${siteUrl}/pet-name` },
    openGraph: {
        title,
        description,
        url: `${siteUrl}/pet-name`,
        type: 'website',
        siteName: 'NameMongkol',
        images: [{ url: `${siteUrl}/images/articles/modern-thai-business-cat.webp`, width: 640, height: 640, alt: 'เจ้าของกับสัตว์เลี้ยงสำหรับระบบค้นหาชื่อสัตว์เลี้ยงมงคล' }],
    },
    twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [`${siteUrl}/images/articles/modern-thai-business-cat.webp`],
    },
};

export default async function PetNamePage() {
    const names = await getPublicPetNames();
    const schemas = [
        {
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            '@id': `${siteUrl}/pet-name#software`,
            name: 'ระบบค้นหาและวิเคราะห์ชื่อสัตว์เลี้ยงมงคล NameMongkol',
            url: `${siteUrl}/pet-name`,
            applicationCategory: 'LifestyleApplication',
            operatingSystem: 'Web',
            isAccessibleForFree: true,
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'THB', description: 'ทดลองดูรายชื่อสัตว์เลี้ยงมงคล 3 ชื่อฟรี' },
            description,
            featureList: ['ทดลองดูชื่อสัตว์เลี้ยง 3 ชื่อฟรี', 'กรองตามคาแรกเตอร์และภาษา', 'ปลดล็อกชุดชื่อ 12 ชื่อ', 'วิเคราะห์ชื่อที่มีอยู่', 'บันทึกชื่อที่ชอบ'],
        },
        {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'หน้าแรก', item: siteUrl },
                { '@type': 'ListItem', position: 2, name: 'ชื่อสัตว์เลี้ยงมงคล', item: `${siteUrl}/pet-name` },
            ],
        },
        {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: PET_NAME_FAQS.map((item) => ({
                '@type': 'Question',
                name: item.question,
                acceptedAnswer: { '@type': 'Answer', text: item.answer },
            })),
        },
    ];

    return (
        <>
            {schemas.map((schema, index) => (
                <script
                    key={index}
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }}
                />
            ))}
            <ClientPage nameCount={names.length} />
            <PetNameSeoContent />
        </>
    );
}
