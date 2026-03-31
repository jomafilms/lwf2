---
name: lwf2 project context
description: FireScape — fire-safety-first garden ecosystem platform connecting nurseries, landscapers, homeowners, and cities around yards
type: project
---

## What lwf2 Is

**FireScape** — a fire-safety-first garden ecosystem platform. Homeowners see fire zones and get AI plant recommendations. Landscapers design compliant yards. Nurseries connect catalogs to demand. Cities track community progress.

**Stack:** Next.js 15 + React 19 + TypeScript + Tailwind + Mapbox + Neon PostgreSQL + BetterAuth + Drizzle ORM

**Key principle:** LWF API (https://lwf-api.vercel.app/api/v1) is THE plant data source — never duplicate, always consume. Nursery data, property data, and user preferences ARE stored locally.

## Architecture (5 Layers)
1. **Map** — Address → satellite → parcel boundary → fire zones (Turf.js buffer from structures)
2. **Intelligence** — LWF plant DB + conversational Claude AI agent with tool use + preference learning
3. **Catalog** — Plant cards with nursery pricing, lists/tags (joma pattern), external links to nurseries
4. **Compliance** — Plan documents, certification tracking, HOA/city dashboards
5. **Fun** — Canvas planner, scoring (fire/pollinator/water/deer), seasonal calendar, sharing

## Roles
Homeowner, Landscaper, Nursery, City/HOA, Data Admin (maps to joma: fan, curator, filmmaker, admin)

## Pulls From
- **lwf**: Plant data API (consumed as-is), EAV attribute system
- **joma-v2**: Auth (BetterAuth), org/role pattern, lists/tags, card components, external links model
- **garden**: Satellite/map components, canvas, ChatPanel, coordinate utils, agent patterns

## Current Phase
Phase 0 — Foundation. P0-1 (scaffolding) is first task. Backlog in BACKLOG.md.

## Agent Team
- **Buggy** (VPS): Chief of staff — writes specs, reviews PRs, manages backlog, overnight work
- **Local agent** (Annie's machine): Heavy features (canvas, maps, complex UI)
- **VPS coding agents** (spawned by Buggy): Smaller features, API wiring, tests
- **Annie**: Product owner, design direction, manual testing

## Critical Rules
- "fire-reluctant" or "fire-resistant" — NEVER "fire-resilient"
- Priority framework: Placement → Spacing → Maintenance → Plant Selection
- File size: target 300 lines, max 600
- Flat tagging system, no rigid hierarchies
- External links model — link OUT to nursery sites, don't sell directly
