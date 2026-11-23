import type { PremiumResult } from '@/utils/premiumAnalysisUtils';
import { ChevronDown } from 'lucide-react';

export function PremiumAnalysisNameDetails({ result }: { result: Pick<PremiumResult, 'englishName' | 'pronunciation' | 'pronunciationStatus' | 'meaning' | 'meaningStatus'> }) {
    return <div className="space-y-2 text-sm leading-6 text-slate-300">
        <p><span className="sr-only">คำอ่าน: </span>{result.pronunciation || 'ยังไม่มีข้อมูลคำอ่าน'}</p>
        <p className="break-words text-slate-100"><span className="sr-only">ความหมาย: </span>{result.meaning || 'ยังไม่มีข้อมูลความหมาย'}</p>
        {result.englishName ? <details className="group">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 text-xs text-slate-300 [&::-webkit-details-marker]:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300">
                <span>ชื่ออังกฤษ: <span lang="en" className="break-all">{result.englishName}</span></span>
                <ChevronDown size={14} className="shrink-0 group-open:rotate-180" aria-hidden="true" />
            </summary>
            <p className="pb-2 text-xs leading-5 text-slate-300">ตัวเลือกการสะกดตามต้นทาง ควรยืนยันก่อนใช้ในเอกสาร</p>
        </details> : <p className="text-xs text-slate-400">ชื่ออังกฤษ: ยังไม่มีข้อมูล</p>}
    </div>;
}
