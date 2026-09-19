import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { resolveIcon } from "@/lib/icon-map";
import { solutionImages } from "@/data/solution-images";
import { useLanguage, t } from "@/components/i18n/LanguageProvider";

// Stable display index per slug (01, 02, …)
const ORDER: Record<string, string> = {
  "led-display": "01",
  "interactive-display": "02",
  projector: "03",
  "wireless-presentation": "04",
  "av-solutions": "05",
};

export function SolutionCard({
  slug,
  title,
  titleEn,
  icon,
  desc,
  descEn,
  imageUrl,
}: {
  slug: string;
  title: string;
  titleEn?: string;
  icon: string;
  desc: string;
  descEn?: string;
  imageUrl?: string | null;
}) {
  const { lang } = useLanguage();
  const Icon = resolveIcon(icon);
  const img = imageUrl || solutionImages[slug];
  const index = ORDER[slug] ?? "•";

  return (
    <Link
      to={`/${slug}` as any}
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-card transition-all duration-500 hover:-translate-y-1 hover:border-accent/40 hover:shadow-elev"
    >
      {/* Visual area */}
      <div className="relative aspect-[4/3] overflow-hidden bg-navy">
        {img && (
          <img
            src={img}
            alt={`${title} solution`}
            loading="lazy"
            width={1280}
            height={960}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
          />
        )}

        {/* Layered scrim for legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/55 to-navy/5" />
        <div className="absolute inset-0 bg-gradient-to-br from-accent/15 via-transparent to-cyan/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        {/* Top row: index + icon */}
        <div className="absolute inset-x-5 top-5 flex items-start justify-between">
          <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-white backdrop-blur-md ring-1 ring-white/20">
            <span className="text-cyan">{index}</span>
            <span className="h-3 w-px bg-white/30" />
            <span>Solution</span>
          </div>
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-white/15 text-white ring-1 ring-white/25 backdrop-blur-md transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110">
            <Icon className="h-5 w-5" />
          </div>
        </div>

        {/* Title — anchored, never overflows */}
        <div className="absolute inset-x-5 bottom-5">
          <h3 className="text-balance text-2xl font-extrabold leading-tight tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.55)] sm:text-[26px]">
            {t(lang, title, titleEn || title)}
          </h3>
          <div className="mt-2 h-[3px] w-10 rounded-full bg-gradient-accent transition-all duration-500 group-hover:w-20" />
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-6">
        <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {t(lang, desc, descEn || desc)}
        </p>
        <div className="mt-auto pt-5">
          <span className="inline-flex items-center gap-1.5 text-sm font-bold text-accent">
            {t(lang, "ดูรายละเอียด", "View Details")}
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>

      {/* Bottom accent bar */}
      <span className="pointer-events-none absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 bg-gradient-accent transition-transform duration-500 group-hover:scale-x-100" />
    </Link>
  );
}
