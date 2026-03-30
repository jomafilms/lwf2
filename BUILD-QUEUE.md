# BUILD QUEUE — Autonomous Build Loop

> **Last updated:** 2026-03-30 00:30 UTC
> **Session status:** POST-DEMO — demos completed ~23:30 UTC. Awaiting Annie's feedback.
> **Phase 0-3 COMPLETE.** All Priority A, B, and most C tasks done.
> **Remaining:** C4 (AR), C5 (plan scanner), C6 (climate adaptation) + stretch goals

## 🚨 FIRST: If You Just Woke Up

1. Read this file completely
2. Run `cd /home/buggy/lwf2 && git log --oneline -10` to see what's been merged
3. Run `git branch -r --no-merged main` to see what's in progress
4. Check `git status` for uncommitted work
5. Read `docs/stakeholder-insights.md` for product context
6. Read `AGENTS.md` for coding conventions
7. Pick up the next PENDING task below

## ✅ COMPLETED

- [x] P0-1: Project scaffolding
- [x] P0-2: LWF API TypeScript client
- [x] P0-3: Address → satellite → fire zones
- [x] P0-4: Plant browse/detail/search/filter
- [x] P0-5: AI agent chat with Claude + tools
- [x] P0-6: Auth + user roles + dashboard
- [x] P0-7: Nursery data import (2,446 plants, 5 nurseries)
- [x] P0-8: Nursery cart demo
- [x] P1-1: Property + plan saving
- [x] P1-2: Lists + tagging (flat tags)
- [x] P1-3: Agent preference learning
- [x] P1-4: Plan document generation (PDF)
- [x] P1-5: Scoring system (fire/pollinator/water/deer) — merged 04:14 UTC
- [x] Mapbox CSS build fix — merged 04:13 UTC
- [x] Stakeholder insights doc — merged 04:10 UTC
- [x] P1-6: County parcel data (Jackson County GIS auto-detect) — merged 04:25 UTC

## 🔄 IN PROGRESS

(Phase 2 COMPLETE — build testing + quality pass, then Phase 3 overnight)

## 📋 PENDING (in priority order)

### Priority A — Tonight (before Annie sleeps ~7am UTC)

- [x] **A1: AI Agent — nuanced, informed decision-making** — merged 04:17 UTC
  - Rewrote system prompt + tools for empowered decision-making, source citations, property-specific nuance
  
- [x] **A2+A3: Home page polish + mobile responsive** — merged 04:30 UTC
- [x] **A4: Inline plant cards in chat** — merged 04:30 UTC (display_plants tool + rich cards)

### Priority B — Overnight autonomous build (9:05-14:00 UTC)

- [x] **B1: P2-3 Compliance document generation** — merged 04:39 UTC (Sonnet)
- [x] **B2: P2-4 HOA dashboard** — merged 04:39 UTC (Sonnet)
  
- [x] **B3: P2-1 Landscaper dashboard** — merged 04:47 UTC (Sonnet)

- [x] **B4: P2-2 Nursery org management** — merged 04:55 UTC (Sonnet)

- [x] **B5: P2-5 City analytics dashboard** — already built (391-line CityAnalyticsDashboard component)

- [x] **B6: Data provenance display** — already built (sources integrated into plant detail page, /sources page exists)

- [x] **B7: Plant comparison tool** — already built (132-line compare page at /plants/compare)

- [x] **B8: Maintenance calendar/reminders** — merged 05:21 UTC (Sonnet)

- [x] **B9: Property assessment walkthrough** — merged 05:27 UTC (Sonnet)
- [~] **B10: Community progress** — partial (tangled branch, core concepts in B2 HOA dashboard)

- [x] **B11: Insurance/certification tracker** — merged 05:33 UTC (Sonnet)

- [x] **B12: Cost estimator** — merged 05:40 UTC (Sonnet)

### Priority C — Phase 3 (PRD: Scale, Months 2-6)

- [x] **C1: P3-2 Regional template** — merged 10:20 UTC (feature/regional-template) — County abstraction system allows platform to work anywhere with minimal config. GIS APIs, field mappings, local resources all configurable per county.
- [x] **C2: P3-1 Marketplace/transaction layer** — merged 11:35 UTC (feature/marketplace-layer) — Full order routing from homeowners→nurseries. Cart system, order management, fulfillment tracking. Revenue model designed in but not active.
- [x] **C3: P3-4 Landscape plan design tool** — merged 12:00 UTC (feature/plan-design-tool) — Professional canvas with plant placement, fire zone overlay, spacing guides, mature size visualization. Konva-based with save/load functionality.
- [ ] **C4: P3-5 AR property walkthrough** — Camera-based property assessment using device camera. Plant identification via photo.
- [ ] **C5: P3-6 Landscape plan scanner/reader** — Upload existing landscape plan image, AI extracts plant list and layout.
- [ ] **C6: Climate adaptation tagging** — Flag plants showing climate stress, integrate climate projection data.
- [x] **C7: Shooting Star nursery cart demo** — merged 12:30 UTC (feature/shooting-star-demo) — Complete marketplace with real inventory (1,733+ plants), fire safety scores, live availability, full cart-to-order flow with actual Shooting Star data.

NOTE: Skip data admin/conflict resolution tools (Benjamin is building those). Skip revenue/SaaS model. Skip AR walkthrough. Focus on user-facing tools.

### Stretch / community ideas
- [ ] Tower defense game (Garen's idea — accidental education)
- [ ] Social media content generator from plant data
- [ ] Growth projection modeling (what does your yard look like in 5 years?)

## 🔧 KNOWN ISSUES

- GitHub PAT lacks PR write permissions — merge directly to main
- Vercel deploy needs Root Directory set to `apps/web`
- Some TypeScript type errors in API routes (non-blocking with skipLibCheck)
- `@anthropic-ai/sdk` types missing locally (works on Vercel with npm install)

## 📝 HOW TO BUILD A TASK

1. `cd /home/buggy/lwf2 && git checkout main && git pull`
2. `git checkout -b feature/[task-slug]`
3. Read the task doc if it exists in `docs/tasks/todo/`
4. Read relevant existing code first (check what's already built!)
5. Build it — target 300 lines per file, max 600
6. TypeScript strict, Tailwind only, named exports
7. `git add -A && git commit -m "feat: [description]"`
8. `git push origin feature/[task-slug]`
9. Merge: `git checkout main && git merge feature/[task-slug] --no-edit && git push origin main`
10. **UPDATE THIS FILE** — move task to COMPLETED with timestamp
11. `git add BUILD-QUEUE.md && git commit -m "queue: mark [task] complete" && git push origin main`
12. Pick next task

## 🤖 OVERNIGHT CRON INSTRUCTIONS

A cron job fires at 9:05 UTC (2:05am PT) to restart the build loop after token reset.
The cron agent should:
1. Read this file
2. Pick the next PENDING task (Priority B in order)
3. Build it directly (don't spawn sub-agents — you ARE the builder)
4. After completing each task, update this file and push
5. Continue to next task
6. Stop at 14:00 UTC (7am PT) — Annie will be waking up
7. Leave a summary of what was built in the git log
