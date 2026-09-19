#!/usr/bin/env node
import { promises as fs } from "node:fs";
import path from "node:path";

import * as dotenv from "dotenv";
import { Client } from "pg";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const cwd = process.cwd();
const migrationDir = path.join(cwd, "supabase", "migrations");
const defaultInventoryFile = path.join(cwd, "tmp", "supabase-reset-inventory.json");

function parseArgs(argv) {
  const options = {
    yes: false,
    dryRun: false,
    inventoryOnly: false,
    reapplyMigrations: false,
    clearBuckets: [],
    inventoryFile: defaultInventoryFile,
  };

  for (const arg of argv) {
    if (arg === "--yes") options.yes = true;
    else if (arg === "--dry-run") options.dryRun = true;
    else if (arg === "--inventory-only") options.inventoryOnly = true;
    else if (arg === "--reapply-migrations") options.reapplyMigrations = true;
    else if (arg.startsWith("--clear-buckets=")) {
      options.clearBuckets = arg
        .slice("--clear-buckets=".length)
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);
    } else if (arg.startsWith("--inventory-file=")) {
      options.inventoryFile = path.resolve(cwd, arg.slice("--inventory-file=".length));
    } else if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

function printHelp() {
  console.log(`Usage: node scripts/reset-supabase.mjs [options]

Options:
  --yes                    Execute destructive actions.
  --dry-run                Show what would be removed without deleting anything.
  --inventory-only         Only inspect the current public schema and optional buckets.
  --reapply-migrations     Re-run SQL files in supabase/migrations after clearing public schema.
  --clear-buckets=a,b      Clear only the listed Supabase Storage buckets through the Storage API.
  --inventory-file=path    Write inventory JSON to a custom path.
`);
}

function quoteIdent(value) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

async function ensureDir(filePath) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
}

async function getPublicSchemaInventory(client) {
  const [tablesRes, viewsRes, matViewsRes, functionsRes] = await Promise.all([
    client.query(
      `select tablename
       from pg_tables
       where schemaname = 'public'
       order by tablename`,
    ),
    client.query(
      `select table_name
       from information_schema.views
       where table_schema = 'public'
       order by table_name`,
    ),
    client.query(
      `select matviewname
       from pg_matviews
       where schemaname = 'public'
       order by matviewname`,
    ),
    client.query(
      `select p.proname as name, pg_get_function_identity_arguments(p.oid) as args
       from pg_proc p
       join pg_namespace n on n.oid = p.pronamespace
       where n.nspname = 'public'
       order by p.proname, args`,
    ),
  ]);

  return {
    tables: tablesRes.rows.map((row) => row.tablename),
    views: viewsRes.rows.map((row) => row.table_name),
    materializedViews: matViewsRes.rows.map((row) => row.matviewname),
    functions: functionsRes.rows.map((row) => ({
      name: row.name,
      args: row.args,
    })),
  };
}

function createStorageAdminClient() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) return null;

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

async function getBucketInventory(supabase, targetBucketNames) {
  if (!supabase) {
    return {
      available: false,
      buckets: [],
      warning:
        "SUPABASE_SERVICE_ROLE_KEY is missing, so Storage inventory and deletion are unavailable.",
    };
  }

  const { data, error } = await supabase.storage.listBuckets();
  if (error) throw error;

  const buckets = data
    .filter((bucket) => targetBucketNames.length === 0 || targetBucketNames.includes(bucket.name))
    .map((bucket) => ({
      id: bucket.id,
      name: bucket.name,
      public: bucket.public,
      fileCount: null,
    }));

  return {
    available: true,
    buckets,
  };
}

async function listBucketFilePaths(supabase, bucketName, prefix = "") {
  const filePaths = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const { data, error } = await supabase.storage.from(bucketName).list(prefix, {
      limit,
      offset,
      sortBy: { column: "name", order: "asc" },
    });

    if (error) throw error;
    if (!data || data.length === 0) break;

    for (const item of data) {
      const nextPath = prefix ? `${prefix}/${item.name}` : item.name;
      if (!item.id) {
        filePaths.push(...(await listBucketFilePaths(supabase, bucketName, nextPath)));
      } else {
        filePaths.push(nextPath);
      }
    }

    if (data.length < limit) break;
    offset += limit;
  }

  return filePaths;
}

