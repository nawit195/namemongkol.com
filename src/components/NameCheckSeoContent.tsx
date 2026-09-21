import Link from 'next/link';
import { nameCheckFaqItems, nameCheckHowTo } from '@/data/nameCheckSeo';

export function NameCheckSeoContent() {
    return (
        <section className="relative z-10 w-full max-w-5xl mx-auto px-4 pb-16 md:pb-24">
            <div className="rounded-[2rem] border border-[#ddddf0] bg-white p-6 sm:p-8 md:p-10 shadow-sm">
                <div className="max-w-3xl">
                    <p className="mb-4 inline-flex rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">
                        วิเคราะห์ชื่อ
                    </p>
                    <h2 className="text-2xl font-bold tracking-tight text-[#1a1a3e] sm:text-3xl">
                        วิเคราะห์ชื่อ คืออะไร และทำไมคนค้นหาชื่อนี้ถึงต้องเช็กทั้งชื่อกับนามสกุลพร้อมกัน
                    </h2>
                    <p className="mt-4 text-sm leading-7 text-[#5a5a82] sm:text-base">
                        การวิเคราะห์ชื่อที่แม่นขึ้นไม่ได้ดูแค่ชื่อจริงอย่างเดียว แต่ต้องดูผลรวมเลขศาสตร์ของชื่อและนามสกุล,
                        อักษรกาลกิณีตามวันเกิด, พลังพื้นดวงจากอายตนะ 6 และความสมพงศ์ระหว่างชื่อกับนามสกุลในนิรันดร์ศาสตร์
                        หน้านี้จึงถูกออกแบบมาเพื่อคนที่ต้องการรู้ผลทันทีว่าชื่อปัจจุบันส่งเสริมหรือฉุดพลังชีวิตด้านงาน เงิน ความรัก และภาพลักษณ์หรือไม่
                    </p>
                </div>

                <div id="name-check-method" className="mt-10 rounded-3xl border border-amber-100 bg-amber-50/50 p-6 sm:p-7">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-600">Detailed Numerology</p>
                    <h2 className="mt-3 text-xl font-bold text-[#1a1a3e] sm:text-2xl">วิเคราะห์ลึกกว่าผลรวมเลขศาสตร์</h2>
                    <p className="mt-3 text-sm leading-7 text-[#5a5a82] sm:text-base">
                        จุดเด่นของ NameMongkol คือการวิเคราะห์ชื่อแบบละเอียด โดยถอดตัวอักษรแต่ละตัวเป็นค่าเลขศาสตร์ แล้วจับเลขที่อยู่ติดกันเป็นคู่ เช่น 14, 24, 65 เพื่ออ่านพลังส่งเสริม จุดที่ควรระวัง และความหมายเชิงลึกของชื่อ ไม่ใช่ดูเฉพาะผลรวมตัวเลขเท่านั้น หลังวิเคราะห์ ผู้ใช้จะเห็นทั้งตารางถอดรหัสเลขศาสตร์ การ์ดคู่เลขในชื่อ และการ์ดคู่เลขในนามสกุล เพื่อใช้พิจารณาว่าชื่อส่งเสริมกันตรงไหน และจุดใดควรระวังก่อนนำไปใช้จริง
                    </p>
                </div>

                <div className="mt-10">
                    <h2 className="text-xl font-bold text-[#1a1a3e] sm:text-2xl">{nameCheckHowTo.name}</h2>
                    <p className="mt-3 text-sm leading-7 text-[#5a5a82] sm:text-base">{nameCheckHowTo.description}</p>
                    <ol className="mt-5 grid gap-4 md:grid-cols-3">
                        {nameCheckHowTo.steps.map((step, index) => (
                            <li key={step.name} className="rounded-2xl border border-[#ddddf0] bg-white p-5 shadow-sm">
                                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-700">
                                    {index + 1}
                                </span>
                                <h3 className="mt-4 font-semibold text-[#1a1a3e]">{step.name}</h3>
                                <p className="mt-2 text-sm leading-6 text-[#5a5a82]">{step.text}</p>
                            </li>
                        ))}
                    </ol>
                </div>

                <div className="mt-10 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                    <div className="rounded-3xl border border-[#ddddf0] bg-[#f8f8fc] p-6">
                        <h2 className="text-xl font-bold text-[#1a1a3e] sm:text-2xl">
                            วิธีวิเคราะห์ชื่อ ด้วย 4 ศาสตร์ที่ใช้ใน NameMongkol
                        </h2>
                        <div className="mt-6 grid gap-4 sm:grid-cols-2">
                            <div className="rounded-2xl border border-[#ddddf0] bg-white p-5 shadow-sm">
                                <h3 className="font-semibold text-amber-600">เลขศาสตร์</h3>
                                <p className="mt-2 text-sm leading-6 text-[#5a5a82]">
                                    แปลงตัวอักษรเป็นตัวเลขเพื่อดูผลรวมหลักของชื่อและนามสกุลว่าอยู่ในกลุ่มเลขส่งเสริมหรือเลขที่ต้องระวัง
                                </p>
                            </div>
                            <div className="rounded-2xl border border-[#ddddf0] bg-white p-5 shadow-sm">
                                <h3 className="font-semibold text-emerald-600">ทักษาปกรณ์</h3>
                                <p className="mt-2 text-sm leading-6 text-[#5a5a82]">
                                    ตรวจอักษรเดช ศรี มนตรี และกาลกิณีตามวันเกิด เพื่อดูว่าตัวอักษรในชื่อช่วยหนุนหรือสร้างแรงต้าน
                                </p>
                            </div>
                            <div className="rounded-2xl border border-[#ddddf0] bg-white p-5 shadow-sm">
                                <h3 className="font-semibold text-rose-600">อายตนะ 6</h3>
                                <p className="mt-2 text-sm leading-6 text-[#5a5a82]">
                                    ใช้วัดภาพลักษณ์และการยอมรับจากคนรอบตัวว่าชื่อนี้เปิดโอกาสด้านสังคม การงาน และความน่าเชื่อถือมากแค่ไหน
                                </p>
                            </div>
                            <div className="rounded-2xl border border-[#ddddf0] bg-white p-5 shadow-sm">
                                <h3 className="font-semibold text-sky-600">นิรันดร์ศาสตร์</h3>
                                <p className="mt-2 text-sm leading-6 text-[#5a5a82]">
                                    ตรวจความสัมพันธ์ระหว่างชื่อกับนามสกุล เพื่อดูว่าทั้งสองส่วนทำงานร่วมกันในทางเสริมหรือหักล้างกัน
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-3xl border border-[#ddddf0] bg-white p-6 shadow-sm">
                        <h2 className="text-xl font-bold text-[#1a1a3e] sm:text-2xl">
                            ผลที่ได้จากการวิเคราะห์ชื่อ บนหน้านี้
                        </h2>
                        <ul className="mt-5 space-y-3 text-sm leading-6 text-[#5a5a82]">
                            <li>รู้เกรดชื่อและผลรวมเลขศาสตร์ของชื่อกับนามสกุลทันที</li>
                            <li>เห็นจุดเด่น จุดเสี่ยง และตัวอักษรที่กระทบพลังชื่อ</li>
                            <li>เช็กได้ว่าชื่อกับนามสกุลส่งเสริมกันจริงหรือไม่</li>
                            <li>ใช้ผลลัพธ์ต่อยอดไปหาชื่อใหม่หรืออัปเกรดเป็นการวิเคราะห์แบบลึกได้</li>
                        </ul>

                        <div className="mt-6 space-y-3 text-sm">
                            <Link prefetch={false} href="/search" className="block rounded-2xl border border-[#ddddf0] bg-white px-4 py-3 text-[#1a1a3e] transition-colors hover:bg-amber-50 hover:border-amber-200">
                                ค้นหาชื่อมงคล 5,000+ ชื่อ หากต้องการเริ่มจากรายชื่อแนะนำ
                            </Link>
                            <Link prefetch={false} href="/premium-analysis" className="block rounded-2xl border border-[#ddddf0] bg-white px-4 py-3 text-[#1a1a3e] transition-colors hover:bg-purple-50 hover:border-purple-200">
                                วิเคราะห์ชื่อมงคลขั้นสูง หากต้องการเจาะลึกตามวันและเวลาเกิด
                            </Link>
                            <Link prefetch={false} href="/name-analysis" className="block rounded-2xl border border-[#ddddf0] bg-white px-4 py-3 text-[#1a1a3e] transition-colors hover:bg-sky-50 hover:border-sky-200">
                                เช็กหลายชื่อพร้อมกัน หากต้องการคัดชื่อจำนวนมากในครั้งเดียว
                            </Link>
                        </div>
                    </div>
                </div>

                <div id="name-check-faq" className="mt-10">
                    <h2 className="text-xl font-bold text-[#1a1a3e] sm:text-2xl">คำถามที่พบบ่อยเกี่ยวกับการวิเคราะห์ชื่อ</h2>
                    <div className="mt-5 grid gap-4">
                        {nameCheckFaqItems.map((item) => (
                            <div key={item.question} className="rounded-2xl border border-[#ddddf0] bg-white p-5 shadow-sm">
                                <h3 className="font-semibold text-[#1a1a3e]">{item.question}</h3>
                                <p className="mt-2 text-sm leading-6 text-[#5a5a82]">{item.answer}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
