import React from 'react';
import { thaksaConfig } from '@/data/thaksaConfig';

export function MondayThaksaTable() {
    const mondayConfig = thaksaConfig?.['monday'];

    // ถ้าไม่มีข้อมูล ให้ return null เพื่อป้องกัน error
    if (!mondayConfig) return null;

    const categories = [
        {
            name: 'บริวาร',
            nameEn: 'Borivan',
            description: 'ผู้ติดตาม บริวาร ลูกน้อง ความนิยม',
            letters: mondayConfig.borivan,
            isVowel: false,
            color: 'bg-emerald-50 border-emerald-200 text-emerald-800',
            badgeColor: 'bg-emerald-100 text-emerald-800',
            icon: '👥',
        },
        {
            name: 'อายุ',
            nameEn: 'Ayu',
            description: 'สุขภาพแข็งแรง อายุยืนยาว',
            letters: mondayConfig.ayu,
            isVowel: false,
            color: 'bg-blue-50 border-blue-200 text-blue-800',
            badgeColor: 'bg-blue-100 text-blue-800',
            icon: '❤️',
        },
        {
            name: 'เดช',
            nameEn: 'Dech',
            description: 'อำนาจ บารมี ชื่อเสียง การยกย่อง',
            letters: mondayConfig.dech,
            isVowel: false,
            color: 'bg-rose-50 border-rose-200 text-rose-800',
            badgeColor: 'bg-rose-100 text-rose-800',
            icon: '👑',
        },
        {
            name: 'ศรี',
            nameEn: 'Si',
            description: 'โชคลาภ เงินทอง เสน่ห์ เมตตา',
            letters: mondayConfig.si,
            isVowel: false,
            color: 'bg-amber-50 border-amber-200 text-amber-800',
            badgeColor: 'bg-amber-100 text-amber-800',
            icon: '✨',
        },
        {
            name: 'มูละ',
            nameEn: 'Mula',
            description: 'ทรัพย์สิน มรดก ความมั่นคง ฐานะ',
            letters: mondayConfig.mula,
            isVowel: false,
            color: 'bg-purple-50 border-purple-200 text-purple-800',
            badgeColor: 'bg-purple-100 text-purple-800',
            icon: '💰',
        },
        {
            name: 'อุตสาหะ',
            nameEn: 'Ussaha',
            description: 'ความขยัน ความสำเร็จจากความพยายาม',
            letters: mondayConfig.ussaha,
            isVowel: false,
            color: 'bg-orange-50 border-orange-200 text-orange-800',
            badgeColor: 'bg-orange-100 text-orange-800',
            icon: '💪',
        },
        {
            name: 'มนตรี',
            nameEn: 'Montri',
            description: 'ผู้อุปถัมภ์ เจ้านาย ผู้ใหญ่เอ็นดู',
            letters: mondayConfig.montri,
            isVowel: false,
            color: 'bg-cyan-50 border-cyan-200 text-cyan-800',
            badgeColor: 'bg-cyan-100 text-cyan-800',
            icon: '🤝',
        },
        {
            name: 'กาลกิณี',
            nameEn: 'Kali',
            description: 'อุปสรรค โชคร้าย ปัญหา — ต้องหลีกเลี่ยง!',
            letters: mondayConfig.kali || [],
            isVowel: true,
            color: 'bg-red-50 border-red-300 text-red-800',
            badgeColor: 'bg-red-100 text-red-700',
            icon: '⛔',
        },
    ];

    return (
        <div className="mb-8 space-y-8">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm border-collapse rounded-xl overflow-hidden border border-slate-200">
                    <thead>
                        <tr className="bg-slate-800 text-white">
                            <th className="text-left px-4 py-3 font-bold border-b border-slate-700 w-1/4">ทักษา</th>
                            <th className="text-left px-4 py-3 font-bold border-b border-slate-700 w-1/3">ความหมาย</th>
                            <th className="text-left px-4 py-3 font-bold border-b border-slate-700">กลุ่มตัวอักษร</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map((cat) => (
                            <tr key={cat.name} className={`${cat.name === 'กาลกิณี' ? 'bg-red-50/50' : 'hover:bg-slate-50'} border-b border-slate-100 last:border-b-0`}>
                                <td className="px-4 py-4 align-top">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-base">{cat.icon}</span>
                                        <span className={`font-bold ${cat.name === 'กาลกิณี' ? 'text-red-700' : 'text-slate-800'}`}>
                                            {cat.name}
                                        </span>
                                    </div>
                                    <span className="text-xs font-medium text-slate-500">{cat.nameEn}</span>
                                </td>
                                <td className={`px-4 py-4 align-top ${cat.name === 'กาลกิณี' ? 'text-red-600 font-medium' : 'text-slate-600'}`}>
                                    {cat.description}
                                </td>
                                <td className="px-4 py-4 align-top">
                                    {cat.isVowel ? (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-100 text-red-700 font-bold text-xs border border-red-200">
                                            ⚠️ สระทั้งหมด + อ.อ่าง (ห้ามเป็นอักษรนำ)
                                        </span>
                                    ) : (
                                        <div className="flex flex-wrap gap-1.5">
                                            {(cat.letters || []).map((letter) => (
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
                                {(cat.letters || []).map((letter) => (
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
