import type { ReactNode } from 'react';
import {
    AlertTriangle,
    CalendarDays,
    Check,
    ChevronDown,
    Heart,
    Info,
    RotateCcw,
    Search,
    Share2,
    Sparkles,
} from 'lucide-react';
import {
    getCompatibilityPresentation,
    type CompatibilityAnalysisResult,
} from '@/utils/petCompatibility';

interface PetCompatibilityResultProps {
    result: CompatibilityAnalysisResult;
    petName: string;
    ownerName: string;
    petNumerologyValue: number;
    isFavorite: boolean;
    onFavorite: () => void;
    onShare: () => void;
    onTryAnother: () => void;
    onFindBetter: () => void;
    technicalDetails?: ReactNode;
}

const SCORE_FACTORS = [
    ['birthdaySuitability', 'ความเหมาะสมกับวันเกิด'],
    ['thaksaLetters', 'อักษรทักษาส่งเสริม'],
    ['meaning', 'ความหมายของชื่อ'],
    ['pronunciation', 'การออกเสียง'],
    ['petSuitability', 'เหมาะกับคาแรกเตอร์น้อง'],
    ['nameRelationship', 'สัมพันธ์กับชื่อเจ้าของ'],
] as const;

function getScoreStatus(score: number) {
    if (score >= 85) return { label: 'โดดเด่น', bar: 'bg-emerald-500', text: 'text-emerald-700' };
    if (score >= 70) return { label: 'ดี', bar: 'bg-[#c9933a]', text: 'text-[#8a5b14]' };
    if (score >= 60) return { label: 'พอใช้', bar: 'bg-amber-400', text: 'text-amber-700' };
    return { label: 'ควรพิจารณา', bar: 'bg-rose-400', text: 'text-rose-700' };
}

function ScoreBar({ label, score }: { label: string; score: number }) {
    const status = getScoreStatus(score);

    return (
        <div className="grid gap-2 sm:grid-cols-[11rem_1fr_7rem] sm:items-center sm:gap-4">
            <span className="text-sm font-semibold text-[#353553]">{label}</span>
            <div
                className="h-2.5 overflow-hidden rounded-full bg-[#e9e7f1]"
                role="progressbar"
                aria-label={`${label} ${score} จาก 100`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={score}
            >
                <div className={`h-full rounded-full ${status.bar}`} style={{ width: `${score}%` }} />
            </div>
            <div className="flex items-center justify-between gap-3 sm:justify-end">
                <span className={`text-xs font-bold ${status.text}`}>{status.label}</span>
                <span className="w-9 text-right font-mono text-sm font-extrabold text-[#1a1a3e]">{score}</span>
            </div>
        </div>
    );
}

function Disclosure({ title, description, children }: { title: string; description: string; children: ReactNode }) {
    return (
        <details className="group overflow-hidden rounded-xl border border-[#ddddf0] bg-[#fffefa] shadow-sm">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9933a] focus-visible:ring-inset sm:px-5 [&::-webkit-details-marker]:hidden">
                <span>
                    <span className="block text-sm font-extrabold text-[#1a1a3e]">{title}</span>
                    <span className="mt-0.5 block text-xs leading-5 text-[#6f6f88]">{description}</span>
                </span>
                <ChevronDown className="h-5 w-5 shrink-0 text-[#8e8eaa] transition-transform duration-200 motion-reduce:transition-none group-open:rotate-180" />
            </summary>
            <div className="border-t border-[#eeeef6] px-4 py-5 sm:px-5">{children}</div>
        </details>
    );
}

