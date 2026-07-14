import type { Metadata } from 'next';
import Link from 'next/link';
import { siteUrl } from '@/lib/seo';

const canonical = `${siteUrl}/methodology`;

export const metadata: Metadata = {
    title: { absolute: 'วิธีคำนวณวิเคราะห์ชื่อและข้อจำกัดของผลลัพธ์ | NameMongkol' },
    description: 'อธิบายวิธีถอดอักษรเป็นเลขศาสตร์ ตรวจทักษาปกรณ์ อายตนะ 6 และความสัมพันธ์ชื่อกับนามสกุล พร้อมข้อจำกัดและแนวทางใช้ผลวิเคราะห์อย่างเหมาะสม',
    alternates: { canonical },
    openGraph: {
        title: 'วิธีคำนวณและข้อจำกัดของ NameMongkol',
        description: 'ดูขั้นตอนและหลักที่ระบบใช้วิเคราะห์ชื่ออย่างโปร่งใส ก่อนนำผลไปประกอบการตัดสินใจ',
        url: canonical,
        locale: 'th_TH',
        type: 'article',
    },
};

const steps = [
    {
        title: '1. ทำความสะอาดข้อมูลชื่อ',
        body: 'ระบบตัดช่องว่างและอักขระที่มองไม่เห็นออก โดยยังคงลำดับตัวอักษรไทยที่ใช้ในการคำนวณ',
    },
    {
        title: '2. ถอดอักษรเป็นค่าเลขศาสตร์',
        body: 'ตัวอักษรแต่ละตัวถูกแปลงเป็นค่าตามตารางเลขศาสตร์ของระบบ จากนั้นจึงคำนวณผลรวมและอ่านเลขที่เรียงติดกันเป็นคู่',
    },
    {
        title: '3. ตรวจทักษาปกรณ์ตามวันเกิด',
        body: 'ระบบจัดตัวอักษรในชื่อเข้าหมวดบริวาร อายุ เดช ศรี มูละ อุตสาหะ มนตรี และกาลกิณีของวันเกิดที่เลือก',
    },
    {
        title: '4. ตรวจชื่อร่วมกับนามสกุล',
        body: 'ผลรวมของชื่ออย่างเดียวไม่ใช่ข้อสรุปสุดท้าย ระบบจึงตรวจผลรวม คู่เลข และความสัมพันธ์เมื่อใช้ร่วมกับนามสกุล',
    },
    {
        title: '5. สรุปผลจากหลายมิติ',
        body: 'ผลลัพธ์ถูกนำเสนอแยกตามหลักที่ใช้ เพื่อให้ผู้ใช้เห็นเหตุผล จุดเด่น และจุดที่ควรพิจารณา ไม่ใช่แสดงเพียงคะแนนเดียว',
    },
];

