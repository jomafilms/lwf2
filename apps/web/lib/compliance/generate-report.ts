/**
 * Compliance Report Generator
 * 
 * Generates CC&R-compatible landscaping readiness reports for HOAs.
 * Based on CWPP standards and Dennis Holeman's requirements.
 * Uses regional context for county-specific requirements.
 */

import type { PlanPlant, ScoreResult } from "../scoring/types";
import { calculateScores } from "../scoring/calculate";
import { RegionalContext } from "../regional/context";

export type ComplianceStatus = 'fire-ready' | 'needs-work' | 'needs attention';

export interface ZoneReport {
  zone: string; // "Zone 0 (0-5ft)", etc.
  status: ComplianceStatus;
  plants: {
    name: string;
    appropriate: boolean;
    reason: string;
  }[];
  spacingIssues: string[];
  maintenanceNotes: string[];
}

export interface ComplianceReport {
  propertyAddress: string;
  assessmentDate: string;
  overallCompliance: ComplianceStatus;
  scores: {
    fire: number;
    pollinator: number;
    water: number;
    deer: number;
  };
  zones: ZoneReport[];
  recommendations: string[];
  certificationProgress: {
    met: string[];
    unmet: string[];
  };
  sources: string[];
}

// Fire zone definitions based on CWPP/Firewise standards
const ZONE_DEFINITIONS = {
  zone0: {
    name: "Zone 0 (0-5ft)",
    description: "Immediate zone around structures",
    requirements: [
      "Use only low-flammability plants",
      "Maintain minimum 5ft clearance from structures",
      "Remove all dead vegetation immediately",
      "Use hardscaping where possible"
    ]
  },
  zone1: {
    name: "Zone 1 (5-30ft)",
    description: "Defensible space transition zone",
    requirements: [
      "Select fire-resistant plants with placement codes A or B",
      "Maintain 10ft spacing between mature tree crowns",
      "Remove ladder fuels beneath trees",
      "Keep vegetation pruned and maintained"
    ]
  },
  zone2: {
    name: "Zone 2 (30-100ft)",
    description: "Reduced fuel zone",
    requirements: [
      "Thin vegetation to break up fuel continuity",
      "Remove dead and dying trees",
      "Maintain access for emergency vehicles",
      "Consider defensible fuel breaks"
    ]
  }
} as const;

// Placement code readiness mapping
const PLACEMENT_COMPLIANCE: Record<string, string[]> = {
  A: ["zone0", "zone1", "zone2"], // Suitable for all zones
  B: ["zone1", "zone2"],         // Zones 1-2 only
  C: ["zone2"],                  // Zone 2 only
  D: ["zone1", "zone2"]          // Similar to B
};

// CWPP/Firewise certification criteria
const CERTIFICATION_CRITERIA = [
  "Zone 0 maintained with appropriate low-flammability vegetation",
  "Defensible space extends minimum 30 feet from structures",
  "Vegetation properly spaced to prevent fire spread",
  "Dead vegetation and ladder fuels removed",
  "Access maintained for emergency vehicles",
  "Roof and gutters kept clear of flammable debris",
  "Plant selection follows fire-resistant guidelines"
];

