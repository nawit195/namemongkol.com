'use client';

import { useEffect, useRef, useState } from 'react';
import {
    ANALYSIS_NAMES_PAGE_SIZE, analysisNamesDownloadFilename, parseAnalysisNamesTableResult,
    type AnalysisNamesTableResult,
} from '@/lib/adminAnalysisResults';
import { AnalysisResultsView } from './AnalysisResultsView';

const API = '/api/admin/analysis-results';

async function responseError(response: Response): Promise<string> {
    if (response.status === 401) return 'กรุณาเข้าสู่ระบบเพื่อดูรายชื่อ';
    if (response.status === 403) return 'หน้านี้สำหรับผู้ดูแลระบบเท่านั้น';
    try {
        const body: unknown = await response.json();
        if (body && typeof body === 'object' && 'error' in body && typeof body.error === 'string') return body.error;
    } catch { /* Use the friendly status message below. */ }
    return 'ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่';
}

export default function AdminAnalysisResultsPage() {
    const [searchInput, setSearchInput] = useState('');
    const [query, setQuery] = useState({ search: '', page: 1 });
    const [refreshVersion, setRefreshVersion] = useState(0);
    const [data, setData] = useState<AnalysisNamesTableResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [accessDenied, setAccessDenied] = useState<'unauthorized' | 'forbidden' | null>(null);
    const [exporting, setExporting] = useState(false);
    const [exportError, setExportError] = useState<string | null>(null);
    const exportController = useRef<AbortController | null>(null);
    const pendingSearch = searchInput.trim() !== query.search;

    useEffect(() => {
        const timer = setTimeout(() => {
            const search = searchInput.trim();
            setQuery((previous) => previous.search === search ? previous : { search, page: 1 });
        }, 300);
        return () => clearTimeout(timer);
    }, [searchInput]);

    useEffect(() => {
        const controller = new AbortController();
        async function loadNames() {
            setLoading(true);
            setError(null);
            setAccessDenied(null);
            setExportError(null);
            setData(null);
            try {
                const params = new URLSearchParams({ search: query.search, page: String(query.page) });
                const response = await fetch(`${API}?${params}`, { cache: 'no-store', signal: controller.signal });
                if (!response.ok) {
                    const message = await responseError(response);
                    if (controller.signal.aborted) return;
                    setAccessDenied(response.status === 401 ? 'unauthorized' : response.status === 403 ? 'forbidden' : null);
                    setError(message);
                    return;
                }
                const result = parseAnalysisNamesTableResult(await response.json());
                if (controller.signal.aborted) return;
                if (!result) throw new Error('Invalid names response');
                const lastPage = Math.max(1, Math.ceil(result.total / ANALYSIS_NAMES_PAGE_SIZE));
                if (query.page > lastPage) {
                    setQuery((previous) => ({ ...previous, page: lastPage }));
                    return;
                }
                setData(result);
            } catch {
                if (!controller.signal.aborted) setError('โหลดรายชื่อไม่สำเร็จ กรุณาตรวจสอบการเชื่อมต่อแล้วลองใหม่');
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        }
        void loadNames();
        return () => controller.abort();
    }, [query.page, query.search, refreshVersion]);

    useEffect(() => () => exportController.current?.abort(), []);

    async function downloadCsv() {
        if (loading || pendingSearch || exporting || !data?.total) return;
        const controller = new AbortController();
        exportController.current = controller;
        setExporting(true);
        setExportError(null);
        try {
            const params = new URLSearchParams({ search: query.search, format: 'csv' });
            const response = await fetch(`${API}?${params}`, { cache: 'no-store', signal: controller.signal });
            if (!response.ok) throw new Error(await responseError(response));
            if (!response.headers.get('Content-Type')?.startsWith('text/csv')) throw new Error('ข้อมูลส่งออกไม่ถูกต้อง กรุณาลองใหม่');
            const blob = await response.blob();
            if (controller.signal.aborted) return;
            const downloadUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = response.headers.get('Content-Disposition')?.match(/filename="([^"]+)"/i)?.[1] ?? analysisNamesDownloadFilename();
            document.body.appendChild(link);
            link.click();
            link.remove();
            setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
        } catch (failure) {
            if (!controller.signal.aborted) setExportError(failure instanceof Error ? failure.message : 'ดาวน์โหลด CSV ไม่สำเร็จ กรุณาลองใหม่');
        } finally {
            if (!controller.signal.aborted) setExporting(false);
        }
    }

    return <AnalysisResultsView
        data={pendingSearch ? null : data} search={searchInput} page={query.page} loading={loading || pendingSearch}
        error={pendingSearch ? null : error} accessDenied={accessDenied}
        exporting={exporting} exportError={exportError}
        onSearchChange={setSearchInput} onRefresh={() => setRefreshVersion((previous) => previous + 1)}
        onPageChange={(page) => setQuery((previous) => ({ ...previous, page }))}
        onExport={() => void downloadCsv()}
    />;
}
