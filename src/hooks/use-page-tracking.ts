import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { fbqPageView } from "@/lib/meta-pixel";

/**
 * Automatically fires `fbq('track', 'PageView')` on every client-side
 * route navigation using TanStack Router.
 *
 * The initial PageView on hard load is already handled by the base code
 * script injected in __root.tsx. This hook covers subsequent SPA navigations.
 *
 * Usage: call once inside RootComponent in __root.tsx.
 */
export function usePageTracking(): void {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  useEffect(() => {
    fbqPageView();
  }, [pathname]);
}
