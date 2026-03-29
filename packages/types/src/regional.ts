export interface CountyConfig {
  /** County name for display */
  name: string;
  /** State abbreviation */
  state: string;
  /** GIS API configuration */
  gis: {
    /** Base URL for the county's GIS REST API */
    baseUrl: string;
    /** Layer/service path for parcel data */
    parcelServicePath: string;
    /** Field mappings from county schema to our standard schema */
    fieldMappings: {
      /** Field containing the parcel geometry */
      geometry: string;
      /** Field containing the address */
      address: string;
      /** Field containing acreage/area */
      acreage?: string;
      /** Field containing account number/APN */
      accountNumber?: string;
      /** Field containing owner name */
      ownerName?: string;
      /** Field containing tax assessed value */
      assessedValue?: string;
    };
    /** Coordinate reference system (EPSG code) */
    srid: number;
    /** Maximum number of results to return */
    maxResults?: number;
  };
  /** Local resources and references */
  resources: {
    /** Community Wildfire Protection Plan URL or file reference */
    cwppUrl?: string;
    /** Local fire department contact */
    fireContact?: string;
    /** Building codes or ordinances related to fire safety */
    buildingCodes?: string[];
    /** Local nurseries and suppliers */
    localNurseries?: string[];
    /** Grant programs specific to this region */
    grantPrograms?: Array<{
      name: string;
      description: string;
      url?: string;
      eligibility?: string;
    }>;
  };
}

export interface ParcelData {
  /** Parcel boundary as GeoJSON polygon coordinates */
  boundary: number[][][];
  /** Property address */
  address: string;
  /** Parcel size in acres */
  acreage?: number;
  /** Account/parcel number */
  accountNumber?: string;
  /** Owner name (if public record) */
  ownerName?: string;
  /** Tax assessed value */
  assessedValue?: number;
  /** Source county */
  county: string;
}

export interface ParcelLookupResponse {
  /** Whether a parcel was found */
  found: boolean;
  /** Parcel data if found */
  parcel?: ParcelData;
  /** Error message if lookup failed */
  error?: string;
}