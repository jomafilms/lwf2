# P1-2: Lists + Tagging System

> **Status:** TODO
> **Priority:** P1
> **Depends on:** P0-4 (plant cards), P0-6 (auth)
> **Blocks:** None

## Problem

Users can bookmark plants but can't organize them into named lists. Need joma-style flat tagging system for grouping plants, nurseries, properties.

## Proposed Changes

### 1. Tag CRUD API
- `POST /api/tags` — create tag (name, color, visibility)
- `GET /api/tags` — list user's tags
- `PUT /api/tags/[id]`
- `DELETE /api/tags/[id]`

### 2. Tag assignments API
- `POST /api/tags/[id]/assign` — assign tag to target (plant, nursery, property, plan)
- `DELETE /api/tags/[id]/assign/[targetId]`
- `GET /api/tags/[id]/items` — get all items with this tag

### 3. Plant list UI
- "Add to list" button on PlantCard (creates tag assignment)
- Quick-create list: type a name, auto-creates tag
- My Lists page (`/dashboard/lists`) showing all user lists
- List detail page showing all plants in the list
- Share list (public URL)

### 4. Upgrade cart to use tags
- "My Plan" becomes a special tag
- Cart items = plants tagged with "My Plan"
- Persistent across sessions (DB-backed, not localStorage)

## Schema
Uses existing `tags` + `tagAssignments` tables from P0-1 scaffolding.

## Files

### New
- `apps/web/app/api/tags/route.ts`
- `apps/web/app/api/tags/[id]/route.ts`
- `apps/web/app/api/tags/[id]/assign/route.ts`
- `apps/web/app/(auth)/dashboard/lists/page.tsx`
- `apps/web/app/(auth)/dashboard/lists/[id]/page.tsx`
- `apps/web/components/plants/AddToListButton.tsx`

### Modified
- `apps/web/components/plants/PlantCard.tsx` — add to list button
- `apps/web/lib/cart/store.ts` — migrate to DB-backed tags

## Verification
1. Create a list "Zone 0 Favorites"
2. Add 3 plants to it from browse page
3. View list at /dashboard/lists/[id]
4. Share list → public URL works
5. Remove a plant from list
