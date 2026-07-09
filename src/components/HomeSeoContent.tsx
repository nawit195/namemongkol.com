'use client';

import React from 'react';
import { Star, Shield, TrendingUp, Sparkles, Infinity as InfinityIcon } from 'lucide-react';
import { useLanguage } from './LanguageProvider';
import Image from 'next/image';
import Link from 'next/link';

export const HomeSeoContent = () => {
    const { t } = useLanguage();

    return (
        <section className="w-full max-w-4xl mx-auto mt-16 mb-12 px-4">
            <div
                id="home-seo-answer"
                className="mb-10 rounded-2xl border border-amber-200 bg-amber-50 p-6 sm:p-8 shadow-sm"
            >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
                    Free Name Analysis
                </p>
                <h2 className="mt-3 text-2xl font-bold leading-snug text-[#1a1a3e] sm:text-3xl">
                    วิเคราะห์ชื่อฟรีแบบละเอียด ถอดอักษรเป็นเลขศาสตร์และเช็กคู่เลขในชื่อ
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-[#5a5a82] sm:text-base">
                    NameMongkol ช่วยวิเคราะห์ชื่อและนามสกุลด้วย 4 ศาสตร์หลัก ได้แก่ เลขศาสตร์ ทักษาปกรณ์ อายตนะ 6 และนิรันดร์ศาสตร์ จุดเด่นคือการถอดตัวอักษรแต่ละตัวเป็นค่าเลขศาสตร์ แล้วจับเลขที่อยู่ติดกันเป็นคู่ เช่น 14, 24, 65 เพื่ออ่านพลังส่งเสริม จุดที่ควรระวัง และความหมายเชิงลึกของชื่อ ไม่ใช่ดูเฉพาะผลรวมตัวเลขเท่านั้น
                </p>
                <div className="mt-5 grid gap-3 text-sm text-[#5a5a82] sm:grid-cols-3">
                    <div className="rounded-xl border border-amber-100 bg-white p-4 shadow-sm">
                        <h3 className="font-semibold text-amber-600">1. ถอดอักษรเป็นเลข</h3>
                        <p className="mt-2 leading-relaxed">แปลงตัวอักษรในชื่อและนามสกุลเป็นค่าเลขศาสตร์ทีละตัว</p>
                    </div>
                    <div className="rounded-xl border border-amber-100 bg-white p-4 shadow-sm">
                        <h3 className="font-semibold text-amber-600">2. รวมเลขศาสตร์</h3>
                        <p className="mt-2 leading-relaxed">ดูผลรวมชื่อ นามสกุล และคะแนนภาพรวมตามหลัก 4 ศาสตร์</p>
                    </div>
                    <div className="rounded-xl border border-amber-100 bg-white p-4 shadow-sm">
                        <h3 className="font-semibold text-amber-600">3. จับคู่เลขรายตัว</h3>
                        <p className="mt-2 leading-relaxed">อ่านพลังและความหมายของคู่เลขที่เรียงต่อกันในชื่อ</p>
                    </div>
                </div>
            </div>

            <div className="mb-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Link
                    href="/name-check"
                    className="rounded-2xl border border-amber-200 bg-amber-50 p-5 transition-colors hover:border-amber-300 hover:bg-amber-100 shadow-sm"
                >
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-600">Intent 01</p>
                    <h2 className="mt-2 text-xl font-bold text-[#1a1a3e]">เช็กชื่อของตัวเองก่อนเปลี่ยนชื่อ</h2>
                    <p className="mt-3 text-sm leading-relaxed text-[#5a5a82]">
                        เหมาะสำหรับคนที่อยากรู้ว่าชื่อปัจจุบันส่งผลต่อการงาน การเงิน และภาพลักษณ์อย่างไร ก่อนตัดสินใจเปลี่ยนชื่อจริง
                    </p>
                    <p className="mt-4 text-sm font-medium text-amber-600">ไปวิเคราะห์ชื่อ-นามสกุลฟรี</p>
                </Link>

                <Link
                    href="/search"
                    className="rounded-2xl border border-sky-200 bg-sky-50 p-5 transition-colors hover:border-sky-300 hover:bg-sky-100 shadow-sm"
                >
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-600">Intent 02</p>
                    <h2 className="mt-2 text-xl font-bold text-[#1a1a3e]">ชื่อมงคล 5,000+ ชื่อ สำหรับลูกหรือชื่อใหม่ของคุณ</h2>
                    <p className="mt-3 text-sm leading-relaxed text-[#5a5a82]">
                        เหมาะสำหรับพ่อแม่และคนที่กำลังหาชื่อใหม่ โดยเริ่มจากรายชื่อมงคล แล้วค่อยนำชื่อที่ชอบไปวิเคราะห์ร่วมกับนามสกุลอีกครั้ง
                    </p>
                    <p className="mt-4 text-sm font-medium text-sky-600">ไปค้นหาชื่อมงคล</p>
                </Link>

                <Link
                    href="/name-generator"
                    className="rounded-2xl border border-pink-200 bg-pink-50 p-5 transition-colors hover:border-pink-300 hover:bg-pink-100 shadow-sm"
                >
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-pink-600">Intent 03</p>
                    <h2 className="mt-2 text-xl font-bold text-[#1a1a3e]">สร้างชื่อมงคลด้วย AI เมื่อต้องการไอเดียชื่อใหม่</h2>
                    <p className="mt-3 text-sm leading-relaxed text-[#5a5a82]">
                        เหมาะสำหรับคนที่ยังไม่มีชื่อในใจ ต้องการให้ระบบช่วยประกอบชื่อใหม่ แล้วนำชื่อที่ถูกใจไปวิเคราะห์ชื่อร่วมกับนามสกุลอีกครั้งก่อนใช้งานจริง
                    </p>
                    <p className="mt-4 text-sm font-medium text-pink-600">ไปหน้า /name-generator →</p>
                </Link>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-16">
                <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#ddddf0] shadow-sm">
                    <h2 className="text-xl sm:text-2xl font-bold text-amber-500 mb-4 flex items-center gap-2 tracking-tight">
                        <Star className="w-5 h-5" />
                        {t('sections.homeSeo.whyTitle')}
                    </h2>
                    <p className="text-[#5a5a82] leading-relaxed mb-4">
                        {t('sections.homeSeo.whyDesc1')}
                    </p>
                    <p className="text-[#5a5a82] leading-relaxed">
                        {t('sections.homeSeo.whyDesc2')}
                    </p>
                </div>

                <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#ddddf0] shadow-sm">
                    <h2 className="text-xl sm:text-2xl font-bold text-emerald-500 mb-4 flex items-center gap-2 tracking-tight">
                        <TrendingUp className="w-5 h-5" />
                        {t('sections.homeSeo.changeTitle')}
                    </h2>
                    <p className="text-[#5a5a82] leading-relaxed mb-4">
                        {t('sections.homeSeo.changeDesc1')}
                    </p>
                    <p className="text-[#5a5a82] leading-relaxed">
                        {t('sections.homeSeo.changeDesc2')}
                    </p>
                </div>
            </div>

            <div className="mb-16">
                <div className="text-center mb-10 sm:mb-14">
                    <span className="px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold uppercase tracking-wider border border-blue-200 mb-5 inline-block">
                        {t('sections.homeSeo.pillarBadge')}
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-bold text-[#1a1a3e] mb-5 tracking-tight">{t('sections.homeSeo.pillarTitle')}</h2>
                    <p className="text-[#5a5a82] max-w-[65ch] mx-auto text-sm sm:text-base leading-relaxed">
                        {t('sections.homeSeo.pillarDesc')}
                    </p>
                </div>

                <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-6 px-1 md:grid md:grid-cols-2 md:gap-6 md:overflow-visible md:px-0 md:pb-0 lg:grid-cols-4">
                    {/* Card 1: Numerology */}
                    <div className="relative w-[85%] sm:w-[68%] md:w-auto overflow-hidden shrink-0 md:shrink snap-start md:snap-none p-5 sm:p-7 rounded-[28px] bg-gradient-to-b from-[#FFFDF5] to-white border-[1.5px] border-amber-100 hover:border-amber-300 hover:shadow-xl hover:shadow-amber-500/10 transition-all group">
                        <div className="relative h-36 w-full flex-shrink-0 mb-6 flex items-center justify-center">
                            <div className="absolute inset-0 bg-amber-400/10 blur-[30px] rounded-full scale-125" />
                            <div className="absolute inset-1.5 border-[1.5px] border-dashed border-amber-200/60 rounded-full animate-[spin_60s_linear_infinite]" />
                            <div className="absolute inset-5 border-[1.5px] border-amber-200/80 rounded-full" />
                            
                            <div className="relative w-[86px] h-[86px] bg-gradient-to-br from-white to-amber-50 rounded-full border-2 border-white shadow-[0_0_20px_rgba(251,191,36,0.25)] flex flex-col items-center justify-center gap-[4px] z-10 transition-transform duration-500 group-hover:scale-105">
                                <div className="flex gap-[6px] text-amber-500 font-bold text-[10px]"><span className="opacity-80">14</span><span>15</span><span className="opacity-80">24</span></div>
                                <div className="flex gap-[6px] text-amber-600 font-extrabold text-[#11px]"><span className="opacity-95">45</span><span>59</span><span className="opacity-95">16</span></div>
                                <div className="flex gap-[8px] text-amber-500 font-bold text-[10px]"><span className="opacity-80">1</span><span>9</span><span className="opacity-80">36</span></div>
                            </div>
                            <Sparkles className="absolute top-2 right-4 w-4 h-4 text-amber-300" />
                            <Star className="absolute bottom-6 left-2 w-3 h-3 text-amber-300 fill-amber-300" />
                        </div>
                        <h3 className="font-bold text-lg sm:text-[19px] text-[#1a1a3e] mb-3 text-center flex items-center justify-center gap-2 tracking-tight group-hover:text-amber-600 transition-colors">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            1. เลขศาสตร์
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        </h3>
                        <p className="text-[13.5px] sm:text-[14px] text-[#5a5a82] leading-relaxed text-center px-1">
                            แปลงค่าตัวอักษรเป็นตัวเลข เพื่อดูอิทธิพลดาวเคราะห์ที่ส่งผลต่อเจ้าชะตา (ผลรวมที่ดี เช่น 14, 15, 24, 45, 59)
                        </p>
                    </div>

                    {/* Card 2: Thaksa */}
                    <div className="relative w-[85%] sm:w-[68%] md:w-auto overflow-hidden shrink-0 md:shrink snap-start md:snap-none p-5 sm:p-7 rounded-[28px] bg-gradient-to-b from-[#F2FCF5] to-white border-[1.5px] border-emerald-100 hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-500/10 transition-all group">
                        <div className="relative h-36 w-full flex-shrink-0 mb-6 flex items-center justify-center">
                            <div className="absolute inset-0 bg-emerald-400/10 blur-[30px] rounded-full scale-125" />
                            <div className="absolute inset-1 border-[1.5px] border-emerald-200/50 rounded-full flex items-center justify-center">
                                {[0,45,90,135,180,225,270,315].map(deg => (
                                    <div key={deg} className={`absolute w-1.5 h-1.5 bg-emerald-300/80 rounded-full`} style={{ transform: `rotate(${deg}deg) translateY(-66px)` }} />
                                ))}
                            </div>
                            <div className="absolute inset-5 border-[2px] border-emerald-200/80 rounded-full" />
                            
                            <div className="relative w-[80px] h-[80px] bg-gradient-to-br from-white to-emerald-50 rounded-full border-[2.5px] border-white shadow-[0_0_20px_rgba(52,211,153,0.3)] flex items-center justify-center z-10 transition-transform duration-500 group-hover:scale-105">
                                <span className="text-4xl font-extrabold text-emerald-600 font-prompt leading-none pt-1 shadow-emerald-100 drop-shadow-sm">ศ</span>
                                <div className="absolute -top-[18px] left-1/2 -translate-x-1/2 text-emerald-600/90 text-[10px] font-bold tracking-[0.2em] whitespace-nowrap">ข ค ฆ</div>
                                <div className="absolute -bottom-[18px] left-1/2 -translate-x-1/2 text-emerald-600/90 text-[10px] font-bold tracking-[0.2em] whitespace-nowrap">น ป พ</div>
                                <div className="absolute top-1/2 -left-[16px] -translate-y-1/2 text-emerald-600/90 text-[9px] font-bold flex flex-col leading-[1.3]"><span>ก</span><span>ช</span><span>ท</span></div>
                                <div className="absolute top-1/2 -right-[16px] -translate-y-1/2 text-emerald-600/90 text-[9px] font-bold flex flex-col leading-[1.3]"><span>ศ</span><span>ร</span><span>ฝ</span></div>
                            </div>
                            <Sparkles className="absolute top-3 left-3 w-4 h-4 text-emerald-300" />
                        </div>
                        <h3 className="font-bold text-lg sm:text-[19px] text-[#1a1a3e] mb-3 text-center flex items-center justify-center gap-2 tracking-tight group-hover:text-emerald-600 transition-colors">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                            2. ทักษาปกรณ์
                            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                        </h3>
                        <p className="text-[13.5px] sm:text-[14px] text-[#5a5a82] leading-relaxed text-center px-1">
                            ภูมิพยากรณ์ประจำวันเกิด หาตัวอักษรที่เป็น &quot;เดช&quot; &quot;ศรี&quot; &quot;มนตรี&quot; และหลีกเลี่ยง &quot;กาลกิณี&quot; อย่างเด็ดขาด
                        </p>
                    </div>

                    {/* Card 3: Ayatana */}
                    <div className="relative w-[85%] sm:w-[68%] md:w-auto overflow-hidden shrink-0 md:shrink snap-start md:snap-none p-5 sm:p-7 rounded-[28px] bg-gradient-to-b from-[#FFF5F7] to-white border-[1.5px] border-rose-100 hover:border-rose-300 hover:shadow-xl hover:shadow-rose-500/10 transition-all group">
                        <div className="relative h-36 w-full flex-shrink-0 mb-6 flex items-center justify-center">
                            <div className="absolute inset-0 bg-rose-400/10 blur-[30px] rounded-full scale-125" />
                            <div className="absolute inset-2 border-[1.5px] border-rose-200/50 rounded-[40px] rotate-45 transition-transform group-hover:rotate-90 duration-700" />
                            <div className="absolute inset-2 border-[1.5px] border-rose-200/50 rounded-[40px] -rotate-45 transition-transform group-hover:rotate-0 duration-700" />
                            
                            <div className="relative w-[86px] h-[86px] bg-gradient-to-br from-white to-rose-50 rounded-full border-2 border-white shadow-[0_0_20px_rgba(251,113,133,0.3)] flex items-center justify-center z-10 transition-transform duration-500 group-hover:scale-105">
                                <div className="text-[42px] leading-none mb-1 shadow-rose-200 drop-shadow-md">🪷</div>
                            </div>
                            {[0, 60, 120, 180, 240, 300].map(deg => (
                                <div key={deg} className={`absolute w-[22px] h-[22px] bg-white border border-rose-100 rounded-full shadow-sm flex items-center justify-center`} style={{ transform: `rotate(${deg}deg) translateY(-60px) rotate(-${deg}deg)` }}>
                                    <div className="w-1.5 h-1.5 rounded-full bg-rose-300" />
                                </div>
                            ))}
                        </div>
                        <h3 className="font-bold text-lg sm:text-[19px] text-[#1a1a3e] mb-3 text-center flex items-center justify-center gap-2 tracking-tight group-hover:text-rose-600 transition-colors">
                            <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                            3. อายตนะ 6
                            <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                        </h3>
                        <p className="text-[13.5px] sm:text-[14px] text-[#5a5a82] leading-relaxed text-center px-1">
                            ศาสตร์แห่งการยอมรับทางสังคม สะท้อนว่าคนรอบข้างมองเราอย่างไร (เปรียบเทียบกับคน 9 ประเภท เช่น ราชินี, เศรษฐี)
                        </p>
                    </div>

                    {/* Card 4: Nirun */}
                    <div className="relative w-[85%] sm:w-[68%] md:w-auto overflow-hidden shrink-0 md:shrink snap-start md:snap-none p-5 sm:p-7 rounded-[28px] bg-gradient-to-b from-[#F5F8FF] to-white border-[1.5px] border-blue-100 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/10 transition-all group">
                        <div className="relative h-36 w-full flex-shrink-0 mb-6 flex items-center justify-center">
                            <div className="absolute inset-0 bg-blue-400/10 blur-[30px] rounded-full scale-125" />
                            <div className="absolute inset-1 overflow-hidden rounded-full border-[1.5px] border-blue-200/50">
                                <div className="absolute w-[200%] h-px bg-blue-200/50 top-1/2 -translate-y-1/2 -left-1/2 rotate-[20deg]" />
                                <div className="absolute w-[200%] h-px bg-blue-200/50 top-1/2 -translate-y-1/2 -left-1/2 -rotate-[20deg]" />
                            </div>
                            
                            <div className="flex items-center justify-center gap-[2px] z-10 w-full px-2 relative transition-transform duration-500 group-hover:scale-105">
                                <div className="flex-1 h-[68px] bg-white/90 backdrop-blur-sm rounded-[14px] border-[1.5px] border-white shadow-[0_5px_15px_rgba(96,165,250,0.18)] flex flex-col items-center justify-center -rotate-6 translate-y-1 transition-transform group-hover:-rotate-3">
                                    <span className="text-[11px] font-bold text-blue-600/80 mb-1">ชื่อ</span>
                                    <div className="w-5 h-[1.5px] bg-blue-300" />
                                </div>
                                <div className="relative z-20 -mx-3 bg-gradient-to-br from-white to-blue-50 rounded-full p-2 shadow-[0_0_15px_rgba(96,165,250,0.35)] border-[1.5px] border-white">
                                   <InfinityIcon className="w-[30px] h-[30px] text-blue-500" strokeWidth={2.5} />
                                </div>
                                <div className="flex-1 h-[68px] bg-white/90 backdrop-blur-sm rounded-[14px] border-[1.5px] border-white shadow-[0_5px_15px_rgba(96,165,250,0.18)] flex flex-col items-center justify-center rotate-6 translate-y-1 transition-transform group-hover:rotate-3">
                                    <span className="text-[11px] font-bold text-blue-600/80 mb-1">นามสกุล</span>
                                    <div className="w-8 h-[1.5px] bg-blue-300" />
                                </div>
                            </div>
                            <Sparkles className="absolute top-2 right-4 w-4 h-4 text-blue-300" />
                        </div>
                        <h3 className="font-bold text-lg sm:text-[19px] text-[#1a1a3e] mb-3 text-center flex items-center justify-center gap-2 tracking-tight group-hover:text-blue-700 transition-colors">
                            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                            4. นิรันดร์ศาสตร์
                            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                        </h3>
                        <p className="text-[13.5px] sm:text-[14px] text-[#5a5a82] leading-relaxed text-center px-1">
                            หัวใจสำคัญ! ตรวจสอบความสมพงศ์ระหว่าง &quot;ชื่อต้น&quot; และ &quot;นามสกุล&quot; ให้อยู่ร่วมกันแล้วส่งเสริมกัน ไม่ขัดแย้ง
                        </p>
                    </div>
                </div>
            </div>

            <div className="relative w-full rounded-2xl overflow-hidden shadow-md border border-[#ddddf0] mt-10 bg-white transition-all group">
                <Image
                    src="/banner/ศัพท์น่ารู้ก่อนตั้งชื่ออมงคล-_ทักษา_.webp"
                    alt="ศัพท์น่ารู้ก่อนตั้งชื่อมงคล (ทักษา)"
                    width={1200}
                    height={600}
                    className="w-full h-auto object-cover"
                    priority={false}
                />
            </div>

            <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Link
                    href="/name-check"
                    className="group rounded-2xl border border-sky-200 bg-sky-50 hover:bg-sky-100 p-5 transition-all shadow-sm"
                >
                    <p className="text-xs font-semibold uppercase tracking-wider text-sky-600 mb-2">
                        วิเคราะห์ชื่อฟรี
                    </p>
                    <p className="text-[#1a1a3e] font-bold leading-snug">
                        วิเคราะห์ชื่อ-นามสกุล ฟรี รู้ผลทันที
                    </p>
                    <p className="mt-2 text-sm text-[#5a5a82] leading-relaxed">
                        ใช้สำหรับเช็กชื่อปัจจุบันว่าผลรวมเลขศาสตร์ กาลกิณี ความสมพงศ์กับนามสกุล และภาพรวม 4 ศาสตร์อยู่ในเกณฑ์ดีหรือไม่
                    </p>
                    <p className="mt-3 text-sm text-sky-600 font-medium">
                        ไปหน้า /name-check →
                    </p>
                </Link>

                <Link
                    href="/search"
                    className="group rounded-2xl border border-amber-200 bg-amber-50 hover:bg-amber-100 p-5 transition-all shadow-sm"
                >
                    <p className="text-xs font-semibold uppercase tracking-wider text-amber-600 mb-2">
                        ค้นหาชื่อมงคลฟรี
                    </p>
                    <p className="text-[#1a1a3e] font-bold leading-snug">
                        ค้นหาชื่อมงคล 5,000+ ชื่อ
                    </p>
                    <p className="mt-2 text-sm text-[#5a5a82] leading-relaxed">
                        เหมาะสำหรับตั้งชื่อลูก เปลี่ยนชื่อใหม่ หรือหาไอเดียชื่อมงคลก่อน แล้วค่อยนำชื่อที่ชอบไปวิเคราะห์ร่วมกับนามสกุล
                    </p>
                    <p className="mt-3 text-sm text-amber-600 font-medium">
                        ไปหน้า /search →
                    </p>
                </Link>

                <Link
                    href="/premium-search"
                    className="group rounded-2xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 p-5 transition-all shadow-sm"
                >
                    <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 mb-2">
                        เปลี่ยนชื่อ Pro
                    </p>
                    <p className="text-[#1a1a3e] font-bold leading-snug">
                        เปลี่ยนชื่อมงคล Pro คัดชื่อเสริมดวง
                    </p>
                    <p className="mt-2 text-sm text-[#5a5a82] leading-relaxed">
                        ฐานข้อมูลคัดพิเศษ เลือกอักษรนำตามทักษา และคัดผลรวมเลขศาสตร์ระดับสูง
                    </p>
                    <p className="mt-3 text-sm text-emerald-600 font-medium">
                        ไปหน้า /premium-search →
                    </p>
                </Link>

                <Link
                    href="/premium-analysis"
                    className="group rounded-2xl border border-purple-200 bg-purple-50 hover:bg-purple-100 p-5 transition-all shadow-sm"
                >
                    <p className="text-xs font-semibold uppercase tracking-wider text-purple-600 mb-2">
                        Premium Analysis
                    </p>
                    <p className="text-[#1a1a3e] font-bold leading-snug">
                        วิเคราะห์ชื่อมงคลขั้นสูง (เวลาเกิด/ลัคนา)
                    </p>
                    <p className="mt-2 text-sm text-[#5a5a82] leading-relaxed">
                        เจาะลึกเฉพาะบุคคลด้วยวัน-เดือน-ปีและเวลาตกฟาก เพื่อคัดชื่อที่ “เหมาะกับดวง” มากขึ้น
                    </p>
                    <p className="mt-3 text-sm text-purple-600 font-medium">
                        ไปหน้า /premium-analysis →
                    </p>
                </Link>
            </div>

            <div className="mt-10 rounded-2xl border border-[#ddddf0] bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600">
                    <Shield className="h-4 w-4" />
                    ใช้หน้าแรกเป็นจุดเริ่มต้น แล้วค่อยไปต่อในหน้าที่ตรงกับโจทย์ของคุณ
                </div>
                <p className="mt-3 text-sm leading-relaxed text-[#5a5a82] sm:text-base">
                    ถ้าคุณต้องการรู้ทันทีว่าชื่อปัจจุบันดีหรือไม่ ให้เริ่มจากหน้าวิเคราะห์ชื่อฟรี แต่ถ้ากำลังหาชื่อใหม่หรือตั้งชื่อลูก ควรเริ่มที่หน้าค้นหาชื่อมงคลก่อน แล้วค่อยกลับมาวิเคราะห์ร่วมกับนามสกุลเพื่อเช็กความเหมาะสมขั้นสุดท้าย
                </p>
            </div>
        </section>
    );
};
