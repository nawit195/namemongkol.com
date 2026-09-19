// Run migration: add image_url column to content_industries
const fs = require("fs");
const { Client } = require("pg");

// Read .env
const envContent = fs.readFileSync(".env", "utf8");
function getEnv(key) {
  const match = envContent.match(new RegExp(`^${key}=(.+)$`, "m"));
  return match ? match[1].trim() : "";
}

const DATABASE_URL = getEnv("DATABASE_URL");
if (!DATABASE_URL) {
  console.error("DATABASE_URL is not set in .env");
  process.exit(1);
}

const sql = `ALTER TABLE public.content_industries ADD COLUMN IF NOT EXISTS image_url text;`;

async function run() {
  const client = new Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    console.log("Connected to database");
    const result = await client.query(sql);
    console.log("Migration successful:", result.command);

    // Verify the column exists
    const verify = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'content_industries' AND column_name = 'image_url'
    `);
    console.log("Verification:", verify.rows);
  } catch (err) {
    console.error("Migration failed:", err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
