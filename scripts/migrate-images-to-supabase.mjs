#!/usr/bin/env node
import crypto from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

import * as dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const cwd = process.cwd();
const defaultReportFile = path.join(cwd, "tmp", "image-migration-report.json");
const scopeFiles = {
  pilot: ["src/data/site.ts", "src/data/brand-images.ts", "src/data/article-images.ts"],
  "article-content": ["src/data/article-contents.ts"],
  "product-html": ["src/data/product-details.ts"],
  all: [
    "src/data/site.ts",
    "src/data/brand-images.ts",
    "src/data/article-images.ts",
    "src/data/article-contents.ts",
    "src/data/product-details.ts",
  ],
};
const requiredTables = ["media_assets", "media_import_mappings"];

function parseArgs(argv) {
  const options = {
    bucket: process.env.SUPABASE_IMAGE_BUCKET || "admin-media",
    scope: "pilot",
    limit: undefined,
    apply: false,
    inventoryOnly: false,
    preflight: false,
    reportFile: defaultReportFile,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--apply") options.apply = true;
    else if (arg === "--inventory-only") options.inventoryOnly = true;
    else if (arg === "--preflight") options.preflight = true;
    else if (arg === "--bucket") options.bucket = argv[++index];
    else if (arg.startsWith("--bucket=")) options.bucket = arg.slice("--bucket=".length);
    else if (arg === "--scope") options.scope = argv[++index];
    else if (arg.startsWith("--scope=")) options.scope = arg.slice("--scope=".length);
    else if (arg === "--limit") options.limit = Number(argv[++index]);
    else if (arg.startsWith("--limit=")) options.limit = Number(arg.slice("--limit=".length));
    else if (arg === "--report-file") options.reportFile = path.resolve(cwd, argv[++index]);
    else if (arg.startsWith("--report-file=")) {
      options.reportFile = path.resolve(cwd, arg.slice("--report-file=".length));
    } else if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!(options.scope in scopeFiles)) {
    throw new Error(
      `Unknown scope "${options.scope}". Use one of: ${Object.keys(scopeFiles).join(", ")}`,
    );
  }

  if (options.limit !== undefined && (!Number.isFinite(options.limit) || options.limit < 1)) {
    throw new Error("--limit must be a positive number.");
  }

  return options;
}

function printHelp() {
  console.log(`Usage: node scripts/migrate-images-to-supabase.mjs [options]

Options:
  --preflight             Validate DB, tables, env vars, and storage bucket.
  --inventory-only        Scan target files and write a candidate report without uploading.
  --apply                 Rewrite matching URLs in source files after successful upload.
  --scope=pilot           Select migration scope: pilot, article-content, product-html, all.
  --bucket=name           Supabase Storage bucket to upload into. Default: site-media
  --limit=3               Limit candidate count for pilot runs.
  --report-file=path      Write a JSON report to a custom path.
`);
}

function getTargetFiles(scope) {
  return scopeFiles[scope];
}

