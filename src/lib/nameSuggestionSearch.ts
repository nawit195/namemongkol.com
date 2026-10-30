import type { NameSuggestion } from '@/lib/nameSuggestions';

export type SuggestionSearchState = {
  query: string;
  data: NameSuggestion[];
  status: 'loading' | 'ready' | 'error';
};

/** One effect lifetime: debounce, fetch, and discard every response after cleanup. */
export function scheduleNameSuggestions(
  query: string,
  receive: (state: SuggestionSearchState) => void,
  request: typeof fetch = fetch,
): () => void {
  const controller = new AbortController();
  const timer = setTimeout(async () => {
    receive({ query, data: [], status: 'loading' });
    try {
      const response = await request(`/api/public/name-suggestions?${new URLSearchParams({ q: query })}`, { signal: controller.signal });
      const payload = await response.json();
      if (!response.ok || !payload.success || !Array.isArray(payload.data)) throw new Error('Search failed');
      if (!controller.signal.aborted) receive({ query, data: payload.data, status: 'ready' });
    } catch {
      if (!controller.signal.aborted) receive({ query, data: [], status: 'error' });
    }
  }, 250);
  return () => { clearTimeout(timer); controller.abort(); };
}
