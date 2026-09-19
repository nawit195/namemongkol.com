import "dotenv/config";
import fs from "node:fs";
import { Client } from "pg";

const file = "supabase/migrations/20260728190000_restore_content_projects_workflow.sql";
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not configured.");
}

const client = new Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
try {
  await client.query("begin");
  await client.query(fs.readFileSync(file, "utf8"));
  await client.query("commit");
  console.log(`Applied ${file}`);
} catch (error) {
  await client.query("rollback");
  throw error;
} finally {
  await client.end();
}
