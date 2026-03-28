# BACKLOG — Prioritized Task List

**Updated:** 2026-03-28 11:20 PM PT
**Status:** Phase 0 — Foundation

---

## 🔴 P0 — Foundation (This Weekend)

### P0-1: Project scaffolding
- [ ] Next.js 15 + React 19 + TypeScript + Tailwind
- [ ] Neon DB + Drizzle ORM setup
- [ ] BetterAuth setup
- [ ] Vercel deployment config
- [ ] Env vars configured
- **Assignee:** Local agent
- **Branch:** `feature/scaffolding`

### P0-2: LWF API client
- [ ] TypeScript client for LWF API (`lib/api/lwf.ts`)
- [ ] Types for all responses (plants, attributes, values, nurseries)
- [ ] Fetch plants with images, search, pagination
- [ ] Fetch plant values with resolved display names
- [ ] Fetch risk reduction data
- [ ] Fetch hierarchical attributes for filters
- [ ] Fetch plant-fields.json for agent context
- **Assignee:** VPS agent
- **Branch:** `feature/lwf-api-client`

### P0-3: Address → Satellite → Fire Zones
- [ ] Address input with Mapbox geocoding
- [ ] Satellite view loads centered on address
- [ ] Property boundary (manual draw or parcel data)
- [ ] Structure footprint (manual draw)
- [ ] Fire zone calculation: Turf.js buffer 0-5ft, 5-30ft, 30-100ft
- [ ] Zone overlay rendering with color coding (red/yellow/green)
- [ ] Port relevant components from garden app
- **Assignee:** Local agent
- **Branch:** `feature/map-zones`
- **Dependencies:** P0-1

### P0-4: Plant cards + browse page
- [ ] Plant card component (image, name, fire score, attributes, price)
- [ ] Browse plants page with search + filters
- [ ] Filter by zone compatibility, native, water needs, deer resistance
- [ ] Save/bookmark plants
- [ ] Plant detail page with full attributes + risk reduction
- [ ] External links to nursery websites
- **Assignee:** VPS agent or local
- **Branch:** `feature/plant-cards`
- **Dependencies:** P0-2

### P0-5: AI agent chat
- [ ] Chat panel component (port from garden app ChatPanel.tsx)
- [ ] Claude API integration with tool use
- [ ] Tools: search_plants, get_plant_details, get_zone_recommendations
- [ ] Zone-aware recommendations ("What should I plant in Zone 0?")
- [ ] Basic preference memory (store in user record)
- **Assignee:** Local agent
- **Branch:** `feature/ai-agent`
- **Dependencies:** P0-2

### P0-6: Auth + user roles
- [ ] BetterAuth sign-up/sign-in
- [ ] User roles: homeowner, landscaper, nursery_admin, city_admin, platform_admin
- [ ] Role-based UI (different dashboard per role)
- [ ] Org creation for nurseries
- **Assignee:** VPS agent
- **Branch:** `feature/auth-roles`
- **Dependencies:** P0-1

### P0-7: Nursery data import + display
- [ ] Import scraped nursery data (Shooting Star, Flowerland, Valley View, etc.)
- [ ] Nursery profile pages
- [ ] "Available at" on plant cards with nursery name + price + external link
- [ ] Demo: Shooting Star inventory matched to LWF plants
- **Assignee:** VPS agent
- **Branch:** `feature/nursery-data`
- **Dependencies:** P0-2, P0-4

### P0-8: Nursery cart demo
- [ ] User builds a plant list/cart from saved plants
- [ ] "Send to nursery" button → populates a demo nursery cart page
- [ ] Demo nursery external site (simple HTML showing what the nursery would see)
- [ ] Cart shows: plant name, quantity, container size, price, total
- **Assignee:** VPS agent
- **Branch:** `feature/nursery-cart`
- **Dependencies:** P0-7

---

## 🟡 P1 — Homeowner Experience (Next 2 Weeks)

### P1-1: Property + plan saving
- [ ] Save property boundary + zones to DB
- [ ] Create and save plans (plant placements per zone)
- [ ] Plan history / versions

### P1-2: Lists + tagging
- [ ] Flat tag system (from joma-v2 pattern)
- [ ] User-created plant lists
- [ ] Shareable lists (public URL)

### P1-3: Agent preference learning
- [ ] Store user preferences (water, deer, aesthetics, budget)
- [ ] Agent references past preferences in new conversations
- [ ] Preference management UI

### P1-4: Plan document generation
- [ ] Generate PDF/HTML plan document
- [ ] Include: zone map, plant list, estimated cost, nursery sources
- [ ] Printable / submittable format

### P1-5: Scoring system
- [ ] Fire Safety Score per property/plan
- [ ] Pollinator Score
- [ ] Water Efficiency Score
- [ ] Deer Resistance Score

### P1-6: County parcel data integration
- [ ] Import Jackson County GIS parcel boundaries
- [ ] Auto-detect property boundary from address
- [ ] Structure footprint from parcel data

---

## 🟢 P2 — Professional Layer (Weeks 3-6)

### P2-1: Landscaper dashboard
### P2-2: Nursery org management + inventory upload
### P2-3: Compliance document generation
### P2-4: HOA dashboard
### P2-5: City analytics dashboard
### P2-6: Nursery POS/API connection framework

---

## 🔵 P3 — Scale (Months 2-6)

### P3-1: Marketplace/transaction layer
### P3-2: Regional template (expand beyond Jackson County)
### P3-3: Insurance certification pathway
### P3-4: Landscape plan design tool (full canvas)
### P3-5: AR property walkthrough
### P3-6: Landscape plan scanner/reader

---

## Assignment Status

| Task | Assignee | Branch | Status |
|------|----------|--------|--------|
| P0-1 | Local agent | feature/scaffolding | Not started |
| P0-2 | VPS agent | feature/lwf-api-client | Not started |
| P0-3 | Local agent | feature/map-zones | Not started |
| P0-4 | VPS/Local | feature/plant-cards | Not started |
| P0-5 | Local agent | feature/ai-agent | Not started |
| P0-6 | VPS agent | feature/auth-roles | Not started |
| P0-7 | VPS agent | feature/nursery-data | Not started |
| P0-8 | VPS agent | feature/nursery-cart | Not started |
