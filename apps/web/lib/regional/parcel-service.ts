import type { CountyConfig, ParcelData, ParcelLookupResponse } from '@lwf/types';
import { getCountyConfig, detectCounty } from './counties';

/**
 * Universal parcel lookup service
 * 
 * This service abstracts county GIS APIs into a common interface.
 * Each county has different field names, coordinate systems, and
 * API structures, but this provides a unified way to look up parcels.
 */
export class ParcelService {
  /**
   * Look up parcel data by coordinates
   */
  static async lookupParcel(lat: number, lng: number): Promise<ParcelLookupResponse> {
    try {
      // Detect which county this location is in
      const countyKey = detectCounty(lat, lng);
      if (!countyKey) {
        return {
          found: false,
          error: 'County not supported. Currently supporting Jackson County, OR.'
        };
      }

      // Get county configuration
      const config = getCountyConfig(countyKey);
      if (!config) {
        return {
          found: false,
          error: 'County configuration not found'
        };
      }

      // Query the county's GIS API
      const parcel = await this.queryCountyGIS(lat, lng, config, countyKey);
      
      if (!parcel) {
        return {
          found: false,
          error: 'No parcel found at this location'
        };
      }

      return {
        found: true,
        parcel
      };
    } catch (error) {
      console.error('Parcel lookup error:', error);
      return {
        found: false,
        error: 'Failed to lookup parcel data'
      };
    }
  }

  /**
   * Query a county's GIS REST API
   */
  private static async queryCountyGIS(
    lat: number,
    lng: number,
    config: CountyConfig,
    countyKey: string
  ): Promise<ParcelData | null> {
    const { gis } = config;
    
    // Build the query URL
    const serviceUrl = `${gis.baseUrl}/${gis.parcelServicePath}/query`;
    const params = new URLSearchParams({
      // ArcGIS REST API standard parameters
      f: 'json',
      returnGeometry: 'true',
      spatialRel: 'esriSpatialRelIntersects',
      geometryType: 'esriGeometryPoint',
      inSR: '4326',
      outSR: gis.srid.toString(),
      outFields: '*',
      maxRecordCount: (gis.maxResults || 1).toString(),
      // Point geometry
      geometry: JSON.stringify({
        x: lng,
        y: lat,
        spatialReference: { wkid: 4326 }
      })
    });

    const response = await fetch(`${serviceUrl}?${params}`);
    
    if (!response.ok) {
      throw new Error(`GIS API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(`GIS API error: ${data.error.message || 'Unknown error'}`);
    }

    if (!data.features || data.features.length === 0) {
      return null;
    }

    // Use the first matching feature
    const feature = data.features[0];
    
    return this.parseParcelFeature(feature, config, countyKey);
  }

  /**
   * Parse a GIS feature into our standard ParcelData format
   */
  private static parseParcelFeature(
    feature: any,
    config: CountyConfig,
    countyKey: string
  ): ParcelData {
    const { attributes, geometry } = feature;
    const { fieldMappings } = config.gis;

    // Extract geometry (convert to GeoJSON if needed)
    let boundary: number[][][];
    
    if (geometry.rings) {
      // ArcGIS polygon format
      boundary = geometry.rings;
    } else if (geometry.coordinates) {
      // GeoJSON format
      boundary = geometry.coordinates;
    } else {
      throw new Error('Unsupported geometry format');
    }

    // Map county-specific field names to our standard format
    const parcel: ParcelData = {
      boundary,
      address: this.getFieldValue(attributes, fieldMappings.address) || 'Unknown address',
      county: countyKey
    };

    // Optional fields
    if (fieldMappings.acreage) {
      const acreage = parseFloat(this.getFieldValue(attributes, fieldMappings.acreage));
      if (!isNaN(acreage)) {
        parcel.acreage = acreage;
      }
    }

    if (fieldMappings.accountNumber) {
      parcel.accountNumber = this.getFieldValue(attributes, fieldMappings.accountNumber);
    }

    if (fieldMappings.ownerName) {
      parcel.ownerName = this.getFieldValue(attributes, fieldMappings.ownerName);
    }

    if (fieldMappings.assessedValue) {
      const value = parseFloat(this.getFieldValue(attributes, fieldMappings.assessedValue));
      if (!isNaN(value)) {
        parcel.assessedValue = value;
      }
    }

    return parcel;
  }

  /**
   * Get field value with case-insensitive lookup
   */
  private static getFieldValue(attributes: Record<string, any>, fieldName: string): string {
    // Try exact match first
    if (attributes[fieldName] !== undefined) {
      return String(attributes[fieldName] || '').trim();
    }

    // Try case-insensitive match
    const upperFieldName = fieldName.toUpperCase();
    for (const [key, value] of Object.entries(attributes)) {
      if (key.toUpperCase() === upperFieldName) {
        return String(value || '').trim();
      }
    }

    return '';
  }
}