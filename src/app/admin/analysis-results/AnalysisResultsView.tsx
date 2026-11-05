import Link from 'next/link';
import { ChevronLeft, ChevronRight, Download, RefreshCw, Search } from 'lucide-react';
import { ANALYSIS_NAMES_MAX_SEARCH_LENGTH, ANALYSIS_NAMES_PAGE_SIZE, type AnalysisNamesResult } from '@/lib/adminAnalysisResults';

export type AnalysisResultsViewProps = {
    data: AnalysisNamesResult | null;
    search: string;
    page: number;
    loading: boolean;
    error: string | null;
    accessDenied: 'unauthorized' | 'forbidden' | null;
    exporting: boolean;
    exportError: string | null;
    onSearchChange: (value: string) => void;
    onRefresh: () => void;
    onPageChange: (page: number) => void;
    onExport: () => void;
};

export function AnalysisResultsView(props: AnalysisResultsViewProps) {
    const { data, search, page, loading, error, accessDenied, exporting, exportError } = props;
    const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / ANALYSIS_NAMES_PAGE_SIZE));
    const first = data?.names.length ? (page - 1) * ANALYSIS_NAMES_PAGE_SIZE + 1 : 0;
    const last = data?.names.length ? first + data.names.length - 1 : 0;

    return (
        <div className="space-y-6 p-4 pt-20 text-slate-200 sm:p-6 sm:pt-20 lg:p-8">
            <header className="flex flex-wrap items-start justify-between gap-5">
                <div className="max-w-2xl">
                    <h1 className="text-2xl font-bold leading-snug text-slate-100 md:text-3xl">รายชื่อที่เคยวิเคราะห์</h1>
                    <p className="mt-2 text-sm leading-7 text-slate-400">รวมชื่อจริงที่เคยบันทึกผลวิเคราะห์ แสดงชื่อเดียวต่อหนึ่งรายการ เพื่อค้นหาและนำรายชื่อไปใช้งานต่อ</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button type="button" onClick={props.onRefresh} disabled={loading} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-700 disabled:cursor-wait disabled:opacity-50">
                        <RefreshCw size={17} aria-hidden="true" className={loading ? 'animate-spin' : ''} />รีเฟรช
                    </button>
                    <button type="button" onClick={props.onExport} disabled={loading || exporting || !data?.total} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-emerald-400 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50">
                        <Download size={17} aria-hidden="true" />{exporting ? 'กำลังเตรียม CSV…' : 'ดาวน์โหลด CSV'}
                    </button>
                </div>
            </header>

            <section aria-label="ค้นหารายชื่อ" className="rounded-2xl border border-slate-700 bg-slate-900 p-5 sm:p-6">
                <div className="flex flex-wrap items-end justify-between gap-5">
                    <div className="w-full sm:max-w-md">
                        <label htmlFor="analysis-names-search" className="mb-2 block text-sm font-semibold text-slate-200">ค้นหาชื่อ</label>
                        <div className="relative">
                            <Search size={18} aria-hidden="true" className="pointer-events-none absolute left-3 top-3.5 text-slate-400" />
                            <input id="analysis-names-search" type="search" value={search} maxLength={ANALYSIS_NAMES_MAX_SEARCH_LENGTH} onChange={(event) => props.onSearchChange(event.target.value)} placeholder="พิมพ์ชื่อหรือส่วนหนึ่งของชื่อ" className="min-h-11 w-full rounded-xl border border-slate-600 bg-slate-950 py-2.5 pl-10 pr-3 text-sm text-slate-100 placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400" />
                        </div>
                    </div>
                    <p className="text-sm text-slate-400" aria-live="polite">{search.trim() ? 'ชื่อไม่ซ้ำที่ตรงคำค้น' : 'ชื่อไม่ซ้ำทั้งหมด'} <strong className="ml-2 text-2xl font-bold tabular-nums text-emerald-300">{data ? data.total.toLocaleString('th-TH') : '—'}</strong> ชื่อ</p>
                </div>
                <p className="mt-4 text-xs leading-6 text-slate-400">CSV รวมชื่อทั้งหมดที่ตรงคำค้น ไม่จำกัดเฉพาะหน้านี้ และมีเฉพาะชื่อจริง</p>
            </section>

            {exportError && <p role="alert" className="rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-sm leading-7 text-red-200">{exportError}</p>}
            {error ? (
                <section role="alert" className="rounded-2xl border border-red-400/30 bg-red-400/10 p-6">
                    <h2 className="font-bold text-red-200">{accessDenied ? 'ไม่สามารถเข้าถึงรายชื่อได้' : 'โหลดรายชื่อไม่สำเร็จ'}</h2>
                    <p className="mt-2 text-sm leading-7 text-red-100">{error}</p>
                    {accessDenied === 'unauthorized' ? <Link href="/login?redirect=%2Fadmin%2Fanalysis-results" className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-slate-800 px-4 py-2 text-sm font-bold text-slate-100">เข้าสู่ระบบ</Link>
                        : accessDenied === 'forbidden' ? <Link href="/" className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold underline underline-offset-4">กลับหน้าหลัก</Link>
                            : <button type="button" onClick={props.onRefresh} className="mt-4 min-h-11 rounded-xl bg-slate-800 px-4 py-2 text-sm font-bold text-slate-100 hover:bg-slate-700">ลองใหม่</button>}
                </section>
            ) : (
                <section aria-label="รายชื่อไม่ซ้ำ" aria-busy={loading} className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-900">
                    <table className="w-full table-fixed text-left text-sm">
                        <caption className="sr-only">รายชื่อจริงไม่ซ้ำที่เคยวิเคราะห์ หน้าละ 50 ชื่อ</caption>
                        <thead className="border-b border-slate-700 bg-slate-800 text-slate-300"><tr><th scope="col" className="w-20 px-4 py-4 sm:w-28 sm:px-6">ลำดับ</th><th scope="col" className="px-4 py-4 sm:px-6">ชื่อ</th></tr></thead>
                        <tbody className="divide-y divide-slate-800">
                            {loading ? <tr><td colSpan={2} role="status" className="px-6 py-16 text-center text-slate-400">กำลังโหลดรายชื่อ…</td></tr>
                                : !data?.names.length ? <tr><td colSpan={2} className="px-6 py-16 text-center leading-7 text-slate-400">{search.trim() ? 'ไม่พบชื่อที่ตรงกับคำค้น ลองค้นหาด้วยคำอื่น' : 'ยังไม่มีรายชื่อที่เคยบันทึกผลวิเคราะห์'}</td></tr>
                                    : data.names.map((name, index) => <tr key={name} className="hover:bg-slate-800/50"><td className="px-4 py-4 tabular-nums text-slate-400 sm:px-6">{(first + index).toLocaleString('th-TH')}</td><td className="whitespace-pre-wrap break-all px-4 py-4 font-medium text-slate-100 sm:px-6">{name}</td></tr>)}
                        </tbody>
                    </table>
                    <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-700 px-4 py-4 sm:px-6">
                        <p className="text-xs leading-6 text-slate-400">{loading ? 'กำลังอ่านข้อมูลล่าสุด' : `แสดง ${first.toLocaleString('th-TH')}–${last.toLocaleString('th-TH')} จาก ${(data?.total ?? 0).toLocaleString('th-TH')} ชื่อ`}</p>
                        <div className="flex items-center gap-3">
                            <button type="button" aria-label="หน้าก่อนหน้า" onClick={() => props.onPageChange(page - 1)} disabled={loading || page <= 1} className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-600 hover:bg-slate-800 disabled:opacity-40"><ChevronLeft size={18} aria-hidden="true" /></button>
                            <span className="text-xs tabular-nums text-slate-300">หน้า {page.toLocaleString('th-TH')} / {totalPages.toLocaleString('th-TH')}</span>
                            <button type="button" aria-label="หน้าถัดไป" onClick={() => props.onPageChange(page + 1)} disabled={loading || page >= totalPages} className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-600 hover:bg-slate-800 disabled:opacity-40"><ChevronRight size={18} aria-hidden="true" /></button>
                        </div>
                    </footer>
                </section>
            )}
        </div>
    );
}
