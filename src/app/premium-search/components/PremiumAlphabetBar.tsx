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
        <aside aria-label="เลือกอักษรนำ" className="xl:sticky xl:top-28">
            <div className="rounded-xl border border-slate-200 bg-[oklch(0.99_0.006_80)] p-3 shadow-sm md:rounded-2xl md:border-slate-700 md:bg-[#172033] md:p-4 md:shadow-[0_10px_26px_rgba(15,23,42,0.16)]">
                <div className="mb-2 flex items-center justify-between gap-3 md:mb-3 md:px-1">
                    <div className="flex items-center gap-1.5 md:gap-2">
                        <ListFilter className="h-3.5 w-3.5 text-amber-600 md:h-4 md:w-4 md:text-amber-300" aria-hidden="true" />
                        <p className="text-xs font-bold text-slate-700 md:text-sm md:text-slate-100">เลือกอักษรนำ</p>
                    </div>
                    <span className="text-[11px] font-medium text-slate-500 md:font-mono md:text-xs md:font-semibold md:text-slate-400">{availableLetters.length} หมวด</span>
                </div>
                <div className="md:overflow-x-auto md:pb-1 xl:overflow-visible">
                    <div className="flex w-full flex-wrap gap-1 md:w-max md:flex-nowrap md:gap-2 xl:grid xl:w-full xl:grid-cols-3">
                        {availableLetters.map((letter) => {
                            const count = groupedByLetter.get(letter)?.length || 0;
                            const isSelected = selectedLetter === letter;
                            return (
                                <button
                                    key={letter}
                                    type="button"
                                    onClick={(event) => {
                                        setSelectedLetter(letter);
                                        if (window.matchMedia('(min-width: 768px)').matches) {
                                            event.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                                        }
                                    }}
                                    aria-pressed={isSelected}
                                    aria-label={`แสดงรายชื่อขึ้นต้นด้วย ${letter} (${count} ชื่อ)`}
                                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 md:h-auto md:w-auto md:min-w-14 md:flex-col md:rounded-xl md:px-2 md:py-2.5 xl:min-w-0 ${
                                        isSelected
                                            ? 'border-amber-500 bg-amber-500 text-slate-950 md:border-amber-300 md:bg-amber-300 md:text-[#172033]'
                                            : 'border-slate-200 bg-[oklch(0.995_0.002_85)] text-slate-700 hover:border-amber-400 hover:bg-amber-50 md:border-slate-700 md:bg-slate-800/70 md:text-slate-200 md:hover:border-slate-500 md:hover:bg-slate-800'
                                    }`}
                                >
                                    <span className="leading-none md:text-xl md:font-black">{letter}</span>
                                    <span aria-hidden="true" className={`hidden md:mt-1 md:block md:font-mono md:text-[10px] md:font-semibold ${isSelected ? 'text-[#5f4310]' : 'text-slate-400'}`}>{count}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </aside>
    );
}
