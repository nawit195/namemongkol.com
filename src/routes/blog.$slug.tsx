import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import { useEffect } from "react";
import { PageHeader } from "@/components/site/PageHeader";
import { CTASection } from "@/components/site/CTASection";
import { ArticleCard } from "@/components/site/ArticleCard";
import { articleContents } from "@/data/article-contents";
import { loadArticleDetailContent } from "@/lib/content/articles";
import { Calendar, Clock, Tag, ExternalLink, Eye, ArrowRight, UserRound } from "lucide-react";
import heroBlog from "@/assets/hero-blog.jpg";
import { incrementArticleView, useArticleViews, formatViews } from "@/lib/article-views";
import { useQueryClient } from "@tanstack/react-query";
import { useLanguage, t } from "@/components/i18n/LanguageProvider";
import { absoluteUrl, buildSeoHead } from "@/lib/seo";
import { COMPANY_SCHEMA_ID } from "@/lib/company-profile";

const ledDisplayHubArticleSlugs = new Set([
  "led-led-display",
  "led-1-led-display",
  "led-display-vs-lcd-display",
]);

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    const content = await loadArticleDetailContent(params.slug);
    const article = content.article;
    if (!article) throw notFound();
    if (params.slug !== article.slug) {
      throw redirect({
        to: "/blog/$slug",
        params: { slug: article.slug },
        statusCode: 301,
      });
    }
    return { article, category: content.category, relatedArticles: content.relatedArticles };
  },
  head: ({ loaderData, params }) => {
    const article = loaderData?.article;
    const title = article?.seoTitle || (article ? `${article.title} | Matrix Intertrade` : "ไม่พบบทความ | Matrix Intertrade");
    const description = article?.seoDescription || article?.excerpt || "บทความนี้อาจถูกย้ายหรือไม่มีในระบบแล้ว";
    const slug = article?.slug ?? params.slug;
    const canonicalPath = `/blog/${slug}`;
    const image = article?.ogImageUrl || article?.coverImageUrl || heroBlog;
    const seo = buildSeoHead({
      title,
      description,
      path: canonicalPath,
      canonical: article?.seoCanonicalUrl || article?.canonicalUrl,
      image,
      ogTitle: article?.ogTitle,
      ogDescription: article?.ogDescription,
      type: "article",
      noIndex: article?.seoNoIndex,
    });

    return {
      ...seo,
      scripts: article
        ? [
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Article",
                headline: article.title,
                description: article.excerpt,
                image: absoluteUrl(image),
                datePublished: article.date,
                dateModified: article.updatedAt || article.date,
                author: {
                  "@type": "Organization",
                  "@id": COMPANY_SCHEMA_ID,
                },
                publisher: {
                  "@type": "Organization",
                  "@id": COMPANY_SCHEMA_ID,
                },
                mainEntityOfPage: absoluteUrl(canonicalPath),
              }),
            },
          ]
        : [],
    };
  },
  component: BlogDetail,
  notFoundComponent: () => <div className="p-20 text-center">ไม่พบบทความ</div>,
  errorComponent: () => <div className="p-20 text-center">เกิดข้อผิดพลาด</div>,
});

