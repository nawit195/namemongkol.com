'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Lock, Search, RotateCcw, SlidersHorizontal, Coins, CheckCircle2 } from 'lucide-react';
import { premiumNamesRaw } from '@/data/premiumNamesRaw';
import { parsePremiumNames } from '@/utils/premiumDataParser';
import { supabase } from '@/utils/supabase';
import { getPrediction } from '@/utils/getPrediction';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/components/LanguageProvider';
import {
    filterPremiumNames,
    getAvailablePremiumLetters,
    getUniquePremiumScores,
    groupPremiumNamesByLetter,
    type LeadingCharType,
} from './premiumSearchUtils';
import {
    deductCredits,
    getEffectiveUserCredits,
    savePremiumUnlockHistoryIfEligible,
} from '@/services/premiumSearchService';

// Import New Sub-components
import PremiumHeader from './components/PremiumHeader';
import PremiumNameCard from './components/PremiumNameCard';
import PremiumAlphabetBar from './components/PremiumAlphabetBar';
import PremiumSEOSection from './components/PremiumSEOSection';
import { SoftYellowGlowBackground } from '@/components/ui/background-components';

interface ScoreDropdownProps {
    value: string;
    onChange: (value: string) => void;
    scores: number[];
    disabled: boolean;
}

function ScoreDropdown({ value, onChange, scores, disabled }: ScoreDropdownProps) {
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement | null>(null);
    const { t } = useLanguage();
    const getScoreBadgeClass = (tone: string) => {
        if (tone.includes('emerald')) return 'border border-emerald-200 bg-emerald-100 text-emerald-800';
        if (tone.includes('rose')) return 'border border-rose-200 bg-rose-100 text-rose-700';
        return 'border border-amber-200 bg-amber-100 text-amber-800';
    };

    useEffect(() => {
        if (!open) return;
        const handlePointerDown = (event: MouseEvent | TouchEvent) => {
            const root = rootRef.current;
            if (root && event.target instanceof Node && !root.contains(event.target)) setOpen(false);
        };
        const handleKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); };
        document.addEventListener('mousedown', handlePointerDown);
        document.addEventListener('touchstart', handlePointerDown);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
            document.removeEventListener('touchstart', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [open]);

    useEffect(() => { if (disabled) setTimeout(() => setOpen(false), 0); }, [disabled]);

    const selectedLabel = value ? `${t('pages.premiumSearch.filters.scorePrefix') || ''} ${value}`.trim() : t('pages.premiumSearch.filters.scoreAny');

    return (
        <div ref={rootRef} className="relative">
            <button
                type="button"
                disabled={disabled}
                onClick={() => setOpen(v => !v)}
                className={`flex w-full items-center justify-between rounded-lg border border-slate-600 bg-slate-800 px-3 py-2.5 text-xs font-semibold text-slate-100 transition-colors focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-300/20 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:text-sm ${open ? 'rounded-b-none border-b-transparent' : ''}`}
            >
                <span>{selectedLabel}</span>
                <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 sm:h-4 sm:w-4 ${open ? 'rotate-180 text-amber-200' : ''}`} />
            </button>

            {open && (
                <div className="absolute left-0 right-0 top-full z-50 mt-0 max-h-80 overflow-y-auto rounded-b-lg border border-t-0 border-slate-600 bg-slate-800 shadow-[0_20px_40px_rgba(15,23,42,0.35)] custom-scrollbar">
                    <button
                        type="button"
                        onClick={() => { onChange(''); setOpen(false); }}
                        className={`w-full border-b border-slate-700 px-4 py-3 text-left text-sm font-semibold transition-colors ${value === '' ? 'bg-amber-300 text-[#172033]' : 'text-slate-200 hover:bg-slate-700'}`}
                    >
                        {t('pages.premiumSearch.filters.scoreAny')}
                    </button>
                    {scores.map((score: number) => {
                        const { desc, color, level } = getPrediction(score);
                        return (
                            <button
                                key={score}
                                type="button"
                                onClick={() => { onChange(score.toString()); setOpen(false); }}
                                className={`group/item flex w-full items-center justify-between border-b border-slate-700 px-4 py-3 text-left transition-colors last:border-0 ${value === score.toString() ? 'bg-amber-300/90' : 'hover:bg-slate-700'}`}
                            >
                                <div className="flex flex-col flex-1 min-w-0 pr-4">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`font-bold transition-colors ${value === score.toString() ? 'text-[#172033]' : 'text-slate-100 group-hover/item:text-amber-100'}`}>
                                            {(t('pages.premiumSearch.filters.scorePrefix') || '').trim()} {score}
                                        </span>
                                        <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getScoreBadgeClass(color)}`}>
                                            {level}
                                        </span>
                                    </div>
                                    <span className={`truncate text-xs transition-colors ${value === score.toString() ? 'text-[#5f4310]' : 'text-slate-400 group-hover/item:text-slate-300'}`}>
                                        {desc}
                                    </span>
                                </div>
                                {value === score.toString() && <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#172033]" />}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default function ClientPage() {
    const router = useRouter();
    const { t } = useLanguage();
    
    const [selectedDay, setSelectedDay] = useState('All');
    const [selectedGender, setSelectedGender] = useState('all');
    const [targetScore, setTargetScore] = useState('');
    const [leadingCharType, setLeadingCharType] = useState<LeadingCharType>('Any');

    const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
    const [unlockedCounts, setUnlockedCounts] = useState<Record<string, number>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [userCredits, setUserCredits] = useState<number | null>(null);
    const [freeNamesCount, setFreeNamesCount] = useState(0);

    const dayOptions = useMemo(() => ([
        { value: 'All', label: t('pages.premiumSearch.filters.dayAll') },
        { value: 'อาทิตย์', label: t('pages.premiumSearch.days.sunday') },
        { value: 'จันทร์', label: t('pages.premiumSearch.days.monday') },
        { value: 'อังคาร', label: t('pages.premiumSearch.days.tuesday') },
        { value: 'พุธ(กลางวัน)', label: t('pages.premiumSearch.days.wednesday') },
        { value: 'พุธ(กลางคืน)', label: t('pages.premiumSearch.days.wednesday_night') },
        { value: 'พฤหัสบดี', label: t('pages.premiumSearch.days.thursday') },
        { value: 'ศุกร์', label: t('pages.premiumSearch.days.friday') },
        { value: 'เสาร์', label: t('pages.premiumSearch.days.saturday') },
    ]), [t]);

    const [allNames, setAllNames] = useState(() => parsePremiumNames(premiumNamesRaw));

    useEffect(() => {
        const fetchPremiumNamesFromDB = async () => {
            try {
                let allFetchedNames: string[] = [];
                let from = 0;
                const PAGE_SIZE = 1000;

                while (true) {
                    const { data, error } = await supabase
                        .from('premium_names')
                        .select('name')
                        .order('name', { ascending: true })
                        .range(from, from + PAGE_SIZE - 1);

                    if (error) {
                        if (error.code !== '42P01') {
                            console.error('Error fetching premium names from DB:', error);
                        }
                        return; // fallback remains
                    }

                    if (!data || data.length === 0) break;

                    allFetchedNames = allFetchedNames.concat(data.map(row => row.name));
                    
                    if (data.length < PAGE_SIZE) break;

                    from += PAGE_SIZE;
                }

                if (allFetchedNames.length > 0) {
                    const rawString = allFetchedNames.join('\n');
                    setAllNames(parsePremiumNames(rawString));
                }
            } catch (err) {
                console.error('Error in fetchPremiumNamesFromDB:', err);
            }
        };

        fetchPremiumNamesFromDB();
    }, []);

    const filteredNames = useMemo(() => {
        return filterPremiumNames(allNames, { selectedDay, selectedGender, targetScore, leadingCharType });
    }, [allNames, selectedDay, selectedGender, targetScore, leadingCharType]);

    const groupedByLetter = useMemo(() => {
        return groupPremiumNamesByLetter(filteredNames);
    }, [filteredNames]);

    const availableLetters = useMemo(() => getAvailablePremiumLetters(groupedByLetter), [groupedByLetter]);

    useEffect(() => {
        if (!selectedLetter || !availableLetters.includes(selectedLetter)) {
            setSelectedLetter(availableLetters.length > 0 ? availableLetters[0] : null);
        }
    }, [availableLetters, selectedLetter]);

    const uniqueScores = useMemo(() => {
        return getUniquePremiumScores(allNames, { selectedDay, selectedGender, targetScore: '', leadingCharType });
    }, [allNames, selectedDay, selectedGender, leadingCharType]);

    useEffect(() => {
        if (targetScore && !uniqueScores.includes(Number(targetScore))) setTargetScore('');
    }, [uniqueScores, targetScore]);

    const activeFilterCount = [
        selectedDay !== 'All',
        selectedGender !== 'all',
        Boolean(targetScore),
        leadingCharType !== 'Any',
    ].filter(Boolean).length;

    const resetFilters = () => {
        setSelectedDay('All');
        setSelectedGender('all');
        setTargetScore('');
        setLeadingCharType('Any');
    };

    useEffect(() => {
        const fetchCredits = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const total = await getEffectiveUserCredits(user.id);
                if (total !== null) setUserCredits(total);
            }
        };
        fetchCredits();
        const handleForceCreditsUpdate = () => fetchCredits();
        window.addEventListener('force_credits_update', handleForceCreditsUpdate);
        return () => window.removeEventListener('force_credits_update', handleForceCreditsUpdate);
    }, []);

    useEffect(() => {
        const fetchPublicStats = async () => {
            try {
                const res = await fetch('/api/public/stats');
                const json = await res.json();
                const totalNames = json?.stats?.totalNames;
                if (typeof totalNames === 'number') {
                    setFreeNamesCount(totalNames);
                }
            } catch (err) {
                console.error('Error fetching public stats for premium search:', err);
            }
        };

        fetchPublicStats();
    }, []);

    const performUnlock = async (letter: string, amount: number) => {
        const Swal = (await import('sweetalert2')).default;
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            const result = await Swal.fire({
                title: t('pages.premiumSearch.alerts.loginTitle'),
                text: t('pages.premiumSearch.alerts.loginText'),
                icon: 'info',
                showCancelButton: true,
                confirmButtonText: t('pages.premiumSearch.alerts.loginConfirm'),
                cancelButtonText: t('pages.premiumSearch.alerts.loginCancel'),
                confirmButtonColor: '#f59e0b',
                background: '#0f172a',
                color: '#fff',
                customClass: { popup: 'border border-white/10 rounded-2xl' }
            });
            if (result.isConfirmed) router.push('/login');
            return;
        }

        if (userCredits !== null && userCredits < amount) {
            const result = await Swal.fire({
                title: t('pages.premiumSearch.alerts.creditsTitle'),
                text: t('pages.premiumSearch.alerts.creditsText'),
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: t('pages.premiumSearch.alerts.creditsConfirm'),
                cancelButtonText: t('pages.premiumSearch.alerts.creditsCancel'),
                confirmButtonColor: '#10b981',
                cancelButtonColor: '#64748b',
                background: '#0f172a',
                color: '#fff',
                iconColor: '#f59e0b',
                customClass: { popup: 'border border-white/10 rounded-2xl' }
            });
            if (result.isConfirmed) router.push('/topup');
            return;
        }

        const confirmResult = await Swal.fire({
            title: `ยืนยันการปลดล็อก?`,
            text: `ใช้ ${amount} เครดิตเพื่อแสดง 20 รายชื่อ ในหมวดอักษร "${letter}"`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'ปลดล็อก',
            cancelButtonText: 'ยกเลิก',
            confirmButtonColor: '#059669',
            cancelButtonColor: '#ef4444',
            background: '#0f172a',
            color: '#fff',
            iconColor: '#34d399',
            customClass: { popup: 'border border-white/10 rounded-2xl' }
        });

        if (!confirmResult.isConfirmed) return;

        setIsLoading(true);
        try {
            await deductCredits(amount);

            setUserCredits(prev => (prev !== null ? prev - amount : null));
            window.dispatchEvent(new Event('force_credits_update'));
            await new Promise(resolve => setTimeout(resolve, 800));

            setUnlockedCounts(prev => ({ ...prev, [letter]: (prev[letter] || 0) + 20 }));

            const unlockedNames = groupedByLetter.get(letter)?.slice(0, (unlockedCounts[letter] || 0) + 20) || [];
            await savePremiumUnlockHistoryIfEligible({
                userId: user.id,
                selectedDay,
                targetScore,
                leadingCharType,
                selectedLetter,
                unlockedNames,
            });
        } catch (err) {
            console.error('Search Error:', err);
            Swal.fire({
                title: t('pages.premiumSearch.alerts.errorTitle'),
                text: t('pages.premiumSearch.alerts.errorText'),
                icon: 'error',
                confirmButtonText: 'OK',
                background: '#0f172a',
                color: '#fff'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SoftYellowGlowBackground className="overflow-x-hidden font-sans text-[#5a5a82] selection:bg-amber-200 selection:text-[#172033]">
            {/* Floating Mobile Credits */}
            <div className="hidden">
                <Coins className="h-4 w-4 text-amber-600" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#5a5a82]">เครดิต:</span>
                <span className="text-sm font-black text-emerald-700">{userCredits !== null ? userCredits : '—'}</span>
            </div>

            <main className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-24 pt-7 sm:px-6 sm:pt-28">
                <div className="space-y-7 sm:space-y-10">
                    <PremiumHeader 
                        totalNames={allNames.length} 
                        filteredCount={filteredNames.length} 
                        availableLettersCount={availableLetters.length} 
                        credits={userCredits} 
                    />

                    {/* Ultra Premium Filter Panel */}
                    <section className="relative z-30 rounded-2xl border border-slate-700 bg-[#172033] shadow-[0_10px_26px_rgba(15,23,42,0.16)]">
                        <div className="relative">
                            
                            <div className="p-4 sm:p-6">
                                <div className="mb-5 flex items-center justify-between gap-3 border-b border-slate-700 pb-4">
                                    <div>
                                        <h2 className="flex items-center gap-2.5 text-lg font-bold text-slate-50">
                                            <SlidersHorizontal className="h-5 w-5 text-amber-300" />
                                            ปรับเงื่อนไขค้นหา
                                        </h2>
                                        <p className="mt-1.5 text-xs font-medium text-slate-400">
                                            {activeFilterCount > 0 ? `กำลังใช้ ${activeFilterCount} ตัวกรอง` : 'เริ่มจากวันเกิดก่อนเพื่อเปิดตัวเลือกอักษรนำ'}
                                        </p>
                                    </div>
                                <button
                                    type="button"
                                    onClick={resetFilters}
                                    disabled={isLoading || activeFilterCount === 0}
                                    className="flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-xs font-bold text-slate-200 transition-colors hover:border-amber-300 hover:text-amber-200 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <RotateCcw className="h-3.5 w-3.5" />
                                    ล้างตัวกรอง
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 sm:gap-4">
                                {/* Day Filter */}
                                <div className="space-y-1.5 sm:space-y-2">
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 sm:text-xs">{t('pages.premiumSearch.filters.dayLabel')}</label>
                                    <div className="relative">
                                        <select
                                            value={selectedDay}
                                            onChange={(e) => {
                                                setSelectedDay(e.target.value);
                                                if (e.target.value === 'All') setLeadingCharType('Any');
                                            }}
                                            className="w-full appearance-none rounded-lg border border-slate-600 bg-slate-800 px-3 py-2.5 text-xs font-medium text-slate-100 transition-colors focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-300/20 sm:px-4 sm:text-sm"
                                        >
                                            {dayOptions.map(day => <option key={day.value} value={day.value}>{day.label}</option>)}
                                        </select>
                                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 sm:right-4 sm:h-4 sm:w-4" />
                                    </div>
                                </div>

                                {/* Score Filter */}
                                <div className="space-y-1.5 sm:space-y-2">
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 sm:text-xs">{t('pages.premiumSearch.filters.scoreLabel')}</label>
                                    <ScoreDropdown value={targetScore} onChange={setTargetScore} scores={uniqueScores} disabled={isLoading} />
                                </div>

                                {/* Gender Filter */}
                                <div className="space-y-1.5 sm:space-y-2">
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 sm:text-xs">{t('pages.premiumSearch.filters.genderLabel')}</label>
                                    <div className="relative">
                                        <select
                                            value={selectedGender}
                                            onChange={(e) => setSelectedGender(e.target.value)}
                                            className="w-full appearance-none rounded-lg border border-slate-600 bg-slate-800 px-3 py-2.5 text-xs font-medium text-slate-100 transition-colors focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-300/20 sm:px-4 sm:text-sm"
                                        >
                                            <option value="all">{t('pages.premiumSearch.filters.genderAll')}</option>
                                            <option value="male">{t('pages.premiumSearch.filters.genderMale')}</option>
                                            <option value="female">{t('pages.premiumSearch.filters.genderFemale')}</option>
                                            <option value="neutral">{t('pages.premiumSearch.filters.genderNeutral')}</option>
                                        </select>
                                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 sm:right-4 sm:h-4 sm:w-4" />
                                    </div>
                                </div>

                                {/* Leading Char Filter */}
                                <div className="space-y-1.5 sm:space-y-2">
                                    <label className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400 sm:text-xs">
                                        <span className="truncate">{t('pages.premiumSearch.leading.label')}</span>
                                        <span className="ml-1 shrink-0 text-[9px] normal-case text-amber-200/80 sm:text-[10px]">{selectedDay !== 'All' ? `(${selectedDay})` : ''}</span>
                                    </label>
                                    <div className="flex h-[38px] gap-1 rounded-lg border border-slate-600 bg-slate-800 p-1 sm:h-[42px]">
                                        {(['Dech', 'Si', 'Any'] as LeadingCharType[]).map((type) => {
                                            const isSelected = leadingCharType === type;
                                            const labelMap: Record<LeadingCharType, string> = { Dech: 'เดช', Si: 'ศรี', Any: 'ทั้งหมด' };
                                            return (
                                                <button
                                                    key={type}
                                                    type="button"
                                                    disabled={selectedDay === 'All' || isLoading}
                                                    onClick={() => setLeadingCharType(type as LeadingCharType)}
                                                    className={`flex-1 flex items-center justify-center rounded-lg text-[10px] sm:text-xs font-bold transition-all disabled:cursor-not-allowed ${
                                                        isSelected 
                                                            ? 'border border-amber-300 bg-amber-300 text-[#172033] disabled:border-slate-600 disabled:bg-slate-700 disabled:text-slate-400'
                                                            : 'border border-transparent text-slate-300 hover:bg-slate-700 hover:text-amber-100 disabled:text-slate-600 disabled:hover:bg-transparent'
                                                    }`}
                                                >
                                                    {labelMap[type]}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    </section>

                    {availableLetters.length > 0 ? (
                        <div className="space-y-6 xl:grid xl:grid-cols-[15rem_minmax(0,1fr)] xl:items-start xl:gap-8 xl:space-y-0">
                            
                            <PremiumAlphabetBar 
                                availableLetters={availableLetters}
                                selectedLetter={selectedLetter}
                                setSelectedLetter={setSelectedLetter}
                                groupedByLetter={groupedByLetter}
                            />

                            <div className="relative">
                                {selectedLetter ? (
                                    <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-[#ddddf0] pb-4">
                                        <div>
                                            <p className="text-xs font-bold text-amber-700">ผลลัพธ์ที่คัดตามเงื่อนไข</p>
                                            <h2 className="mt-1 text-2xl font-black text-[#1a1a3e]">หมวดอักษร “{selectedLetter}”</h2>
                                        </div>
                                        <span className="rounded-full border border-[#ddddf0] bg-white px-3 py-1.5 font-mono text-xs font-bold text-[#40506f]">{groupedByLetter.get(selectedLetter)?.length ?? 0} ชื่อ</span>
                                    </div>
                                ) : null}
                                {selectedLetter && (() => {
                                    const namesForLetter = groupedByLetter.get(selectedLetter) || [];
                                    const unlockedCount = unlockedCounts[selectedLetter] || 0;
                                    const isFullyUnlocked = unlockedCount > 0;
                                    const displayCount = isFullyUnlocked ? unlockedCount : 20;
                                    const visibleNames = namesForLetter.slice(0, displayCount);
                                    const hasMore = namesForLetter.length > displayCount;

                                    return (
                                        <>
                                            {!isFullyUnlocked && (
                                                <div className="relative mb-5 overflow-hidden rounded-2xl border border-slate-700 bg-[#172033] p-5 text-center shadow-[0_10px_26px_rgba(15,23,42,0.16)] sm:p-7">
                                                    <div className="relative flex flex-col items-center">
                                                        <div className="mb-4">
                                                            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-amber-400/35 bg-amber-400/10 sm:h-14 sm:w-14">
                                                                <Lock className="h-6 w-6 text-amber-200" />
                                                            </div>
                                                        </div>
                                                        <h3 className="mb-2 text-xl font-black tracking-tight text-slate-50 sm:text-2xl">
                                                            ปลดล็อกหมวดอักษร <span className="text-3xl text-emerald-700 sm:text-4xl">&quot;{selectedLetter}&quot;</span>
                                                        </h3>
                                                        <p className="mx-auto mb-5 max-w-lg text-xs leading-6 text-slate-300 sm:text-sm">
                                                            คัดเฉพาะรายชื่อเกรด A+ เสริมมงคลทวีคูณสูงสุด 20 รายชื่อต่อครั้ง (รายชื่ออื่นจะถูกสุ่มเปิดเพื่อความสิริมงคล)
                                                        </p>
                                                        <button
                                                            onClick={() => performUnlock(selectedLetter, 15)}
                                                            disabled={isLoading}
                                                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-300 px-5 py-3 text-sm font-black text-[#172033] transition-colors hover:bg-amber-200 disabled:opacity-70"
                                                        >
                                                            {isLoading ? <span className="animate-spin text-lg sm:text-xl">⏳</span> : <Lock className="w-4 h-4 sm:w-5 sm:h-5" />}
                                                            ปลดล็อกรายชื่อมงคล (15 เครดิต)
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
                                                {visibleNames.map((item, index) => (
                                                    <PremiumNameCard key={item.name + index} item={item} isUnlocked={isFullyUnlocked || index < 3} />
                                                ))}
                                            </div>

                                            {isFullyUnlocked && hasMore && (
                                                <div className="mt-8 border-t border-[#ddddf0] pt-6 text-center">
                                                    <button
                                                        onClick={() => performUnlock(selectedLetter, 15)}
                                                        disabled={isLoading}
                                                        className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-[#172033] px-5 py-3 font-bold text-slate-100 transition-colors hover:border-amber-300 hover:text-amber-200 disabled:opacity-50"
                                                    >
                                                        {isLoading ? <span className="animate-spin">⏳</span> : <Lock size={18} className="text-emerald-700" />}
                                                        ดูเพิ่มอีก 20 ชื่อ (15 เครดิต)
                                                    </button>
                                                    <p className="mt-4 text-xs text-[#5a5a82] font-medium">
                                                        แสดงแล้ว <span className="text-[#1a1a3e] font-bold">{visibleNames.length}</span> จากทั้งหมด <span className="text-amber-600 font-bold">{namesForLetter.length}</span> ชื่อ
                                                    </p>
                                                </div>
                                            )}

                                            {isFullyUnlocked && !hasMore && (
                                                <div className="mt-8 border-t border-[#ddddf0] py-6 text-center">
                                                    <p className="flex items-center justify-center gap-2 text-sm font-medium text-[#5a5a82]">
                                                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                                        แสดงครบทุกชื่อในหมวด &quot;{selectedLetter}&quot; แล้ว ({namesForLetter.length} ชื่อ)
                                                    </p>
                                                </div>
                                            )}
                                        </>
                                    );
                                })()}
                            </div>
                        </div>
                    ) : (
                        <div className="mt-8 rounded-2xl border border-[#ddddf0] bg-white p-8 text-center shadow-[0_8px_20px_rgba(15,23,42,0.06)] sm:p-12">
                            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl border border-amber-200 bg-amber-50">
                                <Search size={26} className="text-amber-700" />
                            </div>
                            <h3 className="mb-3 text-2xl font-bold tracking-tight text-[#1a1a3e]">{t('pages.premiumSearch.results.emptyTitle')}</h3>
                            <p className="mb-8 text-[#5a5a82]">{t('pages.premiumSearch.results.emptyDesc')}</p>
                            <button
                                onClick={resetFilters}
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-[#172033] px-5 py-3 font-bold text-slate-100 transition-colors hover:border-amber-300 hover:text-amber-200"
                            >
                                <RotateCcw className="h-4 w-4" />
                                ล้างตัวกรองแล้วเริ่มใหม่
                            </button>
                        </div>
                    )}

                    <PremiumSEOSection allNamesLength={allNames.length} freeNamesCount={freeNamesCount} />

                </div>
            </main>
        </SoftYellowGlowBackground>
    );
}
