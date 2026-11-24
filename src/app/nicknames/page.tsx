import type { Metadata } from 'next';
import { Suspense } from 'react';
import { siteUrl } from '@/lib/seo';
import { DEFAULT_NICKNAME_FILTERS } from '@/lib/auspiciousNicknameShared';
import { queryNicknames } from '@/lib/auspiciousNicknames';
import NicknameBrowser from './NicknameBrowser';

export const revalidate = 600;
const title = 'ชื่อเล่นมงคล พร้อมความหมายและวันเกิด';
const description =
    'ค้นหาชื่อเล่นมงคลเกรด A และ B ฟรี พร้อมความหมาย เพศ ผลรวมและวันเกิดที่ใช้ได้ เลือกชื่อเล่นเกรด A+ เพิ่มด้วยเครดิต และเก็บชื่อที่ถูกใจไว้เลือกภายหลัง';
const shareImage = `${siteUrl}/api/og?${new URLSearchParams({
    variant: 'default',
    title: 'ชื่อเล่นมงคล',
    subtitle: 'เลือกจากความหมาย วันเกิด และเลขศาสตร์',
})}`;
export const metadata: Metadata = {
    title,
    description,
    alternates: { canonical: `${siteUrl}/nicknames` },
    openGraph: {
        title,
        description,
        url: `${siteUrl}/nicknames`,
        locale: 'th_TH',
        type: 'website',
        images: [{ url: shareImage, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [shareImage] },
};

export default function NicknamesPage() {
    const initial = queryNicknames(DEFAULT_NICKNAME_FILTERS).response;
    return (
        <Suspense
            fallback={
                <div className="mx-auto max-w-6xl px-4 py-12" role="status">
                    กำลังเตรียมชื่อเล่นมงคล…
                </div>
            }
        >
            <NicknameBrowser initial={initial} />
        </Suspense>
    );
}
