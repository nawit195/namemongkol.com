import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { Database } from "@/integrations/supabase/types";
import { slugifyText, CATEGORY_IDS_BY_SLUG } from "@/lib/seo-slugs";
import { CompanyProfilePayloadSchema } from "@/lib/company-profile";

type ContentKind =
  | "products"
  | "articles"
  | "articleCategories"
  | "brands"
  | "solutions"
  | "industries"
  | "projects"
  | "siteSections"
  | "navItems"
  | "contactSubmissions"
  | "aboutUs";

type ContentConfig = {
  table: string;
  key: string;
  select: string;
  order: string;
  legacySelect?: string;
  legacyOrder?: string;
  schemaProbeField?: string;
  schemaFallbackWarning?: string;
  orderAscending?: boolean;
  fields: string[];
  requiredFields?: string[];
  nullableFields?: string[];
  numericFields?: string[];
  booleanFields?: string[];
  jsonFields?: Record<string, "array" | "object" | "any">;
  slugFields?: string[];
  uniqueFields?: string[];
  foreignKeys?: Array<{
    field: string;
    table: string;
    key: string;
    label: string;
  }>;
  allowCreate?: boolean;
};

const INDUSTRY_BRAND_CARD_FIELDS = [
  "show_on_brands",
  "sort_order",
  "showcase_image_url",
  "card_tag_th",
  "card_tag_en",
  "metric_value",
  "metric_label_th",
  "metric_label_en",
  "link_url",
];

const INDUSTRY_PRE_CARD_SELECT =
  "slug,title,icon,description,image_url,payload,seo_title,seo_description,seo_keywords,og_title,og_description,og_image_url,seo_canonical_url,seo_no_index,updated_at";

const UPSERTABLE_SITE_SECTIONS = new Set(["company_profile", "contact_page", "footer_settings"]);

