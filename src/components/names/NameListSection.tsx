'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { CuratedName } from '@/data/girlNamesCurated';
import { DayKey } from '@/types';
import { Search } from 'lucide-react';

interface NameListSectionProps {
    names: CuratedName[];
    genderLabel: string;
}

const THAI_CONSONANTS = [
    'ก', 'ข', 'ค', 'จ', 'ช', 'ณ', 'ด', 'ต', 'ถ', 'ท', 'ธ', 'น', 
    'บ', 'ป', 'ผ', 'พ', 'ภ', 'ม', 'ย', 'ร', 'ล', 'ว', 'ศ', 'ส', 'อ'
];

const DAYS: { key: DayKey | 'all', label: string }[] = [
    { key: 'all', label: 'ทุกวันเกิด' },
    { key: 'sunday', label: 'วันอาทิตย์' },
    { key: 'monday', label: 'วันจันทร์' },
    { key: 'tuesday', label: 'วันอังคาร' },
    { key: 'wednesday', label: 'วันพุธ (กลางวัน)' },
    { key: 'wednesday_night', label: 'วันพุธ (กลางคืน)' },
    { key: 'thursday', label: 'วันพฤหัสบดี' },
    { key: 'friday', label: 'วันศุกร์' },
    { key: 'saturday', label: 'วันเสาร์' },
];

export function NameListSection({ names, genderLabel }: NameListSectionProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLetter, setSelectedLetter] = useState<string>('all');
    const [selectedDay, setSelectedDay] = useState<DayKey | 'all'>('all');

    const filteredNames = useMemo(() => {
        return names.filter(name => {
            const matchSearch = name.name.includes(searchTerm) || name.meaning.includes(searchTerm);
            const matchLetter = selectedLetter === 'all' || name.letterGroup === selectedLetter;
            const matchDay = selectedDay === 'all' || name.suitableDays.includes(selectedDay as DayKey);
            return matchSearch && matchLetter && matchDay;
        });
    }, [names, searchTerm, selectedLetter, selectedDay]);

    return (
        <section className="w-full bg-[#f8f8fc] px-4 py-8">
            <div className="mx-auto max-w-5xl">
                
                {/* Filters */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm mb-8">
                    <h2 className="text-xl font-bold text-[#1a1a3e] mb-4">ค้นหาชื่อ{genderLabel}</h2>
                    
                    <div className="grid gap-4 md:grid-cols-3">
                        {/* Search input */}
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <Search className="h-4 w-4 text-slate-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm placeholder:text-slate-400 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                                placeholder="ค้นหาด้วยชื่อ หรือ ความหมาย..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Day Filter */}
                        <select
                            className="block w-full rounded-xl border border-slate-200 py-2.5 px-3 text-sm focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                            value={selectedDay}
                            onChange={(e) => setSelectedDay(e.target.value as DayKey | 'all')}
                        >
                            {DAYS.map(day => (
                                <option key={day.key} value={day.key}>{day.label}</option>
                            ))}
                        </select>
                        
                        {/* Letter Filter (Mobile fallback) */}
                        <select
                            className="block w-full rounded-xl border border-slate-200 py-2.5 px-3 text-sm md:hidden focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                            value={selectedLetter}
                            onChange={(e) => setSelectedLetter(e.target.value)}
                        >
                            <option value="all">ทุกหมวดอักษร</option>
                            {THAI_CONSONANTS.map(letter => (
                                <option key={letter} value={letter}>หมวด {letter}</option>
                            ))}
                        </select>
                    </div>

                    {/* Letter Filter (Desktop chips) */}
                    <div className="mt-4 hidden md:flex flex-wrap gap-2">
                        <button
                            onClick={() => setSelectedLetter('all')}
                            className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                                selectedLetter === 'all' 
                                ? 'bg-amber-100 border-amber-300 text-amber-800 font-medium' 
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                        >
                            ทั้งหมด
                        </button>
                        {THAI_CONSONANTS.map(letter => (
                            <button
                                key={letter}
                                onClick={() => setSelectedLetter(letter)}
                                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                                    selectedLetter === letter 
                                    ? 'bg-amber-100 border-amber-300 text-amber-800 font-medium' 
                                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                                }`}
                            >
                                {letter}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Results Count */}
                <p className="text-sm font-medium text-slate-500 mb-4">
                    พบ {filteredNames.length} ชื่อ
                </p>

                {/* Name Grid */}
                {filteredNames.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredNames.map((name, idx) => (
                            <div key={`${name.name}-${idx}`} className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-amber-300 hover:shadow-md">
                                <div>
                                    <div className="flex items-start justify-between">
                                        <h3 className="text-xl font-bold text-amber-600">{name.name}</h3>
                                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500">
                                            {name.numerology}
                                        </span>
                                    </div>
                                    <p className="mt-2 text-sm leading-6 text-slate-600">{name.meaning}</p>
                                </div>
                                <div className="mt-4 pt-4 border-t border-slate-100">
                                    <Link 
                                        href={`/name-check?name=${encodeURIComponent(name.name)}`}
                                        className="block w-full rounded-xl bg-slate-900 px-4 py-2 text-center text-sm font-bold text-white transition-colors hover:bg-slate-800"
                                    >
                                        วิเคราะห์ชื่อนี้
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
                        <p className="text-slate-500">ไม่พบรายชื่อที่ตรงกับเงื่อนไขการค้นหา</p>
                        <button 
                            onClick={() => { setSearchTerm(''); setSelectedDay('all'); setSelectedLetter('all'); }}
                            className="mt-4 text-amber-600 font-medium hover:underline"
                        >
                            ล้างการค้นหา
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
}
