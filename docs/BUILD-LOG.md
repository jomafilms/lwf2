# LWF2 Build Log — What We Did in One Evening

**Started:** Saturday March 28, ~4:30 PM PT (after codeathon kickoff ended)
**Team:** Annie (product/design) + Buggy (VPS agent chief of staff) + local coding agent + VPS coding agents

---

## The Process

### Research & Discovery (~30 min)
- Transcribed 2 codeathon session recordings (stakeholder presentations + API walkthrough)
- Parsed transcripts into structured summary with stakeholder needs, key themes, project ideas
- Identified what other codeathon participants are building to avoid overlap
- Researched 50+ landscaping software products across 8 categories
- Confirmed blue ocean: nobody combines fire data + landscape design + nursery inventory

### Nursery Data Collection (~15 min)
- Scraped 5 Jackson County nurseries for real plant data
- Shooting Star: 1,733 plants with live inventory counts
- ForestFarm: 566 plants with prices from PDF catalog
- Plant Oregon: 153 native plants
- Flowerland: pricing tiers by container size
- Imported Oregon Association of Nurseries directory (642 nurseries)
- Matched 865 nursery plants to LWF fire database

### Product Design (~30 min)
- Brainstormed the "fire-safe landscape ecosystem" concept together
- Mapped the nursery → landscaper → homeowner → city funnel
- Drew parallels to joma.film marketplace architecture
- Wrote full PRD with vision, architecture, data model, competitive positioning
- Annie reviewed and annotated PRD with decisions

### Infrastructure Setup (~15 min)
- Created GitHub repo (jomafilms/lwf2)
- Set up Neon PostgreSQL database
- Configured Vercel deployment
- Set up Mapbox token
- Created environment variables for local + VPS + production
- Initialized repo with PRD, specs, nursery data, competitive research

### Agent Workflow Design (~10 min)
- Designed multi-agent development workflow (VPS + local agents)
- Created AGENTS.md with conventions for any coding agent
- Created BACKLOG.md with prioritized task list
- Set up SSH notification from local agent → VPS for push alerts
- Adopted spec-driven development workflow with task docs

### Building — Phase 0 (~2 hours, parallel agents)
- **11 PRs merged** by VPS + local agents working in parallel
- VPS agents: API client, nursery data import, plant cards, nursery cart demo
- Local agent: scaffolding, map+zones, AI agent, UX polish, mobile, home page
- Buggy: code review every PR, diff checks, test runs, merge management

### What Got Built:
- ✅ Address search → satellite view → draw structure → fire zone overlay
- ✅ AI chat agent that searches 1,300+ plants and recommends by fire zone
- ✅ Inline plant cards in chat when agent recommends plants
- ✅ Plant browse page with search, filters (zone/native/deer/water/pollinator)
- ✅ Plant detail pages with all attributes, risk scores, images
- ✅ "Available at" nursery pricing on every plant (real data from local nurseries)
- ✅ "Add to Plan" → plant cart → "Send to Shooting Star Nursery" demo
- ✅ Nursery order preview page (simulates what nursery receives)
- ✅ Mobile responsive layout with bottom sheet chat
- ✅ Guided 3-step UX flow (property → structure → zones)
- ✅ Site navigation with cart badge
- ✅ Polished home page with hero, how-it-works, stakeholder callouts

### Planning for Future Phases
- Wrote 11 detailed task documents for Phases 1-2
- Covers: property saving, lists/tags, agent preference learning, plan document generation, scoring system, parcel data, landscaper dashboard, nursery management, compliance docs, HOA dashboard, city analytics

---

## By The Numbers

| Metric | Count |
|--------|-------|
| PRs merged | 11 |
| Lines of code | ~6,000+ |
| Nursery plants scraped | 2,452 |
| Plants matched to fire DB | 865 |
| Nurseries researched | 12+ |
| Competitors analyzed | 50+ |
| Task docs written | 14 |
| AI agent tools | 4 |
| API client functions | 15 |
| Integration tests | 14 |
| Total time | ~4 hours |

---

## Key Insight

The biggest unlock was the **multi-agent workflow**: Annie on product decisions, Buggy managing the backlog and reviewing code, VPS agents building data/API tasks in parallel, local coding agent building UI/UX. Nobody waited for anyone. Specs went in, code came out, reviews happened, merges landed. 11 PRs in 2 hours.
