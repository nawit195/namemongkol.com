'use client';

import Link from 'next/link';
import { ChevronRight, Crown, Sparkles } from 'lucide-react';
import { savePremiumSurnamePrefill } from '@/utils/premiumAnalysisPrefill';

interface SurnameNameRecommendationCTAProps {
  surname: string;
}

export function SurnameNameRecommendationCTA({
  surname,
}: SurnameNameRecommendationCTAProps) {
  const normalizedSurname = surname.trim().replace(/\s+/g, ' ');

  const handleNavigate = () => {
    savePremiumSurnamePrefill(window.sessionStorage, normalizedSurname);
  };

  return (
    <section
      aria-labelledby="surname-recommendation-title"
      className="relative overflow-hidden rounded-2xl border border-amber-400/45 bg-[#0f172a] px-5 py-6 text-slate-100 shadow-[0_12px_36px_rgba(15,23,42,0.16)] sm:px-6 sm:py-7"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(201,147,58,0.18),transparent_34%),radial-gradient(circle_at_92%_100%,rgba(155,142,196,0.14),transparent_36%)]" />

      <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-6">
        <div className="flex min-w-0 flex-1 items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-amber-300/40 bg-amber-400/12 text-amber-300 shadow-[0_0_24px_rgba(201,147,58,0.15)]">
            <Sparkles aria-hidden="true" className="h-6 w-6" />
          </div>

          <div className="min-w-0">
            <p className="mb-2 inline-flex items-center gap-1.5 text-xs font-bold tracking-[0.08em] text-amber-300">
              <Crown aria-hidden="true" className="h-3.5 w-3.5" />
              คำแนะนำเฉพาะนามสกุล
            </p>
            <h2
              id="surname-recommendation-title"
              className="break-words text-lg font-bold leading-7 text-slate-50 sm:text-xl"
            >
              ค้นหาชื่อมงคลที่เข้ากับนามสกุล “{normalizedSurname}”
            </h2>
            <p className="mt-2 max-w-[65ch] text-sm font-medium leading-6 tracking-[0.01em] text-slate-300">
              คัดชื่อจากวันเกิด เวลาเกิด และเป้าหมายชีวิต พร้อมตรวจความสัมพันธ์กับนามสกุล
            </p>
            <p className="mt-2 text-xs leading-5 text-slate-400">
              สำหรับสมาชิก VVIP • ระบบจะแจ้งเครดิตก่อนเริ่มวิเคราะห์
            </p>
          </div>
        </div>

        <Link
          prefetch={false}
          href="/premium-analysis"
          onClick={handleNavigate}
          data-track="name_result.premium_analysis.click"
          className="group inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-amber-200/70 bg-[#c9933a] px-5 py-3 text-sm font-bold text-[#211506] shadow-[0_0_22px_rgba(201,147,58,0.24)] outline-none transition-[transform,background-color,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:bg-[#d4a54e] hover:shadow-[0_8px_28px_rgba(201,147,58,0.28)] focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f172a] active:translate-y-0 sm:w-auto"
        >
          แนะนำชื่อที่เข้ากับนามสกุล
          <ChevronRight
            aria-hidden="true"
            className="h-4 w-4 transition-transform duration-200 ease-out group-hover:translate-x-0.5"
          />
        </Link>
      </div>
    </section>
  );
}
