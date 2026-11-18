import AboutSection from '@/components/AboutSection';
import { Metadata } from 'next';
import { siteUrl } from '@/lib/seo';
import { namingBrandDescription, namingScienceNames, premiumCurationDescription, namingContentUpdatedAt } from '@/data/namingApproach';
import { NamingApproachSummary } from '@/components/NamingApproachSummary';

const aboutUrl = `${siteUrl}/about`;
const founderImageUrl = `${siteUrl}/images/about/teacher-nut-namemongkol.webp`;

export const metadata: Metadata = {
    title: {
        absolute: 'เกี่ยวกับ NameMongkol | วิเคราะห์ชื่อ เบอร์ ลายมือ และพลังมงคล',
    },
    description: `${namingBrandDescription} และฐานรายชื่อพรีเมียมที่ทีมงานคัดกรองล่วงหน้า`,
    keywords: [
        'เกี่ยวกับ NameMongkol',
        'วิเคราะห์ชื่อมงคล',
        'ตั้งชื่อมงคล',
        'วิเคราะห์เบอร์มงคล',
        'วิเคราะห์ลายมือ',
        'วิเคราะห์ออร่า',
        'วอลเปเปอร์มงคล',
        'เลขศาสตร์',
        'ทักษาปกรณ์',
        'อายตนะ 6',
    ],
    alternates: { canonical: aboutUrl },
    openGraph: {
        title: 'เกี่ยวกับ NameMongkol | วิเคราะห์ชื่อ เบอร์ ลายมือ และพลังมงคล',
        description: `${namingBrandDescription} ${premiumCurationDescription}`,
        url: aboutUrl,
        siteName: 'NameMongkol',
        locale: 'th_TH',
        type: 'website',
        images: [
            {
                url: `${siteUrl}/api/og?variant=about`,
                width: 1200,
                height: 630,
                alt: 'เกี่ยวกับ NameMongkol แพลตฟอร์มวิเคราะห์ชื่อมงคล',
            },
            {
                url: founderImageUrl,
                width: 1124,
                height: 1354,
                alt: 'อาจารย์ณัฐ ผู้พัฒนา NameMongkol และผู้จัดทำเนื้อหาเรื่องชื่อมงคล',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'เกี่ยวกับ NameMongkol | วิเคราะห์ชื่อ เบอร์ ลายมือ และพลังมงคล',
        description: namingBrandDescription,
        images: [`${siteUrl}/api/og?variant=about`],
    },
};

const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
        {
            '@type': 'Organization',
            '@id': `${siteUrl}/#organization`,
            name: 'NameMongkol',
            alternateName: 'เนมมงคล',
            url: siteUrl,
            logo: {
                '@type': 'ImageObject',
                url: `${siteUrl}/icon-512.png`,
                width: 512,
                height: 512,
            },
            image: {
                '@type': 'ImageObject',
                url: founderImageUrl,
                width: 1124,
                height: 1354,
                caption: 'อาจารย์ณัฐ ผู้พัฒนา NameMongkol และผู้จัดทำเนื้อหาเรื่องชื่อมงคล',
            },
            description: namingBrandDescription,
            foundingDate: '2024',
            areaServed: {
                '@type': 'Country',
                name: 'Thailand',
            },
            sameAs: [
                'https://www.facebook.com/namemongkol',
                'https://line.me/ti/p/@namemongkol',
            ],
            knowsAbout: [
                ...namingScienceNames,
                'การตั้งชื่อมงคล',
                'การวิเคราะห์ชื่อ',
                'การวิเคราะห์เบอร์โทรศัพท์',
                'การวิเคราะห์ลายมือ',
                'การวิเคราะห์ออร่า',
                'วอลเปเปอร์มงคล',
            ],
            contactPoint: {
                '@type': 'ContactPoint',
                contactType: 'customer support',
                availableLanguage: ['Thai'],
            },
        },
        {
            '@type': 'Person',
            '@id': `${siteUrl}/about#teacher-nut`,
            name: 'อาจารย์ณัฐ (NameMongkol)',
            alternateName: 'NameMongkol',
            image: {
                '@type': 'ImageObject',
                url: founderImageUrl,
                width: 1124,
                height: 1354,
                caption: 'อาจารย์ณัฐ ผู้พัฒนา NameMongkol และผู้จัดทำเนื้อหาเรื่องชื่อมงคล',
            },
            description: 'ผู้พัฒนาแนวคิดและระบบวิเคราะห์ชื่อมงคล ที่ผสานหลักศาสตร์ชื่อ ความหมาย ผลรวมเลขศาสตร์ และเทคโนโลยี AI เพื่อช่วยให้ผู้ใช้มีตัวเลือกชื่อที่เหมาะสมและมั่นใจมากขึ้น',
            worksFor: {
                '@id': `${siteUrl}/#organization`,
            },
            knowsAbout: [
                'ศาสตร์ตัวอักษร',
                'เลขศาสตร์ประยุกต์',
                'การตั้งชื่อมงคล',
                'การวิเคราะห์ชื่อ',
                'AI ช่วยวิเคราะห์ชื่อ',
            ],
        },
        {
            '@type': 'AboutPage',
            '@id': aboutUrl,
            url: aboutUrl,
            name: 'เกี่ยวกับ NameMongkol',
            description: 'ข้อมูลเกี่ยวกับ NameMongkol วิธีวิเคราะห์ บริการ และมาตรฐานความเป็นส่วนตัวของแพลตฟอร์ม',
            inLanguage: 'th-TH',
            isPartOf: {
                '@type': 'WebSite',
                '@id': `${siteUrl}/#website`,
                name: 'NameMongkol',
                url: siteUrl,
            },
            about: {
                '@id': `${siteUrl}/#organization`,
            },
            mainEntity: {
                '@id': `${siteUrl}/#organization`,
            },
            primaryImageOfPage: {
                '@type': 'ImageObject',
                url: founderImageUrl,
                width: 1124,
                height: 1354,
                caption: 'อาจารย์ณัฐ ผู้พัฒนา NameMongkol และผู้จัดทำเนื้อหาเรื่องชื่อมงคล',
            },
            breadcrumb: {
                '@type': 'BreadcrumbList',
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
                        name: 'เกี่ยวกับเรา',
                        item: aboutUrl,
                    },
                ],
            },
            dateModified: namingContentUpdatedAt,
            publisher: {
                '@id': `${siteUrl}/#organization`,
            },
        },
    ],
};

export default function AboutPage() {
    return (
        <main className="site-grid-surface min-h-screen pb-28">
            <script
                id="about-json-ld"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <AboutSection />
            <NamingApproachSummary />
        </main>
    );
}
