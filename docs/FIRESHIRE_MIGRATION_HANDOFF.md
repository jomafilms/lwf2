# Fireshire → joma Migration: Handoff for the New Agent

## TL;DR

We're migrating Rob Head's `roberthead/fireshire` repo to Annie's environment under the `jomafilms` GitHub org with a new (TBD) name. Rob keeps collaborator access but is not the maintainer going forward. Tech stack stays exactly the same. The only confirmed feature addition is **auth + saved properties**. Everything else is a candidate, not a decision.

**Important context about lwf2 references in this doc:** Lwf2 (the previous main app, this repo) was built over a few days as a "what can we deliver fast and looks cool" exercise, not a researched user-journey product. When this doc points at lwf2 code as a reference for a feature, treat it as **inspiration and prior art, not a validated pattern**. Absence of user adoption for any lwf2 feature isn't evidence the idea failed — most ideas were never user-tested.

---

## 1. Migration Plan

1. Wait for Rob's in-flight bug fixes on `roberthead/fireshire` to land.
2. Fork or import the repo to `jomafilms/<new-name>` on GitHub.
3. Rename, rebrand, but **do not change the tech stack**.
4. Stand up Annie's Vercel project + Neon DB.
5. Give Rob collaborator access (push rights) — he'll occasionally push fixes but does not maintain.
6. Deploy. Ship as-is under Annie's domain.
7. Decide on feature additions *only after* observing real user signal.

---

## 2. Stack (Preserve Exactly)

| Layer | Tech |
|---|---|
| Frontend | Vite + React 19 + TanStack Router + TanStack Query + mapbox-gl |
| Backend | FastAPI + Python 3.12+ + Poetry |
| DB | PostgreSQL (currently dockerized locally; Neon in prod) + SQLAlchemy async + Alembic |
| Chat | Anthropic SDK (`anthropic>=0.52`) — character is "Rascal" |
| GIS | Ashland ArcGIS proxy via `httpx` |

**Do not** rewrite the FastAPI backend as Next.js API routes. That was considered and rejected for migration phase 1. If the unified-stack idea returns, it's a separate decision after the migration is stable.

---

## 3. Confirmed Scope

### Auth + saved properties

- Users sign in, save the parcel they searched, return later to keep working on their plan
- Without this, fireshire is a one-shot lookup tool. With it, it's a return-visit journey tool.
- Reference implementation in `lwf2/apps/web/`:
  - Auth: BetterAuth at `apps/web/app/api/auth/[...all]/route.ts`
  - Saved properties model: `packages/database/schema/core.ts` → properties table
  - Save flow on map page: `apps/web/app/map/page.tsx` (look for `savedPropertyId`, `saveState`)
- In fireshire's stack, this means: pick a Python-side auth lib (e.g. `fastapi-users` or session-cookie-based with `itsdangerous`) and add `users` + `properties` tables to the existing SQLAlchemy schema. Don't directly port BetterAuth — wrong stack.

---

## 4. Candidate Scope — Build Only If User Signal Emerges

Do **not** speculatively build these. Wait for actual user demand. If a user keeps asking for X, port X.

| Feature | Lwf2 reference path | Notes |
|---|---|---|
| Assessment wizard | `apps/web/components/assessment/` | Structured intake: where am I on fire-readiness? |
| Property scoring | `apps/web/components/scoring/`, `apps/web/lib/scoring.ts` | Gives the user a number to improve over time |
| HOA flows | `apps/web/app/(public)/hoa/`, `apps/web/app/api/hoa/` | Multi-tenant: HOA admin invites residents, tracks compliance |
| RAG knowledge base for chat | `apps/web/lib/rag/` + `scripts/ingest-resources.ts` | Document ingestion + pgvector retrieval; chat answers grounded in trusted documents with trust tiers |
| Starred plants / lists + curated recommendations | `apps/web/app/(public)/lists/`, `apps/web/app/api/tags/`, `apps/web/app/api/lists/featured/` | **Deferred strategic bet.** Originally intended as a commerce engine for plants. The same list/tag pattern is live in production in jomav2 (joma.film) for movies, so this is the strongest-pedigree candidate to revive — but only if signal emerges for plant commerce or curated collections. The map experience has been the primary user attractor so far. |
| Auto building detection via Overpass API | `apps/web/app/api/buildings/overpass/route.ts` | Recent feature — replaces manual zone draw with auto building footprint detection. Fireshire already has Ashland-GIS-based building zones; Overpass is a fallback for outside-Ashland coverage. |
| Chat history persistence | `apps/web/app/api/conversations/` | Fireshire has a chat router but check whether it persists per-user history. |
| Conversation summarization | `apps/web/app/api/conversations/[id]/summarize/` | Long-thread compression for cost/context |

### Specifically out-of-scope-by-default (lwf2 archive parking lot)