function determineZoneCompliance(
  zone: keyof typeof ZONE_DEFINITIONS,
  plants: PlanPlant[]
): ZoneReport {
  const zoneDef = ZONE_DEFINITIONS[zone];
  const zoneReport: ZoneReport = {
    zone: zoneDef.name,
    status: 'fire-ready',
    plants: [],
    spacingIssues: [],
    maintenanceNotes: []
  };

  let appropriateCount = 0;
  
  for (const plant of plants) {
    const placementCode = plant.placementCode?.toUpperCase() || 'A';
    const allowedZones = PLACEMENT_COMPLIANCE[placementCode] || PLACEMENT_COMPLIANCE.A;
    const isAppropriate = allowedZones.includes(zone);
    
    if (isAppropriate) appropriateCount++;
    
    const charScore = plant.characterScore || 50;
    let reason = "";
    
    if (!isAppropriate) {
      reason = `Placement code ${placementCode} not suitable for ${zoneDef.name}. Should be used in ${allowedZones.join(', ')}.`;
    } else if (charScore < 40) {
      reason = `Low fire safety score (${charScore}/100). Consider higher-rated alternatives.`;
    } else {
      reason = `Appropriate for ${zoneDef.name} with character score ${charScore}/100.`;
    }
    
    zoneReport.plants.push({
      name: plant.plantName || plant.plantId,
      appropriate: isAppropriate && charScore >= 40,
      reason
    });
  }
  
  // Determine zone status
  const appropriateRatio = plants.length > 0 ? appropriateCount / plants.length : 1;
  
  if (appropriateRatio >= 0.9) {
    zoneReport.status = 'fire-ready';
  } else if (appropriateRatio >= 0.7) {
    zoneReport.status = 'needs-work';
  } else {
    zoneReport.status = 'needs attention';
  }
  
  // Add spacing recommendations based on zone
  switch (zone) {
    case 'zone0':
      zoneReport.spacingIssues = [
        "Ensure 5ft minimum clearance from structure walls",
        "Remove vegetation under eaves and overhangs"
      ];
      zoneReport.maintenanceNotes = [
        "Remove dead vegetation immediately",
        "Trim plants to maintain shape and prevent overgrowth",
        "Water plants only as needed to prevent excess growth"
      ];
      break;
    case 'zone1':
      zoneReport.spacingIssues = [
        "Maintain 10ft spacing between tree crowns",
        "Remove ladder fuels beneath trees up to 8ft height"
      ];
      zoneReport.maintenanceNotes = [
        "Prune lower branches to 8ft above ground",
        "Remove dead wood and leaves regularly",
        "Thin shrubs to prevent dense growth"
      ];
      break;
    case 'zone2':
      zoneReport.spacingIssues = [
        "Thin vegetation to break fuel continuity",
        "Create fuel breaks every 30-50 feet"
      ];
      zoneReport.maintenanceNotes = [
        "Remove dead and dying trees annually",
        "Maintain access roads and fire breaks",
        "Monitor for invasive species"
      ];
      break;
  }
  
  return zoneReport;
}

function generateRecommendations(
  scores: ScoreResult,
  zoneReports: ZoneReport[]
): string[] {
  const recommendations: string[] = [];
  
  // Fire safety recommendations
  if (scores.fire.score < 60) {
    recommendations.push("Improve fire safety by replacing high-risk plants with fire-resistant alternatives rated above 60/100");
  }
  
  // Zone-specific recommendations
  for (const zone of zoneReports) {
    if (zone.status === 'needs attention') {
      recommendations.push(`${zone.zone}: Replace inappropriate plants with species suitable for this zone`);
    }
    if (zone.status === 'needs-work') {
      recommendations.push(`${zone.zone}: Consider upgrading some plants to improve fire resistance`);
    }
  }
  
  // Pollinator recommendations
  if (scores.pollinator.score < 40) {
    recommendations.push("Add native, fire-resistant plants that support pollinators to improve ecological value");
  }
  
  // Water efficiency recommendations
  if (scores.water.score < 50) {
    recommendations.push("Replace high-water plants with drought-tolerant alternatives to reduce irrigation needs");
  }
  
  // General maintenance recommendations
  recommendations.push("Maintain regular pruning schedule to prevent overgrowth and fuel accumulation");
  recommendations.push("Remove dead vegetation and debris promptly, especially during fire season");
  
  return recommendations;
}

