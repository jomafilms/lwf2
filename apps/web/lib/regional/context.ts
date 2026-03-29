import type { CountyConfig } from '@lwf/types';
import { getCountyConfig, detectCounty } from './counties';

/**
 * Regional context provides county-specific information
 * and resources throughout the application.
 */
export class RegionalContext {
  private config: CountyConfig | null;
  private countyKey: string | null;

  constructor(countyKey: string | null = null) {
    this.countyKey = countyKey;
    this.config = countyKey ? getCountyConfig(countyKey) : null;
  }

  /**
   * Create context from coordinates
   */
  static fromCoordinates(lat: number, lng: number): RegionalContext {
    const countyKey = detectCounty(lat, lng);
    return new RegionalContext(countyKey);
  }

  /**
   * Create context from property data
   */
  static fromProperty(property: { lat: number; lng: number } | { county?: string }): RegionalContext {
    if ('county' in property && property.county) {
      return new RegionalContext(property.county);
    }
    
    if ('lat' in property && 'lng' in property) {
      return RegionalContext.fromCoordinates(property.lat, property.lng);
    }
    
    return new RegionalContext(null);
  }

  /**
   * Get the county configuration
   */
  getConfig(): CountyConfig | null {
    return this.config;
  }

  /**
   * Get the county key
   */
  getCountyKey(): string | null {
    return this.countyKey;
  }

  /**
   * Get county display name
   */
  getCountyName(): string {
    return this.config ? `${this.config.name}, ${this.config.state}` : 'Unknown County';
  }

  /**
   * Get local grant programs
   */
  getGrantPrograms() {
    return this.config?.resources.grantPrograms || [];
  }

  /**
   * Get local nurseries
   */
  getLocalNurseries(): string[] {
    return this.config?.resources.localNurseries || [];
  }

  /**
   * Get fire department contact
   */
  getFireContact(): string | null {
    return this.config?.resources.fireContact || null;
  }

  /**
   * Get CWPP (Community Wildfire Protection Plan) URL
   */
  getCWPPUrl(): string | null {
    return this.config?.resources.cwppUrl || null;
  }

  /**
   * Get applicable building codes
   */
  getBuildingCodes(): string[] {
    return this.config?.resources.buildingCodes || [];
  }

  /**
   * Check if region is supported
   */
  isSupported(): boolean {
    return this.config !== null;
  }

  /**
   * Get region-specific help text for compliance documents
   */
  getComplianceHelp(): {
    title: string;
    description: string;
    contactInfo?: string;
    resources?: Array<{ name: string; url?: string }>;
  } {
    if (!this.config) {
      return {
        title: 'Regional Compliance Information',
        description: 'Contact your local fire department for specific requirements in your area.'
      };
    }

    const resources = [];
    
    if (this.config.resources.cwppUrl) {
      resources.push({
        name: 'Community Wildfire Protection Plan',
        url: this.config.resources.cwppUrl
      });
    }

    this.config.resources.buildingCodes?.forEach(code => {
      resources.push({ name: code });
    });

    return {
      title: `${this.config.name} Fire Safety Requirements`,
      description: `Your property is located in ${this.config.name}, ${this.config.state}. The following regulations and resources apply to your area:`,
      contactInfo: this.config.resources.fireContact,
      resources
    };
  }
}