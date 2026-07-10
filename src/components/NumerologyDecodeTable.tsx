'use client';

import React, { useMemo, useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp, Hash } from 'lucide-react';
import { charValues } from '@/data/numerology';
import { getCharValue } from '@/data/numerologyLookup';

interface NumerologyDecodeTableProps {
    name: string;
    surname: string;
    nameScore: number;
    surnameScore: number;
    totalScore: number;
}

interface CharEntry {
    char: string;
    value: number;
}

interface ValueTone {
    chip: string;
    value: string;
    reference: string;
    referenceHeader: string;
}

const VALUE_TONES: Record<number, ValueTone> = {
    1: { chip: 'border-rose-400/35 bg-rose-400/10', value: 'text-rose-200', reference: 'border-rose-400/30 bg-rose-400/[0.08]', referenceHeader: 'border-rose-400/30 bg-rose-400/15 text-rose-100' },
    2: { chip: 'border-orange-400/35 bg-orange-400/10', value: 'text-orange-200', reference: 'border-orange-400/30 bg-orange-400/[0.08]', referenceHeader: 'border-orange-400/30 bg-orange-400/15 text-orange-100' },
    3: { chip: 'border-amber-400/35 bg-amber-400/10', value: 'text-amber-200', reference: 'border-amber-400/30 bg-amber-400/[0.08]', referenceHeader: 'border-amber-400/30 bg-amber-400/15 text-amber-100' },
    4: { chip: 'border-yellow-300/35 bg-yellow-300/10', value: 'text-yellow-100', reference: 'border-yellow-300/30 bg-yellow-300/[0.08]', referenceHeader: 'border-yellow-300/30 bg-yellow-300/15 text-yellow-100' },
    5: { chip: 'border-lime-400/35 bg-lime-400/10', value: 'text-lime-200', reference: 'border-lime-400/30 bg-lime-400/[0.08]', referenceHeader: 'border-lime-400/30 bg-lime-400/15 text-lime-100' },
    6: { chip: 'border-emerald-400/35 bg-emerald-400/10', value: 'text-emerald-200', reference: 'border-emerald-400/30 bg-emerald-400/[0.08]', referenceHeader: 'border-emerald-400/30 bg-emerald-400/15 text-emerald-100' },
    7: { chip: 'border-teal-400/35 bg-teal-400/10', value: 'text-teal-200', reference: 'border-teal-400/30 bg-teal-400/[0.08]', referenceHeader: 'border-teal-400/30 bg-teal-400/15 text-teal-100' },
    8: { chip: 'border-cyan-400/35 bg-cyan-400/10', value: 'text-cyan-200', reference: 'border-cyan-400/30 bg-cyan-400/[0.08]', referenceHeader: 'border-cyan-400/30 bg-cyan-400/15 text-cyan-100' },
    9: { chip: 'border-violet-400/35 bg-violet-400/10', value: 'text-violet-200', reference: 'border-violet-400/30 bg-violet-400/[0.08]', referenceHeader: 'border-violet-400/30 bg-violet-400/15 text-violet-100' },
};

function parseChars(text: string): CharEntry[] {
    const result: CharEntry[] = [];
    for (const char of text) {
        const value = getCharValue(char);
        if (value !== undefined) result.push({ char, value });
    }
    return result;
}

function getTone(value: number): ValueTone {
    return VALUE_TONES[value] ?? {
        chip: 'border-slate-500/35 bg-slate-500/10',
        value: 'text-slate-200',
        reference: 'border-slate-500/30 bg-slate-500/[0.08]',
        referenceHeader: 'border-slate-500/30 bg-slate-500/15 text-slate-100',
    };
}

function CharRow({ label, chars, score }: { label: string; chars: CharEntry[]; score: number }) {
    if (chars.length === 0) return null;

    return (
        <div className="grid gap-2 border-b border-slate-700/70 py-3 last:border-b-0 sm:grid-cols-[8.5rem_minmax(0,1fr)_4rem] sm:items-center sm:gap-4">
            <p className="truncate text-xs font-semibold text-slate-300" title={label}>{label}</p>
            <div className="flex flex-wrap items-center gap-1.5">
                {chars.map((entry, index) => {
                    const tone = getTone(entry.value);
                    return (
                        <React.Fragment key={`${entry.char}-${index}`}>
                            <span className={`inline-flex min-w-10 items-center justify-center gap-1 rounded-lg border px-2 py-1 text-sm font-bold ${tone.chip}`}>
                                <span className="text-slate-50">{entry.char}</span>
                                <span className={`font-mono text-xs ${tone.value}`}>{entry.value}</span>
                            </span>
                            {index < chars.length - 1 && <span className="text-xs text-slate-600" aria-hidden="true">+</span>}
                        </React.Fragment>
                    );
                })}
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-600/70 bg-slate-800/70 px-2.5 py-1.5 sm:block sm:text-center">
                <span className="text-[10px] font-semibold text-slate-400 sm:block">ผลรวม</span>
                <span className="font-mono text-base font-bold text-slate-50">{score}</span>
            </div>
        </div>
    );
}

