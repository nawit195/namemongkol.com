export const CATEGORY_SLUGS: Record<string, string> = {
  "0": "all-products",
  "288194": "unilumin",
  "235610": "kramer",
  "288209": "persona",
  "288210": "transcreen",
  "237068": "grandview",
  "237477": "hdmi-cable",
  "237676": "all-products",
};

export const CATEGORY_IDS_BY_SLUG = {
  ...Object.fromEntries(Object.entries(CATEGORY_SLUGS).map(([id, slug]) => [slug, id])),
  "all-products": "0",
  kramerav: "235610",
} as Record<string, string>;

export const CATEGORY_NAMES_BY_SLUG: Record<string, string> = {
  "all-products": "All Products",
  unilumin: "Unilumin",
  kramer: "Kramer",
  persona: "Persona",
  transcreen: "tranScreen",
  grandview: "Grandview",
  "hdmi-cable": "HDMI Cable",
};

const mojibakePattern = /[\u00c0-\u00ff]{2,}|เธ|เน|โ€|ยท||||||||/;

const SEO_STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "for",
  "from",
  "in",
  "into",
  "is",
  "of",
  "on",
  "or",
  "the",
  "to",
  "with",
]);

export function slugifyText(value: string, fallback = "item"): string {
  const ascii = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .toLowerCase();

  return ascii || fallback;
}

export function slugifySeoKeyword(value: string, fallback = "item"): string {
  const base = slugifyText(value, "");
  const words = base.split("-").filter((word) => word && !SEO_STOP_WORDS.has(word));
  return words.join("-") || base || fallback;
}

export function makeUniqueSlug(base: string, existingSlugs: Iterable<string>, fallback = "item") {
  const used = new Set(Array.from(existingSlugs).map((slug) => slugifyText(slug, "")));
  const cleanBase = slugifySeoKeyword(base, fallback);
  let slug = cleanBase;
  let index = 2;
  while (used.has(slug)) {
    slug = `${cleanBase}-${index}`;
    index += 1;
  }
  return slug;
}

function uniqueSlug(base: string, used: Set<string>): string {
  let slug = base;
  let index = 2;
  while (used.has(slug)) {
    slug = `${base}-${index}`;
    index += 1;
  }
  used.add(slug);
  return slug;
}

export function buildProductSlugSource(product: {
  id: string;
  name: string;
  brand?: string;
  brandSlug?: string;
}): string {
  const name = product.name?.trim() || "";
  if (name && !mojibakePattern.test(name)) {
    return `${product.brand ?? product.brandSlug ?? ""} ${name}`.trim();
  }
  return `${product.brand ?? product.brandSlug ?? "product"} ${product.id}`;
}

export function buildArticleSlugSource(article: {
  id: number;
  title: string;
  category: string;
}): string {
  const title = article.title?.trim() || "";
  const titleSlug = slugifyText(title, "");
  if (title && !mojibakePattern.test(title) && titleSlug.split("-").filter(Boolean).length >= 3) {
    return title;
  }
  return `${article.category} guide ${article.id}`;
}

export function buildProductSlug(product: {
  id: string;
  name: string;
  brand?: string;
  brandSlug?: string;
}): string {
  return slugifyText(buildProductSlugSource(product), `product-${product.id}`);
}

export function ensureUniqueProductSlugs<
  T extends { id: string; name: string; brand?: string; brandSlug?: string },
>(products: T[]): Array<T & { slug: string }> {
  const used = new Set<string>();
  return products.map((product) => ({
    ...product,
    slug: uniqueSlug(buildProductSlug(product), used),
  }));
}

export function ensureUniqueArticleSlugs<T extends { id: number; title: string; category: string }>(
  articles: T[],
): Array<T & { slug: string }> {
  const used = new Set<string>();
  return articles.map((article) => ({
    ...article,
    slug: uniqueSlug(slugifyText(buildArticleSlugSource(article), `article-${article.id}`), used),
  }));
}

export function ensureCanonicalArticleSlugs<
  T extends { id: number; slug: string; title: string; category: string },
>(articles: T[]): Array<T & { legacySlug?: string }> {
  const used = new Set<string>();
  return articles.map((article) => {
    const legacySlug = isLegacyArticleSlug(article.slug) ? article.slug : undefined;
    const base = legacySlug
      ? slugifyText(buildArticleSlugSource(article), `article-${article.id}`)
      : slugifyText(article.slug, `article-${article.id}`);

    return {
      ...article,
      slug: uniqueSlug(base, used),
      legacySlug,
    };
  });
}

export function isLegacyArticleSlug(slug: string): boolean {
  return /^article-\d+$/.test(slug);
}

export function getLegacyArticleId(slug: string): number | undefined {
  const match = slug.match(/^article-(\d+)$/);
  return match ? Number(match[1]) : undefined;
}
