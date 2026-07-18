import Link from 'next/link';
import { ArrowRight, Cat, CheckCircle2, Dog, PawPrint, Sparkles } from 'lucide-react';
import { siteUrl } from '@/lib/seo';
import type { PetNameRecord, PetType } from '@/types/petName';

export type PetSeoCategory = Extract<PetType, 'dog' | 'cat'>;

const categoryCopy = {
    dog: {
        label: 'สุนัข',
        heading: 'ชื่อหมามงคล ความหมายดี เรียกง่าย',
        title: 'ชื่อหมามงคล | ตั้งชื่อหมาความหมายดี เรียกง่าย | NameMongkol',
        description: 'รวมชื่อหมามงคลและชื่อหมาความหมายดี ทั้งชื่อไทย อังกฤษ ญี่ปุ่น และเกาหลี พร้อมคำอ่าน คาแรกเตอร์ และเครื่องมือช่วยค้นหาชื่อที่เหมาะกับน้องหมา',
        eyebrow: 'Lucky Dog Names',
        intro: 'ชื่อหมาที่ดีควรเรียกชัด จำง่าย และเข้ากับบุคลิกของน้อง รายชื่อนี้คัดจากฐานชื่อสัตว์เลี้ยงของ NameMongkol พร้อมความหมายและข้อมูลประกอบ เพื่อช่วยให้เลือกชื่อได้เป็นระบบมากกว่าการสุ่มชื่อจากเสียงที่ชอบเพียงอย่างเดียว',
        tips: ['เลือกเสียงที่เรียกชัดในชีวิตประจำวัน', 'เทียบชื่อกับนิสัยและพลังงานของน้อง', 'หลีกเลี่ยงชื่อที่คล้ายคำสั่งฝึกมากเกินไป', 'ทดลองเรียกหลายครั้งก่อนตัดสินใจ'],
        faqs: [
            { question: 'ชื่อหมามงคลควรเลือกจากอะไร', answer: 'ควรพิจารณาความหมาย เสียงเรียก ความยาว คาแรกเตอร์ และความสะดวกเมื่อต้องเรียกจริง แล้วจึงใช้คะแนนด้านเลขศาสตร์เป็นข้อมูลประกอบตามความเชื่อ' },
            { question: 'ชื่อหมาควรมีกี่พยางค์', answer: 'ชื่อสั้นหนึ่งถึงสองพยางค์มักเรียกได้สะดวก แต่ชื่อที่ยาวกว่านั้นก็ใช้ได้หากมีชื่อย่อที่คนในบ้านเรียกตรงกัน' },
            { question: 'ใช้เครื่องมือค้นหาชื่อหมาฟรีได้ไหม', answer: 'ทดลองดูได้ฟรี 3 ชื่อตามประเภท เพศ คาแรกเตอร์ ภาษา และความหมายเป้าหมาย หากต้องการชุดเต็ม 12 ชื่อพร้อมคะแนนละเอียด สามารถปลดล็อกด้วย 15 เครดิต' },
            { question: 'คะแนนมงคลรับรองผลในชีวิตจริงหรือไม่', answer: 'ไม่รับรองผล คะแนนเป็นข้อมูลตามความเชื่อและศาสตร์การตั้งชื่อ ควรเลือกชื่อที่เหมาะกับน้องและทำให้เจ้าของรู้สึกดีเมื่อนำไปใช้จริง' },
        ],
        siblingHref: '/pet-name/cat',
        siblingLabel: 'ดูชื่อแมวมงคล',
        Icon: Dog,
    },
    cat: {
        label: 'แมว',
        heading: 'ชื่อแมวมงคล นำโชค ความหมายดี',
        title: 'ชื่อแมวมงคล | ตั้งชื่อแมวนำโชค ความหมายดี | NameMongkol',
        description: 'รวมชื่อแมวมงคลและชื่อแมวนำโชค ทั้งชื่อไทย อังกฤษ ญี่ปุ่น และเกาหลี พร้อมคำอ่าน ความหมาย คาแรกเตอร์ และเครื่องมือค้นหาชื่อที่เหมาะกับน้องแมว',
        eyebrow: 'Lucky Cat Names',
        intro: 'ชื่อแมวที่ใช้ได้ดีควรเรียกง่าย มีเสียงและความหมายที่เจ้าของชอบ พร้อมสะท้อนบุคลิกของน้อง รายชื่อนี้แยกจากชื่อหมาเพื่อให้เห็นตัวเลือกที่เหมาะกับแมวโดยเฉพาะ ทั้งสายอ้อน สายซน สายสง่างาม และสายมงคล',
        tips: ['เลือกชื่อให้เข้ากับสีขนหรือบุคลิก', 'ลองเสียงสั้นที่เรียกซ้ำได้ง่าย', 'เลือกความหมายที่เจ้าของรู้สึกผูกพัน', 'เก็บชื่อที่ชอบไว้เปรียบเทียบก่อนเลือก'],
        faqs: [
            { question: 'ชื่อแมวมงคลควรมีความหมายแบบไหน', answer: 'เลือกได้ตามสิ่งที่ต้องการสื่อ เช่น ความสุข โชคลาภ ความรัก ความสง่างาม หรือความสดใส โดยควรเป็นความหมายที่เจ้าของชอบและใช้เรียกได้อย่างมั่นใจ' },
            { question: 'ชื่อแมวไทยหรือชื่อต่างประเทศดีกว่ากัน', answer: 'ไม่มีแบบใดดีกว่าเสมอไป ชื่อไทยให้ความรู้สึกอบอุ่นและเข้าใจความหมายง่าย ส่วนชื่อต่างประเทศช่วยเพิ่มสไตล์และความแตกต่าง ควรเลือกจากเสียงเรียกจริงเป็นหลัก' },
            { question: 'วิเคราะห์ชื่อแมวที่ใช้อยู่แล้วได้ไหม', answer: 'ได้ สามารถกรอกชื่อเดิมในเครื่องมือเพื่อดูคะแนนการออกเสียง ความโดดเด่น และเลขศาสตร์ หากชื่อไม่มีในฐาน ระบบจะไม่สร้างความหมายขึ้นเอง' },
            { question: 'ชื่อแมวมงคลช่วยให้เจ้าของโชคดีจริงไหม', answer: 'เป็นความเชื่อส่วนบุคคล ไม่มีการรับรองผลในชีวิตจริง คุณค่าหลักคือการได้ชื่อที่มีความหมายดี เรียกง่าย และสร้างความผูกพันระหว่างเจ้าของกับสัตว์เลี้ยง' },
        ],
        siblingHref: '/pet-name/dog',
        siblingLabel: 'ดูชื่อหมามงคล',
        Icon: Cat,
    },
} as const;

