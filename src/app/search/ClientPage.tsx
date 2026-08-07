'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useMemo, useEffect } from 'react';
import ReviewBadge from '@/components/ReviewBadge';
import UserStatsBadge from '@/components/UserStatsBadge';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/utils/supabase';
import { Sparkles, ChevronDown, Filter, Lock, Type, Plus, Minus } from 'lucide-react';
import Swal from 'sweetalert2';

import { calculateScore } from '@/utils/numerologyUtils';
import { analyzeNameSuitability } from '@/utils/thaksaUtils';
import { analyzeName } from '@/utils/nameAnalysis';
import { getFirstThaiConsonant } from '@/utils/thaiNameInitial';
import { isRecentlyAdded, sortSearchNamesByNewest } from '@/utils/searchNameSort';
import { thaksaConfig, DayKey } from '@/data/thaksa';
import { useLanguage } from '@/components/LanguageProvider';
import { SoftYellowGlowBackground } from '@/components/ui/background-components';
import { trackEvent } from '@/lib/analytics';

const getDayBadgeProps = (d: string) => {
    if (d.includes('อาทิตย์')) return { label: 'อา.', className: 'bg-rose-100 text-rose-800 border border-rose-200' };
    if (d.includes('จันทร์')) return { label: 'จัน.', className: 'bg-amber-100 text-amber-800 border border-amber-200' };
    if (d.includes('อังคาร')) return { label: 'อัง.', className: 'bg-pink-100 text-pink-800 border border-pink-200' };
    if (d.includes('พุธ (กลางวัน)')) return { label: 'พุธวัน.', className: 'bg-emerald-100 text-emerald-800 border border-emerald-200' };
    if (d.includes('พุธ (กลางคืน')) return { label: 'พุธคืน.', className: 'bg-teal-100 text-teal-800 border border-teal-200' };
    if (d.includes('พฤหัส')) return { label: 'พฤ.', className: 'bg-orange-100 text-orange-800 border border-orange-200' };
    if (d.includes('ศุกร์')) return { label: 'ศุก.', className: 'bg-sky-100 text-sky-800 border border-sky-200' };
    if (d.includes('เสาร์')) return { label: 'เสา.', className: 'bg-purple-100 text-purple-800 border border-purple-200' };
    return { label: d, className: 'bg-slate-100 text-slate-700 border border-slate-200' };
};