async function clearBucketObjects(supabase, bucketName, dryRun) {
  const filePaths = await listBucketFilePaths(supabase, bucketName);

  if (filePaths.length === 0) {
    console.log(`Bucket ${bucketName} is already empty.`);
    return { bucket: bucketName, removed: 0 };
  }

  console.log(`Bucket ${bucketName} has ${filePaths.length} file(s).`);
  if (dryRun) {
    console.log(`Dry run: would remove ${filePaths.length} file(s) from ${bucketName}.`);
    return { bucket: bucketName, removed: 0, wouldRemove: filePaths.length };
  }

  for (let index = 0; index < filePaths.length; index += 100) {
    const chunk = filePaths.slice(index, index + 100);
    const { error } = await supabase.storage.from(bucketName).remove(chunk);
    if (error) throw error;
  }

  console.log(`Removed ${filePaths.length} file(s) from ${bucketName}.`);
  return { bucket: bucketName, removed: filePaths.length };
}

async function dropPublicObjects(client, inventory, dryRun) {
  const actions = [];

  for (const name of inventory.materializedViews) {
    actions.push(`drop materialized view if exists public.${quoteIdent(name)} cascade;`);
  }
  for (const name of inventory.views) {
    actions.push(`drop view if exists public.${quoteIdent(name)} cascade;`);
  }
  for (const name of inventory.tables) {
    actions.push(`drop table if exists public.${quoteIdent(name)} cascade;`);
  }
  for (const fn of inventory.functions) {
    actions.push(`drop function if exists public.${quoteIdent(fn.name)}(${fn.args}) cascade;`);
  }

  if (actions.length === 0) {
    console.log("No public-schema objects found to drop.");
    return;
  }

  if (dryRun) {
    console.log("Dry run: would execute these statements:");
    for (const statement of actions) console.log(`  ${statement}`);
    return;
  }

  for (const statement of actions) {
    console.log(statement);
    await client.query(statement);
  }
}

async function reapplySqlMigrations(client, dryRun) {
  const entries = await fs.readdir(migrationDir, { withFileTypes: true });
  const migrationFiles = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".sql"))
    .map((entry) => entry.name)
    .sort();

  if (migrationFiles.length === 0) {
    console.log("No SQL migrations found to reapply.");
    return;
  }

  for (const fileName of migrationFiles) {
    const fullPath = path.join(migrationDir, fileName);
    const sql = await fs.readFile(fullPath, "utf8");
    if (dryRun) {
      console.log(`Dry run: would apply migration ${fileName}`);
      continue;
    }

    console.log(`Applying migration ${fileName}`);
    await client.query(sql);
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("Missing DATABASE_URL in environment.");
  }

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();

  try {
    const publicInventory = await getPublicSchemaInventory(client);
    const storageClient = createStorageAdminClient();
    const bucketInventory = await getBucketInventory(storageClient, options.clearBuckets);

    const inventory = {
      generatedAt: new Date().toISOString(),
      publicSchema: publicInventory,
      storage: bucketInventory,
      notes: [
        "Protected Supabase schemas such as storage.* and auth.* are intentionally out of scope.",
        "Only the public schema is reset by this workflow.",
      ],
    };

    await ensureDir(options.inventoryFile);
    await fs.writeFile(options.inventoryFile, JSON.stringify(inventory, null, 2));

    console.log(`Inventory written to ${options.inventoryFile}`);
    console.log(
      `Public schema inventory: ${publicInventory.tables.length} table(s), ${publicInventory.views.length} view(s), ${publicInventory.materializedViews.length} materialized view(s), ${publicInventory.functions.length} function(s).`,
    );

    if (bucketInventory.warning) {
      console.warn(bucketInventory.warning);
    } else if (bucketInventory.available) {
      console.log(`Storage inventory: ${bucketInventory.buckets.length} selected bucket(s).`);
    }

    if (options.inventoryOnly) return;

    if (!options.yes) {
      throw new Error(
        'Refusing to execute destructive reset without --yes. Re-run with "--yes" after reviewing the inventory output.',
      );
    }

    await dropPublicObjects(client, publicInventory, options.dryRun);

    if (options.reapplyMigrations) {
      await reapplySqlMigrations(client, options.dryRun);
    }

    if (options.clearBuckets.length > 0) {
      if (!storageClient) {
        throw new Error(
          "SUPABASE_SERVICE_ROLE_KEY is required to clear Storage buckets through the supported API.",
        );
      }

      for (const bucketName of options.clearBuckets) {
        await clearBucketObjects(storageClient, bucketName, options.dryRun);
      }
    }

    console.log("Reset workflow completed.");
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
