import { afterEach, describe, expect, it, vi } from 'vitest';
import { scheduleNameSuggestions } from './nameSuggestionSearch';

describe('autocomplete request lifecycle', () => {
  afterEach(() => vi.useRealTimers());
  it('debounces for 250ms and cancels a search before it starts', async () => {
    vi.useFakeTimers();
    const request = vi.fn<typeof fetch>();
    const receive = vi.fn();
    const cancel = scheduleNameSuggestions('ธน', receive, request);
    await vi.advanceTimersByTimeAsync(249);
    expect(request).not.toHaveBeenCalled();
    cancel();
    await vi.advanceTimersByTimeAsync(1);
    expect(request).not.toHaveBeenCalled();
    expect(receive).not.toHaveBeenCalled();
  });
  it('ignores late responses from an old query even when fetch ignores abort', async () => {
    vi.useFakeTimers();
    let finishOld!: (response: Response) => void;
    const request = vi.fn<typeof fetch>()
      .mockImplementationOnce(() => new Promise(resolve => { finishOld = resolve; }))
      .mockResolvedValueOnce(Response.json({ success: true, data: [{ name: 'กานต์' }] }));
    const receive = vi.fn();
    const cancel = scheduleNameSuggestions('ธน', receive, request);
    await vi.advanceTimersByTimeAsync(250);
    const signal = request.mock.calls[0][1]?.signal;
    cancel();
    const cancelNew = scheduleNameSuggestions('กาน', receive, request);
    await vi.advanceTimersByTimeAsync(250);
    finishOld(Response.json({ success: true, data: [{ name: 'ธนกร' }] }));
    await vi.advanceTimersByTimeAsync(0);
    expect(signal?.aborted).toBe(true);
    expect(receive.mock.calls.map(([state]) => state)).toEqual([
      { query: 'ธน', status: 'loading', data: [] },
      { query: 'กาน', status: 'loading', data: [] },
      { query: 'กาน', status: 'ready', data: [{ name: 'กานต์' }] },
    ]);
    cancelNew();
  });
  it('reports errors and empty results without changing manual text', async () => {
    vi.useFakeTimers();
    const receive = vi.fn();
    const request = vi.fn<typeof fetch>().mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(Response.json({ success: true, data: [] }));
    const cancel = scheduleNameSuggestions('ธน', receive, request);
    await vi.advanceTimersByTimeAsync(250);
    expect(receive).toHaveBeenLastCalledWith({ query: 'ธน', status: 'error', data: [] });
    cancel();
    const cancelNew = scheduleNameSuggestions('ไม่พบชื่อ', receive, request);
    await vi.advanceTimersByTimeAsync(250);
    expect(receive).toHaveBeenLastCalledWith({ query: 'ไม่พบชื่อ', status: 'ready', data: [] });
    cancelNew();
  });
});
