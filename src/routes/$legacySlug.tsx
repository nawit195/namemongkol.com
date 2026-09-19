import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { articleContents } from "@/data/article-contents";
import { articles } from "@/data/articles";
import { ensureUniqueArticleSlugs } from "@/lib/seo-slugs";

const canonicalArticles = new Map(
  ensureUniqueArticleSlugs(articles).map((article) => [article.id, article.slug]),
);

const legacyArticleRedirects = new Map(
  Object.entries(articleContents).flatMap(([legacyKey, content]) => {
    const articleId = Number(legacyKey.replace(/^article-/, ""));
    const targetSlug = canonicalArticles.get(articleId);
    if (!targetSlug) return [];

    const legacyPath = decodeURIComponent(new URL(content.url).pathname.replace(/^\/+|\/+$/g, ""));
    return [[legacyPath, targetSlug] as const];
  }),
);

export const Route = createFileRoute("/$legacySlug")({
  beforeLoad: ({ params }) => {
    const targetSlug = legacyArticleRedirects.get(decodeURIComponent(params.legacySlug));
    if (!targetSlug) throw notFound();

    throw redirect({
      to: "/blog/$slug",
      params: { slug: targetSlug },
      statusCode: 301,
    });
  },
  head: () => ({
    meta: [{ name: "robots", content: "noindex,nofollow" }],
  }),
  component: () => null,
});
