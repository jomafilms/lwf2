# AGENTS.md — LWF2 Development Workflow

## What Is This

A fire-safety-first garden ecosystem platform. Enter your address, see your fire zones, get compliant plant recommendations with local nursery pricing.

**Stack:** Next.js 15 + React 19 + TypeScript + Tailwind + Mapbox + Neon PostgreSQL + BetterAuth + Drizzle ORM

**Data source:** LWF API at https://lwf-api.vercel.app/api/v1 (do NOT duplicate this data — consume it)

---

## For Any Coding Agent

### Before You Start
1. Read this file
2. Read `docs/PRD.md` for product context
3. Read `BACKLOG.md` for prioritized tasks
4. Check existing PRs — don't duplicate work in progress

### Workflow
1. Pick the top unassigned task from BACKLOG.md
2. Create a branch: `feature/[task-slug]` or `fix/[task-slug]`
3. Do the work
4. Push branch, create PR with:
   - What this does (1-2 sentences)
   - What to test
   - Screenshots if visual change
5. Buggy (VPS agent) reviews, tests deployed preview, merges or requests changes

### Code Conventions
- **File size:** Target 300 lines, max 600. Split if larger.
- **Components:** One per file, named exports
- **Types:** TypeScript strict mode. Interface over type for objects.
- **Styles:** Tailwind only. No inline styles. No CSS modules.
- **API calls:** Use the LWF API client in `lib/api/lwf.ts`
- **Auth:** BetterAuth — see `lib/auth/`
- **DB:** Drizzle ORM — see `db/schema/`
- **No secrets in code.** Use env vars.

### Architecture Rules
- **LWF API is the plant data source.** Never store plant data locally. Always fetch from the API.
- **Nursery data IS stored locally** (our DB) — inventory, pricing, org profiles.
- **Property data IS stored locally** — boundaries, zones, plans.
- **User preferences ARE stored locally** — learned by agent, persisted in DB.
- **External links model:** Link OUT to nursery websites. Don't sell plants directly.
- **Flat tagging system:** Use tags for all grouping (lists, categories, filters). No rigid hierarchies.

### Key APIs
```
LWF Plant Data (read-only, external):
  Base: https://lwf-api.vercel.app/api/v1
  Spec: https://lwf-api.vercel.app/api/v1/docs-raw
  Fields: https://lwf-api.vercel.app/plant-fields.json
  
  GET /plants?includeImages=true&search=&limit=&offset=
  GET /plants/{id}
  GET /plants/{id}/values
  GET /plants/{id}/risk-reduction
  GET /plants/{id}/images
  GET /attributes/hierarchical
  GET /values/bulk?attributeIds=&plantIds=&resolve=true
  GET /filter-presets
  GET /nurseries
  GET /key-terms
  GET /resources
  GET /status

Mapbox (satellite + geocoding):
  Env var: NEXT_PUBLIC_MAPBOX_TOKEN
  Static Images API, Geocoding API, GL JS for interactive maps

Turf.js (geo calculations):
  buffer() for fire zone generation
  area() for zone sizing
  booleanPointInPolygon() for zone checks
```

### Environment Variables
```
# Database
DATABASE_URL=           # Neon PostgreSQL

# Auth
BETTER_AUTH_SECRET=     # BetterAuth secret
BETTER_AUTH_URL=        # App URL

# Maps
NEXT_PUBLIC_MAPBOX_TOKEN=  # Mapbox public token

# LWF API (no auth needed for GET)
NEXT_PUBLIC_LWF_API_BASE=https://lwf-api.vercel.app/api/v1

# AI Agent (optional)
ANTHROPIC_API_KEY=      # For AI chat features
```

---

## Agent Team Structure

### Buggy (VPS — Chief of Staff)
- Writes specs and creates GitHub issues
- Reviews all PRs before merge
- Tests deployed previews
- Manages backlog priority
- Coordinates between agents
- Runs overnight: bug fixing, testing, data work

### Local Coding Agent (Annie's machine)
- Heavy feature development (canvas, maps, complex UI)
- Has full dev server access
- Pushes feature branches

### VPS Coding Agents (spawned by Buggy)
- Smaller features, bug fixes, data integration
- API wiring, tests, documentation
- Work overnight while Annie sleeps
- Push branches, Buggy reviews

### Annie (Product Owner)
- Product decisions, design direction
- Manual UI/UX testing (especially canvas/map)
- Talks to Buggy, not directly to VPS agents
- Reviews and approves major changes

---

## Project Structure
```
lwf2/
├── apps/
│   └── web/                  # Next.js app
│       ├── app/              # App router pages
│       │   ├── (public)/     # Public pages (home, browse, sign-in)
│       │   ├── (auth)/       # Auth-required pages (dashboard, plans)
│       │   └── api/          # API routes
│       ├── components/       # React components
│       │   ├── map/          # Satellite, zones, property boundary
│       │   ├── plants/       # Plant cards, lists, search
│       │   ├── canvas/       # Garden planner canvas
│       │   ├── agent/        # AI chat panel
│       │   ├── nursery/      # Nursery profiles, inventory
│       │   ├── compliance/   # Plans, documents, tracking
│       │   └── ui/           # Shared UI primitives
│       ├── lib/
│       │   ├── api/          # LWF API client
│       │   ├── auth/         # BetterAuth setup
│       │   ├── geo/          # Turf.js zone calculations
│       │   └── utils/        # Helpers
│       └── public/           # Static assets
├── packages/
│   ├── database/             # Drizzle schema, migrations, queries
│   └── types/                # Shared TypeScript types
├── data/
│   ├── nurseries/            # Scraped nursery data (JSON)
│   └── parcels/              # County GIS data (private, gitignored)
├── docs/
│   ├── PRD.md                # Product requirements
│   ├── IMPLEMENTATION.md     # Technical implementation plan
│   └── RESEARCH.md           # Competitive research
├── AGENTS.md                 # This file
├── BACKLOG.md                # Prioritized task list
└── package.json
```

---

## Testing

### Automated (VPS agents run these)
- API integration tests (LWF endpoints responding correctly)
- Component render tests (vitest)
- Link checking (no dead links)
- Performance checks (page load times, payload sizes)

### Manual (Annie does these)
- Canvas/map interaction (drag, zoom, draw)
- Visual CSS review (text wrapping, spacing, mobile)
- Purchase/checkout flows (Stripe test mode)
- UX flow completeness

### Buggy Reviews
- Every PR gets diff review before merge
- Deployed preview tested after merge
- Screenshot comparison for visual changes
- Performance regression checks
