import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import { startTransition, useEffect, useState, useMemo } from "react";
import { PageHeader } from "@/components/site/PageHeader";
import { CTASection } from "@/components/site/CTASection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Eye, MessageCircle, Check, Sparkles, MapPin, Layers, Search, Filter, X } from "lucide-react";
import { brandIntrosByCategoryId } from "@/data/brand-intros";
import { brandImages } from "@/data/brand-images";
import {
  fallbackProductsByCategoryId,
  loadProductsByCategoryContent,
} from "@/lib/content/products";
import { loadBrandIntroContent, type SiteBrandIntro } from "@/lib/content/site";
import { useLanguage, t } from "@/components/i18n/LanguageProvider";
import { CATEGORY_IDS_BY_SLUG, CATEGORY_SLUGS } from "@/lib/seo-slugs";
import { buildSeoHead } from "@/lib/seo";

const catMap: Record<string, string> = {
  "0": "สินค้าทั้งหมด",
  "288194": "Unilumin",
  "235610": "Kramer",
  "288209": "Persona",
  "288210": "tranScreen",
  "237068": "Grandview",
  "237477": "HDMI Cable",
};

const REMOVED_CATEGORY_SLUGS = new Set(
  [
    [110, 101, 119, 108, 105, 110, 101],
    [112, 111, 108, 121],
    [118, 105, 115, 115, 111, 110, 105, 99],
    [121, 101, 97, 108, 105, 110, 107],
  ].map((codes) => String.fromCharCode(...codes)),
);

