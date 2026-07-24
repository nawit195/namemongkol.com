'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, BriefcaseBusiness, CheckCircle2, ChevronDown, ClipboardCopy, Crown, Download, Heart, Lock, Play, RefreshCw, ShieldCheck, Sparkles, Wand2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { pairDefinitions } from '@/data/numerology';
import { pairDefinitions as detailedPairDefinitions } from '@/data/pairDefinitions';
import { getCharValue } from '@/data/numerologyLookup';
import { AUSPICIOUS_SUMS } from '@/utils/gradeResult';
import { supabase } from '@/utils/supabase';
import { getEffectiveCredits } from '@/utils/credits';

// ── Algorithm Engine ──
const NAME_GENERATOR_UNLOCK_COST = 50;
const FREE_PREVIEW_COUNT = 5;
const SHORTLIST_STORAGE_KEY = 'namemongkol:name-generator-shortlist';
const SHORTLIST_TRANSFER_KEY = 'namemongkol:name-analysis-prefill';
const SAFE_GROUPS = [1, 4, 5, 6, 9];
const ALL_CONSONANTS = 'กขฃคฅฆงจฉชซฌญฎฏฐฑฒณดตถทธนบปผฝพฟภมยรลวศษสหฬอฮ'.split('');
const FRAGMENTS = [
    'ณัฐ','ณัฏฐ์','นันท์','มนต์','รวิ','วิณ','ดิณ','ภณ','มิน','นนท์','กร','วัณ','ธาม','คุณ','กัณ','กัน','กิจ','กิณ','กิม','กะ','กิ','กม','กณ','ดน','นต','รณ','วร','อณ','อร','อิม','โณ','ชณ','ชล','ชน','ชิน','พณ','พิม','พิน','ศร','สน','สิร'
];

const isAplusSequence = (seq: number[]) => {
    for (let i = 0; i < seq.length - 1; i++) {
        const p = `${seq[i]}${seq[i + 1]}`;
        const level = pairDefinitions[p]?.level ?? 2;
        if (level !== 1) return false; // STRICT: Only GREEN allowed
    }
    const sum = seq.reduce((a, b) => a + b, 0);
    return AUSPICIOUS_SUMS.includes(sum);
};

const VALID_FRAGMENTS = FRAGMENTS.filter(f => {
    const seq = Array.from(f).map(c => getCharValue(c)).filter((v): v is number => v !== undefined);
    for (let i = 0; i < seq.length - 1; i++) {
        const p = `${seq[i]}${seq[i + 1]}`;
        const level = pairDefinitions[p]?.level ?? 2;
        if (level !== 1) return false;
    }
    return true;
});

const resultCardThemes = [
    {
        card: 'border-[#ddddf0] bg-[#fefeff] shadow-[0_8px_24px_rgba(26,26,62,0.07)]',
        icon: 'bg-[#eeebf8] text-[#7869a8]',
        rank: 'bg-[#c9933a] text-[#fefeff] ring-[#f5ead2]',
        name: 'text-[#1a1a3e]',
        sum: 'text-[#a67828]',
        sparkle: 'text-[#c9933a]/45',
        excellent: 'bg-emerald-100 text-emerald-700',
    },
    {
        card: 'border-[#ddddf0] bg-[#fafafd] shadow-[0_8px_24px_rgba(26,26,62,0.07)]',
        icon: 'bg-[#f5ead2] text-[#a67828]',
        rank: 'bg-[#1a1a3e] text-[#f8f8fc] ring-[#e6e6f2]',
        name: 'text-[#1a1a3e]',
        sum: 'text-[#a67828]',
        sparkle: 'text-[#9b8ec4]/50',
        excellent: 'bg-teal-100 text-teal-700',
    },
    {
        card: 'border-[#e8c87e]/70 bg-[#fffaf0] shadow-[0_8px_24px_rgba(201,147,58,0.08)]',
        icon: 'bg-[#f5ead2] text-[#a67828]',
        rank: 'bg-[#c9933a] text-[#fefeff] ring-[#f5ead2]',
        name: 'text-[#1a1a3e]',
        sum: 'text-[#a67828]',
        sparkle: 'text-[#c9933a]/45',
        excellent: 'bg-emerald-100 text-emerald-700',
    },
    {
        card: 'border-[#ddddf0] bg-[#f3f3f9] shadow-[0_8px_24px_rgba(26,26,62,0.07)]',
        icon: 'bg-[#eeebf8] text-[#7869a8]',
        rank: 'bg-[#1a1a3e] text-[#f8f8fc] ring-[#e6e6f2]',
        name: 'text-[#1a1a3e]',
        sum: 'text-[#a67828]',
        sparkle: 'text-[#9b8ec4]/50',
        excellent: 'bg-emerald-100 text-emerald-700',
    },
    {
        card: 'border-[#ddddf0] bg-[#fefeff] shadow-[0_8px_24px_rgba(26,26,62,0.07)]',
        icon: 'bg-[#eeebf8] text-[#7869a8]',
        rank: 'bg-[#c9933a] text-[#fefeff] ring-[#f5ead2]',
        name: 'text-[#1a1a3e]',
        sum: 'text-[#a67828]',
        sparkle: 'text-[#c9933a]/45',
        excellent: 'bg-emerald-100 text-emerald-700',
    },
    {
        card: 'border-[#e8c87e]/70 bg-[#fffaf0] shadow-[0_8px_24px_rgba(201,147,58,0.08)]',
        icon: 'bg-[#f5ead2] text-[#a67828]',
        rank: 'bg-[#1a1a3e] text-[#f8f8fc] ring-[#e6e6f2]',
        name: 'text-[#1a1a3e]',
        sum: 'text-[#a67828]',
        sparkle: 'text-[#9b8ec4]/50',
        excellent: 'bg-emerald-100 text-emerald-700',
    },
];

