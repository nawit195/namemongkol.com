import React from 'react';
import { thaksaConfig, VOWELS } from '@/data/thaksaConfig';

const mondayConfig = thaksaConfig['monday'];

const categories = [
    {
        name: 'บริวาร',
        nameEn: 'Borivan',
        description: 'ผู้ติดตาม บริวาร ลูกน้อง ความนิยม',
        letters: mondayConfig.borivan,
        color: 'bg-blue-50 border-blue-200 text-blue-800',
        badgeColor: 'bg-blue-100 text-blue-700',
        icon: '👥',
    },
    {
        name: 'อายุ',
        nameEn: 'Ayu',
        description: 'อายุยืน สุขภาพแข็งแรง ความยั่งยืน',
        letters: mondayConfig.ayu,
        color: 'bg-emerald-50 border-emerald-200 text-emerald-800',
        badgeColor: 'bg-emerald-100 text-emerald-700',
        icon: '🌿',
    },
    {
        name: 'เดช',
        nameEn: 'Dech',
        description: 'อำนาจบารมี ความเป็นผู้นำ ความน่าเกรงขาม',
        letters: mondayConfig.dech,
        color: 'bg-amber-50 border-amber-200 text-amber-800',
        badgeColor: 'bg-amber-100 text-amber-700',
        icon: '⚡',
    },
    {
        name: 'ศรี',
        nameEn: 'Si',
        description: 'เสน่ห์ สง่าราศี ความสวยงาม เมตตามหานิยม',
        letters: mondayConfig.si,
        color: 'bg-pink-50 border-pink-200 text-pink-800',
        badgeColor: 'bg-pink-100 text-pink-700',
        icon: '✨',
    },
    {
        name: 'มูละ',
        nameEn: 'Mula',
        description: 'ทรัพย์สมบัติ มรดก ความมั่งคั่ง โชคลาภ',
        letters: mondayConfig.mula,
        color: 'bg-yellow-50 border-yellow-200 text-yellow-800',
        badgeColor: 'bg-yellow-100 text-yellow-700',
        icon: '💎',
    },
    {
        name: 'อุตสาหะ',
        nameEn: 'Ussaha',
        description: 'ความขยัน ความพยายาม ความมุ่งมั่น',
        letters: mondayConfig.ussaha,
        color: 'bg-orange-50 border-orange-200 text-orange-800',
        badgeColor: 'bg-orange-100 text-orange-700',
        icon: '💪',
    },
    {
        name: 'มนตรี',
        nameEn: 'Montri',
        description: 'ที่ปรึกษา ผู้ช่วยเหลือ คนอุปถัมภ์ค้ำจุน',
        letters: mondayConfig.montri,
        color: 'bg-indigo-50 border-indigo-200 text-indigo-800',
        badgeColor: 'bg-indigo-100 text-indigo-700',
        icon: '🤝',
    },
    {
        name: 'กาลกิณี',
        nameEn: 'Kali',
        description: 'อุปสรรค โชคร้าย ปัญหา — ต้องหลีกเลี่ยง!',
        letters: null,
        isVowel: true,
        color: 'bg-red-50 border-red-300 text-red-800',
        badgeColor: 'bg-red-100 text-red-700',
        icon: '⛔',
    },
];

export function MondayThaksaTable() {
    return (
        <div className="space-y-3">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                    <thead>
                        <tr className="bg-slate-50">
                            <th className="text-left px-4 py-3 font-bold text-slate-600 border-b border-slate-200 w-[140px]">หมวดทักษา</th>
                            <th className="text-left px-4 py-3 font-bold text-slate-600 border-b border-slate-200 w-[260px]">พลังที่เสริม</th>
                            <th className="text-left px-4 py-3 font-bold text-slate-600 border-b border-slate-200">อักษรในหมวด</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map((cat) => (
                            <tr key={cat.name} className={`${cat.name === 'กาลกิณี' ? 'bg-red-50/50' : 'hover:bg-slate-50'} border-b border-slate-100 last:border-b-0`}>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">{cat.icon}</span>
                                        <div>
                                            <p className="font-bold text-slate-800">{cat.name}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-slate-600">{cat.description}</td>
                                <td className="px-4 py-3">
                                    {cat.isVowel ? (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-100 text-red-700 font-bold text-xs border border-red-200">
                                            ⚠️ สระทั้งหมด + อ.อ่าง (ห้ามเป็นอักษรนำ)
                                        </span>
                                    ) : (
                                        <div className="flex flex-wrap gap-1.5">
                                            {cat.letters!.map((letter) => (
                                                <span key={letter} className={`inline-flex items-center justify-center w-8 h-8 rounded-lg ${cat.badgeColor} font-bold text-sm border border-current/10`}>
                                                    {letter}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
                {categories.map((cat) => (
                    <div key={cat.name} className={`rounded-xl p-4 border ${cat.color}`}>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">{cat.icon}</span>
                            <span className="font-bold">{cat.name}</span>
                        </div>
                        <p className="text-xs mb-3 opacity-80">{cat.description}</p>
                        {cat.isVowel ? (
                            <p className="text-xs font-bold bg-red-100 px-2.5 py-1.5 rounded-lg border border-red-200 text-red-700 inline-block">
                                ⚠️ สระทั้งหมด + อ.อ่าง
                            </p>
                        ) : (
                            <div className="flex flex-wrap gap-1.5">
                                {cat.letters!.map((letter) => (
                                    <span key={letter} className={`inline-flex items-center justify-center w-7 h-7 rounded-lg ${cat.badgeColor} font-bold text-xs`}>
                                        {letter}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Tip Box */}
            <div className="mt-6 rounded-xl bg-amber-50 border border-amber-200 p-5">
                <p className="text-sm font-bold text-amber-800 mb-2">💡 เคล็ดลับ: อักษรนำที่แนะนำสำหรับลูกสาวเกิดวันจันทร์</p>
                <ul className="text-sm text-amber-700 space-y-1.5">
                    <li>• <strong>เสริมเสน่ห์เมตตา (ศรี):</strong> เลือกอักษรนำจากหมวด ด, ต, ถ, ท, ธ, น</li>
                    <li>• <strong>เสริมโชคลาภ (มูละ):</strong> เลือกอักษรนำจากหมวด บ, ป, ผ, ฝ, พ, ฟ, ภ, ม</li>
                    <li>• <strong>เสริมบารมี (เดช):</strong> เลือกอักษรนำจากหมวด ฎ, ฏ, ฐ, ฑ, ฒ, ณ</li>
                </ul>
            </div>
        </div>
    );
}
