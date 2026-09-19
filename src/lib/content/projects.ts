import { supabase } from "@/integrations/supabase/client";

export type ProjectGalleryImage = {
  id: string;
  url: string;
  alt?: string;
  caption?: string;
};

export type SiteProject = {
  slug: string;
  industrySlug: string;
  title: string;
  excerpt: string;
  coverImageUrl: string;
  galleryImages: ProjectGalleryImage[];
  contentHtml: string;
  sortOrder: number;
  updatedAt?: string;
};

type ProjectRow = {
  slug?: unknown;
  industry_slug?: unknown;
  title?: unknown;
  excerpt?: unknown;
  cover_image_url?: unknown;
  gallery_images?: unknown;
  content_html?: unknown;
  sort_order?: unknown;
  updated_at?: unknown;
};

const PROJECT_SELECT =
  "slug,industry_slug,title,excerpt,cover_image_url,gallery_images,content_html,sort_order,updated_at";

function asText(value: unknown) {
  return typeof value === "string" ? value : "";
}

function mapGallery(value: unknown): ProjectGalleryImage[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item, index) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return [];
    const image = item as Record<string, unknown>;
    const url = asText(image.url).trim();
    if (!url) return [];
    return [
      {
        id: asText(image.id).trim() || `gallery-${index + 1}`,
        url,
        alt: asText(image.alt),
        caption: asText(image.caption),
      },
    ];
  });
}

function mapProject(row: ProjectRow): SiteProject | null {
  const slug = asText(row.slug).trim();
  const industrySlug = asText(row.industry_slug).trim();
  const title = asText(row.title).trim();
  if (!slug || !industrySlug || !title) return null;
  return {
    slug,
    industrySlug,
    title,
    excerpt: asText(row.excerpt),
    coverImageUrl: asText(row.cover_image_url),
    galleryImages: mapGallery(row.gallery_images),
    contentHtml: asText(row.content_html),
    sortOrder:
      typeof row.sort_order === "number" && Number.isFinite(row.sort_order) ? row.sort_order : 0,
    updatedAt: asText(row.updated_at) || undefined,
  };
}

export async function loadPublishedProjects(industrySlug: string) {
  try {
    const { data, error } = await supabase
      .from("content_projects")
      .select(PROJECT_SELECT)
      .eq("industry_slug", industrySlug)
      .eq("status", "published")
      .order("sort_order", { ascending: true })
      .order("updated_at", { ascending: false });

    if (error) return { projects: [] as SiteProject[], error: error.message };
    return {
      projects: ((data ?? []) as ProjectRow[])
        .map(mapProject)
        .filter((project): project is SiteProject => Boolean(project)),
      error: null,
    };
  } catch (error) {
    return {
      projects: [] as SiteProject[],
      error: error instanceof Error ? error.message : "Unable to load projects.",
    };
  }
}

export async function loadPublishedProject(industrySlug: string, projectSlug: string) {
  try {
    const { data, error } = await supabase
      .from("content_projects")
      .select(PROJECT_SELECT)
      .eq("industry_slug", industrySlug)
      .eq("slug", projectSlug)
      .eq("status", "published")
      .maybeSingle();

    if (error) return { project: null, error: error.message };
    return { project: data ? mapProject(data as ProjectRow) : null, error: null };
  } catch (error) {
    return {
      project: null,
      error: error instanceof Error ? error.message : "Unable to load this project.",
    };
  }
}

export async function findPublishedProjectBySlug(projectSlug: string) {
  try {
    const { data, error } = await supabase
      .from("content_projects")
      .select(PROJECT_SELECT)
      .eq("slug", projectSlug)
      .eq("status", "published")
      .maybeSingle();
    if (error || !data) return null;
    return mapProject(data as ProjectRow);
  } catch {
    return null;
  }
}
