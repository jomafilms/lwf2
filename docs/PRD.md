# FireScape — Product Vision & Requirements

**Version:** 2.0 (Real PRD, not codeathon scope)
**Authors:** Annie Lundgren + Buggy
**Date:** March 28, 2026
**Status:** Vision → Implementation Planning

---

## What Is This

A fire-safety-first garden ecosystem platform.

Homeowners see their fire zones and get AI-guided plant recommendations. Landscapers design compliant yards with real plant data and local pricing. Nurseries connect their catalogs to actual demand. Cities track community-wide progress toward wildfire resilience goals.

Powered by the only cross-referenced fire-resistant plant database in existence.

**It's not a plant picker. It's the connective tissue for everyone who touches a yard.**

---

## The Analogy

**joma.film** connects filmmakers ↔ curators ↔ fans around films.
**FireScape** connects nurseries ↔ landscapers ↔ homeowners ↔ cities around yards.

But unlike joma, the demand is being MANDATED — by insurance companies, city codes, and climate reality. The market isn't something you build. It's something you serve.

---

## Core Model

### Participants

| Role | What they do | What they need | Equivalent in joma |
|------|-------------|----------------|-------------------|
| **Homeowner** | Owns the yard, makes decisions | See my zones, know what to plant, find someone to do it | Fan |
| **Landscaper** | Designs and installs | Compliant plant data, client tools, city submission | Curator |
| **Nursery** | Supplies plants | Know what's in demand, connect to landscapers | Filmmaker (publishes catalog) |
| **City/HOA** | Validates compliance, tracks progress | Analytics, adoption rates, documentation | Admin |
| **Data Admin** | Maintains the plant database | Easy update tools, conflict resolution, source management | Platform admin |

### Key Difference from joma

