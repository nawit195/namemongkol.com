#!/usr/bin/env node
import { promises as fs } from "node:fs";
import path from "node:path";
import * as dotenv from "dotenv";
import { Client } from "pg";

dotenv.config();

const cwd = process.cwd();
const migrationFile = path.join(
  cwd,
  "supabase",
  "migrations",
  "20260610160000_add_seo_columns.sql",
);

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("Missing DATABASE_URL");

  const sql = await fs.readFile(migrationFile, "utf8");
  console.log("Running SEO columns migration...");

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();

  try {
    await client.query(sql);
    console.log("Migration applied successfully!");
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
