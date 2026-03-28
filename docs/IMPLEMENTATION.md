# Implementation Spec — Phase 0

**For coding agents. Read AGENTS.md first.**

---

## Nursery Data Integration

### Source Data Available
- **Oregon Association of Nurseries:** 642 nurseries (400 Oregon), directory-level. JSON at `data/nurseries/oan-directory.json`
- **Shooting Star Nursery:** Scraped availability list + firewise PDF. JSON at `data/nurseries/shooting-star-availability.json`
- **Flowerland Nursery:** Price list by container size. JSON at `data/nurseries/flowerland-pricing.json`
- **Valley View, ForestFarm, Plant Oregon:** Partial data. JSON files in `data/nurseries/`

### Plant-to-Nursery Matching
Plants in LWF API are identified by `genus` + `species` + `commonName`. Nursery data has botanical names and/or common names. Match on botanical name (genus + species), fuzzy match on common name as fallback.

Not all nursery plants will match LWF database plants. That's OK — unmatched plants get flagged for Charisse to review/add.

### "A Plant Is a Plant" Concept
A plant is a universal entity (like a song on the internet). It exists independently of any nursery. Multiple nurseries may carry the same plant at different prices. The plant card shows ALL local sources:

```
┌──────────────────────────────┐
│ 🌿 Glossy Abelia              │
│ Abelia × grandiflora          │
│ 🔥 Zone 0-5 compatible       │
│ 💧 Low water · 🦌 Deer resist │
│                                │
│ Available at:                  │
│ • Shooting Star — $14.99 (1gal)│ → [link to their site]
│ • Valley View — $16.99 (1gal) │ → [link to their site]
│ • ForestFarm — $12.50 (4" pot)│ → [link to their site]
│                                │
│ [Save] [Add to Plan]          │
└──────────────────────────────┘
```

### Nursery Cart Demo
User builds a list of plants → clicks "Send to Shooting Star" → opens a demo page showing what the nursery would receive:

```
Demo Nursery Cart (Shooting Star)
──────────────────────────────────
From: homeowner@email.com
Plan: 123 Main St, Ashland

Plants requested:
  Glossy Abelia (1gal) × 3     $14.99 ea    $44.97
  Oregon Grape (1gal) × 5      $12.99 ea    $64.95
  Deer Fern (4" pot) × 8       $ 8.99 ea    $71.92
                                 ─────────────
  Estimated total:               $181.84

[This is a demo of what nursery integration could look like.
In production, this would populate the nursery's POS/cart system
or send them a quote request.]
```

### Nursery POS/API Connection (Future — Spec Now)
```
NurseryConnection:
  nursery_id
  connection_type: "manual" | "csv_upload" | "api" | "pos_integration"
  api_endpoint: nullable
  api_key: nullable (encrypted)
  last_sync: timestamp
  sync_frequency: "manual" | "daily" | "weekly"
```

Design this into the schema even if not active yet. Shows nurseries the vision.

---

## Fire Zone Calculation

### Input
- Structure footprint: GeoJSON Polygon (drawn by user or detected from parcel data)

### Calculation (Turf.js)
```typescript
import * as turf from '@turf/turf';

function calculateFireZones(structureFootprint: GeoJSON.Polygon) {
  // Convert feet to kilometers for Turf.js
  const feetToKm = (feet: number) => feet * 0.0003048;
  
  return {
    zone0: turf.buffer(structureFootprint, feetToKm(5), { units: 'kilometers' }),
    zone1: turf.buffer(structureFootprint, feetToKm(30), { units: 'kilometers' }),
    zone2: turf.buffer(structureFootprint, feetToKm(100), { units: 'kilometers' }),
  };
}
```

### Rendering
- Zone 0 (0-5ft): Red/orange, 40% opacity — `#EF4444` 
- Zone 1 (5-30ft): Yellow/amber, 30% opacity — `#F59E0B`
- Zone 2 (30-100ft): Green, 20% opacity — `#22C55E`
- Structure: Dark outline, no fill
- Render as Mapbox GL layers on top of satellite