export function getPetCategoryCopy(category: PetSeoCategory) {
    return categoryCopy[category];
}

export function PetNameCategoryPage({ category, names }: { category: PetSeoCategory; names: PetNameRecord[] }) {
    const copy = categoryCopy[category];
    const canonical = `${siteUrl}/pet-name/${category}`;
    const matchingNames = names.filter((name) => name.isActive && name.petTypes.includes(category));
    const visibleNames = matchingNames.slice(0, 60);
    const schemas = [
        {
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            '@id': `${canonical}#webpage`,
            url: canonical,
            name: copy.title,
            description: copy.description,
            inLanguage: 'th-TH',
            isPartOf: { '@id': `${siteUrl}/#website` },
        },
        {
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: copy.heading,
            numberOfItems: matchingNames.length,
            itemListElement: visibleNames.map((name, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                name: name.nameTh,
                description: name.meaning,
                url: `${canonical}#name-${name.slug}`,
            })),
        },
        {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'หน้าแรก', item: siteUrl },
                { '@type': 'ListItem', position: 2, name: 'ชื่อสัตว์เลี้ยงมงคล', item: `${siteUrl}/pet-name` },
                { '@type': 'ListItem', position: 3, name: copy.heading, item: canonical },
            ],
        },
        {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: copy.faqs.map((item) => ({
                '@type': 'Question',
                name: item.question,
                acceptedAnswer: { '@type': 'Answer', text: item.answer },
            })),
        },
    ];

    return (
        <main className="min-h-screen bg-[#f8f8fc] text-[#1a1a3e]">
            {schemas.map((schema, index) => <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />)}

            <section className="border-b border-[#ddddf0] bg-white px-4 pb-12 pt-28 sm:pt-32">
                <div className="mx-auto max-w-6xl">
                    <nav aria-label="เส้นทางหน้า" className="text-sm text-[#5a5a82]"><Link href="/pet-name" className="hover:text-amber-700">ชื่อสัตว์เลี้ยงมงคล</Link><span className="px-2" aria-hidden="true">/</span><span aria-current="page">ชื่อ{copy.label}มงคล</span></nav>
                    <div className="mt-8 grid items-center gap-8 lg:grid-cols-[1fr_0.7fr]">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">{copy.eyebrow}</p>
                            <h1 className="mt-3 max-w-4xl text-3xl font-extrabold leading-tight sm:text-5xl">{copy.heading}</h1>
                            <p className="mt-5 max-w-[72ch] text-base leading-8 text-[#5a5a82] sm:text-lg">{copy.intro}</p>
                            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                                <Link href="/pet-name#pet-name-tool" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#0f172a] px-5 py-3 font-bold text-white hover:bg-[#1e293b]"><Sparkles className="h-4 w-4" />ค้นหาชื่อที่เหมาะกับน้อง</Link>
                                <Link href={copy.siblingHref} className="inline-flex min-h-11 items-center justify-center rounded-lg border border-amber-300 bg-white px-5 py-3 font-bold text-amber-900 hover:bg-amber-50">{copy.siblingLabel}</Link>
                            </div>
                        </div>
                        <div className="border-y border-[#e8c87e] py-6">
                            <copy.Icon className="h-10 w-10 text-amber-700" aria-hidden="true" />
                            <p className="mt-4 text-sm font-bold text-[#5a5a82]">ฐานชื่อสำหรับ{copy.label}</p>
                            <p className="mt-1 text-4xl font-extrabold text-[#1a1a3e]">{matchingNames.length.toLocaleString('th-TH')}</p>
                            <p className="mt-2 text-sm leading-6 text-[#5a5a82]">ชื่อที่มีข้อมูลความหมาย คำอ่าน ภาษา และคาแรกเตอร์ประกอบ</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="px-4 py-12">
                <div className="mx-auto max-w-6xl">
                    <div className="flex flex-wrap items-end justify-between gap-4">
                        <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-700">Curated Names</p><h2 className="mt-2 text-2xl font-bold">ตัวอย่างชื่อ{copy.label}ความหมายดี</h2></div>
                        <Link href="/pet-name#pet-name-tool" className="inline-flex min-h-11 items-center gap-2 font-bold text-amber-800 hover:underline">ใช้ตัวกรองค้นหาเพิ่มเติม <ArrowRight className="h-4 w-4" /></Link>
                    </div>
                    {visibleNames.length ? (
                        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {visibleNames.map((name) => (
                                <article id={`name-${name.slug}`} key={name.slug} className="rounded-lg border border-[#e6d19b] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
                                    <div className="flex items-start justify-between gap-3"><div><h3 className="text-lg font-extrabold">{name.nameTh}</h3><p className="mt-1 text-xs font-semibold uppercase text-[#8e8eaa]">{name.nameEn} · {name.pronunciation}</p></div><PawPrint className="h-5 w-5 shrink-0 text-amber-600" aria-hidden="true" /></div>
                                    <p className="mt-4 text-sm leading-7 text-[#5a5a82]">{name.meaning}</p>
                                    <div className="mt-4 flex flex-wrap gap-2">{name.traits.slice(0, 2).map((trait) => <span key={trait} className="rounded-full border border-[#ddddf0] bg-[#fafafd] px-2.5 py-1 text-xs font-semibold text-[#5a5a82]">{trait}</span>)}</div>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <div className="mt-6 border-y border-[#ddddf0] py-10 text-center"><PawPrint className="mx-auto h-8 w-8 text-amber-700" /><p className="mt-3 font-bold">กำลังเตรียมรายชื่อ{copy.label}เพิ่มเติม</p></div>
                    )}
                </div>
            </section>

            <section className="border-y border-[#ddddf0] bg-white px-4 py-12">
                <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.8fr_1.2fr]">
                    <div><h2 className="text-2xl font-bold">หลักเลือกชื่อ{copy.label}ให้ใช้ได้จริง</h2><p className="mt-3 leading-7 text-[#5a5a82]">คะแนนช่วยจัดลำดับตัวเลือก แต่ชื่อที่ดีที่สุดควรเหมาะกับสัตว์เลี้ยงและสะดวกสำหรับทุกคนในบ้าน</p></div>
                    <ul className="grid gap-3 sm:grid-cols-2">{copy.tips.map((tip) => <li key={tip} className="flex gap-3 border-b border-[#eeeeF6] pb-3 text-sm leading-6 text-[#5a5a82]"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />{tip}</li>)}</ul>
                </div>
            </section>

            <section className="px-4 py-12">
                <div className="mx-auto max-w-5xl">
                    <h2 className="text-2xl font-bold">คำถามที่พบบ่อยเกี่ยวกับชื่อ{copy.label}มงคล</h2>
                    <div className="mt-6 divide-y divide-[#ddddf0] border-y border-[#ddddf0]">{copy.faqs.map((item) => <article key={item.question} className="py-6"><h3 className="font-bold">{item.question}</h3><p className="mt-2 max-w-[72ch] text-sm leading-7 text-[#5a5a82]">{item.answer}</p></article>)}</div>
                    <div className="mt-10 rounded-lg bg-slate-950 p-6 text-slate-100 sm:p-8"><h2 className="text-2xl font-bold">ให้ระบบช่วยคัดชื่อจากคาแรกเตอร์ของน้อง</h2><p className="mt-3 max-w-[65ch] leading-7 text-slate-300">เลือกเพศ ภาษา สไตล์ จำนวนพยางค์ และความหมายที่ต้องการ ทดลองดู 3 ชื่อฟรี แล้วค่อยปลดล็อกชุดเต็มเมื่อพบแนวชื่อที่ถูกใจ</p><Link href="/pet-name#pet-name-tool" className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-lg bg-amber-400 px-5 py-3 font-bold text-slate-950 hover:bg-amber-300">ทดลองค้นหา 3 ชื่อฟรี <ArrowRight className="h-4 w-4" /></Link></div>
                </div>
            </section>
        </main>
    );
}
