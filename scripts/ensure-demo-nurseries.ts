/**
 * Ensure Valley View and Shooting Star nurseries exist for demo
 * These are the two featured nurseries in the commerce flow demo
 */

import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { eq } from "drizzle-orm";
import * as schema from "../packages/database/schema";
import * as fs from "fs";
import * as path from "path";

// Load .env from project root
const envPath = path.resolve(__dirname, "../.env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const val = match[2].trim();
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

async function main() {
  console.log("🌱 Ensuring demo nurseries exist...\n");

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });

  // Check if Valley View exists
  const existing = await db
    .select()
    .from(schema.nurseries)
    .where(eq(schema.nurseries.name, "Valley View Nursery"));

  if (existing.length === 0) {
    console.log("📦 Creating Valley View Nursery...");
    const [valleyView] = await db
      .insert(schema.nurseries)
      .values({
        name: "Valley View Nursery",
        city: "Ashland",
        state: "Oregon",
        description: "Will order any plant — ask us!",
        isRetail: true,
        servesLandscapers: true,
        connectionType: "manual",
      })
      .returning();
    console.log(`  ✅ Created: ${valleyView.name} (${valleyView.id})`);
  } else {
    console.log("✅ Valley View Nursery already exists");
  }

  // Check if Shooting Star exists
  const existingSS = await db
    .select()
    .from(schema.nurseries)
    .where(eq(schema.nurseries.name, "Shooting Star Nursery"));

  if (existingSS.length === 0) {
    console.log("📦 Creating Shooting Star Nursery...");
    const [shootingStar] = await db
      .insert(schema.nurseries)
      .values({
        name: "Shooting Star Nursery",
        city: "Talent",
        state: "Oregon", 
        description: "1,733 plants in stock",
        isRetail: true,
        isWholesale: true,
        connectionType: "manual",
      })
      .returning();
    console.log(`  ✅ Created: ${shootingStar.name} (${shootingStar.id})`);
  } else {
    console.log("✅ Shooting Star Nursery already exists");
  }

  console.log("\n🌿 Demo nurseries ready!");
  
  await pool.end();
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Failed to ensure demo nurseries:", err);
  process.exit(1);
});