function assessCertificationProgress(
  scores: ScoreResult,
  zoneReports: ZoneReport[]
): { met: string[]; unmet: string[] } {
  const met: string[] = [];
  const unmet: string[] = [];
  
  // Check each certification criterion
  const zone0Report = zoneReports.find(z => z.zone.includes("Zone 0"));
  if (zone0Report?.status === 'fire-ready') {
    met.push("Zone 0 maintained with appropriate low-flammability vegetation");
  } else {
    unmet.push("Zone 0 maintained with appropriate low-flammability vegetation");
  }
  
  const hasDefensibleSpace = zoneReports.some(z => z.zone.includes("Zone 1") || z.zone.includes("Zone 2"));
  if (hasDefensibleSpace) {
    met.push("Defensible space extends minimum 30 feet from structures");
  } else {
    unmet.push("Defensible space extends minimum 30 feet from structures");
  }
  
  if (scores.fire.score >= 70) {
    met.push("Plant selection follows fire-resistant guidelines");
    met.push("Vegetation properly spaced to prevent fire spread");
  } else {
    unmet.push("Plant selection follows fire-resistant guidelines");
    unmet.push("Vegetation properly spaced to prevent fire spread");
  }
  
  // These require manual verification
  const manualCriteria = [
    "Dead vegetation and ladder fuels removed",
    "Access maintained for emergency vehicles",
    "Roof and gutters kept clear of flammable debris"
  ];
  
  unmet.push(...manualCriteria);
  
  return { met, unmet };
}

function generateSources(propertyLocation?: { lat: number; lng: number }): string[] {
  const baseSources = [
    "Living With Fire Plant Database",
    "Community Wildfire Protection Plan (CWPP) Standards", 
    "NFPA 1144 Standard for Reducing Structure Ignition Hazards",
    "Firewise USA Guidelines"
  ];

  // Add regional sources if location provided
  if (propertyLocation) {
    const context = RegionalContext.fromCoordinates(propertyLocation.lat, propertyLocation.lng);
    
    if (context.isSupported()) {
      const config = context.getConfig();
      if (config) {
        // Add state-specific sources
        if (config.state === 'OR') {
          baseSources.push("Oregon Department of Forestry Defensible Space Guidelines");
        } else if (config.state === 'CA') {
          baseSources.push("CAL FIRE Building and Landscape Guidelines");
        }

        // Add county-specific building codes
        config.resources.buildingCodes?.forEach((code: string) => {
          baseSources.push(code);
        });
      }
    }
  } else {
    // Default to Oregon sources for backward compatibility
    baseSources.push("Oregon Department of Forestry Defensible Space Guidelines");
  }

  return baseSources;
}

export function generateComplianceReport(
  propertyAddress: string,
  plants: PlanPlant[],
  propertyLocation?: { lat: number; lng: number }
): ComplianceReport {
  const assessmentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Calculate scores using existing scoring system
  const scores = calculateScores(plants);
  
  // Group plants by zone
  const plantsByZone: Record<string, PlanPlant[]> = {
    zone0: plants.filter(p => p.zone === 'zone0'),
    zone1: plants.filter(p => p.zone === 'zone1'),
    zone2: plants.filter(p => p.zone === 'zone2')
  };
  
  // Generate zone reports
  const zoneReports: ZoneReport[] = [];
  
  if (plantsByZone.zone0.length > 0) {
    zoneReports.push(determineZoneCompliance('zone0', plantsByZone.zone0));
  }
  if (plantsByZone.zone1.length > 0) {
    zoneReports.push(determineZoneCompliance('zone1', plantsByZone.zone1));
  }
  if (plantsByZone.zone2.length > 0) {
    zoneReports.push(determineZoneCompliance('zone2', plantsByZone.zone2));
  }
  
  // Determine overall readiness
  let overallCompliance: ComplianceStatus = 'fire-ready';
  const nonCompliantZones = zoneReports.filter(z => z.status === 'needs attention').length;
  const needsWorkZones = zoneReports.filter(z => z.status === 'needs-work').length;
  
  if (nonCompliantZones > 0 || scores.fire.score < 50) {
    overallCompliance = 'needs attention';
  } else if (needsWorkZones > 0 || scores.fire.score < 70) {
    overallCompliance = 'needs-work';
  }
  
  return {
    propertyAddress,
    assessmentDate,
    overallCompliance,
    scores: {
      fire: scores.fire.score,
      pollinator: scores.pollinator.score,
      water: scores.water.score,
      deer: scores.deer.score
    },
    zones: zoneReports,
    recommendations: generateRecommendations(scores, zoneReports),
    certificationProgress: assessCertificationProgress(scores, zoneReports),
    sources: generateSources(propertyLocation)
  };
}