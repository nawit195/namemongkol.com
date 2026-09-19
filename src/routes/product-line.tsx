import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { CTASection } from "@/components/site/CTASection";
import { BrandCard } from "@/components/site/BrandCard";
import { useSiteContent } from "@/lib/content/use-site-content";
import heroProductLine from "@/assets/hero-productline.jpg";
import { useLanguage, t } from "@/components/i18n/LanguageProvider";
import { buildSeoHead } from "@/lib/seo";

export const Route = createFileRoute("/product-line")({
  head: () =>
    buildSeoHead({
      title: "แบรนด์และไลน์สินค้าระบบ AV | Matrix Intertrade",
      description: "เลือกดูแบรนด์และไลน์สินค้า LED Display, Interactive Display, Projector, Wireless Presentation และอุปกรณ์ระบบ AV สำหรับองค์กร",
      path: "/product-line",
      image: heroProductLine,
    }),
  component: ProductLinePage,
});

function ProductLinePage() {
  const { lang } = useLanguage();
  const { brands } = useSiteContent();
  return (
    <>
      <PageHeader
        eyebrow="Product Line"
        title={t(lang, "Product Line ทั้งหมด", "All Product Lines")}
        desc={t(
          lang,
          "ภาพรวมแบรนด์และไลน์สินค้าที่เราจำหน่าย",
          "Overview of brands and product lines we distribute",
        )}
        breadcrumbs={[
          { label: t(lang, "สินค้า", "Products"), href: "/category/all-products" },
          { label: "Product Line" },
        ]}
        bgImage={heroProductLine}
      />
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {brands.map((b) => (
            <BrandCard key={b.slug} {...b} />
          ))}
        </div>
      </section>
      <CTASection />
    </>
  );
}
