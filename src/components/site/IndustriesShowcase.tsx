import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { resolveIcon } from "@/lib/icon-map";
import { industries } from "@/data/site";
import { Reveal } from "@/components/site/Reveal";
import { useLanguage, t } from "@/components/i18n/LanguageProvider";
import type { SiteShowcaseSection } from "@/lib/content/site";
import imgEducation from "@/assets/article-smart-classroom.jpg";
import imgHotel from "@/assets/hero-av.jpg";
import imgCorporate from "@/assets/article-meeting-room.jpg";
import imgGovernment from "@/assets/hero-led.jpg";
import imgHospital from "@/assets/hero-interactive.jpg";
import imgVideo from "@/assets/hero-wireless.jpg";

const industryImages: Record<string, string> = {
  education: imgEducation,
  hotel: imgHotel,
  corporate: imgCorporate,
  government: imgGovernment,
  hospital: imgHospital,
  "video-conference": imgVideo,
};

const metaTH: Record<string, { tag: string; metric: string; metricLabel: string }> = {
  education: { tag: "Smart Classroom", metric: "120+", metricLabel: "ห้องเรียน" },
  hotel: { tag: "Ballroom & MICE", metric: "60+", metricLabel: "โรงแรม" },
  corporate: { tag: "Hybrid Meeting", metric: "200+", metricLabel: "องค์กร" },
  government: { tag: "Public Sector", metric: "40+", metricLabel: "หน่วยงาน" },
  hospital: { tag: "Healthcare", metric: "25+", metricLabel: "โรงพยาบาล" },
  "video-conference": { tag: "Video Conference", metric: "300+", metricLabel: "ห้องประชุม" },
};
const metaEN: Record<string, { tag: string; metric: string; metricLabel: string }> = {
  education: { tag: "Smart Classroom", metric: "120+", metricLabel: "Classrooms" },
  hotel: { tag: "Ballroom & MICE", metric: "60+", metricLabel: "Hotels" },
  corporate: { tag: "Hybrid Meeting", metric: "200+", metricLabel: "Enterprises" },
  government: { tag: "Public Sector", metric: "40+", metricLabel: "Agencies" },
  hospital: { tag: "Healthcare", metric: "25+", metricLabel: "Hospitals" },
  "video-conference": { tag: "Video Conference", metric: "300+", metricLabel: "Meeting Rooms" },
};

type Industry = (typeof industries)[number] & {
  showOnBrands?: boolean;
  sortOrder?: number | null;
  cardTagTh?: string | null;
  cardTagEn?: string | null;
  metricValue?: string | null;
  metricLabelTh?: string | null;
  metricLabelEn?: string | null;
  imageUrl?: string | null;
  showcaseImageUrl?: string | null;
  linkUrl?: string | null;
};

const fallbackSection: SiteShowcaseSection = {
  eyebrowTh: "กลุ่มลูกค้าและการใช้งาน",
  eyebrowEn: "Industry Use Cases",
  titlePrefixTh: "ออกแบบ",
  titlePrefixEn: "Designed ",
  titleHighlightTh: "เพื่อทุกประเภทองค์กร",
  titleHighlightEn: "for every kind of organization",
  descriptionPrefixTh: "ประสบการณ์จริงจากการติดตั้งกว่า ",
  descriptionPrefixEn: "Real-world experience from over ",
  descriptionHighlightTh: "500+ โปรเจ็ค",
  descriptionHighlightEn: "500+ projects",
  descriptionSuffixTh: " ครอบคลุมทุกอุตสาหกรรม",
  descriptionSuffixEn: " across every industry",
  isEnabled: true,
};

const fallbackSortOrder: Record<string, number> = {
  education: 10,
  hotel: 20,
  corporate: 30,
  government: 40,
  hospital: 50,
  "video-conference": 60,
};

function sortOrderFor(industry: Industry, index: number) {
  return industry.sortOrder ?? fallbackSortOrder[industry.slug] ?? (index + 1) * 10;
}

function cardMetaFor(
  industry: Industry,
  lang: "TH" | "EN",
  fallback: { tag: string; metric: string; metricLabel: string },
) {
  return {
    tag: lang === "EN" ? industry.cardTagEn || fallback.tag : industry.cardTagTh || fallback.tag,
    metric: industry.metricValue || fallback.metric,
    metricLabel:
      lang === "EN"
        ? industry.metricLabelEn || fallback.metricLabel
        : industry.metricLabelTh || fallback.metricLabel,
  };
}

