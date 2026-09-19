import "dotenv/config";
import fs from "node:fs";
import { Client } from "pg";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not configured.");
}

async function runMigration() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  try {
    await client.connect();
    console.log("Connected to DB");
    const sql = fs.readFileSync(
      "supabase/migrations/20260612001500_add_article_is_featured.sql",
      "utf8",
    );
    await client.query(sql);
    console.log("Migration applied successfully");
  } catch (err) {
    console.error("Migration failed", err);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

runMigration();
