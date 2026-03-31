# Fireshire Building Zone Integration

This document describes the integration of building footprint and zone ring functionality from the Fireshire project into LWF2.

## Overview

The integration adds the ability to:
1. Fetch building footprints from Ashland GIS 
2. Compute fire-reluctant zone rings around existing buildings
3. Display color-coded zones on the map with strategies
4. Show zone statistics and building information

## Source Attribution

**Original work**: Fireshire project (MIT License) by Robert Head  
**Repository**: https://github.com/robert-fireshire/fireshire  
**Integration date**: March 30-31, 2026

## Key Components

### API Route: `/api/buildings`
- **File**: `apps/web/app/api/buildings/route.ts`
- **Purpose**: Fetch building footprints from Ashland GIS
- **Parameters**: `xmin`, `ymin`, `xmax`, `ymax` (bounding box)
- **Returns**: GeoJSON FeatureCollection of building polygons

### Zone Computation
- **File**: `apps/web/lib/geo/fire-zones.ts`
- **Function**: `computeBuildingZoneRings()`
- **Logic**: Creates 4 concentric zones (5/10/30/100 ft) using Turf.js buffer/difference operations

### UI Components

#### BuildingZoneOverlay
- **File**: `apps/web/components/map/BuildingZoneOverlay.tsx`
- **Purpose**: Renders zone polygons on Mapbox map
- **Features**: Color-coded zones, building outlines

#### BuildingZoneLegend  
- **File**: `apps/web/components/map/BuildingZoneLegend.tsx`
- **Purpose**: Shows zone colors and fire-reluctant strategies
- **Zones**: 
  - Zone 1 (0-5ft): Non-combustible zone
  - Zone 2 (5-10ft): Ember catch zone  
  - Zone 3 (10-30ft): Lean, clean, green planting
  - Zone 4 (30-100ft): Reduce fuel continuity

#### BuildingZoneSummary
- **File**: `apps/web/components/map/BuildingZoneSummary.tsx`  
- **Purpose**: Statistics about computed zones
- **Data**: Building count, total footprint area, zone areas

### Service Layer
- **File**: `apps/web/lib/regional/building-service.ts`
- **Functions**: `fetchBuildingFootprints()`, bounding box utilities
- **Purpose**: Client-side API for building data

## Usage Flow

1. **Address Search**: User searches for property location
2. **Parcel Detection**: System queries Jackson County GIS for parcel boundary  
3. **Building Toggle**: User clicks "Building Zones" button (appears when parcel found)
4. **Building Fetch**: System queries Ashland GIS for building footprints in buffered area
5. **Zone Computation**: Turf.js computes concentric zone rings  
6. **Map Display**: Zones rendered on map with legend and summary

## Technical Details

### Dependencies Added
- `@turf/union@^7.3.4` - Union overlapping zone polygons
- `@turf/area@^7.3.4` - Calculate zone areas for summary

### GIS Integration
- **Ashland GIS**: `https://gis.ashland.or.us/arcgis/rest/services/buildings/MapServer/0/query`
- **Format**: Esri JSON → GeoJSON conversion
- **Pagination**: Handles large building datasets (2000 features per page)
- **Error Handling**: Graceful fallback when GIS unavailable

### Zone Distance Bands
Following Fireshire's algorithm:
- **Zone 1**: 0-5 feet (most critical, non-combustible)
- **Zone 2**: 5-10 feet (ember interception) 
- **Zone 3**: 10-30 feet (lean landscaping)
- **Zone 4**: 30-100 feet (fuel reduction)

### Map Rendering
- **Layer Order**: Zones render behind buildings for proper visibility
- **Colors**: Red → Orange → Yellow → Green (danger to safety)
- **Opacity**: Inner zones more opaque (higher priority)

## Architecture Notes

### Next.js Integration
- Uses App Router API routes instead of Fireshire's Python backend
- Client-side building data fetching with React hooks
- Server-side GIS proxy to handle CORS and rate limiting

### Coordinate Systems  
- **Input**: WGS84 (EPSG:4326) lat/lng
- **Processing**: Same projection for Turf.js operations
- **Output**: GeoJSON for Mapbox rendering

### Performance
- Buildings fetched only when parcel boundary available
- 200ft buffer around parcel to catch nearby structures  
- Zone computation cached until building toggle changes
- Graceful handling of invalid geometries

## Future Enhancements

1. **Plant Recommendations**: Link zones to fire-reluctant plant database
2. **Multiple Counties**: Extend beyond Ashland to other jurisdictions
3. **Zone Editing**: Allow manual refinement of computed zones
4. **Compliance Export**: Generate reports for fire department review
5. **Real-time Updates**: Sync with GIS when building data changes

## Testing

The integration maintains backward compatibility:
- Manual zone drawing still works when building data unavailable
- Existing saved properties load correctly
- Parcel detection remains optional fallback

Toggle between manual and building-based zones preserves both workflows for different use cases.