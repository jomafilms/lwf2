# P1-6: County Parcel Data Integration

> **Status:** TODO (waiting for Annie to provide data)
> **Priority:** P1
> **Depends on:** P0-3 (map)
> **Blocks:** P2-5 (city analytics)

## Problem

Users manually draw property boundaries and structure footprints. Jackson County has real parcel data with lot lines and building footprints. Auto-detecting these from address lookup eliminates the hardest UX step.

## Proposed Changes

### 1. Import parcel data
- Annie providing Jackson County GIS data from pdo.jacksoncountyor.gov
- Format TBD (likely Shapefile or GeoJSON)
- Convert to GeoJSON if needed (ogr2ogr)
- Store as static GeoJSON tiles or in PostGIS/Neon

### 2. Parcel lookup API
- `GET /api/parcels?lat=&lng=` — find parcel containing point
- Returns: parcel boundary (GeoJSON polygon), address, lot size, building footprints if available
- Falls back gracefully if no parcel found (user draws manually)

### 3. Auto-populate on address search
- After geocoding address, query parcel API
- If match found: auto-draw property boundary + structure footprint
- User can adjust/override
- Skip the "draw your house" step entirely for matched parcels

### 4. Data storage
- `data/parcels/` directory (gitignored — data is public but large)
- Consider: static GeoJSON tiles by area, or import to Neon with PostGIS extension

## Files

### New
- `apps/web/app/api/parcels/route.ts`
- `scripts/import-parcels.ts`
- `data/parcels/` (gitignored)

### Modified
- `apps/web/components/map/PropertyMap.tsx` — auto-populate boundary
- `apps/web/app/(public)/map/page.tsx` — skip draw step if parcel found

## Verification
1. Enter an Ashland address
2. Property boundary auto-populates from county data
3. Building footprint auto-populates
4. Fire zones auto-calculate (no drawing needed!)
5. User can still adjust boundary if auto-detection is off
6. Non-Jackson-County address falls back to manual drawing
