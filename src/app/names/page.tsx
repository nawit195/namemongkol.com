import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { fetchAllPublicNames } from '@/lib/publicNames';
import { siteUrl } from '@/lib/seo';
import {
    babyNamingTitle, babyNamingDescription, babyNamingCategories, namingBirthdayLinks,
    babyNamingSteps, babyNamingFaqs, selectBabyNameExamples,
} from '@/data/babyNaming';

export const revalidate = 600;
const pageUrl = `${siteUrl}/names`;

export const metadata: Metadata = {
    title: { absolute: babyNamingTitle },
    description: babyNamingDescription,
    alternates: { canonical: pageUrl },
    openGraph: { title: babyNamingTitle, description: babyNamingDescription, url: pageUrl, locale: 'th_TH', type: 'website' },
    twitter: { card: 'summary_large_image', title: babyNamingTitle, description: babyNamingDescription },
};

export default async function BabyNamesPage() {
    const examples = selectBabyNameExamples(await fetchAllPublicNames());
    const jsonLd = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'CollectionPage', '@id': `${pageUrl}#webpage`, url: pageUrl,
                name: babyNamingTitle, description: babyNamingDescription, inLanguage: 'th-TH',
                isPartOf: { '@id': `${siteUrl}/#website` },
                author: { '@type': 'Organization', name: 'ทีมงาน NameMongkol', url: `${siteUrl}/about` },
                mainEntity: { '@id': `${pageUrl}#examples` },
            },
            {
                '@type': 'BreadcrumbList', itemListElement: [
                    { '@type': 'ListItem', position: 1, name: 'หน้าแรก', item: siteUrl },
                    { '@type': 'ListItem', position: 2, name: 'ตั้งชื่อลูก', item: pageUrl },
                ],
            },
            {
                '@type': 'ItemList', '@id': `${pageUrl}#examples`, name: 'ตัวอย่างชื่อลูกพร้อมความหมาย',
                numberOfItems: examples.length,
                itemListElement: examples.map((item, index) => ({
                    '@type': 'ListItem', position: index + 1,
                    item: { '@type': 'DefinedTerm', name: item.name, description: item.meaning },
                })),
            },
            {
                '@type': 'FAQPage', mainEntity: babyNamingFaqs.map((faq) => ({
                    '@type': 'Question', name: faq.question,
                    acceptedAnswer: { '@type': 'Answer', text: faq.answer },
                })),
            },
        ],
    };

    return (
        <main className="bg-[#f8f8fc] px-4 pb-20 pt-10 text-[#1a1a3e] sm:pt-16">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
            <div className="mx-auto max-w-5xl">
                <nav aria-label="เส้นทางหน้าปัจจุบัน" className="mb-8 flex gap-2 text-sm text-[#5a5a82]">
                    <Link href="/" className="underline underline-offset-4">หน้าแรก</Link><span aria-hidden="true">/</span><span>ตั้งชื่อลูก</span>
                </nav>
                <header className="max-w-3xl">
                    <p className="mb-3 text-sm font-semibold text-amber-800">ชื่อแรกที่ครอบครัวเลือกให้</p>
                    <h1 className="text-3xl font-bold leading-snug tracking-tight sm:text-4xl md:text-5xl">ตั้งชื่อลูก พร้อมความหมายและแนวทางเลือกชื่อ</h1>
                    <p className="mt-5 max-w-[70ch] leading-8 text-[#5a5a82]">เริ่มตั้งชื่อลูกจากความหมายที่ชอบและเสียงเรียกที่ใช้ได้ทุกวัน เลือกดูชื่อลูกชาย ลูกสาว ชื่อเล่น หรือชื่อภาษาอังกฤษ แล้วนำตัวเลือกไปอ่านคู่กับนามสกุลก่อนตัดสินใจ หากครอบครัวสนใจทักษาหรือเลขศาสตร์ สามารถใช้เครื่องมือฟรีประกอบการพิจารณาได้</p>
                </header>

                <section aria-labelledby="naming-categories" className="mt-12">
                    <h2 id="naming-categories" className="text-2xl font-bold">เลือกหมวดชื่อที่อยากเริ่มดู</h2>
                    <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {babyNamingCategories.map((category) => (
                            <Link key={category.href} href={category.href} prefetch={false} className="group flex items-center gap-4 rounded-3xl border border-[#ead8ca] bg-[#fffaf6] p-3 shadow-[0_8px_20px_-16px_rgba(124,75,40,0.4)] transition-colors hover:border-[#c9933a] hover:bg-[#fff6ed] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-700 sm:p-4">
                                <span className="relative aspect-[4/5] w-[30%] max-w-[120px] shrink-0 overflow-hidden rounded-[1.1rem] bg-[#f5e6da]">
                                    <Image
                                        src={category.image}
                                        alt={category.imageAlt}
                                        fill
                                        sizes="(min-width: 1280px) 104px, (min-width: 640px) 120px, 112px"
                                        className="object-cover"
                                    />
                                </span>
                                <div className="min-w-0 flex-1 py-1">
                                    <h3 className="text-base font-bold leading-7 text-[#1a1a3e] sm:text-lg">{category.label} <span aria-hidden="true" className="inline-block text-[#a67828] transition-transform motion-safe:group-hover:translate-x-1">→</span></h3>
                                    <p className="mt-2 text-sm leading-6 text-[#5a5a82]">{category.text}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                    <h3 className="mt-7 text-lg font-bold">เลือกชื่อตามวันเกิด</h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                        {namingBirthdayLinks.map(([day, label]) => (
                            <Link key={day} prefetch={false} href={`/names/by-birthday/${day}`} className="rounded-full border border-[#ddddf0] px-4 py-2 text-sm hover:border-amber-400 hover:bg-amber-50">{label}</Link>
                        ))}
                    </div>
                </section>

                <section aria-labelledby="naming-examples" className="mt-14">
                    <h2 id="naming-examples" className="text-2xl font-bold">ตัวอย่างชื่อลูกพร้อมความหมาย</h2>
                    <p className="mt-3 max-w-[70ch] text-sm leading-7 text-[#5a5a82]">ตัวอย่างจากชุดรายชื่อคัดสรรและข้อมูลความหมายที่อนุมัติแล้ว หมวดเพศเป็นแนวทางค้นหา ชื่อหลายชื่อใช้ได้กับทุกเพศ คำอ่านจะแสดงเมื่อได้รับอนุมัติเท่านั้น</p>
                    {examples.length > 0 ? (
                        <div className="mt-6 grid gap-x-8 sm:grid-cols-2">
                            {examples.map((item) => (
                                <article key={item.name} className="flex flex-col border-b border-[#ddddf0] py-6">
                                    <p className="text-xs font-medium text-[#5a5a82]">{item.gender === 'male' ? 'ไอเดียชื่อลูกชาย' : 'ไอเดียชื่อลูกสาว'}</p>
                                    <h3 className="mt-2 text-2xl font-bold">{item.name}</h3>
                                    {item.pronunciationStatus === 'approved' && item.pronunciation && <p className="mt-2 text-sm text-[#5a5a82]">คำอ่าน: {item.pronunciation}</p>}
                                    <p className="mt-2 flex-1 leading-7 text-[#5a5a82]">{item.meaning}</p>
                                    <Link prefetch={false} href={`/name-check?name=${encodeURIComponent(item.name)}`} data-track="funnel.search.name_analyze" className="mt-4 inline-flex min-h-11 items-center self-start rounded-xl bg-[#0f172a] px-5 py-2 text-sm font-semibold text-slate-100 hover:bg-[#1e293b]">วิเคราะห์ชื่อนี้ <span className="sr-only"> {item.name}</span></Link>
                                </article>
                            ))}
                        </div>
                    ) : <p className="mt-5 leading-7 text-[#5a5a82]">กำลังเตรียมตัวอย่างที่ตรวจสอบความหมายแล้ว ระหว่างนี้เลือกดูรายชื่อในหมวดด้านบนได้</p>}
                </section>

                <section aria-labelledby="naming-guide" className="mt-14 max-w-3xl">
                    <h2 id="naming-guide" className="text-2xl font-bold">5 ขั้นตอนเลือกชื่อที่ครอบครัวใช้ได้จริง</h2>
                    <ol className="mt-6 space-y-6">
                        {babyNamingSteps.map((step, index) => <li key={step.name}><h3 className="text-lg font-bold">{index + 1}. {step.name}</h3><p className="mt-2 leading-8 text-[#5a5a82]">{step.text}</p></li>)}
                    </ol>
                    <p className="mt-6 text-sm leading-7 text-[#5a5a82]">ความหมายของชื่อเป็นข้อมูลทางภาษา ส่วนเลขศาสตร์และทักษาเป็นการตีความตามความเชื่อ อ่านรายละเอียดที่ <Link href="/methodology" className="font-semibold underline underline-offset-4">วิธีคำนวณและนโยบายบรรณาธิการ</Link></p>
                </section>

                <section aria-labelledby="naming-faq" className="mt-14 max-w-3xl">
                    <h2 id="naming-faq" className="text-2xl font-bold">คำถามที่พบบ่อยเกี่ยวกับการตั้งชื่อลูก</h2>
                    <div className="mt-6 divide-y divide-[#ddddf0]">
                        {babyNamingFaqs.map((faq) => <details key={faq.question} className="py-5"><summary className="cursor-pointer text-lg font-semibold leading-7">{faq.question}</summary><p className="mt-3 leading-8 text-[#5a5a82]">{faq.answer}</p></details>)}
                    </div>
                </section>

                <aside className="mt-12 rounded-2xl bg-[#0f172a] p-6 text-slate-100 sm:p-8">
                    <h2 className="text-2xl font-bold">มีชื่อที่ชอบแล้ว ลองอ่านผลร่วมกับนามสกุล</h2>
                    <p className="mt-3 max-w-[70ch] leading-7 text-slate-300">เช็กผลรวมเลขศาสตร์ คู่เลข และทักษาในเครื่องมือวิเคราะห์ชื่อฟรี หรือค้นหาตัวเลือกเพิ่มตามเงื่อนไขที่ต้องการ</p>
                    <div className="mt-5 flex flex-wrap gap-3">
                        <Link href="/name-check" data-track="funnel.search.name_analyze" className="rounded-xl bg-amber-300 px-5 py-3 font-bold text-slate-950 hover:bg-amber-200">วิเคราะห์ชื่อและนามสกุลฟรี</Link>
                        <Link href="/search" className="rounded-xl border border-slate-600 px-5 py-3 font-semibold hover:bg-[#1e293b]">ค้นหาชื่อมงคลเพิ่มเติม</Link>
                    </div>
                </aside>
                <p className="mt-8 text-sm leading-7 text-[#5a5a82]">จัดทำโดย <Link href="/about" className="underline underline-offset-4">ทีมงาน NameMongkol</Link> · <Link href="/methodology" className="underline underline-offset-4">หลักการตรวจสอบข้อมูลและการแก้ไข</Link></p>
            </div>
        </main>
    );
}
