# Agent Workflow — Paste This Into Your CLAUDE.md

<!-- Copy everything below into your project's .claude/CLAUDE.md -->
<!-- Place it at the TOP of the file so every agent sees it first -->

## START HERE — Every Agent Must Follow This Workflow

### Step 1: Read current state
- **Always read `docs/CURRENT-STATUS.md` first.** It has: what was last done, what's in progress, what's next, blockers.
- For business logic: read `docs/PROJECT-RULES.md`

### Step 2: The task cycle (every task, every time)
```
1. READ    → CURRENT-STATUS.md + relevant reference docs
2. PLAN    → Update CURRENT-STATUS.md "What's In Progress" with your task
3. BUILD   → Implement code changes
4. VERIFY  → Type-check, test, review against project rules
5. /review → If change touches money, security, business rules, new files, or is large (>100 lines / >3 files), run /review for independent agent review. Otherwise, self-check: DRY? Hardcoded? File >300 lines? Testable?
6-8. /update → Run /update to force the finish line: update CURRENT-STATUS.md, commit code + docs together, handoff summary.
```

### Available slash commands
- **`/update`** — Forces steps 6-8. Update docs, commit together, handoff. Use at end of every task.
- **`/review`** — Independent agent review. Checks against project rules + code quality. Use when triggers are met.
- **`/project-status`** — Creates a timestamped snapshot and resets CURRENT-STATUS.md. Use on significant phase completions.

### When project rules might be wrong
If the code needs to do something that **conflicts with the project rules doc**, STOP and ask the project owner. Don't assume the code should override the rules or vice versa. Flag it clearly.

### Code quality criteria (enforce on every change)
- **DRY:** No duplicated logic. Extract shared helpers.
- **No hardcoded values:** All configurable values in config files.
- **File size:** Target 250-300 lines max. Split if larger.
- **Maintainable:** Small team. Every file must be understandable quickly.
- **Testable:** Functions should be unit-testable independently.
- **Business rules:** Code must match `docs/PROJECT-RULES.md`

---

## Project: lwf2

A fire-safety-first garden platform built around Charisse Sydoriak's ~1,300-plant database, with a conversational AI advisor that helps property owners pick fire-resistant plants and design defensible-space layouts. The product was a fast speed-build over a few days — "fast + looks cool" — not a validated product. Treat current shape as exploratory.

### Stack

- Next.js 15 + React 19, TypeScript 5.7, App Router
- PostgreSQL (Neon) + Drizzle ORM
- BetterAuth
- Anthropic SDK (`@anthropic-ai/sdk`) for the chat agent — tool calls + RAG
- Mapbox GL + Turf.js for parcel maps and fire-zone buffers
- Radix UI + Tailwind 3.4
- npm workspaces (no Turborepo)

### Monorepo layout

```
apps/web                  Next.js app (UI + API routes)
packages/database/schema  Drizzle schema (auth, core, marketplace, nurseries, social)
packages/types            Shared TypeScript types
```

### Key dev commands (from root)

```
npm run dev          Start Next.js dev server (apps/web)
npm run build        Build all workspaces
npm run type-check   tsc across workspaces
npm run db:generate  Generate Drizzle migrations
npm run db:migrate   Run migrations
npm run db:push      Push schema (dev only)
npm run db:studio    Drizzle Studio
```

### Where things live in apps/web

- `app/(public)/` — public routes (plants, lists, sign-in)
- `app/api/` — API routes (chat, properties, parcels, nurseries, etc.)
- `app/api/chat/route.ts` — streaming Claude chat endpoint
- `lib/agent/` — system prompt + tool definitions for the chat agent
- `lib/geo/` — fire-zone buffer math (Turf.js)
- `lib/api/lwf.ts` — client for the external plant database
- `lib/rag/` — document ingestion + retrieval for compliance docs
- `lib/plants/` — plant presentation/normalization
- `components/ui/` — Radix + Tailwind primitives
- `components/plants/`, `lists/`, `zones/`, `plans/`, `agent/` — feature UIs

### Conventions

- Drizzle schema is the source of truth — no raw SQL
- AI tool definitions in `lib/agent/tools.ts`; system prompt in `lib/agent/system-prompt.ts`
- Plant data is consumed from the external LWF API; do not duplicate it locally
- Folders prefixed `_archive_` are deprecated — read for context, don't extend them
- Working docs live in `docs/`. `BUILD-LOG.md`, `BUILD-RULES.md`, `PRD.md`, `FLYWHEEL.md`, `IMPLEMENTATION.md` are the main reference docs
- `FIRESHIRE_MIGRATION_HANDOFF.md` describes an in-flight rebrand/extraction — read before touching anything that looks renamed

### Annie-specific

- Solo founder of joma.film; lwf2 is one of several projects
- Prefers flat/simple architecture, DRY code, no skeleton loaders, lowercase "joma"
- Maintainability > cleverness — the team is tiny
