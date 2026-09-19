#!/usr/bin/env node
import { promises as fs } from "node:fs";
import path from "node:path";

const cwd = process.cwd();
const tmpDir = path.join(cwd, "tmp");
const defaultManifestPath = path.join(tmpDir, "image-migration-manifest.json");
const defaultSummaryPath = path.join(tmpDir, "image-migration-summary.md");

async function readJsonIfExists(filePath) {
  try {
    const content = await fs.readFile(filePath, "utf8");
    return JSON.parse(content);
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return null;
    }

    throw error;
  }
}

function parseArgs(argv) {
  const options = {
    manifestFile: defaultManifestPath,
    summaryFile: defaultSummaryPath,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--manifest-file") options.manifestFile = path.resolve(cwd, argv[++index]);
    else if (arg.startsWith("--manifest-file="))
      options.manifestFile = path.resolve(cwd, arg.slice(16));
    else if (arg === "--summary-file") options.summaryFile = path.resolve(cwd, argv[++index]);
    else if (arg.startsWith("--summary-file="))
      options.summaryFile = path.resolve(cwd, arg.slice(15));
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
  console.log(`Usage: node scripts/generate-image-migration-manifest.mjs [options]

Options:
  --manifest-file=path    Write JSON manifest to a custom path.
  --summary-file=path     Write Markdown summary to a custom path.
`);
}

async function ensureDir(filePath) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
}

function dedupeMappings(reports) {
  const bySourceUrl = new Map();

  for (const report of reports) {
    for (const migrated of report.migrated ?? []) {
      bySourceUrl.set(migrated.sourceUrl, {
        sourceUrl: migrated.sourceUrl,
        targetUrl: migrated.targetUrl,
        resolvedUrl: migrated.resolvedUrl ?? migrated.sourceUrl,
        filePath: migrated.filePath,
        sourceKind: migrated.sourceKind,
        sourceRef: migrated.sourceRef,
        objectPath: migrated.objectPath,
        contentType: migrated.contentType,
        bytes: migrated.bytes,
        scope: report.scope,
        bucket: report.bucket,
      });
    }
  }

  return [...bySourceUrl.values()].sort((left, right) =>
    left.sourceUrl.localeCompare(right.sourceUrl),
  );
}

function buildScopeSummary(reports) {
  return reports.map((report) => ({
    scope: report.scope,
    bucket: report.bucket,
    migrated: report.migrated?.length ?? 0,
    failed: report.failed?.length ?? 0,
    reportFile: path.relative(cwd, report.reportFile),
  }));
}

function renderMarkdownSummary(manifest) {
  const lines = [
    "# Image Migration Summary",
    "",
    `Generated at: ${manifest.generatedAt}`,
    "",
    `Total migrated images: ${manifest.totalMigrated}`,
    `Total remaining candidates: ${manifest.audit.remainingCandidates}`,
    "",
    "## Scope Summary",
    "",
    "| Scope | Bucket | Migrated | Failed | Report |",
    "| --- | --- | ---: | ---: | --- |",
    ...manifest.scopes.map(
      (scope) =>
        `| ${scope.scope} | ${scope.bucket} | ${scope.migrated} | ${scope.failed} | \`${scope.reportFile}\` |`,
    ),
    "",
    "## Outputs",
    "",
    `- Manifest JSON: \`${path.relative(cwd, manifest.manifestFile)}\``,
    `- Audit JSON: \`${manifest.audit.reportFile}\``,
    `- Source files updated: ${manifest.sourceFiles.map((file) => `\`${file}\``).join(", ")}`,
  ];

  return `${lines.join("\n")}\n`;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const reportFiles = [
    "image-migration-report.json",
    "article-content-migration.json",
    "product-html-migration.json",
    "final-image-migration-pass.json",
  ];

  const reports = [];

  for (const reportFile of reportFiles) {
    const absolutePath = path.join(tmpDir, reportFile);
    const report = await readJsonIfExists(absolutePath);
    if (!report) continue;
    report.reportFile = absolutePath;
    reports.push(report);
  }

  if (reports.length === 0) {
    throw new Error("No migration reports found in tmp/. Run the migration first.");
  }

  const auditPath = path.join(tmpDir, "image-migration-audit.json");
  const audit = await readJsonIfExists(auditPath);
  if (!audit) {
    throw new Error("Audit report tmp/image-migration-audit.json was not found.");
  }

  const mappings = dedupeMappings(reports);
  const manifest = {
    generatedAt: new Date().toISOString(),
    manifestFile: options.manifestFile,
    totalMigrated: mappings.length,
    sourceFiles: [...new Set(mappings.map((mapping) => mapping.filePath))].sort(),
    scopes: buildScopeSummary(reports),
    audit: {
      remainingCandidates: audit.candidates?.length ?? 0,
      reportFile: path.relative(cwd, auditPath),
    },
    mappings,
  };

  await ensureDir(options.manifestFile);
  await fs.writeFile(options.manifestFile, JSON.stringify(manifest, null, 2));

  await ensureDir(options.summaryFile);
  await fs.writeFile(options.summaryFile, renderMarkdownSummary(manifest), "utf8");

  console.log(`Manifest written to ${options.manifestFile}`);
  console.log(`Summary written to ${options.summaryFile}`);
  console.log(`Total migrated images: ${manifest.totalMigrated}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
