/**
 * Maintenance Schedule Generator
 * 
 * Generates seasonal maintenance tasks based on plants in a landscaping plan.
 * Prioritizes fire safety maintenance (pruning, debris removal, spacing checks).
 */

import type { PlanPlant, Zone } from '@/lib/scoring/types';

export interface PlantMaintenanceTask {
  id: string;
  plantId: string;
  plantName: string;
  zone: Zone;
  taskType: 'pruning' | 'debris_removal' | 'spacing_check' | 'growth_projection' | 'winter_prep' | 'spring_prep';
  season: 'spring' | 'summer' | 'fall' | 'winter';
  month: number; // 1-12
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  fireSafetyReason: string;
  estimatedHours?: number;
  yearOffset?: number; // for future projections like "in 3 years"
}

export interface MaintenanceSchedule {
  propertyId: string;
  generatedAt: Date;
  tasks: PlantMaintenanceTask[];
  summary: {
    totalTasks: number;
    highPriorityTasks: number;
    estimatedAnnualHours: number;
    nextMaintenanceWindow: PlantMaintenanceTask | null;
  };
}

// ─── Constants ───────────────────────────────────────────────────────────────

/** Maintenance frequency multipliers by zone (Zone 0 = most frequent) */
const ZONE_FREQUENCY_MULTIPLIER: Record<Zone, number> = {
  zone0: 1.5,  // 50% more frequent maintenance
  zone1: 1.0,  // baseline frequency
  zone2: 0.75, // 25% less frequent maintenance
};

/** Growth rates by plant attributes (height growth per year in feet) */
const GROWTH_RATE_MAP: Record<string, number> = {
  'fast': 3.0,
  'rapid': 3.5,
  'very fast': 4.0,
  'moderate': 1.5,
  'medium': 1.5,
  'slow': 0.5,
  'very slow': 0.25,
};

/** Debris production levels affect maintenance frequency */
const DEBRIS_PRODUCTION_MAP: Record<string, number> = {
  'high': 1.5,
  'heavy': 1.5,
  'moderate': 1.0,
  'medium': 1.0,
  'low': 0.75,
  'minimal': 0.5,
  'none': 0.25,
};

// ─── Helper Functions ────────────────────────────────────────────────────────

function generateTaskId(): string {
  return Math.random().toString(36).substring(2, 15);
}

function getPlantAttribute(plant: PlanPlant, ...keys: string[]): string | undefined {
  if (!plant.attributes) return undefined;
  
  for (const key of keys) {
    const lower = key.toLowerCase();
    for (const [attrName, attrValue] of Object.entries(plant.attributes)) {
      if (attrName.toLowerCase().includes(lower)) {
        return attrValue?.toLowerCase().trim();
      }
    }
  }
  return undefined;
}

function getGrowthRate(plant: PlanPlant): number {
  const growthVal = getPlantAttribute(plant, 'growth', 'rate');
  if (!growthVal) return 1.5; // default moderate growth
  
  for (const [key, rate] of Object.entries(GROWTH_RATE_MAP)) {
    if (growthVal.includes(key)) {
      return rate;
    }
  }
  return 1.5;
}

function getDebrisProduction(plant: PlanPlant): number {
  const debrisVal = getPlantAttribute(plant, 'debris', 'litter', 'drop');
  if (!debrisVal) return 1.0; // default moderate
  
  for (const [key, multiplier] of Object.entries(DEBRIS_PRODUCTION_MAP)) {
    if (debrisVal.includes(key)) {
      return multiplier;
    }
  }
  return 1.0;
}

