'use client';

import React from 'react';
import { ClipboardList, Cpu, Eye } from 'lucide-react';

const steps = [
    {
        num: '01',
        icon: ClipboardList,
        title: 'ระบุชื่อและวันเกิด',
        desc: 'กรอกชื่อ นามสกุล และวันเกิด เพื่อส่งให้ระบบคำนวณพื้นดวงชะตา',
        iconBg: 'bg-gradient-to-br from-amber-400 to-amber-600',
        glow: 'bg-amber-400/20',
        numColor: 'text-amber-100',
    },
    {
        num: '02',
        icon: Cpu,
        title: 'ระบบคำนวณ 4 ศาสตร์',
        desc: 'วิเคราะห์ร่วมกันระหว่าง เลขศาสตร์ ทักษา อายตนะ 6 และนิรันดร์ศาสตร์',
        iconBg: 'bg-gradient-to-br from-emerald-400 to-emerald-600',
        glow: 'bg-emerald-400/20',
        numColor: 'text-emerald-100',
    },
    {
        num: '03',
        icon: Eye,
        title: 'ทราบผลทำนายทันที',
        desc: 'ภาพรวมคะแนน คู่เลข และเกรดฟรี พร้อมตัวเลือกต่อยอดทำนายเชิงลึก',
        iconBg: 'bg-gradient-to-br from-purple-400 to-purple-600',
        glow: 'bg-purple-400/20',
        numColor: 'text-purple-100',
    },
];

export const HowItWorksSection = () => {
    return (
        <section className="w-full max-w-5xl mx-auto px-4 py-8 sm:py-16 relative z-10">
            <div className="text-center mb-8 sm:mb-14">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-500 mb-3">How It Works</p>
                <h2 className="text-2xl sm:text-3xl md:text-[2.5rem] font-bold text-[#1a1a3e] mb-4 tracking-tight">
                    วิธีเช็คชื่อมงคลกับ NameMongkol
                </h2>
                <p className="text-[#5a5a82] max-w-xl mx-auto text-sm sm:text-base">
                    วิเคราะห์ชื่อจริงได้ง่ายๆ ภายใน 3 ขั้นตอน พร้อมรับผลทำนายเชิงลึก
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 relative">
                {/* Connecting Line (Desktop) */}
                <div className="hidden md:block absolute top-[4.5rem] left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-amber-200 via-emerald-200 to-purple-200 opacity-60 z-0"></div>

                {steps.map((step, i) => (
                    <div
                        key={i}
                        className="relative bg-white border border-[#ddddf0] rounded-[1.75rem] p-6 sm:p-8 text-center hover:-translate-y-1.5 hover:shadow-[0_12px_40px_rgba(15,23,42,0.06)] transition-all duration-300 group z-10 overflow-hidden"
                    >
                        {/* Big background number */}
                        <div className={`absolute -right-2 -bottom-5 text-[7rem] font-black leading-none ${step.numColor} opacity-50 group-hover:scale-110 transition-transform duration-500 select-none`}>
                            {step.num}
                        </div>

                        {/* Top decorative glow */}
                        <div className={`absolute -top-10 left-1/2 -translate-x-1/2 w-28 h-28 ${step.glow} rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                        <div className={`relative w-16 h-16 ${step.iconBg} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300 border border-white/20`}>
                            <step.icon className="w-8 h-8 text-white" />
                        </div>

                        <h3 className="relative text-lg sm:text-[19px] font-bold text-[#1a1a3e] mb-3 tracking-tight">{step.title}</h3>
                        <p className="relative text-[#5a5a82] text-[14px] sm:text-[15px] leading-relaxed">{step.desc}</p>
                    </div>
                ))}
            </div>
        </section>
    );
};
