'use client';

import { MessageCircle } from 'lucide-react';

export const LineOAButton = () => {
    return (
        <a
            href="https://lin.ee/4kpiVlu"
            target="_blank"
            rel="noopener noreferrer"
            className="group mx-2 mt-4 flex items-center justify-between rounded-2xl border border-[#06C755]/25 bg-white px-3.5 py-3 shadow-sm transition-all duration-200 hover:border-[#06C755]/45 hover:bg-[#f3fff7] focus:outline-none focus:ring-2 focus:ring-[#06C755]/35 focus:ring-offset-2 focus:ring-offset-white"
        >
            <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#06C755]/15 transition-transform group-hover:scale-105">
                    <MessageCircle className="h-5 w-5 text-[#06C755]" fill="currentColor" />
                </div>
                <div className="flex min-w-0 flex-col">
                    <span className="text-sm font-extrabold leading-5 text-[#1a1a3e]">LINE Official</span>
                    <span className="text-xs font-semibold leading-5 text-[#4f5778] transition-colors group-hover:text-[#087d39]">
                        สอบถาม / วิเคราะห์แบบส่วนตัว
                    </span>
                </div>
            </div>

            <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#06C755] shadow-[0_0_8px_#06C755]" />
        </a>
    );
};
