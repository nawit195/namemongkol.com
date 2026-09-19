"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.brandAccent = exports.brandLogos = void 0;
// Official brand logos via Google favicon service — reliable and CORS-friendly.
exports.brandLogos = {
    unilumin: "https://www.google.com/s2/favicons?domain=unilumin.com&sz=128",
    kramerav: "https://www.google.com/s2/favicons?domain=kramerav.com&sz=128",
    grandview: "https://www.google.com/s2/favicons?domain=grandviewscreen.com&sz=128",
    persona: "https://www.google.com/s2/favicons?domain=personadisplays.com&sz=128",
    transcreen: "https://www.google.com/s2/favicons?domain=transcreen.com&sz=128",
};
// Brand-specific accent gradient used for monogram fallback (always renders).
exports.brandAccent = {
    unilumin: { from: "#0ea5e9", to: "#2563eb" }, // sky → blue
    kramerav: { from: "#1e3a8a", to: "#4f46e5" }, // navy → indigo
    grandview: { from: "#64748b", to: "#0f172a" }, // slate → near-black
    persona: { from: "#06b6d4", to: "#0d9488" }, // cyan → teal
    transcreen: { from: "#38bdf8", to: "#2563eb" }, // sky → blue
};
