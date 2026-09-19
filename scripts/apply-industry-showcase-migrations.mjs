import "dotenv/config";
import fs from "node:fs";
import { Client } from "pg";

const migrationFiles = [
  "supabase/migrations/20260616090000_add_industry_brand_card_fields.sql",
  "supabase/migrations/20260616110000_add_industry_showcase_admin_fields.sql",
];

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not configured.");
}

const client = new Client({ connectionString: process.env.DATABASE_URL });

await client.connect();

try {
  for (const file of migrationFiles) {
    const sql = fs.readFileSync(file, "utf8");
    await client.query("begin");
    try {
      await client.query(sql);
      await client.query("commit");
      console.log(`Applied ${file}`);
    } catch (error) {
      await client.query("rollback");
      throw error;
    }
  }
} finally {
  await client.end();
}
