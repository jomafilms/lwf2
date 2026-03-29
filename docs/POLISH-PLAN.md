# Polish Plan — Parallel Workstreams

## Stream 1: Design System + Config (foundational — do first)
**Goal:** One config file controls all visual styling

- [ ] Create `apps/web/lib/design-tokens.ts` — border radius, spacing, shadows, score colors, zone colors, chart colors, status colors
- [ ] Expand `tailwind.config.ts` with full custom theme (extend colors, borderRadius, etc.)
- [ ] Replace all 57 hardcoded hex values across 11 files with design tokens or Tailwind classes
- [ ] Card component already exists — verify border-radius comes from config
- [ ] Audit button, badge, select components for configurable styling

**Files to touch:**
- `apps/web/tailwind.config.ts`
- `apps/web/lib/design-tokens.ts` (NEW)
- 11 files with hex values (see list above)

## Stream 2: File Splitting (35 files over 300 lines)
**Goal:** Every file under 300 lines, extract reusable sub-components

Top priority splits (500+ lines):
- `dashboard/nursery/inventory/page.tsx` (685) → split table, filters, upload form
- `dashboard/nursery/page.tsx` (546) → split stats, inventory list, actions
- `dashboard/nursery/profile/page.tsx` (531) → split form sections
- `canvas/PlanCanvas.tsx` (525) → split toolbar, plant palette, canvas layer
- `map/PropertyMap.tsx` (518) → split controls, drawing tools, zone overlay
- `canvas/PlanDesignerDemo.tsx` (511) → split panels

Medium splits (350-500 lines):
- Plant detail page, PlantCompare, preferences page, map page
- Agent tools, GrantInfo, CostEstimator, ShootingStarMarketplace
- CCR template, scoring calculator, city analytics

## Stream 3: UX Fixes (broken interactions)
**Goal:** Fix obviously broken flows

- [ ] Cart flow: start from user's saved plant list → show nursery availability → order (not browse one nursery catalog)
- [ ] Map layer toggle: satellite / uploaded image / GIS parcel lines
- [ ] Plant detail: overlay slide-out on desktop (joma pattern), bottom sheet on mobile — not full page navigation
- [ ] Nursery detail: same overlay pattern
- [ ] Assessment wizard: integrate into map page flow (button exists but wizard may not connect)
- [ ] Mobile: verify all touch targets 44px+, bottom sheets work

## Stream 4: joma-v2 Patterns Port
**Goal:** Bring refined interaction patterns from joma-v2

- [ ] SlideOut/Overlay component for desktop (slide from right, overlay backdrop)
- [ ] BottomSheet component for mobile (drag handle, snap points)
- [ ] Use for: plant detail, nursery detail, cart, assessment wizard
- [ ] Card grid with proper responsive breakpoints (joma film grid pattern)

## Stream 5: Data Integration Verify
**Goal:** Make sure everything actually works with real data

- [ ] Plant cards show nursery availability from ALL nurseries (not just Shooting Star)
- [ ] Save to list works (P1-2 tagging)
- [ ] Scoring displays on map page
- [ ] Parcel auto-detect works for Ashland addresses
- [ ] AI agent chat returns plant cards
- [ ] Compliance report generates for a saved property
- [ ] HOA invite flow works end-to-end

## Execution Order
1. **Stream 1 first** (design tokens) — everything else depends on consistent styling
2. **Streams 2+3+4 in parallel** after Stream 1
3. **Stream 5 last** — verification after fixes
