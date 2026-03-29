/**
 * Seed script for nursery data import
 * Reads scraped nursery JSON files and inserts into the database.
 * Matches plant botanical names to LWF API plants where possible.
 *
 * Usage: npx tsx packages/database/seed-nurseries.ts
 */

import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { eq } from "drizzle-orm";
import * as schema from "./schema";
import * as fs from "fs";
import * as path from "path";

// Load .env from project root
const envPath = path.resolve(__dirname, "../../.env");
const envContent = fs.readFileSync(envPath, "utf-8");
for (const line of envContent.split("\n")) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const val = match[2].trim();
    if (!process.env[key]) process.env[key] = val;
  }
}

const LWF_API_BASE = "https://lwf-api.vercel.app/api/v1";
const DATA_DIR = path.resolve(__dirname, "../../data/nurseries");

// --- Types ---

interface ScrapedPlant {
  common_name: string;
  botanical_name: string;
  price: string;
  container_size: string;
  availability: string;
  category: string;
  url: string;
  sku?: string;
}

interface NurseryFile {
  nursery_name: string;
  location: string;
  website: string;
  scraped_date: string;
  note?: string;
  plants: ScrapedPlant[];
  pricing?: Record<string, Record<string, string>>;
}

interface LwfPlant {
  id: string;
  genus: string;
  species: string;
  subspeciesVarieties: string | null;
  commonName: string;
}

// --- LWF API matching ---

// Cache genus lookups to avoid duplicate API calls
const genusCache = new Map<string, LwfPlant[]>();

async function searchLwfByGenus(genus: string): Promise<LwfPlant[]> {
  const key = genus.toLowerCase();
  if (genusCache.has(key)) return genusCache.get(key)!;

  try {
    const url = `${LWF_API_BASE}/plants?search=${encodeURIComponent(genus)}&limit=100`;
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`  LWF API error for genus "${genus}": ${res.status}`);
      genusCache.set(key, []);
      return [];
    }
    const json = await res.json();
    const plants: LwfPlant[] = json.data || [];
    genusCache.set(key, plants);
    return plants;
  } catch (err) {
    console.warn(`  LWF API fetch failed for genus "${genus}":`, err);
    genusCache.set(key, []);
    return [];
  }
}

function parseGenus(botanicalName: string): string {
  // Extract genus (first word) from botanical name
  return botanicalName.trim().split(/[\s\u2002]+/)[0];
}

function parseSpecies(botanicalName: string): string {
  // Extract species (second word), stripping cultivar info
  const parts = botanicalName.trim().split(/[\s\u2002]+/);
  if (parts.length < 2) return "";
  // Skip cultivar markers
  let sp = parts[1];
  if (sp.startsWith("'") || sp.startsWith("×") || sp.startsWith("x ")) return "";
  // Remove trailing quotes or trademark symbols
  sp = sp.replace(/[''®™]/g, "");
  return sp.toLowerCase();
}

async function matchToLwf(botanicalName: string): Promise<string | null> {
  if (!botanicalName || botanicalName.length < 3) return null;
  // Skip obviously bad data
  if (botanicalName.startsWith("Sorry")) return null;

  const genus = parseGenus(botanicalName);
  if (!genus || genus.length < 2) return null;

  const species = parseSpecies(botanicalName);
  const candidates = await searchLwfByGenus(genus);

  if (candidates.length === 0) return null;

  // Try exact genus+species match first
  if (species) {
    const exact = candidates.find(
      (p) =>
        p.genus.toLowerCase() === genus.toLowerCase() &&
        p.species.toLowerCase() === species
    );
    if (exact) return exact.id;
  }

  // If only one result for this genus, use it (likely correct)
  if (candidates.length === 1 && candidates[0].genus.toLowerCase() === genus.toLowerCase()) {
    return candidates[0].id;
  }

  return null;
}

// --- Availability mapping ---

function mapAvailability(
  avail: string
): "in_stock" | "limited" | "out_of_stock" | "seasonal" {
  if (!avail) return "in_stock";
  const lower = avail.toLowerCase();
  if (lower === "in catalog") return "in_stock";
  const num = parseInt(avail, 10);
  if (!isNaN(num)) {
    if (num <= 0) return "out_of_stock";
    if (num <= 5) return "limited";
    return "in_stock";
  }
  if (lower.includes("out") || lower.includes("none")) return "out_of_stock";
  if (lower.includes("limited") || lower.includes("few")) return "limited";
  return "in_stock";
}

// --- Parse price to cents ---

function parsePriceCents(priceStr: string): number | null {
  if (!priceStr) return null;
  // Extract first dollar amount
  const match = priceStr.match(/\$?([\d,]+(?:\.\d{2})?)/);
  if (!match) return null;
  const dollars = parseFloat(match[1].replace(",", ""));
  if (isNaN(dollars)) return null;
  return Math.round(dollars * 100);
}

