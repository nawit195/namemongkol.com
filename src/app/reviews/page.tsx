import { Metadata } from 'next';
import ClientPage from './ClientPage';
import { createClient } from '@/utils/supabaseServer';
import { Review } from '@/types';
import { siteUrl } from '@/lib/seo';

const baseUrl = siteUrl.replace(/\/$/, '');

export const metadata: Metadata = {
    title: 'รีวิวจากผู้ใช้งานจริง | NameMongkol',
    description: 'รวมประสบการณ์จริงจากผู้ใช้งาน NameMongkol ที่ใช้ระบบวิเคราะห์ชื่อ ค้นหาชื่อมงคล และบริการมงคลออนไลน์',
    keywords: [
        'รีวิว NameMongkol',
        'รีวิววิเคราะห์ชื่อมงคล',
        'รีวิวเปลี่ยนชื่อมงคล',
        'รีวิวเบอร์มงคล',
        'ประสบการณ์ผู้ใช้งาน NameMongkol',
    ],
    openGraph: {
        title: 'รีวิวจากผู้ใช้งานจริง | NameMongkol',
        description: 'ประสบการณ์จริงจากผู้ใช้งาน NameMongkol ที่ไว้ใจเราในเรื่องชื่อมงคล',
        url: `${baseUrl}/reviews`,
        siteName: 'NameMongkol',
        locale: 'th_TH',
        type: 'website',
        images: [`${baseUrl}/api/og?variant=default&title=รีวิวจากทางบ้าน&subtitle=ประสบการณ์จริงจากผู้ใช้%20NameMongkol&tag=Reviews`],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'รีวิวจากผู้ใช้งานจริง | NameMongkol',
        description: 'ประสบการณ์จริงจากผู้ใช้งาน NameMongkol',
        images: [`${baseUrl}/api/og?variant=default&title=รีวิวจากทางบ้าน`],
    },
    alternates: {
        canonical: `${baseUrl}/reviews`,
    },
};

async function getReviews() {
    try {
        const supabase = await createClient();
        const { data } = await supabase
            .from('reviews')
            .select('*')
            .eq('status', 'approved')
            .order('created_at', { ascending: false });

        return (data || []) as Review[];
    } catch (error) {
        console.error('Error fetching reviews:', error);
        return [];
    }
}

export default async function ReviewsPage() {
    const reviews = await getReviews();
    const totalRatings = reviews.length;
    const avgRating = totalRatings > 0
        ? Number((reviews.reduce((sum, review) => sum + review.rating, 0) / totalRatings).toFixed(1))
        : null;

    const reviewedApplication = {
        '@type': 'SoftwareApplication',
        '@id': `${baseUrl}/#software`,
        name: 'NameMongkol',
        url: baseUrl,
        applicationCategory: 'LifestyleApplication',
        operatingSystem: 'Web',
    };

    const aggregateRating = avgRating !== null ? {
        '@type': 'AggregateRating',
        ratingValue: avgRating.toString(),
        reviewCount: totalRatings.toString(),
        bestRating: '5',
        worstRating: '1',
    } : undefined;

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'รีวิวจากผู้ใช้งานจริง NameMongkol',
        description: 'รวมประสบการณ์จริงจากผู้ใช้งาน NameMongkol ที่ใช้เครื่องมือวิเคราะห์ชื่อ ค้นหาชื่อมงคล และบริการเสริมความมงคล',
        url: `${baseUrl}/reviews`,
        mainEntity: {
            ...reviewedApplication,
            description: 'แพลตฟอร์มออนไลน์สำหรับวิเคราะห์ชื่อ ค้นหาชื่อมงคล สร้างชื่อมงคลด้วย AI และบริการมงคลที่เกี่ยวข้อง',
            image: `${baseUrl}/logo.png`,
            ...(aggregateRating && { aggregateRating }),
            review: reviews.slice(0, 20).map((review) => ({
                '@type': 'Review',
                itemReviewed: reviewedApplication,
                reviewRating: {
                    '@type': 'Rating',
                    ratingValue: review.rating.toString(),
                    bestRating: '5',
                    worstRating: '1',
                },
                author: {
                    '@type': 'Person',
                    name: review.nickname,
                    ...(review.is_verified && { identifier: 'verified-user' }),
                },
                datePublished: review.created_at || review.date,
                reviewBody: review.content,
                ...(review.images && review.images.length > 0 && {
                    image: review.images,
                }),
            })),
        },
    };

    const faqJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
            {
                '@type': 'Question',
                name: 'รีวิวใน NameMongkol มาจากผู้ใช้งานจริงหรือไม่?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'รีวิวในหน้า NameMongkol มาจากผู้ใช้งานจริงที่ส่งประสบการณ์ผ่านระบบ และแสดงเฉพาะรีวิวที่ผ่านการอนุมัติแล้ว',
                },
            },
            {
                '@type': 'Question',
                name: 'คะแนนรีวิวในหน้านี้คำนวณจากอะไร?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'คะแนนรีวิวคำนวณจากรีวิวที่ได้รับการอนุมัติและแสดงบนหน้ารีวิว โดยไม่มีการสร้างคะแนนจำลองเมื่อไม่มีข้อมูลรีวิวจริง',
                },
            },
            {
                '@type': 'Question',
                name: 'สามารถเขียนรีวิวหลังใช้งาน NameMongkol ได้หรือไม่?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'ผู้ใช้งานสามารถส่งรีวิวประสบการณ์การใช้งาน NameMongkol ได้ผ่านระบบรีวิว และรีวิวจะถูกตรวจสอบก่อนเผยแพร่บนเว็บไซต์',
                },
            },
        ],
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
            />
            <ClientPage initialReviews={reviews} />
        </>
    );
}
