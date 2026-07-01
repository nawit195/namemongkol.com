import React from 'react';
import Link from 'next/link';
import type { MondayGirlName } from '@/data/mondayGirlNames';

interface DayNameTableProps {
    names?: MondayGirlName[];
    title: string;
    description?: string;
}

export function DayNameTable({ names = [], title, description }: DayNameTableProps) {
    if (!names || names.length === 0) return null;

    return (
        <div className="mb-8">
            <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
            {description && (
                <p className="text-sm text-slate-500 mb-4">{description}</p>
            )}

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm border-collapse rounded-xl overflow-hidden border border-slate-200">
                    <thead>
                        <tr className="bg-slate-50">
                            <th className="text-left px-4 py-3 font-bold text-slate-600 border-b border-slate-200">ชื่อ</th>
                            <th className="text-left px-4 py-3 font-bold text-slate-600 border-b border-slate-200">คำอ่าน</th>
                            <th className="text-left px-4 py-3 font-bold text-slate-600 border-b border-slate-200">ความหมาย</th>
                            <th className="text-left px-4 py-3 font-bold text-slate-600 border-b border-slate-200">จุดเด่น</th>
                            <th className="text-center px-4 py-3 font-bold text-slate-600 border-b border-slate-200">หมวดทักษา</th>
                            <th className="text-center px-4 py-3 font-bold text-slate-600 border-b border-slate-200 w-[80px]"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {names.map((name, idx) => {
                            if (!name || !name.name) return null;
                            return (
                                <tr key={`desktop-${name.name}-${idx}`} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} hover:bg-amber-50/50 transition-colors border-b border-slate-100 last:border-b-0`}>
                                    <td className="px-4 py-3">
                                        <span className="font-bold text-amber-700 text-base">{name.name}</span>
                                    </td>
                                    <td className="px-4 py-3 text-slate-500">{name.reading || ''}</td>
                                    <td className="px-4 py-3 text-slate-700">{name.meaning || ''}</td>
                                    <td className="px-4 py-3">
                                        <span className="text-xs text-pink-700 bg-pink-50 px-2 py-1 rounded-md border border-pink-100">
                                            {name.highlight || ''}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                                            {name.thaksaCategory || ''}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <Link
                                            href={`/name-check?name=${encodeURIComponent(name.name || '')}`}
                                            className="text-[11px] font-medium text-amber-600 hover:text-amber-800 hover:underline whitespace-nowrap"
                                        >
                                            วิเคราะห์ →
                                        </Link>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
                {names.map((name, idx) => {
                    if (!name || !name.name) return null;
                    return (
                        <div key={`mobile-${name.name}-${idx}`} className="rounded-xl bg-white p-4 border border-slate-200 shadow-sm">
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <p className="font-bold text-amber-700 text-lg">{name.name}</p>
                                    <p className="text-xs text-slate-400">{name.reading || ''}</p>
                                </div>
                                <div className="flex gap-1.5">
                                    <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                        {name.thaksaCategory || ''}
                                    </span>
                                    <span className="text-[10px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                        ผลรวม {name.numerology || '-'}
                                    </span>
                                </div>
                            </div>
                            <p className="text-sm text-slate-700 mb-2">{name.meaning || ''}</p>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-pink-700 bg-pink-50 px-2 py-1 rounded-md border border-pink-100">
                                    {name.highlight || ''}
                                </span>
                                <Link
                                    href={`/name-check?name=${encodeURIComponent(name.name || '')}`}
                                    className="text-xs font-medium text-amber-600 hover:underline"
                                >
                                    วิเคราะห์ชื่อนี้ →
                                </Link>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
