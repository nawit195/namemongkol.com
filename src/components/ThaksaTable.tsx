import React from 'react';
import { AlertCircle, CheckCircle, LayoutGrid } from 'lucide-react';
import { thaksaMeanings } from '@/data/thaksaMeanings';
import { thaksaConfig } from '@/data/thaksaConfig';
import { ThaksaAnalysisResult } from '@/types';

interface ThaksaTableProps {
    thaksa: ThaksaAnalysisResult;
    day: string;
}

type ThaksaTone = {
    label: string;
    row: string;
    nameBadge: string;
    surnameBadge: string;
};

const thaksaRowTones: Record<string, ThaksaTone> = {
    borivan: {
        label: 'text-slate-700',
        row: 'bg-white hover:bg-slate-50/80',
        nameBadge: 'border-slate-200 bg-slate-100 text-slate-800 shadow-slate-200/70',
        surnameBadge: 'border-slate-200 bg-white text-slate-700 shadow-slate-200/60',
    },
    ayu: {
        label: 'text-sky-700',
        row: 'bg-sky-50/35 hover:bg-sky-50/70',
        nameBadge: 'border-sky-200 bg-sky-100 text-sky-800 shadow-sky-200/70',
        surnameBadge: 'border-sky-200 bg-white text-sky-700 shadow-sky-200/60',
    },
    dech: {
        label: 'text-amber-700',
        row: 'bg-amber-50/35 hover:bg-amber-50/70',
        nameBadge: 'border-amber-200 bg-amber-100 text-amber-900 shadow-amber-200/70',
        surnameBadge: 'border-amber-200 bg-white text-amber-800 shadow-amber-200/60',
    },
    si: {
        label: 'text-emerald-700',
        row: 'bg-emerald-50/40 hover:bg-emerald-50/75',
        nameBadge: 'border-emerald-600 bg-emerald-600 text-white shadow-emerald-200/80',
        surnameBadge: 'border-emerald-200 bg-white text-emerald-700 shadow-emerald-200/60',
    },
    mula: {
        label: 'text-indigo-700',
        row: 'bg-indigo-50/35 hover:bg-indigo-50/70',
        nameBadge: 'border-indigo-200 bg-indigo-100 text-indigo-800 shadow-indigo-200/70',
        surnameBadge: 'border-indigo-200 bg-white text-indigo-700 shadow-indigo-200/60',
    },
    ussaha: {
        label: 'text-violet-700',
        row: 'bg-violet-50/35 hover:bg-violet-50/70',
        nameBadge: 'border-violet-200 bg-violet-100 text-violet-800 shadow-violet-200/70',
        surnameBadge: 'border-violet-200 bg-white text-violet-700 shadow-violet-200/60',
    },
    montri: {
        label: 'text-cyan-700',
        row: 'bg-cyan-50/35 hover:bg-cyan-50/70',
        nameBadge: 'border-cyan-200 bg-cyan-100 text-cyan-800 shadow-cyan-200/70',
        surnameBadge: 'border-cyan-200 bg-white text-cyan-700 shadow-cyan-200/60',
    },
    kali: {
        label: 'text-rose-700',
        row: 'bg-rose-50/55 hover:bg-rose-50',
        nameBadge: 'border-rose-500 bg-rose-500 text-white shadow-rose-200/90',
        surnameBadge: 'border-rose-200 bg-white text-rose-700 shadow-rose-200/60',
    },
};

