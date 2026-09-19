import { createFileRoute, Link } from "@tanstack/react-router";
import { startTransition, useEffect, useState } from "react";
import { PageHeader } from "@/components/site/PageHeader";
import { ArticleCard } from "@/components/site/ArticleCard";
import { CTASection } from "@/components/site/CTASection";
import { Input } from "@/components/ui/input";
import { fallbackArticleListContent, loadArticleListContent } from "@/lib/content/articles";
import { Search } from "lucide-react";
import { z } from "zod";
import heroBlog from "@/assets/hero-blog.jpg";
import { useLanguage, t } from "@/components/i18n/LanguageProvider";
import { buildSeoHead } from "@/lib/seo";

const search = z.object({ category: z.string().optional() });

export const Route = createFileRoute("/blog/")({
  validateSearch: search,
  head: () =>
    buildSeoHead({
      title: "บทความจอ LED และระบบ AV สำหรับองค์กร | Matrix Intertrade",
      description: "รวมคู่มือเลือกจอ LED Display ราคาและงบติดตั้ง Pixel Pitch เทคโนโลยี SMD COB GOB รวมถึง Interactive Display และระบบ AV สำหรับองค์กร",
      path: "/blog",
      image: heroBlog,
    }),
  component: BlogPage,
});

function BlogPage() {
  const { lang } = useLanguage();
  const { category } = Route.useSearch();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | undefined>(category);
  const [content, setContent] = useState(fallbackArticleListContent);
  const { articles, articleCategories } = content;

  useEffect(() => {
    let isCurrent = true;

    loadArticleListContent().then((nextContent) => {
      if (!isCurrent) return;
      startTransition(() => setContent(nextContent));
    });

    return () => {
      isCurrent = false;
    };
  }, []);

  const filtered = articles.filter(
    (a) => (!cat || a.category === cat) && (!q || a.title.toLowerCase().includes(q.toLowerCase())),
  );
  const featured = articles.filter((a) => a.isFeatured);
  const currentCat = cat ? articleCategories.find((c) => c.slug === cat) : null;
  return (
    <>
      <PageHeader
        eyebrow="Knowledge Hub"
        title={t(lang, "บทความและคู่มือ AV Solutions", "Articles and AV Solutions Guide")}
        desc={t(
          lang,
          "ความรู้ คู่มือเลือกซื้อ และ Case Study สำหรับองค์กรที่กำลังวางระบบ AV",
          "Knowledge, buying guides, and case studies for organizations planning AV systems.",
        )}
        breadcrumbs={[{ label: t(lang, "บทความ", "Articles") }]}
        bgImage={heroBlog}
        variant="light"
      />
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="mb-8 flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t(lang, "ค้นหาบทความ...", "Search articles...")}
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setCat(undefined)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${!cat ? "bg-gradient-accent text-white shadow-glow" : "bg-secondary text-foreground hover:bg-secondary/70"}`}
              >
                {t(lang, "ทั้งหมด", "All")}
              </button>
              {articleCategories.map((c) => (
                <button
                  key={c.slug}
                  onClick={() => setCat(c.slug)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${cat === c.slug ? "bg-gradient-accent text-white shadow-glow" : "bg-secondary text-foreground hover:bg-secondary/70"}`}
                >
                  {t(lang, c.label, c.labelEn)}
                </button>
              ))}
            </div>
          </div>

          {!cat && !q && featured.length > 0 && (
            <div className="mb-12">
              <h2 className="mb-5 text-lg font-bold text-primary">
                {t(lang, "บทความแนะนำ", "Featured Articles")}
              </h2>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {featured.map((a) => (
                  <ArticleCard key={a.id} article={a} />
                ))}
              </div>
            </div>
          )}

          <h2 className="mb-5 text-lg font-bold text-primary">
            {cat && currentCat
              ? t(lang, currentCat.label, currentCat.labelEn)
              : t(lang, "บทความล่าสุด", "Latest Articles")}{" "}
            <span className="text-sm font-normal text-muted-foreground">({filtered.length})</span>
          </h2>
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
              {t(lang, "ไม่พบบทความที่ตรงกับการค้นหา", "No articles match your search")}
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((a) => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
          )}
        </div>
      </section>
      <CTASection />
    </>
  );
}
