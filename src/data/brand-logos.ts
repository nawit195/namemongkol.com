// Keep this map for admin-provided/local logo URLs only. Remote favicon services
// can emit noisy 404s in DevTools when a partner domain has no favicon.
export const brandLogos: Record<string, string> = {};

// Brand-specific accent gradient used for monogram fallback (always renders).
export const brandAccent: Record<string, { from: string; to: string }> = {
  unilumin: { from: "#0ea5e9", to: "#2563eb" }, // sky → blue
  kramerav: { from: "#1e3a8a", to: "#4f46e5" }, // navy → indigo
  grandview: { from: "#64748b", to: "#0f172a" }, // slate → near-black
  persona: { from: "#06b6d4", to: "#0d9488" }, // cyan → teal
  transcreen: { from: "#38bdf8", to: "#2563eb" }, // sky → blue
};
