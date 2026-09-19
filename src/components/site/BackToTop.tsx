import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 480);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <button
      aria-label="กลับขึ้นด้านบน"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={cn(
        "fixed bottom-[4.75rem] right-3 z-40 grid h-10 w-10 place-items-center rounded-full bg-gradient-accent text-white shadow-[0_8px_20px_-10px_rgba(0,173,238,0.9)] transition-all duration-500 btn-press sm:bottom-20 sm:right-4 sm:h-12 sm:w-12 sm:shadow-glow xl:bottom-6",
        show
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-3 pointer-events-none",
      )}
    >
      <ArrowUp className="h-4 w-4 sm:h-5 sm:w-5" />
    </button>
  );
}
