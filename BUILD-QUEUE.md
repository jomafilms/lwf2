# BUILD QUEUE — Autonomous Build Loop

> **Last updated:** 2026-03-29 04:15 UTC
> **Session status:** ACTIVE — Annie awake until ~7am UTC (midnight PT)
> **Token reset:** ~9:01 UTC (2:01am PT) if throttled

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

## 🔄 IN PROGRESS

- [ ] **P1-6: County parcel data** — sub-agent running on `feature/parcel-data` branch
  - Auto-detect property boundaries from Jackson County GIS
  - Agent was spawned ~04:08 UTC, should finish soon
  - When done: review diff, merge to main, move to COMPLETED

## 📋 PENDING (in priority order)

### Priority A — Tonight (before Annie sleeps ~7am UTC)

- [ ] **AI Agent system prompt update** — Lead with Charisse's hierarchy: Placement → Spacing → Maintenance → Plant Selection. Don't jump to plant recommendations. Ask about property context first.
  - File: `apps/web/lib/agent/system-prompt.ts`
  - Also update tools to surface placement codes and risk reduction data
  
- [ ] **Home page polish** — Task doc: `docs/tasks/todo/home-page-polish.md`
  - Make landing page compelling for stakeholders/demo
  
- [ ] **Mobile responsive map** — Task doc: `docs/tasks/todo/mobile-responsive-map.md`
  - Map + chat panels need to work on phone

- [ ] **Inline plant cards in chat** — Task doc: `docs/tasks/todo/inline-plant-cards-in-chat.md`
  - When agent recommends plants, show rich cards not just text

### Priority B — Overnight autonomous (9:05 UTC onwards)

- [ ] **P2-3: Compliance document generation** — Generate CC&R-compatible landscaping rules for HOAs
  - Dennis's #1 ask: "adoptable by association governing documents"
  - Task doc: `docs/tasks/todo/P2-compliance-docs.md`
  
- [ ] **P2-4: HOA dashboard** — Neighborhood-level view of compliance
  - Task doc: `docs/tasks/todo/P2-hoa-dashboard.md`

- [ ] **P2-1: Landscaper dashboard** — Professional tools
  - Task doc: `docs/tasks/todo/P2-landscaper-dashboard.md`

- [ ] **P2-2: Nursery org management** — Inventory upload, profile
  - Task doc: `docs/tasks/todo/P2-nursery-management.md`

- [ ] **P2-5: City analytics dashboard** — Community-wide progress tracking
  - Task doc: `docs/tasks/todo/P2-city-analytics.md`

### Priority C — If time permits

- [ ] Community/neighborhood features (Lori's ask — connect neighbors)
- [ ] Maintenance calendar/reminders (Mark's ask)
- [ ] Insurance certification pathway tracking (Ralph/Woolsey)
- [ ] Cost estimation per property ($2K-$15K range)
- [ ] Grant eligibility helper

## 🔧 KNOWN ISSUES

- GitHub PAT lacks PR write permissions — merge directly to main
- Vercel deploy needs Root Directory set to `apps/web`
- Some TypeScript type errors in API routes (non-blocking with skipLibCheck)

## 📝 HOW TO BUILD A TASK

1. `cd /home/buggy/lwf2 && git checkout main && git pull`
2. `git checkout -b feature/[task-slug]`
3. Read the task doc if it exists
4. Read relevant existing code first (check what's there!)
5. Build it
6. `git add -A && git commit -m "feat: [description]"`
7. `git push origin feature/[task-slug]`
8. Merge: `git checkout main && git merge feature/[task-slug] && git push origin main`
9. **UPDATE THIS FILE** — move task to COMPLETED, update timestamp
10. Pick next task

## 🤖 OVERNIGHT CRON INSTRUCTIONS

A cron job fires at 9:05 UTC (2:05am PT) to restart the build loop after token reset.
The cron agent should:
1. Read this file
2. Pick the next PENDING task
3. Spawn a sub-agent to build it
4. Wait for completion
5. Review, merge, update this file
6. Repeat until all Priority B tasks are done or 14:00 UTC (7am PT)
