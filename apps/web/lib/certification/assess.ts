/**
 * Certification Assessment Logic
 * 
 * Evaluates property compliance with Wildfire Prepared Home requirements
 * based on existing property data, plans, and scoring systems.
 */

import type { PlanPlant, ScoreResult } from '../scoring/types';
import type { CertificationStatus, RequirementStatus } from './types';
import { CERTIFICATION_REQUIREMENTS, calculateRemainingCost } from './requirements';
import { calculateScores } from '../scoring/calculate';

interface PropertyData {
  fireZones?: any;
  structureFootprints?: any;
  assessment?: any;
}

interface PlanData {
  plantPlacements?: PlanPlant[];
  complianceScore?: number;
}

/**
 * Assess Zone 0 compliance based on plant placements and fire zones
 */
function assessZone0Compliance(plantPlacements: PlanPlant[] = []): RequirementStatus[] {
  const zone0Plants = plantPlacements.filter(p => p.zone === 'zone0');
  const zone0Statuses: RequirementStatus[] = [];

  // Structure clearance - assume met if no plants in Zone 0, or if plants have high scores
  const hasProblematicPlants = zone0Plants.some(p => (p.characterScore || 50) < 70);
  zone0Statuses.push({
    requirementId: 'zone0-clearance',
    met: zone0Plants.length === 0 || !hasProblematicPlants,
    notes: zone0Plants.length === 0 
      ? 'No plants in Zone 0 - clearance maintained'
      : hasProblematicPlants 
        ? 'Some plants in Zone 0 may need replacement with higher-rated species'
        : 'Zone 0 plants appear fire-resistant'
  });

  // Fire-resistant plants - check if all Zone 0 plants have good scores
  const allPlantsGoodScore = zone0Plants.length === 0 || zone0Plants.every(p => (p.characterScore || 50) >= 70);
  zone0Statuses.push({
    requirementId: 'zone0-plants',
    met: allPlantsGoodScore,
    notes: zone0Plants.length === 0
      ? 'No plants in Zone 0'
      : allPlantsGoodScore
        ? `${zone0Plants.length} plants with good fire resistance ratings`
        : 'Some Zone 0 plants need upgrading to fire-resistant varieties'
  });

  // Irrigation - assume needs setup if plants are present
  zone0Statuses.push({
    requirementId: 'zone0-irrigation',
    met: zone0Plants.length === 0, // Met if no plants, otherwise needs verification
    notes: zone0Plants.length === 0
      ? 'No irrigation needed - no plants in Zone 0'
      : 'Verify adequate irrigation for Zone 0 plants'
  });

  return zone0Statuses;
}

/**
 * Assess Zone 1 compliance
 */
function assessZone1Compliance(plantPlacements: PlanPlant[] = []): RequirementStatus[] {
  const zone1Plants = plantPlacements.filter(p => p.zone === 'zone1');
  const zone1Statuses: RequirementStatus[] = [];

  // Tree crown spacing - requires manual verification
  zone1Statuses.push({
    requirementId: 'zone1-spacing',
    met: false, // Requires professional assessment
    notes: 'Requires on-site verification of 10-foot tree crown spacing'
  });

  // Ladder fuel removal - requires manual verification
  zone1Statuses.push({
    requirementId: 'zone1-pruning',
    met: false, // Requires professional assessment
    notes: 'Requires verification that lower branches are pruned to 8-10 feet'
  });

  // Fire-resistant plant selection
  const goodPlants = zone1Plants.filter(p => {
    const score = p.characterScore || 50;
    const placement = p.placementCode?.toUpperCase();
    return score >= 60 && (placement === 'A' || placement === 'B');
  });
  
  const plantSelectionMet = zone1Plants.length === 0 || (goodPlants.length / zone1Plants.length >= 0.8);
  zone1Statuses.push({
    requirementId: 'zone1-plants',
    met: plantSelectionMet,
    notes: zone1Plants.length === 0
      ? 'No plants specified for Zone 1'
      : `${goodPlants.length} of ${zone1Plants.length} plants meet fire-resistance criteria`
  });

  return zone1Statuses;
}

/**
 * Assess Zone 2 compliance
 */
function assessZone2Compliance(plantPlacements: PlanPlant[] = []): RequirementStatus[] {
  const zone2Plants = plantPlacements.filter(p => p.zone === 'zone2');
  
  // Zone 2 requirements are mostly about thinning and access - require manual verification
  return [
    {
      requirementId: 'zone2-thinning',
      met: false,
      notes: 'Requires on-site verification of vegetation thinning and fuel breaks'
    },
    {
      requirementId: 'zone2-access',
      met: false,
      notes: 'Requires verification of emergency vehicle access and clearances'
    }
  ];
}

