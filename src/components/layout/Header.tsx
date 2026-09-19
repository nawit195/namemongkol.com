import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useRouterState } from "@tanstack/react-router";
import { X, ChevronDown, Phone, Globe, ArrowUpRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import matrixLogo from "@/assets/matrix-logo.jpg";
import { useLanguage, t } from "@/components/i18n/LanguageProvider";
import { useSiteContent } from "@/lib/content/use-site-content";
import { articleImages } from "@/data/article-images";
import { brandImages } from "@/data/brand-images";
import { solutionImages } from "@/data/solution-images";
import type { NavItem } from "@/data/site";
import { CATEGORY_IDS_BY_SLUG, CATEGORY_SLUGS } from "@/lib/seo-slugs";
import heroProductLine from "@/assets/hero-productline.jpg";
import educationImage from "@/assets/about/industries/education.jpg";
import hotelImage from "@/assets/about/industries/hotel-events.jpg";
import corporateImage from "@/assets/about/industries/office-business.jpg";
import videoConferenceImage from "@/assets/about/industries/video-conference.jpg";
import { formatThaiPhone } from "@/lib/company-profile";

type HeaderSubItem = { label: string; href: string; desc?: string; image?: string };

const submenuImagesByHref: Record<string, string> = {
  "/led-display": solutionImages["led-display"],
  "/interactive-display": solutionImages["interactive-display"],
  "/projector": solutionImages.projector,
  "/wireless-presentation": solutionImages["wireless-presentation"],
  "/av-solutions": solutionImages["av-solutions"],
  "/industry/education": educationImage,
  "/industry/hotel": hotelImage,
  "/industry/corporate": corporateImage,
  "/industry/video-conference": videoConferenceImage,
  "/brands/unilumin": brandImages.unilumin,
  "/brands/kramerav": brandImages.kramerav,
  "/brands/grandview": brandImages.grandview,
  "/brands/persona": brandImages.persona,
  "/brands/transcreen": brandImages.transcreen,
  "/category/unilumin": brandImages.unilumin,
  "/category/kramer": brandImages.kramerav,
  "/category/persona": brandImages.persona,
  "/category/transcreen": brandImages.transcreen,
  "/category/grandview": brandImages.grandview,
  "/category/hdmi-cable": solutionImages["av-solutions"],
  "/product-line": heroProductLine,
};

function getSubmenuImage(item: HeaderSubItem) {
  return item.image ?? submenuImagesByHref[item.href];
}

export function Header() {
  const [openMobile, setOpenMobile] = useState(false);
  const { lang, setLang } = useLanguage();
  const [hover, setHover] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const { location } = useRouterState();
  const { nav: originalNavItems, brands, solutions, companyProfile } = useSiteContent();

  const navItems = originalNavItems.map((item) => {
    if (item.label === "สินค้า" || item.href === "/category/all-products") {
      const dynamicSubmenu = brands.map((b) => {
        const categoryId = CATEGORY_IDS_BY_SLUG[b.slug];
        const targetUrl = categoryId
          ? `/category/${CATEGORY_SLUGS[categoryId] ?? categoryId}`
          : `/brands/${b.slug}`;

        return {
          label: b.name,
          href: targetUrl,
          image: b.imageUrl || brandImages[b.slug],
          desc: b.desc,
        };
      });

      const deduplicatedSubmenu = Array.from(
        new Map(dynamicSubmenu.map((item) => [item.href, item])).values(),
      );

      return { ...item, submenu: deduplicatedSubmenu };
    }
    
    if (item.label === "โซลูชันของเรา" || item.href === "/solutions") {
      const dynamicSubmenu = solutions.map((s) => ({
        label: s.title,
        href: `/${s.slug}`,
        image: s.imageUrl || solutionImages[s.slug],
        desc: s.desc,
      }));

      const deduplicatedSubmenu = Array.from(
        new Map(dynamicSubmenu.map((item) => [item.href, item])).values(),
      );

      return { ...item, submenu: deduplicatedSubmenu };
    }

    return item;
  });

  useEffect(() => {
    setOpenMobile(false);
    setHover(null);
  }, [location.pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "border-b border-border/70 bg-background/90 backdrop-blur-2xl shadow-card"
          : "bg-background/70 backdrop-blur-xl border-b border-border/40",
      )}
    >
      {/* Utility strip */}
      <div className="hidden lg:block bg-navy text-navy-foreground">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-2 text-[11px]">
          <div className="flex items-center gap-5 opacity-80">
            <span className="inline-flex items-center gap-1.5">
              <Phone className="h-3 w-3 text-cyan" />
              <span>{formatThaiPhone(companyProfile.officePhone)}</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-cyan" />
              <span>AV Solution Specialist • LED Display • Smart Classroom</span>
            </span>
          </div>
          <div className="flex items-center gap-4 opacity-90">
            <Link to="/aboutus" className="hover:text-cyan transition-colors">
              {t(lang, "เกี่ยวกับเรา", "About Us")}
            </Link>
            <Link to="/blog" className="hover:text-cyan transition-colors">
              {t(lang, "บทความ", "Articles")}
            </Link>
            <Link to="/contactus" className="hover:text-cyan transition-colors">
              {t(lang, "ติดต่อเรา", "Contact Us")}
            </Link>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 md:px-6 transition-all",
          scrolled ? "h-16" : "h-20",
        )}
      >
        <Link to="/" className="flex items-center gap-3 shrink-0 group">
          <span
            className={cn(
              "relative overflow-hidden rounded-xl ring-1 ring-[#ffd24a]/30 shadow-[0_2px_12px_-4px_rgba(255,204,25,0.25)] transition-all duration-300 group-hover:ring-[#ffd24a]/60 group-hover:shadow-[0_6px_24px_-6px_rgba(255,204,25,0.45)]",
              scrolled
                ? "h-14 w-14 md:h-[60px] md:w-[60px]"
                : "h-16 w-16 md:h-[72px] md:w-[72px]",
            )}
          >
            <img
              src={matrixLogo}
              alt="Matrix Intertrade Co., Ltd."
              className="absolute inset-0 h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
            />
          </span>
        </Link>

        <nav className="hidden xl:flex items-center gap-1" onMouseLeave={() => setHover(null)}>
          {navItems.map((item) => {
            const active =
              location.pathname === item.href ||
              (item.href !== "/" && location.pathname.startsWith(item.href));
            const hasDropdown = !!item.submenu || item.label === "บทความ";
            const isOpen = hover === item.label;
            return (
              <div key={item.label} className="relative" onMouseEnter={() => setHover(item.label)}>
                <Link
                  to={item.href}
                  className={cn(
                    "group relative inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[14px] font-bold tracking-tight text-foreground/80 transition-all duration-300 whitespace-nowrap",
                    "hover:text-accent hover:-translate-y-0.5",
                    (isOpen || active) && "text-accent",
                  )}
                >
                  <span className="relative">
                    {t(lang, item.label, (item as any).labelEn || item.label)}
                    <span
                      className={cn(
                        "pointer-events-none absolute -bottom-1 left-0 h-[2px] rounded-full bg-gradient-accent transition-all duration-300",
                        isOpen || active
                          ? "w-full opacity-100"
                          : "w-0 opacity-0 group-hover:w-full group-hover:opacity-100",
                      )}
                    />
                  </span>
                  {hasDropdown && (
                    <ChevronDown
                      className={cn(
                        "h-3.5 w-3.5 opacity-50 transition-all duration-300",
                        isOpen && "rotate-180 opacity-100 text-accent",
                      )}
                    />
                  )}
                </Link>

                {isOpen && item.label === "บทความ" && <BlogMegaMenu />}
                {isOpen && item.submenu && item.label !== "บทความ" && (
                  <SubmenuPanel
                    items={item.submenu}
                    parentHref={item.href}
                    parentLabel={t(lang, item.label, (item as any).labelEn || item.label)}
                  />
                )}
              </div>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <div className="relative hidden xl:flex items-center rounded-full border border-border/60 bg-muted/30 p-1 shadow-inner backdrop-blur-md">
            {/* Animated Pill Background */}
            <div
              className={cn(
                "absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full bg-[#ffd24a] shadow-[0_2px_10px_rgba(255,204,25,0.4)] transition-transform duration-300 ease-out",
                lang === "EN" ? "translate-x-full" : "translate-x-0",
              )}
            />
            <button
              onClick={() => setLang("TH")}
              className={cn(
                "relative z-10 flex w-16 items-center justify-center gap-1.5 rounded-full py-1 text-[11px] font-bold transition-colors duration-300",
                lang === "TH" ? "text-[#0a1b3d]" : "text-muted-foreground hover:text-foreground",
              )}
              aria-label="เปลี่ยนภาษาเป็นไทย"
            >
              <img
                src="https://flagcdn.com/w20/th.png"
                alt="ภาษาไทย (Thai)"
                className="w-[14px] rounded-[2px] shadow-sm"
              />
              TH
            </button>
            <button
              onClick={() => setLang("EN")}
              className={cn(
                "relative z-10 flex w-16 items-center justify-center gap-1.5 rounded-full py-1 text-[11px] font-bold transition-colors duration-300",
                lang === "EN" ? "text-[#0a1b3d]" : "text-muted-foreground hover:text-foreground",
              )}
              aria-label="Change language to English"
            >
              <img
                src="https://flagcdn.com/w20/gb.png"
                alt="English (UK)"
                className="w-[14px] rounded-[2px] shadow-sm"
              />
              EN
            </button>
          </div>
          <Button
            asChild
            className="hidden lg:inline-flex bg-gradient-accent text-white hover:opacity-90 shadow-glow font-semibold"
          >
            <Link to="/contactus">
              {t(lang, "ขอใบเสนอราคา", "Request Quote")} <ArrowUpRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
          <button
            className="group relative grid h-11 w-11 place-items-center overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-br from-[#0a1b3d] via-[#13294b] to-[#020816] text-white shadow-[0_18px_38px_-18px_rgba(2,8,22,0.85),0_0_0_1px_rgba(255,210,74,0.35)_inset] ring-1 ring-[#ffd24a]/40 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_46px_-20px_rgba(255,207,36,0.55),0_0_0_1px_rgba(255,210,74,0.6)_inset] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#ffd24a]/40 xl:hidden"
            onClick={() => setOpenMobile(true)}
            aria-label="เปิดเมนู"
          >
            {/* premium sheen */}
            <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_25%_15%,rgba(255,210,74,0.28),transparent_45%),linear-gradient(135deg,rgba(255,255,255,0.12),transparent_50%)]" />
            {/* gold corner glow */}
            <span className="pointer-events-none absolute -right-4 -top-4 h-10 w-10 rounded-full bg-[#ffd24a]/35 blur-xl opacity-70 transition-opacity duration-300 group-hover:opacity-100" />
            {/* subtle top hairline */}
            <span className="pointer-events-none absolute inset-x-2 top-0 h-px bg-gradient-to-r from-transparent via-[#ffd24a]/60 to-transparent" />
            <span className="relative flex h-[18px] w-5 flex-col justify-between">
              <span className="h-[2px] w-5 rounded-full bg-gradient-to-r from-[#ffe6a0] via-[#ffcc19] to-[#e0a800] shadow-[0_0_8px_rgba(255,204,25,0.6)] transition-all duration-300 group-hover:w-4 group-hover:translate-x-1" />
              <span className="h-[2px] w-5 rounded-full bg-gradient-to-r from-[#ffe6a0] via-[#ffcc19] to-[#e0a800] shadow-[0_0_8px_rgba(255,204,25,0.6)] transition-all duration-300 group-hover:scale-x-90" />
              <span className="h-[2px] w-5 rounded-full bg-gradient-to-r from-[#ffe6a0] via-[#ffcc19] to-[#e0a800] shadow-[0_0_8px_rgba(255,204,25,0.6)] transition-all duration-300 group-hover:w-3.5 group-hover:translate-x-1.5" />
            </span>
          </button>
        </div>
      </div>

      <MobileDrawer
        open={openMobile}
        onClose={() => setOpenMobile(false)}
        lang={lang}
        setLang={setLang}
        navItems={navItems}
      />
    </header>
  );
}

