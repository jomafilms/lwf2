import type { CountyConfig } from '@lwf/types';

/**
 * County configuration registry
 * 
 * Each county has its own GIS API configuration, field mappings,
 * and local resources. This allows the platform to work anywhere
 * with minimal configuration.
 */
export const COUNTY_CONFIGS: Record<string, CountyConfig> = {
  'jackson-county-or': {
    name: 'Jackson County',
    state: 'OR',
    gis: {
      baseUrl: 'https://maps.jacksoncountyor.org/arcgis/rest/services',
      parcelServicePath: 'JacksonCounty/Parcels/MapServer/0',
      fieldMappings: {
        geometry: 'SHAPE',
        address: 'SITUS',
        acreage: 'ACRES',
        accountNumber: 'ACCOUNT',
        ownerName: 'OWNER1',
        assessedValue: 'TOTAL_AV'
      },
      srid: 4326,
      maxResults: 1
    },
    resources: {
      cwppUrl: 'https://jacksoncountyor.org/emergency/Documents/Jackson%20County%20CWPP%202018.pdf',
      fireContact: 'Jackson County Fire District #3 - (541) 776-7963',
      buildingCodes: [
        'Jackson County Ordinance No. 2019-01 (Wildfire Safety)',
        'Oregon State Building Code Chapter 7A (Wildfire Hazard Areas)'
      ],
      localNurseries: [
        'Dennis\' 7 Dees Garden Centers',
        'Shooting Star Nursery',
        'Naumes Sunnycrest Nursery'
      ],
      grantPrograms: [
        {
          name: 'Jackson County Defensible Space Grant',
          description: 'Up to $2,500 for defensible space projects',
          url: 'https://jacksoncountyor.org/emergency/fire-prevention',
          eligibility: 'Property owners in high-risk fire zones'
        },
        {
          name: 'Oregon Watershed Enhancement Board',
          description: 'Restoration and fire prevention grants',
          url: 'https://www.oregon.gov/oweb/',
          eligibility: 'Varies by program'
        }
      ]
    }
  },
  
  // Template for adding new counties
  'example-county-ca': {
    name: 'Example County',
    state: 'CA',
    gis: {
      baseUrl: 'https://gis.example-county.ca.gov/arcgis/rest/services',
      parcelServicePath: 'Public/Parcels/MapServer/0',
      fieldMappings: {
        geometry: 'Shape',
        address: 'SitusAddress',
        acreage: 'Acreage',
        accountNumber: 'APN',
        ownerName: 'OwnerName',
        assessedValue: 'AssessedValue'
      },
      srid: 4326,
      maxResults: 1
    },
    resources: {
      cwppUrl: 'https://example-county.ca.gov/fire/cwpp.pdf',
      fireContact: 'Example County Fire Department - (555) 123-4567',
      buildingCodes: [
        'California Building Code Chapter 7A',
        'Example County Fire Code'
      ],
      localNurseries: [
        'Example Garden Center'
      ],
      grantPrograms: [
        {
          name: 'CA Fire Safe Council Grants',
          description: 'Various defensible space grants available',
          url: 'https://cafiresafecouncil.org/grants/'
        }
      ]
    }
  }
};

/**
 * Get county configuration by key
 */
export function getCountyConfig(key: string): CountyConfig | null {
  return COUNTY_CONFIGS[key] || null;
}

/**
 * Detect county from coordinates (basic implementation)
 * 
 * In a full implementation, this would use a reverse geocoding service
 * or spatial query to determine which county contains the coordinates.
 * For now, we default to Jackson County for Oregon locations.
 */
export function detectCounty(lat: number, lng: number): string | null {
  // Oregon rough bounds (Jackson County is in southern Oregon)
  if (lat >= 42.0 && lat <= 46.3 && lng >= -124.6 && lng <= -116.5) {
    return 'jackson-county-or';
  }
  
  // TODO: Add detection for other supported counties
  // This would typically use a reverse geocoding API or
  // spatial boundary checks against county polygons
  
  return null;
}

/**
 * Get all supported counties
 */
export function getSupportedCounties(): Array<{ key: string; config: CountyConfig }> {
  return Object.entries(COUNTY_CONFIGS)
    .filter(([key]) => key !== 'example-county-ca') // Exclude template
    .map(([key, config]) => ({ key, config }));
}