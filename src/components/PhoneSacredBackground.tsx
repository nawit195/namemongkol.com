'use client';

import React from 'react';


// ─── Asset config ───────────────────────────────────────────────────────────
// Drop the generated background image at:
//   public/images/phone-analysis/sacred-bg.webp  (or .jpg / .png)
// Then set ASSET_PATH to the path below and SHOW_ASSET to true.
// When SHOW_ASSET is false, the CSS/SVG procedural background renders instead.
// ─────────────────────────────────────────────────────────────────────────────
const SHOW_ASSET = false;
const ASSET_PATH = '/images/phone-analysis/sacred-bg.webp';

export const PhoneSacredBackground = () => {
    return (
        <div className="pointer-events-none fixed inset-0 overflow-hidden z-0" aria-hidden="true">
            <div className="absolute inset-0 bg-[#f8f8fc]" />
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(201,147,58,0.08),transparent_28%),linear-gradient(180deg,#ffffff_0%,#f8f8fc_38%,#f3f3f9_100%)]" />
            <div className="absolute inset-0 opacity-[0.045] [background-image:linear-gradient(#1a1a3e_1px,transparent_1px),linear-gradient(90deg,#1a1a3e_1px,transparent_1px)] [background-size:44px_44px]" />
        </div>
    );
};
