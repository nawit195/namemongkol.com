import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ViewMap = Record<string, number>;

export const articleViewsQuery = {
  queryKey: ["article-views"] as const,
  queryFn: async (): Promise<ViewMap> => {
    const { data, error } = await supabase.from("article_views").select("slug, views");
    if (error) return {};
    const map: ViewMap = {};
    for (const row of data ?? []) map[row.slug as string] = Number(row.views) || 0;
    return map;
  },
  staleTime: 60_000,
};

export function useArticleViews() {
  return useQuery(articleViewsQuery);
}

const STORAGE_KEY = "matrix-viewed-articles";

function hasViewed(slug: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    const set = new Set<string>(raw ? JSON.parse(raw) : []);
    return set.has(slug);
  } catch {
    return false;
  }
}

function markViewed(slug: string) {
  if (typeof window === "undefined") return;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    const set = new Set<string>(raw ? JSON.parse(raw) : []);
    set.add(slug);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
  } catch {
    /* ignore */
  }
}

export async function incrementArticleView(slug: string): Promise<boolean> {
  if (hasViewed(slug)) return false;
  markViewed(slug);
  try {
    await supabase.rpc("increment_article_view", { _slug: slug });
    return true;
  } catch {
    return false;
  }
}

export function formatViews(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}
