import { createFileRoute, Link } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { SolutionCard } from "@/components/site/SolutionCard";
import { SolutionSplitPanels } from "@/components/site/SolutionSplitPanels";
import { BrandCard } from "@/components/site/BrandCard";
import { ArticleCard } from "@/components/site/ArticleCard";
import { CTASection } from "@/components/site/CTASection";
import { Reveal } from "@/components/site/Reveal";
import { HeroVideo } from "@/components/site/HeroVideo";
import { IndustriesShowcase } from "@/components/site/IndustriesShowcase";
import { Marquee } from "@/components/site/Marquee";
import { useLanguage, t } from "@/components/i18n/LanguageProvider";
import { brandLogos, brandAccent } from "@/data/brand-logos";
import ledLineup2026 from "@/assets/about/led-lineup-2026.jpg";
import homeStatsShowcase from "@/assets/home/home-stats-showcase.png";
import homeWhyShowcase from "@/assets/home/home-why-showcase.png";
import homeProcessShowcase from "@/assets/home/home-process-showcase.png";
import { articles } from "@/data/articles";
import { articleImages } from "@/data/article-images";
import { useSiteContent } from "@/lib/content/use-site-content";
import heroPoster from "@/assets/hero-led.jpg";
import { buildSeoHead } from "@/lib/seo";
import { loadCompanyProfile, type SiteCompanyProfile } from "@/lib/content/site";
import { buildOrganizationJsonLd, fallbackCompanyProfile } from "@/lib/company-profile";
import {
  ArrowUpRight,
  ArrowRight,
  UserRoundCheck,
  DraftingCompass,
  BadgeCheck,
  PanelsTopLeft,
  LifeBuoy,
  BriefcaseBusiness,
  PlayCircle,
} from "lucide-react";

export const Route = createFileRoute("/")({
  loader: async () => ({ companyProfile: await loadCompanyProfile() }),
  head: ({ loaderData }: { loaderData?: { companyProfile: SiteCompanyProfile } }) => {
    const seo = buildSeoHead({
      title: "Matrix Intertrade | ผู้เชี่ยวชาญจอ LED Display และระบบ AV",
      description: "จำหน่าย ออกแบบ ติดตั้ง และดูแลจอ LED Display, Interactive Display, Projector และระบบ AV ครบวงจรสำหรับองค์กรทั่วประเทศไทย",
      path: "/",
      image: heroPoster,
    });
    return {
      ...seo,
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(
            buildOrganizationJsonLd(loaderData?.companyProfile ?? fallbackCompanyProfile),
          ),
        },
      ],
    };
  },
  component: HomePage,
});

// Lazy-load the article section to avoid pulling 587KB of article-contents.ts
// into the initial bundle. It's below the fold so users won't notice the delay.
const LazyArticlesSection = lazy(() => import("@/components/site/ArticlesSection"));

const trustBadges = [
  "AV Solution Specialist",
  "LED Display",
  "Smart Classroom",
  "Meeting Room Technology",
];

const whyTH = [
  {
    icon: UserRoundCheck,
    title: "ให้คำปรึกษาโดยผู้เชี่ยวชาญ",
    desc: "ทีม Sales Engineer ที่เข้าใจ AV จริง",
  },
  {
    icon: DraftingCompass,
    title: "ออกแบบระบบตามหน้างานจริง",
    desc: "Site Survey + Design ก่อนเสนอราคา",
  },
  { icon: BadgeCheck, title: "สินค้าและแบรนด์คุณภาพ", desc: "ตัวแทนแบรนด์ระดับโลก" },
  { icon: PanelsTopLeft, title: "รองรับงานทุกขนาด", desc: "ตั้งแต่ห้องประชุมเล็กถึง LED ขนาดใหญ่" },
  { icon: LifeBuoy, title: "บริการหลังการขาย", desc: "ทีมช่างเทคนิคพร้อมดูแลตลอดอายุการใช้งาน" },
  {
    icon: BriefcaseBusiness,
    title: "ประสบการณ์ด้าน AV",
    desc: "ผ่านงานองค์กร โรงเรียน โรงแรม หน่วยงานรัฐ",
  },
];
const whyEN = [
  {
    icon: UserRoundCheck,
    title: "Expert consultation",
    desc: "Sales engineers who truly understand AV",
  },
  {
    icon: DraftingCompass,
    title: "Site-tailored design",
    desc: "Site survey + design before quotation",
  },
  {
    icon: BadgeCheck,
    title: "Quality brands & products",
    desc: "Authorized dealer of world-class brands",
  },
  {
    icon: PanelsTopLeft,
    title: "Any project size",
    desc: "From small meeting rooms to large LED walls",
  },
  {
    icon: LifeBuoy,
    title: "After-sales service",
    desc: "Technical team to support the full lifecycle",
  },
  {
    icon: BriefcaseBusiness,
    title: "Proven AV experience",
    desc: "Enterprises, schools, hotels, government",
  },
];