export const Route = createFileRoute("/category/$slug")({
  beforeLoad: ({ params }) => {
    if (REMOVED_CATEGORY_SLUGS.has(params.slug)) {
      throw redirect({
        to: "/category/$slug",
        params: { slug: "all-products" },
        statusCode: 301,
      });
    }

    const legacySlug = CATEGORY_SLUGS[params.slug];
    if (legacySlug) {
      throw redirect({
        to: "/category/$slug",
        params: { slug: legacySlug },
        statusCode: 301,
      });
    }

    if (!CATEGORY_IDS_BY_SLUG[params.slug]) throw notFound();
  },
  head: ({ params }) => {
    const slug = CATEGORY_SLUGS[params.slug] ?? params.slug;
    const id = CATEGORY_IDS_BY_SLUG[slug] ?? slug;
    const name = catMap[id] ?? "หมวดสินค้า";
    return buildSeoHead({
      title: `${name} | สินค้าระบบภาพและเสียง Matrix Intertrade`,
      description: `เลือกชม ${name} สำหรับระบบภาพและเสียงองค์กร พร้อมคำปรึกษาและบริการหลังการขายจาก Matrix Intertrade`,
      path: `/category/${slug}`,
    });
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { lang } = useLanguage();
  const { slug } = Route.useParams();
  const id = CATEGORY_IDS_BY_SLUG[slug] ?? slug;
  const defaultName = catMap[id]
    ? id === "0"
      ? t(lang, "สินค้าทั้งหมด", "All Products")
      : catMap[id]
    : t(lang, "หมวดสินค้า", "Category");
  const [productContent, setProductContent] = useState(() => fallbackProductsByCategoryId(id));
  const [intro, setIntro] = useState<SiteBrandIntro | undefined>(() => brandIntrosByCategoryId[id]);

  const name = intro?.name ?? defaultName;
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string>("all");

  const products = productContent.products;
  const featuredProducts = products.slice(0, 3);
  const introImage = intro ? intro.imageUrl || brandImages[intro.brandSlug] : undefined;

  const uniqueBrands = useMemo(() => {
    const brandMap = new Map<string, string>();
    products.forEach((p) => {
      if (p.brand) {
        const key = p.brand.toLowerCase();
        // Prefer the version with uppercase letters if multiple exist
        if (!brandMap.has(key) || p.brand !== key) {
          brandMap.set(key, p.brand);
        }
      }
    });
    return Array.from(brandMap.values()).sort((a, b) => a.localeCompare(b));
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.brand && p.brand.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesBrand =
        selectedBrand === "all" ||
        (p.brand && p.brand.toLowerCase() === selectedBrand.toLowerCase());
      return matchesSearch && matchesBrand;
    });
  }, [products, searchTerm, selectedBrand]);

  const isFiltering = searchTerm !== "" || selectedBrand !== "all";

  useEffect(() => {
    let isCurrent = true;
    setProductContent(fallbackProductsByCategoryId(id));
    setIntro(brandIntrosByCategoryId[id]);

    loadProductsByCategoryContent(id).then((nextContent) => {
      if (!isCurrent) return;
      startTransition(() => setProductContent(nextContent));
    });

    loadBrandIntroContent(id).then((nextIntro) => {
      if (!isCurrent || !nextIntro) return;
      startTransition(() => setIntro(nextIntro));
    });

    return () => {
      isCurrent = false;
    };
  }, [id]);

  return (
    <>
      <PageHeader
        title={name}
        breadcrumbs={[
          { label: t(lang, "สินค้า", "Products"), href: "/category/all-products" },
          { label: name },
        ]}
        variant="clean"
        compact={true}
      >
        <div className="flex flex-col gap-4 pt-1">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="relative w-full flex-1 md:max-w-xl">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t(lang, "ค้นหาสินค้า หรือแบรนด์...", "Search products or brands...")}
                className="w-full border-border/60 bg-secondary/20 pl-9 pr-10 shadow-none focus-visible:bg-white focus-visible:ring-accent transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={t(lang, "ล้างคำค้นหา", "Clear search")}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-[15px] font-medium text-muted-foreground">
                {t(lang, "พบสินค้า", "Found")}{" "}
                <span className="font-bold text-primary">{filteredProducts.length}</span>{" "}
                {t(lang, "รายการ", "items")}
              </div>
              <Button asChild variant="outline" size="sm" className="h-9 shadow-sm shrink-0">
                <Link to="/contactus">
                  <MessageCircle className="mr-1.5 h-3.5 w-3.5" />
                  {t(lang, "ปรึกษาทีมขาย", "Consult Sales")}
                </Link>
              </Button>
            </div>
          </div>

          {uniqueBrands.length > 0 && (
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex shrink-0 items-center gap-1.5 text-sm font-medium text-muted-foreground">
                <Filter className="h-4 w-4" />
                {t(lang, "แบรนด์:", "Brands:")}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedBrand("all")}
                  className={`shrink-0 rounded-lg px-4 py-1.5 text-sm font-semibold transition-all duration-300 ease-out ${
                    selectedBrand === "all"
                      ? "bg-primary text-white shadow-sm ring-1 ring-primary"
                      : "border border-border/70 bg-white text-muted-foreground hover:border-primary/30 hover:bg-secondary/10 hover:text-primary"
                  }`}
                >
                  {t(lang, "ทั้งหมด", "All")}
                </button>
                {uniqueBrands.map((brand, index) => (
                  <button
                    key={`${brand.toLowerCase()}-${index}`}
                    onClick={() => setSelectedBrand(brand)}
                    className={`shrink-0 rounded-lg px-4 py-1.5 text-sm font-semibold transition-all duration-300 ease-out ${
                      selectedBrand === brand
                        ? "bg-primary text-white shadow-sm ring-1 ring-primary"
                        : "border border-border/70 bg-white text-muted-foreground hover:border-primary/30 hover:bg-secondary/10 hover:text-primary"
                    }`}
                  >
                    {brand}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </PageHeader>

      {!isFiltering && intro && (
        <section className="border-b border-border bg-white py-12 md:py-16">
          <div className="mx-auto max-w-7xl px-4 md:px-6 grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-accent">
                <Sparkles className="h-3.5 w-3.5" /> {t(lang, "รู้จักแบรนด์", "About the Brand")}
              </div>
              <h2 className="mt-3 text-2xl md:text-3xl font-bold tracking-tight text-primary">
                {name} — {intro.tagline}
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground whitespace-pre-wrap">
                {intro.description}
              </p>
              {intro.origin && (
                <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" /> Origin: {intro.origin}
                </div>
              )}

              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <div>
                  <h3 className="text-sm font-bold text-primary mb-3">
                    {t(lang, "จุดเด่นของแบรนด์", "Brand Highlights")}
                  </h3>
                  <ul className="space-y-2">
                    {intro.highlights.map((h) => (
                      <li key={h} className="flex items-start gap-2 text-sm text-foreground/85">
                        <div className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent/15 text-accent">
                          <Check className="h-3 w-3" />
                        </div>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-primary mb-3">
                    {t(lang, "เหมาะกับการใช้งาน", "Best For")}
                  </h3>
                  <ul className="grid grid-cols-1 gap-2">
                    {intro.bestFor.map((b) => (
                      <li key={b} className="flex items-center gap-2 text-sm text-foreground/80">
                        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                <Button asChild className="bg-gradient-accent text-white shadow-glow">
                  <Link to="/contactus">
                    {t(lang, "ขอใบเสนอราคา", "Request a Quote")}{" "}
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/brands/$slug" params={{ slug: intro.brandSlug }}>
                    {t(lang, "ข้อมูลแบรนด์เพิ่มเติม", "More Brand Info")}
                  </Link>
                </Button>
              </div>
            </div>

            <div className="relative aspect-[5/4] overflow-hidden rounded-3xl shadow-elev bg-gradient-hero order-first lg:order-last">
              {introImage && (
                <img
                  src={introImage}
                  alt={`${name} brand visual`}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 text-white">
                <div className="text-xs font-bold uppercase tracking-widest opacity-90">
                  Authorized Distributor
                </div>
                <div className="text-2xl font-black drop-shadow">{name}</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {!isFiltering && intro?.productCategories && intro.productCategories.length > 0 && (
        <section className="border-b border-border bg-secondary/30 py-10 md:py-14">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/8 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-primary/70">
                <Layers className="h-3.5 w-3.5" />{" "}
                {t(lang, "หมวดสินค้าของแบรนด์", "Brand Product Categories")}
              </div>
              <h2 className="mt-3 text-xl md:text-2xl font-bold tracking-tight text-primary">
                {t(lang, `สินค้าภายใต้แบรนด์ ${name}`, `Products under ${name}`)}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {t(
                  lang,
                  `ภาพรวมกลุ่มสินค้าทั้งหมดที่ ${name} ครอบคลุม เพื่อช่วยให้คุณเลือกโซลูชันที่เหมาะสมกับการใช้งาน`,
                  `Overview of all product lines covered by ${name} to help you choose the right solution.`,
                )}
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {intro.productCategories.map((cat, i) => (
                <div
                  key={cat.name}
                  className="group relative overflow-hidden rounded-xl border border-border bg-white p-5 transition-all duration-300 hover:border-accent/40 hover:shadow-lg"
                >
                  <div className="mb-3 flex items-center gap-3">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-accent/15 to-accent/5 text-accent font-bold text-sm">
                      {i + 1}
                    </div>
                    <h3 className="text-sm font-bold text-primary leading-snug">{cat.name}</h3>
                  </div>
                  <p className="text-[13px] leading-relaxed text-muted-foreground">{cat.desc}</p>
                  <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-accent/0 via-accent/50 to-accent/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {!isFiltering && featuredProducts.length > 0 && (
        <section className="border-b border-border bg-secondary/35 py-8 md:py-10">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <div className="grid gap-4 lg:grid-cols-3">
              {featuredProducts.map((p) => (
                <Link
                  key={p.id}
                  to="/product/$slug"
                  params={{ slug: p.slug ?? p.id }}
                  className="group grid min-w-0 overflow-hidden rounded-xl border border-border/60 bg-white shadow-sm transition-all duration-500 ease-out hover:-translate-y-1 hover:border-primary/20 hover:shadow-xl sm:grid-cols-[150px_minmax(0,1fr)] lg:grid-cols-1"
                >
                  <div className="relative aspect-square min-h-[150px] bg-secondary/20 sm:aspect-auto lg:aspect-[1.15/1]">
                    <img
                      src={p.image}
                      alt={p.name}
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-contain p-7 transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                    />
                  </div>
                  <div className="flex min-w-0 flex-col justify-between gap-3 p-5">
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-accent">{p.brand}</div>
                      <h2 className="mt-1.5 line-clamp-2 text-base font-bold leading-snug text-primary transition-colors group-hover:text-accent">
                        {p.name}
                      </h2>
                    </div>
                    <div className="mt-1 flex min-w-0 items-center justify-between gap-3">
                      <span className="min-w-0 break-words text-[15px] font-bold text-primary">
                        {p.price && p.price !== "0.00"
                          ? `${p.price} ${t(lang, "บาท", "THB")}`
                          : t(lang, "ติดต่อสอบถามราคา", "Contact for Price")}
                      </span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-all duration-300 group-hover:translate-x-1 group-hover:text-accent" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="bg-white pt-2 pb-6 md:pt-4 md:pb-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="text-[15px] font-medium text-muted-foreground">
              {t(lang, "พบสินค้า", "Found")}{" "}
              <span className="font-bold text-primary">{filteredProducts.length}</span>{" "}
              {t(lang, "รายการ", "items")}
            </div>
            <Button asChild variant="outline" size="sm" className="h-9 shadow-sm">
              <Link to="/contactus">
                <MessageCircle className="mr-1.5 h-3.5 w-3.5" />
                {t(lang, "ปรึกษาทีมขาย", "Consult Sales")}
              </Link>
            </Button>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-secondary/10 py-16 text-center px-4">
              <Search className="mb-4 h-10 w-10 text-muted-foreground/50" />
              <h3 className="text-lg font-bold text-primary">
                {searchTerm || selectedBrand !== "all"
                  ? t(lang, "ไม่พบสินค้าที่ตรงกับการค้นหาของคุณ", "No products match your search criteria")
                  : t(lang, "ไม่พบสินค้าในหมวดนี้", "No products found in this category")}
              </h3>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                {t(lang, "ลองค้นหาด้วยคำอื่น หรือปรับตัวกรองแบรนด์เพื่อดูสินค้าอื่นๆ", "Try searching with different terms or adjust brand filters to see other products.")}
              </p>
              {(searchTerm || selectedBrand !== "all") && (
                <Button 
                  variant="outline" 
                  className="mt-6 min-h-10 rounded-lg px-6 font-semibold"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedBrand("all");
                  }}
                >
                  <X className="mr-1.5 h-4 w-4" />
                  {t(lang, "ล้างการค้นหา", "Clear Search")}
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((p) => {
                const hasPrice = p.price && p.price !== "0.00";
                return (
                  <article
                    key={p.id}
                    className="group flex min-w-0 flex-col overflow-hidden rounded-xl border border-border/60 bg-white shadow-sm transition-all duration-500 ease-out hover:-translate-y-1 hover:border-primary/20 hover:shadow-xl"
                  >
                    <Link
                      to="/product/$slug"
                      params={{ slug: p.slug ?? p.id }}
                      className="relative block aspect-square overflow-hidden bg-secondary/20"
                    >
                      <img
                        src={p.image}
                        alt={p.name}
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-contain p-6 transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                      />
                      {p.brand && (
                        <div className="absolute left-3 top-3 rounded-md border border-border/50 bg-white/95 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-primary shadow-sm backdrop-blur">
                          {p.brand}
                        </div>
                      )}
                    </Link>
                    <div className="flex flex-1 flex-col gap-4 p-5">
                      <div className="flex-1">
                        <h3 className="min-h-[2.75rem] text-sm font-bold leading-snug text-primary line-clamp-2 transition-colors group-hover:text-accent">
                          {p.name}
                        </h3>
                        <div className="mt-2 text-[15px]">
                          {hasPrice ? (
                            <span className="font-bold text-primary">
                              {p.price} {t(lang, "บาท", "THB")}
                            </span>
                          ) : (
                            <span className="font-semibold text-muted-foreground">
                              {t(lang, "ติดต่อสอบถามราคา", "Contact for Price")}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 pt-1">
                        <Button asChild size="sm" className="h-10 min-w-0 rounded-lg font-semibold shadow-sm">
                          <Link to="/product/$slug" params={{ slug: p.slug ?? p.id }}>
                            <Eye className="mr-1.5 h-3.5 w-3.5" />{" "}
                            {t(lang, "ดูรายละเอียด", "View Details")}
                          </Link>
                        </Button>
                        <Button asChild variant="outline" size="sm" className="h-10 w-10 rounded-lg px-0 transition-colors group-hover:border-accent/40 group-hover:bg-accent/5 group-hover:text-accent">
                          <Link
                            to="/contactus"
                            aria-label={t(
                              lang,
                              `ขอใบเสนอราคา ${p.name}`,
                              `Request quote for ${p.name}`,
                            )}
                          >
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <CTASection />
    </>
  );
}