### Zone-Aware Plant Filtering
When user clicks a zone or asks "what for Zone 0?":
```typescript
// Zone 0: Only plants with Home Ignition Zone value "0-5"
// Zone 1: Plants with HIZ "5-10" or "10-30"  
// Zone 2: Plants with HIZ "30-100"
// 
// LWF attribute: "Home Ignition Zone (HIZ)" 
// Attribute ID: b908b170-70c9-454d-a2ed-d86f98cb3de1
// Values: "0-5", "5-10", "10-30", "30-100", "50-100"
//
// Use GET /values/bulk?attributeIds=b908b170-70c9-454d-a2ed-d86f98cb3de1&resolve=true
// to get all plants with their HIZ values
```

---

## AI Agent Implementation

### Architecture
- Claude API with tool_use
- System prompt includes Charisse's framework + LWF context
- Tools call LWF API endpoints
- Preference memory in user DB record (JSON field)

### System Prompt (draft)
```
You are a fire-safe landscaping advisor for the Rogue Valley, Oregon.
You help homeowners, landscapers, and nurseries make informed planting decisions.

Your knowledge comes from a database of 1,300+ plants maintained by Charisse Sydoriak,
who consults with the City of Ashland on fire-reluctant landscaping.

PRIORITY FRAMEWORK (always follow this order):
1. PLACEMENT — Where on the property? Zone matters most.
2. SPACING — How far apart? Connected fuels = connected fire.
3. MAINTENANCE — Will the owner maintain it? Unmaintained plants are dangerous.
4. PLANT SELECTION — Only after 1-3 are addressed, recommend specific plants.

TERMINOLOGY: Use "fire-reluctant" (preferred) or "fire-resistant." 
NEVER use "fire-resilient" or "fire-resilience."

When recommending plants, always mention:
- Which zone it's appropriate for
- Water needs
- Whether it's native to Oregon
- Deer resistance (Ashland has voracious deer)
- Where to buy locally (if nursery data available)
```

### Agent Tools
```typescript
const tools = [
  {
    name: "search_plants",
    description: "Search the plant database by name, characteristics, or zone compatibility",
    parameters: { query: string, zone?: string, native?: boolean, deerResistant?: boolean, waterNeeds?: string }
  },
  {
    name: "get_plant_details", 
    description: "Get full details for a specific plant including fire risk score and all attributes",
    parameters: { plantId: string }
  },
  {
    name: "get_zone_recommendations",
    description: "Get recommended plants for a specific fire zone with optional preferences",
    parameters: { zone: "0-5" | "5-30" | "30-100", preferences?: object }
  },
  {
    name: "check_nursery_availability",
    description: "Check which local nurseries carry a specific plant and at what price",
    parameters: { plantId: string, location?: string }
  },
  {
    name: "get_user_preferences",
    description: "Retrieve the user's saved plant/garden preferences",
    parameters: {}
  },
  {
    name: "save_user_preference",
    description: "Save a user preference learned from conversation",
    parameters: { key: string, value: string }
  }
];
```

---

## Database Schema (Drizzle)