/**
 * Assess structural requirements (roof, walls, windows)
 * These typically require manual verification or property records
 */
function assessStructuralCompliance(propertyData: PropertyData): RequirementStatus[] {
  // Most structural requirements need manual verification
  // We can make educated guesses based on assessment data if available
  
  const structuralStatuses: RequirementStatus[] = [];
  
  // Roof requirements - assume need verification unless explicitly documented
  ['roof-covering', 'roof-debris', 'roof-vents'].forEach(reqId => {
    structuralStatuses.push({
      requirementId: reqId,
      met: false,
      notes: 'Requires inspection and documentation of roof materials/condition'
    });
  });

  // Wall requirements
  ['walls-siding', 'walls-clearance'].forEach(reqId => {
    structuralStatuses.push({
      requirementId: reqId,
      met: false,
      notes: 'Requires inspection of siding materials and foundation clearances'
    });
  });

  // Window requirements
  ['windows-glazing', 'windows-screens'].forEach(reqId => {
    structuralStatuses.push({
      requirementId: reqId,
      met: false,
      notes: 'Requires inspection of window glazing and screen protection'
    });
  });

  return structuralStatuses;
}

/**
 * Assess maintenance requirements
 */
function assessMaintenanceCompliance(): RequirementStatus[] {
  // Maintenance requirements are ongoing and typically not "met" until verified
  return [
    {
      requirementId: 'maintenance-annual',
      met: false,
      notes: 'Schedule annual property inspection for certification maintenance'
    },
    {
      requirementId: 'maintenance-seasonal',
      met: false,
      notes: 'Establish seasonal debris removal schedule'
    },
    {
      requirementId: 'maintenance-watering',
      met: false,
      notes: 'Verify and maintain adequate irrigation systems'
    }
  ];
}

/**
 * Main assessment function that combines all compliance checks
 */
export function assessCertificationStatus(
  propertyData: PropertyData,
  planData: PlanData
): CertificationStatus {
  const plantPlacements = planData.plantPlacements || [];
  
  // Assess each category
  const zone0Statuses = assessZone0Compliance(plantPlacements);
  const zone1Statuses = assessZone1Compliance(plantPlacements);
  const zone2Statuses = assessZone2Compliance(plantPlacements);
  const structuralStatuses = assessStructuralCompliance(propertyData);
  const maintenanceStatuses = assessMaintenanceCompliance();
  
  // Combine all statuses
  const allStatuses = [
    ...zone0Statuses,
    ...zone1Statuses,
    ...zone2Statuses,
    ...structuralStatuses,
    ...maintenanceStatuses
  ];
  
  // Calculate overall progress
  const metCount = allStatuses.filter(s => s.met).length;
  const progress = Math.round((metCount / allStatuses.length) * 100);
  
  // Determine eligibility (need at least 80% compliance with critical items met)
  const criticalRequirements = ['zone0-clearance', 'zone0-plants', 'roof-covering', 'walls-siding'];
  const criticalMet = criticalRequirements.every(reqId => 
    allStatuses.find(s => s.requirementId === reqId)?.met
  );
  const eligible = progress >= 80 && criticalMet;
  
  // Calculate remaining costs
  const metRequirementIds = allStatuses.filter(s => s.met).map(s => s.requirementId);
  const unmetRequirementIds = allStatuses.filter(s => !s.met).map(s => s.requirementId);
  const estimatedCost = calculateRemainingCost(CERTIFICATION_REQUIREMENTS, metRequirementIds);
  
  // Determine insurance impact based on progress
  let insuranceImpact: 'high' | 'medium' | 'low' = 'low';
  if (progress >= 80) insuranceImpact = 'high';
  else if (progress >= 60) insuranceImpact = 'medium';
  
  return {
    eligible,
    progress,
    metRequirements: metRequirementIds,
    unmetRequirements: unmetRequirementIds,
    estimatedCost,
    insuranceImpact
  };
}

/**
 * Get detailed requirement statuses for display
 */
export function getDetailedRequirementStatuses(
  propertyData: PropertyData,
  planData: PlanData
): RequirementStatus[] {
  const plantPlacements = planData.plantPlacements || [];
  
  return [
    ...assessZone0Compliance(plantPlacements),
    ...assessZone1Compliance(plantPlacements),
    ...assessZone2Compliance(plantPlacements),
    ...assessStructuralCompliance(propertyData),
    ...assessMaintenanceCompliance()
  ];
}