const fallbackResultTags = ['มงคล', 'ดีเยี่ยม'];

type GeneratedName = { name: string, sum: number };
type GoalId = 'baby' | 'rename' | 'brand' | 'kindness' | 'wealth' | 'authority' | 'simple';

const goalOptions: { id: GoalId; label: string; description: string }[] = [
    { id: 'baby', label: 'ตั้งชื่อลูก', description: 'เน้นความหมายดี อ่านไพเราะ ใช้ได้ระยะยาว' },
    { id: 'rename', label: 'เปลี่ยนชื่อ', description: 'เน้นความมั่นใจและพลังชื่อใหม่' },
    { id: 'brand', label: 'ชื่อร้าน/แบรนด์', description: 'เน้นจำง่าย ดูจริงจัง และต่อยอดธุรกิจได้' },
    { id: 'kindness', label: 'เน้นเมตตา', description: 'เหมาะกับงานบริการ ความรัก และมนุษยสัมพันธ์' },
    { id: 'wealth', label: 'เน้นการเงิน', description: 'คัดโทนชื่อที่สื่อถึงโอกาส รายได้ และค้าขาย' },
    { id: 'authority', label: 'เน้นอำนาจ', description: 'เหมาะกับงานบริหาร ภาวะผู้นำ และบารมี' },
    { id: 'simple', label: 'อ่านง่ายจำง่าย', description: 'เหมาะกับชื่อที่ต้องใช้บ่อยและบอกต่อได้ง่าย' },
];

const getSelectedGoal = (goalId: GoalId) => goalOptions.find((goal) => goal.id === goalId) ?? goalOptions[0];

