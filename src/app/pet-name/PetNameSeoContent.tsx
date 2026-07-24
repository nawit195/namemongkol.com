import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { PET_NAME_FAQS } from '@/data/petNameContent';

export function PetNameSeoContent() {
    return (
        <div className="border-t border-[#ddddf0] bg-[#fafafd]">
            <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
                <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
                    <div>
                        <p className="text-sm font-bold text-[#a67828]">ชื่อที่ดี เริ่มจากความเข้าใจ</p>
                        <h2 className="mt-3 text-2xl font-extrabold text-[#1a1a3e] sm:text-3xl">
                            ตั้งชื่อหมาและตั้งชื่อแมวให้เหมาะกับตัวตนของน้อง
                        </h2>
                    </div>
                    <div className="max-w-3xl space-y-5 text-base leading-8 text-[#5a5a82]">
                        <p>
                            การเลือกชื่อสัตว์เลี้ยงไม่ได้มีเพียงความน่ารัก ชื่อที่ใช้ทุกวันควรออกเสียงชัด จำง่าย มีความหมายดี และเข้ากับบุคลิกของน้อง ระบบชื่อสัตว์เลี้ยงมงคลจึงจัดข้อมูลเหล่านี้ไว้ให้เปรียบเทียบในจุดเดียว
                        </p>
                        <p>
                            NameMongkol แยกหลักวิเคราะห์ชื่อสัตว์เลี้ยงออกจากชื่อบุคคลอย่างชัดเจน ไม่ใช้นามสกุล ทักษา หรืออายตนะกับน้องโดยตรง คะแนนมงคลเป็นเพียงหนึ่งในห้าด้านที่ใช้ประกอบการตัดสินใจ
                        </p>
                    </div>
                </div>

                <div className="mt-12 grid gap-4 border-y border-[#ddddf0] py-8 sm:grid-cols-2 lg:grid-cols-4">
                    {['ความหมายเชิงบวก', 'ออกเสียงและเรียกง่าย', 'เข้ากับคาแรกเตอร์', 'มีเหตุผลประกอบคะแนน'].map((item) => (
                        <div key={item} className="flex items-center gap-3 text-sm font-bold text-[#1a1a3e]">
                            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
                            {item}
                        </div>
                    ))}
                </div>

                <div className="mt-10 grid gap-4 sm:grid-cols-2">
                    <Link prefetch={false} href="/pet-name/dog" className="rounded-lg border border-[#e6d19b] bg-white p-5 text-[#1a1a3e] shadow-sm transition-colors hover:border-[#c9933a]">
                        <span className="text-xs font-bold uppercase text-amber-700">Dog Names</span>
                        <strong className="mt-2 block text-lg">ชื่อหมามงคล ความหมายดี เรียกง่าย</strong>
                        <span className="mt-2 block text-sm leading-6 text-[#5a5a82]">ดูรายชื่อสำหรับสุนัขโดยเฉพาะ พร้อมคำอ่าน ความหมาย และคาแรกเตอร์</span>
                    </Link>
                    <Link prefetch={false} href="/pet-name/cat" className="rounded-lg border border-[#e6d19b] bg-white p-5 text-[#1a1a3e] shadow-sm transition-colors hover:border-[#c9933a]">
                        <span className="text-xs font-bold uppercase text-amber-700">Cat Names</span>
                        <strong className="mt-2 block text-lg">ชื่อแมวมงคล นำโชค ความหมายดี</strong>
                        <span className="mt-2 block text-sm leading-6 text-[#5a5a82]">ดูรายชื่อสำหรับแมวโดยเฉพาะ ทั้งชื่อไทย สากล ญี่ปุ่น และเกาหลี</span>
                    </Link>
                    <Link prefetch={false} href="/articles/pet-names" className="rounded-lg border border-[#e6d19b] bg-white p-5 text-[#1a1a3e] shadow-sm transition-colors hover:border-[#c9933a] sm:col-span-2">
                        <span className="text-xs font-bold uppercase text-amber-700">Pillar Article</span>
                        <strong className="mt-2 block text-lg">500 ชื่อสัตว์เลี้ยงน่ารักและมงคล พร้อมความหมาย</strong>
                        <span className="mt-2 block text-sm leading-6 text-[#5a5a82]">อ่านรายชื่อครบทุกหมวด ทั้งชื่อน่ารัก มงคล ภาษาอังกฤษ ญี่ปุ่น เกาหลี พร้อมเคล็ดลับเลือกชื่อ</span>
                    </Link>
                </div>

                <section className="mt-16" aria-labelledby="pet-name-faq-title">
                    <h2 id="pet-name-faq-title" className="text-2xl font-extrabold text-[#1a1a3e] sm:text-3xl">
                        คำถามที่พบบ่อยเกี่ยวกับชื่อสัตว์เลี้ยงมงคล
                    </h2>
                    <div className="mt-7 divide-y divide-[#ddddf0] border-y border-[#ddddf0]">
                        {PET_NAME_FAQS.map((item) => (
                            <details key={item.question} className="group py-5">
                                <summary className="cursor-pointer list-none pr-8 text-base font-bold text-[#1a1a3e] marker:hidden">
                                    {item.question}
                                </summary>
                                <p className="mt-3 max-w-3xl text-sm leading-7 text-[#5a5a82] sm:text-base">{item.answer}</p>
                            </details>
                        ))}
                    </div>
                </section>

                <div className="mt-12 flex flex-wrap items-center gap-4">
                    <Link prefetch={false} href="/name-generator" className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#0f172a] px-5 py-3 text-sm font-bold text-slate-100 transition-colors hover:bg-[#1e293b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9933a]">
                        สร้างชื่อมงคลสำหรับคน <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                    <Link prefetch={false} href="/articles" className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[#ddddf0] bg-[#fafafd] px-5 py-3 text-sm font-bold text-[#1a1a3e] transition-colors hover:border-[#c9933a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9933a]">
                        อ่านบทความตั้งชื่อ
                    </Link>
                </div>
            </section>
        </div>
    );
}
