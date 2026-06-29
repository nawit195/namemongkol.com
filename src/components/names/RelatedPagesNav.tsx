import React from 'react';
import Link from 'next/link';

export function RelatedPagesNav({ currentPath }: { currentPath: string }) {
    const links = [
        { path: '/names/girls', label: 'ตั้งชื่อลูกสาว' },
        { path: '/names/boys', label: 'ตั้งชื่อลูกชาย' },
        { path: '/names/girls/by-birthday', label: 'ชื่อลูกสาวตามวันเกิด' },
        { path: '/names/boys/by-birthday', label: 'ชื่อลูกชายตามวันเกิด' },
        { path: '/names/girls/english-names', label: 'ชื่อลูกสาว ภาษาอังกฤษ' },
        { path: '/names/boys/english-names', label: 'ชื่อลูกชาย ภาษาอังกฤษ' },
        { path: '/names/girls/nicknames', label: 'ชื่อเล่นลูกสาว' },
        { path: '/names/boys/nicknames', label: 'ชื่อเล่นลูกชาย' },
    ];

    return (
        <section className="w-full bg-white px-4 py-10 border-t border-slate-200">
            <div className="mx-auto max-w-5xl">
                <h3 className="text-lg font-bold text-[#1a1a3e] mb-6 text-center">ดูไอเดียตั้งชื่ออื่นๆ เพิ่มเติม</h3>
                <div className="flex flex-wrap justify-center gap-3">
                    {links.map((link) => {
                        const isActive = currentPath === link.path;
                        return (
                            <Link
                                key={link.path}
                                href={link.path}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                    isActive 
                                    ? 'bg-amber-100 text-amber-800 border border-amber-200 pointer-events-none' 
                                    : 'bg-[#f8f8fc] text-[#5a5a82] border border-slate-200 hover:border-amber-300 hover:text-amber-700'
                                }`}
                            >
                                {link.label}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