const processTH = [
  {
    n: "01",
    title: "รับโจทย์และสำรวจความต้องการ",
    desc: "เก็บข้อมูลพื้นที่ การใช้งาน และเป้าหมายของระบบ",
  },
  { n: "02", title: "ออกแบบ Solution", desc: "วางระบบ AV / LED ตามหน้างานจริง" },
  { n: "03", title: "เสนอราคาและแผนติดตั้ง", desc: "ใบเสนอราคาแบบโปร่งใส พร้อม Timeline" },
  { n: "04", title: "ติดตั้งและทดสอบระบบ", desc: "ทีมช่างผู้เชี่ยวชาญ พร้อม Commissioning" },
  { n: "05", title: "ส่งมอบและดูแลหลังการขาย", desc: "Training + Maintenance + Support" },
];
const processEN = [
  { n: "01", title: "Brief & requirements survey", desc: "Gather space, usage, and system goals" },
  { n: "02", title: "Solution design", desc: "Plan the AV / LED system for your real site" },
  { n: "03", title: "Quotation & install plan", desc: "Transparent quote with a clear timeline" },
  {
    n: "04",
    title: "Installation & commissioning",
    desc: "Expert technicians with full commissioning",
  },
  { n: "05", title: "Handover & after-sales", desc: "Training + Maintenance + Support" },
];

