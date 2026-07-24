'use client';

import React from 'react';
import Link from 'next/link';
import { Lock, ShieldCheck, FileText } from 'lucide-react';

export const PrivacyStrip = () => {
    return (
        <div className="w-full max-w-lg mt-3 animate-fade-in">
            <div className="flex items-center justify-center gap-3 sm:gap-5 flex-wrap text-[10px] sm:text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                    <Lock className="w-3 h-3 text-emerald-400/70" />
                    ไม่แสดงชื่อสาธารณะ
                </span>
                <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400/70" />
                    เข้ารหัส SSL
                </span>
                <Link prefetch={false} href="/privacy" className="flex items-center gap-1 hover:text-slate-300 transition-colors">
                    <FileText className="w-3 h-3 text-emerald-400/70" />
                    นโยบายความเป็นส่วนตัว
                </Link>
            </div>
        </div>
    );
};
