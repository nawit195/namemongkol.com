/**
 * Meta (Facebook) Pixel utility helpers.
 *
 * All functions include a safety guard:
 *   if (typeof window !== "undefined" && typeof window.fbq === "function")
 * so the app never crashes when:
 *   - Rendered server-side (SSR via TanStack Start)
 *   - The script is blocked by an ad-blocker
 *   - The script hasn't loaded yet
 */

/**
 * Hardcoded fallback Pixel ID — used when neither runtime settings
 * nor the META_PIXEL_ID environment variable are configured.
 */
export const DEFAULT_META_PIXEL_ID = "1578638136531199";

/** Returns true when window.fbq is available and callable. */
export function isFbqReady(): boolean {
  return typeof window !== "undefined" && typeof window.fbq === "function";
}

/**
 * Fire a standard PageView event.
 * Called automatically on every route change by `usePageTracking`.
 */
export function fbqPageView(): void {
  if (isFbqReady()) {
    window.fbq("track", "PageView");
  }
}

/**
 * Fire any Meta Pixel Standard Event.
 *
 * @example
 * fbqTrack("Lead");
 * fbqTrack("ViewContent", { content_name: "LED Display" });
 */
export function fbqTrack(
  event: string,
  params?: Record<string, string | number | boolean | undefined>,
): void {
  if (isFbqReady()) {
    window.fbq("track", event, params);
  }
}

/**
 * Fire a custom Meta Pixel event.
 *
 * @example
 * fbqTrackCustom("ContactFormOpen");
 */
export function fbqTrackCustom(
  event: string,
  params?: Record<string, string | number | boolean | undefined>,
): void {
  if (isFbqReady()) {
    window.fbq("trackCustom", event, params);
  }
}
