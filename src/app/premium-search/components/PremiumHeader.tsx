'use client';

import React from 'react';
import { BadgeCheck, CalendarDays, ChevronDown, Coins, Search, ShieldCheck, Type } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/components/LanguageProvider';

interface PremiumHeaderProps {
    totalNames: number | null;
    filteredCount: number;
    availableLettersCount: number;
    credits: number | null;
    latestAddedAt?: string | null;
}

export default function PremiumHeader({ totalNames, filteredCount, availableLettersCount, credits, latestAddedAt }: PremiumHeaderProps) {
    const { t } = useLanguage();
    const totalNamesLabel = totalNames === null ? '—' : totalNames.toLocaleString('th-TH');
    const filteredNamesLabel = filteredCount.toLocaleString('th-TH');
    const availableLettersLabel = availableLettersCount.toLocaleString('th-TH');
    const updatedDate = latestAddedAt && Number.isFinite(Date.parse(latestAddedAt)) ? new Date(latestAddedAt) : null;
    const updatedLabel = updatedDate ? new Intl.DateTimeFormat('th-TH', {
        day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Bangkok',
    }).format(updatedDate) : '—';

    const quickStats = [
        { label: 'ชื่อที่ผ่านการคัด', mobileLabel: 'ชื่อคัดสรร', value: totalNamesLabel, icon: BadgeCheck },
        { label: 'ตรงเงื่อนไขขณะนี้', mobileLabel: 'ตรงเงื่อนไข', value: filteredNamesLabel, icon: Search },
        { label: 'หมวดอักษรที่เลือกได้', mobileLabel: 'หมวดอักษร', value: availableLettersLabel, icon: Type },
    ];

    return (
        <header className="border-b border-[#ddddf0] pb-3 md:pb-8">
            <div className="grid gap-3 md:gap-6 lg:grid-cols-[minmax(0,1fr)_17rem] lg:items-start lg:gap-10">
                <div className="min-w-0">
                    <p className="hidden items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 md:inline-flex">
                        <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                        NAME MONGKOL PRO
                    </p>
                    <h1 className="text-2xl font-black leading-snug text-[#1a1a3e] md:mt-4 md:text-4xl lg:text-5xl">
                        {t('pages.premiumSearch.headerTitle')}
                    </h1>
                    <p className="mt-1.5 text-sm leading-6 text-[#5a5a82] md:hidden">
                        {totalNames === null ? 'เลือกชื่อมงคลตามวันเกิดและเลขศาสตร์' : `คัดชื่อจาก ${totalNamesLabel} รายชื่อ ตามวันเกิดและเลขศาสตร์`}
                    </p>
                    <p className="mt-3 hidden max-w-3xl text-base leading-7 text-[#5a5a82] md:block">
                        {totalNames === null ? 'คัดชื่อมงคลตามวันเกิดและเงื่อนไขที่คุณเลือก' : t('pages.premiumSearch.headerDesc').replace('{count}', totalNamesLabel)}
                    </p>
                    <div className="mt-4 hidden flex-wrap gap-2 text-xs font-semibold text-[#40506f] md:flex">
                        <span className="rounded-full border border-[#ddddf0] bg-white px-3 py-1.5">คัดตามวันเกิด</span>
                        <span className="rounded-full border border-[#ddddf0] bg-white px-3 py-1.5">เลือกผลรวมเลขศาสตร์</span>
                        <span className="rounded-full border border-[#ddddf0] bg-white px-3 py-1.5">อักษรเดชและศรี</span>
                    </div>
                    <p className="mt-4 hidden text-sm font-semibold text-emerald-700 md:block">
                        {t('pages.premiumSearch.headerSub')}
                    </p>
                </div>

                <aside aria-label="เครดิตและค่าปลดล็อก" className="flex items-center justify-between gap-3 rounded-xl border border-slate-700 bg-[#172033] px-3 py-2 text-slate-100 md:block md:rounded-2xl md:p-4 md:shadow-[0_10px_26px_rgba(15,23,42,0.16)]">
                    <div className="min-w-0 md:contents">
                        <div className="flex items-center gap-2 md:justify-between md:border-b md:border-slate-700 md:pb-3">
                            <span className="text-xs font-semibold text-slate-300">เครดิตพร้อมใช้</span>
                            <Coins className="hidden h-4 w-4 text-amber-300 md:block" aria-hidden="true" />
                            <strong className="font-mono text-lg text-amber-200 md:hidden">{credits !== null ? credits.toLocaleString('th-TH') : '—'}</strong>
                        </div>
                        <p className="text-xs leading-5 text-slate-300 md:hidden">15 เครดิต · สูงสุด 20 ชื่อ</p>
                    </div>
                    <div className="flex shrink-0 items-end justify-between gap-3 md:mt-3">
                        <span className="hidden font-mono text-3xl font-black text-amber-200 md:inline">{credits !== null ? credits.toLocaleString('th-TH') : '—'}</span>
                        <Link prefetch={false} href="/topup" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-amber-400/50 px-3 text-xs font-bold text-amber-200 transition-colors hover:bg-amber-400 hover:text-[#172033]">
                            เติมเครดิต
                        </Link>
                    </div>
                    <p className="mt-3 hidden text-xs leading-5 text-slate-300 md:block">
                        ปลดล็อกชื่อที่คัดตรงเงื่อนไขครั้งละ 20 ชื่อ ใช้ 15 เครดิต
                    </p>
                </aside>
            </div>

            <div className="mt-3 grid grid-cols-3 divide-x divide-[#ddddf0] rounded-xl border border-[#ddddf0] bg-white md:mt-6 md:shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
                {quickStats.map(({ label, mobileLabel, value, icon: Icon }) => (
                    <div key={label} className="min-w-0 px-2 py-2 text-center md:px-5 md:py-3 md:text-left">
                        <div className="flex items-center justify-center gap-1.5 text-[11px] font-medium text-[#5a5a82] md:justify-start md:text-xs md:font-semibold">
                            <Icon className="hidden h-3.5 w-3.5 shrink-0 text-amber-600 md:block" aria-hidden="true" />
                            <span className="md:hidden">{mobileLabel}</span>
                            <span className="hidden md:inline">{label}</span>
                        </div>
                        <div className="font-mono text-base font-bold text-[#1a1a3e] md:mt-1 md:text-xl md:font-black">{value}</div>
                    </div>
                ))}
            </div>
            <details className="group mt-1 md:hidden">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 text-xs text-[#5a5a82] [&::-webkit-details-marker]:hidden">
                    <span className="font-semibold">ข้อมูลการคัดชื่อ</span>
                    <span className="ml-auto">อัปเดต {updatedLabel}</span>
                    <ChevronDown className="h-3.5 w-3.5 shrink-0 transition-transform group-open:rotate-180" aria-hidden="true" />
                </summary>
                <div className="space-y-2 pb-2 text-sm leading-6 text-[#5a5a82]">
                    <p>{totalNames === null ? 'คัดชื่อมงคลตามวันเกิดและเงื่อนไขที่คุณเลือก' : t('pages.premiumSearch.headerDesc').replace('{count}', totalNamesLabel)}</p>
                    <p>กรองตามวันเกิด ผลรวมเลขศาสตร์ และอักษรเดชหรือศรี</p>
                    <p>{t('pages.premiumSearch.headerSub')}</p>
                </div>
            </details>
            <p className="mt-3 hidden flex-wrap items-center justify-end gap-x-2 gap-y-1 text-sm leading-6 text-[#5a5a82] md:flex" title="วันที่เพิ่มข้อมูลรายชื่อพรีเมียมล่าสุด">
                <CalendarDays aria-hidden="true" className="h-4 w-4 shrink-0 text-amber-600" />
                <span>อัปเดตรายชื่อล่าสุด</span>
                {updatedDate ? <time dateTime={updatedDate.toISOString()} className="font-semibold text-[#1a1a3e]">{updatedLabel}</time> : <span>{updatedLabel}</span>}
            </p>
        </header>
    );
}
