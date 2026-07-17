import type { Metadata } from 'next';
import Link from 'next/link';
import { siteUrl } from '@/lib/seo';
import { charValues } from '@/data/numerology';

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

const thaiCharacterGroups = Array.from({ length: 9 }, (_, index) => {
    const value = index + 1;
    const characters = Object.entries(charValues)
        .filter(([character, characterValue]) => characterValue === value && /[ก-๙]/.test(character))
        .map(([character]) => character);
    return { value, characters };
});

const exampleName = 'กานต์';
const exampleBreakdown = [...exampleName]
    .map((character) => ({ character, value: charValues[character] ?? 0 }))
    .filter((item) => item.value > 0);
const exampleTotal = exampleBreakdown.reduce((sum, item) => sum + item.value, 0);

const references = [
    {
        title: 'พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. 2554',
        href: 'https://dictionary.orst.go.th/',
        description: 'ใช้ตรวจสอบรูปคำและความหมายภาษาไทยประกอบคำอธิบายชื่อ',
    },
    {
        title: 'พระราชบัญญัติชื่อบุคคล พ.ศ. 2505 และฉบับแก้ไขเพิ่มเติม',
        href: 'https://www.dopa.go.th/news/preview/7645',
        description: 'ข้อมูลทางการจากกรมการปกครองสำหรับตรวจข้อกำหนดด้านชื่อบุคคล',
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
        dateModified: '2026-07-15',
        citation: references.map((reference) => reference.href),
    };

    return (
        <main className="site-grid-surface min-h-screen px-4 pb-20 pt-28 text-[#1a1a3e] sm:pt-32">
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

                <section className="mt-12" aria-labelledby="character-values-title">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">Calculation table</p>
                    <h2 id="character-values-title" className="mt-2 text-2xl font-bold">ตารางค่าตัวอักษรที่ระบบใช้</h2>
                    <p className="mt-4 max-w-[70ch] leading-7 text-[#5a5a82]">
                        ตารางนี้มาจากข้อมูลเดียวกับฟังก์ชันคำนวณในระบบ จึงใช้ตรวจย้อนกลับได้ว่าตัวอักษรแต่ละตัวถูกแปลงเป็นค่าใด เครื่องหมายที่ไม่มีค่าในตารางจะไม่ถูกนำมาบวก
                    </p>
                    <div className="mt-6 overflow-x-auto rounded-2xl border border-[#ddddf0] bg-white shadow-sm">
                        <table className="min-w-full border-collapse text-left text-sm">
                            <caption className="sr-only">ค่าตัวอักษรไทยสำหรับการคำนวณเลขศาสตร์ของ NameMongkol</caption>
                            <thead className="bg-[#f3f3f9] text-[#1a1a3e]">
                                <tr><th className="px-4 py-3">ค่า</th><th className="px-4 py-3">ตัวอักษรและเครื่องหมาย</th></tr>
                            </thead>
                            <tbody className="divide-y divide-[#eeeef6]">
                                {thaiCharacterGroups.map((group) => (
                                    <tr key={group.value}>
                                        <th scope="row" className="px-4 py-3 font-bold text-amber-800">{group.value}</th>
                                        <td className="px-4 py-3 leading-7 text-[#5a5a82]">{group.characters.join(' · ')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="mt-12 rounded-2xl border border-[#ddddf0] bg-white p-6 shadow-sm sm:p-8" aria-labelledby="worked-example-title">
                    <h2 id="worked-example-title" className="text-2xl font-bold">ตัวอย่างตรวจย้อนกลับ: “{exampleName}”</h2>
                    <div className="mt-5 flex flex-wrap gap-2" aria-label={`การถอดค่าเลขศาสตร์ชื่อ ${exampleName}`}>
                        {exampleBreakdown.map((item, index) => (
                            <span key={`${item.character}-${index}`} className="rounded-xl border border-[#ddddf0] bg-[#f8f8fc] px-4 py-2 font-semibold text-[#1a1a3e]">
                                {item.character} = {item.value}
                            </span>
                        ))}
                    </div>
                    <p className="mt-5 leading-7 text-[#5a5a82]">
                        ผลรวมชื่อ = {exampleBreakdown.map((item) => item.value).join(' + ')} = <strong className="text-[#1a1a3e]">{exampleTotal}</strong> จากนั้นระบบจึงอ่านผลรวม คู่เลข และศาสตร์อื่นแยกกัน โดยไม่ใช้คะแนนเดียวเป็นข้อสรุปทั้งหมด
                    </p>
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
                    <p className="mt-4 max-w-[70ch] leading-7 text-[#5a5a82]">แนวคิดทักษาปกรณ์ เลขศาสตร์ไทย และอายตนะ 6 เป็นศาสตร์ความเชื่อ ส่วนความหมายภาษาและข้อกำหนดทางทะเบียนตรวจเทียบกับแหล่งข้อมูลทางการดังต่อไปนี้</p>
                    <ul className="mt-5 space-y-3">
                        {references.map((reference) => (
                            <li key={reference.href} className="rounded-xl border border-[#ddddf0] bg-white p-4">
                                <a href={reference.href} target="_blank" rel="noopener noreferrer" className="font-bold text-[#1a1a3e] hover:text-amber-700 hover:underline">{reference.title}</a>
                                <p className="mt-1 text-sm leading-6 text-[#5a5a82]">{reference.description}</p>
                            </li>
                        ))}
                    </ul>
                </section>

                <section className="mt-12 grid gap-8 border-y border-[#ddddf0] py-10 md:grid-cols-2" aria-labelledby="editorial-policy-title">
                    <div>
                        <h2 id="editorial-policy-title" className="text-2xl font-bold">นโยบายบรรณาธิการ</h2>
                        <ul className="mt-4 space-y-3 text-sm leading-7 text-[#5a5a82]">
                            <li>แยกข้อความตามความเชื่อออกจากข้อเท็จจริงทางภาษา กฎหมาย และการทำงานของระบบ</li>
                            <li>อัปเดตปีใน Title หรือเนื้อหาเฉพาะเมื่อมีการตรวจรายการและข้อมูลจริง</li>
                            <li>ไม่เพิ่มผู้ตรวจทานหรือประสบการณ์ที่ไม่มีหน้าโปรไฟล์และหลักฐานตรวจสอบได้</li>
                        </ul>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">การแก้ไขข้อมูล</h2>
                        <p className="mt-4 text-sm leading-7 text-[#5a5a82]">
                            หากพบตาราง ความหมาย หรือข้อความที่ควรแก้ไข โปรดส่ง URL พร้อมจุดที่พบและแหล่งอ้างอิงผ่านหน้า <Link href="/about" className="font-semibold text-amber-700 hover:underline">เกี่ยวกับ NameMongkol</Link> ทีมงานจะตรวจเทียบข้อมูล โค้ด และหน้าแสดงผลก่อนบันทึกวันที่แก้ไขจริง
                        </p>
                        <p className="mt-3 text-xs text-[#8e8eaa]">เวอร์ชันข้อมูล: 2026.07.15 · ตรวจล่าสุด 15 กรกฎาคม 2569</p>
                    </div>
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
