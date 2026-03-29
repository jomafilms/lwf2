/**
 * CSV Parser for nursery inventory uploads.
 * Handles flexible column mapping and common format variations.
 */

export interface ParsedInventoryItem {
  botanicalName: string;
  commonName: string | null;
  price: number | null;
  containerSize: string | null;
  availability: "in_stock" | "limited" | "out_of_stock" | "seasonal" | null;
}

export interface ParseResult {
  items: ParsedInventoryItem[];
  errors: Array<{ row: number; message: string }>;
  headers: string[];
}

// Map of possible column names to our canonical field names
const COLUMN_ALIASES: Record<string, string> = {
  botanical_name: "botanicalName",
  botanicalname: "botanicalName",
  scientific_name: "botanicalName",
  scientificname: "botanicalName",
  latin_name: "botanicalName",
  latinname: "botanicalName",
  species: "botanicalName",
  botanical: "botanicalName",

  common_name: "commonName",
  commonname: "commonName",
  common: "commonName",
  name: "commonName",
  plant_name: "commonName",
  plantname: "commonName",

  price: "price",
  unit_price: "price",
  unitprice: "price",
  cost: "price",
  retail_price: "price",
  retailprice: "price",

  container_size: "containerSize",
  containersize: "containerSize",
  container: "containerSize",
  size: "containerSize",
  pot_size: "containerSize",
  potsize: "containerSize",

  availability: "availability",
  status: "availability",
  stock: "availability",
  in_stock: "availability",
};

const AVAILABILITY_ALIASES: Record<string, ParsedInventoryItem["availability"]> = {
  in_stock: "in_stock",
  instock: "in_stock",
  "in stock": "in_stock",
  available: "in_stock",
  yes: "in_stock",
  y: "in_stock",
  true: "in_stock",
  "1": "in_stock",

  limited: "limited",
  low: "limited",
  "low stock": "limited",
  few: "limited",

  out_of_stock: "out_of_stock",
  outofstock: "out_of_stock",
  "out of stock": "out_of_stock",
  unavailable: "out_of_stock",
  no: "out_of_stock",
  n: "out_of_stock",
  false: "out_of_stock",
  "0": "out_of_stock",

  seasonal: "seasonal",
  season: "seasonal",
};

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function parsePrice(value: string): number | null {
  if (!value) return null;
  // Remove $, commas, whitespace
  const cleaned = value.replace(/[$,\s]/g, "");
  const num = parseFloat(cleaned);
  if (isNaN(num)) return null;
  // Store as cents
  return Math.round(num * 100);
}

function parseAvailability(value: string): ParsedInventoryItem["availability"] {
  if (!value) return null;
  const normalized = value.toLowerCase().trim();
  return AVAILABILITY_ALIASES[normalized] || null;
}

export function parseCSV(csvText: string): ParseResult {
  const lines = csvText.split(/\r?\n/).filter((line) => line.trim() !== "");
  if (lines.length === 0) {
    return { items: [], errors: [{ row: 0, message: "Empty CSV file" }], headers: [] };
  }

  const rawHeaders = parseCSVLine(lines[0]);
  const headers = rawHeaders.map((h) => h.toLowerCase().trim());

  // Map headers to canonical field names
  const columnMap: Record<number, string> = {};
  for (let i = 0; i < headers.length; i++) {
    const canonical = COLUMN_ALIASES[headers[i].replace(/\s+/g, "_")];
    if (canonical) {
      columnMap[i] = canonical;
    }
  }

  // Check we have at least botanicalName
  const hasBotanical = Object.values(columnMap).includes("botanicalName");
  if (!hasBotanical) {
    return {
      items: [],
      errors: [
        {
          row: 1,
          message:
            'No botanical/scientific name column found. Expected one of: botanical_name, scientific_name, latin_name, species',
        },
      ],
      headers: rawHeaders,
    };
  }

  const items: ParsedInventoryItem[] = [];
  const errors: Array<{ row: number; message: string }> = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row: Record<string, string> = {};

    for (const [colIdx, fieldName] of Object.entries(columnMap)) {
      row[fieldName] = values[parseInt(colIdx)] || "";
    }

    if (!row.botanicalName?.trim()) {
      errors.push({ row: i + 1, message: "Missing botanical name" });
      continue;
    }

    items.push({
      botanicalName: row.botanicalName.trim(),
      commonName: row.commonName?.trim() || null,
      price: parsePrice(row.price || ""),
      containerSize: row.containerSize?.trim() || null,
      availability: parseAvailability(row.availability || ""),
    });
  }

  return { items, errors, headers: rawHeaders };
}
