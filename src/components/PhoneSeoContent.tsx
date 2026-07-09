import React from 'react';
import Link from 'next/link';
import { BarChart3, CheckCircle2, Hash, HelpCircle, Phone, ShieldCheck, Sparkles } from 'lucide-react';

const featureCards = [
    {
        icon: Hash,
        title: 'คู่เลขและผลรวม',
        text: 'ดูทั้งคู่เลขสำคัญในเบอร์และผลรวมเบอร์ เพื่อไม่ตัดสินจากตัวเลขเพียงจุดเดียว',
    },
    {
        icon: BarChart3,
        title: 'กราฟพลังงาน 6 ด้าน',
        text: 'สรุปแนวโน้มด้านงาน เงิน โชคลาภ ความรัก สุขภาพ และสติปัญญาให้อ่านง่าย',
    },
    {
        icon: ShieldCheck,
        title: 'เกรดเบอร์ A-F',
        text: 'ช่วยประเมินภาพรวมของเบอร์อย่างรวดเร็ว ก่อนอ่านรายละเอียดเชิงลึกต่อ',
    },
];

const targetGroups = [
    'ผู้ที่ต้องการเช็คเบอร์ใหม่ก่อนซื้อ',
    'ผู้ที่ใช้เบอร์มือสองและอยากตรวจภาพรวมก่อนใช้งานจริง',
    'เจ้าของกิจการที่ต้องการเบอร์สำหรับงานขายและการติดต่อ',
    'ผู้ที่อยากดูเบอร์เสริมดวงด้านงาน การเงิน ความรัก หรือความน่าเชื่อถือ',
];

