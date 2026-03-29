# BUILD QUEUE — Autonomous Build Loop

> **Last updated:** 2026-03-29 04:15 UTC
> **Session status:** ACTIVE — Annie awake until ~7am UTC (midnight PT)
> **Token reset:** ~9:01 UTC (2:01am PT) if throttled
> **Overnight goal:** Get through Phase 2 by 14:00 UTC (7am PT)
> **Sunday AM plan:** Annie tests, bug fixes, UI refinement, demo prep (demos at 4pm PT / 23:00 UTC)

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

(B9 assessment + B10 community running — B11+B12 spawning next)

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

- [ ] **B5: P2-5 City analytics dashboard**
  - Community-wide progress: properties assessed, scores over time
  - Ward/neighborhood breakdown
  - Adoption rates, risk reduction estimates
  - Export data for grant applications
  - Task doc: `docs/tasks/todo/P2-city-analytics.md`

- [ ] **B6: Data provenance display**
  - Show WHERE each plant data point comes from (source citations)
  - "Why does the database say this plant has a fire score of X?" → show sources
  - Use LWF API's source data, display on plant detail pages
  - This is critical for Charisse's credibility and user trust

- [ ] **B7: Plant comparison tool**
  - Side-by-side compare 2-3 plants on all attributes
  - "Which is better for MY zone 0 near windows?" — show the tradeoffs
  - Helps informed decision-making, not just "pick this one"

- [x] **B8: Maintenance calendar/reminders** — merged 05:21 UTC (Sonnet)

- [ ] **B9: Property assessment walkthrough**
  - Guided UX: step-by-step property assessment
  - "What's in your zone 0 right now?" → photo upload or plant identification
  - "Where are your windows? Fences? Deck?"
  - Produces a baseline assessment before recommending changes
  - This is what makes each property's plan DIFFERENT from any other

- [ ] **B10: Community progress features**
  - Neighborhood groups (Lori's ask)
  - Aggregate view: "Your neighborhood is X% assessed"
  - Social visibility without shaming
  - Firewise community certification pathway tracking

- [ ] **B11: Insurance/certification tracker**
  - Track progress toward Wildfire Prepared Home certification (IBHS)
  - Show which requirements are met, which aren't
  - Connect scores to insurance discount eligibility
  - Cost estimation for remaining work

- [ ] **B12: Cost estimator**
  - Based on plan plants + nursery pricing, estimate total cost
  - Show budget options: "$500 starter" vs "$5K full makeover"
  - Link to grant programs that might offset costs
  - Woolsey's input: $2K-$15K per property typical range

### Priority C — Stretch / post-codeathon

- [ ] AR property walkthrough (Aaron's idea)
- [ ] Tower defense game (Garen's idea)
- [ ] Social media content generator from plant data
- [ ] Climate change adaptation tagging (which plants are climate-stressed)
- [ ] Multi-source data conflict resolution UI for Charisse
- [ ] Plant identification from photo (David's idea — PlantNet API)
- [ ] Growth projection modeling (what does your yard look like in 5 years?)
- [ ] Landscape plan scanner/reader

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