const getResultTags = (sum: number) => {
    const pairKey = String(sum).padStart(2, '0');
    const tags = detailedPairDefinitions[pairKey]?.tags ?? [];
    const normalizedTags = tags
        .map((tag) => tag.replace(/^#/, '').trim())
        .filter(Boolean);

    return (normalizedTags.length > 0 ? normalizedTags : fallbackResultTags).slice(0, 2);
};

const getResultTagTheme = (tag: string) => {
    if (/เมตตา|ความรัก|เสน่ห์|อ่อนหวาน|ครอบครัว/.test(tag)) {
        return { icon: Heart, className: 'text-[#66578f] bg-[#eeebf8] border-[#ddddf0]' };
    }

    if (/การเงิน|ร่ำรวย|ทรัพย์|เงิน|มั่งคั่ง|ขายดี|ค้าขาย|เศรษฐี/.test(tag)) {
        return { icon: BriefcaseBusiness, className: 'text-emerald-700 bg-emerald-50 border-emerald-100' };
    }

    if (/ผู้นำ|อำนาจ|บารมี|ชื่อเสียง|ตำแหน่ง|ผู้ใหญ่|หนุน/.test(tag)) {
        return { icon: Crown, className: 'text-[#66578f] bg-[#eeebf8] border-[#ddddf0]' };
    }

    if (/โชค|สำเร็จ|ศักดิ์สิทธิ์|ปาฏิหาริย์|คุ้มครอง|แคล้วคลาด/.test(tag)) {
        return { icon: Sparkles, className: 'text-amber-700 bg-amber-50 border-amber-100' };
    }

    return { icon: ShieldCheck, className: 'text-sky-700 bg-sky-50 border-sky-100' };
};

const getNameSequence = (name: string) =>
    Array.from(name).map(c => getCharValue(c)).filter((v): v is number => v !== undefined);

const getGreenPairCount = (name: string) => Math.max(getNameSequence(name).length - 1, 0);

const getResultReason = (result: GeneratedName, goalId: GoalId) => {
    const tags = getResultTags(result.sum);
    const goal = getSelectedGoal(goalId);
    const pairCount = getGreenPairCount(result.name);
    const tagText = tags.length > 0 ? tags.join(' / ') : 'มงคล';

    return `เหมาะกับ${goal.label} เพราะผลรวม ${result.sum} อยู่ในกลุ่มมงคล มีคู่เลขเขียว ${pairCount} คู่ และเด่นด้าน${tagText}`;
};

const getTopCounts = (items: string[], limit = 3) => {
    const counts = new Map<string, number>();
    items.forEach((item) => counts.set(item, (counts.get(item) ?? 0) + 1));

    return Array.from(counts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit);
};

const getResultSummary = (results: GeneratedName[]) => {
    const topSums = getTopCounts(results.map((result) => String(result.sum)), 3);
    const topTags = getTopCounts(results.flatMap((result) => getResultTags(result.sum)), 4);

    return { topSums, topTags };
};

const goalPatterns: Record<GoalId, RegExp[]> = {
    baby: [/เมตตา|ความรัก|ครอบครัว|อ่อนหวาน|โชค|มงคล/],
    rename: [/สำเร็จ|โชค|บารมี|ผู้ใหญ่|ชื่อเสียง|มงคล|ดีเยี่ยม/],
    brand: [/การเงิน|ค้าขาย|ขายดี|ชื่อเสียง|สำเร็จ|ผู้นำ|มั่งคั่ง/],
    kindness: [/เมตตา|ความรัก|เสน่ห์|อ่อนหวาน|ครอบครัว/],
    wealth: [/การเงิน|ร่ำรวย|ทรัพย์|เงิน|มั่งคั่ง|ขายดี|ค้าขาย|เศรษฐี/],
    authority: [/ผู้นำ|อำนาจ|บารมี|ชื่อเสียง|ตำแหน่ง|ผู้ใหญ่|หนุน/],
    simple: [/มงคล|ดีเยี่ยม/],
};

const getGoalMatchScore = (result: GeneratedName, goalId: GoalId) => {
    const tagText = getResultTags(result.sum).join(' ');
    const keywordScore = goalPatterns[goalId].reduce((score, pattern) => score + (pattern.test(tagText) ? 14 : 0), 0);
    const simpleNameScore = goalId === 'simple'
        ? Math.max(0, 18 - Math.max(result.name.length - 4, 0) * 4)
        : result.name.length <= 6 ? 4 : 0;
    const pairScore = Math.min(getGreenPairCount(result.name), 7);
    const sumScore = AUSPICIOUS_SUMS.includes(result.sum) ? 8 : 0;

    return keywordScore + simpleNameScore + pairScore + sumScore;
};

const sortResultsForGoal = (results: GeneratedName[], goalId: GoalId) => {
    return [...results].sort((a, b) => {
        const scoreDiff = getGoalMatchScore(b, goalId) - getGoalMatchScore(a, goalId);
        if (scoreDiff !== 0) return scoreDiff;
        return a.name.length - b.name.length;
    });
};

const getFitScore = (result: GeneratedName, goalId: GoalId) => {
    const score = 90 + Math.min(getGoalMatchScore(result, goalId), 9);
    return Math.min(score, 99);
};

const getGoalFitLabel = (result: GeneratedName, goalId: GoalId) => {
    const score = getGoalMatchScore(result, goalId);
    if (score >= 24) return 'ตรงเป้าหมายมาก';
    if (score >= 16) return 'เหมาะกับเป้าหมาย';
    return 'ผ่านเกณฑ์ A+';
};

export default function ClientPage() {
    const router = useRouter();
    const [startChar, setStartChar] = useState('ก');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isUnlocking, setIsUnlocking] = useState(false);
    const [isResultsUnlocked, setIsResultsUnlocked] = useState(false);
    const [userCredits, setUserCredits] = useState<number | null>(null);
    const [results, setResults] = useState<GeneratedName[]>([]);
    const [selectedGoal, setSelectedGoal] = useState<GoalId>('baby');
    const [shortlistedNames, setShortlistedNames] = useState<string[]>([]);
    const [hasLoadedShortlist, setHasLoadedShortlist] = useState(false);
    const [hasCopiedShortlist, setHasCopiedShortlist] = useState(false);
    const selectedCharIsSafe = SAFE_GROUPS.includes(getCharValue(startChar) || 0);
    const selectedGoalOption = getSelectedGoal(selectedGoal);
    const displayedResults = sortResultsForGoal(results, selectedGoal);
    const resultSummary = getResultSummary(displayedResults);
    const previewCount = Math.min(FREE_PREVIEW_COUNT, displayedResults.length);
    const hiddenCount = Math.max(displayedResults.length - previewCount, 0);
    const analysisHref = shortlistedNames.length > 0
        ? '/name-analysis?source=name-generator'
        : '/name-analysis';

    useEffect(() => {
        try {
            const storedShortlist = window.localStorage.getItem(SHORTLIST_STORAGE_KEY);
            if (storedShortlist) {
                const parsed = JSON.parse(storedShortlist);
                if (Array.isArray(parsed)) {
                    setShortlistedNames(parsed.filter((item): item is string => typeof item === 'string' && item.trim().length > 0));
                }
            }
        } catch {
            window.localStorage.removeItem(SHORTLIST_STORAGE_KEY);
        } finally {
            setHasLoadedShortlist(true);
        }
    }, []);

    useEffect(() => {
        if (!hasLoadedShortlist) return;
        window.localStorage.setItem(SHORTLIST_STORAGE_KEY, JSON.stringify(shortlistedNames));
    }, [hasLoadedShortlist, shortlistedNames]);
    
    // We will use a fast fragment combiner to generate names
    const generateNames = () => {
        setIsGenerating(true);
        setIsResultsUnlocked(false);
        setShortlistedNames([]);
        setResults([]);
        
        // This runs asynchronously so it doesn't freeze the browser completely
        setTimeout(() => {
            const fragments = VALID_FRAGMENTS;

            // Prefix list based on user input
            const prefixes = fragments.filter(f => f.startsWith(startChar));
            // If no fragments start with this char, we just use the char itself
            if (prefixes.length === 0) prefixes.push(startChar);

            const generated = new Set<string>();
            const output: GeneratedName[] = [];
            
            // Loop to combine 2-3 fragments
            for (let i = 0; i < 5000; i++) {
                if (output.length >= 100) break;
                
                const p1 = prefixes[Math.floor(Math.random() * prefixes.length)];
                const p2 = fragments[Math.floor(Math.random() * fragments.length)];
                const useThree = Math.random() > 0.5;
                const p3 = useThree ? fragments[Math.floor(Math.random() * fragments.length)] : '';
                
                const name = p1 + p2 + p3;
                if (generated.has(name) || name.length > 8) continue;
                generated.add(name);
                
                const seq = Array.from(name).map(c => getCharValue(c)).filter((v): v is number => v !== undefined);
                if (seq.length < 2) continue;
                
                if (isAplusSequence(seq)) {
                    output.push({
                        name,
                        sum: seq.reduce((a, b) => a + b, 0)
                    });
                }
            }
            
            setResults(output);
            setIsGenerating(false);
        }, 100);
    };

    const unlockResults = async () => {
        const Swal = (await import('sweetalert2')).default;
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            router.push('/login?redirect=/name-generator');
            return;
        }

        setIsUnlocking(true);

        try {
            const latestCredits = await getEffectiveCredits(user.id);
            setUserCredits(latestCredits.total);

            if (latestCredits.total < NAME_GENERATOR_UNLOCK_COST) {
                const result = await Swal.fire({
                    title: 'เครดิตไม่เพียงพอ',
                    text: `การปลดล็อกชื่อทั้งหมดต้องใช้ ${NAME_GENERATOR_UNLOCK_COST} เครดิต (คุณมี ${latestCredits.total} เครดิต)`,
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'เติมเครดิต',
                    cancelButtonText: 'ยกเลิก',
                    confirmButtonColor: '#10b981',
                    cancelButtonColor: '#94a3b8',
                    background: '#fff9fd',
                    color: '#1a1a3e',
                    customClass: { popup: 'rounded-2xl border border-[#ddddf0]' },
                });

                if (result.isConfirmed) router.push('/topup');
                return;
            }

            const confirm = await Swal.fire({
                title: 'ปลดล็อกชุดชื่อ A+?',
                text: `ใช้ ${NAME_GENERATOR_UNLOCK_COST} เครดิตเพื่อแสดงชื่อจริงทั้งหมด ${results.length} รายชื่อ พร้อมผลรวม จุดเด่น และไฟล์ดาวน์โหลด`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: `ยืนยัน ใช้ ${NAME_GENERATOR_UNLOCK_COST} เครดิต`,
                cancelButtonText: 'ยกเลิก',
                confirmButtonColor: '#ec4899',
                cancelButtonColor: '#94a3b8',
                background: '#fff9fd',
                color: '#1a1a3e',
                customClass: { popup: 'rounded-2xl border border-[#ddddf0]' },
            });

            if (!confirm.isConfirmed) return;

            const { error } = await supabase.rpc('deduct_credits', { amount: NAME_GENERATOR_UNLOCK_COST });
            if (error) {
                const message = error.message || 'ไม่สามารถหักเครดิตได้ กรุณาลองใหม่';
                const looksLikeInsufficient = /insufficient|not\s*enough|เครดิตไม่พอ|ไม่เพียงพอ/i.test(message);
                const result = await Swal.fire({
                    title: looksLikeInsufficient ? 'เครดิตไม่เพียงพอ' : 'เกิดข้อผิดพลาด',
                    text: looksLikeInsufficient ? 'เครดิตไม่พอสำหรับการปลดล็อก กดเพื่อเติมเครดิต' : message,
                    icon: looksLikeInsufficient ? 'warning' : 'error',
                    showCancelButton: looksLikeInsufficient,
                    confirmButtonText: looksLikeInsufficient ? 'เติมเครดิต' : 'ตกลง',
                    cancelButtonText: looksLikeInsufficient ? 'ยกเลิก' : undefined,
                    confirmButtonColor: '#10b981',
                    cancelButtonColor: '#94a3b8',
                    background: '#fff9fd',
                    color: '#1a1a3e',
                    customClass: { popup: 'rounded-2xl border border-[#ddddf0]' },
                });

                if (looksLikeInsufficient && result.isConfirmed) router.push('/topup');
                return;
            }

            setUserCredits(latestCredits.total - NAME_GENERATOR_UNLOCK_COST);
            setIsResultsUnlocked(true);
            window.dispatchEvent(new Event('force_credits_update'));

            await Swal.fire({
                title: 'ปลดล็อกสำเร็จ',
                text: `แสดงรายชื่อทั้งหมดแล้ว หัก ${NAME_GENERATOR_UNLOCK_COST} เครดิตเรียบร้อย`,
                icon: 'success',
                timer: 1400,
                showConfirmButton: false,
                background: '#fff9fd',
                color: '#1a1a3e',
                customClass: { popup: 'rounded-2xl border border-[#ddddf0]' },
            });
        } finally {
            setIsUnlocking(false);
        }
    };

    const downloadCSV = () => {
        if (results.length === 0 || !isResultsUnlocked) return;
        
        // Add BOM for correct UTF-8 rendering in Excel
        const BOM = "\uFEFF";
        let csvContent = BOM + "Name,Sum,Grade,Tags,Reason\n";
        
        displayedResults.forEach(row => {
            const tags = getResultTags(row.sum).join('|');
            csvContent += `"${row.name}",${row.sum},A+,"${tags}","${getResultReason(row, selectedGoal)}"\n`;
        });
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Premium_A_Plus_Names_${startChar}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const toggleShortlist = (name: string) => {
        setShortlistedNames((current) =>
            current.includes(name)
                ? current.filter((item) => item !== name)
                : [...current, name]
        );
    };

    const copyShortlist = async () => {
        if (shortlistedNames.length === 0) return;

        try {
            await navigator.clipboard.writeText(shortlistedNames.join('\n'));
            setHasCopiedShortlist(true);
            window.setTimeout(() => setHasCopiedShortlist(false), 1600);
        } catch {
            setHasCopiedShortlist(false);
        }
    };

    const prepareShortlistForAnalysis = () => {
        if (shortlistedNames.length === 0) return;
        window.sessionStorage.setItem(SHORTLIST_TRANSFER_KEY, shortlistedNames.join('\n'));
    };

    return (
        <div className="site-grid-surface min-h-screen overflow-hidden font-sans text-[#1a1a3e] selection:bg-[#e8c87e] selection:text-[#1a1a3e]">
            <div aria-hidden="true" className="hidden">
                <Sparkles className="h-7 w-7" />
            </div>
            <div aria-hidden="true" className="hidden">
                <Sparkles className="h-8 w-8" />
            </div>
            <div aria-hidden="true" className="hidden">
                <Sparkles className="h-6 w-6" />
            </div>

            <div className="mx-auto w-full max-w-6xl px-4 pb-24 pt-8 sm:px-6 md:pt-20 lg:px-8">
                <div className="mx-auto mb-8 max-w-4xl text-center sm:mb-10">
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#e8c87e]/70 bg-[#fefeff] px-4 py-2 text-sm font-bold text-[#5a5a82] shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
                        <Wand2 className="h-4 w-4 text-[#c9933a]" />
                        <span>สร้างชื่อมงคลด้วย AI</span>
                    </div>
                    <h1 className="text-balance text-3xl font-extrabold leading-tight tracking-[-0.02em] text-[#1a1a3e] sm:text-5xl lg:text-6xl">
                        สร้างชื่อมงคลด้วย <span className="text-[#7869a8]">AI</span> <span className="text-[#a67828]">Grade A+</span>
                    </h1>
                    <p className="mx-auto mt-4 max-w-3xl text-pretty text-base leading-8 text-[#5a5a82] sm:text-lg">
                        ระบบจะประกอบตัวอักษรเป็นชื่อใหม่สำหรับตั้งชื่อลูก เปลี่ยนชื่อ หรือชื่อแบรนด์ โดยคัดเฉพาะผลรวมมงคลและคู่เลขสีเขียวล้วน
                    </p>
                </div>

                <div className="mb-8 rounded-[1.5rem] border border-[#ddddf0] bg-[#fefeff] p-4 shadow-[0_18px_50px_rgba(26,26,62,0.08)] sm:p-6 lg:p-8">
                    <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
                        <div className="min-w-0">
                            <label className="mb-2 block text-sm font-bold text-[#5a5a82]">อักษรนำหน้าที่ต้องการ</label>
                            <div className="relative">
                                <select
                                    value={startChar}
                                    onChange={(e) => setStartChar(e.target.value)}
                                    className={`h-14 w-full appearance-none rounded-xl border bg-[#fafafd] px-5 pr-12 text-2xl font-extrabold outline-none transition-colors focus:border-[#c9933a] focus:ring-4 focus:ring-[#e8c87e]/25 ${
                                        selectedCharIsSafe
                                            ? 'border-[#ddddf0] text-[#1a1a3e]'
                                            : 'border-rose-200 text-rose-600'
                                    }`}
                                >
                                    {ALL_CONSONANTS.map(char => {
                                        const isSafe = SAFE_GROUPS.includes(getCharValue(char) || 0);
                                        return (
                                            <option
                                                key={char}
                                                value={char}
                                                className={isSafe ? 'bg-[#fefeff] text-[#1a1a3e]' : 'bg-rose-50 text-rose-600'}
                                            >
                                                {char} {isSafe ? '' : '(หลีกเลี่ยง)'}
                                            </option>
                                        );
                                    })}
                                </select>
                                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#7869a8]" />
                            </div>
                        </div>
                        <button
                            onClick={generateNames}
                            disabled={!startChar || isGenerating}
                            className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#c9933a] px-8 text-base font-extrabold text-[#fefeff] shadow-[0_10px_24px_rgba(201,147,58,0.22)] transition-colors hover:bg-[#a67828] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#e8c87e]/40 disabled:cursor-not-allowed disabled:opacity-60 lg:w-auto"
                        >
                            {isGenerating ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Play className="h-5 w-5" />}
                            สร้าง 100 ชื่อ (Grade A+)
                        </button>
                    </div>

                    <div className="mt-5 rounded-2xl border border-[#ddddf0] bg-[#f8f8fc] p-4">
                        <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <p className="text-sm font-extrabold text-[#15163f]">ต้องการชื่อสำหรับอะไร?</p>
                                <p className="text-xs leading-5 text-[#5a5a82]">ใช้ช่วยจัดคำอธิบายและจุดเด่นของชื่อให้ตรงเป้าหมายมากขึ้น</p>
                            </div>
                            <span className="text-xs font-bold text-[#7869a8]">{selectedGoalOption.description}</span>
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible">
                            {goalOptions.map((goal) => {
                                const isSelected = selectedGoal === goal.id;

                                return (
                                    <button
                                        key={goal.id}
                                        type="button"
                                        onClick={() => setSelectedGoal(goal.id)}
                                        className={`shrink-0 rounded-full border px-4 py-2 text-sm font-extrabold transition-colors ${
                                            isSelected
                                                ? 'border-[#1a1a3e] bg-[#1a1a3e] text-[#f8f8fc] shadow-sm'
                                                : 'border-[#ddddf0] bg-[#fefeff] text-[#5a5a82] hover:border-[#9b8ec4] hover:bg-[#eeebf8]'
                                        }`}
                                    >
                                        {goal.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="mt-5 overflow-hidden rounded-2xl border border-[#e8c87e]/70 bg-[#fffaf0] text-sm text-[#6b4d1f]">
                        <div className="flex items-start gap-3 border-b border-amber-200/70 px-4 py-3">
                            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#a67828]" />
                            <p className="leading-7">รายชื่อที่ได้อาจมีลักษณะคล้ายชื่อเกาหลี ญี่ปุ่น หรือชื่อนวัตกรรมยุคใหม่ เนื่องจากเป็นการใช้ AI ต่อจิ๊กซอว์ตัวอักษรเพื่อหลบเลี่ยงคู่เลขเสียทั้งหมด</p>
                        </div>
                        <div className="flex items-start gap-3 px-4 py-3">
                            <div className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-rose-500" />
                            <p className="leading-7">หากคุณเลือกอักษรที่มี <span className="font-bold text-rose-700">สีแดง (กลุ่มห้ามใช้)</span> ระบบอาจสร้างชื่อ A+ ได้ยากมาก หรือได้ผลลัพธ์ 0 ชื่อ เพราะอักษรนั้นมักจะสร้างคู่เลขกาลกิณีเสมอ</p>
                        </div>
                    </div>
                </div>

                {results.length > 0 && (
                    <div className="animate-fade-in-up">
                        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex flex-wrap items-center gap-3">
                                <h2 className="text-2xl font-extrabold text-[#15163f]">ผลลัพธ์: พบ {results.length} ชื่อ</h2>
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-extrabold text-emerald-700">
                                    <ShieldCheck className="h-4 w-4" />
                                    Verified A+
                                </span>
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#ddddf0] bg-[#eeebf8] px-3 py-1.5 text-xs font-extrabold text-[#66578f]">
                                    เรียงตาม: {selectedGoalOption.label}
                                </span>
                                {isResultsUnlocked && (
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#e8c87e]/70 bg-[#fffaf0] px-3 py-1.5 text-xs font-extrabold text-[#a67828]">
                                        <Lock className="h-3.5 w-3.5" />
                                        ปลดล็อกแล้ว
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={downloadCSV}
                                disabled={!isResultsUnlocked}
                                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#ddddf0] bg-[#fefeff] px-4 text-sm font-extrabold text-[#5a5a82] shadow-sm transition-colors hover:border-[#9b8ec4] hover:bg-[#eeebf8] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#9b8ec4]/20 disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto"
                            >
                                <Download className="h-4 w-4" />
                                ดาวน์โหลด CSV
                            </button>
                        </div>
                        <div className="mb-5 grid gap-3 md:grid-cols-4">
                            <div className="rounded-2xl border border-[#ddddf0] bg-[#fefeff] p-4 shadow-sm">
                                <p className="text-xs font-bold text-[#5a5a82]">Preview ฟรี</p>
                                <p className="mt-1 text-2xl font-extrabold text-emerald-600">{previewCount} ชื่อ</p>
                                <p className="mt-1 text-xs text-[#5a5a82]">พร้อมเหตุผลย่อก่อนปลดล็อก</p>
                            </div>
                            <div className="rounded-2xl border border-[#ddddf0] bg-[#fafafd] p-4 shadow-sm">
                                <p className="text-xs font-bold text-[#5a5a82]">ชุดที่ล็อกไว้</p>
                                <p className="mt-1 text-2xl font-extrabold text-[#7869a8]">{hiddenCount} ชื่อ</p>
                                <p className="mt-1 text-xs text-[#5a5a82]">ปลดล็อกครั้งเดียวดูได้ครบ</p>
                            </div>
                            <div className="rounded-2xl border border-[#e8c87e]/70 bg-[#fffaf0] p-4 shadow-sm">
                                <p className="text-xs font-bold text-[#5a5a82]">ผลรวมเด่น</p>
                                <p className="mt-1 text-sm font-extrabold text-amber-700">
                                    {resultSummary.topSums.length > 0
                                        ? resultSummary.topSums.map(([sum, count]) => `${sum} (${count})`).join(', ')
                                        : '-'}
                                </p>
                                <p className="mt-1 text-xs text-[#5a5a82]">คัดเฉพาะผลรวมมงคล</p>
                            </div>
                            <div className="rounded-2xl border border-[#ddddf0] bg-[#f3f3f9] p-4 shadow-sm">
                                <p className="text-xs font-bold text-[#5a5a82]">หมวดจุดเด่น</p>
                                <p className="mt-1 text-sm font-extrabold text-[#66578f]">
                                    {resultSummary.topTags.length > 0
                                        ? resultSummary.topTags.map(([tag]) => tag).join(' / ')
                                        : '-'}
                                </p>
                                <p className="mt-1 text-xs text-[#5a5a82]">อิงจากความหมายเลขศาสตร์</p>
                            </div>
                        </div>
                        <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-[#ddddf0] bg-[#fefeff] p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm font-extrabold text-[#15163f]">Shortlist ชื่อที่สนใจ: {shortlistedNames.length} ชื่อ</p>
                                <p className="mt-1 text-xs leading-5 text-[#5a5a82]">
                                    {shortlistedNames.length > 0
                                        ? shortlistedNames.slice(0, 6).join(', ')
                                        : 'กดหัวใจบนชื่อที่ชอบ แล้วนำไปวิเคราะห์ต่อร่วมกับนามสกุล'}
                                </p>
                                {shortlistedNames.length > 0 && (
                                    <p className="mt-1 text-[11px] font-bold text-emerald-700">
                                        ระบบจะส่งรายชื่อนี้ไปเติมในหน้า Bulk Analysis ให้อัตโนมัติ
                                    </p>
                                )}
                            </div>
                            <div className="flex flex-col gap-2 sm:flex-row">
                                <button
                                    type="button"
                                    onClick={copyShortlist}
                                    disabled={shortlistedNames.length === 0}
                                    className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[#ddddf0] bg-[#fefeff] px-4 text-sm font-extrabold text-[#5a5a82] transition-colors hover:border-[#9b8ec4] hover:bg-[#eeebf8] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {hasCopiedShortlist ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <ClipboardCopy className="h-4 w-4" />}
                                    {hasCopiedShortlist ? 'คัดลอกแล้ว' : 'คัดลอกชื่อ'}
                                </button>
                                <Link prefetch={false}
                                    href={analysisHref}
                                    onClick={prepareShortlistForAnalysis}
                                    className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[#1a1a3e] bg-[#1a1a3e] px-4 text-sm font-extrabold text-[#f8f8fc] transition-colors hover:bg-[#292955]"
                                >
                                    วิเคราะห์ชื่อที่เลือกต่อ
                                    <ChevronDown className="h-4 w-4 -rotate-90" />
                                </Link>
                            </div>
                        </div>
                        {!isResultsUnlocked && (
                            <div className="mb-6 overflow-hidden rounded-[1.5rem] border border-[#e8c87e]/70 bg-[#fffaf0] p-4 shadow-[0_12px_36px_rgba(201,147,58,0.10)] sm:p-5">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#f5ead2] text-[#a67828] ring-4 ring-[#fefeff]">
                                            <Lock className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-extrabold text-[#15163f]">ปลดล็อกชุดชื่อ A+ พร้อมเหตุผล {results.length} รายชื่อ</h3>
                                            <p className="mt-1 text-sm leading-6 text-[#5a5a82]">
                                                แสดงชื่อจริงทั้งหมด พร้อมผลรวม จุดเด่น เหตุผลประกอบ และไฟล์ CSV สำหรับนำไปคัดเลือกต่อ
                                            </p>
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                {['คัดคู่เลขเขียว', 'ผลรวมมงคล', 'ใช้เครดิตครั้งเดียวต่อชุด', 'นำไปวิเคราะห์ต่อได้'].map((item) => (
                                                    <span key={item} className="inline-flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                                        {item}
                                                    </span>
                                                ))}
                                            </div>
                                            {userCredits !== null && (
                                                <p className="mt-1 text-xs font-bold text-emerald-700">เครดิตคงเหลือ: {userCredits}</p>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={unlockResults}
                                        disabled={isUnlocking}
                                        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#c9933a] px-6 text-sm font-extrabold text-[#fefeff] shadow-[0_10px_24px_rgba(201,147,58,0.22)] transition-colors hover:bg-[#a67828] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#e8c87e]/40 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
                                    >
                                        {isUnlocking ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                                        ปลดล็อกชุดนี้ {NAME_GENERATOR_UNLOCK_COST} เครดิต
                                    </button>
                                </div>
                            </div>
                        )}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {displayedResults.map((r, i) => {
                                const theme = resultCardThemes[i % resultCardThemes.length];
                                const tags = getResultTags(r.sum);
                                const isNameVisible = isResultsUnlocked || i < FREE_PREVIEW_COUNT;
                                const isShortlisted = shortlistedNames.includes(r.name);
                                const pairCount = getGreenPairCount(r.name);
                                const fitScore = getFitScore(r, selectedGoal);
                                const fitLabel = getGoalFitLabel(r, selectedGoal);
                                const reason = isNameVisible
                                    ? getResultReason(r, selectedGoal)
                                    : `ปลดล็อกเพื่อดูชื่อจริง พร้อมเหตุผลสำหรับ${selectedGoalOption.label} และจุดเด่นเลขศาสตร์`;

                                return (
                                    <div key={i} className={`group relative min-h-[252px] overflow-hidden rounded-2xl border p-4 shadow-lg transition-all hover:-translate-y-1 ${theme.card}`}>
                                        <div className={`absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-sm font-extrabold ring-4 ${theme.rank}`}>
                                            {i + 1}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => isNameVisible && toggleShortlist(r.name)}
                                            disabled={!isNameVisible}
                                            aria-label={isShortlisted ? `นำ ${r.name} ออกจาก Shortlist` : isNameVisible ? `เก็บ ${r.name} เข้า Shortlist` : 'ปลดล็อกก่อนเก็บชื่อ'}
                                            className={`absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full border bg-[#fefeff] shadow-sm transition-colors ${
                                                isShortlisted
                                                    ? 'border-[#e8c87e] text-[#a67828]'
                                                    : isNameVisible
                                                        ? 'border-[#ddddf0] text-[#8e8eaa] hover:border-[#e8c87e] hover:text-[#a67828]'
                                                        : 'cursor-not-allowed border-[#ddddf0] text-[#c6c6d8] opacity-70'
                                            }`}
                                        >
                                            <Heart className={`h-4 w-4 ${isShortlisted ? 'fill-current' : ''}`} />
                                        </button>
                                        <Sparkles className={`absolute bottom-4 right-5 h-4 w-4 ${theme.sparkle}`} />

                                        <div className="relative z-10 flex h-full flex-col justify-between gap-4 pt-6">
                                            <div className="text-center">
                                                <div className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full text-xl font-extrabold ring-4 ring-[#fefeff] ${theme.icon}`}>
                                                    {isNameVisible ? r.name.slice(0, 1) : <Lock className="h-5 w-5" />}
                                                </div>
                                                <div className="relative mx-auto w-fit max-w-full">
                                                    <p
                                                        className={`break-words text-2xl font-extrabold leading-snug transition-all ${theme.name} ${
                                                            isNameVisible ? '' : 'select-none blur-[7px]'
                                                        }`}
                                                        aria-label={isNameVisible ? r.name : 'ชื่อถูกล็อก'}
                                                    >
                                                        {isNameVisible ? r.name : 'ชื่อมงคล A+'}
                                                    </p>
                                                    {!isNameVisible && (
                                                        <span className="pointer-events-none absolute left-1/2 top-1/2 inline-flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-full border border-[#e8c87e]/70 bg-[#fffaf0] px-2.5 py-1 text-[10px] font-extrabold text-[#a67828] shadow-sm">
                                                            <Lock className="h-3 w-3" />
                                                            ล็อกอยู่
                                                        </span>
                                                    )}
                                                    {!isResultsUnlocked && isNameVisible && (
                                                        <span className="mt-2 inline-flex items-center gap-1 rounded-full border border-emerald-100 bg-[#fefeff] px-2.5 py-1 text-[10px] font-extrabold text-emerald-700 shadow-sm">
                                                            <ShieldCheck className="h-3 w-3" />
                                                            Preview ฟรี
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-sm">
                                                    <span className={`font-bold ${theme.sum}`}>ผลรวม {r.sum}</span>
                                                    <span className={`rounded-full px-2.5 py-1 text-xs font-extrabold ${theme.excellent}`}>Grade A+</span>
                                                    <span className="rounded-full bg-[#fefeff] px-2.5 py-1 text-xs font-extrabold text-emerald-700">คู่เลขเขียว {pairCount} คู่</span>
                                                    <span className="rounded-full bg-[#1a1a3e] px-2.5 py-1 text-xs font-extrabold text-[#f8f8fc]">{fitScore}% {fitLabel}</span>
                                                </div>
                                                <p className="mx-auto mt-3 max-w-[19rem] text-left text-xs leading-6 text-[#5a5a82]">
                                                    {reason}
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2">
                                                {tags.map((tag) => {
                                                    const tagTheme = getResultTagTheme(tag);
                                                    const TagIcon = tagTheme.icon;

                                                    return (
                                                        <div key={tag} className={`flex min-w-0 items-center justify-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[11px] font-bold ${tagTheme.className}`}>
                                                            <TagIcon className="h-3.5 w-3.5 shrink-0" />
                                                            <span className="truncate">#{tag}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