const CONTENT_CONFIG: Record<ContentKind, ContentConfig> = {
  products: {
    table: "content_products",
    key: "product_id",
    select:
      "product_id,slug,name,image_url,price_text,source_url,brand,brand_slug,brand_category_id,description_text,description_html,payload,seo_title,seo_description,seo_keywords,og_title,og_description,og_image_url,seo_canonical_url,seo_no_index,status,updated_at",
    order: "product_id",
    orderAscending: false,
    fields: [
      "name",
      "slug",
      "image_url",
      "price_text",
      "source_url",
      "brand",
      "brand_slug",
      "brand_category_id",
      "description_text",
      "description_html",
      "payload",
      "seo_title",
      "seo_description",
      "seo_keywords",
      "og_title",
      "og_description",
      "og_image_url",
      "seo_canonical_url",
      "seo_no_index",
      "status",
    ],
    requiredFields: ["name", "slug", "brand"],
    nullableFields: [
      "image_url",
      "price_text",
      "source_url",
      "brand_slug",
      "brand_category_id",
      "description_text",
      "description_html",
      "seo_title",
      "seo_description",
      "seo_keywords",
      "og_title",
      "og_description",
      "og_image_url",
      "seo_canonical_url",
      "status",
    ],
    booleanFields: ["seo_no_index"],
    jsonFields: { payload: "object" },
    slugFields: ["slug"],
    uniqueFields: ["slug"],
    foreignKeys: [
      {
        field: "brand_slug",
        table: "content_brands",
        key: "slug",
        label: "Brand",
      },
    ],
  },
  articles: {
    table: "content_articles",
    key: "slug",
    select:
      "slug,article_id,title,category,excerpt,published_date,read_min,canonical_url,cover_image_url,content_html,blocks,payload,seo_title,seo_description,seo_keywords,og_title,og_description,og_image_url,seo_no_index,status,updated_at",
    order: "article_id",
    orderAscending: false,
    fields: [
      "slug",
      "article_id",
      "title",
      "category",
      "excerpt",
      "published_date",
      "read_min",
      "canonical_url",
      "cover_image_url",
      "content_html",
      "blocks",
      "payload",
      "seo_title",
      "seo_description",
      "seo_keywords",
      "og_title",
      "og_description",
      "og_image_url",
      "seo_no_index",
      "is_featured",
      "status",
    ],
    requiredFields: ["slug", "title", "category", "excerpt"],
    nullableFields: [
      "published_date",
      "read_min",
      "canonical_url",
      "cover_image_url",
      "content_html",
      "seo_title",
      "seo_description",
      "seo_keywords",
      "og_title",
      "og_description",
      "og_image_url",
      "status",
    ],
    numericFields: ["article_id", "read_min"],
    booleanFields: ["seo_no_index", "is_featured"],
    jsonFields: { blocks: "array", payload: "object" },
    slugFields: ["slug"],
    uniqueFields: ["slug", "article_id"],
    foreignKeys: [
      {
        field: "category",
        table: "content_article_categories",
        key: "slug",
        label: "Article category",
      },
    ],
  },
  articleCategories: {
    table: "content_article_categories",
    key: "slug",
    select: "slug,label,image_url,payload,updated_at",
    order: "slug",
    fields: ["slug", "label", "image_url", "payload"],
    requiredFields: ["slug", "label"],
    nullableFields: ["image_url"],
    jsonFields: { payload: "object" },
    slugFields: ["slug"],
    uniqueFields: ["slug"],
  },
  brands: {
    table: "content_brands",
    key: "slug",
    select:
      "slug,name,category,description,color,image_url,logo_url,accent,payload,seo_title,seo_description,seo_keywords,og_title,og_description,og_image_url,seo_canonical_url,seo_no_index,updated_at",
    order: "slug",
    fields: [
      "slug",
      "name",
      "category",
      "description",
      "color",
      "image_url",
      "logo_url",
      "accent",
      "payload",
      "seo_title",
      "seo_description",
      "seo_keywords",
      "og_title",
      "og_description",
      "og_image_url",
      "seo_canonical_url",
      "seo_no_index",
      "category_id",
      "tagline",
      "intro_description",
      "intro_image_url",
      "highlights",
      "best_for",
      "origin",
    ],
    requiredFields: ["slug", "name", "category", "description"],
    nullableFields: [
      "color",
      "image_url",
      "logo_url",
      "seo_title",
      "seo_description",
      "seo_keywords",
      "og_title",
      "og_description",
      "og_image_url",
      "seo_canonical_url",
      "intro_description",
      "intro_image_url",
      "origin",
    ],
    booleanFields: ["seo_no_index"],
    jsonFields: { accent: "object", payload: "object", highlights: "array", best_for: "array" },
    slugFields: ["slug"],
    uniqueFields: ["slug"],
  },

  solutions: {
    table: "content_solutions",
    key: "slug",
    select:
      "slug,title,icon,description,image_url,payload,seo_title,seo_description,seo_keywords,og_title,og_description,og_image_url,seo_canonical_url,seo_no_index,updated_at",
    order: "slug",
    fields: [
      "slug",
      "title",
      "icon",
      "description",
      "image_url",
      "payload",
      "seo_title",
      "seo_description",
      "seo_keywords",
      "og_title",
      "og_description",
      "og_image_url",
      "seo_canonical_url",
      "seo_no_index",
    ],
    requiredFields: ["slug", "title", "description"],
    nullableFields: [
      "icon",
      "image_url",
      "seo_title",
      "seo_description",
      "seo_keywords",
      "og_title",
      "og_description",
      "og_image_url",
      "seo_canonical_url",
    ],
    booleanFields: ["seo_no_index"],
    jsonFields: { payload: "object" },
    slugFields: ["slug"],
    uniqueFields: ["slug"],
  },
  industries: {
    table: "content_industries",
    key: "slug",
    select:
      "slug,title,icon,description,image_url,showcase_image_url,show_on_brands,sort_order,card_tag_th,card_tag_en,metric_value,metric_label_th,metric_label_en,link_url,payload,seo_title,seo_description,seo_keywords,og_title,og_description,og_image_url,seo_canonical_url,seo_no_index,updated_at",
    order: "sort_order",
    legacySelect:
      "slug,title,icon,description,image_url,show_on_brands,sort_order,card_tag_th,card_tag_en,metric_value,metric_label_th,metric_label_en,link_url,payload,seo_title,seo_description,seo_keywords,og_title,og_description,og_image_url,seo_canonical_url,seo_no_index,updated_at",
    legacyOrder: "sort_order",
    schemaProbeField: "showcase_image_url",
    schemaFallbackWarning:
      "Industries are using a legacy database schema. Apply the latest Supabase migration to edit the showcase image field.",
    fields: [
      "slug",
      "title",
      "icon",
      "description",
      "image_url",
      "showcase_image_url",
      "show_on_brands",
      "sort_order",
      "card_tag_th",
      "card_tag_en",
      "metric_value",
      "metric_label_th",
      "metric_label_en",
      "link_url",
      "payload",
      "seo_title",
      "seo_description",
      "seo_keywords",
      "og_title",
      "og_description",
      "og_image_url",
      "seo_canonical_url",
      "seo_no_index",
    ],
    requiredFields: ["slug", "title", "description"],
    nullableFields: [
      "icon",
      "image_url",
      "showcase_image_url",
      "card_tag_th",
      "card_tag_en",
      "metric_value",
      "metric_label_th",
      "metric_label_en",
      "link_url",
      "seo_title",
      "seo_description",
      "seo_keywords",
      "og_title",
      "og_description",
      "og_image_url",
      "seo_canonical_url",
    ],
    numericFields: ["sort_order"],
    booleanFields: ["show_on_brands", "seo_no_index"],
    jsonFields: { payload: "object" },
    slugFields: ["slug"],
    uniqueFields: ["slug"],
  },
  projects: {
    table: "content_projects",
    key: "slug",
    select:
      "slug,industry_slug,title,excerpt,cover_image_url,gallery_images,content_html,sort_order,status,created_at,updated_at",
    order: "sort_order",
    orderAscending: true,
    fields: [
      "slug",
      "industry_slug",
      "title",
      "excerpt",
      "cover_image_url",
      "gallery_images",
      "content_html",
      "sort_order",
      "status",
    ],
    requiredFields: ["slug", "industry_slug", "title"],
    nullableFields: ["excerpt", "cover_image_url", "content_html"],
    numericFields: ["sort_order"],
    jsonFields: { gallery_images: "array" },
    slugFields: ["slug", "industry_slug"],
    uniqueFields: ["slug"],
    foreignKeys: [
      {
        field: "industry_slug",
        table: "content_industries",
        key: "slug",
        label: "Project category",
      },
    ],
  },
  siteSections: {
    table: "content_site_sections",
    key: "section_key",
    select:
      "section_key,eyebrow_th,eyebrow_en,title_prefix_th,title_prefix_en,title_highlight_th,title_highlight_en,description_prefix_th,description_prefix_en,description_highlight_th,description_highlight_en,description_suffix_th,description_suffix_en,is_enabled,payload,updated_at",
    order: "section_key",
    fields: [
      "eyebrow_th",
      "eyebrow_en",
      "title_prefix_th",
      "title_prefix_en",
      "title_highlight_th",
      "title_highlight_en",
      "description_prefix_th",
      "description_prefix_en",
      "description_highlight_th",
      "description_highlight_en",
      "description_suffix_th",
      "description_suffix_en",
      "is_enabled",
      "payload",
    ],
    requiredFields: ["eyebrow_th", "eyebrow_en", "title_prefix_th", "title_prefix_en"],
    nullableFields: [
      "title_highlight_th",
      "title_highlight_en",
      "description_prefix_th",
      "description_prefix_en",
      "description_highlight_th",
      "description_highlight_en",
      "description_suffix_th",
      "description_suffix_en",
    ],
    booleanFields: ["is_enabled"],
    jsonFields: { payload: "object" },
    allowCreate: false,
  },
  aboutUs: {
    table: "content_about_us",
    key: "id",
    select: "*",
    order: "id",
    allowCreate: false,
    fields: [
      "intro_title_th",
      "intro_title_en",
      "intro_desc_th",
      "intro_desc_en",
      "story_p1_th",
      "story_p1_en",
      "story_p2_th",
      "story_p2_en",
      "story_p3_th",
      "story_p3_en",
      "mission_th",
      "mission_en",
      "vision_th",
      "vision_en",
      "values_th",
      "values_en",
      "address_th",
      "address_en",
      "phone",
      "email",
      "website",
      "facebook",
      "map_url",
      "stats_payload",
    ],
    nullableFields: [
      "intro_title_th",
      "intro_title_en",
      "intro_desc_th",
      "intro_desc_en",
      "story_p1_th",
      "story_p1_en",
      "story_p2_th",
      "story_p2_en",
      "story_p3_th",
      "story_p3_en",
      "mission_th",
      "mission_en",
      "vision_th",
      "vision_en",
      "values_th",
      "values_en",
      "address_th",
      "address_en",
      "phone",
      "email",
      "website",
      "facebook",
      "map_url",
      "stats_payload",
    ],
    jsonFields: { stats_payload: "array" },
  },
  navItems: {
    table: "content_nav_items",
    key: "id",
    select: "id,parent_id,depth,sort_order,label,href,description,image_url,payload,updated_at",
    order: "sort_order",
    fields: [
      "parent_id",
      "depth",
      "sort_order",
      "label",
      "href",
      "description",
      "image_url",
      "payload",
    ],
    requiredFields: ["depth", "sort_order", "label", "href"],
    nullableFields: ["parent_id", "description", "image_url"],
    numericFields: ["depth", "sort_order"],
    jsonFields: { payload: "object" },
    foreignKeys: [
      {
        field: "parent_id",
        table: "content_nav_items",
        key: "id",
        label: "Parent navigation item",
      },
    ],
  },
  contactSubmissions: {
    table: "contact_submissions",
    key: "id",
    select: "id,name,company,email,phone,topic,message,created_at,is_read",
    order: "created_at",
    fields: [
      "id",
      "name",
      "company",
      "email",
      "phone",
      "topic",
      "message",
      "created_at",
      "is_read",
    ],
    requiredFields: ["name", "email", "phone"],
    nullableFields: ["company", "topic", "message"],
    booleanFields: ["is_read"],
    allowCreate: false,
  },
};

