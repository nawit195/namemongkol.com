import { GSC_MAX_BYTES } from '@/lib/searchConsole';
import { gscAdmin, gscResponse } from '@/lib/searchConsoleServer';
import { readGscWorkbook } from '@/lib/searchConsoleWorkbook';

export const runtime = 'nodejs';
export async function POST(request: Request) {
    const origin = request.headers.get('origin');
    if ((origin && origin !== new URL(request.url).origin) || request.headers.get('sec-fetch-site') === 'cross-site') return gscResponse({ success: false, error: 'ไม่อนุญาตคำขอข้ามเว็บไซต์' }, 403);
    try {
        const auth = await gscAdmin();
        if (auth.response) return auth.response;
        if (!request.body) return gscResponse({ success: false, error: 'กรุณาเลือกไฟล์ XLSX' }, 400);
        const reader = request.body.getReader();
        const chunks: Uint8Array[] = [];
        let size = 0;
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            size += value.length;
            if (size > GSC_MAX_BYTES) { await reader.cancel(); return gscResponse({ success: false, error: 'ไฟล์ XLSX ต้องไม่เกิน 3 MiB' }, 413); }
            chunks.push(value);
        }
        try {
            return gscResponse({ success: true, workbook: await readGscWorkbook(Buffer.concat(chunks)) });
        } catch (failure) {
            return gscResponse({ success: false, error: failure instanceof Error ? failure.message : 'อ่าน XLSX ไม่สำเร็จ' }, 400);
        }
    } catch { return gscResponse({ success: false, error: 'อ่านไฟล์ไม่สำเร็จ กรุณาลองใหม่' }, 503); }
}