function NameRow({ name, meaning, createdAt, rowIndex }: { name: string; meaning?: string; createdAt?: string; rowIndex: number }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const score = calculateScore(name);
    // Always calculate to know if it's usable on multiple days
    const suitability = useMemo(() => analyzeNameSuitability(name), [name]);

    const displayMeaning = useMemo(() => {
        if (!meaning) return undefined;
        if (meaning.includes('=')) {
            return meaning.split('=').pop()?.trim();
        }
        return meaning;
    }, [meaning]);
    const meaningText = displayMeaning || 'อยู่ระหว่างเพิ่มความหมาย';

    return (
        <>
            <tr
                className={`group cursor-pointer border-b border-[#eeeef6] last:border-0 transition-colors duration-200 ${isExpanded ? 'bg-[#eeebf8]' : rowIndex % 2 === 0 ? 'bg-[#fafafd] hover:bg-[#eeebf8]' : 'bg-[#f3f5f9] hover:bg-[#eeebf8]'}`}
                onClick={() => {
                    if (!isExpanded) void trackEvent('funnel.search.name_select');
                    setIsExpanded(!isExpanded);
                }}
            >
                {/* Column 1: Name (Mobile + Desktop) */}
                <td className="w-1/3 px-4 py-[18px] md:w-auto">
                    <div className="flex flex-wrap items-center gap-1.5">
                        <span className="whitespace-nowrap text-base font-bold text-[#1a1a3e] transition-colors group-hover:text-sky-900 md:text-lg">
                            {name}
                        </span>
                        {isRecentlyAdded(createdAt) ? (
                            <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                                เพิ่มล่าสุด
                            </span>
                        ) : null}
                    </div>
                </td>

                {/* Column 2: Meaning (Mobile + Desktop) */}
                <td className="px-2 py-[18px]">
                    <div className={`line-clamp-1 max-w-[140px] text-sm transition-colors xs:max-w-[180px] sm:max-w-none lg:line-clamp-2 ${displayMeaning ? 'text-slate-700 group-hover:text-slate-950' : 'italic text-slate-500'}`}>
                        {meaningText}
                    </div>
                </td>

                {/* Column 3: Day Badges (Desktop Only) */}
                <td className="hidden px-4 py-[18px] text-sm text-slate-700 transition-colors group-hover:text-slate-950 md:table-cell">
                    {suitability.suitable.length === 8 ? (
                        <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                            ใช้ได้ทุกวัน
                        </span>
                    ) : suitability.suitable.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                            {suitability.suitable.map((d, i) => {
                                const { label, className } = getDayBadgeProps(d);
                                return (
                                    <span key={i} className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-bold md:text-xs ${className}`}>
                                        {label}
                                    </span>
                                );
                            })}
                        </div>
                    ) : (
                        <span className="text-slate-600">-</span>
                    )}
                </td>

                {/* Column 4: Score (Desktop Only) */}
                <td className="hidden px-4 py-[18px] text-center md:table-cell">
                    <span className="inline-flex h-9 min-w-11 items-center justify-center rounded-full border border-[#e8c87e] bg-[#fff8e7] px-3 text-sm font-bold tabular-nums text-amber-800 shadow-sm transition-colors duration-200 group-hover:border-[#c9933a] group-hover:text-amber-950 md:text-base">
                        {score}
                    </span>
                </td>

                {/* Column 5: Expand Icon (Mobile + Desktop) */}
                <td className="w-[10%] px-3 py-[18px] text-right align-middle md:px-4">
                    <button
                        type="button"
                        aria-expanded={isExpanded}
                        aria-label={isExpanded ? `ปิดรายละเอียดชื่อ ${name}` : `ดูรายละเอียดชื่อ ${name}`}
                        className={`ml-auto flex h-9 w-9 items-center justify-center rounded-full border shadow-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 ${isExpanded ? 'border-rose-200 bg-rose-100 text-rose-700 hover:bg-rose-200' : 'border-emerald-200 bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}
                        onClick={(event) => {
                            event.stopPropagation();
                            if (!isExpanded) void trackEvent('funnel.search.name_select');
                            setIsExpanded(!isExpanded);
                        }}
                    >
                        {isExpanded ? <Minus className="h-4 w-4" strokeWidth={2.5} /> : <Plus className="h-4 w-4" strokeWidth={2.5} />}
                    </button>
                </td>
            </tr>

            {/* Expanded Details Row */}
            {isExpanded && (
                <tr className="animate-fade-in border-b border-[#ddd8ee] bg-[#eeebf8]">
                    <td colSpan={5} className="p-0">
                        <div className="grid gap-4 bg-[#fafafd] px-5 py-5 text-sm md:px-6">
                            
                            {/* Full Meaning */}
                            <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-4">
                                <span className="font-semibold text-slate-700 w-24 flex-shrink-0">ความหมาย</span>
                                <span className={displayMeaning ? 'text-slate-950' : 'italic text-slate-600'}>{meaningText}</span>
                            </div>

                            {/* Birth Days */}
                            <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-4">
                                <span className="font-semibold text-slate-700 w-24 flex-shrink-0 sm:mt-1">วันเกิด (มงคล)</span>
                                <div className="flex flex-wrap gap-1.5 items-center">
                                    {suitability.suitable.length > 0 ? (
                                        suitability.suitable.map((d, i) => {
                                            const { label, className } = getDayBadgeProps(d);
                                            return <span key={i} className={`rounded-full px-2.5 py-1 text-xs font-bold ${className}`}>{label}</span>;
                                        })
                                    ) : (
                                        <span className="text-slate-600 italic">- ไม่มี -</span>
                                    )}
                                </div>
                            </div>

                            {/* Unsuitable Days */}
                            {suitability.unsuitable.length > 0 && (
                                <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-4">
                                    <span className="font-semibold text-rose-800 w-24 flex-shrink-0 sm:mt-1">วันกาลกิณี</span>
                                    <div className="flex flex-wrap gap-1.5 items-center">
                                        {suitability.unsuitable.map((d, i) => {
                                            const { label, className } = getDayBadgeProps(d);
                                            return <span key={i} className={`rounded-full px-2.5 py-1 text-xs font-bold opacity-80 ${className}`}>{label}</span>;
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Numerology Score */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                                <span className="font-semibold text-slate-700 w-24 flex-shrink-0">เลขศาสตร์</span>
                                <div className="w-fit rounded-full border border-[#e8c87e] bg-[#fff8e7] px-3 py-1 text-sm font-bold text-amber-800 shadow-sm">
                                    {score}
                                </div>
                            </div>

                            <Link prefetch={false}
                                href={`/name-check?name=${encodeURIComponent(name)}`}
                                data-track="funnel.search.name_analyze"
                                className="inline-flex min-h-11 items-center justify-center rounded-lg bg-amber-400 px-4 py-2 font-bold text-slate-950 transition-colors hover:bg-amber-300"
                                onClick={(event) => event.stopPropagation()}
                            >
                                วิเคราะห์ชื่อนี้ฟรี
                            </Link>

                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}

// Thai consonants for letter filter
const THAI_LETTERS = [
    'ก','ข','ฃ','ค','ฅ','ฆ','ง','จ','ฉ','ช','ซ','ฌ','ญ','ฎ','ฏ','ฐ','ฑ','ฒ','ณ',
    'ด','ต','ถ','ท','ธ','น','บ','ป','ผ','ฝ','พ','ฟ','ภ','ม','ย','ร','ล','ว',
    'ศ','ษ','ส','ห','ฬ','อ','ฮ',
];

const UNLOCK_COST = 10;
const UNLOCK_AMOUNT = 20;

type PublicStats = {
    totalAnalyses: number;
    weeklyAnalyses: number;
    totalUsers: number;
    avgRating: number;
    reviewCount: number;
    totalNames: number;
    totalPremiumNames: number;
};

type SearchName = {
    name: string;
    gender: 'male' | 'female' | 'neutral';
    meaning?: string;
    createdAt?: string;
};

type SearchPageProps = {
    initialNames: SearchName[];
    initialTotal: number;
};

export default function SearchPage({ initialNames, initialTotal }: SearchPageProps) {
    const router = useRouter();
    const { t } = useLanguage();
    const [selectedDay, setSelectedDay] = useState<DayKey | 'all'>('all');
    const [selectedGender, setSelectedGender] = useState<'all' | 'male' | 'female' | 'neutral'>('all');
    const [selectedLetter, setSelectedLetter] = useState<string>('all');

    // Freemium State
    const [visibleCount, setVisibleCount] = useState(10);
    const [isUnlocking, setIsUnlocking] = useState(false);

    // All names are pre-loaded from the server — no API fetch needed for filtering.
    const names = initialNames;
    const [publicStats, setPublicStats] = useState<PublicStats | null>(null);

    // URL fragments preserve useful filter state without creating crawlable faceted URLs.
    useEffect(() => {
        const params = new URLSearchParams(window.location.hash.replace(/^#/, ''));
        const day = params.get('day');
        const gender = params.get('gender');
        const initial = params.get('initial');

        if (day && (day === 'all' || day in thaksaConfig)) setSelectedDay(day as DayKey | 'all');
        if (gender && ['all', 'male', 'female', 'neutral'].includes(gender)) {
            setSelectedGender(gender as 'all' | 'male' | 'female' | 'neutral');
        }
        if (initial) setSelectedLetter(initial);
    }, []);

    useEffect(() => {
        const fetchPublicStats = async () => {
            try {
                const res = await fetch('/api/public/stats');
                const json = await res.json();

                if (!json?.success || !json?.stats) return;

                const stats = json.stats as Partial<PublicStats>;

                setPublicStats({
                    totalAnalyses: typeof stats.totalAnalyses === 'number' ? stats.totalAnalyses : 0,
                    weeklyAnalyses: typeof stats.weeklyAnalyses === 'number' ? stats.weeklyAnalyses : 0,
                    totalUsers: typeof stats.totalUsers === 'number' ? stats.totalUsers : 0,
                    avgRating: typeof stats.avgRating === 'number' ? stats.avgRating : 0,
                    reviewCount: typeof stats.reviewCount === 'number' ? stats.reviewCount : 0,
                    totalNames: typeof stats.totalNames === 'number' ? stats.totalNames : 0,
                    totalPremiumNames: typeof stats.totalPremiumNames === 'number' ? stats.totalPremiumNames : 0,
                });
            } catch (err) {
                console.error('Error fetching public stats:', err);
            }
        };

        fetchPublicStats();
    }, []);

    // Filter Logic
    const filteredNames = useMemo(() => {
        const matchingNames = names.filter((item) => {
            const { name, gender } = item;

            // 1. Gender Filter
            if (selectedGender !== 'all') {
                if (selectedGender === 'male' && gender !== 'male' && gender !== 'neutral') return false;
                if (selectedGender === 'female' && gender !== 'female' && gender !== 'neutral') return false;
                if (selectedGender === 'neutral' && gender !== 'neutral') return false;
            }

            // 2. Day Filter (Suitability)
            if (selectedDay !== 'all') {
                const targetDayName = thaksaConfig[selectedDay].name;
                const suitability = analyzeNameSuitability(name);
                if (!suitability.suitable.includes(targetDayName)) return false;
            }

            // 3. Letter Filter - resolve the consonant behind Thai leading vowels (เ แ โ ใ ไ).
            if (selectedLetter !== 'all') {
                if (getFirstThaiConsonant(name) !== selectedLetter) return false;
            }

            return true;
        });

        return selectedLetter === 'all'
            ? matchingNames
            : sortSearchNamesByNewest(matchingNames);
    }, [selectedDay, selectedGender, selectedLetter, names]);

    // Grade distribution across all filtered names (for banner + CTA)
    const gradeStats = useMemo(() => {
        if (filteredNames.length === 0) return null;
        const counts: Record<string, number> = { 'A+': 0, 'A': 0, 'B': 0, 'C': 0 };
        filteredNames.forEach(item => {
            const g = analyzeName(item.name)?.grade ?? 'B';
            counts[g] = (counts[g] || 0) + 1;
        });
        return counts;
    }, [filteredNames]);

    // Count A+ names hidden beyond visible rows (for teaser row)
    const hiddenAplusCount = useMemo(() => {
        if (filteredNames.length <= visibleCount) return 0;
        return filteredNames.slice(visibleCount).filter(item => analyzeName(item.name)?.grade === 'A+').length;
    }, [filteredNames, visibleCount]);

    const liveNameCount = publicStats?.totalNames || initialTotal;

    // Reset to page 1 when filters change is now handled in event handlers



    const handleDayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedDay(e.target.value as DayKey | 'all');
        setVisibleCount(10);
    };

    const handleLetterChange = (letter: string) => {
        setSelectedLetter(letter);
        setVisibleCount(10);
    };

    const handleUnlock = async () => {
        if (isUnlocking) return;
        setIsUnlocking(true);

        try {
            // 1. Check Login Status
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                const result = await Swal.fire({
                    title: 'กรุณาเข้าสู่ระบบ',
                    text: 'เพื่อทำการปลดล็อกรายชื่อและบันทึกประวัติ',
                    icon: 'info',
                    showCancelButton: true,
                    confirmButtonText: 'เข้าสู่ระบบ',
                    cancelButtonText: 'ยกเลิก',
                    background: '#1e293b',
                    color: '#fff',
                    confirmButtonColor: '#3b82f6', // Blue-500
                    cancelButtonColor: '#64748b',
                    customClass: { popup: 'rounded-2xl', confirmButton: 'rounded-xl', cancelButton: 'rounded-xl' }
                });

                if (result.isConfirmed) {
                    router.push('/login');
                }
                return;
            }

            const fetchLatestCredits = async (): Promise<{ total: number; tier: string } | null> => {
                const { data, error } = await supabase
                    .from('user_profiles')
                    .select('tier, credits, welcome_credits, welcome_credits_granted_at')
                    .eq('id', user.id)
                    .maybeSingle();

                if (error) {
                    console.error('Error refreshing credits:', error);
                    return null;
                }

                if (data) {
                    let total = data.credits ?? 0;
                    if (data.welcome_credits && data.welcome_credits > 0 && data.welcome_credits_granted_at) {
                        const grantedAt = new Date(data.welcome_credits_granted_at).getTime();
                        if (Date.now() < grantedAt + 30 * 24 * 60 * 60 * 1000) {
                            total += data.welcome_credits;
                        }
                    }
                    return {
                        total,
                        tier: (data.tier || 'free').toLowerCase()
                    };
                }

                return null;
            };

            // Always refresh credits to avoid stale values
            const latestProfile = await fetchLatestCredits();

            if (latestProfile === null) {
                await Swal.fire({
                    title: 'ไม่สามารถดึงเครดิตได้',
                    text: 'กรุณาลองใหม่อีกครั้ง',
                    icon: 'error',
                    background: '#1e293b',
                    color: '#fff',
                    customClass: { popup: 'rounded-2xl' }
                });
                return;
            }

            const latestCredits = latestProfile.total;

            if (latestCredits < UNLOCK_COST) {
                const result = await Swal.fire({
                    title: 'เครดิตไม่เพียงพอ',
                    text: `การปลดล็อกต้องใช้ ${UNLOCK_COST} เครดิต กดเพื่อเติมเงิน`,
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'เติมเครดิต',
                    cancelButtonText: 'ยกเลิก',
                    background: '#1e293b',
                    color: '#fff',
                    confirmButtonColor: '#10b981',
                    cancelButtonColor: '#64748b',
                    customClass: { popup: 'rounded-2xl', confirmButton: 'rounded-xl', cancelButton: 'rounded-xl' }
                });
                if (result.isConfirmed) router.push('/topup');
                return;
            }

            const result = await Swal.fire({
                title: `ปลดล็อก ${UNLOCK_COST} เครดิต`,
                text: `โหลดเพิ่มอีก ${UNLOCK_AMOUNT} รายชื่อ`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'ยืนยัน',
                cancelButtonText: 'ยกเลิก',
                background: '#1e293b',
                color: '#fff',
                confirmButtonColor: '#059669',
                cancelButtonColor: '#ef4444',
                customClass: { popup: 'rounded-2xl', confirmButton: 'rounded-xl', cancelButton: 'rounded-xl' }
            });

            if (!result.isConfirmed) return;

            const { error } = await supabase.rpc('deduct_credits', { amount: UNLOCK_COST });
            if (error) {
                console.error('deduct_credits error:', error);
                await Swal.fire({
                    title: 'Error',
                    text: error.message || 'เกิดข้อผิดพลาดในการตัดเครดิต',
                    icon: 'error',
                    background: '#1e293b',
                    color: '#fff',
                    customClass: { popup: 'rounded-2xl' }
                });
                return;
            }

            const unlockedNames = filteredNames.slice(visibleCount, visibleCount + UNLOCK_AMOUNT);
            setVisibleCount(prev => prev + UNLOCK_AMOUNT);
            window.dispatchEvent(new Event('force_credits_update'));

            if ((latestProfile.tier === 'pro' || latestProfile.tier === 'vvip') && unlockedNames.length > 0) {
                try {
                    await supabase.rpc('cleanup_analysis_history_by_tier');

                    const resultData = unlockedNames.map((item) => {
                        const suitability = analyzeNameSuitability(item.name);
                        return {
                            name: item.name,
                            totalScore: calculateScore(item.name),
                            suitableDays: suitability.suitable
                        };
                    });

                    await supabase.from('analysis_history').insert({
                        user_id: user.id,
                        type: 'name_search',
                        input_data: {
                            selectedDay,
                            selectedGender,
                            selectedLetter,
                            unlockedCount: unlockedNames.length
                        },
                        result_data: resultData
                    });
                } catch (historyError) {
                    console.error('Failed to save search history:', historyError);
                }
            }

            await Swal.fire({
                title: 'โหลดรายชื่อสำเร็จ!',
                text: `เพิ่มรายชื่ออีก ${UNLOCK_AMOUNT} ชื่อเรียบร้อยแล้ว`,
                icon: 'success',
                timer: 1500,
                showConfirmButton: false,
                background: '#1e293b',
                color: '#fff',
                customClass: { popup: 'rounded-2xl' }
            });

            // Refresh credits from server to stay in sync
            await fetchLatestCredits();
        } catch (err) {
            console.error('unlock error:', err);
            // -expect-error Temporary type mismatch with external/runtime data.
            const Swal = (await import('sweetalert2')).default;
            await Swal.fire({
                title: 'เกิดข้อผิดพลาด',
                text: 'ไม่สามารถดำเนินการได้ กรุณาลองใหม่',
                icon: 'error',
                background: '#1e293b',
                color: '#fff',
                customClass: { popup: 'rounded-2xl' }
            });
        } finally {
            setIsUnlocking(false);
        }
    };



    return (
        <SoftYellowGlowBackground className="font-sans overflow-x-hidden selection:bg-amber-500 selection:text-white">
                        <div className="relative z-10 mx-auto w-full max-w-[1400px] px-4 pb-36 pt-7 text-slate-900 md:pb-28 md:pt-32">
                                {/* Social Proof & Engagement Section */}
                                <div className="mb-4 flex flex-col items-center gap-2 md:mb-8 md:gap-3">
                                    <div className="flex flex-wrap gap-2 md:gap-3 justify-center">
                                        <ReviewBadge rating={publicStats?.avgRating} count={publicStats?.reviewCount} />
                                        <UserStatsBadge users={publicStats?.weeklyAnalyses} label="มีผู้ค้นหาสัปดาห์นี้แล้ว" />
                                        <UserStatsBadge users={liveNameCount} label="ชื่อในฐานข้อมูลล่าสุด" />
                                    </div>
                                </div>
                                <div className="mb-5 text-center md:mb-12">
                                    <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-amber-300/40 bg-amber-100/70 px-3 py-1 text-xs text-amber-800 md:mb-4 md:text-sm">
                                        <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                        <span>{t('pages.search.badge')}</span>
                                    </div>
                                    <h1 className="mb-3 text-[2rem] font-bold leading-tight tracking-tight text-slate-950 sm:text-4xl md:mb-6 md:text-5xl lg:text-6xl">
                                        {t('pages.search.title')}
                                    </h1>
                                    <p className="mx-auto mb-4 max-w-[65ch] px-2 text-sm leading-relaxed text-slate-700 sm:text-base md:mb-6">
                                        {t('pages.search.description')}
                                    </p>
                                    {/* Pro Tip / Guidance Block */}
                                    <div className="relative mx-auto hidden max-w-2xl items-start gap-4 overflow-hidden rounded-xl border border-amber-200 bg-white/80 p-4 text-left shadow-sm shadow-slate-950/5 sm:flex">
                                        <div className="absolute inset-0 bg-gradient-to-r from-amber-100/70 to-transparent opacity-70 transition-opacity"></div>
                                        <div className="p-2 bg-amber-100 rounded-lg text-amber-700 shrink-0 relative z-10">
                                            <Sparkles className="w-5 h-5" />
                                        </div>
                                        <div className="relative z-10">
                                            <h3 className="text-amber-800 font-semibold mb-1 text-sm">💡 {t('pages.search.tipTitle')}</h3>
                                            <p className="text-slate-700 text-sm leading-relaxed">
                                                {t('pages.search.tipBody')} <Link prefetch={false} href="/name-check" className="text-amber-700 hover:underline decoration-amber-400/30 underline-offset-4">{t('pages.search.links.l1Title')}</Link>
                                                <span className="mx-1 text-slate-400">·</span>
                                                ถ้ายังไม่มีชื่อในใจ ลอง <Link prefetch={false} href="/name-generator" className="font-bold text-pink-600 hover:underline decoration-pink-300/50 underline-offset-4">สร้างชื่อมงคลด้วย AI</Link>
                                            </p>
                                        </div>
                                    </div>
                                </div>

                {/* Search & Filter Section */}
                <div className="max-w-4xl mx-auto mb-8 md:mb-12 space-y-4">


                    {/* Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                        {/* Day Filter */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Filter className="h-4 w-4 text-slate-400" />
                            </div>
                            <select
                                value={selectedDay}
                                onChange={handleDayChange}
                                className="block w-full pl-11 pr-4 py-2.5 md:py-3 text-sm md:text-base bg-slate-950/90 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-transparent shadow-lg shadow-slate-950/10 transition-all appearance-none cursor-pointer"
                            >
                                <option value="all" className="bg-slate-900 text-slate-200">{t('pages.search.filters.dayAny')}</option>
                                {Object.keys(thaksaConfig).map((key) => (
                                    <option key={key} value={key} className="bg-slate-900 text-slate-200">
                                        {thaksaConfig[key as DayKey].name}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                <ChevronDown className="h-4 w-4 text-slate-400" />
                            </div>
                        </div>

                        {/* Gender Filter */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <span className="text-slate-400 text-sm">{t('pages.search.filters.genderLabel')}</span>
                            </div>
                            <select
                                value={selectedGender}
                                onChange={(e) => {
                                    setSelectedGender(e.target.value as any);
                                    setVisibleCount(10);
                                }}
                                className="block w-full pl-12 pr-4 py-2.5 md:py-3 text-sm md:text-base bg-slate-950/90 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-transparent shadow-lg shadow-slate-950/10 transition-all appearance-none cursor-pointer"
                            >
                                <option value="all" className="bg-slate-900 text-slate-200">{t('pages.search.filters.genderAll')}</option>
                                <option value="male" className="bg-slate-900 text-slate-200">{t('pages.search.filters.genderMale')}</option>
                                <option value="female" className="bg-slate-900 text-slate-200">{t('pages.search.filters.genderFemale')}</option>
                                <option value="neutral" className="bg-slate-900 text-slate-200">{t('pages.search.filters.genderNeutral')}</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                <ChevronDown className="h-4 w-4 text-slate-400" />
                            </div>
                        </div>
                    </div>

                    {/* Letter Filter (ก-ฮ) */}
                    <div className="space-y-2 mt-2">
                        <div className="flex items-center gap-2 text-xs md:text-sm text-slate-600">
                            <Type className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            <span>กรองตามตัวอักษรแรก</span>
                            {selectedLetter !== 'all' && (
                                <button
                                    onClick={() => handleLetterChange('all')}
                                    className="ml-auto text-xs text-amber-700 hover:text-amber-800 transition-colors"
                                >
                                    ล้างตัวกรอง
                                </button>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-1 md:gap-1.5">
                            <button
                                onClick={() => handleLetterChange('all')}
                                className={`px-2.5 md:px-3 py-1 md:py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all ${
                                    selectedLetter === 'all'
                                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg shadow-amber-500/20'
                                        : 'bg-white/80 text-slate-700 border border-slate-200 hover:text-slate-950 hover:border-amber-400/40 hover:bg-amber-50'
                                }`}
                            >
                                ทั้งหมด
                            </button>
                            {THAI_LETTERS.map((letter) => (
                                <button
                                    key={letter}
                                    onClick={() => handleLetterChange(letter)}
                                    className={`w-7 h-7 md:w-9 md:h-9 rounded-lg text-xs md:text-sm font-medium transition-all flex items-center justify-center ${
                                        selectedLetter === letter
                                            ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg shadow-amber-500/20 scale-110'
                                            : 'bg-white/80 text-slate-700 border border-slate-200 hover:text-slate-950 hover:border-amber-400/40 hover:bg-amber-50'
                                    }`}
                                >
                                    {letter}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Grade Legend + CTA Banner */}
                <div className="mb-6 space-y-3">
                    {/* Grade legend strip */}
                    <div className="flex flex-wrap items-center gap-2 md:gap-4 px-4 py-3 rounded-xl border border-slate-200 bg-white/80 text-xs shadow-sm shadow-slate-950/5 md:text-sm">
                        <span className="text-slate-500 font-medium shrink-0">ระดับเกรด:</span>
                        <span className="flex items-center gap-1.5">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md font-bold border bg-amber-100 text-amber-800 border-amber-300 text-[11px]">A+</span>
                            <span className="text-slate-700">เลขศาสตร์ดีเลิศ ทุกคู่มงคล</span>
                        </span>
                        <span className="text-slate-700 hidden md:inline">·</span>
                        <span className="flex items-center gap-1.5">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md font-bold border bg-emerald-100 text-emerald-800 border-emerald-300 text-[11px]">A</span>
                            <span className="text-slate-700">เลขศาสตร์ดี ส่วนใหญ่มงคล</span>
                        </span>
                        <span className="text-slate-700 hidden md:inline">·</span>
                        <span className="flex items-center gap-1.5">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md font-semibold border bg-slate-100 text-slate-700 border-slate-300 text-[11px]">B</span>
                            <span className="text-slate-700">ผ่านทักษา เลขศาสตร์ยังไม่เต็มระดับ</span>
                        </span>
                    </div>

                    {/* CTA Banner — dynamic styling based on grade distribution */}
                    {gradeStats && (() => {
                        const total = filteredNames.length;
                        const bGradeCount = gradeStats['B'] || 0;
                        const lowerGradeCount = bGradeCount + (gradeStats['C'] || 0);
                        const aplusCount = gradeStats['A+'] || 0;
                        const aCount = gradeStats['A'] || 0;
                        const isMostlyB = lowerGradeCount > total * 0.5;

                        return isMostlyB ? (
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
                                <p className="text-amber-800 text-sm font-medium text-center sm:text-left">
                                    พบทั้งหมด <strong>{total.toLocaleString('th-TH')}</strong> ชื่อในหมวดนี้
                                    <span className="mx-1.5 text-amber-500">•</span>
                                    เกรด A+ <strong>{aplusCount.toLocaleString('th-TH')}</strong> ชื่อ
                                    <span className="mx-1.5 text-amber-500">•</span>
                                    เกรด A <strong>{aCount.toLocaleString('th-TH')}</strong> ชื่อ
                                    {bGradeCount > 0 ? (
                                        <>
                                            <span className="mx-1.5 text-amber-500">•</span>
                                            เกรด B <strong>{bGradeCount.toLocaleString('th-TH')}</strong> ชื่อ
                                        </>
                                    ) : null}
                                </p>
                                <Link prefetch={false}
                                    href="/premium-search"
                                    className="shrink-0 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-colors shadow-lg shadow-amber-500/20"
                                >
                                    เปลี่ยนชื่อมงคล Pro →
                                </Link>
                            </div>
                        ) : (
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white/80 px-4 py-3 shadow-sm shadow-slate-950/5">
                                <p className="text-slate-700 text-sm text-center sm:text-left">
                                    พบทั้งหมด <strong>{total.toLocaleString('th-TH')}</strong> ชื่อในหมวดนี้
                                    <span className="mx-1.5 text-slate-400">•</span>
                                    เกรด A+ <strong>{aplusCount.toLocaleString('th-TH')}</strong> ชื่อ
                                    <span className="mx-1.5 text-slate-400">•</span>
                                    เกรด A <strong>{aCount.toLocaleString('th-TH')}</strong> ชื่อ
                                    {bGradeCount > 0 ? (
                                        <>
                                            <span className="mx-1.5 text-slate-400">•</span>
                                            เกรด B <strong>{bGradeCount.toLocaleString('th-TH')}</strong> ชื่อ
                                        </>
                                    ) : null}
                                </p>
                                <Link prefetch={false}
                                    href="/premium-search"
                                    className="shrink-0 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
                                >
                                    เปลี่ยนชื่อมงคล Pro →
                                </Link>
                            </div>
                        );
                    })()}
                </div>

                {/* Results Table */}
                <div className="mb-8 overflow-hidden rounded-2xl border border-[#ddddf0] bg-[#fafafd] shadow-[0_12px_30px_rgba(15,23,42,0.07)]">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b-2 border-amber-300/70 bg-[linear-gradient(90deg,#f8f8fc_0%,#f3f3f9_52%,#e8ecf2_100%)] text-[#1a1a3e]">
                                <th className="px-4 py-4 font-semibold text-sm tracking-wide uppercase text-left">{t('pages.search.table.name')}</th>
                                <th className="px-2 py-4 font-semibold text-sm tracking-wide uppercase text-left">ความหมาย</th>
                                <th className="hidden md:table-cell px-4 py-4 font-semibold text-sm tracking-wide uppercase text-left">{t('pages.search.table.day')}</th>
                                <th className="hidden md:table-cell px-4 py-4 font-semibold text-sm tracking-wide uppercase text-center">{t('pages.search.table.score')}</th>
                                <th className="px-4 py-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#eeeef6] bg-[#fafafd]">
                            {filteredNames.length > 0 ? (
                                <>
                                    {filteredNames.slice(0, visibleCount).map((item, index) => (
                                        <NameRow key={`${item.name}-${index}`} name={item.name} meaning={item.meaning} createdAt={item.createdAt} rowIndex={index} />
                                    ))}

                                    {/* Teaser row: show count of hidden A+ names to drive upgrade */}
                                    {hiddenAplusCount > 0 && (
                                        <tr className="border-t border-amber-200/90 bg-[linear-gradient(90deg,#fff8e7_0%,#f6f3fb_52%,#eeebf8_100%)]">
                                            <td colSpan={5} className="px-4 py-3.5 text-center">
                                                <Link prefetch={false}
                                                    href="/premium-search"
                                                    className="inline-flex items-center gap-2 text-sm font-medium text-amber-800 transition-colors hover:text-amber-950"
                                                >
                                                    ยังไม่แสดงชื่อเกรด A+ อีก <strong>{hiddenAplusCount.toLocaleString('th-TH')}</strong> ชื่อ ดูชุดคัดกรองได้ใน Premium Search
                                                    <span className="text-amber-600">→</span>
                                                </Link>
                                            </td>
                                        </tr>
                                    )}

                                    {/* Locked State / Load More Button */}
                                    {visibleCount < filteredNames.length && (
                                        <tr className="bg-[linear-gradient(145deg,#fafafd_0%,#f3f3f9_58%,#eeebf8_100%)]">
                                            <td colSpan={5} className="relative h-28 overflow-hidden p-0">
                                                {/* Blurred content (fake rows) */}
                                                <div className="pointer-events-none absolute inset-0 flex h-full w-full select-none flex-col gap-3 p-4 opacity-35 blur-sm">
                                                    <div className="h-9 w-full rounded-xl bg-white/80"></div>
                                                    <div className="h-9 w-3/4 rounded-xl bg-white/80"></div>
                                                </div>

                                                {/* Unlock Button Overlay */}
                                                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-[#eeebf8] via-[#f3f3f9]/92 to-transparent">
                                                    <button
                                                        onClick={handleUnlock}
                                                        disabled={isUnlocking}
                                                        className={`group relative flex items-center gap-2 rounded-xl px-5 py-3 shadow-[0_8px_18px_rgba(201,147,58,0.18)] transition-all duration-200 md:gap-3 md:px-7 ${isUnlocking
                                                            ? 'cursor-not-allowed bg-[#e8c87e]/70 text-slate-600'
                                                            : 'bg-gradient-to-r from-[#e8c87e] to-[#c9933a] text-slate-950 hover:-translate-y-0.5 hover:from-[#f0d997] hover:to-[#d4a54e] active:translate-y-0'
                                                            }`}
                                                    >
                                                        <div className="rounded-md bg-[#1a1a3e]/10 p-1 md:rounded-lg md:p-1.5">
                                                            <Lock className="w-4 h-4 md:w-5 md:h-5" />
                                                        </div>
                                                        <span className="text-base font-bold">{t('pages.search.unlock.button')}</span>
                                                        <div className="flex items-center gap-1 rounded-full bg-[#1a1a3e]/10 px-2 py-1 text-[10px] font-bold text-[#1a1a3e] md:text-xs">
                                                            {t('pages.search.unlock.cost')}
                                                        </div>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </>
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-8 py-16 text-center text-slate-500">
                                        <div className="flex flex-col items-center gap-3">
                                            <Sparkles className="w-8 h-8 opacity-20" />
                                            <span>{t('pages.search.empty')}</span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {filteredNames.length > 0 && (
                    <div className="mt-4 text-center text-slate-500 text-sm">
                        {t('pages.search.showingPrefix')} {Math.min(visibleCount, filteredNames.length).toLocaleString('th-TH')} {t('pages.search.showingConnector')} {filteredNames.length.toLocaleString('th-TH')}
                    </div>
                )}

            </div>
        </SoftYellowGlowBackground>
    );
}
