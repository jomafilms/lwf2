# Mobile Responsive Map Page

> **Status:** TODO
> **Priority:** P1 (demo will likely be shown on phones too)
> **Depends on:** P0-3 (map), UX polish
> **Blocks:** None

## Problem

The map page is designed for desktop (side-by-side map + chat). On mobile, this layout breaks — map is too small, chat panel overlaps, drawing is difficult with touch.

## Current Implementation

- Map page: flex layout with map on left, chat panel on right
- Chat panel slides in/out with a toggle button
- Drawing uses click events (not touch-optimized)

## Proposed Changes

### 1. Stacked layout on mobile
- Map takes full viewport height minus header
- Chat panel becomes a bottom sheet (slides up from bottom)
- Zone legend becomes a floating pill at bottom of map

### 2. Touch-friendly drawing
- Larger touch targets for draw points
- "Tap to place corners" instruction instead of "click"
- Bigger undo/complete buttons

### 3. Responsive header
- Collapse address search to icon on mobile, expand on tap
- Step indicator becomes smaller/icon-only

### 4. Breakpoint
- Mobile: < 768px (stacked)
- Desktop: >= 768px (side-by-side)

### What Does NOT Change
- Map functionality (Mapbox GL, fire zones, drawing)
- Chat agent logic
- Desktop layout

## Files Modified

### Modified Files
- `apps/web/app/(public)/map/page.tsx` — responsive layout with breakpoint
- `apps/web/components/map/PropertyMap.tsx` — touch events, larger targets
- `apps/web/components/agent/ChatPanel.tsx` — bottom sheet variant on mobile
- `apps/web/components/map/AddressSearch.tsx` — collapsible on mobile

## Verification

1. Open /map on a 375px viewport
2. Address search works and is not cramped
3. Map fills the screen
4. Drawing works with touch (tap corners)
5. Chat opens as bottom sheet, not side panel
6. Zone legend doesn't obstruct map
7. All buttons have minimum 44px touch targets