// --- Main seed ---

async function main() {
  console.log("🌱 Starting nursery seed...\n");

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });

  // Track stats
  let totalPlants = 0;
  let matchedPlants = 0;
  let unmatchedPlants = 0;
  let insertedInventory = 0;

  // --- 1. Shooting Star Nursery ---
  console.log("📦 Processing Shooting Star Nursery...");
  const shootingStarData: NurseryFile = JSON.parse(
    fs.readFileSync(path.join(DATA_DIR, "shooting-star-availability.json"), "utf-8")
  );

  const [shootingStar] = await db
    .insert(schema.nurseries)
    .values({
      name: shootingStarData.nursery_name,
      city: shootingStarData.location.split(",")[0]?.trim(),
      state: shootingStarData.location.split(",")[1]?.trim(),
      website: shootingStarData.website,
      isRetail: true,
      connectionType: "manual",
    })
    .onConflictDoNothing()
    .returning();

  if (shootingStar) {
    console.log(`  ✅ Created nursery: ${shootingStar.name} (${shootingStar.id})`);

    for (const plant of shootingStarData.plants) {
      totalPlants++;
      const lwfId = await matchToLwf(plant.botanical_name);
      if (lwfId) matchedPlants++;
      else unmatchedPlants++;

      await db.insert(schema.nurseryInventory).values({
        nurseryId: shootingStar.id,
        lwfPlantId: lwfId,
        botanicalName: plant.botanical_name,
        commonName: plant.common_name,
        price: parsePriceCents(plant.price),
        containerSize: plant.container_size || null,
        availability: mapAvailability(plant.availability),
        sourceUrl: plant.url || null,
        lastUpdated: new Date(),
      });
      insertedInventory++;
    }
    console.log(
      `  📊 Shooting Star: ${shootingStarData.plants.length} plants, ${matchedPlants} matched, ${unmatchedPlants} unmatched`
    );
  } else {
    console.log("  ⚠️ Shooting Star already exists (skipped insert)");
  }

  // --- 2. ForestFarm ---
  console.log("\n📦 Processing ForestFarm...");
  const forestFarmData: NurseryFile = JSON.parse(
    fs.readFileSync(path.join(DATA_DIR, "forestfarm-sample.json"), "utf-8")
  );

  let ffMatched = 0,
    ffUnmatched = 0;

  const [forestFarm] = await db
    .insert(schema.nurseries)
    .values({
      name: forestFarmData.nursery_name,
      city: forestFarmData.location.split(",")[0]?.trim(),
      state: forestFarmData.location.split(",")[1]?.trim(),
      website: forestFarmData.website,
      isRetail: true,
      isWholesale: true,
      description: forestFarmData.note || null,
      connectionType: "manual",
    })
    .onConflictDoNothing()
    .returning();

  if (forestFarm) {
    console.log(`  ✅ Created nursery: ${forestFarm.name} (${forestFarm.id})`);

    for (const plant of forestFarmData.plants) {
      totalPlants++;
      const lwfId = await matchToLwf(plant.botanical_name);
      if (lwfId) {
        matchedPlants++;
        ffMatched++;
      } else {
        unmatchedPlants++;
        ffUnmatched++;
      }

      await db.insert(schema.nurseryInventory).values({
        nurseryId: forestFarm.id,
        lwfPlantId: lwfId,
        botanicalName: plant.botanical_name,
        commonName: plant.common_name,
        price: parsePriceCents(plant.price),
        containerSize: plant.container_size || null,
        availability: mapAvailability(plant.availability),
        sourceUrl: plant.url || null,
        lastUpdated: new Date(),
      });
      insertedInventory++;
    }
    console.log(
      `  📊 ForestFarm: ${forestFarmData.plants.length} plants, ${ffMatched} matched, ${ffUnmatched} unmatched`
    );
  }

  // --- 3. Plant Oregon ---
  console.log("\n📦 Processing Plant Oregon...");
  const plantOregonData: NurseryFile = JSON.parse(
    fs.readFileSync(path.join(DATA_DIR, "plant-oregon-catalog.json"), "utf-8")
  );

  let poMatched = 0,
    poUnmatched = 0;

  const [plantOregon] = await db
    .insert(schema.nurseries)
    .values({
      name: plantOregonData.nursery_name,
      city: plantOregonData.location.split(",")[0]?.trim(),
      state: plantOregonData.location.split(",")[1]?.trim(),
      website: plantOregonData.website,
      isRetail: true,
      description: plantOregonData.note || null,
      connectionType: "manual",
    })
    .onConflictDoNothing()
    .returning();

  if (plantOregon) {
    console.log(`  ✅ Created nursery: ${plantOregon.name} (${plantOregon.id})`);

    // Filter out bad entries (e.g. "Sorry,No imagecurrently available.")
    const validPlants = plantOregonData.plants.filter(
      (p) => p.botanical_name && !p.botanical_name.startsWith("Sorry")
    );

    for (const plant of validPlants) {
      totalPlants++;
      const lwfId = await matchToLwf(plant.botanical_name);
      if (lwfId) {
        matchedPlants++;
        poMatched++;
      } else {
        unmatchedPlants++;
        poUnmatched++;
      }

      await db.insert(schema.nurseryInventory).values({
        nurseryId: plantOregon.id,
        lwfPlantId: lwfId,
        botanicalName: plant.botanical_name,
        commonName: plant.common_name,
        price: parsePriceCents(plant.price),
        containerSize: plant.container_size || null,
        availability: mapAvailability(plant.availability),
        sourceUrl: plant.url || null,
        lastUpdated: new Date(),
      });
      insertedInventory++;
    }
    console.log(
      `  📊 Plant Oregon: ${validPlants.length} plants, ${poMatched} matched, ${poUnmatched} unmatched`
    );
  }

  // --- 4. Flowerland (pricing tiers only, no individual plants) ---
  console.log("\n📦 Processing Flowerland Nursery...");
  const flowerlandData: NurseryFile = JSON.parse(
    fs.readFileSync(path.join(DATA_DIR, "flowerland-pricing.json"), "utf-8")
  );

  const [flowerland] = await db
    .insert(schema.nurseries)
    .values({
      name: flowerlandData.nursery_name,
      city: flowerlandData.location.split(",")[0]?.trim(),
      state: flowerlandData.location.split(",")[1]?.trim(),
      website: flowerlandData.website,
      isRetail: true,
      description: flowerlandData.note || null,
      supplyCategories: flowerlandData.pricing || null,
      connectionType: "manual",
    })
    .onConflictDoNothing()
    .returning();

  if (flowerland) {
    console.log(`  ✅ Created nursery: ${flowerland.name} (${flowerland.id})`);
    console.log(`  📊 Flowerland: Pricing tiers stored (no individual plants)`);
  }

  // --- 5. Check for Valley View if present ---
  const vvPath = path.join(DATA_DIR, "valley-view-inventory.json");
  if (fs.existsSync(vvPath)) {
    console.log("\n📦 Processing Valley View Nursery...");
    const vvData: NurseryFile = JSON.parse(fs.readFileSync(vvPath, "utf-8"));

    let vvMatched = 0,
      vvUnmatched = 0;

    const [valleyView] = await db
      .insert(schema.nurseries)
      .values({
        name: vvData.nursery_name,
        city: vvData.location.split(",")[0]?.trim(),
        state: vvData.location.split(",")[1]?.trim(),
        website: vvData.website,
        isRetail: true,
        description: vvData.note || null,
        connectionType: "manual",
      })
      .onConflictDoNothing()
      .returning();

    if (valleyView && vvData.plants.length > 0) {
      console.log(`  ✅ Created nursery: ${valleyView.name} (${valleyView.id})`);

      const validPlants = vvData.plants.filter(
        (p) => p.botanical_name && !p.botanical_name.startsWith("Sorry")
      );

      for (const plant of validPlants) {
        totalPlants++;
        const lwfId = await matchToLwf(plant.botanical_name);
        if (lwfId) {
          matchedPlants++;
          vvMatched++;
        } else {
          unmatchedPlants++;
          vvUnmatched++;
        }

        await db.insert(schema.nurseryInventory).values({
          nurseryId: valleyView.id,
          lwfPlantId: lwfId,
          botanicalName: plant.botanical_name,
          commonName: plant.common_name,
          price: parsePriceCents(plant.price),
          containerSize: plant.container_size || null,
          availability: mapAvailability(plant.availability),
          sourceUrl: plant.url || null,
          lastUpdated: new Date(),
        });
        insertedInventory++;
      }
      console.log(
        `  📊 Valley View: ${validPlants.length} plants, ${vvMatched} matched, ${vvUnmatched} unmatched`
      );
    }
  }

  // --- Summary ---
  console.log("\n" + "=".repeat(50));
  console.log("🌿 SEED COMPLETE");
  console.log(`  Total plants processed: ${totalPlants}`);
  console.log(`  Matched to LWF API:     ${matchedPlants} (${totalPlants > 0 ? Math.round((matchedPlants / totalPlants) * 100) : 0}%)`);
  console.log(`  Unmatched:              ${unmatchedPlants}`);
  console.log(`  Inventory rows inserted: ${insertedInventory}`);
  console.log(`  Unique genera cached:    ${genusCache.size}`);
  console.log("=".repeat(50));

  await pool.end();
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
