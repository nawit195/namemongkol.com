import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Check, Heart, PawPrint, Search } from 'lucide-react';

const benefits = ['ความหมายดี', 'เรียกง่ายจำง่าย', 'เช็กชื่อเข้ากับเจ้าของ'];

export function PetNamePromo() {
    return (
        <section className="relative z-10 w-full px-4 pb-9 pt-4 sm:px-6 lg:px-12 xl:px-16" aria-labelledby="pet-name-promo-title">
            <div className="mx-auto grid max-w-[1180px] overflow-hidden rounded-2xl border border-[#dfc987] bg-[#fffefa] shadow-[0_18px_48px_rgba(34,31,53,0.12)] md:grid-cols-[minmax(0,1fr)_22rem]">
                <div className="order-2 flex flex-col justify-center px-5 py-7 sm:px-8 sm:py-9 lg:px-10 md:order-1">
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0f172a] px-3 py-1.5 text-xs font-extrabold text-[#f5d98f]">
                            <PawPrint className="h-4 w-4" aria-hidden="true" /> ฟีเจอร์ใหม่
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[#9a691f]">
                            <Heart className="h-4 w-4 fill-rose-300 text-rose-400" aria-hidden="true" /> ทดลองดู 3 ชื่อฟรี
                        </span>
                    </div>

                    <h2 id="pet-name-promo-title" className="mt-5 max-w-2xl text-2xl font-extrabold leading-tight text-[#1a1a3e] sm:text-3xl">
                        ค้นหาชื่อสัตว์เลี้ยงมงคล<br className="hidden sm:block" /> ที่เข้ากับน้องจริง ๆ
                    </h2>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-[#555570] sm:text-base">
                        คัดชื่อให้น้องหมา น้องแมว และเพื่อนตัวน้อยจากความหมาย เสียงเรียก และคาแรกเตอร์ พร้อมเช็กความเหมาะสมกับเจ้าของในที่เดียว
                    </p>

                    <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2" aria-label="จุดเด่นของระบบชื่อสัตว์เลี้ยงมงคล">
                        {benefits.map((benefit) => (
                            <li key={benefit} className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4d4d69] sm:text-sm">
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><Check className="h-3.5 w-3.5" aria-hidden="true" /></span>
                                {benefit}
                            </li>
                        ))}
                    </ul>

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                        <Link prefetch={false} href="/pet-name" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#0f172a] px-5 text-sm font-extrabold text-slate-100 shadow-[0_8px_20px_rgba(15,23,42,0.18)] transition-[transform,background-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:bg-[#1e293b] hover:shadow-[0_12px_26px_rgba(15,23,42,0.22)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9933a] focus-visible:ring-offset-2 motion-reduce:transform-none">
                            ดูตัวอย่างฟรี 3 ชื่อ <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </Link>
                        <Link prefetch={false} href="/pet-name?mode=analysis#pet-name-tool" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#d7d5e4] bg-white px-5 text-sm font-bold text-[#1a1a3e] transition-colors hover:border-[#c9933a] hover:bg-[#fff9ec] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9933a] focus-visible:ring-offset-2">
                            <Search className="h-4 w-4 text-[#a67828]" aria-hidden="true" /> วิเคราะห์ชื่อที่มีอยู่
                        </Link>
                        <Link prefetch={false} href="/articles/pet-names" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#d7d5e4] bg-white px-5 text-sm font-bold text-[#1a1a3e] transition-colors hover:border-[#c9933a] hover:bg-[#fff9ec] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9933a] focus-visible:ring-offset-2">
                            อ่านรายชื่อสัตว์เลี้ยง 500+ ชื่อ
                        </Link>
                    </div>
                </div>

                <div className="relative order-1 aspect-[16/9] min-h-52 overflow-hidden border-b border-[#dfc987] md:order-2 md:aspect-auto md:min-h-[19rem] md:border-b-0 md:border-l">
                    <Image
                        src="/images/articles/modern-thai-business-cat.webp"
                        alt="เจ้าของกำลังใช้เวลาร่วมกับแมว สำหรับค้นหาชื่อสัตว์เลี้ยงมงคล"
                        fill
                        unoptimized
                        className="object-cover object-center"
                        sizes="(max-width: 767px) calc(100vw - 2rem), 352px"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-[#0f172a]/90 px-4 py-3 text-slate-100">
                        <p className="text-xs font-extrabold text-[#f1c75b]">ชื่อที่ดี เริ่มจากความผูกพัน</p>
                        <p className="mt-0.5 text-xs leading-5 text-slate-300">เลือกชื่อที่เรียกแล้วรู้สึกใช่สำหรับทั้งคุณและน้อง</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