function sanitizeSegment(value) {
  return (
    value
      .normalize("NFKD")
      .replace(/[^\x00-\x7F]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9._-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "asset"
  );
}

function detectFileExtension(url, contentType) {
  const pathname = new URL(url).pathname;
  const ext = path.extname(pathname).toLowerCase();
  if (ext) return ext;
  if (contentType?.includes("png")) return ".png";
  if (contentType?.includes("jpeg")) return ".jpg";
  if (contentType?.includes("webp")) return ".webp";
  if (contentType?.includes("gif")) return ".gif";
  if (contentType?.includes("svg")) return ".svg";
  return ".bin";
}

function normalizeContentType(contentType) {
  return contentType?.split(";")[0]?.trim().toLowerCase() || "application/octet-stream";
}

function buildFetchCandidates(url) {
  const candidates = [url];

  if (url.includes("#")) {
    candidates.push(url.replaceAll("#", "%23"));
  }

  return [...new Set(candidates)];
}

async function fetchImageWithFallback(url) {
  const candidates = buildFetchCandidates(url);
  let lastError;

  for (const candidateUrl of candidates) {
    const response = await fetch(candidateUrl);
    if (response.ok) {
      return {
        response,
        resolvedUrl: candidateUrl,
      };
    }

    lastError = new Error(
      `Failed to fetch ${candidateUrl}: ${response.status} ${response.statusText}`,
    );
  }

  throw lastError ?? new Error(`Failed to fetch ${url}`);
}

function isImageUrl(url) {
  try {
    const parsed = new URL(url);
    const pathname = parsed.pathname.toLowerCase();
    return (
      /\.(png|jpe?g|webp|gif|svg)(?:$|\?)/i.test(parsed.href) ||
      pathname.includes("/images/") ||
      pathname.includes("/wp-content/uploads/")
    );
  } catch {
    return false;
  }
}

function isSupabaseHostedUrl(url, supabaseUrl) {
  if (!supabaseUrl) return false;

  try {
    const parsed = new URL(url);
    const supabase = new URL(supabaseUrl);
    return (
      parsed.origin === supabase.origin && parsed.pathname.startsWith("/storage/v1/object/public/")
    );
  } catch {
    return false;
  }
}

function classifySource(filePath, url, content, index) {
  const windowStart = Math.max(0, index - 120);
  const windowEnd = Math.min(content.length, index + url.length + 120);
  const snippet = content.slice(windowStart, windowEnd);
  const sourceKind = /<img[^>]+src\s*=\s*["'][^"']+$/.test(snippet)
    ? "html-embedded"
    : "plain-string";

  return {
    filePath,
    sourceKind,
    sourceRef: `${filePath}:${index}`,
  };
}

async function collectImageCandidates(files, limit, runtimeConfig) {
  const results = [];

  for (const relativeFilePath of files) {
    const absoluteFilePath = path.join(cwd, relativeFilePath);
    const content = await fs.readFile(absoluteFilePath, "utf8");
    const regex = /https?:\/\/[^\s"'<>`]+/g;
    let match;

    while ((match = regex.exec(content)) !== null) {
      const url = match[0];
      if (!isImageUrl(url)) continue;
      if (isSupabaseHostedUrl(url, runtimeConfig.supabaseUrl)) continue;

      results.push({
        url,
        ...classifySource(relativeFilePath, url, content, match.index),
      });

      if (limit !== undefined && results.length >= limit) {
        return results;
      }
    }
  }

  return results;
}

function getRuntimeConfig() {
  return {
    supabaseUrl: process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };
}

function createStorageClient(runtimeConfig) {
  if (!runtimeConfig.supabaseUrl || !runtimeConfig.serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY and SUPABASE_URL are required for uploads. Add them to .env before running migration.",
    );
  }

  return createClient(runtimeConfig.supabaseUrl, runtimeConfig.serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

async function runPreflight(runtimeConfig, bucketName) {
  const checks = {
    supabaseUrlPresent: Boolean(runtimeConfig.supabaseUrl),
    serviceRoleKeyPresent: Boolean(runtimeConfig.serviceRoleKey),
    supabaseApiReachable: false,
    requiredTables: [],
    bucketExists: false,
    bucketPublic: false,
  };

  if (!checks.supabaseUrlPresent || !checks.serviceRoleKeyPresent) {
    return {
      ok: false,
      checks,
      message: "Missing one or more required environment variables.",
    };
  }

  const supabase = createStorageClient(runtimeConfig);
  checks.supabaseApiReachable = true;

  for (const tableName of requiredTables) {
    const { error } = await supabase
      .from(tableName)
      .select("*", { head: true, count: "exact" })
      .limit(1);
    if (!error) {
      checks.requiredTables.push(tableName);
      continue;
    }

    if (error.code !== "PGRST116") {
      throw error;
    }
  }

  const { data: buckets, error } = await supabase.storage.listBuckets();
  if (error) throw error;

  const bucket = buckets.find((entry) => entry.name === bucketName);
  if (bucket) {
    checks.bucketExists = true;
    checks.bucketPublic = Boolean(bucket.public);
  }

  const ok =
    checks.supabaseApiReachable &&
    requiredTables.every((table) => checks.requiredTables.includes(table)) &&
    checks.bucketExists &&
    checks.bucketPublic;

  return {
    ok,
    checks,
    message: ok ? "Preflight checks passed." : "Preflight checks failed.",
  };
}

async function upsertMapping(supabase, candidate, bucket, publicUrl, contentType, fileSize) {
  const assetPayload = {
    bucket,
    path: publicUrl.path,
    public_url: publicUrl.url,
    source_url: candidate.url,
    content_type: contentType,
    file_size: fileSize,
  };

  const { error: assetError } = await supabase.from("media_assets").upsert(assetPayload, {
    onConflict: "source_url",
  });
  if (assetError) throw assetError;

  const { data: assetRow, error: assetSelectError } = await supabase
    .from("media_assets")
    .select("id")
    .eq("source_url", candidate.url)
    .single();
  if (assetSelectError) throw assetSelectError;

  const mappingPayload = {
    source_url: candidate.url,
    target_url: publicUrl.url,
    media_asset_id: assetRow.id,
    source_kind: candidate.sourceKind,
    source_ref: candidate.sourceRef,
  };

  const { error: mappingError } = await supabase
    .from("media_import_mappings")
    .upsert(mappingPayload, {
      onConflict: "source_url",
    });
  if (mappingError) throw mappingError;
}

async function ensureDir(filePath) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
}

async function rewriteFiles(mappings) {
  const grouped = new Map();

  for (const mapping of mappings) {
    if (!grouped.has(mapping.filePath)) grouped.set(mapping.filePath, []);
    grouped.get(mapping.filePath).push(mapping);
  }

  for (const [filePath, replacements] of grouped.entries()) {
    const absolutePath = path.join(cwd, filePath);
    let content = await fs.readFile(absolutePath, "utf8");

    for (const replacement of replacements) {
      content = content.split(replacement.sourceUrl).join(replacement.targetUrl);
    }

    await fs.writeFile(absolutePath, content, "utf8");
  }
}

async function writeReport(filePath, data) {
  await ensureDir(filePath);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const files = getTargetFiles(options.scope);
  const runtimeConfig = getRuntimeConfig();

  if (options.preflight) {
    const result = await runPreflight(runtimeConfig, options.bucket);
    await writeReport(options.reportFile, {
      generatedAt: new Date().toISOString(),
      mode: "preflight",
      scope: options.scope,
      bucket: options.bucket,
      ...result,
    });
    console.log(result.message);
    console.log(`Preflight report written to ${options.reportFile}`);
    if (!result.ok) process.exit(1);
    return;
  }

  const candidates = await collectImageCandidates(files, options.limit, runtimeConfig);
  const report = {
    generatedAt: new Date().toISOString(),
    mode: options.inventoryOnly ? "inventory" : "migrate",
    scope: options.scope,
    bucket: options.bucket,
    inventoryOnly: options.inventoryOnly,
    apply: options.apply,
    files,
    candidates,
    migrated: [],
    failed: [],
  };

  if (options.inventoryOnly) {
    await writeReport(options.reportFile, report);
    console.log(
      `Found ${candidates.length} candidate image URL(s). Report written to ${options.reportFile}`,
    );
    return;
  }

  const preflight = await runPreflight(runtimeConfig, options.bucket);
  if (!preflight.ok) {
    await writeReport(options.reportFile, {
      ...report,
      preflight,
    });
    throw new Error(`Preflight failed: ${preflight.message}`);
  }

  const supabase = createStorageClient(runtimeConfig);
  const replacements = [];

  for (const candidate of candidates) {
    try {
      console.log(`Fetching ${candidate.url}`);
      const { response, resolvedUrl } = await fetchImageWithFallback(candidate.url);
      const arrayBuffer = await response.arrayBuffer();
      const bytes = Buffer.from(arrayBuffer);
      const contentType = normalizeContentType(response.headers.get("content-type"));
      const parsedUrl = new URL(resolvedUrl);
      const hash = crypto.createHash("sha1").update(candidate.url).digest("hex").slice(0, 12);
      const baseName = sanitizeSegment(
        path.basename(parsedUrl.pathname, path.extname(parsedUrl.pathname)) || "asset",
      );
      const extension = detectFileExtension(resolvedUrl, contentType);
      const objectPath = `legacy-imports/${sanitizeSegment(parsedUrl.hostname)}/${hash}-${baseName}${extension}`;

      const { error: uploadError } = await supabase.storage
        .from(options.bucket)
        .upload(objectPath, bytes, {
          contentType,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(options.bucket).getPublicUrl(objectPath);
      const publicUrl = data.publicUrl;

      await upsertMapping(
        supabase,
        candidate,
        options.bucket,
        { path: objectPath, url: publicUrl },
        contentType,
        bytes.byteLength,
      );

      report.migrated.push({
        sourceUrl: candidate.url,
        resolvedUrl,
        targetUrl: publicUrl,
        filePath: candidate.filePath,
        sourceKind: candidate.sourceKind,
        sourceRef: candidate.sourceRef,
        objectPath,
        contentType,
        bytes: bytes.byteLength,
      });

      replacements.push({
        filePath: candidate.filePath,
        sourceUrl: candidate.url,
        targetUrl: publicUrl,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`Skipping ${candidate.url}: ${message}`);
      report.failed.push({
        sourceUrl: candidate.url,
        filePath: candidate.filePath,
        sourceKind: candidate.sourceKind,
        sourceRef: candidate.sourceRef,
        error: message,
      });
    }
  }

  if (options.apply && replacements.length > 0) {
    await rewriteFiles(replacements);
  }

  await writeReport(options.reportFile, report);
  console.log(
    `Migrated ${report.migrated.length} image(s) with ${report.failed.length} failure(s). Report written to ${options.reportFile}`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