export default function MethodologyPage() {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        '@id': `${canonical}#webpage`,
        url: canonical,
        name: 'วิธีคำนวณและข้อจำกัดของ NameMongkol',
        description: metadata.description,
        inLanguage: 'th-TH',
        isPartOf: { '@id': `${siteUrl}/#website` },
        publisher: { '@id': `${siteUrl}/#organization` },
        dateModified: '2026-07-14',
    };

    return (
        <main className="min-h-screen bg-[#f8f8fc] px-4 pb-20 pt-28 text-[#1a1a3e] sm:pt-32">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <article className="mx-auto max-w-4xl">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">Transparency</p>
                <h1 className="mt-3 text-3xl font-extrabold leading-tight sm:text-5xl">วิธีคำนวณวิเคราะห์ชื่อและข้อจำกัดของผลลัพธ์</h1>
                <p className="mt-6 max-w-[70ch] text-base leading-8 text-[#5a5a82] sm:text-lg">
                    NameMongkol จัดผลวิเคราะห์ให้ตรวจสอบที่มาได้เป็นขั้นตอน ผู้ใช้จึงเห็นว่าคะแนนและคำอธิบายเกิดจากข้อมูลใด และควรนำผลไปใช้อย่างไรโดยไม่ตีความเกินขอบเขต
                </p>

                <section className="mt-12" aria-labelledby="calculation-title">
                    <h2 id="calculation-title" className="text-2xl font-bold">ขั้นตอนที่ระบบใช้</h2>
                    <div className="mt-5 divide-y divide-[#ddddf0] border-y border-[#ddddf0]">
                        {steps.map((step) => (
                            <section key={step.title} className="py-6">
                                <h3 className="text-lg font-bold">{step.title}</h3>
                                <p className="mt-2 max-w-[70ch] leading-7 text-[#5a5a82]">{step.body}</p>
                            </section>
                        ))}
                    </div>
                </section>

                <section className="mt-12 rounded-2xl border border-slate-800 bg-slate-950 p-6 text-slate-100 sm:p-8" aria-labelledby="limitations-title">
                    <h2 id="limitations-title" className="text-2xl font-bold">ข้อจำกัดที่ควรทราบ</h2>
                    <ul className="mt-5 space-y-3 text-sm leading-7 text-slate-300 sm:text-base">
                        <li>ผลวิเคราะห์อิงศาสตร์การตั้งชื่อและความเชื่อ ไม่ใช่หลักฐานว่าชื่อจะกำหนดเหตุการณ์ในชีวิตหรือรับประกันผลลัพธ์</li>
                        <li>ความหมาย การออกเสียง ความเหมาะสมทางภาษา วัฒนธรรม และข้อกำหนดทางทะเบียนควรได้รับการพิจารณาควบคู่กัน</li>
                        <li>ข้อมูลวันเกิดหรือการสะกดที่ไม่ถูกต้องทำให้ผลที่แสดงคลาดเคลื่อนได้</li>
                        <li>คะแนนใช้เปรียบเทียบตัวเลือกภายในระบบ ไม่ควรใช้เป็นคำแนะนำด้านการแพทย์ การเงิน หรือกฎหมาย</li>
                    </ul>
                </section>

                <section className="mt-12" aria-labelledby="sources-title">
                    <h2 id="sources-title" className="text-2xl font-bold">แหล่งความรู้และการตรวจสอบ</h2>
                    <p className="mt-4 max-w-[70ch] leading-7 text-[#5a5a82]">
                        ตารางและคำอธิบายในระบบอ้างอิงแนวคิดทักษาปกรณ์ เลขศาสตร์ไทย อายตนะ 6 และหลักความสัมพันธ์ระหว่างชื่อกับนามสกุล โดยทีมงานตรวจสอบความสอดคล้องระหว่างตารางข้อมูล โค้ดคำนวณ และข้อความที่แสดงทุกครั้งที่ปรับระบบ
                    </p>
                    <p className="mt-4 max-w-[70ch] leading-7 text-[#5a5a82]">
                        หากพบข้อมูลที่ควรแก้ไข สามารถแจ้งรายละเอียดพร้อมแหล่งอ้างอิงผ่านช่องทางติดต่อในหน้า <Link href="/about" className="font-semibold text-amber-700 hover:underline">เกี่ยวกับ NameMongkol</Link>
                    </p>
                </section>

                <section className="mt-12 rounded-2xl border border-amber-200 bg-amber-50 p-6 sm:p-8">
                    <h2 className="text-2xl font-bold">ทดลองตรวจชื่อด้วยข้อมูลของคุณ</h2>
                    <p className="mt-3 max-w-[65ch] leading-7 text-amber-950/80">เริ่มจากผลฟรีเพื่อดูวิธีคำนวณแต่ละส่วน แล้วใช้ Premium เมื่อต้องการเปรียบเทียบและคัดหลายชื่ออย่างละเอียด</p>
                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                        <Link href="/name-check" data-track="seo.methodology.name_check" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-amber-300 bg-white px-5 py-3 font-bold text-amber-900 hover:bg-amber-100">วิเคราะห์ชื่อฟรี</Link>
                        <Link href="/premium-search" data-track="seo.methodology.premium" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-amber-500 px-5 py-3 font-bold text-slate-950 hover:bg-amber-400">ดูการคัดชื่อ Premium</Link>
                    </div>
                </section>
            </article>
        </main>
    );
}
