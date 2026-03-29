# P1-5: Scoring System — Fire, Pollinator, Water, Deer

> **Status:** TODO
> **Priority:** P1
> **Depends on:** P0-4 (plant cards), P0-3 (map)
> **Blocks:** None

## Problem

Users need gamified feedback on their plan quality. Multiple scores make the planning feel rewarding and educational, not just compliance-driven.

## Proposed Changes

### 1. Score calculation (`apps/web/lib/scoring/calculate.ts`)

For a given plan (list of plants per zone):

- **🔥 Fire Safety Score (0-100):** Based on plant character scores, zone placement compliance, spacing, and coverage. Higher = safer.
- **🦋 Pollinator Score (0-100):** Count of pollinator-supporting plants / total plants × diversity bonus for variety of bloom times.
- **💧 Water Efficiency Score (0-100):** Based on water needs attributes. More low-water plants = higher score.
- **🦌 Deer Resistance Score (0-100):** Percentage of plants with deer resistance rating.

### 2. Score display component (`apps/web/components/scoring/ScoreCard.tsx`)
- Circular progress indicators for each score
- Color: red (<40), yellow (40-70), green (>70)
- Shows on map page after plants are added to plan
- Animated count-up on first render

### 3. Score breakdown
- Click a score → see which plants contribute positively/negatively
- "Improve this score" suggestions (e.g., "Replace Juniper with Oregon Grape to improve fire safety")

## Files

### New
- `apps/web/lib/scoring/calculate.ts`
- `apps/web/components/scoring/ScoreCard.tsx`
- `apps/web/components/scoring/ScoreBreakdown.tsx`

### Modified
- `apps/web/app/(public)/map/page.tsx` — show scores after plan is built

## Verification
1. Add 5 plants to a plan
2. Scores appear with animated count-up
3. Add a high-water plant → water efficiency score drops
4. Replace with low-water native → both fire and water scores improve
5. Click a score → see breakdown with improvement suggestions
