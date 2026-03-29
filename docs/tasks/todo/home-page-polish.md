# Home Page Polish — Make it sell the vision

> **Status:** TODO
> **Priority:** P2 (nice for demo, not blocking)
> **Depends on:** P0-1 (scaffolding)
> **Blocks:** None

## Problem

Home page is minimal — just an address input and zone legend. It doesn't explain what the tool does, who it's for, or why they should care. For the demo, the presenter explains this verbally. But the page should stand on its own.

## Proposed Changes

### 1. Hero section
- Headline: "See your fire zones. Plan your landscape."
- Subhead: "Enter your address to see which fire zones apply to your property and get plant recommendations from local nurseries."
- Address input (existing)
- Zone legend (existing, below input)

### 2. How it works (3 steps)
- Step 1: "Enter your address" — satellite view loads
- Step 2: "Draw your house" — fire zones appear
- Step 3: "Get recommendations" — AI suggests plants, shows nursery pricing

### 3. Stats/credibility bar
- "1,300+ plants" · "5 local nurseries" · "Built with Charisse Sydoriak's fire-reluctant plant database"

### 4. Stakeholder callouts (below fold)
- Homeowners: "Know what to plant in every zone"
- Landscapers: "Design compliant yards with real data"
- Nurseries: "Connect your inventory to demand"
- Cities/HOAs: "Track community wildfire readiness"

### What Does NOT Change
- Address search functionality
- Navigation to /map page after search

## Files Modified

### Modified Files
- `apps/web/app/page.tsx` — expanded content sections

## Verification
1. Home page loads with clear value proposition
2. Address search still works and navigates to /map
3. Content reads well on mobile and desktop
4. No layout breaks at any viewport width
