import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Cat, Dog, PawPrint } from 'lucide-react';

export function PetNamePromo() {
    return (
        <section className="relative z-10 w-full px-4 pb-8 pt-4 sm:px-6 lg:px-12 xl:px-16" aria-labelledby="pet-name-promo-title">
            <div className="mx-auto grid max-w-[1180px] overflow-hidden rounded-2xl border border-[#e8c87e] bg-[#fff8e8] shadow-[0_12px_34px_rgba(79,55,19,0.10)] md:grid-cols-[1fr_16rem]">
                <div className="flex flex-col justify-center px-5 py-7 sm:px-8 lg:px-10">
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0f172a] px-3 py-1.5 text-xs font-bold text-[#f5d98f]">
                            <PawPrint className="h-4 w-4" aria-hidden="true" /> ใหม่
                        </span>
                        <span className="text-sm font-bold text-[#a67828]">ทดลองดู 3 ชื่อฟรี</span>
                    </div>
                    <h2 id="pet-name-promo-title" className="mt-4 text-2xl font-extrabold text-[#1a1a3e] sm:text-3xl">ค้นหาชื่อสัตว์เลี้ยงมงคล</h2>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-[#5a5a82] sm:text-base">ตั้งชื่อให้น้องหมา น้องแมว และสัตว์เลี้ยงจากความหมาย เสียงเรียก และคาแรกเตอร์ พร้อมคะแนนที่อธิบายได้</p>
                    <div className="mt-5 flex flex-wrap items-center gap-3">
                        <Link href="/pet-name" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#0f172a] px-5 text-sm font-bold text-slate-100 transition-colors hover:bg-[#1e293b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9933a]">
                            ทดลองค้นหาชื่อน้อง <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </Link>
                        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#5a5a82]"><Dog className="h-4 w-4" /> สุนัข</span>
                        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#5a5a82]"><Cat className="h-4 w-4" /> แมว</span>
                    </div>
                </div>
                <div className="relative hidden min-h-64 md:block">
                    <Image src="/images/articles/modern-thai-business-cat.webp" alt="เจ้าของกับแมวสำหรับค้นหาชื่อสัตว์เลี้ยงมงคล" fill unoptimized className="object-cover" sizes="256px" />
                </div>
            </div>
        </section>
    );
}
