# Regional Setup Guide

FireScape can be extended to support any county or region with minimal configuration. This guide explains how to add support for new areas.

## Overview

The platform uses a county configuration system that abstracts:
- **GIS APIs** — Different counties have different parcel lookup systems
- **Field mappings** — Counties use different database field names 
- **Local resources** — Each area has specific fire departments, building codes, and grants
- **Coordinate systems** — Different projection systems and data formats

## Adding a New County

### 1. Research the County's GIS System

Most counties provide public GIS REST APIs for parcel data. You need:

- **GIS service URL** — Usually something like `https://gis.countynameX.gov/arcgis/rest/services`
- **Parcel layer path** — The specific service that contains property boundaries (e.g., `Public/Parcels/MapServer/0`)
- **Field names** — What the county calls address, acreage, account number, etc.
- **Coordinate system** — EPSG code (most use 4326 for lat/lng or local state plane)

**Finding GIS endpoints:**
1. Search for "[County Name] GIS" or "[County Name] parcel map"
2. Look for REST services or API documentation
3. Test queries using ArcGIS REST query format
4. Common paths: `/query?f=json&returnGeometry=true&where=1%3D1&outFields=*`

### 2. Add County Configuration

Edit `apps/web/lib/regional/counties.ts` and add your county to the `COUNTY_CONFIGS` object:

```typescript
'your-county-st': {
  name: 'Your County',
  state: 'ST',
  gis: {
    baseUrl: 'https://gis.yourcounty.gov/arcgis/rest/services',
    parcelServicePath: 'Public/Parcels/MapServer/0',
    fieldMappings: {
      geometry: 'SHAPE',           // Field containing polygon geometry
      address: 'SITE_ADDRESS',     // Property address
      acreage: 'TOTAL_ACRES',      // Parcel size (optional)
      accountNumber: 'PARCEL_ID',  // Account/parcel number (optional)
      ownerName: 'OWNER_NAME',     // Owner name (optional, if public)
      assessedValue: 'TOTAL_VALUE' // Tax assessed value (optional)
    },
    srid: 4326, // or county's coordinate system
    maxResults: 1
  },
  resources: {
    cwppUrl: 'https://yourcounty.gov/fire/cwpp.pdf',
    fireContact: 'Your County Fire Dept - (555) 123-4567',
    buildingCodes: [
      'Your County Fire Ordinance 2023-01',
      'State Building Code Chapter X'
    ],
    localNurseries: [
      'Local Garden Center',
      'County Plant Nursery'
    ],
    grantPrograms: [
      {
        name: 'Your County Defensible Space Grant',
        description: 'Up to $3,000 for fire prevention projects',
        url: 'https://yourcounty.gov/grants/fire-prevention',
        eligibility: 'Homeowners in high-risk zones'
      }
    ]
  }
}
```

### 3. Update Geographic Detection

Edit the `detectCounty()` function in `counties.ts` to recognize coordinates in your area:

```typescript
export function detectCounty(lat: number, lng: number): string | null {
  // Your County bounds (get from GIS data or Wikipedia)
  if (lat >= 40.0 && lat <= 41.5 && lng >= -122.0 && lng <= -120.0) {
    return 'your-county-st';
  }
  
  // Existing Oregon bounds
  if (lat >= 42.0 && lat <= 46.3 && lng >= -124.6 && lng <= -116.5) {
    return 'jackson-county-or';
  }
  
  return null;
}
```

### 4. Test the Configuration

1. **API test:** Visit `/api/regions` to see your county listed
2. **Parcel lookup:** Test with coordinates: `/api/parcels?lat=X.X&lng=Y.Y`
3. **Regional context:** Check that grants and resources appear correctly

### 5. Deploy and Verify

The county configuration is code-based, so it deploys with the application. No database changes needed.

## Field Mapping Reference

Different counties use different field names for the same data. Here are common variations:

| Our Standard | Common County Names |
|-------------|---------------------|
| `address` | SITE_ADDRESS, SITUS, PROPERTY_ADDRESS, ADDR, MAIL_ADDRESS |
| `acreage` | TOTAL_ACRES, ACRES, ACRE, AREA_ACRES, SIZE_ACRES |
| `accountNumber` | PARCEL_ID, APN, ACCOUNT, PARCEL_NUMBER, PIN |
| `ownerName` | OWNER_NAME, OWNER1, PROPERTY_OWNER, TAXPAYER |
| `assessedValue` | TOTAL_VALUE, ASSESSED_VALUE, TOTAL_AV, TAX_VALUE |
| `geometry` | SHAPE, GEOM, GEOMETRY, THE_GEOM |

## Common GIS API Patterns

### ArcGIS Server (Most Common)
```
https://gis.county.gov/arcgis/rest/services/Public/Parcels/MapServer/0/query
```

### GeoServer
```
https://gis.county.gov/geoserver/public/ows?service=WFS&request=GetFeature
```

### Custom REST APIs
```
https://api.county.gov/v1/parcels/search
```

The platform currently supports ArcGIS REST format. Other formats would require extending the `ParcelService` class.

## Troubleshooting

### "No parcel found at this location"
- Verify coordinates are within county bounds
- Check if GIS service requires authentication
- Test query directly in browser with sample coordinates
- Confirm field mappings match county schema

### "County not supported"
- Add geographic bounds to `detectCounty()`
- Verify county key is in `COUNTY_CONFIGS`
- Check console for JavaScript errors

### "GIS API error"
- Confirm service URL is publicly accessible
- Check if service requires specific headers or authentication
- Verify coordinate system (some use local projections)
- Test with county's own web map interface

## Future Enhancements

This system could be extended to support:

- **Automatic county detection** via reverse geocoding services
- **Database-driven configuration** instead of code-based
- **Multi-state regions** for areas spanning county boundaries  
- **Custom field transformations** for non-standard data formats
- **Authentication-required GIS services** via API keys

## Examples

See `jackson-county-or` in `counties.ts` for a complete working example. The `example-county-ca` entry shows the template structure for new counties.