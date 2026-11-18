import { Metadata } from 'next';
import ClientPage from './ClientPage';
import { siteUrl } from '@/lib/seo';
import { namingBrandDescription, premiumCurationDescription, namingScienceNames, premiumAnalysisDescription } from '@/data/namingApproach';
import { NamingApproachSummary, NamingApproachFaq } from '@/components/NamingApproachSummary';

const baseUrl = siteUrl.replace(/\/$/, '');

export const metadata: Metadata = {
    title: { absolute: 'วิเคราะห์ชื่อมงคลขั้นสูง - เจาะลึกดวงชะตาด้วยทักษาและเลขศาสตร์ | NameMongkol' },
    description: premiumAnalysisDescription,
    keywords: ['วิเคราะห์ชื่อมงคลขั้นสูง', 'ชื่อมงคล Premium', 'ทักษาปกรณ์', 'เลขศาสตร์ชั้นสูง', 'ดูดวงชื่อ', 'ตั้งชื่อตามวันเกิด', 'เปลี่ยนชื่อมงคล', 'วันทางโหราศาสตร์', 'เวลาตกฟาก', 'NameMongkol'],

    openGraph: {
        title: 'วิเคราะห์ชื่อมงคลขั้นสูง - เจาะลึกดวงชะตาด้วยทักษาและเลขศาสตร์',
        description: premiumAnalysisDescription,
        url: `${baseUrl}/premium-analysis`,
        siteName: 'NameMongkol',
        locale: 'th_TH',
        type: 'website',
        images: [`${baseUrl}/api/og?variant=default&title=วิเคราะห์ชื่อมงคลขั้นสูง&subtitle=คัดจากฐานพรีเมียม%20ตามวันเกิดและนามสกุล&tag=Premium%20Analysis`],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'วิเคราะห์ชื่อมงคลขั้นสูง - เจาะลึกดวงชะตา | NameMongkol',
        description: premiumAnalysisDescription,
        images: [`${baseUrl}/api/og?variant=default&title=วิเคราะห์ชื่อมงคลขั้นสูง`],
    },
    alternates: {
        canonical: `${baseUrl}/premium-analysis`,
    },
};

// Enhanced JSON-LD Schema - Service type for astrology/naming services
const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
        {
            '@type': 'WebPage',
            '@id': `${baseUrl}/premium-analysis#webpage`,
            'url': `${baseUrl}/premium-analysis`,
            'name': 'วิเคราะห์ชื่อมงคลขั้นสูง - เจาะลึกดวงชะตาด้วยทักษาและเลขศาสตร์ | NameMongkol',
            'description': premiumAnalysisDescription,
            'inLanguage': 'th-TH',
            'about': namingScienceNames.map(name => ({ '@type': 'Thing', name })),
            'isPartOf': { '@id': `${baseUrl}/#website` },
        },
        {
            '@type': 'SoftwareApplication',
            '@id': `${baseUrl}/premium-analysis#software`,
            'name': 'NameMongkol Premium Analysis',
            'description': namingBrandDescription,
            'featureList': [premiumCurationDescription],
            'applicationCategory': 'LifestyleApplication',
            'operatingSystem': 'Web',
        },
        {
            '@type': 'Service',
            'name': 'วิเคราะห์ชื่อมงคลขั้นสูง - NameMongkol Premium Analysis',
            'alternateName': 'NameMongkol Premium Naming Analysis',
            'description': premiumAnalysisDescription,
            'provider': {
                '@type': 'Organization',
                'name': 'NameMongkol',
                'url': baseUrl
            },
            'serviceType': 'Astrology and Numerology Consultation',
            'areaServed': 'TH',
            'url': `${baseUrl}/premium-analysis`,
            'hasOfferCatalog': {
                '@type': 'OfferCatalog',
                'name': 'ฟีเจอร์การวิเคราะห์ชื่อมงคลขั้นสูง',
                'itemListElement': [
                    {
                        '@type': 'Offer',
                        'itemOffered': {
                            '@type': 'Service',
                            'name': 'ใช้เวลาเกิดประกอบการเลือกวันทางโหราศาสตร์'
                        }
                    },
                    {
                        '@type': 'Offer',
                        'itemOffered': {
                            '@type': 'Service',
                            'name': 'เจาะลึกเฉพาะด้าน (การเงิน/การงาน/ความรัก/สุขภาพ/อุปถัมภ์)'
                        }
                    },
                    {
                        '@type': 'Offer',
                        'itemOffered': {
                            '@type': 'Service',
                            'name': 'คำนวณผลรวมเลขศาสตร์และอักษรกาลกิณี'
                        }
                    }
                ]
            }
        },
        {
            '@type': 'BreadcrumbList',
            '@id': `${baseUrl}/premium-analysis#breadcrumb`,
            'itemListElement': [
                {
                    '@type': 'ListItem',
                    'position': 1,
                    'name': 'หน้าแรก',
                    'item': baseUrl,
                },
                {
                    '@type': 'ListItem',
                    'position': 2,
                    'name': 'วิเคราะห์ชื่อมงคลขั้นสูง',
                    'item': `${baseUrl}/premium-analysis`,
                },
            ],
        }
    ]
};

export default function PremiumAnalysisPage() {
    return (
        <>
            <script
                id="premium-analysis-json-ld"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <ClientPage />
            <NamingApproachSummary premium />
            <NamingApproachFaq />
        </>
    );
}