const UpdateSchema = z.object({
  kind: z.enum([
    "products",
    "articles",
    "articleCategories",
    "brands",
    "brandIntros",
    "solutions",
    "industries",
    "projects",
    "siteSections",
    "navItems",
    "contactSubmissions",
    "aboutUs",
  ]),
  action: z.enum(["update", "create", "delete"]).optional().default("update"),
  id: z.string().min(1),
  values: z.record(z.unknown()),
});

function jsonError(message: string, status: number, details?: unknown) {
  return Response.json({ error: message, details }, { status });
}

function getAdminEmails() {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function normalizeValue(value: unknown) {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function tableName(config: ContentConfig) {
  return config.table as keyof Database["public"]["Tables"];
}

function normalizeId(config: ContentConfig, id: string) {
  const trimmed = id.trim();
  return config.key === "slug" ? slugifyText(trimmed, "") : trimmed;
}

function productIdSequence(productId: unknown) {
  const match = String(productId ?? "").match(/(\d+)$/);
  return match ? Number(match[1]) : -1;
}

function sortProductsNewestFirst(items: Record<string, unknown>[]) {
  return [...items].sort((left, right) => {
    const sequenceDifference =
      productIdSequence(right.product_id) - productIdSequence(left.product_id);
    if (sequenceDifference !== 0) return sequenceDifference;
    return String(right.product_id ?? "").localeCompare(String(left.product_id ?? ""));
  });
}

function isPlainObject(value: unknown) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function fieldLabel(field: string) {
  return field
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function normalizeContentValues(config: ContentConfig, rawValues: Record<string, unknown>) {
  const values: Record<string, unknown> = {};

  for (const [field, value] of Object.entries(rawValues)) {
    if (!config.fields.includes(field)) continue;

    let nextValue = normalizeValue(value);
    if (config.slugFields?.includes(field) && typeof nextValue === "string") {
      nextValue = slugifyText(nextValue, "");
    }

    if (nextValue === null) {
      values[field] = null;
      continue;
    }

    if (config.numericFields?.includes(field)) {
      const numberValue =
        typeof nextValue === "number" ? nextValue : Number(String(nextValue ?? "").trim());
      if (!Number.isFinite(numberValue)) {
        return {
          error: jsonError(`${fieldLabel(field)} must be a valid number.`, 400),
          values,
        };
      }
      values[field] = numberValue;
      continue;
    }

    if (config.booleanFields?.includes(field)) {
      if (typeof nextValue === "boolean") {
        values[field] = nextValue;
      } else if (nextValue === "true" || nextValue === "false") {
        values[field] = nextValue === "true";
      } else {
        return {
          error: jsonError(`${fieldLabel(field)} must be true or false.`, 400),
          values,
        };
      }
      continue;
    }

    values[field] = nextValue;
  }

  for (const [field, shape] of Object.entries(config.jsonFields ?? {})) {
    if (!(field in values) || values[field] === null) continue;
    const value = values[field];
    const valid =
      shape === "any" ||
      (shape === "array" && Array.isArray(value)) ||
      (shape === "object" && isPlainObject(value));
    if (!valid) {
      return {
        error: jsonError(`${fieldLabel(field)} must be valid ${shape} JSON.`, 400),
        values,
      };
    }
  }

  return { values };
}

function validateRequiredFields(
  config: ContentConfig,
  id: string,
  values: Record<string, unknown>,
  action: "create" | "update",
) {
  if (!id) return jsonError("Primary key (ID/Slug) is required.", 400);

  for (const field of config.requiredFields ?? []) {
    if (action === "update" && !(field in values)) continue;
    const value = values[field];
    if (value === null || value === undefined || (typeof value === "string" && !value.trim())) {
      return jsonError(`${fieldLabel(field)} is required.`, 400);
    }
  }

  return null;
}

function validateProjectValues(values: Record<string, unknown>) {
  if ("status" in values && values.status !== "draft" && values.status !== "published") {
    return jsonError("Project status must be draft or published.", 400);
  }

  if ("gallery_images" in values) {
    if (!Array.isArray(values.gallery_images)) {
      return jsonError("Gallery images must be an array.", 400);
    }
    for (const [index, image] of values.gallery_images.entries()) {
      if (!isPlainObject(image)) {
        return jsonError(`Gallery image ${index + 1} is invalid.`, 400);
      }
      const item = image as Record<string, unknown>;
      if (
        typeof item.id !== "string" ||
        !item.id.trim() ||
        typeof item.url !== "string" ||
        !item.url.trim()
      ) {
        return jsonError(`Gallery image ${index + 1} requires an id and URL.`, 400);
      }
      if (
        (item.alt !== undefined && typeof item.alt !== "string") ||
        (item.caption !== undefined && typeof item.caption !== "string")
      ) {
        return jsonError(`Gallery image ${index + 1} has invalid text metadata.`, 400);
      }
    }
  }

  if (values.status === "published") {
    const required = ["title", "industry_slug", "cover_image_url"];
    const missing = required.filter((field) => {
      const value = values[field];
      return typeof value !== "string" || !value.trim();
    });
    if (missing.length > 0) {
      return jsonError(`A visible project requires: ${missing.map(fieldLabel).join(", ")}.`, 400);
    }
  }

  return null;
}

async function ensureItemExists(config: ContentConfig, id: string) {
  const { data, error } = await supabaseAdmin
    .from(tableName(config))
    .select(config.key)
    .eq(config.key, id)
    .maybeSingle();

  if (error) return jsonError("Failed to verify the item before saving.", 500, error);
  if (!data) return jsonError("This item no longer exists. Refresh and try again.", 404);
  return null;
}

async function ensureUniqueFields(
  config: ContentConfig,
  id: string,
  values: Record<string, unknown>,
  action: "create" | "update",
) {
  for (const field of config.uniqueFields ?? []) {
    if (!(field in values)) continue;
    const value = values[field];
    if (value === null || value === undefined || value === "") continue;

    let query = supabaseAdmin.from(tableName(config)).select(config.key).eq(field, value).limit(1);

    if (action === "update") query = query.neq(config.key, id);

    const { data, error } = await query.maybeSingle();
    if (error) return jsonError(`Failed to validate ${fieldLabel(field)}.`, 500, error);
    if (data) {
      return jsonError(
        `${fieldLabel(field)} is already in use. Choose a different value before saving.`,
        409,
      );
    }
  }

  return null;
}

async function ensureForeignKeys(config: ContentConfig, values: Record<string, unknown>) {
  for (const fk of config.foreignKeys ?? []) {
    const value = values[fk.field];
    if (value === null || value === undefined || value === "") continue;

    const { data, error } = await supabaseAdmin
      .from(fk.table as keyof Database["public"]["Tables"])
      .select(fk.key)
      .eq(fk.key, value)
      .maybeSingle();

    if (error) return jsonError(`Failed to validate ${fk.label}.`, 500, error);
    if (!data) {
      return jsonError(`${fk.label} "${String(value)}" does not exist.`, 400);
    }
  }

  return null;
}

async function hasColumn(config: ContentConfig, field: string) {
  const { error } = await supabaseAdmin
    .from(tableName(config))
    .select(field)
    .limit(1)
    .maybeSingle();

  return !error;
}

function dropColumnFromSelect(select: string, field: string) {
  return select
    .split(",")
    .filter((column) => column.trim() !== field)
    .join(",");
}

async function selectForWrite(config: ContentConfig, values: Record<string, unknown>) {
  let select = config.select;
  const writeValues = { ...values };

  if (config.table === "content_industries") {
    const hasBrandCardFields = await hasColumn(config, "show_on_brands");
    const hasShowcaseImageField = await hasColumn(config, "showcase_image_url");

    if (!hasBrandCardFields) {
      INDUSTRY_BRAND_CARD_FIELDS.forEach((field) => {
        delete writeValues[field];
      });
      select = INDUSTRY_PRE_CARD_SELECT;
    } else if (!hasShowcaseImageField) {
      delete writeValues.showcase_image_url;
      select = config.legacySelect ?? dropColumnFromSelect(config.select, "showcase_image_url");
    }
  }

  if (
    config.table !== "content_industries" &&
    config.legacySelect &&
    config.schemaProbeField &&
    !(await hasColumn(config, config.schemaProbeField))
  ) {
    select = config.legacySelect;
    delete writeValues[config.schemaProbeField];
  }

  if (!("image_url" in writeValues) || (await hasColumn(config, "image_url"))) {
    return { values: writeValues, select };
  }

  const fallbackValues = { ...writeValues };
  delete fallbackValues.image_url;
  return {
    values: fallbackValues,
    select: select
      .split(",")
      .filter((column) => column.trim() !== "image_url")
      .join(","),
  };
}

async function executeWrite(
  config: ContentConfig,
  action: "create" | "update",
  id: string,
  values: Record<string, unknown>,
) {
  const write = await selectForWrite(config, values);
  const query = supabaseAdmin.from(tableName(config));

  if (action === "create") {
    return query
      .insert({ [config.key]: id, ...write.values })
      .select(write.select)
      .single();
  }

  return query.update(write.values).eq(config.key, id).select(write.select).single();
}

async function upsertSiteSection(
  config: ContentConfig,
  id: string,
  values: Record<string, unknown>,
) {
  const write = await selectForWrite(config, {
    is_enabled: true,
    ...values,
  });
  return supabaseAdmin
    .from(tableName(config))
    .upsert({ [config.key]: id, ...write.values }, { onConflict: config.key })
    .select(write.select)
    .single();
}

async function requireAdmin(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { response: jsonError("Unauthorized: missing bearer token", 401) };
  }

  const adminEmails = getAdminEmails();
  if (adminEmails.length === 0) {
    return {
      response: jsonError(
        "Admin access is not configured. Set ADMIN_EMAILS to a comma-separated allow-list.",
        403,
      ),
    };
  }

  const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const SUPABASE_PUBLISHABLE_KEY =
    process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    return { response: jsonError("Supabase auth environment is not configured", 500) };
  }

  const token = authHeader.replace("Bearer ", "");
  const authClient = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data, error } = await authClient.auth.getUser(token);
  const email = data.user?.email?.toLowerCase();
  if (error || !email) {
    return { response: jsonError("Unauthorized: invalid session", 401) };
  }

  if (!adminEmails.includes(email)) {
    return { response: jsonError("Forbidden: this user is not an admin", 403) };
  }

  return { email };
}

