'use client';

import React from 'react';
import { BadgeCheck, Coins, Search, ShieldCheck, Type } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/components/LanguageProvider';

interface PremiumHeaderProps {
    totalNames: number;
    filteredCount: number;
    availableLettersCount: number;
    credits: number | null;
}

export default function PremiumHeader({ totalNames, filteredCount, availableLettersCount, credits }: PremiumHeaderProps) {
    const { t } = useLanguage();
    const totalNamesLabel = totalNames.toLocaleString('th-TH');
    const filteredNamesLabel = filteredCount.toLocaleString('th-TH');
    const availableLettersLabel = availableLettersCount.toLocaleString('th-TH');

    const quickStats = [
        { label: 'ชื่อที่ผ่านการคัด', value: totalNamesLabel, icon: BadgeCheck },
        { label: 'ตรงเงื่อนไขขณะนี้', value: filteredNamesLabel, icon: Search },
        { label: 'หมวดอักษรที่เลือกได้', value: availableLettersLabel, icon: Type },
    ];

    return (
        <header className="border-b border-[#ddddf0] pb-6 sm:pb-8">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_17rem] lg:items-start lg:gap-10">
                <div className="min-w-0">
                    <p className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        NAME MONGKOL PRO
                    </p>
                    <h1 className="mt-4 text-3xl font-black leading-tight text-[#1a1a3e] sm:text-4xl lg:text-5xl">
                        {t('pages.premiumSearch.headerTitle')}
                    </h1>
                    <p className="mt-3 max-w-3xl text-sm leading-7 text-[#5a5a82] sm:text-base">
                        {t('pages.premiumSearch.headerDesc').replace('{count}', totalNamesLabel)}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-[#40506f]">
                        <span className="rounded-full border border-[#ddddf0] bg-white px-3 py-1.5">คัดตามวันเกิด</span>
                        <span className="rounded-full border border-[#ddddf0] bg-white px-3 py-1.5">ผลรวม Grade A+</span>
                        <span className="rounded-full border border-[#ddddf0] bg-white px-3 py-1.5">อักษรเดชและศรี</span>
                    </div>
                    <p className="mt-4 text-sm font-semibold text-emerald-700">
                        {t('pages.premiumSearch.headerSub')}
                    </p>
                </div>

                <aside className="rounded-2xl border border-slate-700 bg-[#172033] p-4 text-slate-100 shadow-[0_10px_26px_rgba(15,23,42,0.16)]">
                    <div className="flex items-center justify-between gap-3 border-b border-slate-700 pb-3">
                        <span className="text-xs font-semibold text-slate-300">เครดิตพร้อมใช้งาน</span>
                        <Coins className="h-4 w-4 text-amber-300" />
                    </div>
                    <div className="mt-3 flex items-end justify-between gap-3">
                        <span className="font-mono text-3xl font-black text-amber-200">{credits !== null ? credits.toLocaleString('th-TH') : '—'}</span>
                        <Link prefetch={false} href="/topup" className="rounded-lg border border-amber-400/50 px-3 py-1.5 text-xs font-bold text-amber-200 transition-colors hover:bg-amber-400 hover:text-[#172033]">
                            เติมเครดิต
                        </Link>
                    </div>
                    <p className="mt-3 text-xs leading-5 text-slate-400">
                        ปลดล็อกชื่อที่คัดตรงเงื่อนไขครั้งละ 20 ชื่อ ใช้ 15 เครดิต
                    </p>
                </aside>
            </div>

            <div className="mt-6 grid grid-cols-3 divide-x divide-[#ddddf0] rounded-xl border border-[#ddddf0] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
                {quickStats.map(({ label, value, icon: Icon }) => (
                    <div key={label} className="min-w-0 px-3 py-3 text-center sm:px-5 sm:text-left">
                        <div className="flex items-center justify-center gap-1.5 text-[10px] font-semibold text-[#6d6d8f] sm:justify-start sm:text-xs">
                            <Icon className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                            <span className="truncate">{label}</span>
                        </div>
                        <div className="mt-1 font-mono text-lg font-black text-[#1a1a3e] sm:text-xl">{value}</div>
                    </div>
                ))}
            </div>
        </header>
    );
}
