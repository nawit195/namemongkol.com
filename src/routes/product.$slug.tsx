import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import { Breadcrumb } from "@/components/site/Breadcrumb";
import { CTASection } from "@/components/site/CTASection";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Headset,
  Mail,
  Phone,
  Ruler,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { productDetailById } from "@/data/product-details";
import type { Product } from "@/data/products";
import { loadProductDetailContent } from "@/lib/content/products";
import { useLanguage, t } from "@/components/i18n/LanguageProvider";
import { CATEGORY_SLUGS } from "@/lib/seo-slugs";
import { absoluteUrl, buildSeoHead } from "@/lib/seo";
import { useSiteContent } from "@/lib/content/use-site-content";
import { companyPhoneHref, formatThaiPhone } from "@/lib/company-profile";

type ProductLoaderData = {
  product: Product;
  relatedProducts: Product[];
};

export const Route = createFileRoute("/product/$slug")({
  head: (ctx: { loaderData?: ProductLoaderData; params: { slug: string } }) => {
    const { loaderData, params } = ctx;
    const p = loaderData?.product;
    const detail = p ? productDetailById(p.id) : undefined;
    const title = p?.seoTitle || (p ? `${p.name}${p.brand ? ` ${p.brand}` : ""} | Matrix Intertrade` : "สินค้า | Matrix Intertrade");
    const desc =
      p?.seoDescription ||
      p?.descriptionText?.slice(0, 200) ||
      detail?.descriptionText?.slice(0, 200) ||
      (p
        ? `${p.name}${p.brand ? ` โดย ${p.brand}` : ""} - สอบถามและขอใบเสนอราคาจาก Matrix Intertrade`
        : "รายละเอียดสินค้า");
    const normalizedPrice = p?.price?.replace(/,/g, "").trim();
    const hasPrice = Boolean(normalizedPrice && Number(normalizedPrice) > 0);
    const canonicalPath = `/product/${p?.slug ?? params.slug}`;
    const productLd = p
      ? {
          "@context": "https://schema.org",
          "@type": "Product",
          name: p.name,
          ...(p.image ? { image: p.image } : {}),
          ...(p.brand ? { brand: { "@type": "Brand", name: p.brand } } : {}),
          description: desc,
          ...(hasPrice
            ? {
                offers: {
                  "@type": "Offer",
                  priceCurrency: "THB",
                  price: normalizedPrice,
                  availability: "https://schema.org/InStock",
                  url: absoluteUrl(canonicalPath),
                },
              }
            : {}),
        }
      : null;
    const seo = buildSeoHead({
      title,
      description: desc,
      path: canonicalPath,
      canonical: p?.seoCanonicalUrl,
      image: p?.ogImageUrl || p?.image,
      ogTitle: p?.ogTitle,
      ogDescription: p?.ogDescription,
      type: "product",
      noIndex: p?.seoNoIndex,
    });
    return {
      ...seo,
      ...(productLd
        ? { scripts: [{ type: "application/ld+json", children: JSON.stringify(productLd) }] }
        : {}),
    };
  },
  loader: async ({ params }) => {
    const content = await loadProductDetailContent(params.slug);
    const product = content.product;
    if (!product) throw notFound();
    if (product.slug && params.slug !== product.slug) {
      throw redirect({
        to: "/product/$slug",
        params: { slug: product.slug },
        statusCode: 301,
      });
    }
    return { product, relatedProducts: content.relatedProducts };
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center">
      <h1 className="text-2xl font-bold text-primary">ไม่พบสินค้า</h1>
      <p className="mt-2 text-muted-foreground">สินค้านี้อาจถูกย้ายหรือไม่มีในระบบแล้ว</p>
      <Button asChild className="mt-6">
        <Link to="/category/$slug" params={{ slug: "all-products" }}>
          ดูสินค้าทั้งหมด
        </Link>
      </Button>
    </div>
  ),
  component: ProductPage,
});

