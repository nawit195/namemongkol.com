import type { Metadata } from 'next';

import ClientHome from './ClientHome';
import { ogImageUrl, siteUrl } from '@/lib/seo';

const baseUrl = siteUrl.replace(/\/$/, '');
const pageTitle = 'NameMongkol | ค้นหาและวิเคราะห์ชื่อมงคลตามวันเกิด';
const pageDescription = 'ศูนย์รวมเครื่องมือค้นหาชื่อมงคล วิเคราะห์ชื่อกับนามสกุล ตั้งชื่อลูก และเปลี่ยนชื่อ พร้อมคำอธิบายวิธีคำนวณและข้อจำกัดที่ตรวจสอบได้';
const homeOgImage = ogImageUrl({
  variant: 'default',
  title: 'NameMongkol ศูนย์รวมเครื่องมือชื่อมงคล',
  subtitle: 'ค้นหาชื่อ วิเคราะห์ชื่อ ตั้งชื่อลูก และเปลี่ยนชื่อ',
});

const brandServices = [
  {
    href: '/name-check',
    name: 'วิเคราะห์ชื่อและนามสกุลฟรี',
    text: 'ตรวจชื่อเดียวแบบละเอียด เห็นผลรวม คู่เลข ทักษา และความสัมพันธ์กับนามสกุล',
  },
  {
    href: '/search',
    name: 'ค้นหาชื่อมงคล',
    text: 'เลือกชื่อจากความหมาย เพศ วันเกิด และผลรวมเลขศาสตร์ก่อนนำไปตรวจชื่อเต็ม',
  },
  {
    href: '/premium-search',
    name: 'คัดชื่อแบบ Premium',
    text: 'เปรียบเทียบตัวเลือกและคัดชื่อร่วมกับเป้าหมาย นามสกุล และเงื่อนไขเฉพาะบุคคล',
  },
] as const;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: pageTitle,
    description: pageDescription,
    keywords: [
      'NameMongkol',
      'เนมมงคล',
      'เครื่องมือชื่อมงคล',
      'ค้นหาชื่อมงคล',
      'ตั้งชื่อลูก',
      'เปลี่ยนชื่อมงคล',
    ],
    alternates: { canonical: baseUrl },
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      images: [{
        url: homeOgImage,
        width: 1200,
        height: 630,
        alt: 'NameMongkol ศูนย์รวมเครื่องมือค้นหาและวิเคราะห์ชื่อมงคล',
        type: 'image/png',
      }],
      url: baseUrl,
      siteName: 'NameMongkol',
      locale: 'th_TH',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
      images: [{
        url: homeOgImage,
        width: 1200,
        height: 630,
        alt: 'NameMongkol ศูนย์รวมเครื่องมือค้นหาและวิเคราะห์ชื่อมงคล',
      }],
    },
  };
}

export default async function Page() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${baseUrl}/#organization`,
        'name': 'NameMongkol',
        'alternateName': 'เนมมงคล',
        'url': baseUrl,
        'logo': {
          '@type': 'ImageObject',
          'url': `${baseUrl}/icon-512.png`,
          'width': 512,
          'height': 512
        },
        'sameAs': [
          'https://www.facebook.com/namemongkol',
          'https://line.me/ti/p/@namemongkol'
        ]
      },
      {
        '@type': 'WebSite',
        '@id': `${baseUrl}/#website`,
        'url': baseUrl,
        'name': 'NameMongkol',
        'alternateName': 'เนมมงคล',
        'description': 'ศูนย์รวมเครื่องมือวิเคราะห์ชื่อฟรี ถอดอักษรเป็นเลขศาสตร์ วิเคราะห์คู่เลขในชื่อ ค้นหาชื่อมงคล ตั้งชื่อลูก เปลี่ยนชื่อ วิเคราะห์เบอร์โทร ลายมือ ออร่า และวอลเปเปอร์เสริมดวง',
        'inLanguage': 'th-TH',
        'publisher': { '@id': `${baseUrl}/#organization` },
        'potentialAction': {
          '@type': 'SearchAction',
          'target': {
            '@type': 'EntryPoint',
            'urlTemplate': `${baseUrl}/search?q={search_term_string}`
          },
          'query-input': 'required name=search_term_string'
        }
      },
      {
        '@type': 'WebPage',
        '@id': `${baseUrl}/#webpage`,
        'url': baseUrl,
        'name': pageTitle,
        'isPartOf': { '@id': `${baseUrl}/#website` },
        'about': { '@id': `${baseUrl}/#organization` },
        'publisher': { '@id': `${baseUrl}/#organization` },
        'description': pageDescription,
        'inLanguage': 'th-TH',
        'isAccessibleForFree': true,
        'dateModified': '2026-05-25',
        'primaryImageOfPage': {
          '@type': 'ImageObject',
          'url': homeOgImage,
          'width': 1200,
          'height': 630,
          'caption': 'NameMongkol ศูนย์รวมเครื่องมือค้นหาและวิเคราะห์ชื่อมงคล'
        },
        'speakable': {
          '@type': 'SpeakableSpecification',
          'cssSelector': ['h1', '#home-seo-answer']
        }
      },
      {
        '@type': 'ItemList',
        '@id': `${baseUrl}/#services`,
        'name': 'เครื่องมือหลักของ NameMongkol',
        'itemListElement': brandServices.map((service, index) => ({
          '@type': 'ListItem',
          'position': index + 1,
          'name': service.name,
          'description': service.text,
          'url': `${baseUrl}${service.href}`,
        })),
      },
      {
        '@type': 'BreadcrumbList',
        'itemListElement': [
          {
            '@type': 'ListItem',
            'position': 1,
            'name': 'NameMongkol',
            'item': baseUrl
          }
        ]
      }
    ]
  };

  return (
    <>
      <script
        id="home-json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ClientHome heroHeadingLevel="h1" />
    </>
  );
}
