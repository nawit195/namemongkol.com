'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
    ArrowLeft,
    ArrowRight,
    Cat,
    Check,
    Coins,
    Dog,
    Heart,
    Info,
    LockKeyhole,
    PawPrint,
    RotateCcw,
    Search,
    Share2,
    Sparkles,
} from 'lucide-react';
import { trackEvent } from '@/lib/analytics';
import { DEFAULT_PET_NAME_FILTERS } from '@/lib/petNameScoring';
import type { PetNameQueryInput } from '@/lib/petNameApi';
import type {
    PetNameFullResult,
    PetNameQueryResponse,
    PetNameVisibleResult,
} from '@/lib/petNameAccess';
import type { PetNameFilters, PetNameLanguage } from '@/types/petName';

const FAVORITES_KEY = 'namemongkol:pet-name:favorites:v2';
const LEGACY_FAVORITES_KEY = 'namemongkol:pet-name:favorites:v1';
const PENDING_UNLOCK_KEY = 'namemongkol:pet-name:pending-unlock:v1';
const MAX_FAVORITES = 20;
const stepTitles = ['รู้จักน้องก่อน', 'นิสัยของน้อง', 'โทนชื่อที่ชอบ', 'รายละเอียดสุดท้าย'];

const traitOptions = ['ขี้เล่น', 'อ่อนโยน', 'ซุกซน', 'เท่', 'สง่างาม', 'ฉลาด', 'น่ารัก', 'ขี้อ้อน', 'กล้าหาญ', 'เรียบร้อย'];
const styleOptions = ['น่ารัก', 'มงคล', 'เรียบง่าย', 'เท่', 'สากล', 'ตลกจำง่าย', 'ญี่ปุ่นเกาหลี', 'ไม่ซ้ำใคร'];
const intentOptions = ['โชคลาภ', 'ความสุข', 'ความรัก', 'ความสำเร็จ', 'ความฉลาด', 'ความกล้าหาญ', 'สุขภาพแข็งแรง'];
const languageOptions: Array<{ value: PetNameLanguage | 'all'; label: string }> = [
    { value: 'all', label: 'ทุกภาษา' }, { value: 'thai', label: 'ไทย' }, { value: 'english', label: 'อังกฤษ' },
    { value: 'japanese', label: 'ญี่ปุ่น' }, { value: 'korean', label: 'เกาหลี' }, { value: 'international', label: 'สากล' },
];

interface FavoriteSnapshot {
    slug: string;
    nameTh: string;
    nameEn: string;
    pronunciation: string;
}

interface PendingUnlock {
    input: PetNameQueryInput;
}