export const ThaksaTable: React.FC<ThaksaTableProps> = ({ thaksa, day }) => {
    if (!thaksaConfig[day]) return null;

    return (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.09)]">
            <div className="flex items-center gap-3 border-b border-slate-200 bg-slate-50 px-4 py-4 sm:px-6 sm:py-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm">
                    <LayoutGrid className="h-5 w-5" />
                </span>
                <div>
                    <h4 className="text-sm font-bold text-slate-900 sm:text-base">ผังทักษา ({thaksaConfig[day].name})</h4>
                    <p className="mt-0.5 text-xs font-medium text-slate-500">ตรวจอักษรในชื่อและนามสกุลตามภูมิทักษา</p>
                </div>
            </div>

            <div className="p-4 sm:p-6">
                <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="bg-[#172554] text-xs font-semibold text-white sm:text-sm">
                                <th className="w-[15%] border-b border-slate-700 px-3 py-3.5 sm:px-4">ภูมิ</th>
                                <th className="w-[45%] border-b border-slate-700 px-3 py-3.5 sm:px-4">ความหมาย</th>
                                <th className="w-[20%] border-b border-l border-slate-700 px-3 py-3.5 text-center sm:px-4">ในชื่อ</th>
                                <th className="w-[20%] border-b border-l border-slate-700 px-3 py-3.5 text-center sm:px-4">ในนามสกุล</th>
                            </tr>
                        </thead>
                        <tbody className="text-xs sm:text-sm">
                            {Object.entries(thaksaMeanings).map(([key, info]) => {
                                const matchedName = thaksa.analysis[key] ?? [];
                                const matchedSurname = thaksa.surnameAnalysis?.[key] ?? [];
                                const tone = thaksaRowTones[key] ?? thaksaRowTones.borivan;

                                return (
                                    <tr key={key} className={`border-b border-slate-200 last:border-b-0 transition-colors ${tone.row}`}>
                                        <td className="px-3 py-3.5 sm:px-4 sm:py-4">
                                            <span className={`font-bold ${tone.label}`}>{info.label}</span>
                                        </td>
                                        <td className="px-3 py-3.5 leading-relaxed text-slate-600 sm:px-4 sm:py-4">{info.desc}</td>
                                        <td className="border-l border-slate-200 px-3 py-3.5 text-center sm:px-4 sm:py-4">
                                            {matchedName.length > 0 ? (
                                                <div className="flex flex-wrap justify-center gap-1">
                                                    {matchedName.map((character, index) => (
                                                        <span key={`${character}-${index}`} className={`inline-flex h-8 w-8 items-center justify-center rounded-full border text-sm font-bold shadow-sm ${tone.nameBadge}`}>
                                                            {character}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="font-medium text-slate-400">-</span>
                                            )}
                                        </td>
                                        <td className="border-l border-slate-200 px-3 py-3.5 text-center sm:px-4 sm:py-4">
                                            {matchedSurname.length > 0 ? (
                                                <div className="flex flex-wrap justify-center gap-1">
                                                    {matchedSurname.map((character, index) => (
                                                        <span key={`${character}-${index}`} className={`inline-flex h-8 w-8 items-center justify-center rounded-full border text-sm font-bold shadow-sm ${tone.surnameBadge}`}>
                                                            {character}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="font-medium text-slate-400">-</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="mt-5 flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:mt-6 sm:gap-4">
                    {thaksa.hasKali ? (
                        <>
                            <div className="shrink-0 rounded-full border border-rose-200 bg-rose-50 p-2 text-rose-600">
                                <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6" />
                            </div>
                            <div>
                                <h5 className="mb-1 text-sm font-bold text-rose-800 sm:text-base">ข้อควรระวัง</h5>
                                <p className="text-sm leading-relaxed text-slate-600">
                                    พบอักษร <span className="font-bold text-rose-600 underline">กาลกิณี</span> ในชื่อ {thaksa.kaliChars.length} ตัว ({thaksa.kaliChars.join(', ')})
                                    {thaksa.surnameHasKali && (
                                        <> และในนามสกุล {thaksa.surnameKaliChars?.length} ตัว ({thaksa.surnameKaliChars?.join(', ')})</>
                                    )}
                                    <span className="mt-1 block text-xs text-slate-500">ถ้าเลี่ยงได้จะดีขึ้นตามความเชื่อส่วนบุคคล</span>
                                </p>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="shrink-0 rounded-full border border-emerald-200 bg-emerald-50 p-2 text-emerald-600">
                                <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6" />
                            </div>
                            <div>
                                <h5 className="mb-1 text-sm font-bold text-emerald-800 sm:text-base">มงคลดีเยี่ยม</h5>
                                <p className="text-sm leading-relaxed text-slate-600">
                                    ชื่อนี้ <span className="font-bold text-emerald-700">ไม่พบอักษรกาลกิณี</span> เลย ถือเป็นนิมิตหมายที่ดี
                                    <span className="mt-1 block text-xs text-slate-500">เป็นสัญญาณดีสำหรับการใช้งานชื่อปัจจุบัน</span>
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </section>
    );
};