function getMatureHeight(plant: PlanPlant): number {
  const heightVal = getPlantAttribute(plant, 'height', 'mature');
  if (!heightVal) return 6; // default 6 feet
  
  // Extract numbers from height description (e.g., "6-8 feet" -> 8)
  const matches = heightVal.match(/(\d+)[-–]?(\d+)?\s*(?:feet|ft|')/);
  if (matches) {
    const min = parseInt(matches[1]);
    const max = matches[2] ? parseInt(matches[2]) : min;
    return max; // use the maximum height for safety planning
  }
  
  // Single number
  const singleMatch = heightVal.match(/(\d+)/);
  return singleMatch ? parseInt(singleMatch[1]) : 6;
}

function getPlantName(plant: PlanPlant): string {
  return plant.plantName || `Plant ${plant.plantId}`;
}

// ─── Task Generators ─────────────────────────────────────────────────────────

function generateSeasonalTasks(plant: PlanPlant): PlantMaintenanceTask[] {
  const tasks: PlantMaintenanceTask[] = [];
  const plantName = getPlantName(plant);
  const zoneMultiplier = ZONE_FREQUENCY_MULTIPLIER[plant.zone];
  const debrisMultiplier = getDebrisProduction(plant);
  
  // Spring Tasks - April
  tasks.push({
    id: generateTaskId(),
    plantId: plant.plantId,
    plantName,
    zone: plant.zone,
    taskType: 'spring_prep',
    season: 'spring',
    month: 4,
    priority: plant.zone === 'zone0' ? 'high' : 'medium',
    title: `Spring preparation for ${plantName}`,
    description: `Remove winter debris, check for dead branches, light pruning if needed`,
    fireSafetyReason: `Remove dry fuel load and improve air circulation around ${plant.zone === 'zone0' ? 'structure' : 'property'}`,
    estimatedHours: Math.ceil(0.5 * zoneMultiplier * debrisMultiplier),
  });

  // Summer Tasks - Debris removal frequency depends on plant type
  if (debrisMultiplier > 1.0) {
    tasks.push({
      id: generateTaskId(),
      plantId: plant.plantId,
      plantName,
      zone: plant.zone,
      taskType: 'debris_removal',
      season: 'summer',
      month: 7,
      priority: plant.zone === 'zone0' ? 'high' : 'medium',
      title: `Summer debris removal for ${plantName}`,
      description: `Remove fallen leaves, flowers, and any dead material`,
      fireSafetyReason: `High debris-producing plant requires frequent maintenance to reduce fire fuel load`,
      estimatedHours: Math.ceil(0.75 * zoneMultiplier * debrisMultiplier),
    });
  }

  // Fall Tasks - October (main pruning season)
  tasks.push({
    id: generateTaskId(),
    plantId: plant.plantId,
    plantName,
    zone: plant.zone,
    taskType: 'pruning',
    season: 'fall',
    month: 10,
    priority: 'high',
    title: `Fall pruning for ${plantName}`,
    description: `Remove dead, diseased, and overcrowded branches. Thin for air circulation`,
    fireSafetyReason: `Annual pruning reduces fuel load and maintains ${plant.zone === 'zone0' ? 'defensible space' : 'fire-safe structure'}`,
    estimatedHours: Math.ceil(1.0 * zoneMultiplier),
  });

  // Winter Tasks - December
  tasks.push({
    id: generateTaskId(),
    plantId: plant.plantId,
    plantName,
    zone: plant.zone,
    taskType: 'winter_prep',
    season: 'winter',
    month: 12,
    priority: 'medium',
    title: `Winter preparation for ${plantName}`,
    description: `Final debris cleanup, secure any loose branches`,
    fireSafetyReason: `Winter storms can create debris; proactive cleanup maintains fire safety`,
    estimatedHours: Math.ceil(0.25 * zoneMultiplier),
  });

  return tasks;
}

function generateGrowthProjections(plant: PlanPlant): PlantMaintenanceTask[] {
  const tasks: PlantMaintenanceTask[] = [];
  const plantName = getPlantName(plant);
  const growthRate = getGrowthRate(plant);
  const matureHeight = getMatureHeight(plant);
  
  // Project growth at 3, 5, and 10 years
  for (const years of [3, 5, 10]) {
    const projectedHeight = Math.min(matureHeight, years * growthRate);
    
    let priorityLevel: 'high' | 'medium' | 'low' = 'low';
    let warningReason = '';
    
    // Flag high-priority concerns
    if (plant.zone === 'zone0' && projectedHeight > 6) {
      priorityLevel = 'high';
      warningReason = 'May exceed recommended height for Zone 0 (defensible space)';
    } else if (projectedHeight > 20) {
      priorityLevel = 'medium';
      warningReason = 'Large mature size requires ongoing management';
    }
    
    tasks.push({
      id: generateTaskId(),
      plantId: plant.plantId,
      plantName,
      zone: plant.zone,
      taskType: 'growth_projection',
      season: 'fall', // Schedule review during main pruning season
      month: 10,
      priority: priorityLevel,
      title: `Growth projection: ${plantName} in ${years} years`,
      description: `Projected height: ${projectedHeight.toFixed(1)} feet (growth rate: ${growthRate} ft/year)`,
      fireSafetyReason: warningReason || `Monitor growth to maintain proper spacing and fire safety compliance`,
      yearOffset: years,
    });
  }
  
  return tasks;
}

function generateSpacingChecks(plants: PlanPlant[]): PlantMaintenanceTask[] {
  const tasks: PlantMaintenanceTask[] = [];
  
  // Group plants by zone for spacing analysis
  const plantsByZone: Record<Zone, PlanPlant[]> = {
    zone0: plants.filter(p => p.zone === 'zone0'),
    zone1: plants.filter(p => p.zone === 'zone1'),
    zone2: plants.filter(p => p.zone === 'zone2'),
  };
  
  Object.entries(plantsByZone).forEach(([zone, zonePlants]) => {
    if (zonePlants.length > 1) {
      tasks.push({
        id: generateTaskId(),
        plantId: 'zone-spacing',
        plantName: `${zone.toUpperCase()} spacing check`,
        zone: zone as Zone,
        taskType: 'spacing_check',
        season: 'spring',
        month: 3,
        priority: zone === 'zone0' ? 'high' : 'medium',
        title: `Check plant spacing in ${zone}`,
        description: `${zonePlants.length} plants: verify 10+ foot spacing for fire safety`,
        fireSafetyReason: `Plants too close together can create fire ladders and reduce effectiveness of defensible space`,
        estimatedHours: Math.ceil(zonePlants.length * 0.25),
      });
    }
  });
  
  return tasks;
}

// ─── Main Generator Function ─────────────────────────────────────────────────

export function generateMaintenanceSchedule(
  plants: PlanPlant[],
  propertyId: string
): MaintenanceSchedule {
  const tasks: PlantMaintenanceTask[] = [];
  
  // Generate seasonal tasks for each plant
  plants.forEach(plant => {
    tasks.push(...generateSeasonalTasks(plant));
    tasks.push(...generateGrowthProjections(plant));
  });
  
  // Generate zone-level spacing checks
  tasks.push(...generateSpacingChecks(plants));
  
  // Sort tasks by priority and date
  tasks.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return a.month - b.month;
  });
  
  // Calculate summary statistics
  const highPriorityTasks = tasks.filter(t => t.priority === 'high').length;
  const estimatedAnnualHours = tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
  
  // Find next maintenance window (next seasonal task after current month)
  const currentMonth = new Date().getMonth() + 1;
  const nextTask = tasks
    .filter(t => !t.yearOffset && t.month >= currentMonth)
    .sort((a, b) => a.month - b.month)[0] || 
    tasks.filter(t => !t.yearOffset)[0]; // wrap around to next year
  
  return {
    propertyId,
    generatedAt: new Date(),
    tasks,
    summary: {
      totalTasks: tasks.filter(t => !t.yearOffset).length, // exclude projections
      highPriorityTasks,
      estimatedAnnualHours,
      nextMaintenanceWindow: nextTask || null,
    },
  };
}

// ─── Utility Functions ───────────────────────────────────────────────────────

export function getTasksBySeason(tasks: PlantMaintenanceTask[]): Record<string, PlantMaintenanceTask[]> {
  return {
    spring: tasks.filter(t => t.season === 'spring' && !t.yearOffset),
    summer: tasks.filter(t => t.season === 'summer' && !t.yearOffset), 
    fall: tasks.filter(t => t.season === 'fall' && !t.yearOffset),
    winter: tasks.filter(t => t.season === 'winter' && !t.yearOffset),
  };
}

export function getUpcomingTasks(tasks: PlantMaintenanceTask[], months: number = 3): PlantMaintenanceTask[] {
  const currentMonth = new Date().getMonth() + 1;
  const futureMonth = currentMonth + months;
  
  return tasks
    .filter(t => !t.yearOffset && (
      (t.month >= currentMonth && t.month <= futureMonth) ||
      (futureMonth > 12 && t.month <= futureMonth - 12)
    ))
    .sort((a, b) => {
      let aMonth = a.month;
      let bMonth = b.month;
      if (aMonth < currentMonth) aMonth += 12;
      if (bMonth < currentMonth) bMonth += 12;
      return aMonth - bMonth;
    });
}