The folders in `lwf2/apps/web/app/(public)/_archive_*` and `lwf2/apps/web/app/(auth)/dashboard/_archive_*` (nursery, marketplace, certification, plans, landscaper, climate, cost, orders, community, sources, my-plants, compliance, maintenance) are an extreme case of the broader speed-build pattern called out in the TL;DR — **10-hour builds that were never user-tested**. Their absence of adoption is not evidence they were bad ideas — they're an unvalidated parking lot. Don't dismiss them as failures, but also don't speculatively revive them. Wait for signal.

---

## 5. Explicit Non-Goals

- **Charisse's data admin tool** — that's a separate app (the `b3nj4m1n-46/Living-With-Fire---Data-Steward` repo or its successor). It lives at a different URL, has its own DB (DoltgreSQL staging → Neon prod sync), and is for internal data curators only. Keep it out of fireshire entirely.
- **Stack unification with lwf2** — out of scope for migration phase 1. Revisit only if running two stacks becomes painful.
- **Migrating lwf2 users into fireshire** — not planned. Lwf2 may be retired or kept as-is, separate product decision.

---

## 6. Known Issues to Inherit / Verify

### Address-picker 500 error (May 2026 observation)

Annie observed a 500 from `/parcels` on Rob's deployed fireshire demo. After reading the code:

- **Root cause hypothesis**: `backend/app/services/gis_client.py` only catches `httpx.TimeoutException` and `httpx.ConnectError`. Other `httpx` errors (e.g. `RemoteProtocolError`, `ReadError`) and `response.json()` `JSONDecodeError` bubble up unhandled and become 500s.
- Ashland's ArcGIS endpoint was verified healthy at the time. So the bug is in the wrapper, not the upstream GIS.
- **Fix**: broaden the `except` to catch `httpx.HTTPError` and wrap `response.json()` in try/except, raising `GISServiceError` either way. The existing `@app.exception_handler(GISServiceError)` in `main.py` will convert to a clean 503.
- **Verify before fixing**: Rob may already have fixed this in his bug-fix sprint. Check `git log` for `gis_client.py` after the migration before re-applying.

### Ashland ArcGIS data quirks (verified May 2026)

If you touch address normalization or query construction, know:
- `ADDRESSNUM` is `" "` (a literal single space) when blank, not `""` or `null`.
- `STREETNAME` already includes directional + suffix (`"S MAIN ST"`, not `"MAIN"`).
- Suffix abbreviations are already canonical (`BLVD`, not `BOULEVARD`).
- Spatial reference is `wkid:2270` (Oregon State Plane South, in feet); the API request must include `outSR=4326` to get WGS84 back.

---

## 7. Decisions Annie Still Needs to Make

| Decision | Status |
|---|---|
| New repo name (not "fireshire") | **Open** — direction TBD (literal? metaphorical? regional?) |
| Production domain / subdomain | **Open** — likely under livingwithfire.com or jomafilms.com |
| Neon DB: new project or reuse existing? | **Open** — recommend new Neon project for clean isolation from lwf2 |
| Auth provider | **Open** — recommend session-cookie-based, not BetterAuth (wrong stack) |
| When to actually run the migration | **Blocked** on Rob's bug-fix sprint completing |

---

## 8. Environment Variables (Inherited from Fireshire)

Backend `.env`:
```
ANTHROPIC_API_KEY=
FIRESHIRE_MAPBOX_TOKEN=
FIRESHIRE_DATABASE_URL=postgresql+asyncpg://...    # local Docker or Neon
```

Frontend `.env`:
```
VITE_MAPBOX_TOKEN=
```

Rename the `FIRESHIRE_*` prefix to the new project's prefix during migration. The codebase uses pydantic-settings, so it's a config-class change in `backend/app/config.py`, not a search-and-replace.

---

## 9. Reference: Recent Fireshire Features (as of late April 2026)

These are already in `roberthead/fireshire` (no porting needed; inherited via migration):

- **Populate plants by fire zone** (Apr 21) — DB-backed per-zone plant lists
- **On-parcel vs. adjacent buildings distinction** (Apr 28) — visual differentiation on map
- **Flexible address matching** (Apr 28) — suffix normalization (`Street` → `ST`), fuzzy fallback via `rapidfuzz`, SQL escaping
- **AllClear integration** (Apr 7) — fire-preparedness survey with progress tracking, Neon DB tables
- **Accessibility: prefers-reduced-motion** (Apr 29) — global CSS rule

---

## 10. Working Style Notes for the Agent

- Annie runs a tiny team — **maintainability is the #1 priority**. Don't add abstractions, layers, or features that don't pay rent.
- Annie prefers flat/simple architecture, DRY code, no skeleton loaders, lowercase "joma".
- File size cap: 250–300 lines.
- Don't speculatively revive `_archive_*` features from lwf2. Wait for signal.
- When in doubt, ask Annie. Don't guess on product direction.