async function loadKind(config: ContentConfig) {
  const result = await supabaseAdmin
    .from(tableName(config))
    .select(config.select)
    .order(config.order, { ascending: config.orderAscending ?? true });

  if (result.error && config.legacySelect && config.legacyOrder) {
    const fallbackResult = await supabaseAdmin
      .from(tableName(config))
      .select(config.legacySelect)
      .order(config.legacyOrder, { ascending: config.orderAscending ?? true });

    if (!fallbackResult.error) {
      console.warn(`[admin] ${config.table} loaded with legacy schema fallback`, result.error);
      return {
        ...fallbackResult,
        warning:
          config.schemaFallbackWarning ?? `${config.table} was loaded with legacy schema fallback.`,
      };
    }
  }

  if (result.error && config.table === "content_industries") {
    const legacyCardSelect =
      "slug,title,icon,description,image_url,payload,seo_title,seo_description,seo_keywords,og_title,og_description,og_image_url,seo_canonical_url,seo_no_index,updated_at";
    const fallbackResult = await supabaseAdmin
      .from(tableName(config))
      .select(legacyCardSelect)
      .order("slug", { ascending: true });

    if (!fallbackResult.error) {
      console.warn(`[admin] ${config.table} loaded with pre-card schema fallback`, result.error);
      return {
        ...fallbackResult,
        warning:
          "Industries are using the pre-card database schema. Apply Supabase migrations before editing homepage and /brands card settings.",
      };
    }
  }

  // If the query failed (e.g. missing column like image_url), retry without optional columns
  if (result.error && config.select.includes("image_url")) {
    const fallbackSelect = dropColumnFromSelect(config.select, "image_url");
    const fallbackResult = await supabaseAdmin
      .from(tableName(config))
      .select(fallbackSelect)
      .order(config.order, { ascending: config.orderAscending ?? true });

    if (!fallbackResult.error) {
      console.warn(`[admin] Column image_url missing from ${config.table}, loaded without it`);
      return {
        ...fallbackResult,
        warning: `Column image_url is missing from ${config.table}; loaded without images.`,
      };
    }
  }

  return result;
}

