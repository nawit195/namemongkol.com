'use client';

import React from 'react';
import { ListFilter } from 'lucide-react';
import type { PremiumNameData } from '@/utils/premiumDataParser';

interface PremiumAlphabetBarProps {
    availableLetters: string[];
    selectedLetter: string | null;
    setSelectedLetter: (letter: string) => void;
    groupedByLetter: Map<string, PremiumNameData[]>;
}

export default function PremiumAlphabetBar({ availableLetters, selectedLetter, setSelectedLetter, groupedByLetter }: PremiumAlphabetBarProps) {
    if (availableLetters.length === 0) return null;

    return (
        <aside className="xl:sticky xl:top-28">
            <div className="rounded-2xl border border-slate-700 bg-[#172033] p-3 shadow-[0_10px_26px_rgba(15,23,42,0.16)] sm:p-4">
                <div className="mb-3 flex items-center justify-between gap-3 px-1">
                    <div className="flex items-center gap-2">
                        <ListFilter className="h-4 w-4 text-amber-300" />
                        <p className="text-sm font-bold text-slate-100">เลือกอักษรนำ</p>
                    </div>
                    <span className="font-mono text-xs font-semibold text-slate-400">{availableLetters.length} หมวด</span>
                </div>
                <div className="overflow-x-auto pb-1 xl:overflow-visible">
                    <div className="flex w-max gap-2 xl:grid xl:w-full xl:grid-cols-3">
                        {availableLetters.map((letter) => {
                            const count = groupedByLetter.get(letter)?.length || 0;
                            const isSelected = selectedLetter === letter;
                            return (
                                <button
                                    key={letter}
                                    type="button"
                                    onClick={(event) => {
                                        setSelectedLetter(letter);
                                        event.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                                    }}
                                    aria-pressed={isSelected}
                                    className={`flex min-w-14 flex-col items-center justify-center rounded-xl border px-2 py-2.5 transition-colors xl:min-w-0 ${
                                        isSelected
                                            ? 'border-amber-300 bg-amber-300 text-[#172033]'
                                            : 'border-slate-700 bg-slate-800/70 text-slate-200 hover:border-slate-500 hover:bg-slate-800'
                                    }`}
                                >
                                    <span className="text-xl font-black leading-none">{letter}</span>
                                    <span className={`mt-1 font-mono text-[10px] font-semibold ${isSelected ? 'text-[#5f4310]' : 'text-slate-400'}`}>{count}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </aside>
    );
}
