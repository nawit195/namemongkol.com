import type { SupabaseClient } from "@supabase/supabase-js";
import {
  articles as fileArticles,
  articleCategories as fileArticleCategories,
  getArticle as getFileArticle,
  type Article,
} from "@/data/articles";
import type { ArticleBlock } from "@/data/article-contents";
import { supabase } from "@/integrations/supabase/client";
import {
  ensureCanonicalArticleSlugs,
  ensureUniqueArticleSlugs,
  getLegacyArticleId,
} from "@/lib/seo-slugs";

type ArticleCategory = (typeof fileArticleCategories)[number];
type ArticleWithMeta = Article & { content_html?: string; legacySlug?: string };

type ContentDatabase = {
  public: {
    Tables: {
      content_article_categories: {
        Row: {
          slug: string;
          label: string;
        };
      };
      content_articles: {
        Row: {
          article_id: number;
          title: string;
          slug: string;
          category: string;
          excerpt: string;
          published_date: string;
          read_min: number;
          canonical_url: string | null;
          cover_image_url: string | null;
          content_html: string | null;
          blocks: ArticleBlock[] | null;
          is_featured: boolean;
          seo_title: string | null;
          seo_description: string | null;
          og_title: string | null;
          og_description: string | null;
          og_image_url: string | null;
          seo_no_index: boolean | null;
          updated_at: string | null;
        };
      };
    };
  };
};

type ArticleListContent = {
  articles: ArticleWithMeta[];
  articleCategories: ArticleCategory[];
  source: "supabase" | "files";
  error?: unknown;
};

const contentClient = supabase as unknown as SupabaseClient<ContentDatabase>;

function getManagedCanonicalSlug(canonicalUrl: string | null): string | undefined {
  if (!canonicalUrl) return undefined;
  try {
    const url = new URL(canonicalUrl, "https://www.matrixintertrade.com");
    if (url.hostname !== "www.matrixintertrade.com") return undefined;
    const match = url.pathname.match(/^\/blog\/([^/]+)\/?$/);
    return match?.[1] ? decodeURIComponent(match[1]) : undefined;
  } catch {
    return undefined;
  }
}

function fromFiles(error?: unknown): ArticleListContent {
  return {
    articles: ensureUniqueArticleSlugs(fileArticles).map((article, index) => ({
      ...article,
      legacySlug: fileArticles[index]?.slug,
    })),
    articleCategories: fileArticleCategories,
    source: "files",
    error,
  };
}

export async function loadArticleListContent(): Promise<ArticleListContent> {
  try {
    const [categoriesResult, articlesResult] = await Promise.all([
      contentClient.from("content_article_categories").select("slug,label").order("slug"),
      contentClient
        .from("content_articles")
        .select(
          "article_id,title,slug,category,excerpt,published_date,read_min,canonical_url,cover_image_url,content_html,blocks,is_featured,status,seo_title,seo_description,og_title,og_description,og_image_url,seo_no_index,updated_at",
        )
        .or("status.is.null,status.neq.draft")
        .order("published_date", { ascending: false }),
    ]);

    if (categoriesResult.error) throw categoriesResult.error;
    if (articlesResult.error) throw articlesResult.error;

    const articleCategories =
      categoriesResult.data?.map((row) => ({
        slug: row.slug,
        label: row.label,
        labelEn: row.label,
      })) ?? [];

    const mappedArticles =
      articlesResult.data?.map((row) => {
        const managedSlug = getManagedCanonicalSlug(row.canonical_url);
        return {
          id: row.article_id,
          title: row.title,
          slug: managedSlug || row.slug,
          sourceSlug: row.slug,
          category: row.category,
          excerpt: row.excerpt,
          date: row.published_date,
          readMin: row.read_min ?? 0,
          canonicalUrl: row.canonical_url ?? undefined,
          coverImageUrl: row.cover_image_url ?? undefined,
          content_html: row.content_html ?? undefined,
          blocks: row.blocks ?? undefined,
          isFeatured: row.is_featured ?? false,
          seoTitle: row.seo_title,
          seoDescription: row.seo_description,
          ogTitle: row.og_title,
          ogDescription: row.og_description,
          ogImageUrl: row.og_image_url,
          seoCanonicalUrl: row.canonical_url,
          seoNoIndex: row.seo_no_index,
          updatedAt: row.updated_at,
        };
      }) ?? [];
    const articles = ensureCanonicalArticleSlugs(mappedArticles).map(
      ({ sourceSlug, ...article }) => ({
        ...article,
        legacySlug: sourceSlug !== article.slug ? sourceSlug : article.legacySlug,
      }),
    );

    if (articleCategories.length === 0 || articles.length === 0) {
      throw new Error("Supabase content snapshot is empty.");
    }

    return {
      articles,
      articleCategories,
      source: "supabase",
    };
  } catch (error) {
    console.warn("[content] Falling back to file-based article content.", error);
    return fromFiles(error);
  }
}

export async function loadArticleDetailContent(slug: string): Promise<
  ArticleListContent & {
    article: Article | undefined;
    relatedArticles: Article[];
    category: ArticleCategory | undefined;
  }
> {
  const listContent = await loadArticleListContent();
  const legacyArticleId = getLegacyArticleId(slug);
  let article = listContent.articles.find(
    (item) => item.slug === slug || item.legacySlug === slug || item.id === legacyArticleId,
  );

  if (!article && listContent.source === "supabase") {
    const fileContent = fromFiles();
    article =
      fileContent.articles.find(
        (item) => item.slug === slug || item.legacySlug === slug || item.id === legacyArticleId,
      ) ?? getFileArticle(slug);
  }

  const sourceArticles =
    article && listContent.articles.some((item) => item.slug === article.slug)
      ? listContent.articles
      : fromFiles().articles;
  const sourceCategories =
    listContent.articleCategories.length > 0
      ? listContent.articleCategories
      : fileArticleCategories;

  return {
    ...listContent,
    article,
    category: article ? sourceCategories.find((item) => item.slug === article.category) : undefined,
    relatedArticles: article
      ? sourceArticles
          .filter((item) => item.category === article.category && item.id !== article.id)
          .slice(0, 3)
      : [],
  };
}

export const fallbackArticleListContent = fromFiles();