function BlogDetail() {
  const { lang } = useLanguage();
  const { article, category: cat, relatedArticles: related } = Route.useLoaderData();
  const content =
    articleContents[article.legacySlug ?? article.slug] ?? articleContents[article.slug];
  const blocks = article.blocks ?? content?.blocks ?? [];
  const firstImg = blocks.find((b) => b.t === "img") as { t: "img"; src: string } | undefined;
  const coverImg = article.coverImageUrl ?? firstImg?.src;
  const contentBlocks = blocks.filter((b) => b !== firstImg);
  const { data: views } = useArticleViews();
  const viewCount = views?.[article.slug] ?? 0;
  const shouldShowLedDisplayHubCta =
    article.category === "led-display" ||
    ledDisplayHubArticleSlugs.has(article.slug) ||
    Boolean(article.legacySlug && ledDisplayHubArticleSlugs.has(article.legacySlug));
  const queryClient = useQueryClient();
  useEffect(() => {
    incrementArticleView(article.slug).then((counted) => {
      if (counted) queryClient.invalidateQueries({ queryKey: ["article-views"] });
    });
  }, [article.slug, queryClient]);
  return (
    <>
      <PageHeader
        eyebrow={t(lang, cat?.label ?? "", cat?.labelEn ?? cat?.label ?? "")}
        title={article.title}
        breadcrumbs={[
          { label: t(lang, "บทความ", "Articles"), href: "/blog" },
          { label: t(lang, cat?.label ?? "", cat?.labelEn ?? cat?.label ?? "") },
        ]}
        bgImage={coverImg ?? heroBlog}
      />
      <article className="py-12 md:py-16">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <div className="mb-8 flex flex-wrap items-center gap-5 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {article.date}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {article.readMin} {t(lang, "นาทีในการอ่าน", "min read")}
            </span>
            <Link to="/aboutus" className="inline-flex items-center gap-1.5 hover:text-accent">
              <UserRound className="h-4 w-4" />
              {t(lang, "ทีม Matrix Intertrade", "Matrix Intertrade team")}
            </Link>
            <span
              className="inline-flex items-center gap-1.5"
              title={t(lang, "ยอดเข้าชม", "Views")}
            >
              <Eye className="h-4 w-4" />
              {formatViews(viewCount)} {t(lang, "ครั้ง", "views")}
            </span>
            {cat && (
              <Link
                to="/blog"
                search={{ category: cat.slug }}
                className="inline-flex items-center gap-1.5 text-accent font-semibold"
              >
                <Tag className="h-4 w-4" />
                {t(lang, cat.label, cat.labelEn ?? cat.label)}
              </Link>
            )}
          </div>
          <div className="aspect-square rounded-2xl bg-gradient-hero shadow-elev mb-10 relative overflow-hidden">
            {coverImg && (
              <img
                src={coverImg}
                alt={article.title}
                className="absolute inset-0 h-full w-full object-cover"
                loading="eager"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          </div>
          <div className="prose prose-lg max-w-none text-foreground/85 leading-relaxed space-y-5">
            <p className="text-xl text-foreground font-medium">{article.excerpt}</p>
            {article.content_html ? (
              <div
                dangerouslySetInnerHTML={{ __html: article.content_html }}
                className="article-rich-text prose prose-lg max-w-none prose-img:aspect-square prose-img:object-cover prose-img:rounded-xl prose-img:border prose-img:border-border prose-img:shadow-card prose-headings:text-primary prose-a:text-accent prose-a:no-underline hover:prose-a:underline"
              />
            ) : (
              contentBlocks.map((b, i) => {
                if (b.t === "img")
                  return (
                    <img
                      key={i}
                      src={b.src}
                      alt={`${article.title} - ภาพประกอบ`}
                      loading="lazy"
                      className="my-6 w-full aspect-square object-cover rounded-xl border border-border shadow-card"
                    />
                  );
                if (b.t === "h2")
                  return (
                    <h2 key={i} className="text-2xl font-bold text-primary mt-10 mb-3">
                      {b.text}
                    </h2>
                  );
                if (b.t === "h3")
                  return (
                    <h3 key={i} className="text-xl font-bold text-primary mt-6 mb-2">
                      {b.text}
                    </h3>
                  );
                if (b.t === "li")
                  return (
                    <li key={i} className="ml-6 list-disc">
                      {b.text}
                    </li>
                  );
                return (
                  <p key={i} className="leading-relaxed">
                    {b.text}
                  </p>
                );
              })
            )}
            {(article.canonicalUrl || content?.url) && (
              <p className="pt-6 text-sm text-muted-foreground">
                <a
                  href={article.canonicalUrl || content?.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-accent font-semibold hover:underline"
                >
                  {t(lang, "อ่านบนเว็บไซต์ matrixintertrade.com", "Read on matrixintertrade.com")}
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </p>
            )}
          </div>
        </div>
        {shouldShowLedDisplayHubCta ? (
          <div className="mx-auto mt-10 max-w-3xl px-4 md:px-6">
            <div className="rounded-2xl border border-accent/25 bg-accent/5 p-5 shadow-card md:p-6">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">
                {t(lang, "โซลูชันหลัก", "Main solution")}
              </p>
              <h2 className="mt-2 text-2xl font-bold text-primary">
                {t(lang, "ต้องการเริ่มโครงการจอ LED สำหรับองค์กร?", "Planning an enterprise LED Display project?")}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {t(
                  lang,
                  "ดูภาพรวมบริการขาย ออกแบบ ติดตั้ง และเลือกสเปกจอ LED ที่เหมาะกับพื้นที่จริงขององค์กร",
                  "Explore consultation, design, installation, and specification guidance for real enterprise spaces.",
                )}
              </p>
              <Link
                to="/led-display"
                className="mt-5 inline-flex items-center gap-2 rounded-md bg-gradient-accent px-4 py-2 text-sm font-semibold text-white shadow-glow"
              >
                {t(lang, "ดูบริการจอ LED สำหรับองค์กร", "View enterprise LED Display service")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ) : null}
      </article>

      {related.length > 0 && (
        <section className="bg-gradient-subtle py-16">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <h2 className="text-2xl font-bold text-primary mb-8">
              {t(lang, "บทความที่เกี่ยวข้อง", "Related Articles")}
            </h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((a) => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
          </div>
        </section>
      )}

      <CTASection />
    </>
  );
}
