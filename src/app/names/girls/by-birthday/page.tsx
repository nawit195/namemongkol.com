import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { siteUrl } from '@/lib/seo';
import { thaksaConfig, VOWELS } from '@/data/thaksaConfig';
import { girlNamesCurated } from '@/data/girlNamesCurated';
import { NamingFAQSection } from '@/components/names/NamingFAQSection';
import { RelatedPagesNav } from '@/components/names/RelatedPagesNav';
import { DayKey } from '@/types';

const baseUrl = siteUrl.replace(/\/$/, '');
const pageTitle = 'ตั้งชื่อลูกสาวตามวันเกิด 2569 — ชื่อมงคลตามหลักทักษาปกรณ์ | NameMongkol';
const pageDescription = 'ตั้งชื่อลูกสาวตามวันเกิด จันทร์-อาทิตย์ พร้อมตารางอักษรที่เป็นมงคลและกาลกิณี เลือกชื่อลูกสาวให้เสริมดวงตามหลักทักษาปกรณ์';

export const metadata: Metadata = {
    title: { absolute: pageTitle },
    alternates: { canonical: `${baseUrl}/names/girls/by-birthday` },
    description: pageDescription,
    keywords: ['ตั้งชื่อลูกสาวตามวันเกิด', 'ชื่อลูกสาวตามวันเกิด', 'ตั้งชื่อลูกสาวตามวันเกิด 2569', 'ชื่อลูกสาวกาลกิณี', 'อักษรมงคล', 'อักษรกาลกิณี', 'ตั้งชื่อลูก'],
    openGraph: {
        title: pageTitle,
        description: pageDescription,
        url: `${baseUrl}/names/girls/by-birthday`,
        siteName: 'NameMongkol',
        locale: 'th_TH',
        type: 'website',
    },
};

const faqs = [
    {
        question: 'การตั้งชื่อตามวันเกิดมีความสำคัญอย่างไร?',
        answer: 'ตามหลักทักษาปกรณ์ของไทย วันเกิดแต่ละวันจะมีกลุ่มอักษรที่เป็น "มงคล" (เดช ศรี มนตรี) ที่ช่วยเสริมดวงชะตา และอักษรที่เป็น "กาลกิณี" ที่ควรหลีกเลี่ยง การตั้งชื่อโดยอิงวันเกิดจึงเป็นพื้นฐานสำคัญที่สุดในการตั้งชื่อมงคล'
    },
    {
        question: 'อักษรกาลกิณีคืออะไร มีผลอย่างไร?',
        answer: 'กาลกิณี คือ อุปสรรค ความโชคร้าย ความเจ็บป่วย หรือปัญหาที่อาจเข้ามาขัดขวางความสำเร็จ การหลีกเลี่ยงอักษรกาลกิณีในชื่อจึงเปรียบเสมือนการปิดประตูรับความเสี่ยงและเปิดรับเฉพาะพลังงานบวก'
    },
    {
        question: 'ถ้ายังไม่รู้วันเกิดลูกที่แน่นอน ควรตั้งชื่ออย่างไร?',
        answer: 'หากยังไม่คลอด แนะนำให้เตรียมชื่อเผื่อไว้ 2-3 ชื่อสำหรับวันต่างๆ ที่คาดว่าจะคลอด หรือเลือกชื่อที่ใช้อักษรกลางๆ ที่เป็นมงคลกับหลายๆ วันเกิด เมื่อน้องคลอดแล้วค่อยเลือกชื่อที่ตรงกับวันเกิดจริงที่สุด'
    }
];

const days: DayKey[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'wednesday_night', 'thursday', 'friday', 'saturday'];