function SubmenuPanel({
  items,
  parentHref,
  parentLabel,
}: {
  items: HeaderSubItem[];
  parentHref: string;
  parentLabel: string;
}) {
  const { lang } = useLanguage();
  const hasDesc = items.some((i) => i.desc);
  const hasImage = items.some((i) => getSubmenuImage(i));
  return (
    <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 z-50 max-w-[calc(100vw-2rem)]">
      <div
        className={cn(
          "dropdown-enter overflow-hidden rounded-2xl border border-border/80 bg-popover/95 backdrop-blur-xl shadow-elev",
          hasImage
            ? "w-[min(520px,calc(100vw-2rem))]"
            : hasDesc
              ? "w-[min(420px,calc(100vw-2rem))]"
              : "min-w-[min(300px,calc(100vw-2rem))]",
        )}
      >
        {/* Accent header */}
        <div className="relative bg-gradient-to-r from-navy via-navy/95 to-navy px-5 py-3 overflow-hidden">
          <div className="absolute inset-0 grid-pattern opacity-30" />
          <div className="relative flex items-center justify-between">
            <div>
              <div className="text-[9px] font-black uppercase tracking-[0.22em] text-cyan">
                Explore
              </div>
              <div className="mt-0.5 text-sm font-extrabold text-white">{parentLabel}</div>
            </div>
            <Link
              to={parentHref}
              className="inline-flex items-center gap-1 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur px-2.5 py-1 text-[10px] font-bold text-white transition-colors"
            >
              {t(lang, "ดูทั้งหมด", "View All")} <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        <div className="p-2">
          {items.map((s, idx) => {
            const image = getSubmenuImage(s);
            return (
              <Link
                key={s.href}
                to={s.href}
                className="group/item flex items-center gap-4 rounded-xl px-3 py-2.5 transition-all duration-200 hover:bg-secondary/75"
              >
                {image ? (
                  <span className="relative h-14 w-20 shrink-0 overflow-hidden rounded-xl bg-muted ring-1 ring-border transition-all duration-300 group-hover/item:ring-accent/45 group-hover/item:shadow-[0_10px_24px_-16px_rgba(0,173,238,0.9)]">
                    <img
                      src={image}
                      alt=""
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover/item:scale-105"
                    />
                    <span className="absolute inset-0 bg-gradient-to-t from-navy/20 via-transparent to-white/10" />
                  </span>
                ) : (
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-border bg-background text-[11px] font-black text-muted-foreground transition-all group-hover/item:border-accent group-hover/item:bg-accent group-hover/item:text-accent-foreground group-hover/item:shadow-glow">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                )}
                <span className="flex-1 min-w-0">
                  <span className="block text-[14px] font-extrabold text-foreground leading-snug break-words group-hover/item:text-accent transition-colors">
                    {t(lang, s.label, (s as any).labelEn || s.label)}
                  </span>
                  {s.desc && (
                    <span className="mt-0.5 block text-[12px] text-muted-foreground leading-snug line-clamp-2">
                      {t(lang, s.desc, (s as any).descEn || s.desc)}
                    </span>
                  )}
                </span>
                <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 -translate-x-1 group-hover/item:opacity-100 group-hover/item:translate-x-0 group-hover/item:text-accent transition-all" />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function BlogMegaMenu() {
  const { articleCategories } = useSiteContent();
  const { lang } = useLanguage();

  return (
    <div className="absolute right-0 top-full pt-3 z-50 max-w-[calc(100vw-2rem)]">
      <div className="dropdown-enter w-[min(680px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-border bg-popover shadow-elev">
        <div className="grid grid-cols-[1.4fr_1fr]">
          <div className="p-5">
            <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              {t(lang, "หมวดหมู่บทความ", "Article Categories")}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {articleCategories.map((c) => (
                <Link
                  key={c.slug}
                  to="/blog"
                  search={{ category: c.slug }}
                  className="group flex items-center gap-3 rounded-xl px-2.5 py-2.5 hover:bg-secondary transition-colors"
                >
                  <span className="relative h-11 w-14 shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-border transition-all group-hover:ring-accent/45">
                    <img
                      src={c.imageUrl || articleImages[c.slug]}
                      alt=""
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="absolute inset-0 bg-gradient-to-t from-navy/25 to-transparent" />
                  </span>
                  <span className="min-w-0 flex-1 text-sm font-semibold leading-snug text-foreground group-hover:text-accent">
                    {t(lang, c.label, (c as any).labelEn || c.label)}
                  </span>
                  <ArrowUpRight className="h-4 w-4 shrink-0 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-accent" />
                </Link>
              ))}
            </div>
          </div>
          <div className="relative bg-gradient-hero p-5 text-white overflow-hidden">
            <div className="absolute inset-0 grid-pattern opacity-40" />
            <div className="relative">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan">
                Knowledge Hub
              </div>
              <div className="mt-2 font-bold leading-snug">
                {t(
                  lang,
                  "บทความและคู่มือ AV Solutions สำหรับองค์กร",
                  "AV Solutions Articles & Guides for Enterprises",
                )}
              </div>
              <p className="mt-2 text-xs text-white/70 leading-relaxed">
                {t(
                  lang,
                  "รวมความรู้และ Case Study จากทีมผู้เชี่ยวชาญ",
                  "Knowledge and Case Studies from our Experts",
                )}
              </p>
              <Link
                to="/blog"
                className="mt-4 inline-flex items-center gap-1 rounded-lg bg-white text-navy px-3 py-2 text-xs font-bold hover:bg-cyan transition-colors"
              >
                {t(lang, "ดูบทความทั้งหมด", "View All Articles")}{" "}
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileDrawer({
  open,
  onClose,
  lang,
  setLang,
  navItems,
}: {
  open: boolean;
  onClose: () => void;
  lang: "TH" | "EN";
  setLang: (l: "TH" | "EN") => void;
  navItems: NavItem[];
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open || !mounted) return null;
  return createPortal(
    <div className="fixed inset-0 z-[100] xl:hidden">
      <div
        className="absolute inset-0 bg-navy/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      <div
        className="absolute right-0 top-0 h-full w-[min(92vw,26rem)] bg-background shadow-elev overflow-y-auto animate-in slide-in-from-right duration-300"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4 sticky top-0 bg-background/95 backdrop-blur z-10">
          <span className="relative h-12 w-12 overflow-hidden rounded-xl ring-1 ring-[#ffd24a]/30 shadow-[0_2px_12px_-4px_rgba(255,204,25,0.25)]">
            <img src={matrixLogo} alt="Matrix Intertrade" className="absolute inset-0 h-full w-full object-contain" />
          </span>
          <button
            onClick={onClose}
            aria-label="ปิดเมนู"
            className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-card"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="p-3">
          {navItems.map((item) => {
            const expandedOpen = expanded === item.label;
            return (
              <div key={item.label} className="border-b border-border/50 last:border-0">
                <div className="flex items-stretch">
                  <Link
                    to={item.href}
                    onClick={onClose}
                    className="min-w-0 flex-1 break-words px-3 py-3.5 text-sm font-semibold leading-snug text-foreground hover:text-accent"
                  >
                    {t(lang, item.label, (item as any).labelEn || item.label)}
                  </Link>
                  {item.submenu && (
                    <button
                      className="px-4 text-muted-foreground hover:text-accent"
                      onClick={() => setExpanded(expandedOpen ? null : item.label)}
                      aria-label="ขยายเมนู"
                      aria-expanded={expandedOpen}
                    >
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform duration-200",
                          expandedOpen && "rotate-180",
                        )}
                      />
                    </button>
                  )}
                </div>
                {item.submenu && (
                  <div
                    className={cn(
                      "grid transition-all duration-300 ease-out",
                      expandedOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                    )}
                  >
                    <div className="overflow-hidden">
                      <div className="pl-3 pb-3 pt-1 space-y-1">
                        {item.submenu.map((s) => {
                          const image = getSubmenuImage(s);
                          return (
                            <Link
                              key={s.href}
                              to={s.href}
                              onClick={onClose}
                              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:text-accent hover:bg-secondary transition-colors"
                            >
                              {image && (
                                <span className="relative h-11 w-14 shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-border">
                                  <img
                                    src={image}
                                    alt=""
                                    loading="lazy"
                                    className="absolute inset-0 h-full w-full object-cover"
                                  />
                                  <span className="absolute inset-0 bg-gradient-to-t from-navy/20 to-transparent" />
                                </span>
                              )}
                              <span className="min-w-0 flex-1 break-words font-semibold leading-snug">
                                {t(lang, s.label, (s as any).labelEn || s.label)}
                              </span>
                              <ArrowUpRight className="h-3.5 w-3.5 shrink-0 opacity-50" />
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="p-4 space-y-3 border-t border-border bg-secondary/30">
          <div className="hidden">
            <span className="text-sm font-semibold">{t(lang, "โหมดสี", "Color Mode")}</span>
          </div>
          <div className="relative grid grid-cols-2 rounded-xl border border-border/80 bg-muted/30 p-1 shadow-inner">
            {/* Animated Pill Background */}
            <div
              className={cn(
                "absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-lg bg-[#ffd24a] shadow-[0_2px_10px_rgba(255,204,25,0.4)] transition-transform duration-300 ease-out",
                lang === "EN" ? "translate-x-full" : "translate-x-0",
              )}
            />
            <button
              onClick={() => {
                setLang("TH");
                onClose();
              }}
              className={cn(
                "relative z-10 flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-bold transition-colors duration-300",
                lang === "TH" ? "text-[#0a1b3d]" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <img
                src="https://flagcdn.com/w20/th.png"
                alt="ภาษาไทย (Thai)"
                className="w-4 rounded-[2px] shadow-sm"
              />
              ภาษาไทย
            </button>
            <button
              onClick={() => {
                setLang("EN");
                onClose();
              }}
              className={cn(
                "relative z-10 flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-bold transition-colors duration-300",
                lang === "EN" ? "text-[#0a1b3d]" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <img
                src="https://flagcdn.com/w20/gb.png"
                alt="English (UK)"
                className="w-4 rounded-[2px] shadow-sm"
              />
              English
            </button>
          </div>
          <Button asChild className="w-full bg-gradient-accent text-white shadow-glow h-11">
            <Link to="/contactus" onClick={onClose}>
              {t(lang, "ขอใบเสนอราคา", "Request Quote")} <ArrowUpRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full h-11">
            <Link to="/contactus" onClick={onClose}>
              <Phone className="mr-1.5 h-4 w-4" />
              {t(lang, "ติดต่อฝ่ายขาย", "Contact Sales")}
            </Link>
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
