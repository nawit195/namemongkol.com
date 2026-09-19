import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { SolutionCard } from "@/components/site/SolutionCard";
import { CTASection } from "@/components/site/CTASection";
import { useSiteContent } from "@/lib/content/use-site-content";
import heroSolutions from "@/assets/hero-solutions.jpg";
import { useLanguage, t } from "@/components/i18n/LanguageProvider";
import { ArrowRight } from "lucide-react";
import { buildSeoHead } from "@/lib/seo";

export const Route = createFileRoute("/solutions")({
  head: () =>
    buildSeoHead({
      title: "โซลูชัน LED Display และระบบ AV สำหรับองค์กร | Matrix Intertrade",
      description: "โซลูชัน LED Display, Interactive Display, Projector, Wireless Presentation และระบบ AV ครบวงจรสำหรับองค์กรไทย",
      path: "/solutions",
      image: heroSolutions,
    }),
  component: SolutionsPage,
});

function SolutionsPage() {
  const { lang } = useLanguage();
  const { solutions } = useSiteContent();

  return (
    <>
      <PageHeader
        eyebrow="Solutions"
        title={t(lang, "โซลูชั่นของเรา", "Our Solutions")}
        desc={t(
          lang,
          "ทุกโซลูชั่นออกแบบมาเพื่อรองรับการใช้งานจริงในระดับองค์กร พร้อมการดูแลตลอดอายุการใช้งาน",
          "Every solution is designed for real-world enterprise use, complete with lifetime support.",
        )}
        breadcrumbs={[{ label: t(lang, "โซลูชั่นของเรา", "Our Solutions") }]}
        bgImage={heroSolutions}
        variant="light"
      />
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {solutions.map((s) => (
            <SolutionCard key={s.slug} {...s} />
          ))}
        </div>
        <div className="mx-auto mt-8 max-w-7xl px-4 text-center md:px-6">
          <Link
            to="/led-display"
            className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/5 px-5 py-2.5 text-sm font-semibold text-accent transition hover:bg-accent/10"
          >
            {t(lang, "ดูรายละเอียดจอ LED สำหรับองค์กร", "View enterprise LED Display details")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
      <CTASection />
    </>
  );
}