export default function GirlsByBirthdayPage() {
    const webPageJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        '@id': `${baseUrl}/names/girls/by-birthday#webpage`,
        'url': `${baseUrl}/names/girls/by-birthday`,
        'name': pageTitle,
        'description': pageDescription,
    };

    const breadcrumbJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'หน้าแรก', 'item': baseUrl },
            { '@type': 'ListItem', 'position': 2, 'name': 'ตั้งชื่อลูกสาว', 'item': `${baseUrl}/names/girls` },
            { '@type': 'ListItem', 'position': 3, 'name': 'ตามวันเกิด', 'item': `${baseUrl}/names/girls/by-birthday` },
        ],
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
            
            <section className="w-full bg-white px-4 pt-12 pb-8 text-[#1a1a3e]">
                <div className="mx-auto max-w-4xl text-center">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-pink-500 mb-4">Naming By Birthday</p>
                    <h1 className="text-3xl font-bold leading-snug sm:text-4xl text-slate-900 mb-6">
                        ตั้งชื่อลูกสาวตามวันเกิด<br className="hidden sm:block" />เลือกชื่อที่เหมาะกับดวงชะตา
                    </h1>
                    <p className="mx-auto max-w-2xl text-sm leading-7 text-slate-600 sm:text-base mb-8">
                        พื้นฐานสำคัญของการตั้งชื่อมงคลแบบไทย คือการอิงตาม <strong>&ldquo;ทักษาปกรณ์&rdquo;</strong> 
                        โดยดูจากวันเกิดของลูกสาว เพื่อเลือกอักษรที่เป็นสิริมงคล (เดช ศรี มนตรี) 
                        และหลีกเลี่ยงอักษรต้องห้าม (กาลกิณี)
                    </p>
                    <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 max-w-3xl mx-auto">
                        <div className="rounded-2xl overflow-hidden shadow-md border border-pink-100 relative aspect-[4/3]">
                            <Image src="/images/girls-naming-calendar-1.jpg" alt="ไอเดียตั้งชื่อลูกสาวตามวันเกิด" fill className="object-cover hover:scale-105 transition-transform duration-500" />
                        </div>
                        <div className="rounded-2xl overflow-hidden shadow-md border border-pink-100 relative aspect-[4/3]">
                            <Image src="/images/girls-naming-calendar-2.jpg" alt="ตั้งชื่อลูกสาวเสริมดวง" fill className="object-cover hover:scale-105 transition-transform duration-500" />
                        </div>
                    </div>
                </div>
            </section>

            <section className="w-full bg-[#f8f8fc] px-4 py-12">
                <div className="mx-auto max-w-5xl">
                    <div className="grid gap-8">
                        {days.map((dayKey) => {
                            const config = thaksaConfig[dayKey];
                            const isVowelKali = config.kali === VOWELS;
                            const kaliDisplay = isVowelKali ? 'สระทั้งหมด' : config.kali.join(', ');
                            
                            // Get sample names for this day
                            const suitableNames = girlNamesCurated
                                .filter(n => n.suitableDays.includes(dayKey))
                                .slice(0, 6);

                            return (
                                <div key={dayKey} className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
                                    <div className="flex flex-col md:flex-row md:items-start gap-6">
                                        
                                        <div className="md:w-1/3">
                                            <h2 className="text-xl font-bold text-slate-900 mb-4 border-b pb-2 border-slate-100">
                                                ลูกสาวเกิด {config.name}
                                            </h2>
                                            
                                            <div className="space-y-4">
                                                <div>
                                                    <p className="text-xs font-bold text-slate-400 mb-1">อักษรเสริมบารมี (เดช)</p>
                                                    <p className="font-medium text-slate-700">{config.dech === VOWELS ? 'สระทั้งหมด' : config.dech.join(', ')}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-slate-400 mb-1">อักษรเสริมเสน่ห์ (ศรี)</p>
                                                    <p className="font-medium text-amber-600">{config.si === VOWELS ? 'สระทั้งหมด' : config.si.join(', ')}</p>
                                                </div>
                                                <div className="rounded-lg bg-red-50 p-3 border border-red-100">
                                                    <p className="text-xs font-bold text-red-800 mb-1">อักษรกาลกิณี (ห้ามใช้)</p>
                                                    <p className="font-medium text-red-600">{kaliDisplay}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="md:w-2/3 md:border-l border-slate-100 md:pl-6">
                                            <p className="text-sm font-bold text-slate-500 mb-4">ตัวอย่างชื่อลูกสาวที่เหมาะกับ{config.name}</p>
                                            <div className="grid sm:grid-cols-2 gap-3">
                                                {suitableNames.map(name => (
                                                    <div key={name.name} className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex justify-between items-start">
                                                        <div>
                                                            <p className="font-bold text-slate-800">{name.name}</p>
                                                            <p className="text-xs text-slate-500 mt-1 line-clamp-1" title={name.meaning}>{name.meaning}</p>
                                                        </div>
                                                        <span className="text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-500">
                                                            ผลรวม {name.numerology}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="mt-4 flex flex-wrap justify-end gap-3 text-right">
                                                <Link prefetch={false} href={`/names/by-birthday/${dayKey}`} className="text-sm font-medium text-slate-600 hover:text-amber-700 hover:underline">
                                                    ชื่อมงคลคนเกิด{config.name} ทุกเพศ
                                                </Link>
                                                <Link prefetch={false} href={`/names/girls/by-birthday/${dayKey}`} className="text-sm font-medium text-amber-600 hover:underline flex items-center justify-end gap-1">
                                                    ค้นหาชื่อ{config.name}เพิ่มเติม <span aria-hidden="true">→</span>
                                                </Link>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            <NamingFAQSection faqs={faqs} />
            <RelatedPagesNav currentPath="/names/girls/by-birthday" />
        </>
    );
}
