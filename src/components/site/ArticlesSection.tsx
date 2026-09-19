/**
 * ArticlesSection — lazy-loaded from the homepage.
 *
 * This file is a code-split boundary: it imports article-contents.ts (587 KB)
 * and article-related data so the cost is paid only when this chunk loads.
 */
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, BookOpen, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/site/Reveal";
import { useLanguage, t } from "@/components/i18n/LanguageProvider";
import { articleContents } from "@/data/article-contents";
import { articleImages } from "@/data/article-images";
import { useArticleContent } from "@/lib/content/use-article-content";

export default function ArticlesSection() {
  const { lang } = useLanguage();
  const { articles, articleCategories } = useArticleContent();

  const featuredArticles = articles
    .filter((a) => a.isFeatured)
    .concat(articles.filter((a) => !a.isFeatured))
    .slice(0, 5);

  return (
    <section className="relative overflow-hidden bg-[#f4f8fb] py-16 sm:py-24">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(0,173,238,0.16),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.9),rgba(244,248,251,0.96))]"
      />
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        {/* ── Header ── */}
        <div className="relative mb-10 flex flex-wrap items-end justify-between gap-4 rounded-2xl border border-white bg-white/70 p-5 shadow-[0_18px_44px_-34px_rgba(0,44,84,0.4)] backdrop-blur-sm sm:p-6">
          <div>
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-cyan/30 bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-accent shadow-[0_8px_24px_-18px_rgba(0,173,238,0.9)]">
              <Sparkles className="h-3 w-3" />
              {t(lang, "ศูนย์ความรู้", "Knowledge Hub")}
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-navy sm:text-4xl">
              {t(lang, "บทความและคู่มือเลือก AV ล่าสุด", "Latest articles & AV buying guides")}
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
              {t(
                lang,
                "รวมบทความเลือกซื้อ ความรู้เชิงลึก และ case study สำหรับองค์กรที่วางระบบ AV",
                "Buying guides, technical insights, and case studies for teams planning practical AV systems",
              )}
            </p>
          </div>
          <Button
            asChild
            variant="outline"
            className="border-border bg-white text-navy shadow-card hover:border-accent hover:bg-white hover:text-accent"
          >
            <Link to="/blog">
              {t(lang, "ดูบทความทั้งหมด", "View all articles")}
              <ArrowUpRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* ── Two-column grid ── */}
        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.28fr)_minmax(360px,0.72fr)] lg:gap-7">
          {/* Lead article — full-bleed image with text overlay */}
          {featuredArticles[0] &&
            (() => {
              const lead = featuredArticles[0];
              const leadContent = articleContents[lead.slug];
              const leadImg =
                lead.coverImageUrl ??
                (
                  leadContent?.blocks?.find((b) => b.t === "img") as
                    | { t: "img"; src: string }
                    | undefined
                )?.src ?? articleImages[lead.category];
              const leadSummary =
                leadContent?.blocks
                  .filter((b): b is { t: "p"; text: string } => b.t === "p")
                  .slice(0, 2)
                  .map((b) => b.text)
                  .join(" ") ?? lead.excerpt;
              const leadCat =
                articleCategories.find((c) => c.slug === lead.category)?.label ?? "บทความ";
              return (
                <Reveal delay={0} variant="slide">
                  <Link
                    to="/blog/$slug"
                    params={{ slug: lead.slug }}
                    className="group grid overflow-hidden rounded-2xl border border-cyan/25 bg-white shadow-[0_22px_52px_-28px_rgba(0,44,84,0.45)] ring-1 ring-white transition-all duration-500 hover:-translate-y-1 hover:border-cyan/60 hover:shadow-[0_30px_70px_-30px_rgba(0,173,238,0.55)]"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-white sm:aspect-[16/10]">
                      {leadImg && (
                        <img
                          src={leadImg}
                          alt={lead.title}
                          loading="lazy"
                          decoding="async"
                          className="absolute inset-0 h-full w-full bg-white object-contain transition-transform duration-700 group-hover:scale-[1.025]"
                        />
                      )}
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0)_44%,rgba(255,255,255,0.34)_100%)]" />
                      {/* Top badges */}
                      <div className="absolute left-4 top-4 flex items-center gap-2">
                        <span className="rounded-full bg-cyan px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-navy ring-1 ring-white/70 shadow-[0_8px_24px_-12px_rgba(0,173,238,0.8)]">
                          {leadCat}
                        </span>
                        <span className="rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold text-navy ring-1 ring-border backdrop-blur-sm">
                          {lead.readMin} {t(lang, "นาที", "min")}
                        </span>
                      </div>
                      {/* Big number watermark */}
                      <div className="absolute right-5 top-4 font-black text-navy/18 [font-size:clamp(3rem,8vw,5.5rem)] leading-none">
                        #{String(lead.id).padStart(2, "0")}
                      </div>
                    </div>
                    {/* Bottom text content */}
                    <div className="grid gap-4 border-t border-border/70 p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end sm:p-6">
                      <div className="min-w-0">
                        <div className="mb-2 text-[11px] font-medium text-muted-foreground tracking-wide">
                          {lead.date}
                        </div>
                        <h3 className="text-xl font-bold leading-snug text-navy sm:text-2xl md:text-[26px]">
                          {lead.title}
                        </h3>
                        <p className="mt-3 line-clamp-2 text-[13px] leading-relaxed text-foreground/70 sm:text-sm">
                          {leadSummary}
                        </p>
                      </div>
                      <div className="inline-flex w-fit items-center gap-2 rounded-full bg-navy px-4 py-2 text-sm font-semibold text-white ring-1 ring-navy/10 transition-all duration-300 group-hover:bg-accent">
                        <BookOpen className="h-3.5 w-3.5" />
                        {t(lang, "อ่านบทความ", "Read article")}
                        <ArrowUpRight className="h-4 w-4" />
                      </div>
                    </div>
                  </Link>
                </Reveal>
              );
            })()}

          {/* Secondary articles — horizontal list cards */}
          <div className="rounded-2xl border border-border/80 bg-white/60 p-3 shadow-[0_18px_44px_-34px_rgba(0,44,84,0.45)] backdrop-blur-sm sm:p-4">
            <div className="mb-3 flex items-center justify-between px-1">
              <div className="text-sm font-bold text-navy">
                {t(lang, "บทความที่น่าสนใจ", "Featured reads")}
              </div>
              <div className="text-xs font-semibold text-accent">
                {featuredArticles.slice(1, 5).length} {t(lang, "บทความ", "articles")}
              </div>
            </div>
            <div className="flex flex-col gap-3">
              {featuredArticles.slice(1, 5).map((a, i) => {
                const aContent = articleContents[a.slug];
                const aImg =
                  a.coverImageUrl ??
                  (
                    aContent?.blocks?.find((b) => b.t === "img") as
                      | { t: "img"; src: string }
                      | undefined
                  )?.src ?? articleImages[a.category];
                const aCat =
                  articleCategories.find((c) => c.slug === a.category)?.label ?? "บทความ";
                return (
                  <Reveal key={a.id} delay={i * 80} variant="slide">
                    <Link
                      to="/blog/$slug"
                      params={{ slug: a.slug }}
                      className="group flex items-center gap-4 overflow-hidden rounded-xl border border-border bg-white p-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan/55 hover:shadow-[0_18px_42px_-28px_rgba(0,173,238,0.55)] sm:gap-4"
                    >
                      {/* Thumbnail */}
                      <div className="relative h-[82px] w-[112px] shrink-0 overflow-hidden rounded-lg bg-white ring-1 ring-border sm:h-[92px] sm:w-[128px]">
                        {aImg && (
                          <img
                            src={aImg}
                            alt={aCat}
                            loading="lazy"
                            decoding="async"
                            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-br from-black/8 to-black/0" />
                        <div className="absolute bottom-1.5 right-1.5 rounded-full bg-navy/75 px-1.5 py-0.5 text-[9px] font-black text-white tabular-nums">
                          #{String(a.id).padStart(2, "0")}
                        </div>
                      </div>
                      {/* Text */}
                      <div className="min-w-0 flex-1">
                        <span className="mb-1.5 inline-block rounded-full bg-cyan/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-accent ring-1 ring-cyan/25">
                          {aCat}
                        </span>
                        <h4 className="line-clamp-2 text-[13px] font-bold leading-snug text-navy transition-colors group-hover:text-accent sm:text-base">
                          {a.title}
                        </h4>
                        <div className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground">
                          <span>{a.date}</span>
                          <span>·</span>
                          <span>
                            {a.readMin} {t(lang, "นาที", "min")}
                          </span>
                        </div>
                      </div>
                      <ArrowUpRight className="h-4 w-4 shrink-0 text-accent opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100" />
                    </Link>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
