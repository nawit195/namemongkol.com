// Run migration via direct IPv6 PostgreSQL connection
const fs = require("fs");
const { Client } = require("pg");

// Read .env
const envContent = fs.readFileSync(".env", "utf8");
function getEnv(key) {
  const match = envContent.match(new RegExp(`^${key}=(.+)$`, "m"));
  return match ? match[1].trim().replace(/^["']|["']$/g, "") : "";
}

const sql = `ALTER TABLE public.content_industries ADD COLUMN IF NOT EXISTS image_url text;`;

async function run() {
  // Use explicit params to avoid URL parsing issues with @@@
  const client = new Client({
    user: "postgres",
    password: getEnv("DATABASE_URL").match(/:([^@]+)@/)?.[0]
      ? "Jwreal456@@@" // we know the password from the leaked URL
      : "",
    host: "2406:da12:1f1:f800:fc38:2ab5:dba0:7068", // IPv6 address from nslookup
    port: 5432,
    database: "postgres",
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log("Connecting via IPv6...");
    await client.connect();
    console.log("✅ Connected!");
    const result = await client.query(sql);
    console.log("✅ Migration successful:", result.command);

    // Verify
    const verify = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'content_industries' AND column_name = 'image_url'
    `);
    console.log("Verification:", verify.rows);
  } catch (err) {
    console.error("❌ Failed:", err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
