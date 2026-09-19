export const SITE_URL = "https://www.matrixintertrade.com";
export const SITE_NAME = "Matrix Intertrade";

export type ManagedSeoFields = {
  seoTitle?: string | null;
  seoDescription?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImageUrl?: string | null;
  seoCanonicalUrl?: string | null;
  seoNoIndex?: boolean | null;
  updatedAt?: string | null;
};

export function absoluteUrl(value?: string | null, fallback = "/"): string {
  const source = value?.trim() || fallback;
  try {
    return new URL(source, SITE_URL).toString();
  } catch {
    return new URL(fallback, SITE_URL).toString();
  }
}

type SeoHeadInput = {
  title: string;
  description: string;
  path: string;
  canonical?: string | null;
  image?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  type?: "website" | "article" | "product";
  noIndex?: boolean | null;
};

export function buildSeoHead(input: SeoHeadInput) {
  const canonical = absoluteUrl(input.canonical, input.path);
  const image = input.image ? absoluteUrl(input.image) : undefined;
  const title = input.title.trim();
  const description = input.description.trim();
  const ogTitle = input.ogTitle?.trim() || title;
  const ogDescription = input.ogDescription?.trim() || description;

  return {
    meta: [
      { title },
      { name: "description", content: description },
      {
        name: "robots",
        content: input.noIndex ? "noindex,nofollow" : "index,follow,max-image-preview:large",
      },
      { property: "og:site_name", content: SITE_NAME },
      { property: "og:type", content: input.type ?? "website" },
      { property: "og:title", content: ogTitle },
      { property: "og:description", content: ogDescription },
      { property: "og:url", content: canonical },
      ...(image ? [{ property: "og:image", content: image }] : []),
      { name: "twitter:card", content: image ? "summary_large_image" : "summary" },
      { name: "twitter:title", content: ogTitle },
      { name: "twitter:description", content: ogDescription },
      ...(image ? [{ name: "twitter:image", content: image }] : []),
    ],
    links: [{ rel: "canonical", href: canonical }],
  };
}