function NumerologyReferenceGrid() {
    const groupedChars = useMemo(() => {
        const groups: Record<number, string[]> = {};
        for (const [character, value] of Object.entries(charValues)) {
            (groups[value] ??= []).push(character);
        }
        return groups;
    }, []);

    return (
        <div className="mt-3 border-t border-slate-700/70 pt-3">
            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-400">
                <BookOpen className="h-3.5 w-3.5 text-amber-300" />
                ตารางค่าอักษรอ้างอิง
            </div>
            <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-5 lg:grid-cols-9">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => {
                    const tone = getTone(number);
                    const chars = groupedChars[number] ?? [];
                    return (
                        <div key={number} className={`overflow-hidden rounded-lg border ${tone.reference}`}>
                            <div className={`border-b px-2 py-1 text-center font-mono text-sm font-black ${tone.referenceHeader}`}>
                                {number}
                            </div>
                            <p className={`min-h-10 px-1.5 py-1.5 text-center text-xs font-semibold leading-5 ${tone.value}`}>
                                {chars.join(' ')}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export const NumerologyDecodeTable: React.FC<NumerologyDecodeTableProps> = ({
    name,
    surname,
    nameScore,
    surnameScore,
    totalScore,
}) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [showReference, setShowReference] = useState(false);
    const nameChars = useMemo(() => parseChars(name.replace(/\s/g, '')), [name]);
    const surnameChars = useMemo(() => parseChars(surname.replace(/\s/g, '')), [surname]);
    const hasSurname = surnameChars.length > 0;

    if (nameChars.length === 0 && surnameChars.length === 0) return null;

    return (
        <section className="overflow-hidden rounded-2xl border border-slate-700 bg-[#172033] shadow-[0_10px_26px_rgba(15,23,42,0.18)]">
            <button
                type="button"
                onClick={() => setIsExpanded((previous) => !previous)}
                aria-expanded={isExpanded}
                className="flex w-full items-center justify-between gap-3 border-b border-slate-700/90 px-4 py-3.5 text-left transition-colors hover:bg-slate-800/60 sm:px-5"
            >
                <span className="flex min-w-0 items-center gap-2.5">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-amber-400/30 bg-amber-400/10">
                        <Hash className="h-4 w-4 text-amber-300" />
                    </span>
                    <span className="min-w-0">
                        <span className="block text-sm font-bold text-slate-50">ถอดรหัสเลขศาสตร์</span>
                        <span className="block text-xs text-slate-400">ค่าอักษรและผลรวมชื่อ{hasSurname ? '-นามสกุล' : ''}</span>
                    </span>
                </span>
                <span className="flex shrink-0 items-center gap-2">
                    <span className="rounded-md border border-amber-400/30 bg-amber-400/10 px-2 py-1 font-mono text-sm font-bold text-amber-200">{totalScore}</span>
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                </span>
            </button>

            {isExpanded ? (
                <div className="px-4 py-1 sm:px-5">
                    <CharRow label={`ชื่อจริง: ${name}`} chars={nameChars} score={nameScore} />
                    {hasSurname ? <CharRow label={`นามสกุล: ${surname}`} chars={surnameChars} score={surnameScore} /> : null}

                    {hasSurname ? (
                        <div className="flex items-center justify-between gap-3 py-3">
                            <span className="text-xs font-medium text-slate-400">ผลรวมชื่อ-นามสกุล</span>
                            <span className="font-mono text-sm text-slate-300">{nameScore} + {surnameScore} = <strong className="rounded-md border border-amber-400/35 bg-amber-400/10 px-2 py-1 text-base text-amber-200">{totalScore}</strong></span>
                        </div>
                    ) : null}

                    <button
                        type="button"
                        onClick={() => setShowReference((previous) => !previous)}
                        aria-expanded={showReference}
                        className="flex w-full items-center justify-between gap-3 border-t border-slate-700/70 py-3 text-left text-xs font-semibold text-slate-300 transition-colors hover:text-amber-200"
                    >
                        <span>ตารางค่าตัวอักษร 1-9</span>
                        {showReference ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </button>
                    {showReference ? <NumerologyReferenceGrid /> : null}
                </div>
            ) : null}
        </section>
    );
};