async function loadPreviewItem(kind: "products" | "articles", id: string) {
  const config = CONTENT_CONFIG[kind];
  const normalizedId = normalizeId(config, id);
  const query = supabaseAdmin.from(tableName(config)).select(config.select);

  if (kind === "products") {
    const bySlug = await query.eq("slug", normalizedId).maybeSingle();
    if (bySlug.data || bySlug.error) return bySlug;
    return supabaseAdmin
      .from(tableName(config))
      .select(config.select)
      .eq("product_id", id.trim())
      .maybeSingle();
  }

  return query.eq("slug", normalizedId).maybeSingle();
}

export const Route = createFileRoute("/api/admin/content")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const admin = await requireAdmin(request);
        if ("response" in admin) return admin.response;

        const url = new URL(request.url);
        const previewKind = url.searchParams.get("previewKind");
        const previewId = url.searchParams.get("previewId");

        if (previewKind || previewId) {
          if (previewKind !== "products" && previewKind !== "articles") {
            return jsonError("Preview is only available for products and articles.", 400);
          }
          if (!previewId?.trim()) {
            return jsonError("Preview item id is required.", 400);
          }

          const result = await loadPreviewItem(previewKind, previewId);
          if (result.error)
            return jsonError(`Failed to load ${previewKind} preview`, 500, result.error);
          if (!result.data) return jsonError("Preview item not found.", 404);

          return Response.json({
            ok: true,
            kind: previewKind,
            item: result.data,
            userEmail: admin.email,
          });
        }

        const entries = await Promise.all(
          Object.entries(CONTENT_CONFIG).map(async ([kind, config]) => {
            const result = await loadKind(config);
            return [kind, result] as const;
          }),
        );

        const payload: Record<string, unknown> = { ok: true, userEmail: admin.email };
        const loadWarnings: Record<string, string> = {};
        for (const [kind, result] of entries) {
          if (result.error) {
            if (kind === "siteSections") {
              payload[kind] = [];
              loadWarnings[kind] =
                "Site section editing requires the latest Supabase migration. Public pages are using file fallbacks.";
              continue;
            }
            return jsonError(`Failed to load ${kind}`, 500, result.error);
          }
          const data = (result.data ?? []) as Record<string, unknown>[];
          payload[kind] = kind === "products" ? sortProductsNewestFirst(data) : data;
          if ("warning" in result && result.warning) {
            loadWarnings[kind] = String(result.warning);
          }
        }
        if (Object.keys(loadWarnings).length > 0) payload.loadWarnings = loadWarnings;

        // Fetch brand intros manually and merge them into brands
        if (payload.brands) {
          const { data: brandIntrosData } = await supabaseAdmin
            .from("content_brand_category_intros")
            .select(
              "category_id,brand_slug,tagline,description,image_url,highlights,best_for,origin",
            );

          const brands = payload.brands as Record<string, unknown>[];
          const intros = brandIntrosData || [];

          payload.brands = brands.map((brand) => {
            const intro = intros.find((i) => i.brand_slug === brand.slug);
            return {
              ...brand,
              category_id: intro?.category_id || "",
              tagline: intro?.tagline || "",
              intro_description: intro?.description || "",
              intro_image_url: intro?.image_url || "",
              highlights: intro?.highlights || [],
              best_for: intro?.best_for || [],
              origin: intro?.origin || "",
            };
          });
        }

        return Response.json(payload);
      },
      POST: async ({ request }) => {
        const admin = await requireAdmin(request);
        if ("response" in admin) return admin.response;

        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return jsonError("Invalid JSON body", 400);
        }

        const parsed = UpdateSchema.safeParse(body);
        if (!parsed.success)
          return jsonError("Invalid content payload", 400, parsed.error.flatten());

        const config = CONTENT_CONFIG[parsed.data.kind];
        const action = parsed.data.action;
        const id = normalizeId(config, parsed.data.id);

        if (action === "delete") {
          if (!id) return jsonError("Primary key (ID/Slug) is required.", 400);
          if (parsed.data.kind === "siteSections") {
            return jsonError("Site sections cannot be deleted from Content Management.", 400);
          }
          const { error } = await supabaseAdmin.from(tableName(config)).delete().eq(config.key, id);

          if (error) return jsonError(`Failed to delete ${parsed.data.kind}`, 500, error);
          return Response.json({ ok: true, kind: parsed.data.kind, deletedId: id });
        }

        if (action === "create" && config.allowCreate === false) {
          return jsonError(`${parsed.data.kind} cannot be created from Content Management.`, 400);
        }

        const normalized = normalizeContentValues(config, parsed.data.values);
        if ("error" in normalized && normalized.error) return normalized.error;
        const values = normalized.values;

        if (parsed.data.kind === "products" && !values.brand_slug && values.brand) {
          values.brand_slug = slugifyText(values.brand as string, "");
        }

        if (parsed.data.kind === "industries") {
          const hasBrandCardFields = await hasColumn(config, "show_on_brands");
          const hasShowcaseImageField = await hasColumn(config, "showcase_image_url");
          const submittedBrandCardFields = INDUSTRY_BRAND_CARD_FIELDS.filter(
            (field) => field in values,
          );
          const submittedLegacyCardFields = submittedBrandCardFields.filter(
            (field) => field !== "showcase_image_url",
          );
          if (submittedLegacyCardFields.length > 0 && !hasBrandCardFields) {
            return jsonError(
              "Industry brand card fields are not available yet. Apply the latest Supabase migration before editing /brands card settings.",
              400,
              {
                missingMigration: "20260616090000_add_industry_brand_card_fields.sql",
                fields: submittedBrandCardFields,
              },
            );
          }
          if ("showcase_image_url" in values && !hasShowcaseImageField) {
            return jsonError(
              "Industry showcase image is not available yet. Apply migration 20260616110000_add_industry_showcase_admin_fields.sql before editing this field.",
              400,
              {
                missingMigration: "20260616110000_add_industry_showcase_admin_fields.sql",
                fields: ["showcase_image_url"],
              },
            );
          }

          if (
            hasBrandCardFields &&
            (values.sort_order === null || values.sort_order === undefined)
          ) {
            values.sort_order = 0;
          }
          if (
            hasBrandCardFields &&
            (values.show_on_brands === null || values.show_on_brands === undefined)
          ) {
            values.show_on_brands = true;
          }
        }

        if (parsed.data.kind === "projects") {
          if (action === "create") {
            values.status ??= "draft";
            values.gallery_images ??= [];
            values.sort_order ??= 0;
          }
          const projectError = validateProjectValues(values);
          if (projectError) return projectError;
        }

        if (parsed.data.kind === "siteSections" && !(await hasColumn(config, "section_key"))) {
          return jsonError(
            "Site section settings are not available yet. Apply migration 20260616110000_add_industry_showcase_admin_fields.sql before editing section copy.",
            400,
            { missingMigration: "20260616110000_add_industry_showcase_admin_fields.sql" },
          );
        }

        if (parsed.data.kind === "siteSections" && id === "company_profile") {
          const profile = CompanyProfilePayloadSchema.safeParse(values.payload);
          if (!profile.success) {
            return jsonError(
              "ข้อมูลบริษัทยังไม่ครบหรือมีรูปแบบไม่ถูกต้อง",
              400,
              profile.error.flatten(),
            );
          }
          values.payload = profile.data;
        }

        if (Object.keys(values).length === 0) {
          return jsonError("No supported fields to update", 400);
        }

        const requiredError = validateRequiredFields(config, id, values, action);
        if (requiredError) return requiredError;

        if (
          parsed.data.kind === "siteSections" &&
          UPSERTABLE_SITE_SECTIONS.has(id) &&
          action !== "delete"
        ) {
          const result = await upsertSiteSection(config, id, values);
          if (result.error) {
            return jsonError(`Failed to save ${parsed.data.kind}`, 500, result.error);
          }
          return Response.json({ ok: true, kind: parsed.data.kind, item: result.data });
        }

        if (action === "update") {
          const existsError = await ensureItemExists(config, id);
          if (existsError) return existsError;
        }

        const uniqueError = await ensureUniqueFields(config, id, values, action);
        if (uniqueError) return uniqueError;

        const fkError = await ensureForeignKeys(config, values);
        if (fkError) return fkError;

        if (action === "create" && parsed.data.kind === "articles" && !values.article_id) {
          const { data: maxIdData } = await supabaseAdmin
            .from("content_articles")
            .select("article_id")
            .order("article_id", { ascending: false })
            .limit(1)
            .maybeSingle();
          values.article_id = (maxIdData?.article_id || 0) + 1;
        }

        // Auto-generate product_id for new products (when sent as "new-{timestamp}")
        if (action === "create" && parsed.data.kind === "products" && id.startsWith("new-")) {
          const { data: productIds, error: productIdsError } = await supabaseAdmin
            .from("content_products")
            .select("product_id");

          if (productIdsError) {
            return jsonError("Failed to generate product ID", 500, productIdsError);
          }

          const maxSequence = (productIds ?? []).reduce(
            (maximum, item) => Math.max(maximum, productIdSequence(item.product_id)),
            0,
          );
          const newId = `prod-${maxSequence + 1}`;

          // Replace the temporary ID with the generated one
          return executeWrite(config, action, newId, values).then((result) => {
            if (result.error) {
              if (result.error.code === "23505") {
                return jsonError(
                  `A ${parsed.data.kind} item with this ID or slug already exists.`,
                  409,
                  result.error,
                );
              }
              return jsonError(`Failed to ${action} ${parsed.data.kind}`, 500, result.error);
            }
            return Response.json({ ok: true, kind: parsed.data.kind, item: result.data });
          });
        }

        // Custom intercept for "brands" to save into both tables
        if (parsed.data.kind === "brands") {
          const brandSlug = id || (values.slug as string);
          const introValues = {
            category_id: values.category_id || CATEGORY_IDS_BY_SLUG[brandSlug] || "",
            brand_slug: brandSlug,
            tagline: values.tagline || "",
            description: values.intro_description || "",
            image_url: values.intro_image_url || "",
            highlights: values.highlights || [],
            best_for: values.best_for || [],
            origin: values.origin || "",
          };

          delete values.category_id;
          delete values.tagline;
          delete values.intro_description;
          delete values.intro_image_url;
          delete values.highlights;
          delete values.best_for;
          delete values.origin;

          const result = await executeWrite(config, action, id, values);
          if (result.error)
            return jsonError(`Failed to ${action} ${parsed.data.kind}`, 500, result.error);

          if (introValues.category_id) {
            await supabaseAdmin.from("content_brand_category_intros").upsert(introValues);
          }

          const combinedData = {
            ...result.data,
            category_id: introValues.category_id,
            tagline: introValues.tagline,
            intro_description: introValues.description,
            intro_image_url: introValues.image_url,
            highlights: introValues.highlights,
            best_for: introValues.best_for,
            origin: introValues.origin,
          };

          return Response.json({ ok: true, kind: parsed.data.kind, item: combinedData });
        }

        const result = await executeWrite(config, action, id, values);

        if (result.error) {
          if (result.error.code === "23505") {
            return jsonError(
              `A ${parsed.data.kind} item with this ID or slug already exists.`,
              409,
              result.error,
            );
          }

          if (result.error.code === "23503") {
            return jsonError(
              "A referenced item does not exist. Check linked category or brand.",
              400,
              result.error,
            );
          }

          if (result.error.code === "23502") {
            return jsonError("A required field is missing.", 400, result.error);
          }

          if (result.error.code === "PGRST116" && action === "update") {
            return jsonError(
              "This item no longer exists. Refresh and try again.",
              404,
              result.error,
            );
          }

          return jsonError(`Failed to ${action} ${parsed.data.kind}`, 500, result.error);
        }
        return Response.json({ ok: true, kind: parsed.data.kind, item: result.data });
      },
    },
  },
});
