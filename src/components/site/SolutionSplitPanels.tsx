import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { solutionImages } from "@/data/solution-images";

type Solution = {
  slug: string;
  title: string;
  icon: string;
  desc: string;
  imageUrl?: string | null;
};

/**
 * Editorial horizontal slider inspired by the reference (Nike / TOIOMI / Sitre style).
 * - Tall portrait image cards
 * - Minimal caption under each card (serif label + index)
 * - Continuous, gentle auto-scroll that pauses on hover / drag / focus
 * - Manual prev/next controls, drag to scrub, snap on release
 */
export function SolutionSplitPanels({ solutions }: { solutions: Solution[] }) {
  const loop = [...solutions, ...solutions, ...solutions];
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [paused, setPaused] = useState(false);
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);

  const dragRef = useRef<{ active: boolean; startX: number; startLeft: number; moved: boolean }>({
    active: false,
    startX: 0,
    startLeft: 0,
    moved: false,
  });

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const third = el.scrollWidth / 3;
    el.scrollLeft = third;
  }, [solutions.length]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const speed = 28;
    const tick = (ts: number) => {
      if (lastTsRef.current == null) lastTsRef.current = ts;
      const dt = (ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;
      if (!paused && !dragRef.current.active) {
        el.scrollLeft += speed * dt;
        const third = el.scrollWidth / 3;
        if (el.scrollLeft >= third * 2) el.scrollLeft -= third;
        else if (el.scrollLeft <= 0) el.scrollLeft += third;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTsRef.current = null;
    };
  }, [paused]);

  const scrollByCards = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const step = card ? card.offsetWidth + 24 : 320;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  const onMouseDown = (e: React.MouseEvent) => {
    const el = scrollerRef.current;
    if (!el) return;
    dragRef.current = { active: true, startX: e.clientX, startLeft: el.scrollLeft, moved: false };
  };
  const onMouseMove = (e: React.MouseEvent) => {
    const el = scrollerRef.current;
    if (!el || !dragRef.current.active) return;
    const dx = e.clientX - dragRef.current.startX;
    if (Math.abs(dx) > 4) dragRef.current.moved = true;
    el.scrollLeft = dragRef.current.startLeft - dx;
  };
  const endDrag = () => {
    dragRef.current.active = false;
  };

  const onTouchStart = (e: React.TouchEvent) => {
    const el = scrollerRef.current;
    if (!el) return;
    const touch = e.touches[0];
    dragRef.current = {
      active: true,
      startX: touch.clientX,
      startLeft: el.scrollLeft,
      moved: false,
    };
    setPaused(true);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    const el = scrollerRef.current;
    if (!el || !dragRef.current.active) return;
    const touch = e.touches[0];
    const dx = touch.clientX - dragRef.current.startX;
    if (Math.abs(dx) > 4) dragRef.current.moved = true;
    el.scrollLeft = dragRef.current.startLeft - dx;
  };
  const onTouchEnd = () => {
    dragRef.current.active = false;
    setPaused(false);
  };

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (delta === 0) return;
      e.preventDefault();
      el.scrollLeft += delta;
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      scrollByCards(-1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      scrollByCards(1);
    }
  };

  return (
    <div
      className="relative -mx-4 md:-mx-6"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => {
        setPaused(false);
        endDrag();
      }}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 md:w-20 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 md:w-20 bg-gradient-to-l from-background to-transparent" />

      <div className="absolute -top-14 right-4 md:right-6 z-20 hidden md:flex items-center gap-2">
        <button
          type="button"
          onClick={() => scrollByCards(-1)}
          aria-label="ก่อนหน้า"
          className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card text-foreground hover:bg-accent hover:text-white hover:border-accent transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => scrollByCards(1)}
          aria-label="ถัดไป"
          className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card text-foreground hover:bg-accent hover:text-white hover:border-accent transition-colors"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div
        ref={scrollerRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={endDrag}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onKeyDown={onKeyDown}
        tabIndex={0}
        className="no-scrollbar flex gap-5 md:gap-6 overflow-x-auto scroll-smooth px-4 md:px-6 pb-4 cursor-grab active:cursor-grabbing select-none touch-pan-x"
        style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
      >
        {loop.map((s, i) => {
          const img = s.imageUrl || solutionImages[s.slug];
          const num = String((i % solutions.length) + 1).padStart(2, "0");
          return (
            <Link
              key={`${s.slug}-${i}`}
              to={`/${s.slug}` as any}
              data-card
              draggable={false}
              onClick={(e) => {
                if (dragRef.current.moved) e.preventDefault();
              }}
              className="group relative w-[64vw] max-w-[420px] shrink-0 sm:w-[44vw] md:w-[32vw] lg:w-[26vw] xl:w-[22vw]"
            >
              <div className="relative aspect-[4/5] sm:aspect-[3/4] overflow-hidden rounded-2xl sm:rounded-sm bg-muted">
                {img && (
                  <img
                    src={img}
                    alt={s.title}
                    loading="lazy"
                    draggable={false}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.04]"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="absolute bottom-4 right-4 grid h-10 w-10 place-items-center rounded-full bg-white/95 text-navy translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                  <ArrowUpRight className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                    {num} — Solution
                  </div>
                  <div className="mt-1 text-base md:text-lg font-semibold text-foreground tracking-tight truncate group-hover:text-accent transition-colors">
                    {s.title}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-2 flex md:hidden items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => scrollByCards(-1)}
          aria-label="ก่อนหน้า"
          className="grid h-11 w-11 place-items-center rounded-full border border-border bg-card text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => scrollByCards(1)}
          aria-label="ถัดไป"
          className="grid h-11 w-11 place-items-center rounded-full border border-border bg-card text-foreground"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