function ProductPage() {
  const { lang } = useLanguage();
  const { companyProfile } = useSiteContent();
  const { product: p, relatedProducts: related } = Route.useLoaderData() as ProductLoaderData;
  const hasPrice = p.price && p.price !== "0.00";
  const detail = productDetailById(p.id);
  const descriptionHtml = p.descriptionHtml ?? detail?.descriptionHtml;
  const introText =
    p.descriptionText?.trim() ||
    t(
      lang,
      "เลือกสินค้า AV พร้อมคำแนะนำจากทีม Matrix Intertrade สำหรับการออกแบบ ติดตั้ง และดูแลระบบในองค์กร",
      "Select AV products with advice from the Matrix Intertrade team for corporate system design, installation, and maintenance.",
    );
  const serviceHighlights = [
    { icon: Headset, label: t(lang, "ปรึกษาทีมขาย", "Consult Sales") },
    { icon: Ruler, label: t(lang, "ออกแบบระบบ", "System Design") },
    { icon: Wrench, label: t(lang, "ติดตั้งหน้างาน", "On-site Installation") },
    { icon: ShieldCheck, label: t(lang, "รับประกันสินค้า", "Product Warranty") },
  ];
  const promiseItems = [
    t(lang, "ให้คำปรึกษาและออกแบบระบบโดยทีมวิศวกร", "Consultation and system design by engineers"),
    t(
      lang,
      "ติดตั้งโดยช่างผู้ชำนาญ พร้อมตรวจเช็กหน้างาน",
      "Installation by specialists with on-site inspection",
    ),
    t(lang, "ดูแลหลังการขายและบำรุงรักษาระยะยาว", "After-sales care and long-term maintenance"),
  ];

  return (
    <>
      <section className="relative overflow-hidden border-b border-border bg-white">
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-secondary/60 to-transparent pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
          <Breadcrumb
            items={[
              { label: t(lang, "สินค้า", "Products"), href: "/category/all-products" },
              ...(p.brand
                ? [
                    {
                      label: p.brand,
                      href: `/category/${CATEGORY_SLUGS[p.brandCategoryId] ?? p.brandCategoryId}`,
                    },
                  ]
                : []),
              { label: p.name },
            ]}
          />
        </div>

        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 pb-12 md:px-6 md:pb-16 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <div className="order-2 min-w-0 lg:order-1">
            <div className="mb-4 inline-flex max-w-full items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-semibold text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              <span className="min-w-0 truncate">{p.brand || "Product"}</span>
            </div>
            <h1 className="max-w-2xl break-words text-[clamp(1.9rem,8vw,4.5rem)] font-bold leading-[1.08] tracking-normal text-primary">
              {p.name}
            </h1>
            <p className="mt-4 max-w-xl break-words text-sm leading-relaxed text-muted-foreground md:text-base">
              {introText}
            </p>

            <div className="mt-6 min-w-0 rounded-xl border border-border bg-white p-4">
              <div className="text-xs font-medium text-muted-foreground">
                {t(lang, "ราคา", "Price")}
              </div>
              {hasPrice ? (
                <div className="mt-1 break-words text-3xl font-bold text-primary">
                  {p.price} {t(lang, "บาท", "THB")}
                </div>
              ) : (
                <div className="mt-1 break-words text-xl font-bold text-primary sm:text-2xl">
                  {t(lang, "ติดต่อสอบถามราคา", "Contact for Price")}
                </div>
              )}
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                {t(
                  lang,
                  "ราคาอาจเปลี่ยนตามรุ่น สเปก และเงื่อนไขโครงการ กรุณายืนยันกับฝ่ายขาย",
                  "Prices may vary based on model, specs, and project conditions. Please confirm with sales.",
                )}
              </p>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button asChild size="lg" className="min-h-11 min-w-0 sm:min-w-48">
                <Link to="/contactus">
                  {t(lang, "ขอใบเสนอราคา", "Request Quote")} <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="min-h-11 min-w-0">
                <a href={companyPhoneHref(companyProfile.mobilePhone)}>
                  <Phone className="mr-1 h-4 w-4" /> {formatThaiPhone(companyProfile.mobilePhone)}
                </a>
              </Button>
              <Button asChild variant="outline" size="lg" className="min-h-11 min-w-0">
                <a href={`mailto:${companyProfile.publicEmail}`}>
                  <Mail className="mr-1 h-4 w-4" /> Email
                </a>
              </Button>
            </div>

            <a
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex max-w-full items-center gap-1 break-words text-xs font-medium text-muted-foreground transition-colors hover:text-accent"
            >
              {t(
                lang,
                "ดูข้อมูลต้นทางบน matrixintertrade.com",
                "View original source on matrixintertrade.com",
              )}{" "}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <div className="order-1 lg:order-2">
            <div className="relative aspect-[1.12/1] overflow-hidden rounded-xl border border-border bg-secondary/50">
              <div className="absolute inset-4 rounded-lg bg-white" />
              <img
                src={p.image}
                alt={p.name}
                className="absolute inset-0 h-full w-full object-contain p-5 sm:p-10 md:p-12"
                loading="eager"
              />
            </div>
          </div>
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pb-10 md:px-6">
          <div className="grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {serviceHighlights.map((item) => (
              <div key={item.label} className="flex items-center gap-3 bg-white px-4 py-4">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-secondary text-accent">
                  <item.icon className="h-4 w-4" />
                </div>
                <span className="min-w-0 break-words text-sm font-semibold text-primary">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-secondary/35 py-10 md:py-14">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid gap-4 md:grid-cols-3">
            {promiseItems.map((item) => (
              <div
                key={item}
                className="flex min-w-0 gap-3 rounded-xl border border-border bg-white p-4"
              >
                <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-accent" />
                <p className="min-w-0 break-words text-sm leading-relaxed text-foreground">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {descriptionHtml && (
        <section className="border-t border-border bg-white py-10 md:py-14">
          <div className="mx-auto max-w-5xl px-4 md:px-6">
            <h2 className="mb-6 text-xl font-bold text-primary md:text-2xl">
              {t(lang, "รายละเอียดสินค้า", "Product Details")}
            </h2>
            <article
              className="product-detail-content min-w-0 leading-relaxed text-foreground/90"
              dangerouslySetInnerHTML={{ __html: descriptionHtml }}
            />
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="bg-secondary/35 py-12 md:py-16">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-primary md:text-2xl">
                  {t(lang, `สินค้าอื่นในกลุ่ม ${p.brand}`, `Other products by ${p.brand}`)}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t(
                    lang,
                    "เปรียบเทียบรุ่นใกล้เคียงก่อนขอใบเสนอราคา",
                    "Compare similar models before requesting a quote",
                  )}
                </p>
              </div>
              <Button asChild variant="outline" className="min-h-11">
                <Link
                  to="/category/$slug"
                  params={{ slug: CATEGORY_SLUGS[p.brandCategoryId] ?? p.brandCategoryId }}
                >
                  {t(lang, "ดูทั้งหมด", "View All")}
                </Link>
              </Button>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((r) => (
                <Link
                  key={r.id}
                  to="/product/$slug"
                  params={{ slug: r.slug ?? r.id }}
                  className="group overflow-hidden rounded-xl border border-border bg-white transition-colors hover:border-accent/50"
                >
                  <div className="relative aspect-square overflow-hidden bg-secondary/45">
                    <img
                      src={r.image}
                      alt={r.name}
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-contain p-5 transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="p-4">
                    <div className="min-h-[2.5rem] text-sm font-bold leading-snug text-primary line-clamp-2">
                      {r.name}
                    </div>
                    <div className="mt-2 text-xs font-semibold text-accent">
                      {r.price && r.price !== "0.00"
                        ? `${r.price} ${t(lang, "บาท", "THB")}`
                        : t(lang, "ติดต่อสอบถามราคา", "Contact for Price")}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <CTASection />
    </>
  );
}