export const PhoneSeoContent = () => {
    return (
        <section className="relative z-10 mx-auto mb-12 mt-12 w-full max-w-6xl px-4 md:mb-16 md:mt-20">
            <div className="mx-auto max-w-3xl text-center">
                <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-sm font-semibold text-amber-700">
                    <Phone className="h-4 w-4" />
                    เครื่องมือเช็คเบอร์โทรศัพท์มงคล
                </span>
                <h2 className="text-2xl font-bold leading-tight text-[#1a1a3e] md:text-4xl">
                    วิเคราะห์เบอร์มงคลฟรี พร้อมกราฟพลังงาน 6 ด้าน
                </h2>
                <p className="mt-4 text-sm leading-8 text-[#5a5a82] md:text-base">
                    ระบบวิเคราะห์เบอร์มงคลของ NameMongkol ช่วยเช็คเบอร์โทรศัพท์ 10 หลักจากคู่เลข ผลรวมเบอร์
                    เกรด A-F และกราฟพลังงาน 6 ด้าน เพื่อให้ผู้ใช้เห็นภาพรวมของเบอร์ได้ชัดเจนก่อนเลือกใช้จริง
                    ไม่ว่าจะเป็นเบอร์ใหม่ เบอร์มือสอง หรือเบอร์สำหรับงานและธุรกิจ
                </p>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
                {featureCards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <article key={card.title} className="rounded-2xl border border-[#ddddf0] bg-white p-5 shadow-sm">
                            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#0b1736] text-amber-400">
                                <Icon className="h-5 w-5" />
                            </div>
                            <h3 className="text-lg font-bold text-[#1a1a3e]">{card.title}</h3>
                            <p className="mt-2 text-sm leading-7 text-[#5a5a82]">{card.text}</p>
                        </article>
                    );
                })}
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
                <div className="rounded-3xl border border-[#ddddf0] bg-white p-6 shadow-sm md:p-8">
                    <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1 text-sm font-semibold text-[#5a5a82]">
                        <HelpCircle className="h-4 w-4 text-amber-500" />
                        คำตอบแบบสั้น
                    </div>
                    <h2 className="text-2xl font-bold text-[#1a1a3e]">
                        วิเคราะห์เบอร์มงคลคืออะไร และควรดูจากอะไร
                    </h2>
                    <div className="mt-4 space-y-4 text-sm leading-8 text-[#5a5a82] md:text-base">
                        <p>
                            การวิเคราะห์เบอร์มงคลคือการตรวจองค์ประกอบของเบอร์โทรศัพท์ เพื่อดูว่าเลขแต่ละคู่และผลรวม
                            สะท้อนแนวโน้มด้านใดบ้าง โดยไม่ควรดูเพียงผลรวมเบอร์อย่างเดียว เพราะเบอร์ที่ผลรวมดี
                            อาจยังมีคู่เลขบางตำแหน่งที่ควรอ่านรายละเอียดเพิ่มเติม
                        </p>
                        <p>
                            หน้าเช็คเบอร์นี้จึงออกแบบให้เห็นทั้งคู่เลข ผลรวม เกรดเบอร์ และกราฟพลังงาน 6 ด้านในที่เดียว
                            ช่วยให้ผู้ใช้เปรียบเทียบเบอร์ได้ง่ายขึ้น และใช้ข้อมูลประกอบการเลือกเบอร์ให้เหมาะกับเป้าหมายของตัวเอง
                        </p>
                    </div>
                </div>

                <aside className="rounded-3xl border border-amber-200 bg-amber-50/60 p-6 md:p-8">
                    <h2 className="text-2xl font-bold text-[#1a1a3e]">ระบบเช็คเบอร์มงคลเหมาะกับใคร</h2>
                    <ul className="mt-5 space-y-3">
                        {targetGroups.map((item) => (
                            <li key={item} className="flex gap-3 text-sm leading-7 text-[#5a5a82] md:text-base">
                                <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-600" />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </aside>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-2">
                <article className="rounded-3xl border border-[#ddddf0] bg-white p-6 shadow-sm md:p-8">
                    <h2 className="text-2xl font-bold text-[#1a1a3e]">
                        กราฟพลังงานเบอร์ 6 ด้านช่วยดูอะไร
                    </h2>
                    <p className="mt-4 text-sm leading-8 text-[#5a5a82] md:text-base">
                        กราฟพลังงานช่วยสรุปภาพรวมของเบอร์ให้อ่านง่ายขึ้น โดยแยกมิติสำคัญ เช่น การงาน การเงิน
                        โชคลาภ ความรัก สุขภาพ และสติปัญญา ผู้ใช้จึงไม่ต้องอ่านความหมายตัวเลขแบบกระจัดกระจาย
                        แต่เห็นแนวโน้มเด่นและจุดที่ควรระวังในหน้าเดียว
                    </p>
                </article>

                <article className="rounded-3xl border border-[#ddddf0] bg-white p-6 shadow-sm md:p-8">
                    <h2 className="text-2xl font-bold text-[#1a1a3e]">
                        คู่เลขมงคลและผลรวมเบอร์ควรดูร่วมกันอย่างไร
                    </h2>
                    <p className="mt-4 text-sm leading-8 text-[#5a5a82] md:text-base">
                        คู่เลขคือรายละเอียดเชิงตำแหน่ง ส่วนผลรวมคือภาพรวมของเบอร์ การเลือกเบอร์ที่ดีควรพิจารณาทั้งสองส่วน
                        รวมถึงวัตถุประสงค์ของผู้ใช้ เช่น เบอร์งานขายอาจเน้นการเจรจาและเมตตา เบอร์ธุรกิจอาจเน้นความน่าเชื่อถือ
                        และการเงิน ส่วนเบอร์ส่วนตัวอาจเน้นความสมดุลในการใช้ชีวิต
                    </p>
                </article>
            </div>

            <div className="mt-12 rounded-3xl bg-[#0b1736] p-6 text-white shadow-lg md:p-8">
                <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
                    <div>
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-amber-200">
                            <Sparkles className="h-4 w-4" />
                            เริ่มจากข้อมูลที่ตรวจสอบได้
                        </div>
                        <h2 className="text-2xl font-bold">เช็คเบอร์ก่อนตัดสินใจใช้จริง</h2>
                        <p className="mt-3 max-w-3xl text-sm leading-8 text-slate-200 md:text-base">
                            หากคุณกำลังเลือกเบอร์ใหม่หรืออยากตรวจเบอร์เดิม ลองวิเคราะห์เบอร์ฟรีก่อน แล้วนำผลไปเปรียบเทียบกับชื่อ
                            ความหมาย และรีวิวจากผู้ใช้งานจริง เพื่อช่วยให้ตัดสินใจได้มั่นใจขึ้น
                        </p>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                        <Link
                            href="#phone-analysis-tool"
                            className="inline-flex items-center justify-center rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-[#1a1a3e] transition-colors hover:bg-amber-400"
                        >
                            วิเคราะห์เบอร์มงคลฟรี
                        </Link>
                        <Link
                            href="/name-analysis"
                            className="inline-flex items-center justify-center rounded-xl border border-white/20 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10"
                        >
                            วิเคราะห์ชื่อมงคล
                        </Link>
                    </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-2 text-xs text-slate-200">
                    <Link href="/reviews" className="rounded-full bg-white/10 px-3 py-1.5 hover:bg-white/15">รีวิวจากผู้ใช้งานจริง</Link>
                    <Link href="/articles" className="rounded-full bg-white/10 px-3 py-1.5 hover:bg-white/15">บทความเลขศาสตร์</Link>
                    <Link href="/premium-analysis" className="rounded-full bg-white/10 px-3 py-1.5 hover:bg-white/15">วิเคราะห์ชื่อแบบ Premium</Link>
                    <Link href="/search" className="rounded-full bg-white/10 px-3 py-1.5 hover:bg-white/15">ค้นหาชื่อมงคล</Link>
                </div>
            </div>
        </section>
    );
};
