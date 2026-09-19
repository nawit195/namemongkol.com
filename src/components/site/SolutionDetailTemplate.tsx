import { Link } from "@tanstack/react-router";
import { PageHeader } from "./PageHeader";
import { CTASection } from "./CTASection";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";
import { resolveIcon } from "@/lib/icon-map";
import { solutionImages } from "@/data/solution-images";
import heroLed from "@/assets/hero-led.jpg";
import heroInteractive from "@/assets/hero-interactive.jpg";
import heroProjector from "@/assets/hero-projector.jpg";
import heroWireless from "@/assets/hero-wireless.jpg";
import heroAv from "@/assets/hero-av.jpg";
import { useLanguage, t } from "@/components/i18n/LanguageProvider";

const slugHero: Record<string, string> = {
  "led-display": heroLed,
  "interactive-display": heroInteractive,
  projector: heroProjector,
  "wireless-presentation": heroWireless,
  "av-solutions": heroAv,
};

type SeoSection = {
  heading: string;
  headingEn?: string;
  body: string;
  bodyEn?: string;
};

type SeoFaq = {
  question: string;
  questionEn?: string;
  answer: string;
  answerEn?: string;
};

type RelatedLink = {
  label: string;
  labelEn?: string;
  href: string;
  description?: string;
  descriptionEn?: string;
};

export function SolutionDetailTemplate({
  slug,
  title,
  iconName,
  intro,
  introEn,
  bullets,
  bulletsEn,
  applications,
  applicationsEn,
  seoSections,
  relatedLinks,
  faqs,
}: {
  slug: string;
  title: string;
  iconName: string;
  intro: string;
  introEn?: string;
  bullets: string[];
  bulletsEn?: string[];
  applications: string[];
  applicationsEn?: string[];
  seoSections?: SeoSection[];
  relatedLinks?: RelatedLink[];
  faqs?: SeoFaq[];
}) {
  const { lang } = useLanguage();
  const Icon = resolveIcon(iconName);
  const img = solutionImages[slug];
  const displayIntro = introEn ? t(lang, intro, introEn) : intro;
  const displayBullets = bulletsEn && lang === "EN" ? bulletsEn : bullets;
  const displayApps = applicationsEn && lang === "EN" ? applicationsEn : applications;
  const hasSeoContent = Boolean(seoSections?.length || relatedLinks?.length || faqs?.length);

  return (
    <>
      <PageHeader
        eyebrow="Solution"
        title={title}
        desc={displayIntro}
        breadcrumbs={[
          { label: t(lang, "โซลูชั่นของเรา", "Our Solutions"), href: "/solutions" },
          { label: title },
        ]}
        bgImage={slugHero[slug]}
      />
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-6 grid lg:grid-cols-[1.1fr_1fr] gap-10">
          <div>
            <div className="mb-6 inline-grid h-14 w-14 place-items-center rounded-xl bg-gradient-accent text-white shadow-glow">
              <Icon className="h-7 w-7" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-primary tracking-tight">
              {t(lang, `จุดเด่นของระบบ ${title}`, `Key features of ${title}`)}
            </h2>
            <ul className="mt-6 space-y-3">
              {displayBullets.map((b) => (
                <li
                  key={b}
                  className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-card"
                >
                  <div className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent/15 text-accent mt-0.5">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-sm text-foreground/85 leading-relaxed">{b}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex gap-3 flex-wrap">
              <Button asChild className="bg-gradient-accent text-white shadow-glow">
                <Link to="/contactus">
                  {t(lang, "ขอใบเสนอราคา", "Request Quote")} <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/contactus">{t(lang, "ปรึกษาผู้เชี่ยวชาญ", "Consult an Expert")}</Link>
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-elev bg-gradient-hero">
              {img && (
                <img
                  src={img}
                  alt={`${title} mockup`}
                  loading="lazy"
                  width={1280}
                  height={960}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 flex items-center gap-3 text-white">
                <div className="grid h-11 w-11 place-items-center rounded-xl glass">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-lg font-bold drop-shadow">{title}</span>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <h3 className="font-bold text-primary mb-4">
                {t(lang, "การใช้งานที่เหมาะสม", "Best Applications")}
              </h3>
              <ul className="grid grid-cols-2 gap-2">
                {displayApps.map((a) => (
                  <li key={a} className="flex items-center gap-2 text-sm text-foreground/80">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {hasSeoContent && (
        <section className="border-y border-border/70 bg-secondary/20 py-14 md:py-18">
          <div className="mx-auto max-w-5xl px-4 md:px-6">
            {seoSections?.length ? (
              <div className="space-y-8">
                {seoSections.map((section) => (
                  <article key={section.heading} className="space-y-3">
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-primary">
                      {t(lang, section.heading, section.headingEn ?? section.heading)}
                    </h2>
                    <p className="text-[15px] md:text-base leading-relaxed text-muted-foreground">
                      {t(lang, section.body, section.bodyEn ?? section.body)}
                    </p>
                  </article>
                ))}
              </div>
            ) : null}

            {relatedLinks?.length ? (
              <div className="mt-10 rounded-2xl border border-border bg-white p-5 shadow-card md:p-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-primary">
                      {t(lang, "อ่านต่อเพื่อวางแผนจอ LED", "Read more about LED screen planning")}
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {t(
                        lang,
                        "รวมบทความที่ช่วยประเมินงบ อุปกรณ์ และเทคโนโลยีก่อนเริ่มโครงการจอ LED",
                        "Guides for estimating budget, equipment, and technology before starting an LED screen project.",
                      )}
                    </p>
                  </div>
                </div>
                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  {relatedLinks.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      className="group rounded-xl border border-border bg-secondary/30 p-4 transition hover:-translate-y-0.5 hover:border-accent/40 hover:bg-accent/5"
                    >
                      <span className="flex items-start justify-between gap-3 text-sm font-bold text-primary">
                        {t(lang, link.label, link.labelEn ?? link.label)}
                        <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-accent transition group-hover:translate-x-0.5" />
                      </span>
                      {link.description ? (
                        <span className="mt-2 block text-xs leading-relaxed text-muted-foreground">
                          {t(lang, link.description, link.descriptionEn ?? link.description)}
                        </span>
                      ) : null}
                    </a>
                  ))}
                </div>
              </div>
            ) : null}

            {faqs?.length ? (
              <div className="mt-10">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-primary">
                  {t(lang, "คำถามที่พบบ่อยเกี่ยวกับจอ LED", "LED Display FAQ")}
                </h2>
                <div className="mt-5 divide-y divide-border rounded-2xl border border-border bg-white shadow-card">
                  {faqs.map((faq) => (
                    <details key={faq.question} className="group p-5">
                      <summary className="cursor-pointer list-none text-base font-bold text-primary marker:hidden">
                        {t(lang, faq.question, faq.questionEn ?? faq.question)}
                      </summary>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        {t(lang, faq.answer, faq.answerEn ?? faq.answer)}
                      </p>
                    </details>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </section>
      )}
      <CTASection />
    </>
  );
}
