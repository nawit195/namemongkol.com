'use client';

import React from 'react';
import { Award, CalendarDays, LockKeyhole } from 'lucide-react';
import type { PremiumNameData } from '@/utils/premiumDataParser';
import { useLanguage } from '@/components/LanguageProvider';

interface NameCardProps {
    item: PremiumNameData;
    isUnlocked: boolean;
}

const THAI_LEADING_VOWELS = new Set(['\u0E40', '\u0E41', '\u0E42', '\u0E43', '\u0E44']);

function getFirstConsonant(name: string): string {
    if (!name) return '';
    return THAI_LEADING_VOWELS.has(name.charAt(0)) ? name.charAt(1) : name.charAt(0);
}

export default function PremiumNameCard({ item, isUnlocked }: NameCardProps) {
    const { t } = useLanguage();
    const dayOptions = [
        { value: 'All', label: t('pages.premiumSearch.filters.dayAll') },
        { value: 'อาทิตย์', label: t('pages.premiumSearch.days.sunday') },
        { value: 'จันทร์', label: t('pages.premiumSearch.days.monday') },
        { value: 'อังคาร', label: t('pages.premiumSearch.days.tuesday') },
        { value: 'พุธ(กลางวัน)', label: t('pages.premiumSearch.days.wednesday') },
        { value: 'พุธ(กลางคืน)', label: t('pages.premiumSearch.days.wednesday_night') },
        { value: 'พฤหัสบดี', label: t('pages.premiumSearch.days.thursday') },
        { value: 'ศุกร์', label: t('pages.premiumSearch.days.friday') },
        { value: 'เสาร์', label: t('pages.premiumSearch.days.saturday') },
    ];
    const getDayLabel = (value: string) => dayOptions.find((option) => option.value === value)?.label || value;
    const firstConsonant = getFirstConsonant(item.name) || item.name.charAt(0);

    return (
        <article className="relative overflow-hidden rounded-xl border border-amber-200 bg-[#fdfdff] p-4 shadow-[0_8px_20px_rgba(15,23,42,0.08)] transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-[0_12px_26px_rgba(15,23,42,0.12)] sm:p-5">
            <div className="absolute inset-x-0 top-0 h-1 bg-[#172033]" />
            <div className="pointer-events-none absolute -right-1 -top-3 font-serif text-7xl font-black leading-none text-[#172033]/[0.04]">{firstConsonant}</div>
            {!isUnlocked ? <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#172033]/25 backdrop-blur-[5px]"><span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-[#172033] px-3 py-1.5 text-xs font-bold text-amber-200"><LockKeyhole className="h-3.5 w-3.5" />ปลดล็อกเพื่อดูชื่อ</span></div> : null}

            <div className="relative">
                <div className="flex items-start justify-between gap-3">
                    <h3 className={`text-xl font-black text-[#172033] sm:text-2xl ${isUnlocked ? '' : 'select-none blur-md'}`}>{item.name}</h3>
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-md border border-amber-300 bg-amber-50 px-2 py-1 font-mono text-xs font-bold text-amber-800"><Award className="h-3.5 w-3.5" />{item.totalScore}</span>
                </div>

                <div className="mt-4 border-t border-[#eeeef6] pt-3">
                    <p className="flex items-center gap-1.5 text-xs font-semibold text-[#5a5a82]"><CalendarDays className="h-3.5 w-3.5 text-emerald-600" />เหมาะกับวันเกิด</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                        {item.suitableDays.map((day, index) => <span key={`${day}-${index}`} className="rounded-md border border-emerald-100 bg-emerald-50 px-2 py-1 text-[11px] font-medium text-[#40506f]">{getDayLabel(day)}</span>)}
                    </div>
                </div>

                <div className="mt-3 border-t border-[#eeeef6] pt-3">
                    <p className="text-xs font-semibold text-[#5a5a82]">พลังเลขคู่</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                        {item.scoreBreakdown.map((score, index) => <span key={`${score}-${index}`} className="rounded-md border border-[#ddddf0] bg-white px-2 py-1 font-mono text-[11px] font-semibold text-[#1a1a3e]">{score}</span>)}
                    </div>
                </div>
            </div>
        </article>
    );
}