function HomePage() {
  const { lang } = useLanguage();
  const { solutions, brands, industries, industryShowcase, articleCategories } = useSiteContent();
  const why = lang === "EN" ? whyEN : whyTH;
  const steps = lang === "EN" ? processEN : processTH;
  const featuredArticles = articles.slice(0, 6);
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-navy text-white">
        {/* Video stage — responsive aspect for crisp framing on every device */}
        <div className="relative w-full aspect-video sm:aspect-auto sm:h-[78svh] sm:min-h-[460px] md:h-[88svh] md:min-h-[600px] md:max-h-[820px]">
          <h1 className="sr-only">
            Matrix Intertrade — ผู้เชี่ยวชาญ LED Display และ AV Solutions ครบวงจรสำหรับองค์กรไทย
          </h1>
          <HeroVideo src="/videos/hero.mp4" poster={heroPoster} />
          {/* Subtle bottom gradient so buttons stay readable without hiding the video */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/65 via-black/25 to-transparent" />

          {/* CTAs anchored bottom-left on desktop, centered on mobile */}
          <div className="absolute inset-x-0 bottom-3 sm:bottom-6 md:bottom-10">
            <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6">
              <div className="fade-up flex flex-row items-center gap-2 sm:gap-3 sm:justify-start justify-center flex-wrap">
                <Button
                  asChild
                  className="bg-gradient-accent text-white hover:opacity-90 shadow-glow h-8 sm:h-11 px-3 sm:px-5 text-xs sm:text-sm font-semibold rounded-full sm:rounded-md btn-press btn-shimmer glow-pulse"
                >
                  <Link to="/solutions">
                    {t(lang, "ดูโซลูชั่นของเรา", "Explore Our Solutions")}{" "}
                    <ArrowUpRight className="ml-1 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white backdrop-blur-md h-8 sm:h-11 px-3 sm:px-5 text-xs sm:text-sm font-semibold rounded-full sm:rounded-md btn-press btn-shimmer"
                >
                  <Link to="/contactus">
                    <PlayCircle className="mr-1 sm:mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    {t(lang, "ขอคำปรึกษาฟรี", "Free Consultation")}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
        {/* Brand strip — premium marquee with pill cards */}
        <div className="relative border-t border-white/10 bg-gradient-to-r from-navy via-black/40 to-navy overflow-hidden">
          {/* edge fades */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-16 md:w-28 z-10 bg-gradient-to-r from-navy to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-16 md:w-28 z-10 bg-gradient-to-l from-navy to-transparent" />
          {/* subtle top accent line */}
          <div className="pointer-events-none absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
          <div className="mx-auto max-w-7xl px-4 md:px-6 py-4 md:py-5 flex items-center gap-4 md:gap-6">
            <div className="hidden sm:flex shrink-0 items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-white/70">
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse shadow-glow" />
              {t(lang, "พันธมิตรที่ไว้วางใจ", "Trusted Partners")}
            </div>
            <Marquee speed={120} className="flex-1">
              {brands.concat(brands).map((b, i) => {
                const logo = b.logoUrl || brandLogos[b.slug];
                const accent = (b.accent &&
                typeof b.accent === "object" &&
                "from" in b.accent &&
                "to" in b.accent
                  ? (b.accent as { from: string; to: string })
                  : brandAccent[b.slug]) ?? { from: "#22d3ee", to: "#2563eb" };
                return (
                  <Link
                    key={`${b.slug}-${i}`}
                    to={"/brands/$slug"}
                    params={{ slug: b.slug }}
                    className="group inline-flex items-center gap-1.5 md:gap-2.5 rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/[0.09] hover:border-accent/40 px-2 py-1 md:px-4 md:py-2 backdrop-blur transition-all duration-300 whitespace-nowrap"
                  >
                    <span
                      className="relative grid h-5 w-5 md:h-8 md:w-8 shrink-0 place-items-center rounded-full ring-1 ring-white/25 shadow-glow overflow-hidden"
                      style={{
                        backgroundImage: `linear-gradient(135deg, ${accent.from}, ${accent.to})`,
                      }}
                    >
                      {/* glossy highlight */}
                      <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-full bg-gradient-to-b from-white/35 to-transparent" />
                      {/* monogram (always visible — guaranteed render) */}
                      <span className="relative text-[9px] md:text-xs font-black text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)] tracking-tight">
                        {b.name.charAt(0)}
                      </span>
                      {/* optional favicon overlay (fades in only if it loads cleanly) */}
                      {logo ? (
                        <img
                          src={logo}
                          alt=""
                          aria-hidden="true"
                          loading="lazy"
                          width={32}
                          height={32}
                          className="absolute inset-0 h-full w-full object-contain p-1 opacity-0 transition-opacity duration-300"
                          onLoad={(e) => {
                            e.currentTarget.style.opacity = "1";
                            const mono = e.currentTarget
                              .previousElementSibling as HTMLElement | null;
                            if (mono) mono.style.opacity = "0";
                          }}
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : null}
                    </span>
                    <span className="text-[11px] md:text-[15px] font-extrabold text-white tracking-tight">
                      {b.name}
                    </span>
                    <span className="hidden md:inline text-[10px] font-semibold uppercase tracking-wider text-white/75 group-hover:text-cyan transition-colors">
                      {b.category}
                    </span>
                  </Link>
                );
              })}
            </Marquee>
          </div>
        </div>
      </section>

      {/* SOLUTIONS */}
      <Section
        eyebrow={t(lang, "โซลูชั่นของเรา", "Our Solutions")}
        title={t(
          lang,
          "โซลูชั่นภาพและเสียงครบทุกความต้องการ",
          "Complete AV solutions for every need",
        )}
        desc={t(
          lang,
          "ตอบโจทย์ทั้งห้องประชุม ห้องเรียน หน่วยงานรัฐ โรงแรม และองค์กรขนาดใหญ่",
          "Meeting rooms, classrooms, government, hotels and enterprises",
        )}
      >
        <SolutionSplitPanels solutions={solutions} />
        <div className="mt-8 text-center">
          <Link
            to="/led-display"
            className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/5 px-5 py-2.5 text-sm font-semibold text-accent transition hover:bg-accent/10"
          >
            {t(lang, "ดูบริการจอ LED สำหรับองค์กร", "View enterprise LED Display solutions")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Section>

      {/* INDUSTRIES */}
      <IndustriesShowcase industries={industries} section={industryShowcase} />

      {/* STATS - image showcase */}
      <section className="relative overflow-hidden border-y border-border/70 bg-white py-10 sm:py-14 md:py-16">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,white_0%,#f8fbff_100%)]" />
        <div className="relative mx-auto max-w-7xl px-4 md:px-6">
          <div className="sr-only">
            <h2>{t(lang, "ผลงานที่ผ่านมา", "Track Record")}</h2>
            <p>
              {t(
                lang,
                "โปรเจ็คติดตั้งสำเร็จทั่วประเทศ สำหรับองค์กร โรงเรียน โรงแรม และหน่วยงานรัฐ",
                "Successful installations nationwide for enterprises, schools, hotels, and government teams",
              )}
            </p>
            <ul>
              <li>500+ {t(lang, "โปรเจ็คติดตั้งสำเร็จ", "successful projects")}</li>
              <li>20+ {t(lang, "แบรนด์ระดับโลก", "world-class brands")}</li>
              <li>15+ {t(lang, "ปีประสบการณ์", "years of experience")}</li>
              <li>98% {t(lang, "ความพึงพอใจของลูกค้า", "customer satisfaction")}</li>
              <li>24/7 {t(lang, "บริการหลังการขาย", "after-sales support")}</li>
            </ul>
          </div>
          <Reveal>
            <img
              src={homeStatsShowcase}
              alt={t(
                lang,
                "อินโฟกราฟิกผลงานที่ผ่านมา 500+ โปรเจ็ค 20+ แบรนด์ 15+ ปีประสบการณ์ ความพึงพอใจ 98% และบริการหลังการขาย 24/7",
                "Track record infographic showing 500+ projects, 20+ brands, 15+ years of experience, 98% satisfaction, and 24/7 support",
              )}
              loading="lazy"
              decoding="async"
              width={1792}
              height={1024}
              sizes="(max-width: 768px) 100vw, 1280px"
              className="mx-auto block h-auto w-full rounded-[18px] object-contain shadow-[0_18px_42px_-34px_rgba(0,44,84,0.45)]"
            />
          </Reveal>
        </div>
      </section>

      {/* BRANDS */}
      <Section
        eyebrow={t(lang, "แบรนด์พันธมิตร", "Partner Brands")}
        title={t(lang, "แบรนด์ระดับโลกที่เราเป็นตัวแทนจำหน่าย", "World-class brands we represent")}
        desc={t(
          lang,
          "คัดเลือกเฉพาะแบรนด์คุณภาพ พร้อมการรับประกันและบริการหลังการขาย",
          "Only quality brands with full warranty and after-sales support",
        )}
      >
        <div className="mb-10 rounded-3xl overflow-hidden shadow-elev ring-1 ring-border bg-navy">
          <img
            src={ledLineup2026}
            alt="Matrix Intertrade New Lineup 2026 — The Leading Choice of LED Display Solutions"
            loading="lazy"
            decoding="async"
            width={1920}
            height={600}
            className="w-full h-auto object-contain"
          />
        </div>
        <div className="grid gap-3 sm:gap-5 grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {brands.map((b) => (
            <BrandCard key={b.slug} {...b} />
          ))}
        </div>
      </Section>

      {/* WHY - image showcase */}
      <section className="relative overflow-hidden border-y border-border/70 bg-[#f5f8fb] py-10 sm:py-14 md:py-16">
        <div className="relative mx-auto max-w-7xl px-4 md:px-6">
          <div className="sr-only">
            <h2>
              {t(lang, "ทำไมองค์กรชั้นนำเลือก Matrix Intertrade", "Why leading organizations choose Matrix Intertrade")}
            </h2>
            <p>
              {t(
                lang,
                "6 เหตุผลสำคัญที่ทำให้องค์กรชั้นนำไว้วางใจให้เราดูแลระบบ AV",
                "Six reasons why leading organizations trust us with their AV systems",
              )}
            </p>
            <ul>
              {why.map((w) => (
                <li key={w.title}>{w.title}: {w.desc}</li>
              ))}
            </ul>
          </div>
          <Reveal>
            <img
              src={homeWhyShowcase}
              alt={t(
                lang,
                "อินโฟกราฟิกเหตุผลที่องค์กรชั้นนำเลือก Matrix Intertrade พร้อมบริการให้คำปรึกษา ออกแบบระบบ สินค้าคุณภาพ รองรับทุกขนาด บริการหลังการขาย และประสบการณ์ด้าน AV",
                "Infographic explaining why organizations choose Matrix Intertrade: consultation, site design, quality products, project scale, after-sales service, and AV experience",
              )}
              loading="lazy"
              decoding="async"
              width={1792}
              height={1024}
              sizes="(max-width: 768px) 100vw, 1280px"
              className="mx-auto block h-auto w-full rounded-[18px] object-contain shadow-[0_18px_42px_-34px_rgba(0,44,84,0.35)]"
            />
          </Reveal>
        </div>
      </section>

      {/* PROCESS - image showcase */}
      <section className="relative overflow-hidden border-y border-border/70 bg-white py-10 sm:py-14 md:py-16">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)]" />
        <div className="relative mx-auto max-w-7xl px-4 md:px-6">
          <div className="sr-only">
            <h2>
              {t(
                lang,
                "กระบวนการที่ออกแบบมาเพื่อความสำเร็จของโปรเจ็ค",
                "A process designed for project success",
              )}
            </h2>
            <p>
              {t(
                lang,
                "ทุกขั้นตอนถูกวางให้ตรวจสอบง่าย ตั้งแต่รับโจทย์ ออกแบบ ติดตั้ง ไปจนถึงดูแลหลังส่งมอบ",
                "Every step is easy to track, from brief and design to installation and after-sales care.",
              )}
            </p>
            <ol>
              {steps.map((step) => (
                <li key={step.n}>{step.n}. {step.title} - {step.desc}</li>
              ))}
            </ol>
          </div>
          <Reveal>
            <img
              src={homeProcessShowcase}
              alt={t(
                lang,
                "อินโฟกราฟิกขั้นตอนการทำงาน ตั้งแต่รับโจทย์และสำรวจ ออกแบบ Solution เสนอราคา ติดตั้งและทดสอบระบบ ไปจนถึงส่งมอบและดูแลหลังการขาย",
                "Workflow infographic from brief and survey to solution design, quotation, installation, testing, handover, and after-sales support",
              )}
              loading="lazy"
              decoding="async"
              width={2048}
              height={921}
              sizes="(max-width: 768px) 100vw, 1280px"
              className="mx-auto block h-auto w-full rounded-[18px] object-contain shadow-[0_18px_42px_-34px_rgba(0,44,84,0.35)]"
            />
          </Reveal>
        </div>
      </section>

      {/* ARTICLES - lazy-loaded (article-contents.ts is 587KB) */}
      <Suspense fallback={
        <section className="relative overflow-hidden bg-[#f4f8fb] py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 md:px-6 text-center">
            <div className="h-8 w-48 mx-auto rounded bg-border/40 animate-pulse" />
          </div>
        </section>
      }>
        <LazyArticlesSection />
      </Suspense>

      <CTASection />
    </>
  );
}

function SectionHeader({
  eyebrow,
  title,
  desc,
}: {
  eyebrow?: string;
  title: string;
  desc?: string;
}) {
  return (
    <div className="max-w-2xl mb-6 sm:mb-10">
      {eyebrow && (
        <div className="inline-block rounded-full bg-accent/10 text-accent px-3 py-1 text-[11px] font-bold uppercase tracking-widest mb-2 sm:mb-3">
          {eyebrow}
        </div>
      )}
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary tracking-tight leading-snug">
        {title}
      </h2>
      {desc && <p className="mt-2 sm:mt-3 text-sm sm:text-base text-muted-foreground">{desc}</p>}
    </div>
  );
}

function Section({
  eyebrow,
  title,
  desc,
  children,
}: {
  eyebrow?: string;
  title: string;
  desc?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="py-10 sm:py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <SectionHeader eyebrow={eyebrow} title={title} desc={desc} />
        {children}
      </div>
    </section>
  );
}