```typescript
// Users + Auth (BetterAuth handles core, we extend)
export const userProfiles = pgTable('user_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => user.id),
  role: text('role', { enum: ['homeowner', 'landscaper', 'nursery_admin', 'city_admin', 'platform_admin'] }).default('homeowner'),
  preferences: jsonb('preferences').default({}), // AI agent learned preferences
  createdAt: timestamp('created_at').defaultNow(),
});

// Properties
export const properties = pgTable('properties', {
  id: uuid('id').primaryKey().defaultRandom(),
  ownerId: text('owner_id').notNull().references(() => user.id),
  address: text('address').notNull(),
  lat: doublePrecision('lat').notNull(),
  lng: doublePrecision('lng').notNull(),
  parcelBoundary: jsonb('parcel_boundary'), // GeoJSON Polygon
  structureFootprints: jsonb('structure_footprints'), // GeoJSON Polygon[]
  fireZones: jsonb('fire_zones'), // calculated, cached
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at'),
});

// Plans
export const plans = pgTable('plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  propertyId: uuid('property_id').references(() => properties.id),
  createdBy: text('created_by').references(() => user.id),
  name: text('name'),
  status: text('status', { enum: ['draft', 'submitted', 'approved', 'completed'] }).default('draft'),
  plantPlacements: jsonb('plant_placements'), // [{plantId, zone, quantity, position}]
  estimatedCost: integer('estimated_cost'), // cents
  complianceScore: integer('compliance_score'), // 0-100
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at'),
});

// Nurseries (our DB, not LWF API)
export const nurseries = pgTable('nurseries', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  address: text('address'),
  city: text('city'),
  state: text('state'),
  zip: text('zip'),
  phone: text('phone'),
  email: text('email'),
  website: text('website'),
  description: text('description'),
  supplyCategories: jsonb('supply_categories'), // string[]
  isRetail: boolean('is_retail').default(false),
  isWholesale: boolean('is_wholesale').default(false),
  servesLandscapers: boolean('serves_landscapers').default(false),
  hasFirewiseData: boolean('has_firewise_data').default(false),
  connectionType: text('connection_type', { enum: ['manual', 'csv_upload', 'api', 'pos_integration'] }).default('manual'),
  apiEndpoint: text('api_endpoint'),
  lastSync: timestamp('last_sync'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Nursery Inventory (plant availability + pricing)
export const nurseryInventory = pgTable('nursery_inventory', {
  id: uuid('id').primaryKey().defaultRandom(),
  nurseryId: uuid('nursery_id').references(() => nurseries.id),
  lwfPlantId: text('lwf_plant_id'), // references LWF API plant UUID
  botanicalName: text('botanical_name'), // for matching
  commonName: text('common_name'),
  price: integer('price'), // cents
  containerSize: text('container_size'), // "1gal", "4\" pot", "bare root"
  availability: text('availability', { enum: ['in_stock', 'limited', 'out_of_stock', 'seasonal'] }),
  sourceUrl: text('source_url'), // external link to nursery product page
  lastUpdated: timestamp('last_updated'),
});

// Saved Plants (like joma film saves)
export const savedPlants = pgTable('saved_plants', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').references(() => user.id),
  lwfPlantId: text('lwf_plant_id').notNull(), // LWF API plant UUID
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Tags (flat, endlessly groupable — from joma-v2)
export const tags = pgTable('tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  ownerId: text('owner_id').references(() => user.id),
  visibility: text('visibility', { enum: ['private', 'public', 'org'] }).default('private'),
  color: text('color'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const tagAssignments = pgTable('tag_assignments', {
  id: uuid('id').primaryKey().defaultRandom(),
  tagId: uuid('tag_id').references(() => tags.id),
  targetType: text('target_type', { enum: ['plant', 'nursery', 'property', 'plan'] }),
  targetId: text('target_id'), // UUID of the target
});

// Orgs (nurseries, HOAs, city departments — from joma-v2 pattern)
export const orgs = pgTable('orgs', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  type: text('type', { enum: ['nursery', 'hoa', 'city', 'landscaping_company', 'other'] }),
  website: text('website'),
  logo: text('logo'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const orgMembers = pgTable('org_members', {
  orgId: uuid('org_id').references(() => orgs.id),
  userId: text('user_id').references(() => user.id),
  role: text('role', { enum: ['owner', 'admin', 'member'] }).default('member'),
});
```

---

## Files to Port from Garden App

Priority files to copy and adapt:

### Must port:
1. `frontend/src/components/canvas/SatelliteBackground.tsx` → `components/map/SatelliteBackground.tsx`
2. `frontend/src/components/canvas/PropertyBoundaryDrawer.tsx` → `components/map/PropertyBoundaryDrawer.tsx`
3. `frontend/src/services/mapbox.ts` → `lib/mapbox.ts`
4. `frontend/src/utils/coordinates.ts` → `lib/geo/coordinates.ts`
5. `frontend/src/components/garden-planner/ChatPanel.tsx` → `components/agent/ChatPanel.tsx`

### Port later (Phase 1+):
6. `frontend/src/components/canvas/InfiniteCanvas.tsx`
7. `frontend/src/components/canvas/ShapeRenderer.tsx`
8. `frontend/src/components/annotations/` (buildings, trees)
9. `frontend/src/components/shade/` (adapt for fire zone visualization)

### From joma-v2 (patterns, not direct copy):
- Card component pattern → plant cards
- Tag system schema → tags + tagAssignments
- Org/member pattern → nursery orgs
- External links model → nursery product links
- Auth setup → BetterAuth config
