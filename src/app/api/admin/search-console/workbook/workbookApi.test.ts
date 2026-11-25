import { beforeEach, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ status: 0, read: vi.fn() }));
vi.mock('@/lib/searchConsoleServer', () => ({
    gscAdmin: async () => mocks.status ? { response: Response.json({ success: false }, { status: mocks.status }) } : { user: { id: 'admin' }, service: {} },
    gscResponse: (body: unknown, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'private, no-store' } }),
}));
vi.mock('@/lib/searchConsoleWorkbook', () => ({ readGscWorkbook: mocks.read }));
import { POST } from './route';
const url = 'https://www.namemongkol.com/api/admin/search-console/workbook';
beforeEach(() => { mocks.status = 0; mocks.read.mockReset(); });
it('checks origin and admin access before parsing any file', async () => {
    for (const status of [401, 403]) {
        mocks.status = status;
        expect((await POST(new Request(url, { method: 'POST', body: 'xlsx' }))).status).toBe(status);
    }
    mocks.status = 0;
    expect((await POST(new Request(url, { method: 'POST', headers: { origin: 'https://other.example' }, body: 'xlsx' }))).status).toBe(403);
    expect(mocks.read).not.toHaveBeenCalled();
});
it('caps actual streamed bytes even without a Content-Length header', async () => {
    expect((await POST(new Request(url, { method: 'POST', body: new Uint8Array(3 * 1024 * 1024 + 1) }))).status).toBe(413);
    expect(mocks.read).not.toHaveBeenCalled();
});
it('returns a private no-write conversion and a clear invalid-file response', async () => {
    mocks.read.mockResolvedValueOnce({ files: [], sheets: [] });
    const response = await POST(new Request(url, { method: 'POST', body: 'xlsx' }));
    expect(response.headers.get('Cache-Control')).toBe('private, no-store');
    expect((await response.json()).success).toBe(true);
    mocks.read.mockRejectedValueOnce(new Error('ไฟล์ไม่ถูกต้อง'));
    expect((await POST(new Request(url, { method: 'POST', body: 'xlsx' }))).status).toBe(400);
});