Nobody "owns" a plant the way a filmmaker owns a film. The plant data is a shared resource (Charisse's database). The value isn't in the content — it's in the CONTEXT: which plant, where on your property, at what spacing, available where, at what price.

The platform creates value by connecting context to action.

### Revenue (Not Day One — But Designed In)

**Phase 1:** Free / open source core. No revenue. Build adoption.
**Phase 2:** SaaS for professional users (landscapers, nurseries). Monthly subscription for tools, analytics, client management.
**Phase 3:** Marketplace fee (small %) when nursery sales happen through the platform. Like joma's 20% but probably 5-10% since we're not hosting/streaming anything.
**Alternative:** City/grant funded for the public-facing tools. SaaS for professional layer.

Don't decide now. Design the architecture so any of these work.

---

## Platform Architecture

### Layer 1: The Map (Foundation)

**What:** Property-level visualization with geographic data layers.

- **Address → geocode → satellite view** (Mapbox, already built in garden app)
- **Parcel boundaries** from county GIS data (Jackson County assessor data = real lot lines, no manual drawing)
- **Structure detection** — auto-detect buildings from satellite/parcel data, or manual draw
- **Fire zone calculation** — Turf.js buffer from structure: 0-5ft (Zone 0), 5-30ft (Zone 1), 30-100ft (Zone 2)
- **Extensible overlay system** — designed so ANY geo layer can be added later:
  - City wildfire hazard zones
  - CWPP priority areas
  - Firewise community boundaries
  - Watershed boundaries
  - Soil types
  - Climate zones
  - Utility easements

**From garden app:** SatelliteBackground.tsx, PropertyBoundaryDrawer.tsx, InfiniteCanvas.tsx, coordinate utils, Mapbox service

**New:** Fire zone buffer calculation, parcel data integration, overlay layer system

### Layer 2: The Intelligence (Data + AI Agent)

**What:** Charisse's plant database + a conversational AI that understands fire-safe landscaping holistically.

**Data source:** LWF API (https://lwf-api.vercel.app/api/v1)
- 1,300+ plants with fire scores, placement rules, water needs, native status, deer resistance, pollinator support, bloom time, growth characteristics
- Hierarchical attributes with resolved display values
- Risk reduction scoring per plant
- Growing constantly — the app is the UI layer for this living database

**AI Agent (replaces deterministic solver from garden app):**
- Conversational — "I have deer and want low-water plants near my front windows"
- Has tools to query LWF API, filter plants, check zone compliance
- Understands Charisse's priority framework: Placement → Spacing → Maintenance → Plant Selection
- **Learns user preferences** — persistent memory across sessions
  - "You mentioned you don't like plants that drop a lot of debris"
  - "Last time we talked about your shade situation on the north side"
  - "Based on your preferences, here are 3 plants for your Zone 0"
- Can assess uploaded landscape plans / photos
- Can generate maintenance calendars based on what's planted
- OpenClaw-style UX: persistent, learns, proactive suggestions
  - **Security consideration:** Sandbox per user — agent can't see other users' data
  - Token-based auth for agent API access
  - User data isolated

**From garden app:** ChatPanel.tsx, agent skill prompts (data/agents/), interactive Q&A system
**From LWF:** Full API, plant-fields.json for agent context, OpenAPI spec for tool definitions
**New:** Fire-aware agent tools, preference learning system, plan assessment capabilities

### Layer 3: The Catalog (Plants + Nurseries + Pricing)

**What:** A browsable, searchable plant catalog with local availability and pricing. Like browsing films on joma, but for plants.

**Plant Cards** (like film cards on joma):
- Plant image, common name, botanical name
- Fire score / zone compatibility badges
- Key attributes: water needs, native, deer resistant, pollinator-friendly
- "Available at:" with nursery names + published pricing
- Save to list, add to plan

**Lists** (like curator lists on joma):
- Users create lists: "My Zone 0 Plants", "Low Water Native Favorites", "Pollinator Garden"
- Shareable — social contagion mechanism
- Landscapers create client lists
- HOAs create approved plant lists
- Flat tagging system (from joma) for endless grouping

**Nursery Catalogs:**
- Each nursery is an "org" (like joma filmmaker orgs)
- Published pricing — NOT real-time POS integration (yet)
- Sources: uploaded price lists, flyer scanning, CSV import, eventually API
- Platform matches nursery inventory to plants in the database
- Plants not yet in LWF database? Flag for Charisse to review/add
- **External links model** (like joma external films) — link OUT to nursery websites for purchase

**From joma-v2:** Film card components, lists system, external links model, org structure, flat tag system, save/bookmark functionality
**New:** Plant card design, nursery org onboarding, price list import, inventory matching

### Layer 4: The Compliance Engine (The Boring Money)

**What:** Documentation and tracking that proves fire-safe compliance. Not prescriptive ("you must") but evidentiary ("here's proof of what I did").

**For Homeowners:**
- Generate compliance documentation for their property
- Wildfire Prepared Home certification checklist + progress tracker
- Insurance documentation: "My property meets Zone 0 requirements because..."
- Before/after documentation with photos

**For HOAs:**
- Dashboard: which properties have submitted plans, which haven't
- Aggregate compliance percentage
- CCR-compatible reports
- Bulk notification tools ("Reminder: Zone 0 assessment due by June 1")

**For Landscapers:**
- Generate city/HOA-submittable plan documents
- Materials list with pricing
- Compliance certification for completed work
- Portfolio of completed fire-safe projects

**For Cities:**
- Analytics dashboard: adoption rates by neighborhood/zone
- Progress toward CWPP goals (90% in 10 years)
- Grant documentation: "X homeowners used the tool, Y compliance achieved"
- Parcel-level data on community wildfire readiness
- QR mailer campaigns: direct homeowners to register and map their property

**From joma-v2:** Dashboard patterns, analytics, multi-role views
**New:** Compliance document generation, certification tracking, city analytics, HOA management

### Layer 5: The Fun (What Makes People Use It)

**What:** The stuff that makes this feel like a garden tool, not a compliance form.

- Visual garden planning canvas (from garden app — InfiniteCanvas, drag/drop)
- See your yard transform as you add/remove plants
- Scores that gamify: 🔥 Fire Safety Score, 🦋 Pollinator Score, 💧 Water Efficiency Score, 🦌 Deer Resistance Score
- Seasonal calendar: "It's February — prune your Zone 1 trees"
- Maintenance reminders (text/email opt-in)
- Share your plan with neighbors (social contagion)
- Before/after photo comparisons
- "Your neighborhood: 47% of homes have Zone 0 plans" (peer pressure)
- Image upload: photo of your yard → AI identifies plants → maps to database
- Eventually: AR walkthrough of planned changes

---

## Technical Stack

### Frontend
- React + TypeScript + Tailwind CSS
- Mapbox GL JS for maps/satellite
- Turf.js for geo calculations (zone buffers, area)
- Canvas components from garden app
- Vite (from garden app) or Next.js (from LWF/joma)

### Backend
- Next.js API routes OR FastAPI (garden app already has FastAPI)
- BetterAuth for authentication (from joma-v2)
- PostgreSQL (Neon) with Drizzle ORM (from joma-v2/LWF)
- LWF API as primary plant data source (consume, don't duplicate)

### AI Agent
- Claude API with tool use
- Tools: search_plants, get_plant_details, get_zone_recommendations, get_nursery_availability, assess_landscape_plan
- Preference memory: stored per user in DB
- OpenClaw integration for persistent agent sessions (sandboxed)

### Data Sources
- LWF API — plant data, attributes, risk reduction
- Jackson County GIS — parcel boundaries, structure footprints
- Mapbox — satellite imagery, geocoding
- Nursery price lists — CSV import initially
- User-uploaded photos/plans — stored in R2 or S3
- CWPP / city overlay data — GeoJSON

### Auth & Multi-Tenant
- BetterAuth (proven in joma-v2)
- Roles: homeowner, landscaper, nursery, city_admin, data_admin, platform_admin
- Orgs: nurseries and public entities are orgs (like joma filmmaker orgs)
- Users can belong to multiple orgs
- Public profiles optional (landscaper portfolios, nursery catalogs)

---

## Data Model (Key Entities)

```
User
  - id, email, name, roles[]
  - preferences (JSON — learned by agent)
  - org memberships

Org (Nursery, HOA, City, Landscaping Company)
  - id, name, type, logo, contact info
  - members (users with roles)
  - public profile (optional)

Property
  - id, owner (user), address, lat/lng
  - parcel_boundary (GeoJSON polygon — from county data)
  - structure_footprints (GeoJSON polygon[] — detected or manual)
  - fire_zones (calculated from structures)

Plan
  - id, property_id, created_by (user or landscaper)
  - status: draft | submitted | approved | completed
  - plant_placements[] (plant_id, zone, position, quantity)
  - estimated_cost
  - compliance_score
  - generated_documents[]

PlantSave (like joma film saves)
  - user_id, plant_id (references LWF API)
  - lists[] (via tags)
  - notes

List (flat tagging, like joma)
  - id, name, owner, visibility (private/public/org)
  - tags[]
  - plant_ids[]

NurseryInventory
  - org_id (nursery), plant_id (LWF reference)
  - price, availability, last_updated
  - source: manual | csv_import | api

ComplianceRecord
  - property_id, type (zone_0_assessment, full_certification, etc.)
  - status, date, documentation[], photos[]
  - verified_by (landscaper or inspector)
```

---

## What Exists vs. What Needs Building

### Reuse (significant head start)
| Component | Source | Effort to Adapt |
|-----------|--------|-----------------|
| Satellite + property boundary | garden app | Low — swap context |
| Infinite canvas + shapes | garden app | Low — add fire zone rendering |
| Chat panel + agent UX | garden app | Medium — new tools, preference learning |
| Plant data API | LWF | None — consume as-is |
| Auth system pattern | joma-v2 | Medium — new instance, same approach |
| Org/role structure | joma-v2 | Medium — different roles, same pattern |
| Tagging/lists | joma-v2 | Low — copy pattern |
| External links model | joma-v2 | Low — nursery links instead of iTunes |
| Card components | joma-v2 | Medium — plant cards instead of film cards |

### Build New
| Component | Complexity | Priority |
|-----------|-----------|----------|
| Fire zone calculation (Turf.js buffer) | Low | P0 |
| County parcel data integration | Medium | P0 |
| Plant card UI | Medium | P0 |
| Zone-aware plant filtering | Low | P0 |
| AI agent with LWF tools | Medium | P0 |
| Nursery inventory import (CSV) | Low | P1 |
| Plan document generation | Medium | P1 |
| Compliance tracking | Medium | P1 |
| HOA dashboard | Medium | P2 |
| City analytics | High | P2 |
| Landscape plan scanner/reader | High | P3 |
| AR walkthrough | High | P3 |
| POS integration | High | P3 |

---

## Implementation Phases

### Phase 0: Foundation (This Weekend → Next 2 Weeks)
**Goal:** Working prototype that demonstrates the vision.

- Address → satellite → parcel boundary → fire zones
- Plant recommendations per zone from LWF API
- AI agent with basic plant search + zone awareness
- Plant cards with save/list functionality
- Basic auth (BetterAuth)
- Deploy to Vercel

### Phase 1: Homeowner Experience (Weeks 3-6)
**Goal:** A homeowner can map their property, get recommendations, and save a plan.

- Preference learning in agent
- Photo upload → plant identification
- Plan creation and saving
- Nursery catalog browsing (static data from friend's DB)
- "Available at [nursery]" on plant cards with external links
- Maintenance calendar generation
- Scoring system (fire, pollinator, water, deer)

### Phase 2: Professional Layer (Weeks 7-12)
**Goal:** Landscapers and nurseries have tools that make their work easier.

- Landscaper accounts with client management
- Plan design tool (canvas-based, from garden app)
- Compliance document generation
- Nursery org accounts with inventory upload (CSV)
- Price list matching to LWF plants
- Landscaper portfolio / public profiles

### Phase 3: Community & City (Months 4-6)
**Goal:** HOAs and cities can track and drive adoption.

- HOA compliance dashboard
- City analytics (adoption rates, progress toward CWPP goals)
- QR campaign tools for homeowner registration drives
- Neighborhood-level aggregation and reporting
- Grant documentation exports
- City overlay data integration (CWPP zones, hazard maps)

### Phase 4: Marketplace & Scale (Months 6-12)
**Goal:** The platform generates revenue and expands beyond Ashland.

- Nursery → landscaper → homeowner transaction facilitation
- Revenue model activated (SaaS and/or platform fee)
- Regional template system (adapt for other counties/states)
- Landscape plan design tool (professional grade)
- Insurance integration pathway
- POS system connections for nurseries

---

## Competitive Position

**From the research (landscaping-software-research.md):**

- No existing product combines fire data + landscape design + local nursery inventory
- Charisse's database is a unique moat — 1,300+ plants with cross-referenced fire data from multiple sources
- The nursery → landscaper → homeowner pipeline is completely fragmented everywhere else
- Regulatory tailwind — California AB 3074, Oregon following, insurance industry shifting to incentivize compliance
- Professional landscape design tools are expensive desktop software with ZERO fire data
- Consumer apps are pretty but have ZERO fire awareness or compliance features
- Fire-specific tools serve government inspectors, not homeowners/landscapers

**Blue ocean:** Fire-safety-first garden ecosystem with the complete stakeholder chain. Nobody is here.

---

## Open Questions

1. **Name:** FireScape? LWF Planner? Something else?
2. **Monorepo or separate repos?** Could be an app within the LWF monorepo (apps/planner alongside apps/api and apps/admin)
3. **React (Vite) or Next.js?** Garden app is Vite + React. LWF/joma are Next.js. Next.js probably better for SEO and server-side data.
4. **Agent hosting:** OpenClaw per-user sessions? Direct Claude API? Need to figure out sandboxing.
5. **County data format:** What format is the Jackson County parcel data? GeoJSON? Shapefile? Will determine integration approach.
6. **Nursery friend's DB:** What format is the zip? Need to assess and map to LWF plant IDs.
7. **Open source boundaries:** Core app open source. What about the nursery/marketplace layer?

---

*This is a real business in a blue ocean with regulatory tailwind, a unique data moat, and existing code to build from. Let's go. 🔥🌿*
