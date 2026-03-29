/**
 * Climate Adaptation Service
 * 
 * Flags plants showing climate stress and provides adaptation recommendations.
 * Integrates climate projection data for future resilience planning.
 */

export interface ClimateStress {
  stressType: 'heat' | 'drought' | 'flooding' | 'frost' | 'wind' | 'soil_change';
  severity: 'low' | 'moderate' | 'high' | 'critical';
  indicators: string[];
  timeframe: 'current' | '5-year' | '10-year' | '20-year';
  confidence: number; // 0-1 confidence score
}

export interface ClimateAdaptation {
  plantId: string;
  plantName: string;
  commonName: string;
  currentStresses: ClimateStress[];
  projectedStresses: ClimateStress[];
  adaptationRecommendations: string[];
  alternativeSpecies: Array<{
    plantId: string;
    name: string;
    reason: string;
  }>;
  lastAssessment: Date;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface ClimateProjection {
  region: string;
  scenario: 'optimistic' | 'moderate' | 'pessimistic';
  timeframe: 5 | 10 | 20;
  changes: {
    avgTempIncrease: number; // Celsius
    precipitationChange: number; // percentage
    extremeHeatDays: number; // days per year above threshold
    droughtFrequency: number; // percentage increase
    floodRisk: number; // percentage increase
  };
}

/**
 * Assess climate adaptation for a plant species
 */
export async function assessClimateAdaptation(
  plantId: string,
  location: { lat: number; lng: number },
  projectionScenario: 'optimistic' | 'moderate' | 'pessimistic' = 'moderate'
): Promise<ClimateAdaptation | null> {
  try {
    // Get plant data from LWF API
    const plant = await getPlantData(plantId);
    if (!plant) return null;

    // Get climate projections for the region
    const projections = await getClimateProjections(location, projectionScenario);
    
    // Analyze current and projected stresses
    const currentStresses = analyzeCurrentStresses(plant, location);
    const projectedStresses = analyzeProjectedStresses(plant, projections);
    
    // Calculate overall risk level
    const riskLevel = calculateRiskLevel(currentStresses, projectedStresses);
    
    // Generate adaptation recommendations
    const adaptationRecommendations = generateAdaptationRecommendations(plant, currentStresses, projectedStresses);
    
    // Find alternative species if needed
    const alternativeSpecies = riskLevel === 'high' || riskLevel === 'critical' 
      ? await findAlternativeSpecies(plant, location, projections)
      : [];

    return {
      plantId: plant.id,
      plantName: `${plant.genus} ${plant.species}`,
      commonName: plant.commonName,
      currentStresses,
      projectedStresses,
      adaptationRecommendations,
      alternativeSpecies,
      lastAssessment: new Date(),
      riskLevel
    };
  } catch (error) {
    console.error('Climate adaptation assessment error:', error);
    return null;
  }
}

/**
 * Get plant data from LWF API
 */
async function getPlantData(plantId: string) {
  try {
    const response = await fetch(`https://lwf-api.vercel.app/api/v1/plants/${plantId}`);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Error fetching plant data:', error);
    return null;
  }
}

/**
 * Get climate projections for a location
 */
async function getClimateProjections(
  location: { lat: number; lng: number },
  scenario: 'optimistic' | 'moderate' | 'pessimistic'
): Promise<ClimateProjection[]> {
  // In a real implementation, this would call a climate API (e.g., NASA, NOAA, IPCC)
  // For demo, return realistic projections for Oregon
  const baseProjections: ClimateProjection[] = [
    {
      region: 'Pacific Northwest',
      scenario,
      timeframe: 5,
      changes: {
        avgTempIncrease: scenario === 'optimistic' ? 1.2 : scenario === 'moderate' ? 1.8 : 2.4,
        precipitationChange: scenario === 'optimistic' ? -5 : scenario === 'moderate' ? -15 : -25,
        extremeHeatDays: scenario === 'optimistic' ? 8 : scenario === 'moderate' ? 15 : 25,
        droughtFrequency: scenario === 'optimistic' ? 15 : scenario === 'moderate' ? 30 : 45,
        floodRisk: scenario === 'optimistic' ? 10 : scenario === 'moderate' ? 20 : 35
      }
    },
    {
      region: 'Pacific Northwest',
      scenario,
      timeframe: 10,
      changes: {
        avgTempIncrease: scenario === 'optimistic' ? 2.1 : scenario === 'moderate' ? 3.2 : 4.5,
        precipitationChange: scenario === 'optimistic' ? -8 : scenario === 'moderate' ? -22 : -35,
        extremeHeatDays: scenario === 'optimistic' ? 15 : scenario === 'moderate' ? 28 : 45,
        droughtFrequency: scenario === 'optimistic' ? 25 : scenario === 'moderate' ? 50 : 70,
        floodRisk: scenario === 'optimistic' ? 18 : scenario === 'moderate' ? 35 : 55
      }
    },
    {
      region: 'Pacific Northwest',
      scenario,
      timeframe: 20,
      changes: {
        avgTempIncrease: scenario === 'optimistic' ? 3.5 : scenario === 'moderate' ? 5.8 : 8.2,
        precipitationChange: scenario === 'optimistic' ? -12 : scenario === 'moderate' ? -35 : -50,
        extremeHeatDays: scenario === 'optimistic' ? 25 : scenario === 'moderate' ? 50 : 80,
        droughtFrequency: scenario === 'optimistic' ? 40 : scenario === 'moderate' ? 75 : 100,
        floodRisk: scenario === 'optimistic' ? 30 : scenario === 'moderate' ? 60 : 90
      }
    }
  ];

  return baseProjections;
}

/**
 * Analyze current climate stresses for a plant
 */
function analyzeCurrentStresses(plant: any, location: { lat: number; lng: number }): ClimateStress[] {
  const stresses: ClimateStress[] = [];

  // Example stress analysis based on plant attributes
  // In a real implementation, this would analyze actual weather data and plant characteristics
  
  // Heat stress for cool-climate plants
  if (plant.genus?.toLowerCase().includes('fern') || 
      plant.commonName?.toLowerCase().includes('alpine')) {
    stresses.push({
      stressType: 'heat',
      severity: 'moderate',
      indicators: ['Leaf scorching in summer heat', 'Reduced growth during hot periods'],
      timeframe: 'current',
      confidence: 0.7
    });
  }

  // Drought stress for water-loving plants
  if (plant.commonName?.toLowerCase().includes('willow') ||
      plant.commonName?.toLowerCase().includes('maple') ||
      plant.genus?.toLowerCase().includes('acer')) {
    stresses.push({
      stressType: 'drought',
      severity: 'moderate',
      indicators: ['Early leaf drop', 'Wilting during dry spells', 'Reduced flowering'],
      timeframe: 'current',
      confidence: 0.8
    });
  }

  return stresses;
}

/**
 * Analyze projected climate stresses based on climate projections
 */
function analyzeProjectedStresses(plant: any, projections: ClimateProjection[]): ClimateStress[] {
  const stresses: ClimateStress[] = [];

  projections.forEach(projection => {
    // Heat stress from temperature increases
    if (projection.changes.avgTempIncrease > 2.0) {
      stresses.push({
        stressType: 'heat',
        severity: projection.changes.avgTempIncrease > 4.0 ? 'critical' : 
                 projection.changes.avgTempIncrease > 3.0 ? 'high' : 'moderate',
        indicators: [
          'Increased heat dome events',
          'Extended hot periods',
          'Temperature stress during growing season'
        ],
        timeframe: projection.timeframe === 5 ? '5-year' : 
                  projection.timeframe === 10 ? '10-year' : '20-year',
        confidence: 0.85
      });
    }

    // Drought stress from precipitation changes
    if (projection.changes.precipitationChange < -20) {
      stresses.push({
        stressType: 'drought',
        severity: projection.changes.precipitationChange < -40 ? 'critical' : 
                 projection.changes.precipitationChange < -30 ? 'high' : 'moderate',
        indicators: [
          'Reduced summer precipitation',
          'Longer dry periods',
          'Increased drought frequency'
        ],
        timeframe: projection.timeframe === 5 ? '5-year' : 
                  projection.timeframe === 10 ? '10-year' : '20-year',
        confidence: 0.75
      });
    }

    // Flood stress from increased extreme weather
    if (projection.changes.floodRisk > 30) {
      stresses.push({
        stressType: 'flooding',
        severity: projection.changes.floodRisk > 60 ? 'high' : 'moderate',
        indicators: [
          'Increased winter storm intensity',
          'More frequent atmospheric rivers',
          'Soil saturation and root damage'
        ],
        timeframe: projection.timeframe === 5 ? '5-year' : 
                  projection.timeframe === 10 ? '10-year' : '20-year',
        confidence: 0.6
      });
    }
  });

  return stresses;
}

/**
 * Calculate overall risk level
 */
function calculateRiskLevel(currentStresses: ClimateStress[], projectedStresses: ClimateStress[]): 'low' | 'medium' | 'high' | 'critical' {
  const allStresses = [...currentStresses, ...projectedStresses];
  
  if (allStresses.some(s => s.severity === 'critical')) return 'critical';
  if (allStresses.some(s => s.severity === 'high')) return 'high';
  if (allStresses.some(s => s.severity === 'moderate')) return 'medium';
  
  return 'low';
}

/**
 * Generate adaptation recommendations
 */
function generateAdaptationRecommendations(
  plant: any,
  currentStresses: ClimateStress[],
  projectedStresses: ClimateStress[]
): string[] {
  const recommendations: string[] = [];
  const allStresses = [...currentStresses, ...projectedStresses];

  // Heat stress recommendations
  if (allStresses.some(s => s.stressType === 'heat')) {
    recommendations.push('Plant in locations with afternoon shade');
    recommendations.push('Provide supplemental watering during heat waves');
    recommendations.push('Apply mulch to keep roots cool');
  }

  // Drought stress recommendations
  if (allStresses.some(s => s.stressType === 'drought')) {
    recommendations.push('Install drip irrigation for efficient watering');
    recommendations.push('Group with other drought-tolerant plants');
    recommendations.push('Consider rainwater harvesting systems');
  }

  // Flood stress recommendations
  if (allStresses.some(s => s.stressType === 'flooding')) {
    recommendations.push('Improve soil drainage around planting area');
    recommendations.push('Plant on mounded or raised beds');
    recommendations.push('Avoid low-lying or poorly draining locations');
  }

  // General resilience recommendations
  recommendations.push('Monitor plant health regularly during extreme weather');
  recommendations.push('Consider gradual transition to more climate-adapted species');

  return recommendations;
}

/**
 * Find alternative species that are more climate-adapted
 */
async function findAlternativeSpecies(
  plant: any,
  location: { lat: number; lng: number },
  projections: ClimateProjection[]
): Promise<Array<{ plantId: string; name: string; reason: string }>> {
  // This would query the LWF database for similar plants with better climate tolerance
  // For demo purposes, return some climate-adapted alternatives
  
  const alternatives = [
    {
      plantId: 'drought-tolerant-1',
      name: 'Ceanothus integerrimus (Deer Brush)',
      reason: 'Native drought tolerance and heat resistance'
    },
    {
      plantId: 'drought-tolerant-2', 
      name: 'Arctostaphylos spp. (Manzanita)',
      reason: 'Adapted to Mediterranean climate patterns'
    },
    {
      plantId: 'drought-tolerant-3',
      name: 'Lavandula angustifolia (English Lavender)',
      reason: 'Excellent heat and drought tolerance'
    }
  ];

  return alternatives.slice(0, 3); // Return top 3 alternatives
}