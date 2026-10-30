import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
const { fetchAllPublicNames } = vi.hoisted(() => ({ fetchAllPublicNames: vi.fn() }));
vi.mock('@/lib/publicNames', () => ({ fetchAllPublicNames }));
import { GET } from './route';

const request = (q: string) => new NextRequest(`https://example.test/api/public/name-suggestions?${new URLSearchParams({ q })}`);
describe('suggestions endpoint', () => {
  beforeEach(() => vi.resetAllMocks());
  it('does not load the catalog for short or oversized queries', async () => {
    expect(await (await GET(request('ธ'))).json()).toEqual({ success: true, data: [] });
    expect((await GET(request('ธ'.repeat(101)))).status).toBe(400);
    expect(fetchAllPublicNames).not.toHaveBeenCalled();
  });
  it('uses the existing publication-filtered catalog and strips internal fields', async () => {
    fetchAllPublicNames.mockResolvedValue([{ name: 'ธนกร', grade: 'A+', gender: 'male', meaning: 'ทรัพย์', meaningStatus: 'approved' }]);
    const response = await GET(request('ธน'));
    expect(await response.json()).toEqual({ success: true, data: [{ name: 'ธนกร', meaning: 'ทรัพย์', meaningStatus: 'approved' }] });
    expect(response.headers.get('Cache-Control')).toContain('s-maxage=600');
  });
  it('returns a recoverable failure when the catalog is unavailable', async () => {
    fetchAllPublicNames.mockRejectedValue(new Error('offline'));
    const response = await GET(request('ธน'));
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ success: false, data: [] });
  });
});