export function PetCompatibilityResult({
    result,
    petName,
    ownerName,
    petNumerologyValue,
    isFavorite,
    onFavorite,
    onShare,
    onTryAnother,
    onFindBetter,
    technicalDetails,
}: PetCompatibilityResultProps) {
    const presentation = getCompatibilityPresentation(result);
    const { scoreBreakdown, daySuitability, ownerDayResult, kalakineeChars } = result;
    const hasKalakinee = kalakineeChars.length > 0;
    const toneClass = presentation.tone === 'warning'
        ? 'border-rose-300/60 bg-rose-400/15 text-rose-100'
        : presentation.tone === 'excellent'
        ? 'border-emerald-300/50 bg-emerald-400/10 text-emerald-200'
        : presentation.tone === 'good'
            ? 'border-[#e8c87e]/60 bg-[#c9933a]/15 text-[#f6dda2]'
            : 'border-amber-300/50 bg-amber-300/10 text-amber-100';

    return (
        <section className="space-y-4 animate-fade-in-up" aria-labelledby="compatibility-result-title">
            <div className="overflow-hidden rounded-2xl border border-[#25324d] bg-[#0f172a] text-slate-100 shadow-[0_18px_48px_rgba(15,23,42,0.18)]">
                <div className="grid gap-0 lg:grid-cols-[1fr_15rem]">
                    <div className="p-5 sm:p-7">
                        <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${toneClass}`}>
                            <Sparkles className="h-3.5 w-3.5" />{presentation.verdict}
                        </div>
                        <p className="mt-5 text-xs font-bold text-[#e8c87e]">ผลความเข้ากันของชื่อ</p>
                        <h2 id="compatibility-result-title" className="mt-1 text-2xl font-extrabold leading-tight text-slate-50 sm:text-3xl">
                            “{petName}” <span className="font-medium text-slate-400">กับ</span> “{ownerName}”
                        </h2>
                        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">{presentation.summary}</p>
                    </div>

                    <div className="flex flex-col justify-center border-t border-slate-700 px-5 py-6 lg:border-l lg:border-t-0 lg:px-6">
                        <span className="text-xs font-bold text-slate-400">คะแนนความเข้ากัน</span>
                        <div className="mt-1 flex items-end gap-1">
                            <strong className="font-mono text-5xl font-extrabold leading-none text-[#f1c75b]">{scoreBreakdown.total}</strong>
                            <span className="pb-1 font-mono text-sm font-bold text-slate-400">/100</span>
                        </div>
                        <span className="mt-2 text-sm font-bold text-slate-200">{presentation.verdict}</span>
                    </div>
                </div>

                <div className="border-t border-slate-700 px-5 py-5 sm:px-7">
                    <div className="relative h-3" aria-hidden="true">
                        <div className="flex h-2.5 overflow-hidden rounded-full bg-slate-700">
                            <span className="w-[60%] bg-rose-400/65" />
                            <span className="w-[30%] bg-[#c9933a]" />
                            <span className="w-[10%] bg-emerald-400" />
                        </div>
                        <span
                            className="absolute top-[-5px] h-5 w-1.5 rounded-full bg-slate-50 shadow-[0_0_0_3px_rgba(241,199,91,0.28)]"
                            style={{ left: `calc(${scoreBreakdown.total}% - 3px)` }}
                        />
                    </div>
                    <div className="mt-2 grid grid-cols-3 text-[11px] font-semibold text-slate-400">
                        <span>ควรเปรียบเทียบ</span><span className="text-center">ดี</span><span className="text-right">ดีเยี่ยม</span>
                    </div>
                </div>
            </div>

            {hasKalakinee ? (
                <div role="alert" className="rounded-xl border-2 border-rose-400 bg-rose-50 p-5 shadow-[0_10px_30px_rgba(225,29,72,0.12)] sm:p-6">
                    <div className="flex items-start gap-4">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-rose-600 text-white shadow-sm"><AlertTriangle className="h-6 w-6" /></span>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-extrabold text-rose-700">คำเตือนสำคัญตามวันเกิดเจ้าของ</p>
                            <h3 className="mt-1 text-lg font-extrabold text-rose-950 sm:text-xl">พบอักษรกาลกิณีในชื่อ “{petName}”</h3>
                            <p className="mt-2 text-sm leading-7 text-rose-900">
                                พบอักษร <strong>{kalakineeChars.join(', ')}</strong> ซึ่งเป็นอักษรกาลกิณีของเจ้าของที่เกิด{ownerDayResult?.dayName || 'วันที่ระบุ'} ระบบแนะนำให้เปลี่ยนเป็นชื่ออื่นที่ไม่พบอักษรกาลกิณีก่อนนำไปใช้จริง
                            </p>
                            <button type="button" onClick={onFindBetter} className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-rose-700 px-5 text-sm font-extrabold text-white hover:bg-rose-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 sm:w-auto"><Search className="h-4 w-4" />ค้นหาชื่อใหม่ที่ไม่มีกาลกิณี</button>
                        </div>
                    </div>
                </div>
            ) : null}

            <div className="overflow-hidden rounded-xl border border-[#ddddf0] bg-[#fffefa] shadow-sm">
                <div className="grid md:grid-cols-3 md:divide-x md:divide-[#eeeef6]">
                    <div className="p-5">
                        <h3 className="flex items-center gap-2 text-sm font-extrabold text-emerald-700"><Check className="h-4 w-4" />เข้ากันดีเพราะ</h3>
                        <ul className="mt-3 space-y-3">
                            {presentation.strengths.map((factor) => (
                                <li key={factor.key} className="text-sm leading-6 text-[#4e4e69]">
                                    <strong className="text-[#1a1a3e]">{factor.label}</strong> <span className="font-mono text-xs text-emerald-700">{factor.score}/100</span>
                                    <span className="mt-0.5 block text-xs leading-5 text-[#777790]">{factor.detail}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="border-t border-[#eeeef6] p-5 md:border-t-0">
                        <h3 className="flex items-center gap-2 text-sm font-extrabold text-amber-700"><AlertTriangle className="h-4 w-4" />ควรพิจารณา</h3>
                        {presentation.cautionNote ? <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold leading-5 text-[#7a5315]">{presentation.cautionNote}</p> : null}
                        <ul className="mt-3 space-y-2">
                            {presentation.cautions.map((factor) => (
                                <li key={factor.key} className="flex items-center justify-between gap-3 text-sm text-[#4e4e69]">
                                    <span>{factor.label}</span><strong className="font-mono text-xs text-amber-700">{factor.score}/100</strong>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="border-t border-[#eeeef6] p-5 md:border-t-0">
                        <h3 className="flex items-center gap-2 text-sm font-extrabold text-[#1a1a3e]"><Info className="h-4 w-4 text-[#c9933a]" />คำแนะนำ</h3>
                        <p className="mt-3 text-sm leading-7 text-[#4e4e69]">{presentation.recommendation}</p>
                    </div>
                </div>
            </div>

            {ownerDayResult ? (
                <div className="flex flex-col gap-4 rounded-xl border border-[#e5deca] bg-[#fbf9f4] p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#e6cc8b] bg-[#fffefa] text-[#a67828]"><CalendarDays className="h-5 w-5" /></span>
                        <div>
                            <p className="text-xs font-bold text-[#8a6a35]">วันเกิดเจ้าของ</p>
                            <h3 className="mt-0.5 font-extrabold text-[#1a1a3e]">{ownerDayResult.dayName}</h3>
                            <p className="mt-1 text-sm leading-6 text-[#5a5a72]">
                                {kalakineeChars.length
                                    ? `พบอักษรกาลกิณี ${kalakineeChars.join(', ')} ระบบแนะนำให้เปลี่ยนเป็นชื่ออื่นก่อนนำไปใช้จริง`
                                    : 'ไม่พบอักษรกาลกิณีในชื่อน้องตามวันเกิดของเจ้าของ'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center justify-between gap-4 sm:block sm:text-right">
                        <span className="text-xs font-bold text-[#777790]">ความเหมาะสม</span>
                        <p className="font-mono text-2xl font-extrabold text-[#1a1a3e]">{ownerDayResult.score}<span className="text-sm text-[#8e8eaa]">/100</span></p>
                    </div>
                </div>
            ) : null}

            <Disclosure title="ดูรายละเอียดคะแนน" description="ดูคะแนนทั้ง 6 ด้านและสถานะของแต่ละปัจจัย">
                <div className="space-y-5">
                    {SCORE_FACTORS.map(([key, label]) => <ScoreBar key={key} label={label} score={scoreBreakdown[key]} />)}
                </div>
            </Disclosure>

            <Disclosure title="เปรียบเทียบกับวันเกิดอื่น" description="ข้อมูลประกอบสำหรับเปรียบเทียบความเหมาะสมครบทั้ง 8 กลุ่มวันเกิด">
                <div className="grid gap-px overflow-hidden rounded-lg border border-[#ddddf0] bg-[#ddddf0] sm:grid-cols-2 lg:grid-cols-4">
                    {daySuitability.map((day) => {
                        const selected = ownerDayResult?.dayKey === day.dayKey;
                        const status = getScoreStatus(day.score);
                        return (
                            <div key={day.dayKey} className={`min-h-24 bg-white p-4 ${selected ? 'ring-2 ring-inset ring-[#c9933a]' : ''}`}>
                                <div className="flex items-start justify-between gap-2">
                                    <span className="text-sm font-bold text-[#1a1a3e]">{day.dayName}</span>
                                    {selected ? <span className="rounded-full bg-[#0f172a] px-2 py-1 text-[10px] font-bold text-white">วันเกิดคุณ</span> : null}
                                </div>
                                <div className="mt-4 flex items-end justify-between gap-2">
                                    <span className={`text-xs font-bold ${status.text}`}>{status.label}</span>
                                    <strong className="font-mono text-lg text-[#1a1a3e]">{day.score}</strong>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Disclosure>

            {technicalDetails ? (
                <Disclosure title="รายละเอียดเชิงศาสตร์" description="ดูผลรวมเลขศาสตร์ คู่เลข และที่มาของคะแนนโดยละเอียด">
                    <div className="mb-5 grid gap-px overflow-hidden rounded-lg border border-[#ddddf0] bg-[#ddddf0] sm:grid-cols-3">
                        <div className="bg-white p-4"><span className="text-xs font-bold text-[#777790]">ผลรวมชื่อน้อง</span><p className="mt-1 font-mono text-2xl font-extrabold text-[#1a1a3e]">{petNumerologyValue}</p></div>
                        <div className="bg-white p-4"><span className="text-xs font-bold text-[#777790]">ผลรวมชื่อเจ้าของ</span><p className="mt-1 font-mono text-2xl font-extrabold text-[#1a1a3e]">{result.ownerNameScore}</p></div>
                        <div className="bg-white p-4"><span className="text-xs font-bold text-[#777790]">คะแนนความเข้ากัน</span><p className="mt-1 font-mono text-2xl font-extrabold text-[#a67828]">{scoreBreakdown.total}<span className="text-sm text-[#8e8eaa]">/100</span></p></div>
                    </div>
                    <div className="space-y-5">{technicalDetails}</div>
                </Disclosure>
            ) : null}

            <div className="flex flex-col gap-3 rounded-xl border border-[#d8ddea] bg-[#f5f6fa] p-4 sm:flex-row sm:flex-wrap sm:items-center">
                <button type="button" onClick={onFavorite} aria-pressed={isFavorite} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#d1d6e4] bg-white px-4 text-sm font-bold text-[#1a1a3e] hover:border-[#c9933a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9933a]">
                    <Heart className={`h-4 w-4 ${isFavorite ? 'fill-rose-400 text-rose-400' : 'text-[#6f6f88]'}`} />{isFavorite ? 'บันทึกแล้ว' : 'บันทึกชื่อนี้'}
                </button>
                <button type="button" onClick={onShare} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#d1d6e4] bg-white px-4 text-sm font-bold text-[#1a1a3e] hover:border-[#c9933a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9933a]"><Share2 className="h-4 w-4" />แชร์ผลลัพธ์</button>
                <button type="button" onClick={onTryAnother} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#d1d6e4] bg-white px-4 text-sm font-bold text-[#1a1a3e] hover:border-[#c9933a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9933a]"><RotateCcw className="h-4 w-4" />ลองชื่ออื่น</button>
                <button type="button" onClick={onFindBetter} className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-5 text-sm font-extrabold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 sm:ml-auto ${hasKalakinee ? 'bg-rose-700 hover:bg-rose-800 focus-visible:ring-rose-500' : 'bg-[#0f172a] hover:bg-[#1e293b] focus-visible:ring-[#c9933a]'}`}><Search className={`h-4 w-4 ${hasKalakinee ? 'text-white' : 'text-[#f1c75b]'}`} />{hasKalakinee ? 'เปลี่ยนเป็นชื่อที่ไม่มีกาลกิณี' : 'ค้นหาชื่อที่เข้ากันมากกว่า'}</button>
            </div>

            <p className="flex gap-2 rounded-lg border border-[#ddddf0] bg-[#f8f8fc] p-4 text-xs leading-6 text-[#666680]"><Info className="mt-0.5 h-4 w-4 shrink-0 text-[#8e8eaa]" />ผลความเข้ากันอ้างอิงหลักทักษาปกรณ์ เลขศาสตร์ และเกณฑ์การตั้งชื่อของเว็บไซต์ เป็นข้อมูลประกอบตามความเชื่อ ควรพิจารณาร่วมกับความหมาย ความไพเราะ และความรู้สึกเมื่อเรียกใช้จริง</p>
        </section>
    );
}
