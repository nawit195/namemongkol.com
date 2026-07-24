import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { siteUrl } from '@/lib/seo';
import { thaksaConfig, VOWELS } from '@/data/thaksaConfig';
import { boyNamesCurated } from '@/data/boyNamesCurated';
import { NamingFAQSection } from '@/components/names/NamingFAQSection';
import { RelatedPagesNav } from '@/components/names/RelatedPagesNav';
import { DayKey } from '@/types';

const baseUrl = siteUrl.replace(/\/$/, '');
const pageTitle = 'ตั้งชื่อลูกชายตามวันเกิด 2569 — ชื่อมงคลตามหลักทักษาปกรณ์ | NameMongkol';
const pageDescription = 'ตั้งชื่อลูกชายตามวันเกิด จันทร์-อาทิตย์ พร้อมตารางอักษรที่เป็นมงคลและกาลกิณี เลือกชื่อลูกชายให้เสริมดวงตามหลักทักษาปกรณ์';

export const metadata: Metadata = {
    title: { absolute: pageTitle },
    alternates: { canonical: `${baseUrl}/names/boys/by-birthday` },
    description: pageDescription,
    keywords: ['ตั้งชื่อลูกชายตามวันเกิด', 'ชื่อลูกชายตามวันเกิด', 'ตั้งชื่อลูกชายตามวันเกิด 2569', 'ชื่อลูกชายกาลกิณี', 'อักษรมงคล', 'อักษรกาลกิณี', 'ตั้งชื่อลูก'],
    openGraph: {
        title: pageTitle,
        description: pageDescription,
        url: `${baseUrl}/names/boys/by-birthday`,
        siteName: 'NameMongkol',
        locale: 'th_TH',
        type: 'website',
    },
};

const faqs = [
    {
        question: 'วันพุธกลางวันกับกลางคืน นับอย่างไร?',
        answer: 'วันพุธกลางวัน คือ เกิดวันพุธ เวลา 06.00 น. ถึง 17.59 น. ส่วนวันพุธกลางคืน (ราหู) คือ เกิดวันพุธ เวลา 18.00 น. ถึง 05.59 น. ของเช้าวันพฤหัสบดี ซึ่งทั้งสองเวลานี้จะมีอักษรกาลกิณีที่แตกต่างกันอย่างสิ้นเชิง'
    },
    {
        question: 'ถ้าชื่อลูกชายมีสระเป็นกาลกิณี (เช่น เกิดวันจันทร์) ต้องทำอย่างไร?',
        answer: 'เด็กที่เกิดวันจันทร์ห้ามใช้สระทุกชนิด (ยกเว้น ไม้หันอากาศ และ การันต์ ที่อนุโลมให้ใช้ได้) ดังนั้นชื่อเด็กวันจันทร์จึงมักเป็นชื่อที่สะกดด้วยพยัญชนะล้วน เช่น กร, ณัชญ์, ธนพัฒน์'
    },
    {
        question: 'ควรเลือกอักษรวรรคไหนนำหน้าชื่อลูกชาย?',
        answer: 'ส่วนใหญ่นิยมใช้ เดช (อำนาจบารมี ผู้นำ), ศรี (โชคลาภ เสน่ห์), หรือ มูละ (ทรัพย์สิน มรดก) เป็นอักษรตัวแรกของชื่อ'
    }
];

const days: DayKey[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'wednesday_night', 'thursday', 'friday', 'saturday'];

