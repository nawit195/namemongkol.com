'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import {
    Sparkles, Clock, User, Target,
    ChevronRight, ArrowLeft, Star, Crown,
    Lock, CheckCircle2, AlertCircle, RefreshCw,
    Coins, Briefcase, Activity, Heart, HelpingHand, Check, Mars, Venus,
    ShieldCheck, Info, XCircle, TrendingUp, MessageSquareQuote
} from 'lucide-react';
import Link from 'next/link';

import { supabase } from '@/utils/supabase';
import { generatePremiumNames, PremiumResult, FocusTopic, getAstrologicalDay } from '@/utils/premiumAnalysisUtils';
import { formatThaiBirthDate, ThaiDateResult } from '@/utils/thaiDateUtils';
import { calculateEffectiveCredits } from '@/utils/credits';
import { SearchableSelect } from '@/components/SearchableSelect';
import { SoftYellowGlowBackground } from '@/components/ui/background-components';

const CertificateGenerator = dynamic(
    () => import('@/components/CertificateGenerator').then((m) => m.CertificateGenerator),
    { ssr: false }
);

const THAI_MONTHS = [
    'มกราคม (01)', 'กุมภาพันธ์ (02)', 'มีนาคม (03)', 'เมษายน (04)', 'พฤษภาคม (05)', 'มิถุนายน (06)',
    'กรกฎาคม (07)', 'สิงหาคม (08)', 'กันยายน (09)', 'ตุลาคม (10)', 'พฤศจิกายน (11)', 'ธันวาคม (12)'
];

const DAYS = Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0'));
const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const MINUTES = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

// Years range: B.E. 2450 - 2590 (A.D. 1907 - 2047)
const START_BE = 2450;
const END_BE = 2590;
const DEFAULT_VVIP_PRICE = 599;
const PREMIUM_ANALYSIS_COST = 30;
type MemberTier = 'free' | 'pro' | 'vvip';

type PricingTier = {
    id: string;
    credits: number;
    price: number;
    name: string;
};

const findVvipTier = (tiers: PricingTier[]) => tiers.find((tier) =>
    tier.price === DEFAULT_VVIP_PRICE ||
    tier.id.toLowerCase().includes('vvip') ||
    tier.name.toLowerCase().includes('vvip') ||
    tier.name.toLowerCase().includes('fortune') ||
    tier.name.toLowerCase().includes('whale')
);

function normalizeTier(tier?: string | null): MemberTier {
    const normalized = (tier || '').toLowerCase();
    if (normalized === 'pro' || normalized === 'vvip') return normalized;
    return 'free';
}

const YEARS = Array.from({ length: END_BE - START_BE + 1 }, (_, i) => {
    const be = START_BE + i;
    const ad = be - 543;
    return { val: ad.toString(), label: `${be} / ${ad}` };
});

