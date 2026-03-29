# P1-1: Property + Plan Saving

> **Status:** TODO
> **Priority:** P1
> **Depends on:** P0-3 (map), P0-6 (auth)
> **Blocks:** P1-4 (plan document generation)

## Problem

Properties and plans exist only in the browser session. Refresh = gone. Users need to save their property, fire zones, and plant plans to their account.

## Proposed Changes

### 1. Save Property endpoint
- `POST /api/properties` — saves address, lat/lng, parcel boundary, structure footprints, calculated fire zones
- `GET /api/properties` — list user's properties
- `GET /api/properties/[id]` — get property with zones
- `DELETE /api/properties/[id]`

### 2. Save Plan endpoint  
- `POST /api/properties/[id]/plans` — save plant placements per zone
- `GET /api/properties/[id]/plans` — list plans for property
- `PUT /api/plans/[id]` — update plan
- Plan includes: plant placements (plantId, zone, quantity, position), estimated cost, compliance score

### 3. Map page integration
- "Save Property" button after zones are calculated
- Requires auth (redirect to sign-in if not logged in)
- After saving, show "Saved ✓" and persist property ID in URL
- Loading a saved property pre-populates the map

### 4. Dashboard property list
- `/dashboard` shows user's saved properties
- Click → loads map with saved zones
- Shows plan status (draft, submitted, etc.)

## Files

### New
- `apps/web/app/api/properties/route.ts`
- `apps/web/app/api/properties/[id]/route.ts`
- `apps/web/app/api/properties/[id]/plans/route.ts`
- `apps/web/app/api/plans/[id]/route.ts`
- `apps/web/app/(auth)/dashboard/page.tsx`

### Modified
- `apps/web/app/(public)/map/page.tsx` — save button, load saved property
- `apps/web/middleware.ts` — protect /dashboard

## Verification
1. Draw zones → click Save → sign in → property saved
2. Go to /dashboard → see saved property → click → map loads with zones
3. Refresh page → property persists
