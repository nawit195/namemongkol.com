import type { PremiumResult } from '@/utils/premiumAnalysisUtils';

export function PremiumAnalysisNameDetails({ result }: { result: Pick<PremiumResult, 'englishName' | 'pronunciation' | 'pronunciationStatus' | 'meaning' | 'meaningStatus'> }) {
    const pending = [result.pronunciationStatus, result.meaningStatus].some(status => status === 'pending' || status === 'draft');
    return <div className="mb-6 space-y-3 text-sm leading-7 text-slate-300">
        {pending ? <p className="text-xs text-amber-300">ข้อมูลเบื้องต้น · รอตรวจสอบ</p> : null}
        <dl className="space-y-3">
            <div><dt className="font-semibold text-slate-200">ชื่อภาษาอังกฤษ</dt><dd lang="en" className="break-words">{result.englishName || '—'}</dd><dd className="text-xs leading-5 text-slate-400">{result.englishName ? 'ตัวเลือกการสะกดตามต้นทาง ควรยืนยันก่อนใช้ในเอกสาร' : 'ยังไม่มีข้อมูล'}</dd></div>
            <div><dt className="font-semibold text-slate-200">คำอ่าน</dt><dd>{result.pronunciation || 'ยังไม่มีข้อมูลคำอ่าน'}</dd></div>
            <div><dt className="font-semibold text-slate-200">ความหมาย</dt><dd>{result.meaning || 'ยังไม่มีข้อมูลความหมาย'}</dd></div>
        </dl>
    </div>;
}
