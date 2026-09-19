#!/usr/bin/env node
import { promises as fs } from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

import * as dotenv from "dotenv";
import ts from "typescript";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const cwd = process.cwd();
const require = createRequire(import.meta.url);
const dataSourceDir = path.join(cwd, "src", "data");
const transpiledDir = path.join(cwd, "tmp", "transpiled-data");
const defaultReportFile = path.join(cwd, "tmp", "content-import-report.json");
const requiredTables = [
  "content_article_categories",
  "content_brands",
  "content_brand_category_intros",
  "content_solutions",
  "content_industries",
  "content_nav_items",
  "content_articles",
  "content_products",
];
const solutionImageSources = {
  "led-display": "@/assets/solution-led-display.jpg",
  "interactive-display": "@/assets/solution-interactive-display.jpg",
  projector: "@/assets/solution-projector.jpg",
  "wireless-presentation": "@/assets/solution-wireless-presentation.jpg",
  "av-solutions": "@/assets/solution-av-solutions.jpg",
};

function parseArgs(argv) {
  const options = {
    dryRun: false,
    reportFile: defaultReportFile,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--dry-run") options.dryRun = true;
    else if (arg === "--report-file") options.reportFile = path.resolve(cwd, argv[++index]);
    else if (arg.startsWith("--report-file="))
      options.reportFile = path.resolve(cwd, arg.slice("--report-file=".length));
    else if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

function printHelp() {
  console.log(`Usage: node scripts/import-content-to-supabase.mjs [options]

Options:
  --dry-run               Build the content payload and write a report without uploading.
  --report-file=path      Write a JSON report to a custom path.
`);
}

function getRuntimeConfig() {
  return {
    supabaseUrl: process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };
}

function createAdminClient(runtimeConfig) {
  if (!runtimeConfig.supabaseUrl || !runtimeConfig.serviceRoleKey) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
  }

  return createClient(runtimeConfig.supabaseUrl, runtimeConfig.serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

async function ensureDir(filePath) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
}

async function writeReport(filePath, data) {
  await ensureDir(filePath);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

async function transpileDataModules() {
  await fs.rm(transpiledDir, { recursive: true, force: true });
  await fs.mkdir(transpiledDir, { recursive: true });
  await fs.writeFile(
    path.join(transpiledDir, "package.json"),
    JSON.stringify({ type: "commonjs" }, null, 2),
  );

  const entries = await fs.readdir(dataSourceDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".ts")) continue;

    const sourcePath = path.join(dataSourceDir, entry.name);
    const targetPath = path.join(transpiledDir, entry.name.replace(/\.ts$/, ".js"));
    const source = await fs.readFile(sourcePath, "utf8");
    const output = ts.transpileModule(source, {
      compilerOptions: {
        target: ts.ScriptTarget.ES2020,
        module: ts.ModuleKind.CommonJS,
        esModuleInterop: true,
        moduleResolution: ts.ModuleResolutionKind.NodeJs,
      },
      fileName: entry.name,
    });

    await fs.writeFile(targetPath, output.outputText, "utf8");
  }
}

function loadTranspiledModule(name) {
  const modulePath = path.join(transpiledDir, `${name}.js`);
  delete require.cache[require.resolve(modulePath)];
  return require(modulePath);
}

function firstArticleImage(blocks) {
  return blocks.find((block) => block?.t === "img" && typeof block.src === "string")?.src ?? null;
}

function publicImageUrl(value) {
  if (!value || typeof value !== "string") return null;
  const url = value.trim();
  if (!url || url.startsWith("@/") || url.startsWith("src/")) return null;
  return /^(https?:\/\/|\/|data:image\/|blob:)/i.test(url) ? url : null;
}

const mojibakePattern = /[\u00c0-\u00ff]{2,}|เธ|เน|โ€|ยท||||||||/;

function slugifyText(value, fallback) {
  const ascii = String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .toLowerCase();

  return ascii || fallback;
}

function uniqueSlug(base, used) {
  let slug = base;
  let index = 2;
  while (used.has(slug)) {
    slug = `${base}-${index}`;
    index += 1;
  }
  used.add(slug);
  return slug;
}

function productSlugSource(product) {
  const name = product.name?.trim() ?? "";
  if (name && !mojibakePattern.test(name)) {
    return `${product.brand ?? product.brandSlug ?? ""} ${name}`.trim();
  }
  return `${product.brand ?? product.brandSlug ?? "product"} ${product.id}`;
}

function articleSlugSource(article) {
  const title = article.title?.trim() ?? "";
  const titleSlug = slugifyText(title, "");
  if (title && !mojibakePattern.test(title) && titleSlug.split("-").filter(Boolean).length >= 3) {
    return title;
  }
  return `${article.category} guide ${article.id}`;
}

function buildNavRows(nav) {
  const rows = [];

  nav.forEach((item, index) => {
    const parentId = `nav:${index}`;
    rows.push({
      id: parentId,
      parent_id: null,
      depth: 0,
      sort_order: index,
      label: item.label,
      href: item.href,
      description: null,
      image_url: null,
      payload: item,
    });

    item.submenu?.forEach((subItem, subIndex) => {
      rows.push({
        id: `${parentId}:${subIndex}`,
        parent_id: parentId,
        depth: 1,
        sort_order: subIndex,
        label: subItem.label,
        href: subItem.href,
        description: subItem.desc ?? null,
        image_url: subItem.image ?? null,
        payload: subItem,
      });
    });
  });

  return rows;
}

function buildBrandRows(
  brands,
  brandImages,
  brandLogos,
  brandAccent,
  brandIntrosByCategoryId,
  products,
) {
  const rows = brands.map((brand) => ({
    slug: brand.slug,
    name: brand.name,
    category: brand.category,
    description: brand.desc,
    color: brand.color ?? null,
    image_url: brandImages[brand.slug] ?? null,
    logo_url: brandLogos[brand.slug] ?? null,
    accent: brandAccent[brand.slug] ?? null,
    payload: {
      ...brand,
      image: brandImages[brand.slug] ?? null,
      logo: brandLogos[brand.slug] ?? null,
      accent: brandAccent[brand.slug] ?? null,
    },
  }));

  const knownSlugs = new Set(rows.map((row) => row.slug));

  for (const intro of Object.values(brandIntrosByCategoryId)) {
    if (knownSlugs.has(intro.brandSlug)) continue;

    rows.push({
      slug: intro.brandSlug,
      name: intro.brandSlug,
      category: "Auxiliary",
      description: intro.description,
      color: null,
      image_url: brandImages[intro.brandSlug] ?? null,
      logo_url: brandLogos[intro.brandSlug] ?? null,
      accent: brandAccent[intro.brandSlug] ?? null,
      payload: {
        slug: intro.brandSlug,
        derivedFrom: "brand-intros",
        intro,
      },
    });
    knownSlugs.add(intro.brandSlug);
  }

  for (const product of products) {
    if (knownSlugs.has(product.brandSlug)) continue;

    rows.push({
      slug: product.brandSlug,
      name: product.brand ?? product.brandSlug,
      category: "Auxiliary",
      description: `Derived from product catalog for brand slug "${product.brandSlug}".`,
      color: null,
      image_url: brandImages[product.brandSlug] ?? null,
      logo_url: brandLogos[product.brandSlug] ?? null,
      accent: brandAccent[product.brandSlug] ?? null,
      payload: {
        slug: product.brandSlug,
        derivedFrom: "products",
        sampleProductId: product.id,
        sampleProductName: product.name,
      },
    });
    knownSlugs.add(product.brandSlug);
  }

  return rows;
}

function buildPayload() {
  const siteModule = loadTranspiledModule("site");
  const articlesModule = loadTranspiledModule("articles");
  const articleContentsModule = loadTranspiledModule("article-contents");
  const articleImagesModule = loadTranspiledModule("article-images");
  const brandImagesModule = loadTranspiledModule("brand-images");
  const brandIntrosModule = loadTranspiledModule("brand-intros");
  const brandLogosModule = loadTranspiledModule("brand-logos");
  const productsModule = loadTranspiledModule("products");
  const productDetailsModule = loadTranspiledModule("product-details");

  const { nav, brands, solutions, industries, articleCategories } = siteModule;
  const { articles } = articlesModule;
  const { articleContents } = articleContentsModule;
  const { articleImages } = articleImagesModule;
  const { brandImages } = brandImagesModule;
  const { brandIntrosByCategoryId } = brandIntrosModule;
  const { brandLogos, brandAccent } = brandLogosModule;
  const { products } = productsModule;
  const { productDetails } = productDetailsModule;
  const brandRows = buildBrandRows(
    brands,
    brandImages,
    brandLogos,
    brandAccent,
    brandIntrosByCategoryId,
    products,
  );

  return {
    articleCategories: articleCategories.map((category) => ({
      slug: category.slug,
      label: category.label,
      image_url: articleImages[category.slug] ?? null,
      payload: {
        ...category,
        image: articleImages[category.slug] ?? null,
      },
    })),
    brands: brandRows,
    brandCategoryIntros: Object.entries(brandIntrosByCategoryId).map(([categoryId, intro]) => ({
      category_id: categoryId,
      brand_slug: intro.brandSlug,
      tagline: intro.tagline,
      description: intro.description,
      highlights: intro.highlights,
      best_for: intro.bestFor,
      origin: intro.origin ?? null,
      payload: intro,
    })),
    solutions: solutions.map((solution) => ({
      slug: solution.slug,
      title: solution.title,
      icon: solution.icon ?? null,
      description: solution.desc,
      image_url: publicImageUrl(solutionImageSources[solution.slug]),
      payload: {
        ...solution,
        image: solutionImageSources[solution.slug] ?? null,
      },
    })),
    industries: industries.map((industry) => ({
      slug: industry.slug,
      title: industry.title,
      icon: industry.icon ?? null,
      description: industry.desc,
      payload: industry,
    })),
    navItems: buildNavRows(nav),
    articles: (() => {
      const used = new Set();
      return articles.map((article) => {
        const content = articleContents[article.slug] ?? { url: null, blocks: [] };
        const coverImageUrl =
          firstArticleImage(content.blocks) ?? articleImages[article.category] ?? null;

        return {
          slug: uniqueSlug(slugifyText(articleSlugSource(article), `article-${article.id}`), used),
          article_id: article.id,
          title: article.title,
          category: article.category,
          excerpt: article.excerpt,
          published_date: article.date,
          read_min: article.readMin,
          canonical_url: content.url ?? null,
          cover_image_url: coverImageUrl,
          blocks: content.blocks ?? [],
          payload: {
            ...article,
            content,
            coverImageUrl,
          },
        };
      });
    })(),
    products: (() => {
      const used = new Set();
      return products.map((product) => {
        const detail = productDetails[product.id] ?? {
          descriptionText: null,
          descriptionHtml: null,
        };
        return {
          product_id: product.id,
          slug: uniqueSlug(slugifyText(productSlugSource(product), `product-${product.id}`), used),
          name: product.name,
          image_url: product.image ?? null,
          price_text: product.price ?? null,
          source_url: product.url ?? null,
          brand: product.brand,
          brand_slug: product.brandSlug,
          brand_category_id: product.brandCategoryId ?? null,
          description_text: detail.descriptionText ?? null,
          description_html: detail.descriptionHtml ?? null,
          payload: {
            ...product,
            detail,
          },
        };
      });
    })(),
  };
}

async function runPreflight(supabase) {
  const checks = {};

  for (const tableName of requiredTables) {
    try {
      const { error } = await supabase
        .from(tableName)
        .select("*", { head: true, count: "exact" })
        .limit(1);
      checks[tableName] = {
        ok: !error,
        error: error?.message ?? null,
      };
    } catch (error) {
      checks[tableName] = {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  return {
    ok: requiredTables.every((tableName) => checks[tableName]?.ok),
    checks,
  };
}

async function upsertTable(supabase, table, rows, onConflict) {
  if (rows.length === 0) return 0;

  const { error } = await supabase.from(table).upsert(rows, { onConflict, defaultToNull: false });
  if (error) throw error;
  return rows.length;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  await transpileDataModules();
  const payload = buildPayload();

  const report = {
    generatedAt: new Date().toISOString(),
    dryRun: options.dryRun,
    counts: {
      articleCategories: payload.articleCategories.length,
      brands: payload.brands.length,
      brandCategoryIntros: payload.brandCategoryIntros.length,
      solutions: payload.solutions.length,
      industries: payload.industries.length,
      navItems: payload.navItems.length,
      articles: payload.articles.length,
      products: payload.products.length,
    },
  };

  if (options.dryRun) {
    await writeReport(options.reportFile, report);
    console.log(`Dry run report written to ${options.reportFile}`);
    return;
  }

  const runtimeConfig = getRuntimeConfig();
  const supabase = createAdminClient(runtimeConfig);
  const preflight = await runPreflight(supabase);
  report.preflight = preflight;

  if (!preflight.ok) {
    await writeReport(options.reportFile, report);
    throw new Error(
      "One or more required content tables are missing. Apply the Supabase migration first.",
    );
  }

  report.upserted = {
    content_article_categories: await upsertTable(
      supabase,
      "content_article_categories",
      payload.articleCategories,
      "slug",
    ),
    content_brands: await upsertTable(supabase, "content_brands", payload.brands, "slug"),
    content_brand_category_intros: await upsertTable(
      supabase,
      "content_brand_category_intros",
      payload.brandCategoryIntros,
      "category_id",
    ),
    content_solutions: await upsertTable(supabase, "content_solutions", payload.solutions, "slug"),
    content_industries: await upsertTable(
      supabase,
      "content_industries",
      payload.industries,
      "slug",
    ),
    content_nav_items: await upsertTable(supabase, "content_nav_items", payload.navItems, "id"),
    content_articles: await upsertTable(
      supabase,
      "content_articles",
      payload.articles,
      "article_id",
    ),
    content_products: await upsertTable(
      supabase,
      "content_products",
      payload.products,
      "product_id",
    ),
  };

  await writeReport(options.reportFile, report);
  console.log(`Content import report written to ${options.reportFile}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