export default function BoysByBirthdayPage() {
    const webPageJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        '@id': `${baseUrl}/names/boys/by-birthday#webpage`,
        'url': `${baseUrl}/names/boys/by-birthday`,
        'name': pageTitle,
        'description': pageDescription,
    };

    const breadcrumbJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'หน้าแรก', 'item': baseUrl },
            { '@type': 'ListItem', 'position': 2, 'name': 'ตั้งชื่อลูกชาย', 'item': `${baseUrl}/names/boys` },
            { '@type': 'ListItem', 'position': 3, 'name': 'ตามวันเกิด', 'item': `${baseUrl}/names/boys/by-birthday` },
        ],
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
            
            <section className="w-full bg-white px-4 pt-12 pb-8 text-[#1a1a3e]">
                <div className="mx-auto max-w-4xl text-center">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-500 mb-4">Naming By Birthday</p>
                    <h1 className="text-3xl font-bold leading-snug sm:text-4xl text-slate-900 mb-6">
                        ตั้งชื่อลูกชายตามวันเกิด<br className="hidden sm:block" />เลือกชื่อที่เหมาะกับดวงชะตา
                    </h1>
                    <p className="mx-auto max-w-2xl text-sm leading-7 text-slate-600 sm:text-base mb-8">
                        การเลือกชื่อลูกชายตาม <strong>&ldquo;ทักษาปกรณ์&rdquo;</strong> 
                        เพื่อหาพยัญชนะที่เป็นมงคล เสริมสร้างความเป็นผู้นำ (เดช) บารมี และโชคลาภ (ศรี) 
                        โดยหลีกเลี่ยงพยัญชนะกาลกิณีของวันเกิดแต่ละวัน
                    </p>
                    <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 max-w-3xl mx-auto">
                        <div className="rounded-2xl overflow-hidden shadow-md border border-slate-100 relative aspect-[4/3]">
                            <Image src="/images/boys-naming-calendar-1.jpg" alt="ไอเดียตั้งชื่อลูกชายตามวันเกิด" fill className="object-cover hover:scale-105 transition-transform duration-500" />
                        </div>
                        <div className="rounded-2xl overflow-hidden shadow-md border border-slate-100 relative aspect-[4/3]">
                            <Image src="/images/boys-naming-calendar-2.jpg" alt="ตั้งชื่อลูกชายเสริมดวง" fill className="object-cover hover:scale-105 transition-transform duration-500" />
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
                            const suitableNames = boyNamesCurated
                                .filter(n => n.suitableDays.includes(dayKey))
                                .slice(0, 6);

                            return (
                                <div key={dayKey} className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
                                    <div className="flex flex-col md:flex-row md:items-start gap-6">
                                        
                                        <div className="md:w-1/3">
                                            <h2 className="text-xl font-bold text-slate-900 mb-4 border-b pb-2 border-slate-100">
                                                ลูกชายเกิด {config.name}
                                            </h2>
                                            
                                            <div className="space-y-4">
                                                <div>
                                                    <p className="text-xs font-bold text-slate-400 mb-1">อักษรเสริมอำนาจ (เดช)</p>
                                                    <p className="font-medium text-slate-700">{config.dech === VOWELS ? 'สระทั้งหมด' : config.dech.join(', ')}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-slate-400 mb-1">อักษรเสริมความสำเร็จ (มนตรี)</p>
                                                    <p className="font-medium text-sky-600">{config.montri === VOWELS ? 'สระทั้งหมด' : config.montri.join(', ')}</p>
                                                </div>
                                                <div className="rounded-lg bg-red-50 p-3 border border-red-100">
                                                    <p className="text-xs font-bold text-red-800 mb-1">อักษรกาลกิณี (ห้ามใช้)</p>
                                                    <p className="font-medium text-red-600">{kaliDisplay}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="md:w-2/3 md:border-l border-slate-100 md:pl-6">
                                            <p className="text-sm font-bold text-slate-500 mb-4">ตัวอย่างชื่อลูกชายที่เหมาะกับ{config.name}</p>
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
                                                <Link prefetch={false} href={`/names/boys/by-birthday/${dayKey}`} className="text-sm font-medium text-sky-600 hover:underline flex items-center justify-end gap-1">
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
            <RelatedPagesNav currentPath="/names/boys/by-birthday" />
        </>
    );
}