export default function PremiumAnalysisPage() {
    const router = useRouter();
    // Form State
    const [surname, setSurname] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [birthTime, setBirthTime] = useState('');
    const [gender, setGender] = useState<'male' | 'female'>('male');
    const [focus, setFocus] = useState<FocusTopic>('WEALTH');

    const [results, setResults] = useState<PremiumResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasAnalyzed, setHasAnalyzed] = useState(false);
    const [userTier, setUserTier] = useState<MemberTier>('free');
    const [userCredits, setUserCredits] = useState<number | null>(null);
    const [vvipPrice, setVvipPrice] = useState<number | null>(null);
    const [pricingFailed, setPricingFailed] = useState(false);

    // New state for extended date details
    const [dateDetails, setDateDetails] = useState<ThaiDateResult | null>(null);

    // Derived state for display input to allow typing
    // Derived state for display input to allow typing
    const [selectedDay, setSelectedDay] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedHour, setSelectedHour] = useState('12');
    const [selectedMinute, setSelectedMinute] = useState('00');

    // Derived state for display input to allow typing
    const [isUnknownTime, setIsUnknownTime] = useState(false);

    // Sync Dropdowns -> birthDate
    useEffect(() => {
        if (selectedDay && selectedMonth && selectedYear) {
            const mIndex = THAI_MONTHS.indexOf(selectedMonth) + 1;
            const mStr = mIndex.toString().padStart(2, '0');
            setBirthDate(`${selectedYear}-${mStr}-${selectedDay}`);
        } else {
            setBirthDate('');
        }
    }, [selectedDay, selectedMonth, selectedYear]);

    // Sync Dropdowns -> birthTime
    useEffect(() => {
        if (isUnknownTime) {
            setBirthTime('');
        } else {
            setBirthTime(`${selectedHour}:${selectedMinute}`);
        }
    }, [selectedHour, selectedMinute, isUnknownTime]);

    useEffect(() => {
        const syncUserMembership = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setUserTier('free');
                setUserCredits(null);
                return;
            }

            const { data: profile } = await supabase
                .from('user_profiles')
                .select('tier, credits, welcome_credits, welcome_credits_granted_at')
                .eq('id', user.id)
                .maybeSingle();

            if (!profile) {
                setUserTier('free');
                setUserCredits(0);
                return;
            }

            setUserTier(normalizeTier(profile.tier));
            setUserCredits(calculateEffectiveCredits(profile));
        };

        syncUserMembership();

        const onForceCreditsUpdate = () => {
            syncUserMembership();
        };

        window.addEventListener('force_credits_update', onForceCreditsUpdate);
        return () => {
            window.removeEventListener('force_credits_update', onForceCreditsUpdate);
        };
    }, []);

    useEffect(() => {
        let isMounted = true;

        const loadPricing = async () => {
            try {
                const res = await fetch('/api/pricing');
                const data = await res.json();
                const tiers = Array.isArray(data?.tiers) ? data.tiers as PricingTier[] : [];
                const vvipTier = findVvipTier(tiers);

                if (!isMounted) return;

                if (vvipTier && typeof vvipTier.price === 'number') {
                    setVvipPrice(vvipTier.price);
                    setPricingFailed(false);
                } else {
                    setPricingFailed(true);
                }
            } catch {
                if (isMounted) {
                    setPricingFailed(true);
                }
            }
        };

        loadPricing();

        return () => {
            isMounted = false;
        };
    }, []);


    // State สำหรับเก็บวันเกิดตามโหราศาสตร์
    const [astrologicalDay, setAstrologicalDay] = useState<string>('sunday');

    const [shownNames, setShownNames] = useState<string[]>([]);
    const displayVvipPrice = vvipPrice ?? (pricingFailed ? DEFAULT_VVIP_PRICE : null);
    const VVIP_PRICE = displayVvipPrice ?? DEFAULT_VVIP_PRICE;

    // Sync birthDate state back to dropdowns if set externally (optional, but good for robust sync)
    // For now, simpler to just let dropdowns drive the state.

    const focusOptions: Array<{ key: FocusTopic; title: string; subtitle: string; icon: React.ReactNode }> = [
        { key: 'WEALTH', title: 'โชคลาภ', subtitle: 'การเงินมั่งคั่ง', icon: <Coins size={20} /> },
        { key: 'JOB', title: 'การงาน', subtitle: 'เลื่อนขั้น อำนาจ', icon: <Briefcase size={20} /> },
        { key: 'HEALTH', title: 'สุขภาพ', subtitle: 'แข็งแรง ยั่งยืน', icon: <Activity size={20} /> },
        { key: 'LOVE', title: 'ความรัก', subtitle: 'เสน่ห์ คู่ครอง', icon: <Heart size={20} /> },
        { key: 'PATRON', title: 'อุปถัมภ์', subtitle: 'ผู้ใหญ่เมตตา', icon: <HelpingHand size={20} /> },
    ];

    const focusStyles: Record<FocusTopic, { card: string; active: string; icon: string; iconActive: string; titleActive: string }> = {
        WEALTH: {
            card: 'border-[#ddddf0] bg-[#fafafd] text-[#1a1a3e]',
            active: 'border-[#c9933a] bg-[#fff9eb] ring-2 ring-[#e8c87e]/45',
            icon: 'bg-[#eeebf8] text-[#6f6299]',
            iconActive: 'bg-[#e8c87e] text-[#51370d]',
            titleActive: 'text-[#1a1a3e]',
        },
        JOB: {
            card: 'border-[#ddddf0] bg-[#fafafd] text-[#1a1a3e]',
            active: 'border-[#c9933a] bg-[#fff9eb] ring-2 ring-[#e8c87e]/45',
            icon: 'bg-[#eeebf8] text-[#6f6299]',
            iconActive: 'bg-[#e8c87e] text-[#51370d]',
            titleActive: 'text-[#1a1a3e]',
        },
        HEALTH: {
            card: 'border-[#ddddf0] bg-[#fafafd] text-[#1a1a3e]',
            active: 'border-[#c9933a] bg-[#fff9eb] ring-2 ring-[#e8c87e]/45',
            icon: 'bg-[#eeebf8] text-[#6f6299]',
            iconActive: 'bg-[#e8c87e] text-[#51370d]',
            titleActive: 'text-[#1a1a3e]',
        },
        LOVE: {
            card: 'border-[#ddddf0] bg-[#fafafd] text-[#1a1a3e]',
            active: 'border-[#c9933a] bg-[#fff9eb] ring-2 ring-[#e8c87e]/45',
            icon: 'bg-[#eeebf8] text-[#6f6299]',
            iconActive: 'bg-[#e8c87e] text-[#51370d]',
            titleActive: 'text-[#1a1a3e]',
        },
        PATRON: {
            card: 'border-[#ddddf0] bg-[#fafafd] text-[#1a1a3e]',
            active: 'border-[#c9933a] bg-[#fff9eb] ring-2 ring-[#e8c87e]/45',
            icon: 'bg-[#eeebf8] text-[#6f6299]',
            iconActive: 'bg-[#e8c87e] text-[#51370d]',
            titleActive: 'text-[#1a1a3e]',
        },
    };

    const handleAnalyze = async (isNewBatch = false) => {
        const { default: Swal } = await import('sweetalert2');

        if (!surname || !birthDate || (!birthTime && !isUnknownTime)) {
            Swal.fire({
                title: 'ข้อมูลไม่ครบถ้วน',
                text: 'กรุณากรอก นามสกุล, วันเกิด และเวลาเกิด ให้ครบทุกช่อง',
                icon: 'warning',
                confirmButtonText: 'เข้าใจแล้ว',
                confirmButtonColor: '#f59e0b',
                background: '#1e293b',
                color: '#fff'
            });
            return;
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            const result = await Swal.fire({
                title: 'กรุณาเข้าสู่ระบบ',
                text: 'ท่านจำเป็นต้องเข้าสู่ระบบก่อนใช้งานฟีเจอร์วิเคราะห์ชื่อมงคลขั้นสูง',
                icon: 'info',
                showCancelButton: true,
                confirmButtonText: 'เข้าสู่ระบบ',
                cancelButtonText: 'ยกเลิก',
                confirmButtonColor: '#f59e0b',
                background: '#1e293b',
                color: '#fff'
            });

            if (result.isConfirmed) {
                router.push('/login');
            }
            return;
        }

        const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('tier, credits, welcome_credits, welcome_credits_granted_at')
            .eq('id', user.id)
            .maybeSingle();

        if (profileError || !profile) {
            await Swal.fire({
                title: 'เกิดข้อผิดพลาด',
                text: 'ไม่สามารถตรวจสอบสถานะสมาชิกได้ กรุณาลองใหม่อีกครั้ง',
                icon: 'error',
                confirmButtonText: 'ตกลง',
                background: '#1e293b',
                color: '#fff'
            });
            return;
        }

        const normalizedTier = normalizeTier(profile.tier);
        const latestCredits = calculateEffectiveCredits(profile);
        setUserTier(normalizedTier);
        setUserCredits(latestCredits);

        if (normalizedTier !== 'vvip') {
            const confirmation = await Swal.fire({
                title: 'สมัครสมาชิก VVIP เพื่อวิเคราะห์',
                text: `การวิเคราะห์ชื่อมงคลขั้นสูงจะเปิดให้เฉพาะสมาชิก VVIP เท่านั้น สมัครสมาชิก VVIP วันนี้เพียง ${VVIP_PRICE} บาท?`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: `ไปชำระ ${VVIP_PRICE} บาท`,
                cancelButtonText: 'ยกเลิก',
                confirmButtonColor: '#10b981',
                cancelButtonColor: '#64748b',
                background: '#1e293b',
                color: '#fff',
                iconColor: '#fcd34d'
            });

            if (confirmation.isConfirmed) {
                router.push('/topup?plan=vvip');
            }
            return;
        }

        if (latestCredits < PREMIUM_ANALYSIS_COST) {
            const topup = await Swal.fire({
                title: 'เครดิตไม่เพียงพอ',
                html: `<p style="color:#cbd5e1">การวิเคราะห์ต้องใช้ <strong style="color:#fbbf24">${PREMIUM_ANALYSIS_COST} เครดิต</strong></p><p style="color:#cbd5e1;margin-top:4px">คุณมี <strong style="color:#ef4444">${latestCredits} เครดิต</strong></p>`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'ไปเติมเครดิต',
                cancelButtonText: 'ยกเลิก',
                confirmButtonColor: '#f59e0b',
                background: '#1e293b',
                color: '#fff'
            });

            if (topup.isConfirmed) {
                router.push('/topup');
            }
            return;
        }

        const confirmation = await Swal.fire({
            title: 'ยืนยันการวิเคราะห์ชื่อมงคล',
            html: `<p style="color:#cbd5e1">การวิเคราะห์จะใช้ <strong style="color:#fbbf24">${PREMIUM_ANALYSIS_COST} เครดิต</strong></p><p style="color:#cbd5e1;margin-top:4px">คุณมี <strong style="color:#34d399">${latestCredits} เครดิต</strong> (คงเหลือ ${latestCredits - PREMIUM_ANALYSIS_COST} เครดิต)</p>`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: `ยืนยัน (ใช้ ${PREMIUM_ANALYSIS_COST} เครดิต)`,
            cancelButtonText: 'ยกเลิก',
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#64748b',
            background: '#1e293b',
            color: '#fff'
        });

        if (!confirmation.isConfirmed) {
            return;
        }

        let deducted = false;
        setIsLoading(true);

        try {
            const { error: deductError } = await supabase.rpc('deduct_credits', { amount: PREMIUM_ANALYSIS_COST });
            if (deductError) {
                throw new Error('ไม่สามารถหักเครดิตได้ กรุณาลองใหม่');
            }

            deducted = true;
            setUserCredits((prev) => {
                if (prev === null) return latestCredits - PREMIUM_ANALYSIS_COST;
                return Math.max(prev - PREMIUM_ANALYSIS_COST, 0);
            });
            window.dispatchEvent(new Event('force_credits_update'));

            const analysisBirthTime = isUnknownTime ? '12:00' : birthTime;
            const birthDateObj = new Date(`${birthDate}T00:00:00`);
            const dayKey = getAstrologicalDay(birthDateObj, analysisBirthTime);

            setAstrologicalDay(dayKey);
            setDateDetails(formatThaiBirthDate(birthDate));

            const excludedNames = isNewBatch ? shownNames : [];
            const generatedResults = generatePremiumNames(surname, dayKey, focus, 20, excludedNames);

            try {
                await supabase.rpc('cleanup_analysis_history_by_tier');

                await supabase.from('analysis_history').insert({
                    user_id: user.id,
                    type: 'premium_analysis',
                    input_data: {
                        surname,
                        birthDate,
                        birthTime: analysisBirthTime,
                        focus,
                        astDay: dayKey,
                        isNewBatch
                    },
                    result_data: generatedResults
                });
            } catch (historyError) {
                console.error('Failed to save premium analysis history:', historyError);
            }

            if (isNewBatch) {
                setResults(generatedResults);
                setShownNames((prev) => [...prev, ...generatedResults.map((item) => item.name)]);
            } else {
                setResults(generatedResults);
                setShownNames(generatedResults.map((item) => item.name));
                setHasAnalyzed(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } catch (error: unknown) {
            if (deducted) {
                await supabase.rpc('deduct_credits', { amount: -PREMIUM_ANALYSIS_COST });
                setUserCredits((prev) => (prev !== null ? prev + PREMIUM_ANALYSIS_COST : latestCredits));
                window.dispatchEvent(new Event('force_credits_update'));
            }

            const errorMessage = error instanceof Error
                ? error.message
                : 'ไม่สามารถวิเคราะห์ชื่อมงคลได้ กรุณาลองใหม่';

            await Swal.fire({
                title: 'เกิดข้อผิดพลาด',
                text: errorMessage,
                icon: 'error',
                confirmButtonText: 'ตกลง',
                background: '#1e293b',
                color: '#fff'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setHasAnalyzed(false);
        setResults([]);
        setShownNames([]);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // --- Components ---

    const resultsContent = (
        <div className="space-y-10 animate-fade-in-up">

            {/* Header / Actions */}
            <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
                <button
                    onClick={handleReset}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-all px-4 py-2 hover:bg-white/5 rounded-lg text-sm"
                >
                    <ArrowLeft size={16} />
                    <span>คำนวณใหม่</span>
                </button>
                <div className="flex items-center gap-3">
                    <span className="text-slate-400 text-sm">ค้นพบ</span>
                    <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500">
                        {results.length}
                    </span>
                    <span className="text-slate-400 text-sm">รายชื่อมงคล</span>
                </div>
            </div>

            {/* Date Details Box */}
            {dateDetails && (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center space-y-4">
                    <p className="text-xl text-slate-200">
                        คุณเกิดวัน <span className="text-amber-400 font-bold">{dateDetails.dayOfWeek}</span> ครับ
                    </p>
                    <div className="text-sm text-slate-300 space-y-2 bg-black/20 p-4 rounded-xl border border-white/5 inline-block w-full max-w-2xl">
                        <p>สำหรับรายละเอียดเพิ่มเติมของวันที่ {dateDetails.fullSolarDateWithType} มีดังนี้ครับ:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-left md:text-center">
                            <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                                <span className="block text-xs text-slate-500 mb-1">ตรงกับวัน</span>
                                <span className="text-white font-medium">{dateDetails.dayOfWeek}</span>
                            </div>
                            <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                                <span className="block text-xs text-slate-500 mb-1">วันทางจันทรคติ</span>
                                <span className="text-amber-200 font-medium">{dateDetails.lunarDate}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Recommendation Box */}
            <div className="relative overflow-hidden bg-gradient-to-r from-emerald-900/40 to-teal-900/40 border border-emerald-500/30 rounded-3xl p-8 text-center space-y-3">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50"></div>

                <h3 className="text-emerald-300 font-bold text-xl flex items-center justify-center gap-2">
                    <ShieldCheck size={24} />
                    ผลลัพธ์การวิเคราะห์
                </h3>
                <p className="text-slate-200">
                    ชื่อมงคลสำหรับนามสกุล <span className="text-white font-bold underline decoration-amber-500/50 underline-offset-4 px-1">&quot;{surname}&quot;</span>
                </p>
                <p className="text-slate-300 text-sm max-w-2xl mx-auto">
                    รายชื่อเหล่านี้ถูกคัดสรรจากศาสตร์ทักษาปกรณ์และเลขศาสตร์ชั้นสูง โดยคำนวณจากวันเดือนปีเกิดและเวลาเกิดของท่านโดยเฉพาะ
                </p>
                <div className="flex items-center justify-center gap-2 mt-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border bg-amber-500/15 text-amber-300 border-amber-500/25">
                        ✦ ชื่อส่วนตัว — ไม่ใช่ผลการค้นหาทั่วไป
                    </span>
                </div>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.length > 0 ? results.map((result, idx) => {
                    const isPremium = result.grade === 'A+';
                    return (
                        <div
                            key={idx}
                            className={`relative group p-6 rounded-3xl border backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col justify-between overflow-hidden
                                ${isPremium
                                    ? 'bg-indigo-950/40 border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.1)]'
                                    : 'bg-white/5 border-white/5 hover:bg-white/10'
                                }`}
                        >
                            {/* Decorative Elements for Premium Cards */}
                            {isPremium && (
                                <>
                                    <div className="absolute top-4 right-4 text-amber-400">
                                        <Crown size={24} />
                                    </div>
                                </>
                            )}

                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className={`px-3 py-1 rounded-lg text-xs font-bold font-mono border ${isPremium
                                        ? 'bg-amber-950/40 text-amber-300 border-amber-500/30'
                                        : 'bg-white/5 text-slate-400 border-white/10'
                                        }`}>
                                        Grade {result.grade}
                                    </div>
                                    {isPremium && <span className="text-[10px] text-amber-500 uppercase tracking-widest font-bold">เฉพาะสำหรับคุณ</span>}
                                </div>

                                <h3 className={`text-3xl font-bold mb-2 transition-colors ${isPremium ? 'text-white' : 'text-slate-200 group-hover:text-white'}`}>
                                    {result.name}
                                </h3>
                                <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                                    {result.meaning}
                                </p>

                                <div className="space-y-3 mb-6">
                                    {result.notes.map((note, i) => (
                                        <div key={i} className="flex items-start gap-2.5 text-sm text-slate-300">
                                            <CheckCircle2 size={15} className={`mt-0.5 shrink-0 ${isPremium ? 'text-amber-400' : 'text-emerald-500/70'}`} />
                                            <span className="opacity-90">{note}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>


                            {/* ปุ่มออกใบรับรองมงคล */}
                            <div className="pt-3 mt-3 border-t border-white/5">
                                <CertificateGenerator
                                    name={result.name}
                                    surname={surname}
                                    grade={result.grade}
                                    totalScore={result.totalScore}
                                    day={astrologicalDay}
                                    prediction={{
                                        level: result.grade === 'A+' ? 'ชื่อมงคลระดับสูงสุด' : result.grade === 'A' ? 'ชื่อมงคลระดับสูง' : 'ชื่อมงคล',
                                        desc: result.meaning
                                    }}
                                    compact
                                />
                            </div>
                        </div>
                    );
                }) : (
                    <div className="col-span-full py-20 text-center text-slate-300 bg-white/5 rounded-3xl border border-white/10 border-dashed">
                        <AlertCircle size={48} className="mx-auto mb-4 opacity-30" />
                        <p className="text-xl font-bold text-slate-300">ไม่พบรายชื่อที่ตรงกับเงื่อนไข</p>
                        <p className="mt-2 text-sm text-slate-500">กรุณาลองเปลี่ยนค่าพลัง (Focus) หรือตรวจสอบข้อมูลอีกครั้ง</p>
                    </div>
                )}

                {/* Load More Button */}
                {results.length > 0 && (
                    <div className="col-span-full pt-4 md:pt-8 flex justify-center pb-12">
                        <button
                            onClick={() => handleAnalyze(true)}
                            disabled={isLoading}
                            data-track="premiumAnalysis.results.reroll"
                            className="group relative inline-flex w-full sm:w-auto items-center justify-center gap-3 md:gap-4 px-4 sm:px-8 md:px-10 py-4 md:py-5 bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl border border-amber-500/20 hover:border-amber-500/50 shadow-lg shadow-black/40 transition-all hover:-translate-y-1 hover:shadow-amber-500/10 overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="bg-amber-500/20 p-2 rounded-full group-hover:bg-amber-500/30 transition-colors">
                                <RefreshCw size={24} className="text-amber-400 group-hover:rotate-180 transition-transform duration-700" />
                            </div>
                            <div className="flex flex-col items-start">
                                <span className="text-lg font-bold text-amber-100 group-hover:text-white">ค้นหารายชื่อชุดใหม่</span>
                                <span className="text-xs text-amber-500/80">สุ่มใหม่โดยใช้เงื่อนไขเดิม</span>
                            </div>
                            <div className="ml-0 md:ml-4 px-3 py-1 bg-amber-500/20 rounded-full border border-amber-500/20">
                                <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                                    -{PREMIUM_ANALYSIS_COST} <Coins size={10} />
                                </span>
                            </div>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );

    const formContent = (
        <div className="relative mx-auto max-w-6xl overflow-visible px-0 animate-fade-in-up sm:px-2 md:px-4">

            <div className="relative z-10 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">

                {/* Left Column: Personal Inputs (User Data) */}
                <div className="lg:col-span-5 space-y-5 md:space-y-6">

                    <div className="mb-3 flex items-center gap-3 text-[#1a1a3e]">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1a1a3e] text-sm font-black text-[#f8f8fc]">1</span>
                        <h3 className="text-lg font-extrabold md:text-xl">ข้อมูลส่วนตัว</h3>
                    </div>

                    {/* Surname */}
                    <div className="space-y-2 md:space-y-3">
                        <label htmlFor="premium-surname" className="ml-1 text-sm font-bold text-[#2f2f4f]">นามสกุล <span className="text-red-500">*</span></label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9b8ec4] transition-colors group-focus-within:text-[#a67828]">
                                <User size={20} className="w-5 h-5 md:w-5 md:h-5" />
                            </div>
                            <input
                                id="premium-surname"
                                type="text"
                                value={surname}
                                onChange={(e) => setSurname(e.target.value)}
                                placeholder="กรอกนามสกุลของท่าน"
                                className="w-full rounded-xl border border-[#ddddf0] bg-[#fafafd] py-3 pl-11 pr-4 text-base text-[#1a1a3e] shadow-sm transition-colors placeholder:text-[#8e8eaa] focus:border-[#c9933a] focus:outline-none focus:ring-2 focus:ring-[#e8c87e]/35 md:py-4 md:pl-12 md:pr-5"
                            />
                        </div>
                    </div>

                    {/* Birth Date & Time */}
                    <div className="grid grid-cols-1 gap-5 md:gap-6">
                        {/* Birth Date (Dropdowns) */}
                        <div className="space-y-2 md:space-y-3">
                            <label className="ml-1 text-sm font-bold text-[#2f2f4f]">วันเกิด</label>
                            <div className="grid grid-cols-12 gap-2 sm:gap-4">
                                {/* Day */}
                                <div className="col-span-4 sm:col-span-3 relative">
                                    <SearchableSelect
                                        value={selectedDay}
                                        onChange={setSelectedDay}
                                        options={DAYS}
                                        placeholder="วัน"
                                        searchPlaceholder="ค้นหาวัน..."
                                        variant="light"
                                    />
                                </div>

                                {/* Month */}
                                <div className="col-span-8 sm:col-span-5 relative">
                                    <SearchableSelect
                                        value={selectedMonth}
                                        onChange={setSelectedMonth}
                                        options={THAI_MONTHS}
                                        placeholder="เดือน"
                                        searchPlaceholder="ค้นหาเดือน..."
                                        variant="light"
                                    />
                                </div>

                                {/* Year */}
                                <div className="col-span-12 sm:col-span-4 relative">
                                    <SearchableSelect
                                        value={selectedYear}
                                        onChange={setSelectedYear}
                                        options={YEARS.map(y => ({ value: y.val, label: y.label }))}
                                        placeholder="ปี (พ.ศ.)"
                                        searchPlaceholder="ค้นหาปี..."
                                        variant="light"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Birth Time */}
                        <div className="space-y-2 md:space-y-3">
                            <label className="ml-1 flex items-center justify-between text-sm font-bold text-[#2f2f4f]">
                                <span className="flex items-center gap-2">
                                    เวลาเกิด
                                    {/* Tooltip for birth time */}
                                    <div className="relative group/tooltip">
                                        <Info size={14} className="cursor-help text-[#9b8ec4] transition-colors hover:text-[#a67828]" />
                                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-3 bg-slate-900/90 backdrop-blur-xl border border-amber-500/20 rounded-xl text-xs text-slate-300 opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-50 shadow-2xl">
                                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-slate-900 border-r border-b border-amber-500/20 rotate-45"></div>
                                            <p className="leading-relaxed">
                                                <strong className="text-amber-400">การระบุเวลาเกิด</strong> จะช่วยให้คำนวณลัคนาราศีได้แม่นยำขึ้น หากไม่ทราบให้เลือก &quot;ไม่ทราบเวลา&quot;
                                            </p>
                                        </div>
                                    </div>
                                </span>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="unknownTime"
                                        checked={isUnknownTime}
                                        onChange={(e) => {
                                            setIsUnknownTime(e.target.checked);
                                            if (e.target.checked) setBirthTime('');
                                        }}
                                        className="rounded border-[#ddddf0] bg-[#fafafd] text-[#c9933a] focus:ring-[#e8c87e]"
                                    />
                                    <label htmlFor="unknownTime" className="cursor-pointer text-xs text-[#5a5a82] transition-colors hover:text-[#a67828]">ไม่ทราบเวลา</label>
                                </div>
                            </label>
                            <div className={`grid grid-cols-2 gap-3 md:gap-4 ${isUnknownTime ? 'opacity-50 pointer-events-none' : ''}`}>
                                {/* Hour */}
                                <div className="relative">
                                    <SearchableSelect
                                        value={selectedHour}
                                        onChange={setSelectedHour}
                                        options={HOURS}
                                        disabled={isUnknownTime}
                                        placeholder="นาฬิกา"
                                        searchPlaceholder="ค้นหา..."
                                        variant="light"
                                    />
                                </div>

                                {/* Minute */}
                                <div className="relative">
                                    <SearchableSelect
                                        value={selectedMinute}
                                        onChange={setSelectedMinute}
                                        options={MINUTES}
                                        disabled={isUnknownTime}
                                        placeholder="นาที"
                                        searchPlaceholder="ค้นหา..."
                                        variant="light"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Gender */}
                    <div className="space-y-2 md:space-y-3">
                        <label className="ml-1 text-sm font-bold text-[#2f2f4f]">เพศ</label>
                        <div className="grid grid-cols-2 gap-3 p-0 md:p-1">
                            <button
                                type="button"
                                onClick={() => setGender('male')}
                                aria-pressed={gender === 'male'}
                                className={`min-h-12 py-3 md:py-4 rounded-xl text-sm font-bold transition-colors duration-200 flex items-center justify-center gap-2 border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9933a] focus-visible:ring-offset-2 ${gender === 'male'
                                    ? 'border-[#c9933a] bg-[#fff9eb] text-[#1a1a3e] ring-2 ring-[#e8c87e]/35'
                                    : 'border-[#ddddf0] bg-[#fafafd] text-[#5a5a82] hover:border-[#9b8ec4] hover:text-[#1a1a3e]'
                                    }`}
                            >
                                <Mars className="h-4 w-4" />
                                <span>ชาย</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setGender('female')}
                                aria-pressed={gender === 'female'}
                                className={`min-h-12 py-3 md:py-4 rounded-xl text-sm font-bold transition-colors duration-200 flex items-center justify-center gap-2 border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9933a] focus-visible:ring-offset-2 ${gender === 'female'
                                    ? 'border-[#c9933a] bg-[#fff9eb] text-[#1a1a3e] ring-2 ring-[#e8c87e]/35'
                                    : 'border-[#ddddf0] bg-[#fafafd] text-[#5a5a82] hover:border-[#9b8ec4] hover:text-[#1a1a3e]'
                                    }`}
                            >
                                <Venus className="h-4 w-4" />
                                <span>หญิง</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column: Focus Selection (Grid Cards) */}
                <div className="lg:col-span-7 flex flex-col h-full mt-2 md:mt-0">
                    <div className="mb-5 flex items-center gap-3 text-[#1a1a3e] md:mb-6">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1a1a3e] text-sm font-black text-[#f8f8fc]">2</span>
                        <div>
                            <h3 className="text-lg font-extrabold md:text-xl">เลือกเป้าหมายที่ต้องการเน้น</h3>
                            <p className="mt-0.5 text-sm text-[#5a5a82]">เลือกได้หนึ่งด้าน ระบบจะใช้เป็นน้ำหนักหลักในการคัดชื่อ</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5">
                        {focusOptions.map((option) => {
                            const isActive = focus === option.key;
                            const styles = focusStyles[option.key];
                            return (
                                <button
                                    type="button"
                                    key={option.key}
                                    onClick={() => setFocus(option.key)}
                                    aria-pressed={isActive}
                                    className={`group relative min-h-24 overflow-hidden rounded-2xl border p-4 transition-colors duration-200 flex items-center gap-3 md:gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9933a] focus-visible:ring-offset-2
                                        ${isActive
                                            ? styles.active
                                            : styles.card
                                        }`}
                                >

                                    {/* Icon Box */}
                                    <div className={`p-2.5 md:p-3 rounded-lg md:rounded-xl transition-all duration-300 shrink-0 ${isActive
                                        ? styles.iconActive
                                        : styles.icon
                                        }`}>
                                        {React.cloneElement(option.icon as React.ReactElement<{ size: number }>, { size: 24 })}
                                    </div>

                                    {/* Text Content */}
                                    <div className="flex-1 text-left z-10">
                                        <div className="flex items-center gap-2">
                                            <h4 className={`text-sm md:text-base font-bold transition-colors ${isActive ? styles.titleActive : 'text-[#2f2f4f] group-hover:text-[#1a1a3e]'}`}>
                                                {option.title}
                                            </h4>
                                            {isActive && (
                                                <div className="flex h-4 w-4 scale-100 items-center justify-center rounded-full bg-orange-400 shadow-lg transition-transform md:h-5 md:w-5">
                                                    <Check size={12} className="h-2.5 w-2.5 text-white stroke-[3px] md:h-3 md:w-3" />
                                                </div>
                                            )}
                                        </div>
                                        <p className={`mt-1 text-sm leading-relaxed ${isActive ? 'text-[#5a5a82]' : 'text-[#5a5a82]'}`}>
                                            {option.subtitle}
                                        </p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Bottom Action Area */}
            <div className="relative z-10 mt-8 border-t border-[#eeeef6] pt-6 md:mt-10 md:pt-8">
                <div className="flex flex-col items-center justify-center space-y-4">
                    <button
                        type="button"
                        onClick={() => handleAnalyze(false)}
                        disabled={isLoading}
                        data-track="premiumAnalysis.form.analyze"
                        className="group relative mx-auto w-full overflow-hidden rounded-2xl border border-[#c9933a] bg-[#fff9eb] shadow-[0_8px_24px_rgba(201,147,58,0.14)] transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(201,147,58,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9933a] focus-visible:ring-offset-2 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 md:max-w-3xl motion-reduce:transform-none"
                    >
                        <div className="relative flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5 md:px-8 md:py-5">
                            <div className="flex min-w-0 items-center gap-3.5 sm:gap-5">
                                <div className="shrink-0 rounded-lg bg-[#e8c87e] p-2.5 text-[#51370d] md:rounded-xl md:p-3">
                                    {isLoading ? <span className="animate-spin block"><RefreshCw className="w-5 h-5 md:w-7 md:h-7" /></span> : <Sparkles className="animate-pulse w-5 h-5 md:w-7 md:h-7" />}
                                </div>
                                <div className="min-w-0 text-left leading-tight">
                                    <h3 className="text-base sm:text-lg md:text-xl font-black text-[#140f0a] tracking-[0.01em] leading-tight">วิเคราะห์ชื่อมงคล</h3>
                                    <p className="mt-1 text-xs md:text-sm text-[#2a1f14] font-semibold leading-tight">ใช้ศาสตร์ชั้นสูง + พลังตัวเลข</p>
                                </div>
                            </div>
                            <div className="inline-flex w-full shrink-0 items-center justify-center gap-1.5 self-start rounded-xl bg-[#1a1a3e] px-3 py-2 text-[#f8f8fc] sm:w-auto sm:self-auto sm:px-4 md:gap-2 md:px-5 md:py-3">
                                <span className="text-center text-[11px] font-bold leading-tight text-[#f8f8fc] sm:text-sm md:text-base">
                                    {userTier === 'vvip'
                                        ? `ใช้ ${PREMIUM_ANALYSIS_COST} เครดิต`
                                        : `สมัครสมาชิก VVIP ${VVIP_PRICE} บาท`}
                                </span>
                                <Coins className="w-3.5 h-3.5 md:w-5 md:h-5 text-[#e8c87e] shrink-0" />
                            </div>
                        </div>
                        {/* Shimmer Effect */}
                        {!isLoading && <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-20 pointer-events-none motion-reduce:hidden"></div>}
                    </button>

                    <p className="flex items-center gap-1.5 text-xs font-medium text-slate-500 opacity-90 transition-opacity hover:opacity-100 md:gap-2 md:text-sm">
                        <Lock size={14} className="h-3.5 w-3.5 text-[#9b8ec4] md:h-4 md:w-4" />
                        ปลอดภัยสูงสุด • ข้อมูลของท่านจะถูกเก็บเป็นความลับ
                        {userTier === 'vvip' && userCredits !== null && (
                            <span className="text-[#a67828]">• เครดิตคงเหลือ {userCredits}</span>
                        )}
                    </p>
                </div>
            </div>
        </div>
    );

    return (
        <SoftYellowGlowBackground className="font-sans overflow-x-hidden selection:bg-amber-500/30">

            <main className="relative min-h-screen w-full px-3 pb-40 text-slate-900 sm:px-4 md:pb-20">
                <div className="relative z-10 mx-auto max-w-7xl px-0 sm:px-6 lg:px-8 space-y-6 md:space-y-8">

                    {/* Header Section */}
                    <header className="space-y-4 pb-5 pt-7 text-center md:pb-7 md:pt-20">
                        <div className="inline-flex items-center gap-2 rounded-full border border-[#e8c87e] bg-[#fff9eb] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#a67828] md:px-4 md:text-xs">
                            <Crown size={14} />
                            <span>Professional Naming Analysis</span>
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-[2rem] font-black leading-tight tracking-tight text-slate-950 sm:text-4xl md:text-6xl">
                                วิเคราะห์ชื่อมงคลขั้นสูง
                            </h1>
                            <div className="mx-auto h-0.5 w-16 rounded-full bg-[#c9933a]"></div>
                        </div>

                        <p className="mx-auto max-w-[68ch] text-base leading-8 text-[#5a5a82] md:text-lg md:leading-9">
                            เจาะลึกชะตาชีวิตด้วย <strong className="text-amber-700 font-bold">ทักษาปกรณ์</strong> และ <strong className="text-amber-700 font-bold">เลขศาสตร์ชั้นสูง</strong>
                            <br className="hidden md:block" />
                            พร้อมคำนวณ <strong className="text-amber-700 font-bold">ลัคนาราศี</strong> จาก <strong className="text-amber-700 font-bold">เวลาตกฟาก</strong> เพื่อค้นหาชื่อที่ส่งเสริมดวงชะตาของท่านอย่างแท้จริง
                        </p>
                    </header>

                    {/* Main Content Area */}
                    <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[1.5rem] border border-[#ddddf0] bg-[#fefeff] px-4 py-6 text-[#1a1a3e] shadow-[0_12px_36px_rgba(26,26,62,0.08)] sm:px-6 md:rounded-[2rem] md:px-10 md:py-10">
                        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-[#e8c87e]"></div>
                        {!hasAnalyzed ? formContent : resultsContent}
                    </div>

                    {/* ==================== SEO CONTENT SECTION (Below the Fold) ==================== */}
                    {!hasAnalyzed && (
                        <section className="mt-10 space-y-10 pb-12 text-[#1a1a3e] md:space-y-14 md:pb-20">

                            {/* Section A: ความแตกต่างของการ "วิเคราะห์ขั้นสูง" */}
                            <div className="mx-auto max-w-6xl rounded-[1.5rem] border border-[#ddddf0] bg-[#fefeff] px-5 py-10 shadow-sm sm:px-8 md:rounded-[2rem] md:px-12 md:py-14">
                                <h2 className="mx-auto mb-6 max-w-3xl text-center text-2xl font-black leading-tight tracking-tight text-[#1a1a3e] md:text-4xl">
                                    ความแตกต่างของ <span className="text-[#a67828]">&quot;วิเคราะห์ชื่อมงคลขั้นสูง&quot;</span>
                                </h2>
                                <div className="mx-auto mb-10 max-w-3xl text-center md:mb-12">
                                    <p className="text-base leading-8 text-[#5a5a82] md:text-lg">
                                        การวิเคราะห์ชื่อทั่วไปดูเพียงแค่ <span className="font-semibold text-[#1a1a3e]">ผลรวมเลขศาสตร์</span> แต่ <strong className="font-extrabold text-[#a67828]">การวิเคราะห์ชื่อมงคลขั้นสูง</strong> ของเรานำ <strong className="font-extrabold text-[#1a1a3e]">&quot;เวลาตกฟาก&quot;</strong> มาคำนวณหาลัคนาราศีที่แท้จริง เพื่อดูว่าชื่อส่งผลต่อดวงกำเนิดของคุณในมุมลึกอย่างไร
                                    </p>
                                </div>
                                
                                <div className="mx-auto grid max-w-5xl divide-y divide-[#ddddf0] border-y border-[#ddddf0] md:grid-cols-3 md:divide-x md:divide-y-0">
                                        <div className="p-5 md:px-7 md:py-6">
                                            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#eeebf8]">
                                                <Clock className="h-5 w-5 text-[#6f6299]" />
                                            </div>
                                            <h3 className="mb-2 text-lg font-bold text-[#1a1a3e]">เวลาตกฟาก</h3>
                                            <p className="text-sm leading-7 text-[#5a5a82]">คำนวณลัคนาราศีจริง ไม่ใช่แค่ราศีตามวันเกิด</p>
                                        </div>
                                        <div className="p-5 md:px-7 md:py-6">
                                            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#eeebf8]">
                                                <Target className="h-5 w-5 text-[#6f6299]" />
                                            </div>
                                            <h3 className="mb-2 text-lg font-bold text-[#1a1a3e]">เจาะลึกเฉพาะด้าน</h3>
                                            <p className="text-sm leading-7 text-[#5a5a82]">เลือก Focus ได้ว่าต้องการเสริมดวงด้านไหน</p>
                                        </div>
                                        <div className="p-5 md:px-7 md:py-6">
                                            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#eeebf8]">
                                                <TrendingUp className="h-5 w-5 text-[#6f6299]" />
                                            </div>
                                            <h3 className="mb-2 text-lg font-bold text-[#1a1a3e]">Personalization</h3>
                                            <p className="text-sm leading-7 text-[#5a5a82]">ผลลัพธ์เฉพาะบุคคล ไม่ใช่สูตรสำเร็จรูป</p>
                                        </div>
                                    </div>
                                </div>

                            {/* Section B: เจาะลึก 5 ด้านที่เลือกเน้นได้ */}
                            <div className="mx-auto max-w-6xl rounded-[1.5rem] border border-[#dcd7ed] bg-[#eeebf8] px-5 py-10 sm:px-8 md:rounded-[2rem] md:px-12 md:py-14">
                                <h2 className="mb-4 text-center text-2xl font-black tracking-tight text-[#1a1a3e] md:text-4xl">
                                    เจาะลึก <span className="text-[#a67828]">5 ด้าน</span> ที่คุณเลือกเน้นได้
                                </h2>
                                <p className="mx-auto mb-10 max-w-2xl text-center text-base leading-8 text-[#5a5a82] md:text-lg">
                                    เลือก Focus ที่ต้องการ ระบบจะคำนวณหาชื่อที่เสริมดวงด้านนั้นโดยเฉพาะ
                                </p>

                                <div className="grid gap-x-10 gap-y-0 md:grid-cols-2">
                                    <div className="border-b border-[#d5cfe7] py-6">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fefeff] text-[#a67828]">
                                                <Coins className="h-5 w-5" />
                                            </div>
                                            <h3 className="text-lg font-bold text-[#1a1a3e]">การเงิน</h3>
                                        </div>
                                        <p className="text-sm leading-7 text-[#5a5a82]">
                                            วิเคราะห์หาเลขที่ดึงดูดทรัพย์และสภาพคล่อง ตัดตัวเลขที่ทำให้เก็บเงินไม่อยู่
                                        </p>
                                    </div>

                                    <div className="border-b border-[#d5cfe7] py-6">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fefeff] text-[#6f6299]">
                                                <Briefcase className="h-5 w-5" />
                                            </div>
                                            <h3 className="text-lg font-bold text-[#1a1a3e]">การงาน</h3>
                                        </div>
                                        <p className="text-sm leading-7 text-[#5a5a82]">
                                            เน้นเลขกลุ่มอำนาจบารมี (วรรคเดช) เพื่อการเลื่อนขั้นและเป็นเจ้าคนนายคน
                                        </p>
                                    </div>

                                    <div className="border-b border-[#d5cfe7] py-6">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fefeff] text-[#6f6299]">
                                                <Heart className="h-5 w-5" />
                                            </div>
                                            <h3 className="text-lg font-bold text-[#1a1a3e]">ความรัก</h3>
                                        </div>
                                        <p className="text-sm leading-7 text-[#5a5a82]">
                                            ตรวจสอบเลขเสน่ห์และคู่ครอง แก้ดวงอาภัพรักจากชื่อเดิม
                                        </p>
                                    </div>

                                    <div className="border-b border-[#d5cfe7] py-6">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fefeff] text-[#6f6299]">
                                                <Activity className="h-5 w-5" />
                                            </div>
                                            <h3 className="text-lg font-bold text-[#1a1a3e]">สุขภาพ</h3>
                                        </div>
                                        <p className="text-sm leading-7 text-[#5a5a82]">
                                            หาเลขที่ส่งเสริมความแข็งแรง หลีกเลี่ยงเลขที่ทำให้อ่อนไหวด้านสุขภาพ
                                        </p>
                                    </div>

                                    <div className="py-6 md:col-span-2 md:max-w-[calc(50%-1.25rem)]">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fefeff] text-[#6f6299]">
                                                <HelpingHand className="h-5 w-5" />
                                            </div>
                                            <h3 className="text-lg font-bold text-[#1a1a3e]">อุปถัมภ์</h3>
                                        </div>
                                        <p className="text-sm leading-7 text-[#5a5a82]">
                                            เสริมดวงผู้ใหญ่เมตตา มีคนคอยช่วยเหลือ ได้รับการสนับสนุน
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Section C: ตารางเปรียบเทียบ Free vs Premium */}
                            <div className="mx-auto max-w-6xl rounded-[1.5rem] border border-[#ddddf0] bg-[#fefeff] px-4 py-10 shadow-sm sm:px-8 md:rounded-[2rem] md:px-12 md:py-14">
                                <h2 className="mb-8 text-center text-2xl font-bold text-[#1a1a3e] md:text-3xl">
                                    เปรียบเทียบ <span className="text-[#5a5a82]">วิเคราะห์เบื้องต้น</span> กับ <span className="text-[#a67828]">วิเคราะห์ชื่อมงคลขั้นสูง</span>
                                </h2>

                                <div className="overflow-hidden rounded-2xl border border-[#ddddf0]">
                                    <table className="w-full border-collapse text-sm md:text-base">
                                        <thead className="hidden bg-[#1a1a3e] md:table-header-group">
                                            <tr>
                                                <th className="px-5 py-4 text-left font-semibold text-[#f8f8fc]">หัวข้อการวิเคราะห์</th>
                                                <th className="px-5 py-4 text-center font-semibold text-[#d7d4e6]">วิเคราะห์เบื้องต้น</th>
                                                <th className="px-5 py-4 text-center font-semibold text-[#e8c87e]">วิเคราะห์ขั้นสูง</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr className="grid grid-cols-[1fr_auto_auto] items-center gap-3 border-b border-[#eeeef6] px-4 py-4 md:table-row md:px-0 md:py-0">
                                                <td className="text-[#5a5a82] md:px-5 md:py-4">ดูผลรวมเลขศาสตร์</td>
                                                <td className="text-center py-4 px-4"><CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto" /></td>
                                                <td className="text-center py-4 px-4"><CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto" /></td>
                                            </tr>
                                            <tr className="grid grid-cols-[1fr_auto_auto] items-center gap-3 border-b border-[#eeeef6] bg-[#fafafd] px-4 py-4 md:table-row md:px-0 md:py-0">
                                                <td className="text-[#5a5a82] md:px-5 md:py-4">ดูอักษรกาลกิณี</td>
                                                <td className="text-center py-4 px-4"><CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto" /></td>
                                                <td className="text-center py-4 px-4"><CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto" /></td>
                                            </tr>
                                            <tr className="grid grid-cols-[1fr_auto_auto] items-center gap-3 border-b border-[#eeeef6] px-4 py-4 md:table-row md:px-0 md:py-0">
                                                <td className="text-[#5a5a82] md:px-5 md:py-4">วิเคราะห์ร่วมกับเวลาเกิด (ลัคนาราศี)</td>
                                                <td className="text-center py-4 px-4"><XCircle className="w-5 h-5 text-red-400 mx-auto" /></td>
                                                <td className="text-center text-sm font-semibold text-[#a67828] md:px-5 md:py-4">ใช้เวลาเกิดประกอบ</td>
                                            </tr>
                                            <tr className="grid grid-cols-[1fr_auto_auto] items-center gap-3 border-b border-[#eeeef6] bg-[#fafafd] px-4 py-4 md:table-row md:px-0 md:py-0">
                                                <td className="text-[#5a5a82] md:px-5 md:py-4">เจาะลึกเฉพาะด้าน (การเงิน/งาน/รัก)</td>
                                                <td className="text-center py-4 px-4"><XCircle className="w-5 h-5 text-red-400 mx-auto" /></td>
                                                <td className="text-center text-sm font-semibold text-[#a67828] md:px-5 md:py-4">เลือกได้ตามเป้าหมาย</td>
                                            </tr>
                                            <tr className="grid grid-cols-[1fr_auto_auto] items-center gap-3 border-b border-[#eeeef6] px-4 py-4 md:table-row md:px-0 md:py-0">
                                                <td className="text-[#5a5a82] md:px-5 md:py-4">แนะนำชื่อมงคลใหม่พร้อมความหมาย</td>
                                                <td className="text-center py-4 px-4"><XCircle className="w-5 h-5 text-red-400 mx-auto" /></td>
                                                <td className="text-center py-4 px-4"><CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto" /></td>
                                            </tr>
                                            <tr className="grid grid-cols-[1fr_auto_auto] items-center gap-3 bg-[#fafafd] px-4 py-4 md:table-row md:px-0 md:py-0">
                                                <td className="text-[#5a5a82] md:px-5 md:py-4">คะแนนและเกรดรายชื่อ</td>
                                                <td className="text-center py-4 px-4"><XCircle className="w-5 h-5 text-red-400 mx-auto" /></td>
                                                <td className="text-center py-4 px-4"><CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto" /></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Section D: Testimonial */}
                            <div className="mx-auto max-w-6xl px-1 py-6 sm:px-4 md:py-10">
                                <h2 className="mb-8 flex items-center justify-center gap-3 text-center text-2xl font-bold text-[#1a1a3e] md:text-3xl">
                                    <MessageSquareQuote className="h-7 w-7 text-[#a67828]" />
                                    รีวิวจากผู้ใช้จริง
                                </h2>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <figure className="rounded-2xl border border-[#ddddf0] bg-[#fefeff] p-6 shadow-sm">
                                        <div className="flex items-center gap-1 mb-3">
                                            {[1, 2, 3, 4, 5].map(i => <Star key={i} size={14} className="fill-[#c9933a] text-[#c9933a]" />)}
                                        </div>
                                        <blockquote className="mb-5 text-base leading-8 text-[#5a5a82]">
                                            &quot;วิเคราะห์ละเอียดมาก เห็นภาพชัดว่าชื่อเดิมมีปัญหาตรงไหน ระบบแนะนำชื่อใหม่มาพร้อมคำอธิบายครบถ้วน ตัดสินใจเปลี่ยนชื่อได้ง่ายขึ้นเยอะเลยค่ะ&quot;
                                        </blockquote>
                                        <figcaption className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eeebf8] text-sm font-bold text-[#1a1a3e]">ส</div>
                                            <div>
                                                <div className="text-sm font-semibold text-[#1a1a3e]">คุณสมใจ</div>
                                                <div className="text-xs text-[#8e8eaa]">ใช้บริการ: วิเคราะห์ขั้นสูง</div>
                                            </div>
                                        </figcaption>
                                    </figure>

                                    <figure className="rounded-2xl border border-[#ddddf0] bg-[#fefeff] p-6 shadow-sm">
                                        <div className="flex items-center gap-1 mb-3">
                                            {[1, 2, 3, 4, 5].map(i => <Star key={i} size={14} className="fill-[#c9933a] text-[#c9933a]" />)}
                                        </div>
                                        <blockquote className="mb-5 text-base leading-8 text-[#5a5a82]">
                                            &quot;ชอบที่เลือก Focus ได้ ผมเน้นเรื่องการงานเพราะอยากเลื่อนตำแหน่ง ระบบเลือกชื่อที่มีอักษรวรรคเดชนำมาให้หมดเลย สะดวกมากครับ&quot;
                                        </blockquote>
                                        <figcaption className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eeebf8] text-sm font-bold text-[#1a1a3e]">ก</div>
                                            <div>
                                                <div className="text-sm font-semibold text-[#1a1a3e]">คุณกิตติ</div>
                                                <div className="text-xs text-[#8e8eaa]">ใช้บริการ: วิเคราะห์ขั้นสูง</div>
                                            </div>
                                        </figcaption>
                                    </figure>
                                </div>

                                <div className="mt-8 text-center">
                                    <Link
                                        href="/reviews"
                                        className="inline-flex items-center gap-2 text-sm font-semibold text-[#a67828] transition-colors hover:text-[#7d571f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9933a] focus-visible:ring-offset-2"
                                    >
                                        ดูรีวิวทั้งหมด
                                        <ChevronRight size={16} />
                                    </Link>
                                </div>
                            </div>

                            {/* FAQ Section */}
                            <div className="mx-auto max-w-4xl rounded-[1.5rem] border border-[#ddddf0] bg-[#f8f8fc] px-5 py-10 sm:px-8 md:rounded-[2rem] md:px-12 md:py-14">
                                <h2 className="mb-8 text-center text-2xl font-bold text-[#1a1a3e] md:text-3xl">
                                    คำถามที่พบบ่อย
                                </h2>

                                <div className="space-y-3">
                                    <details className="group rounded-xl border border-[#ddddf0] bg-[#fefeff] px-5 py-4 open:shadow-sm">
                                        <summary className="relative cursor-pointer list-none pr-8 text-base font-bold leading-7 text-[#1a1a3e] after:absolute after:right-0 after:top-1/2 after:-translate-y-1/2 after:text-xl after:text-[#a67828] after:content-['+'] group-open:after:content-['−'] marker:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9933a] focus-visible:ring-offset-2 md:text-lg">
                                            Q: การวิเคราะห์ชื่อมงคลขั้นสูงต่างจากการวิเคราะห์ทั่วไปอย่างไร?
                                        </summary>
                                        <p className="mt-4 border-t border-[#eeeef6] pt-4 text-base leading-8 text-[#5a5a82]">
                                            A: การ<strong className="text-[#1a1a3e]">วิเคราะห์ชื่อมงคลขั้นสูง</strong>นำ &quot;เวลาตกฟาก&quot; มาคำนวณหาลัคนาราศีที่แท้จริง เพื่อดูว่าชื่อส่งผลต่อดวงกำเนิดของคุณในมุมลึกอย่างไร นอกจากนี้ยังสามารถเลือกเน้นเจาะลึกเฉพาะด้านที่ต้องการได้ เช่น <Link href="/name-analysis" className="font-semibold text-[#a67828] underline underline-offset-4">การเงิน การงาน หรือความรัก</Link>
                                        </p>
                                    </details>

                                    <details className="group rounded-xl border border-[#ddddf0] bg-[#fefeff] px-5 py-4 open:shadow-sm">
                                        <summary className="relative cursor-pointer list-none pr-8 text-base font-bold leading-7 text-[#1a1a3e] after:absolute after:right-0 after:top-1/2 after:-translate-y-1/2 after:text-xl after:text-[#a67828] after:content-['+'] group-open:after:content-['−'] marker:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9933a] focus-visible:ring-offset-2 md:text-lg">
                                            Q: ทำไมต้องระบุเวลาเกิด?
                                        </summary>
                                        <p className="mt-4 border-t border-[#eeeef6] pt-4 text-base leading-8 text-[#5a5a82]">
                                            A: การระบุเวลาเกิดจะช่วยให้คำนวณลัคนาราศีได้แม่นยำขึ้น ซึ่งมีผลต่อการวิเคราะห์ว่าอักษรและตัวเลขในชื่อจะส่งผลอย่างไรกับดวงชะตาเฉพาะบุคคลของคุณ หากไม่ทราบเวลาเกิดสามารถเลือก &quot;ไม่ทราบเวลา&quot; ได้
                                        </p>
                                    </details>

                                    <details className="group rounded-xl border border-[#ddddf0] bg-[#fefeff] px-5 py-4 open:shadow-sm">
                                        <summary className="relative cursor-pointer list-none pr-8 text-base font-bold leading-7 text-[#1a1a3e] after:absolute after:right-0 after:top-1/2 after:-translate-y-1/2 after:text-xl after:text-[#a67828] after:content-['+'] group-open:after:content-['−'] marker:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9933a] focus-visible:ring-offset-2 md:text-lg">
                                            Q: วิเคราะห์ชื่อมงคลขั้นสูงใช้กี่เครดิต?
                                        </summary>
                                        <p className="mt-4 border-t border-[#eeeef6] pt-4 text-base leading-8 text-[#5a5a82]">
                                            A: การวิเคราะห์ชื่อมงคลขั้นสูงสำหรับสมาชิก VVIP และเมื่อกดวิเคราะห์ ระบบจะหัก <strong className="text-[#1a1a3e]">30 เครดิตต่อครั้ง</strong> โดยจะแสดงรายชื่อมงคล 20 ชื่อ พร้อมคำอธิบายละเอียดและคะแนน หากยังไม่เป็นสมาชิก สามารถไปที่หน้า <Link href="/topup?plan=vvip" className="font-semibold text-[#a67828] underline underline-offset-4">สมัครสมาชิก VVIP</Link> ได้ทันที
                                        </p>
                                    </details>
                                </div>
                            </div>

                            {/* CTA */}
                            <div className="mx-auto max-w-3xl rounded-[1.5rem] border border-[#e8c87e] bg-[#fff9eb] p-7 text-center shadow-[0_8px_24px_rgba(201,147,58,0.10)] md:p-10">
                                <h3 className="mb-3 text-2xl font-bold text-[#1a1a3e]">
                                    พร้อมค้นหาชื่อมงคลที่ใช่สำหรับคุณ?
                                </h3>
                                <p className="mx-auto mb-6 max-w-2xl text-base leading-8 text-[#5a5a82]">
                                    เริ่มต้นวิเคราะห์ชื่อมงคลขั้นสูงด้วยศาสตร์ทักษาปกรณ์และเลขศาสตร์ชั้นสูง
                                </p>
                                <button
                                    type="button"
                                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                    className="inline-flex items-center gap-2 rounded-xl bg-[#c9933a] px-8 py-4 font-bold text-[#17130c] shadow-[0_6px_18px_rgba(201,147,58,0.18)] transition-[background-color,transform] hover:-translate-y-0.5 hover:bg-[#d4a54e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a67828] focus-visible:ring-offset-2 motion-reduce:transform-none"
                                >
                                    <Sparkles size={20} />
                                    เริ่มวิเคราะห์เลย
                                </button>
                            </div>

                        </section>
                    )}
                    {/* ==================== END SEO CONTENT SECTION ==================== */}

                </div>
            </main>
        </SoftYellowGlowBackground>
    );
}
