import * as dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const publishableKey =
  process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !serviceRoleKey || !publishableKey) {
  throw new Error(
    "SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and SUPABASE_PUBLISHABLE_KEY are required.",
  );
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
const publicSupabase = createClient(supabaseUrl, publishableKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

const prefix = `codex-smoke-${Date.now().toString(36)}`;
const articleId = Math.floor(Date.now() % 1_000_000_000);

const ids = {
  articleCategory: `${prefix}-category`,
  article: `${prefix}-article`,
  brand: `${prefix}-brand`,
  brandIntro: `${prefix}-brand-intro`,
  industry: `${prefix}-industry`,
  project: `${prefix}-project`,
  navItem: `${prefix}-nav`,
  product: `${prefix}-product`,
  productSlug: `${prefix}-product-slug`,
  solution: `${prefix}-solution`,
  siteSection: `${prefix}-company-profile`,
};

const contactIds = [];

async function insertRow(table, row, keyField, keyValue) {
  const { data, error } = await supabase.from(table).insert(row).select("*").single();
  if (error) throw new Error(`create failed for ${table}: ${error.message}`);
  if (String(data[keyField]) !== String(keyValue)) {
    throw new Error(`create readback mismatch for ${table}.${keyField}`);
  }
  return data;
}

async function updateAndVerify(table, keyField, keyValue, values, verify) {
  const { data, error } = await supabase
    .from(table)
    .update(values)
    .eq(keyField, keyValue)
    .select("*")
    .single();
  if (error) throw new Error(`update failed for ${table}: ${error.message}`);
  for (const [field, expected] of Object.entries(verify)) {
    if (data[field] !== expected) {
      throw new Error(
        `update readback mismatch for ${table}.${field}: expected ${expected}, got ${data[field]}`,
      );
    }
  }
  return data;
}

async function deleteRows(table, keyField, values) {
  const targets = values.filter(Boolean);
  if (targets.length === 0) return;
  const { error } = await supabase.from(table).delete().in(keyField, targets);
  if (error) console.warn(`cleanup failed for ${table}: ${error.message}`);
}

async function run() {
  await insertRow(
    "content_article_categories",
    {
      slug: ids.articleCategory,
      label: "Codex Smoke Category",
      image_url: "https://example.com/category.jpg",
      payload: { smoke: true },
    },
    "slug",
    ids.articleCategory,
  );
  await updateAndVerify(
    "content_article_categories",
    "slug",
    ids.articleCategory,
    { label: "Codex Smoke Category Updated" },
    { label: "Codex Smoke Category Updated" },
  );

  await insertRow(
    "content_brands",
    {
      slug: ids.brand,
      name: "Codex Smoke Brand",
      category: "Smoke",
      description: "Temporary smoke-test brand.",
      color: "from-blue-500 to-cyan-500",
      image_url: "https://example.com/brand.jpg",
      logo_url: "https://example.com/logo.png",
      accent: { smoke: true },
      payload: { smoke: true },
    },
    "slug",
    ids.brand,
  );
  await updateAndVerify(
    "content_brands",
    "slug",
    ids.brand,
    { description: "Temporary smoke-test brand updated." },
    { description: "Temporary smoke-test brand updated." },
  );

  await insertRow(
    "content_brand_category_intros",
    {
      category_id: ids.brandIntro,
      brand_slug: ids.brand,
      tagline: "Smoke tagline",
      description: "Smoke intro description.",
      highlights: ["Fast create"],
      best_for: ["Admin save verification"],
      origin: "Codex",
      payload: { smoke: true },
    },
    "category_id",
    ids.brandIntro,
  );
  await updateAndVerify(
    "content_brand_category_intros",
    "category_id",
    ids.brandIntro,
    { tagline: "Smoke tagline updated" },
    { tagline: "Smoke tagline updated" },
  );

  await insertRow(
    "content_products",
    {
      product_id: ids.product,
      slug: ids.productSlug,
      name: "Codex Smoke Product",
      image_url: "https://example.com/product.jpg",
      price_text: "Test only",
      source_url: "https://example.com/product",
      brand: "Codex Smoke Brand",
      brand_slug: ids.brand,
      brand_category_id: ids.brandIntro,
      description_text: "Temporary product for save smoke test.",
      description_html: "<p>Temporary product for save smoke test.</p>",
      payload: { smoke: true },
    },
    "product_id",
    ids.product,
  );
  await updateAndVerify(
    "content_products",
    "product_id",
    ids.product,
    { name: "Codex Smoke Product Updated" },
    { name: "Codex Smoke Product Updated" },
  );

  await insertRow(
    "content_articles",
    {
      slug: ids.article,
      article_id: articleId,
      title: "Codex Smoke Article",
      category: ids.articleCategory,
      excerpt: "Temporary article excerpt.",
      published_date: new Date().toISOString().slice(0, 10),
      read_min: 1,
      canonical_url: null,
      cover_image_url: "https://example.com/article.jpg",
      content_html: "<p>Temporary article for save smoke test.</p>",
      blocks: [],
      payload: { smoke: true },
    },
    "slug",
    ids.article,
  );
  await updateAndVerify(
    "content_articles",
    "slug",
    ids.article,
    { title: "Codex Smoke Article Updated" },
    { title: "Codex Smoke Article Updated" },
  );

  await insertRow(
    "content_solutions",
    {
      slug: ids.solution,
      title: "Codex Smoke Solution",
      icon: "Monitor",
      description: "Temporary solution description.",
      image_url: "https://example.com/solution.jpg",
      payload: { smoke: true },
    },
    "slug",
    ids.solution,
  );
  await updateAndVerify(
    "content_solutions",
    "slug",
    ids.solution,
    { title: "Codex Smoke Solution Updated" },
    { title: "Codex Smoke Solution Updated" },
  );

  await insertRow(
    "content_industries",
    {
      slug: ids.industry,
      title: "Codex Smoke Industry",
      icon: "Building2",
      description: "Temporary industry description.",
      image_url: "https://example.com/industry.jpg",
      payload: { smoke: true },
    },
    "slug",
    ids.industry,
  );
  await updateAndVerify(
    "content_industries",
    "slug",
    ids.industry,
    { title: "Codex Smoke Industry Updated" },
    { title: "Codex Smoke Industry Updated" },
  );

  await insertRow(
    "content_projects",
    {
      slug: ids.project,
      industry_slug: ids.industry,
      title: "Codex Smoke Project",
      excerpt: "Temporary project for admin save verification.",
      cover_image_url: "https://example.com/project-cover.jpg",
      gallery_images: [
        {
          id: "second",
          url: "https://example.com/project-2.jpg",
          alt: "Second image",
          caption: "",
        },
        {
          id: "first",
          url: "https://example.com/project-1.jpg",
          alt: "First image",
          caption: "",
        },
      ],
      content_html: "<p>Temporary project content.</p>",
      sort_order: 9999,
      status: "draft",
    },
    "slug",
    ids.project,
  );
  const draftRead = await publicSupabase
    .from("content_projects")
    .select("slug")
    .eq("slug", ids.project)
    .maybeSingle();
  if (draftRead.error || draftRead.data) {
    throw new Error("draft project was readable through the public client");
  }

  const project = await updateAndVerify(
    "content_projects",
    "slug",
    ids.project,
    {
      title: "Codex Smoke Project Updated",
      gallery_images: [
        {
          id: "first",
          url: "https://example.com/project-1.jpg",
          alt: "First image",
          caption: "",
        },
        {
          id: "second",
          url: "https://example.com/project-2.jpg",
          alt: "Second image",
          caption: "",
        },
      ],
      status: "published",
    },
    { title: "Codex Smoke Project Updated", status: "published" },
  );
  if (project.gallery_images?.[0]?.id !== "first") {
    throw new Error("project gallery order changed during save/readback");
  }
  const publishedRead = await publicSupabase
    .from("content_projects")
    .select("slug,gallery_images")
    .eq("slug", ids.project)
    .maybeSingle();
  if (
    publishedRead.error ||
    publishedRead.data?.slug !== ids.project ||
    publishedRead.data.gallery_images?.[0]?.id !== "first"
  ) {
    throw new Error("published project was not readable in saved gallery order");
  }

  await insertRow(
    "content_nav_items",
    {
      id: ids.navItem,
      parent_id: null,
      depth: 0,
      sort_order: 9999,
      label: "Codex Smoke Nav",
      href: `/${ids.solution}`,
      description: "Temporary nav item.",
      image_url: "https://example.com/nav.jpg",
      payload: { smoke: true },
    },
    "id",
    ids.navItem,
  );
  await updateAndVerify(
    "content_nav_items",
    "id",
    ids.navItem,
    { label: "Codex Smoke Nav Updated" },
    { label: "Codex Smoke Nav Updated" },
  );

  await insertRow(
    "content_site_sections",
    {
      section_key: ids.siteSection,
      is_enabled: true,
      payload: {
        kind: "company-profile-smoke-test",
        publicEmail: `${prefix}@example.com`,
      },
    },
    "section_key",
    ids.siteSection,
  );
  await updateAndVerify(
    "content_site_sections",
    "section_key",
    ids.siteSection,
    { is_enabled: false },
    { is_enabled: false },
  );

  const contact = await insertRow(
    "contact_submissions",
    {
      name: "Codex Smoke Contact",
      company: "Codex",
      email: `${prefix}@example.com`,
      phone: "0000000000",
      topic: "Smoke test",
      message: "Temporary contact submission.",
      is_read: false,
    },
    "email",
    `${prefix}@example.com`,
  );
  contactIds.push(contact.id);
  await updateAndVerify(
    "contact_submissions",
    "id",
    contact.id,
    { is_read: true },
    { is_read: true },
  );
}

async function cleanup() {
  await deleteRows("contact_submissions", "id", contactIds);
  await deleteRows("content_products", "product_id", [ids.product]);
  await deleteRows("content_articles", "slug", [ids.article]);
  await deleteRows("content_brand_category_intros", "category_id", [ids.brandIntro]);
  await deleteRows("content_solutions", "slug", [ids.solution]);
  await deleteRows("content_projects", "slug", [ids.project]);
  await deleteRows("content_industries", "slug", [ids.industry]);
  await deleteRows("content_nav_items", "id", [ids.navItem]);
  await deleteRows("content_site_sections", "section_key", [ids.siteSection]);
  await deleteRows("content_article_categories", "slug", [ids.articleCategory]);
  await deleteRows("content_brands", "slug", [ids.brand]);
}

try {
  await run();
  console.log("Admin content save smoke test passed.");
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await cleanup();
}
