import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { PhoneCall, FilePlus2, Facebook, Youtube, Music2 } from "lucide-react";
import { cn } from "@/lib/utils";

// LINE brand glyph (not in lucide)
const LineIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
  </svg>
);

const iconBtn =
  "group grid h-10 w-10 place-items-center rounded-full bg-white/8 ring-1 ring-white/15 text-white/85 active:scale-[0.92] active:bg-white/15 transition-all shrink-0 sm:h-11 sm:w-11";

const socialIconBtn =
  "group hidden h-9 w-9 place-items-center rounded-full bg-white/7 ring-1 ring-white/12 text-white/80 active:scale-[0.92] active:bg-white/15 transition-all shrink-0 min-[360px]:grid sm:h-10 sm:w-10";

export function MobileCTABar() {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    lastY.current = window.scrollY;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const dy = y - lastY.current;
        if (y < 80) {
          setHidden(false);
        } else if (dy > 6) {
          setHidden(true);
        } else if (dy < -6) {
          setHidden(false);
        }
        lastY.current = y;
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={cn(
        "xl:hidden fixed bottom-0 inset-x-0 z-40 will-change-transform transform-gpu",
        "transition-[transform,opacity] duration-[450ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]",
        "motion-reduce:transition-none",
        hidden ? "translate-y-full opacity-0" : "translate-y-0 opacity-100",
      )}
      style={{ paddingBottom: "env(safe-area-inset-bottom)", backfaceVisibility: "hidden" }}
    >
      <div className="relative border-t border-white/10 bg-navy/95 backdrop-blur-2xl shadow-[0_-12px_40px_-12px_rgba(0,0,0,0.5)]">
        <div className="pointer-events-none absolute -top-px inset-x-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" />
        <div className="flex items-center gap-1 px-2 py-1.5 sm:py-2">
          {/* Primary contact actions */}
          <a href="tel:021296193" aria-label="โทร" className={iconBtn}>
            <PhoneCall className="h-[15px] w-[15px] sm:h-[16px] sm:w-[16px]" strokeWidth={2.25} />
          </a>
          <a
            href="https://lin.ee/hMrlrvH"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LINE"
            className={cn(iconBtn, "hover:text-[#06C755]")}
          >
            <LineIcon className="h-[15px] w-[15px] text-[#06C755] sm:h-[16px] sm:w-[16px]" />
          </a>

          {/* Divider */}
          <span className="mx-0.5 hidden h-6 w-px bg-white/10 min-[360px]:block" />

          {/* Socials */}
          <a
            href="https://www.facebook.com/MatrixIntertrade"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className={socialIconBtn}
          >
            <Facebook className="h-[13.5px] w-[13.5px] text-[#1877F2] sm:h-[15px] sm:w-[15px]" />
          </a>
          <a
            href="https://www.tiktok.com/@matrixintertrade"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="TikTok"
            className={socialIconBtn}
          >
            <Music2 className="h-[13.5px] w-[13.5px] sm:h-[15px] sm:w-[15px]" />
          </a>
          <a
            href="https://www.youtube.com/@matrixintertrade"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="YouTube"
            className={socialIconBtn}
          >
            <Youtube className="h-[13.5px] w-[13.5px] text-[#FF0000] sm:h-[15px] sm:w-[15px]" />
          </a>

          {/* Primary CTA — fills remaining space */}
          <Link
            to="/contactus"
            className="relative ml-auto inline-flex h-10 min-w-0 flex-1 items-center justify-center gap-1.5 overflow-hidden rounded-full bg-gradient-accent px-2 text-[10.5px] font-bold text-white shadow-glow transition-all active:scale-[0.97] sm:h-11 sm:px-3.5 sm:text-[12px]"
          >
            <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white/0 to-white/15 opacity-80" />
            <FilePlus2
              className="relative h-[14px] w-[14px] sm:h-[15px] sm:w-[15px]"
              strokeWidth={2.4}
            />
            <span className="relative truncate tracking-wide">ขอใบเสนอราคา</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
