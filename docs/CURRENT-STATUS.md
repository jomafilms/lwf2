# lwf2 — Current Status

**Last Updated:** 2026-05-13
**Last Commit:** `3b5172c` (Add agent workflow scaffolding + ignore local-only dirs)
**Branch:** main

---

## What Was Last Done

- Replaced manual building-outline drawing with automatic detection via the Overpass API (commit 8d18a73)
- Moved the star + add-to-list controls into the plant slide-out title header (7131e7a)
- Performance pass: lazy-loaded all images, paginated lists, capped panel thumbnails (9f2411c)
- Fixed chat history not saving by capturing the full state after streaming completes (9fae853)
- Stacked plant detail panel, swipe-to-close gesture, fixed thumbnail button clipping (902f62e)

---

## What's In Progress

### ⚠️ PARKED: RAG knowledge base bundle — on `rag-bundle` branch

A ~2,400-line feature (16 files) that adds a retrieval-augmented chat agent.
Lives on the **`rag-bundle` branch** (latest: `5774d3c`, pushed to origin).
**Do NOT merge to main without working through the checklist below.**

To resume: `git checkout rag-bundle`

**What it does:** lets the chat agent answer with citations from authoritative
fire-safety docs (PDFs, web pages, .docx, .rtf). Hybrid retrieval (vector + FTS)
with a trust-tier boost (local code > agency > science > general). Also adds
per-conversation summaries for cross-session memory.

**Files in the bundle (on `rag-bundle` branch, not on main):**
- `apps/web/lib/rag/` — chunker, embeddings, ingest, parsers, rerank, retrieve, summaries
- `apps/web/app/api/conversations/[id]/summarize/route.ts`
- `apps/web/app/api/chat/route.ts` (modified — chat endpoint refactor)
- `apps/web/lib/agent/system-prompt.ts` (+249 lines), `apps/web/lib/agent/tools.ts` (+60 lines)
- `packages/database/schema/core.ts` (+85 lines — adds `knowledge_documents`, `knowledge_chunks`, `conversation_summaries` tables w/ pgvector)
- `scripts/ingest-resources.ts` — ingest CLI
- `package.json`, `apps/web/package.json`, `package-lock.json` — new deps: `pdf-parse`, `mammoth`, `cheerio`, `tsx`, `dotenv`

**Before merging to main:**
1. Run `npm run db:generate` so the migration ships with the code
2. Verify the chat actually uses RAG end-to-end (golden path test)
3. Confirm with Annie whether this is on the critical path

### Other in-flight

- [FIRESHIRE_MIGRATION_HANDOFF.md](./FIRESHIRE_MIGRATION_HANDOFF.md) (untracked) — handoff doc for the in-flight rebrand
- Workflow system initialization: `.claude/` setup, `docs/CURRENT-STATUS.md`, `docs/PROJECT-RULES.md` (template still has placeholders — interview pending)

---

## What's Next

To be confirmed with Annie. Candidates based on recent work:

- Decide fate of the parked RAG bundle (see "What's In Progress" above — ship after verification, prune, or move to a branch)
- Resolve the FireShire migration direction (see [FIRESHIRE_MIGRATION_HANDOFF.md](./FIRESHIRE_MIGRATION_HANDOFF.md))

---

## Known Issues / Blockers

None recorded yet. Add here as discovered.

---

## Open Decisions Needing Annie

- FireShire rebrand / extraction scope — see [FIRESHIRE_MIGRATION_HANDOFF.md](./FIRESHIRE_MIGRATION_HANDOFF.md)
- Whether the in-flight RAG ingestion work (`lib/rag/`, `scripts/ingest-resources.ts`) is on the critical path or exploratory

---

## Code Quality Criteria (always enforce)

- **DRY:** No duplicated logic. Extract shared helpers.
- **No hardcoded values:** All configurable values in config files.
- **File size:** Target 250-300 lines max. Split if larger.
- **Maintainable:** Small team must be able to understand any file quickly.
- **Testable:** Functions should be unit-testable independently.
- **Business rules:** Code must match [PROJECT-RULES.md](./PROJECT-RULES.md)

---

## Reference Docs (Tier 1 — rarely change)

- [PROJECT-RULES.md](./PROJECT-RULES.md) — business rules and constraints
- [PRD.md](./PRD.md), [PRD-PHASE1.md](./PRD-PHASE1.md) — product requirements
- [FLYWHEEL.md](./FLYWHEEL.md), [FLYWHEEL-GAPS.md](./FLYWHEEL-GAPS.md) — product strategy
- [IMPLEMENTATION.md](./IMPLEMENTATION.md) — implementation guide
- [BUILD-RULES.md](./BUILD-RULES.md) — build conventions
- [FIRESHIRE_MIGRATION_HANDOFF.md](./FIRESHIRE_MIGRATION_HANDOFF.md) — in-flight rebrand context
- [FIRESHIRE_INTEGRATION.md](./FIRESHIRE_INTEGRATION.md) — original fireshire code integration notes (March 2026)
- [BUILD-LOG.md](./BUILD-LOG.md) — historical build log
- [SPEC-DRIVEN-DEVELOPMENT.md](./SPEC-DRIVEN-DEVELOPMENT.md) — spec-driven workflow notes
- [POLISH-PLAN.md](./POLISH-PLAN.md) — UI polish backlog
- [TEST-REPORT.md](./TEST-REPORT.md) — most recent test report
- [RESEARCH.md](./RESEARCH.md) — research notes
- [NURSERIES.md](./NURSERIES.md) — nursery feature notes
- [regional-setup.md](./regional-setup.md) — regional configuration setup
- [stakeholder-insights.md](./stakeholder-insights.md) — stakeholder interview insights
