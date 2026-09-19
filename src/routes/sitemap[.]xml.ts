import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { loadSiteContent } from "@/lib/content/site";
import { loadArticleListContent } from "@/lib/content/articles";
import { loadProductListContent } from "@/lib/content/products";
import { SITE_URL } from "@/lib/seo";

const SOLUTION_PATHS = new Set([
  "led-display",
  "interactive-display",
  "projector",
  "wireless-presentation",
  "av-solutions",
]);

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
  lastmod?: string | null;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const [site, articleContent, productContent] = await Promise.all([
          loadSiteContent(),
          loadArticleListContent(),
          loadProductListContent(),
        ]);
        const staticPaths: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/aboutus", changefreq: "monthly", priority: "0.7" },
          { path: "/solutions", changefreq: "monthly", priority: "0.8" },
          { path: "/brands", changefreq: "monthly", priority: "0.7" },
          { path: "/product-line", changefreq: "monthly", priority: "0.6" },
          { path: "/category/all-products", changefreq: "weekly", priority: "0.7" },
          { path: "/blog", changefreq: "weekly", priority: "0.7" },
          { path: "/contactus", changefreq: "monthly", priority: "0.6" },
        ];

        const entries = [
          ...staticPaths,
          ...site.solutions.filter((s) => SOLUTION_PATHS.has(s.slug) && !s.seoNoIndex).map((s) => ({
            path: `/${s.slug}`,
            changefreq: "monthly" as const,
            priority: "0.8",
            lastmod: s.updatedAt,
          })),
          ...site.brands.filter((b) => !b.seoNoIndex).map((b) => ({
            path: `/brands/${b.slug}`,
            changefreq: "monthly" as const,
            priority: "0.6",
            lastmod: b.updatedAt,
          })),
          ...site.industries.filter((i) => !i.seoNoIndex).map((i) => ({
            path: `/industry/${i.slug}`,
            changefreq: "monthly" as const,
            priority: "0.6",
          })),
          ...articleContent.articles.filter((a) => !a.seoNoIndex).map((a) => ({
            path: `/blog/${a.slug}`,
            changefreq: "monthly" as const,
            priority: "0.5",
            lastmod: a.updatedAt || a.date,
          })),
          ...productContent.products.filter((p) => !p.seoNoIndex).map((p) => ({
            path: `/product/${p.slug}`,
            changefreq: "monthly" as const,
            priority: "0.5",
            lastmod: p.updatedAt,
          })),
        ].filter((entry, index, all) => all.findIndex((item) => item.path === entry.path) === index);

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${SITE_URL}${e.path}</loc>`,
            e.lastmod ? `    <lastmod>${new Date(e.lastmod).toISOString()}</lastmod>` : null,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
