# LWF2 Phase 1 PRD — Fire-First Plant Tools

**Date:** 2026-03-31
**Status:** Active
**Goal:** Simple, Lovable, Complete plant tools for community fire safety

---

## What is this?

LWF2 helps communities choose fire-reluctant plants. Phase 1 targets HOAs in Ashland, OR — the first audience that needs this tool to update their CC&Rs with fire-safe plant guidance.

## Success looks like

1. An HOA creates an approved plant list with CC&R guidance text and per-plant notes (spacing, maintenance)
2. HOA committee members can sit around a table, open the app, browse plants with fire info front and center, and curate a list together
3. Residents can find what their HOA recommends and save favorites
4. Every HOA in Ashland can realistically adopt this

## Two audiences

| Audience | What they do | Entry point |
|----------|-------------|-------------|
| **Community Org** (HOA, nursery, city, neighborhood group) | Create and publish approved plant lists with guidance | "Enter as community organization" |
| **Resident** | Browse plants, view community lists, save personal favorites | "Find plants" / "See what your HOA recommends" |

## Three tools

### 1. Plants — Fire-first browser
Browse Charisse's 1,300+ plant database with fire safety as the primary lens.

**Filters:** Character score (slider), plant type (tree/shrub/perennial/groundcover), Home Ignition Zone, deer resistance, water needs, native, pollinator.

**Card design:** Fire score badge overlaid on image. Attribute badges below. Click opens slide-out detail panel.

**Slide-out detail:** Two sections — red fire risk (score, flammability notes, risk reduction, chemical content) and green plant details (height, water, sun, deer, benefits, evergreen).

### 2. Chat — AI plant advisor
Claude-powered assistant that knows the plant database and fire safety.

**Starters:**
- "Help me choose" — guided 3-question flow (what zone? water situation? deer?)
- "Home hardening tips" — general fire-safe landscaping advice
- Free-form questions

**Capabilities:** Search plants, explain fire ratings, learn user preferences, save recommendations to a list.

### 3. Map — Fire zone visualization
Enter an address, see fire zones around your structure.

- Zones: 0-5ft (critical), 5-30ft, 30-100ft
- Satellite imagery with zone overlays
- Future: place plants from your list onto zones

## One key feature: Lists

Lists are where everything lands. They're the product's hub.

**Structure:**
- Name (e.g., "Approved Zone 0 Plants")
- Description (e.g., "Per CC&R section 4.2, all plantings within 5ft of structures must be low-flammability...")
- Visibility: private, public, or org-only
- Color label
- Plants with per-plant notes (e.g., "Space 2ft apart, remove dead material monthly, keep under 1ft")

**Use cases:**
- HOA publishes "Approved Plants for Our Community" with CC&R guidance
- Resident saves "My Front Yard Picks"
- Nursery curates "Fire-Safe Natives In Stock"
- City publishes "Recommended for Ashland"

**Actions:** Create, edit, add plants (with notes), fork/copy public lists, share via link, star/follow lists.

## Home page

An interactive gateway — not a dashboard, not a browse page.

"Where do you want to start?"
- Browse all plants
- Chat with our plant advisor
- Map my property's fire zones
- See what my HOA/community recommends
- I represent a community organization

Beautiful, simple, 5 clear doors. Each leads to one of the three tools or the lists discovery page.

## Routes

**Public (no login):**
- `/` — entry gateway
- `/plants` — browse + filter
- `/plants/[id]` — plant detail
- `/chat` — AI advisor (try without login)
- `/lists` — discover community lists
- `/lists/[id]` — view list with description + notes
- `/map` — fire zone visualization
- `/sign-in`, `/sign-up`

**Authenticated:**
- `/dashboard` — simple hub
- `/dashboard/lists` — my lists
- `/dashboard/lists/[id]` — edit list
- `/dashboard/starred` — starred lists
- `/dashboard/preferences` — saved preferences
- `/dashboard/hoa` — org admin tools

## What is NOT in Phase 1

- Compare tool
- Marketplace / cart / orders
- Canvas plan designer
- Cost estimator
- Landscaper tools
- Nursery org management (inventory, orders)
- City analytics dashboard
- Compliance engine / certification
- Community progress tracking
- Plan documents / PDF generation
- Scoring panels

These features exist in the codebase but are archived (routes prefixed with `_`). They can return in later phases.

## Data model changes

**Tags table** (lists): add `description` text field
**Tag assignments** (list items): add `notes` text field

Both nullable, additive — no migration risk.