function IndustryCardLink({
  href,
  ariaLabel,
  className,
  children,
}: {
  href: string;
  ariaLabel: string;
  className: string;
  children: ReactNode;
}) {
  if (/^https?:\/\//i.test(href)) {
    return (
      <a href={href} aria-label={ariaLabel} className={className} target="_blank" rel="noreferrer">
        {children}
      </a>
    );
  }

  return (
    <Link to={href} aria-label={ariaLabel} className={className}>
      {children}
    </Link>
  );
}

export function IndustriesShowcase({
  industries: industryItems = industries,
  section = fallbackSection,
  headingAs = "h2",
}: {
  industries?: Industry[];
  section?: SiteShowcaseSection;
  headingAs?: "h1" | "h2";
}) {
  const { lang } = useLanguage();
  if (section.isEnabled === false) return null;
  const meta = lang === "EN" ? metaEN : metaTH;
  const visibleIndustryItems = [...industryItems]
    .filter((ind) => ind.showOnBrands !== false)
    .map((ind, index) => ({ ind, index }))
    .sort((a, b) => sortOrderFor(a.ind, a.index) - sortOrderFor(b.ind, b.index))
    .map(({ ind }) => ind);
  const cards = visibleIndustryItems.slice(0, 5);
  const Heading = headingAs;

  return (
    <section className="relative overflow-hidden bg-[#E8E4DC] py-14 sm:py-16 lg:py-28 dark:bg-[#1a1814]">
      <div className="pointer-events-none absolute inset-0 opacity-[0.25] [background-image:radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.18)_1px,transparent_0)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_75%)]" />
      <div className="pointer-events-none absolute -left-32 top-20 h-[420px] w-[420px] rounded-full bg-accent/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-10 h-[420px] w-[420px] rounded-full bg-cyan/10 blur-3xl" />

      <div className="relative mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-12">
        <Reveal>
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-white/70 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-accent backdrop-blur-sm dark:bg-white/5">
              <Sparkles className="h-3.5 w-3.5" />
              {t(lang, section.eyebrowTh, section.eyebrowEn)}
            </div>
            <Heading className="mt-5 text-3xl font-extrabold leading-[1.15] tracking-tight text-primary sm:text-4xl md:text-5xl">
              {t(lang, section.titlePrefixTh, section.titlePrefixEn)}
              <span className="bg-gradient-accent bg-clip-text text-transparent">
                {t(lang, section.titleHighlightTh, section.titleHighlightEn)}
              </span>
            </Heading>
            <p className="mt-4 text-base text-muted-foreground sm:text-lg">
              {t(lang, section.descriptionPrefixTh, section.descriptionPrefixEn)}
              <span className="font-semibold text-primary">
                {t(lang, section.descriptionHighlightTh, section.descriptionHighlightEn)}
              </span>
              {t(lang, section.descriptionSuffixTh, section.descriptionSuffixEn)}
            </p>
          </div>
        </Reveal>

        <div className="group/row mt-12 hidden lg:flex lg:gap-6">
          {cards.map((ind, i) => {
            const Icon = resolveIcon(ind.icon);
            const img = ind.showcaseImageUrl || industryImages[ind.slug];
            const cardMeta = cardMetaFor(
              ind,
              lang,
              meta[ind.slug] ?? { tag: "Solution", metric: "—", metricLabel: "" },
            );
            const href = ind.linkUrl || `/industry/${ind.slug}`;
            const ariaLabel = `View projects: ${t(lang, ind.title, ind.titleEn)}`;
            return (
              <Reveal
                key={ind.slug}
                delay={i * 100}
                variant="slide"
                className="flex-[1_1_0%] transition-[flex-grow] duration-700 ease-[cubic-bezier(.22,1,.36,1)] hover:flex-[3.2_1_0%] group-hover/row:[&:not(:hover)]:flex-[0.7_1_0%]"
              >
                <IndustryCardLink
                  href={href}
                  ariaLabel={ariaLabel}
                  className="group relative block h-[500px] w-full cursor-pointer overflow-hidden rounded-2xl bg-navy shadow-[0_20px_60px_-15px_rgba(0,0,0,0.25)] transition-all duration-700 ease-out hover:shadow-[0_30px_80px_-15px_rgba(0,0,0,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent xl:h-[620px]"
                >
                  {img && (
                    <img
                      src={img}
                      alt={ind.title}
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
                      style={{
                        filter: "saturate(1.1) contrast(1.05)",
                        objectPosition: "center center",
                      }}
                    />
                  )}

                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.05) 35%, rgba(0,0,0,0.05) 55%, rgba(0,0,0,0.75) 100%)",
                    }}
                  />

                  <div className="absolute left-3 top-3 lg:left-4 lg:top-4">
                    <div className="group/badge relative">
                      <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-accent/40 to-cyan/30 opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-100" />
                      <div className="relative grid h-14 w-14 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-white to-white/90 shadow-[0_8px_24px_-4px_rgba(0,0,0,0.35)] ring-1 ring-white/60 backdrop-blur-md transition-all duration-500 group-hover:-translate-y-0.5 group-hover:shadow-[0_14px_32px_-6px_rgba(0,0,0,0.45)] lg:h-16 lg:w-16">
                        <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/80 to-transparent" />
                        <span className="pointer-events-none absolute -right-3 -top-3 h-6 w-6 rotate-45 bg-gradient-to-br from-accent to-cyan opacity-90" />
                        <Icon
                          className="relative h-6 w-6 text-navy lg:h-7 lg:w-7"
                          strokeWidth={1.75}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="absolute right-3 top-3 hidden lg:block">
                    <span className="rounded-full bg-white/15 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-white backdrop-blur-md ring-1 ring-white/20">
                      {cardMeta.tag}
                    </span>
                  </div>

                  <div className="absolute right-2 top-1/2 -translate-y-1/2 transition-transform duration-500 group-hover:-translate-x-1 lg:right-3">
                    <div
                      className="whitespace-nowrap text-sm font-bold tracking-[0.18em] text-white lg:text-base"
                      style={{
                        writingMode: "vertical-rl",
                        textOrientation: "mixed",
                        textShadow: "0 2px 8px rgba(0,0,0,0.65)",
                      }}
                    >
                      {t(lang, ind.title, ind.titleEn)}
                    </div>
                  </div>

                  <div className="absolute inset-x-0 bottom-0 p-4 lg:p-5">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-black tracking-tight text-white drop-shadow-lg lg:text-3xl">
                        {cardMeta.metric}
                      </span>
                      <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/90">
                        {cardMeta.metricLabel}
                      </span>
                    </div>
                    <div className="mt-2 h-[2px] w-8 origin-left rounded-full bg-gradient-accent transition-transform duration-500 group-hover:scale-x-[2.2]" />
                    <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-white opacity-0 ring-1 ring-white/25 backdrop-blur-md transition-all duration-500 group-hover:bg-accent group-hover:opacity-100 group-hover:ring-accent">
                      {t(lang, "ดูผลงาน", "View")}
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </IndustryCardLink>
              </Reveal>
            );
          })}
        </div>

        <div className="mt-10 flex flex-col gap-3 lg:hidden">
          {visibleIndustryItems.map((ind) => {
            const Icon = resolveIcon(ind.icon);
            const img = ind.showcaseImageUrl || industryImages[ind.slug];
            const cardMeta = cardMetaFor(
              ind,
              lang,
              meta[ind.slug] ?? { tag: "", metric: "—", metricLabel: "" },
            );
            const href = ind.linkUrl || `/industry/${ind.slug}`;
            const ariaLabel = `View projects: ${t(lang, ind.title, ind.titleEn)}`;
            return (
              <IndustryCardLink
                key={ind.slug}
                href={href}
                ariaLabel={ariaLabel}
                className="group overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-elev focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <div className="relative flex min-h-[108px] w-full items-center gap-3 overflow-hidden p-3 text-left">
                  {img && (
                    <img
                      src={img}
                      alt=""
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-navy/85 via-navy/40 to-transparent" />
                  <div className="relative grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white shadow-md">
                    <Icon className="h-6 w-6 text-navy" />
                  </div>
                  <div className="relative min-w-0 flex-1">
                    <div className="break-words text-base font-bold leading-snug text-white drop-shadow">
                      {t(lang, ind.title, ind.titleEn)}
                    </div>
                    <div className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/80">
                      {cardMeta.metric} · {cardMeta.metricLabel}
                    </div>
                  </div>
                  <div className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/15 text-white ring-1 ring-white/25 backdrop-blur-md transition-colors duration-300 group-hover:bg-accent group-hover:ring-accent">
                    <ArrowUpRight className="h-4 w-4" />
                  </div>
                </div>
                <div className="p-4">
                  <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                    {t(lang, ind.desc, ind.descEn)}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-accent">
                    {t(lang, "ดูผลงาน", "View Projects")} <ArrowUpRight className="h-4 w-4" />
                  </span>
                </div>
              </IndustryCardLink>
            );
          })}
        </div>
      </div>
    </section>
  );
}