function toggleArrayValue(values: string[], value: string) {
    return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

function getReason(result: PetNameVisibleResult) {
    return result.detailLevel === 'full' ? result.reasons[0] : result.reason;
}

function getScoreLabel(score: number) {
    if (score >= 90) return 'โดดเด่นมาก';
    if (score >= 80) return 'เหมาะกับน้อง';
    if (score >= 70) return 'น่าสนใจ';
    return 'ใช้เป็นตัวเลือก';
}

function getPetTypeLabel(result: PetNameVisibleResult) {
    if (result.petTypes.includes('dog') && result.petTypes.includes('cat')) return 'สุนัขและแมว';
    if (result.petTypes.includes('dog')) return 'สุนัข';
    if (result.petTypes.includes('cat')) return 'แมว';
    return 'สัตว์เลี้ยงอื่น';
}

function toFavorite(result: PetNameVisibleResult): FavoriteSnapshot {
    return {
        slug: result.slug,
        nameTh: result.nameTh,
        nameEn: result.nameEn,
        pronunciation: result.pronunciation,
    };
}

function Chip({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: ReactNode }) {
    return (
        <button
            type="button"
            aria-pressed={selected}
            onClick={onClick}
            className={`min-h-11 rounded-full border px-4 py-2 text-sm font-bold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9933a] ${selected ? 'border-[#c9933a] bg-[#fff3d5] text-[#6f4d16]' : 'border-[#ddddf0] bg-[#fffefa] text-[#4d4d6b] hover:border-[#c9b47d] hover:bg-[#fffaf0]'}`}
        >
            {children}
        </button>
    );
}

function PetTypeChoice({ selected, icon, title, detail, onClick }: { selected: boolean; icon: ReactNode; title: string; detail: string; onClick: () => void }) {
    return (
        <button
            type="button"
            aria-label={title}
            aria-pressed={selected}
            onClick={onClick}
            className={`flex min-h-[92px] flex-col items-center justify-center gap-2 rounded-lg border p-2 text-center transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9933a] sm:min-h-[82px] sm:flex-row sm:justify-start sm:gap-3 sm:p-3 sm:text-left ${selected ? 'border-[#c9933a] bg-[#fff3d5]' : 'border-[#ddddf0] bg-[#fffefa] hover:border-[#c9b47d]'}`}
        >
            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${selected ? 'bg-[#0f172a] text-[#f5d98f]' : 'bg-[#f0eef8] text-[#5a5a82]'}`}>{icon}</span>
            <span className="min-w-0"><strong className="block text-sm text-[#1a1a3e]">{title}</strong><span className="mt-1 hidden text-xs text-[#73738d] sm:block">{detail}</span></span>
        </button>
    );
}

function ScoreBar({ label, score }: { label: string; score: number | null }) {
    return (
        <div className="grid grid-cols-[6.5rem_1fr_2.25rem] items-center gap-3 text-xs sm:grid-cols-[7.5rem_1fr_2.25rem] sm:text-sm">
            <span className="text-[#6f6f88]">{label}</span>
            <div className="h-1.5 overflow-hidden rounded-full bg-[#e9e7f1]"><div className="h-full rounded-full bg-[#c9933a]" style={{ width: `${score ?? 0}%` }} /></div>
            <span className="text-right font-mono font-bold text-[#1a1a3e]">{score ?? '—'}</span>
        </div>
    );
}

function SummaryCard({ result, isFavorite, onFavorite, onShare }: { result: PetNameVisibleResult; isFavorite: boolean; onFavorite: () => void; onShare: () => void }) {
    return (
        <article className="flex min-h-[210px] flex-col rounded-lg border border-[#e6d39f] bg-[#fffefa] p-4 shadow-[0_8px_22px_rgba(15,23,42,0.07)]">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <span className="text-xs font-bold text-[#087f5b]">{getPetTypeLabel(result)}</span>
                    <h3 className="mt-1 truncate text-xl font-extrabold text-[#101a35]">{result.nameTh}</h3>
                    <p className="truncate text-xs font-semibold text-[#9a6818]">{result.nameEn || result.pronunciation}</p>
                </div>
                <div className="rounded-md bg-[#101a35] px-2.5 py-1.5 text-center text-slate-50">
                    <strong className="block font-mono text-base leading-none text-[#f1c75b]">{result.totalScore}</strong>
                    <span className="mt-1 block text-[10px] leading-none text-slate-300">{getScoreLabel(result.totalScore)}</span>
                </div>
            </div>
            <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#55556f]">{result.meaning || 'ดูคะแนนรวมได้ฟรี รายละเอียดความหมายและคะแนนแยกด้านอยู่ในชุดปลดล็อก'}</p>
            <div className="mt-auto border-t border-[#eee4c9] pt-3 text-xs">
                <p className="truncate font-semibold text-[#68687f]">{getReason(result)}</p>
                <div className="mt-3 flex items-center justify-between gap-2">
                    <span className="font-bold text-[#9a6818]">ผลรวม {result.numerologyValue || '—'}</span>
                    <div className="flex gap-1.5">
                        <button type="button" aria-label={`${isFavorite ? 'นำออกจากชื่อที่ชอบ' : 'บันทึกชื่อ'} ${result.nameTh}`} onClick={onFavorite} className={`flex h-9 w-9 items-center justify-center rounded-full border ${isFavorite ? 'border-rose-200 bg-rose-50 text-rose-500' : 'border-[#e6e2ec] bg-white text-[#8e8eaa]'}`}><Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} /></button>
                        <button type="button" aria-label={`แชร์ชื่อ ${result.nameTh}`} onClick={onShare} className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e6e2ec] bg-white text-[#68687f]"><Share2 className="h-4 w-4" /></button>
                    </div>
                </div>
            </div>
        </article>
    );
}

function DetailedResultCard({ result, featured, isFavorite, onFavorite, onShare }: { result: PetNameFullResult; featured?: boolean; isFavorite: boolean; onFavorite: () => void; onShare: () => void }) {
    return (
        <article className={`relative overflow-hidden rounded-xl border bg-[#fffefa] p-5 text-[#1a1a3e] shadow-[0_10px_28px_rgba(15,23,42,0.09)] ${featured ? 'border-[#c9933a] md:col-span-2 lg:grid lg:grid-cols-[0.8fr_1.2fr] lg:gap-8 lg:p-7' : 'border-[#e4dfd2]'}`}>
            <div>
                <div className="flex items-start justify-between gap-4">
                    <div><div className="flex flex-wrap items-center gap-2">{featured ? <span className="rounded-full border border-[#c9933a] bg-[#fff3d5] px-2.5 py-1 text-xs font-bold text-[#7a5315]">ชื่อแนะนำอันดับ 1</span> : null}<span className="text-xs font-bold text-[#087f5b]">{getPetTypeLabel(result)}</span></div><h3 className={`${featured ? 'mt-3 text-3xl' : 'mt-2 text-2xl'} font-extrabold text-[#101a35]`}>{result.nameTh}</h3><p className="mt-1 text-sm font-semibold text-[#9a6818]">{result.nameEn || result.pronunciation}</p></div>
                    <div className="min-w-16 rounded-lg bg-[#0f172a] px-3 py-2 text-center"><strong className="block font-mono text-2xl text-[#f1c75b]">{result.totalScore}</strong><span className="text-[11px] text-slate-300">คะแนนรวม</span></div>
                </div>
                <p className="mt-4 text-sm leading-7 text-[#55556f]">{result.meaningAvailable ? result.meaning : 'ยังไม่มีข้อมูลความหมายในฐานชื่อ ระบบจึงแสดงเฉพาะคะแนนที่คำนวณได้โดยไม่หักเครดิต'}</p>
                <div className="mt-4 flex flex-wrap gap-2">{result.traits.slice(0, 2).map((trait) => <span key={trait} className="rounded-full bg-[#f0eef8] px-2.5 py-1 text-xs text-[#5a5a82]">{trait}</span>)}<span className="rounded-full bg-[#fff3d5] px-2.5 py-1 text-xs font-semibold text-[#7a5315]">ผลรวม {result.numerologyValue || '—'}</span></div>
            </div>
            <div className={`${featured ? 'mt-6 border-t border-[#e7e1d4] pt-6 lg:mt-0 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0' : 'mt-5 border-t border-[#e7e1d4] pt-5'}`}>
                <div className="space-y-3"><ScoreBar label="ความหมาย" score={result.scoreBreakdown.meaning} /><ScoreBar label="การออกเสียง" score={result.scoreBreakdown.pronunciation} /><ScoreBar label="ความเหมาะสม" score={result.scoreBreakdown.suitability} /><ScoreBar label="ความเป็นมงคล" score={result.scoreBreakdown.auspicious} /><ScoreBar label="ความโดดเด่น" score={result.scoreBreakdown.distinctiveness} /></div>
                <ul className="mt-5 space-y-2 text-sm text-[#55556f]">{result.reasons.map((reason) => <li key={reason} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[#0f9f76]" />{reason}</li>)}</ul>
                <div className="mt-5 flex gap-2"><button type="button" onClick={onFavorite} className={`inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-bold ${isFavorite ? 'border-rose-200 bg-rose-50 text-rose-600' : 'border-[#d9d5e3] text-[#4d4d6b]'}`}><Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />{isFavorite ? 'บันทึกแล้ว' : 'บันทึกชื่อ'}</button><button type="button" aria-label={`แชร์ชื่อ ${result.nameTh}`} onClick={onShare} className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-[#d9d5e3] text-[#4d4d6b]"><Share2 className="h-4 w-4" /></button></div>
            </div>
        </article>
    );
}

function LoadingPreview() {
    return <div className="grid gap-3 sm:grid-cols-2"><div className="h-52 animate-pulse rounded-lg bg-[#eeeaf1]" /><div className="h-52 animate-pulse rounded-lg bg-[#eeeaf1]" /><div className="h-52 animate-pulse rounded-lg bg-[#eeeaf1]" /></div>;
}

function EmptyPreview() {
    return <div className="rounded-xl border border-dashed border-[#d9d1bd] bg-[#fffaf0] px-6 py-12 text-center"><PawPrint className="mx-auto h-8 w-8 text-[#c9933a]" /><h3 className="mt-4 text-lg font-extrabold text-[#1a1a3e]">ชื่อที่เข้ากับน้องกำลังรออยู่</h3><p className="mt-2 text-sm leading-6 text-[#666680]">เลือกข้อมูลด้านซ้าย แล้วกดดูตัวอย่างเพื่อรับ 3 ชื่อฟรีก่อนตัดสินใจ</p></div>;
}

export default function ClientPage({ nameCount }: { nameCount: number }) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'search' | 'analysis'>('search');
    const [step, setStep] = useState(1);
    const [filters, setFilters] = useState<PetNameFilters>(DEFAULT_PET_NAME_FILTERS);
    const [analysisName, setAnalysisName] = useState('');
    const [queryResult, setQueryResult] = useState<PetNameQueryResponse | null>(null);
    const [lastInput, setLastInput] = useState<PetNameQueryInput | null>(null);
    const [favorites, setFavorites] = useState<FavoriteSnapshot[]>([]);
    const [legacyFavoriteSlugs, setLegacyFavoriteSlugs] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isUnlocking, setIsUnlocking] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [notice, setNotice] = useState('');
    const [error, setError] = useState('');
    const [lockedInView, setLockedInView] = useState(false);
    const lockedRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const frameId = window.requestAnimationFrame(() => {
            try {
                const stored = window.localStorage.getItem(FAVORITES_KEY);
                if (stored) setFavorites((JSON.parse(stored) as FavoriteSnapshot[]).slice(0, MAX_FAVORITES));
                const legacy = window.localStorage.getItem(LEGACY_FAVORITES_KEY);
                if (legacy) setLegacyFavoriteSlugs((JSON.parse(legacy) as string[]).slice(0, MAX_FAVORITES));
            } catch {
                window.localStorage.removeItem(FAVORITES_KEY);
                window.localStorage.removeItem(LEGACY_FAVORITES_KEY);
            }
        });
        return () => window.cancelAnimationFrame(frameId);
    }, []);

    useEffect(() => {
        const target = lockedRef.current;
        if (!target || !queryResult?.canUnlock || typeof IntersectionObserver === 'undefined') return;
        const observer = new IntersectionObserver(([entry]) => setLockedInView(entry.isIntersecting), { threshold: 0.15 });
        observer.observe(target);
        return () => observer.disconnect();
    }, [queryResult?.canUnlock]);

    const favoriteSlugs = useMemo(() => new Set([...favorites.map((favorite) => favorite.slug), ...legacyFavoriteSlugs]), [favorites, legacyFavoriteSlugs]);

    const persistFavorites = useCallback((next: FavoriteSnapshot[]) => {
        setFavorites(next);
        window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
    }, []);

    const toggleFavorite = useCallback((result: PetNameVisibleResult) => {
        setNotice('');
        const exists = favoriteSlugs.has(result.slug);
        const withoutCurrent = favorites.filter((favorite) => favorite.slug !== result.slug);
        setLegacyFavoriteSlugs((current) => current.filter((slug) => slug !== result.slug));
        if (exists) {
            persistFavorites(withoutCurrent);
            return;
        }
        if (favorites.length >= MAX_FAVORITES) {
            setNotice(`บันทึกได้สูงสุด ${MAX_FAVORITES} ชื่อ กรุณานำชื่อที่ไม่ใช้แล้วออกก่อน`);
            return;
        }
        persistFavorites([...withoutCurrent, toFavorite(result)]);
    }, [favoriteSlugs, favorites, persistFavorites]);

    const shareResult = useCallback(async (result: PetNameVisibleResult) => {
        const text = `${result.nameTh}${result.nameEn ? ` (${result.nameEn})` : ''} คะแนน ${result.totalScore}/100 - ${result.meaning || getReason(result)}`;
        try {
            if (navigator.share) await navigator.share({ title: `ชื่อสัตว์เลี้ยง ${result.nameTh}`, text, url: `${window.location.origin}/pet-name` });
            else {
                await navigator.clipboard.writeText(`${text}\n${window.location.origin}/pet-name`);
                setNotice('คัดลอกข้อมูลชื่อสำหรับแชร์แล้ว');
            }
        } catch (shareError) {
            if (shareError instanceof DOMException && shareError.name === 'AbortError') return;
            setNotice('ยังไม่สามารถแชร์ได้ กรุณาลองอีกครั้ง');
        }
    }, []);

    const runQuery = useCallback(async (input: PetNameQueryInput, resumeUnlock = false) => {
        setIsLoading(true);
        setError('');
        setNotice('');
        setShowConfirmation(false);
        try {
            const response = await fetch('/api/pet-names/query', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) });
            const payload = await response.json() as PetNameQueryResponse & { error?: string };
            if (!response.ok || !payload.success) throw new Error(payload.error || 'ไม่สามารถค้นหาชื่อได้');
            setQueryResult(payload);
            setLastInput(input);
            setActiveTab(input.mode);
            if (resumeUnlock && payload.canUnlock && payload.viewer.authenticated) setShowConfirmation(true);
            window.requestAnimationFrame(() => document.getElementById(input.mode === 'search' ? 'pet-search-results' : 'pet-analysis-result')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
        } catch (queryError) {
            setError(queryError instanceof Error ? queryError.message : 'ไม่สามารถค้นหาชื่อได้ กรุณาลองอีกครั้ง');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('resume') !== 'unlock') return;
        try {
            const stored = window.sessionStorage.getItem(PENDING_UNLOCK_KEY);
            if (!stored) return;
            const pending = JSON.parse(stored) as PendingUnlock;
            setFilters(pending.input.filters);
            if (pending.input.mode === 'analysis') setAnalysisName(pending.input.name);
            window.sessionStorage.removeItem(PENDING_UNLOCK_KEY);
            window.history.replaceState({}, '', '/pet-name');
            void runQuery(pending.input, true);
        } catch {
            window.sessionStorage.removeItem(PENDING_UNLOCK_KEY);
        }
    }, [runQuery]);

    const updateFilter = <Key extends keyof PetNameFilters>(key: Key, value: PetNameFilters[Key]) => setFilters((current) => ({ ...current, [key]: value }));
    const searchNames = () => {
        void trackEvent('funnel.pet_name.search');
        void runQuery({ mode: 'search', filters });
    };
    const analyzeName = () => {
        if (!analysisName.trim()) return;
        void trackEvent('funnel.pet_name.analyze');
        void runQuery({ mode: 'analysis', filters, name: analysisName.trim() });
    };

    const resetFilters = () => {
        setFilters(DEFAULT_PET_NAME_FILTERS);
        setQueryResult(null);
        setLastInput(null);
        setShowConfirmation(false);
        setStep(1);
    };

    const beginUnlock = () => {
        if (!queryResult || !lastInput) return;
        void trackEvent(`funnel.pet_name.${queryResult.mode}.unlock_click`);
        if (!queryResult.viewer.authenticated) {
            window.sessionStorage.setItem(PENDING_UNLOCK_KEY, JSON.stringify({ input: lastInput } satisfies PendingUnlock));
            router.push(`/login?redirect=${encodeURIComponent('/pet-name?resume=unlock')}`);
            return;
        }
        if (queryResult.viewer.credits !== null && queryResult.viewer.credits < queryResult.cost) {
            setError(`เครดิตไม่เพียงพอ ต้องใช้ ${queryResult.cost} เครดิต`);
            return;
        }
        setError('');
        setShowConfirmation(true);
    };

    const confirmUnlock = async () => {
        if (!queryResult || !lastInput || isUnlocking) return;
        setIsUnlocking(true);
        setError('');
        try {
            const response = await fetch('/api/pet-names/unlock', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...lastInput, fingerprint: queryResult.fingerprint }) });
            const payload = await response.json() as PetNameQueryResponse & { error?: string; status?: string; remainingCredits?: number; unlockStatus?: string };
            if (response.status === 401) {
                window.sessionStorage.setItem(PENDING_UNLOCK_KEY, JSON.stringify({ input: lastInput } satisfies PendingUnlock));
                router.push(`/login?redirect=${encodeURIComponent('/pet-name?resume=unlock')}`);
                return;
            }
            if (response.status === 402) {
                setError(`เครดิตไม่เพียงพอ คงเหลือ ${payload.remainingCredits ?? 0} เครดิต`);
                return;
            }
            if (!response.ok || !payload.success) throw new Error(payload.error || 'ไม่สามารถปลดล็อกได้');
            setQueryResult(payload);
            setShowConfirmation(false);
            setNotice(payload.unlockStatus === 'already_unlocked' ? 'ชุดนี้เคยปลดล็อกแล้ว จึงไม่มีการหักเครดิตซ้ำ' : 'ปลดล็อกสำเร็จ อัปเดตเครดิตและแสดงรายละเอียดครบแล้ว');
            window.dispatchEvent(new Event('force_credits_update'));
            void trackEvent(`funnel.pet_name.${payload.mode}.unlock_success`, { metadata: { cost: payload.cost, status: payload.unlockStatus } });
        } catch (unlockError) {
            setError(unlockError instanceof Error ? unlockError.message : 'ไม่สามารถปลดล็อกได้ กรุณาลองอีกครั้ง');
        } finally {
            setIsUnlocking(false);
        }
    };

    const renderResultActions = (result: PetNameVisibleResult) => ({
        isFavorite: favoriteSlugs.has(result.slug),
        onFavorite: () => toggleFavorite(result),
        onShare: () => shareResult(result),
    });

    const lockedPanel = queryResult?.canUnlock ? (
        <div ref={lockedRef} className="mt-5 overflow-hidden rounded-xl border border-[#d6c58e] bg-[#0f172a] text-slate-100 shadow-[0_12px_30px_rgba(15,23,42,0.16)]">
            <div className="grid grid-cols-3 gap-2 border-b border-slate-700 p-4 sm:grid-cols-3">
                {Array.from({ length: Math.min(queryResult.lockedCount, 9) }, (_, index) => <div key={index} className="relative h-20 overflow-hidden rounded-lg border border-slate-700 bg-slate-800 p-3"><div className="h-3 w-2/3 rounded bg-slate-600 blur-[2px]" /><div className="mt-3 h-2 w-full rounded bg-slate-700 blur-[2px]" /><LockKeyhole className="absolute bottom-2 right-2 h-4 w-4 text-[#f1c75b]" /></div>)}
            </div>
            <div className="p-5 sm:p-6">
                <div className="flex items-start gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-amber-300/40 bg-amber-300/10 text-[#f1c75b]"><LockKeyhole className="h-5 w-5" /></span><div><h3 className="font-extrabold text-slate-50">{queryResult.mode === 'search' ? `ปลดล็อกอีก ${queryResult.lockedCount} ชื่อ พร้อมคะแนนละเอียดครบชุด` : 'ดูความหมายและคะแนนละเอียดครบ 5 ด้าน'}</h3><p className="mt-1 text-sm leading-6 text-slate-300">ใช้ 15 เครดิตครั้งเดียว สิทธิ์เดิมเปิดดูซ้ำได้โดยไม่หักเครดิต</p></div></div>
                {showConfirmation ? <div className="mt-5 rounded-lg border border-amber-300/40 bg-slate-800 p-4"><div className="flex items-center justify-between gap-3 text-sm"><span className="text-slate-300">เครดิตคงเหลือ</span><strong className="font-mono text-[#f1c75b]">{queryResult.viewer.credits ?? 'กำลังตรวจสอบ'} เครดิต</strong></div><p className="mt-3 text-xs leading-5 text-slate-400">ยืนยันแล้วระบบจะหัก 15 เครดิต หากชุดนี้เคยปลดล็อก ระบบจะเปิดให้ทันทีโดยไม่หักซ้ำ</p><div className="mt-4 grid grid-cols-2 gap-2"><button type="button" onClick={() => setShowConfirmation(false)} className="min-h-11 rounded-lg border border-slate-600 px-4 text-sm font-bold text-slate-200">ยกเลิก</button><button type="button" disabled={isUnlocking} onClick={confirmUnlock} className="min-h-11 rounded-lg bg-[#e8c87e] px-4 text-sm font-extrabold text-[#172033] disabled:opacity-60">{isUnlocking ? 'กำลังปลดล็อก...' : 'ยืนยัน 15 เครดิต'}</button></div></div> : <button type="button" onClick={beginUnlock} className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#e8c87e] px-5 text-sm font-extrabold text-[#172033] hover:bg-[#f0d997]"><LockKeyhole className="h-4 w-4" />{queryResult.viewer.authenticated ? 'ปลดล็อกด้วย 15 เครดิต' : 'เข้าสู่ระบบเพื่อปลดล็อก'}<ArrowRight className="h-4 w-4" /></button>}
                {error ? <div role="alert" className="mt-4 rounded-lg border border-rose-400/40 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">{error}{error.includes('เครดิตไม่เพียงพอ') ? <Link href="/topup" className="ml-2 font-bold text-[#f1c75b] underline">เติมเครดิต</Link> : null}</div> : null}
            </div>
        </div>
    ) : null;

    const fullSearchResults = queryResult?.mode === 'search' && queryResult.results.every((result) => result.detailLevel === 'full')
        ? queryResult.results as PetNameFullResult[]
        : [];
    const analysisResult = queryResult?.mode === 'analysis' ? queryResult.results[0] : null;

    return (
        <main id="pet-name-tool" className="min-h-screen scroll-mt-20 bg-[#f9f7f2] pb-20 text-[#5a5a82] md:pb-0">
            <section className="relative isolate min-h-[300px] overflow-hidden border-b border-[#e5dfd3] sm:min-h-[340px]">
                <Image src="/images/articles/modern-thai-business-cat.webp" alt="เจ้าของกับแมวสำหรับค้นหาชื่อสัตว์เลี้ยงมงคล" fill priority unoptimized className="object-cover object-center" sizes="100vw" />
                <div className="absolute inset-0 bg-[#0b1328]/65" />
                <div className="relative mx-auto flex min-h-[300px] max-w-6xl items-end px-4 py-7 sm:min-h-[340px] sm:px-6 sm:py-9 lg:px-8">
                    <div className="max-w-3xl text-slate-100"><div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#f1d795]/70 bg-[#0b1328]/80 px-3 py-1.5 text-xs font-bold text-[#f7dfa0]"><PawPrint className="h-4 w-4" />สำหรับสมาชิกตัวน้อยของบ้าน</div><h1 className="max-w-2xl text-3xl font-extrabold leading-tight sm:text-4xl">ค้นหาชื่อสัตว์เลี้ยงมงคลที่เข้ากับน้อง</h1><p className="mt-3 max-w-2xl text-sm leading-7 text-slate-100 sm:text-base">ทดลองดู 3 ชื่อฟรีจากความหมาย เสียงเรียก และคาแรกเตอร์ แล้วค่อยเลือกปลดล็อกชุดเต็มเมื่อถูกใจ</p><div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-slate-100 sm:text-sm"><span className="inline-flex items-center gap-2"><Check className="h-4 w-4 text-[#f1c75b]" />{nameCount.toLocaleString('th-TH')} ชื่อคัดสรร</span><span className="inline-flex items-center gap-2"><Check className="h-4 w-4 text-[#f1c75b]" />ตัวอย่างฟรี 3 ชื่อ</span><span className="inline-flex items-center gap-2"><Coins className="h-4 w-4 text-[#f1c75b]" />ชุดเต็ม 15 เครดิต</span></div></div>
                </div>
            </section>

            <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div className="grid w-full grid-cols-2 rounded-lg border border-[#dfd9cc] bg-[#fffefa] p-1 shadow-sm sm:max-w-xl" role="tablist" aria-label="เลือกรูปแบบการใช้งาน"><button id="pet-search-tab" type="button" role="tab" aria-selected={activeTab === 'search'} onClick={() => { setActiveTab('search'); setQueryResult(null); }} className={`min-h-11 rounded-md px-3 text-sm font-bold ${activeTab === 'search' ? 'bg-[#0f172a] text-slate-100' : 'text-[#5a5a82]'}`}><Sparkles className="mr-2 inline h-4 w-4" />ค้นหาชื่อใหม่</button><button id="pet-analyze-tab" type="button" role="tab" aria-selected={activeTab === 'analysis'} onClick={() => { setActiveTab('analysis'); setQueryResult(null); }} className={`min-h-11 rounded-md px-3 text-sm font-bold ${activeTab === 'analysis' ? 'bg-[#0f172a] text-slate-100' : 'text-[#5a5a82]'}`}><Search className="mr-2 inline h-4 w-4" />วิเคราะห์ชื่อเดิม</button></div><div className="inline-flex min-h-11 items-center gap-2 self-start rounded-full border border-[#ead7dc] bg-[#fff8fa] px-4 text-sm font-bold text-[#93485c]"><Heart className={`h-4 w-4 ${favorites.length ? 'fill-current' : ''}`} />ชื่อที่ชอบ {favorites.length}/{MAX_FAVORITES}</div></div>

                {activeTab === 'search' ? <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(360px,1.08fr)]">
                    <section className="overflow-hidden rounded-xl border border-[#ded8cc] bg-[#fffefa] shadow-[0_14px_38px_rgba(15,23,42,0.09)]" aria-labelledby="pet-search-title">
                        <div className="bg-[#0f172a] px-5 py-5 text-slate-100 sm:px-6"><div className="flex items-center justify-between gap-4"><div><p className="text-xs font-bold text-[#f1c75b]">ขั้นตอน {step} จาก 4</p><h2 id="pet-search-title" className="mt-1 text-xl font-extrabold">{stepTitles[step - 1]}</h2></div><span className="rounded-full border border-slate-600 px-3 py-1 text-xs font-bold text-slate-300">ใช้เวลาไม่ถึง 1 นาที</span></div><div className="mt-4 grid grid-cols-4 gap-1.5">{[1, 2, 3, 4].map((number) => <span key={number} className={`h-1.5 rounded-full ${number <= step ? 'bg-[#c9933a]' : 'bg-slate-700'}`} />)}</div></div>
                        <div className="min-h-[300px] px-5 py-6 sm:px-6">
                            {step === 1 ? <div className="space-y-7"><fieldset><legend className="mb-1 text-base font-extrabold text-[#1a1a3e]">น้องเป็นสมาชิกแบบไหน</legend><p className="mb-4 text-sm text-[#73738d]">เลือกประเภทเพื่อให้ระบบคัดชื่อที่เรียกแล้วเข้ากับน้องมากขึ้น</p><div className="grid grid-cols-3 gap-2"><PetTypeChoice selected={filters.petType === 'dog'} onClick={() => updateFilter('petType', 'dog')} icon={<Dog className="h-5 w-5" />} title="น้องหมา" detail="อบอุ่น ขี้เล่น" /><PetTypeChoice selected={filters.petType === 'cat'} onClick={() => updateFilter('petType', 'cat')} icon={<Cat className="h-5 w-5" />} title="น้องแมว" detail="น่ารัก มีเสน่ห์" /><PetTypeChoice selected={filters.petType === 'other'} onClick={() => updateFilter('petType', 'other')} icon={<PawPrint className="h-5 w-5" />} title="น้องอื่น ๆ" detail="เพื่อนตัวจิ๋ว" /></div></fieldset><fieldset><legend className="mb-3 text-sm font-bold text-[#1a1a3e]">เพศของน้อง</legend><div className="flex flex-wrap gap-2">{([['all', 'ยังไม่ระบุ'], ['male', 'น้องผู้ชาย'], ['female', 'น้องผู้หญิง']] as const).map(([value, label]) => <Chip key={value} selected={filters.gender === value} onClick={() => updateFilter('gender', value)}>{label}</Chip>)}</div></fieldset></div> : null}
                            {step === 2 ? <fieldset><legend className="mb-1 text-base font-extrabold text-[#1a1a3e]">คำไหนอธิบายนิสัยของน้องได้ดีที่สุด</legend><p className="mb-4 text-sm text-[#73738d]">เลือกได้หลายข้อ ยิ่งรู้จักน้องมาก ผลลัพธ์ยิ่งตรงใจ</p><div className="flex flex-wrap gap-2">{traitOptions.map((trait) => <Chip key={trait} selected={filters.traits.includes(trait)} onClick={() => updateFilter('traits', toggleArrayValue(filters.traits, trait))}>{trait}</Chip>)}</div></fieldset> : null}
                            {step === 3 ? <div className="space-y-7"><fieldset><legend className="mb-3 text-base font-extrabold text-[#1a1a3e]">ภาษาของชื่อ</legend><div className="flex flex-wrap gap-2">{languageOptions.map((item) => <Chip key={item.value} selected={filters.language === item.value} onClick={() => updateFilter('language', item.value)}>{item.label}</Chip>)}</div></fieldset><fieldset><legend className="mb-3 text-base font-extrabold text-[#1a1a3e]">บรรยากาศของชื่อ</legend><div className="flex flex-wrap gap-2">{styleOptions.map((style) => <Chip key={style} selected={filters.style === style} onClick={() => updateFilter('style', filters.style === style ? 'all' : style)}>{style}</Chip>)}</div></fieldset></div> : null}
                            {step === 4 ? <div className="space-y-7"><div className="grid gap-4 sm:grid-cols-3"><label className="text-sm font-bold text-[#1a1a3e]">จำนวนพยางค์<select value={filters.syllables} onChange={(event) => updateFilter('syllables', event.target.value === 'all' ? 'all' : Number(event.target.value))} className="mt-2 min-h-11 w-full rounded-lg border border-[#d9d5e3] bg-white px-3 text-[#1a1a3e]"><option value="all">ไม่จำกัด</option><option value="1">1 พยางค์</option><option value="2">2 พยางค์</option><option value="3">3 พยางค์</option></select></label><label className="text-sm font-bold text-[#1a1a3e]">อยากให้ขึ้นต้นด้วย<input value={filters.initial} maxLength={2} onChange={(event) => updateFilter('initial', event.target.value)} placeholder="เช่น ม หรือ L" className="mt-2 min-h-11 w-full rounded-lg border border-[#d9d5e3] bg-white px-3 text-[#1a1a3e]" /></label><label className="text-sm font-bold text-[#1a1a3e]">ไม่ใช้อักษร<input value={filters.excludedLetters} onChange={(event) => updateFilter('excludedLetters', event.target.value)} placeholder="เช่น กข หรือ XZ" className="mt-2 min-h-11 w-full rounded-lg border border-[#d9d5e3] bg-white px-3 text-[#1a1a3e]" /></label></div><fieldset><legend className="mb-3 text-base font-extrabold text-[#1a1a3e]">อยากให้ชื่อสื่อถึงอะไร</legend><div className="flex flex-wrap gap-2">{intentOptions.map((intent) => <Chip key={intent} selected={filters.intents.includes(intent)} onClick={() => updateFilter('intents', toggleArrayValue(filters.intents, intent))}>{intent}</Chip>)}</div></fieldset></div> : null}
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e8e3d9] bg-[#fbf9f4] px-5 py-4 sm:px-6"><button type="button" onClick={() => step === 1 ? resetFilters() : setStep((current) => current - 1)} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[#d9d5e3] bg-white px-4 text-sm font-bold text-[#55556f]"><ArrowLeft className="h-4 w-4" />{step === 1 ? 'เริ่มใหม่' : 'ย้อนกลับ'}</button><div className="flex justify-end gap-2">{step < 4 ? <button type="button" onClick={searchNames} className="min-h-11 rounded-lg px-3 text-sm font-bold text-[#76531a]">ดู 3 ชื่อฟรี</button> : null}{step < 4 ? <button type="button" onClick={() => setStep((current) => current + 1)} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#c9933a] px-5 text-sm font-extrabold text-[#111827]">ถัดไป <ArrowRight className="h-4 w-4" /></button> : <button type="button" disabled={isLoading} onClick={searchNames} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#0f172a] px-5 text-sm font-extrabold text-white disabled:opacity-60"><Search className="h-4 w-4" />{isLoading ? 'กำลังคัดชื่อ...' : 'ดู 3 ชื่อฟรี'}</button>}</div></div>
                    </section>
                    <section id="pet-search-results" className="scroll-mt-24" aria-labelledby="pet-preview-title"><div className="mb-4"><p className="text-xs font-bold text-[#a66c12]">ทดลองก่อนตัดสินใจ</p><h2 id="pet-preview-title" className="mt-1 text-2xl font-extrabold text-[#1a1a3e]">ชื่อที่น่าจะเข้ากับน้อง</h2>{queryResult?.mode === 'search' ? <p className="mt-1 text-xs font-semibold text-[#73738d]">พบ {queryResult.totalMatches.toLocaleString('th-TH')} ชื่อที่ตรงเงื่อนไข</p> : null}</div>{isLoading ? <LoadingPreview /> : queryResult?.mode === 'search' ? queryResult.results.length ? <>{queryResult.isUnlocked && fullSearchResults.length ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6"><Check className="h-6 w-6 text-emerald-600" /><h3 className="mt-3 text-lg font-extrabold text-[#1a1a3e]">ชุดชื่อนี้พร้อมดูครบแล้ว</h3><p className="mt-2 text-sm text-[#55556f]">เลื่อนลงเพื่อเปรียบเทียบความหมายและคะแนนละเอียดทั้ง {fullSearchResults.length} ชื่อ</p></div> : <div className="grid gap-3 sm:grid-cols-2">{queryResult.results.map((result) => <SummaryCard key={result.slug} result={result} {...renderResultActions(result)} />)}</div>}{lockedPanel}</> : <div className="rounded-lg border border-[#e6cc8b] bg-[#fff9e9] px-5 py-10 text-center"><p className="font-bold text-[#1a1a3e]">ยังไม่พบชื่อที่ตรงทุกเงื่อนไข</p><button type="button" onClick={resetFilters} className="mt-4 min-h-11 rounded-lg bg-[#0f172a] px-5 text-sm font-bold text-white">ล้างตัวกรอง</button></div> : <EmptyPreview />}</section>
                </div> : <section className="mt-6 overflow-hidden rounded-xl border border-[#ded8cc] bg-[#fffefa] shadow-[0_14px_38px_rgba(15,23,42,0.09)]"><div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[1fr_auto] lg:items-end"><div><p className="text-xs font-bold text-[#a66c12]">ดูคะแนนสรุปฟรี</p><h2 className="mt-1 text-2xl font-extrabold text-[#1a1a3e]">ชื่อที่เรียกอยู่ เหมาะกับน้องแค่ไหน</h2><p className="mt-2 text-sm text-[#666680]">ชื่อที่มีในฐานสามารถปลดล็อกความหมายและคะแนนละเอียดได้ในราคา 15 เครดิต</p><label className="mt-5 block text-sm font-bold text-[#1a1a3e]">ชื่อสัตว์เลี้ยง<input value={analysisName} onChange={(event) => setAnalysisName(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && analyzeName()} placeholder="เช่น โมจิ, Lucky หรือ มีตังค์" className="mt-2 min-h-12 w-full rounded-lg border border-[#d9d5e3] bg-white px-4 text-base text-[#1a1a3e]" /></label></div><button type="button" disabled={!analysisName.trim() || isLoading} onClick={analyzeName} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#0f172a] px-6 text-sm font-extrabold text-white disabled:opacity-45"><Search className="h-4 w-4" />{isLoading ? 'กำลังวิเคราะห์...' : 'ดูคะแนนสรุปฟรี'}</button></div><p className="flex gap-2 border-t border-[#e8e3d9] bg-[#fbf9f4] px-5 py-4 text-xs leading-6 text-[#73738d] sm:px-7"><Info className="mt-0.5 h-4 w-4 shrink-0" />ถ้าชื่อนี้ยังไม่มีในฐาน ระบบจะแสดงคะแนนที่คำนวณได้ฟรี และจะไม่สร้างความหมายหรือหักเครดิต</p></section>}

                {notice ? <div role="status" className="mt-5 rounded-lg border border-[#e8c87e] bg-[#fff8e8] px-4 py-3 text-sm font-bold text-[#6f4d16]">{notice}</div> : null}
                {error && !queryResult?.canUnlock ? <div role="alert" className="mt-5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{error}</div> : null}

                {fullSearchResults.length ? <section className="scroll-mt-24 pt-10" aria-labelledby="pet-full-results-title"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-bold text-[#a67828]">ชุดชื่อที่ปลดล็อกแล้ว</p><h2 id="pet-full-results-title" className="mt-1 text-2xl font-extrabold text-[#1a1a3e]">เปรียบเทียบครบทั้ง {fullSearchResults.length} ชื่อ</h2></div><button type="button" onClick={resetFilters} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[#d9d5e3] bg-[#fffefa] px-4 text-sm font-bold text-[#1a1a3e]"><RotateCcw className="h-4 w-4" />ปรับตัวเลือกใหม่</button></div><div className="mt-6 grid gap-4 md:grid-cols-2">{fullSearchResults.map((result, index) => <DetailedResultCard key={result.slug} result={result} featured={index === 0} {...renderResultActions(result)} />)}</div></section> : null}

                {activeTab === 'analysis' && analysisResult ? <section id="pet-analysis-result" className="scroll-mt-24 pt-10"><h2 className="mb-5 text-2xl font-extrabold text-[#1a1a3e]">ผลวิเคราะห์ชื่อ {analysisResult.nameTh}</h2>{analysisResult.detailLevel === 'full' ? <div className="grid gap-4 md:grid-cols-2"><DetailedResultCard result={analysisResult} featured {...renderResultActions(analysisResult)} /></div> : <div className="grid gap-5 md:grid-cols-2"><SummaryCard result={analysisResult} {...renderResultActions(analysisResult)} /><div>{lockedPanel}</div></div>}</section> : null}

                {favorites.length ? <section className="mt-12 rounded-xl border border-[#ead7dc] bg-[#fff8fa] p-5 shadow-sm sm:p-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-bold text-[#a65068]">SHORTLIST ของน้อง</p><h2 className="mt-1 text-xl font-extrabold text-[#1a1a3e]">ชื่อที่คุณกำลังตกหลุมรัก</h2><p className="mt-1 text-sm text-[#666680]">บันทึกอยู่ในอุปกรณ์นี้ แตะชื่อเพื่อนำออกได้</p></div><span className="rounded-full bg-white px-3 py-1.5 text-sm font-bold text-[#93485c]">{favorites.length}/{MAX_FAVORITES} ชื่อ</span></div><div className="mt-4 flex flex-wrap gap-2">{favorites.map((favorite) => <button key={favorite.slug} type="button" onClick={() => { persistFavorites(favorites.filter((item) => item.slug !== favorite.slug)); }} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#e8b9c6] bg-white px-4 text-sm font-bold text-[#8d4157]"><Heart className="h-4 w-4 fill-current" />{favorite.nameTh}</button>)}</div></section> : null}

                <p className="mt-10 flex gap-2 border-t border-[#ddddf0] pt-5 text-xs leading-6 text-[#8e8eaa]"><Info className="mt-0.5 h-4 w-4 shrink-0" />ผลการวิเคราะห์เป็นข้อมูลประกอบตามความเชื่อและศาสตร์การตั้งชื่อ ไม่ใช่การรับรองผลลัพธ์ในชีวิตจริง ควรเลือกชื่อที่เรียกแล้วรู้สึกดีและเหมาะกับน้อง</p>
            </div>

            {lockedInView && queryResult?.canUnlock && !showConfirmation ? <div className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 rounded-xl border border-amber-300 bg-[#0f172a] p-3 shadow-[0_16px_36px_rgba(15,23,42,0.28)] md:hidden"><button type="button" onClick={beginUnlock} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#e8c87e] px-4 text-sm font-extrabold text-[#172033]"><LockKeyhole className="h-4 w-4" />ปลดล็อกด้วย 15 เครดิต</button></div> : null}
        </main>
    );
}
