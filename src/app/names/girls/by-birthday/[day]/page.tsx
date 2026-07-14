import type { Metadata } from 'next';
import { BirthdayDayLandingPage, BIRTHDAY_DAY_KEYS, getBirthdayPageCopy, isBirthdayDay } from '@/components/names/BirthdayDayLandingPage';
import { siteUrl } from '@/lib/seo';

export const dynamicParams = false;
export const revalidate = 600;

export function generateStaticParams() {
    return BIRTHDAY_DAY_KEYS.filter((day) => day !== 'monday').map((day) => ({ day }));
}
export async function generateMetadata({ params }: { params: Promise<{ day: string }> }): Promise<Metadata> {
    const { day } = await params;
    if (!isBirthdayDay(day)) return {};
    const copy = getBirthdayPageCopy('girls', day);
    const canonical = `${siteUrl}/names/girls/by-birthday/${day}`;
    return {
        title: { absolute: `${copy.title} | NameMongkol` },
        description: copy.description,
        alternates: { canonical },
        openGraph: { title: copy.title, description: copy.description, url: canonical, locale: 'th_TH', type: 'website' },
    };
}

export default async function GirlsBirthdayDayPage({ params }: { params: Promise<{ day: string }> }) {
    const { day } = await params;
    if (!isBirthdayDay(day)) return null;
    return <BirthdayDayLandingPage gender="girls" day={day} />;
}
