/**
 * Maintenance Schedule Generator - B8
 * 
 * Generates seasonal maintenance tasks based on plants in a landscaping plan.
 * Key insight: Maintenance is #3 in priority hierarchy — before plant selection!
 * "Juniper is dangerous BECAUSE it's not maintained, not inherently"
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

// Zone-based maintenance frequency (Zone 0 needs most attention)
const ZONE_FREQUENCY: Record<Zone, number> = {
  zone0: 1.5,  // 50% more frequent - defensible space
  zone1: 1.0,  // baseline frequency - transition zone  
  zone2: 0.75, // 25% less frequent - outer zone
};

// Growth rates for projections
const GROWTH_RATES: Record<string, number> = {
  'fast': 3.0, 'rapid': 3.5, 'very fast': 4.0,
  'moderate': 1.5, 'medium': 1.5,
  'slow': 0.5, 'very slow': 0.25,
};

// Debris production affects maintenance needs
const DEBRIS_FACTORS: Record<string, number> = {
  'high': 1.5, 'heavy': 1.5,
  'moderate': 1.0, 'medium': 1.0,
  'low': 0.75, 'minimal': 0.5, 'none': 0.25,
};

function generateTaskId(): string {
  return Math.random().toString(36).substring(2, 15);
}

function getPlantAttribute(plant: PlanPlant, ...keys: string[]): string | undefined {
  if (!plant.attributes) return undefined;
  
  for (const key of keys) {
    for (const [attrName, attrValue] of Object.entries(plant.attributes)) {
      if (attrName.toLowerCase().includes(key.toLowerCase())) {
        return attrValue?.toLowerCase().trim();
      }
    }
  }
  return undefined;
}

function getGrowthRate(plant: PlanPlant): number {
  const val = getPlantAttribute(plant, 'growth', 'rate');
  if (!val) return 1.5;
  
  for (const [key, rate] of Object.entries(GROWTH_RATES)) {
    if (val.includes(key)) return rate;
  }
  return 1.5;
}

function getDebrisFactor(plant: PlanPlant): number {
  const val = getPlantAttribute(plant, 'debris', 'litter', 'drop');
  if (!val) return 1.0;
  
  for (const [key, factor] of Object.entries(DEBRIS_FACTORS)) {
    if (val.includes(key)) return factor;
  }
  return 1.0;
}

function getMatureHeight(plant: PlanPlant): number {
  const val = getPlantAttribute(plant, 'height', 'mature');
  if (!val) return 6;
  
  const matches = val.match(/(\d+)[-–]?(\d+)?\s*(?:feet|ft|')/);
  if (matches) {
    const max = matches[2] ? parseInt(matches[2]) : parseInt(matches[1]);
    return max; // use max for safety planning
  }
  
  const single = val.match(/(\d+)/);
  return single ? parseInt(single[1]) : 6;
}

function generateSeasonalTasks(plant: PlanPlant): PlantMaintenanceTask[] {
  const tasks: PlantMaintenanceTask[] = [];
  const name = plant.plantName || `Plant ${plant.plantId}`;
  const zoneMultiplier = ZONE_FREQUENCY[plant.zone];
  const debrisMultiplier = getDebrisFactor(plant);

  // Spring - April (remove winter debris, prep for growth)
  tasks.push({
    id: generateTaskId(),
    plantId: plant.plantId,
    plantName: name,
    zone: plant.zone,
    taskType: 'spring_prep',
    season: 'spring',
    month: 4,
    priority: plant.zone === 'zone0' ? 'high' : 'medium',
    title: `Spring preparation for ${name}`,
    description: 'Remove winter debris, check for dead branches, light pruning if needed',
    fireSafetyReason: `Remove dry fuel load and improve air circulation around ${plant.zone === 'zone0' ? 'structure' : 'property'}`,
    estimatedHours: Math.ceil(0.5 * zoneMultiplier * debrisMultiplier),
  });

  // Summer - July (debris removal for high-debris plants)
  if (debrisMultiplier > 1.0) {
    tasks.push({
      id: generateTaskId(),
      plantId: plant.plantId,
      plantName: name,
      zone: plant.zone,
      taskType: 'debris_removal',
      season: 'summer',
      month: 7,
      priority: plant.zone === 'zone0' ? 'high' : 'medium',
      title: `Summer debris removal for ${name}`,
      description: 'Remove fallen leaves, flowers, and any dead material',
      fireSafetyReason: 'High debris-producing plant requires frequent maintenance to reduce fire fuel load',
      estimatedHours: Math.ceil(0.75 * zoneMultiplier * debrisMultiplier),
    });
  }

  // Fall - October (main pruning season)
  tasks.push({
    id: generateTaskId(),
    plantId: plant.plantId,
    plantName: name,
    zone: plant.zone,
    taskType: 'pruning',
    season: 'fall',
    month: 10,
    priority: 'high',
    title: `Fall pruning for ${name}`,
    description: 'Remove dead, diseased, and overcrowded branches. Thin for air circulation',
    fireSafetyReason: `Annual pruning reduces fuel load and maintains ${plant.zone === 'zone0' ? 'defensible space' : 'fire-safe structure'}`,
    estimatedHours: Math.ceil(1.0 * zoneMultiplier),
  });

  // Winter - December (prep for storms)
  tasks.push({
    id: generateTaskId(),
    plantId: plant.plantId,
    plantName: name,
    zone: plant.zone,
    taskType: 'winter_prep',
    season: 'winter',
    month: 12,
    priority: 'medium',
    title: `Winter preparation for ${name}`,
    description: 'Final debris cleanup, secure any loose branches',
    fireSafetyReason: 'Winter storms can create debris; proactive cleanup maintains fire safety',
    estimatedHours: Math.ceil(0.25 * zoneMultiplier),
  });

  return tasks;
}

function generateGrowthProjections(plant: PlanPlant): PlantMaintenanceTask[] {
  const tasks: PlantMaintenanceTask[] = [];
  const name = plant.plantName || `Plant ${plant.plantId}`;
  const growthRate = getGrowthRate(plant);
  const matureHeight = getMatureHeight(plant);

  // 3, 5, 10 year projections (like Oregon HOA 30-year reserve plans)
  for (const years of [3, 5, 10]) {
    const projectedHeight = Math.min(matureHeight, years * growthRate);
    let priority: 'high' | 'medium' | 'low' = 'low';
    let reason = 'Monitor growth to maintain proper spacing and fire safety readiness';

    // Flag concerns
    if (plant.zone === 'zone0' && projectedHeight > 6) {
      priority = 'high';
      reason = 'May exceed recommended height for Zone 0 (defensible space)';
    } else if (projectedHeight > 20) {
      priority = 'medium';
      reason = 'Large mature size requires ongoing management';
    }

    tasks.push({
      id: generateTaskId(),
      plantId: plant.plantId,
      plantName: name,
      zone: plant.zone,
      taskType: 'growth_projection',
      season: 'fall',
      month: 10,
      priority,
      title: `Growth projection: ${name} in ${years} years`,
      description: `Projected height: ${projectedHeight.toFixed(1)} feet (growth rate: ${growthRate} ft/year)`,
      fireSafetyReason: reason,
      yearOffset: years,
    });
  }

  return tasks;
}

function generateSpacingChecks(plants: PlanPlant[]): PlantMaintenanceTask[] {
  const tasks: PlantMaintenanceTask[] = [];
  
  // Group by zone for spacing analysis
  const byZone: Record<Zone, PlanPlant[]> = {
    zone0: plants.filter(p => p.zone === 'zone0'),
    zone1: plants.filter(p => p.zone === 'zone1'), 
    zone2: plants.filter(p => p.zone === 'zone2'),
  };

  Object.entries(byZone).forEach(([zone, zonePlants]) => {
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
        fireSafetyReason: 'Plants too close together can create fire ladders and reduce effectiveness of defensible space',
        estimatedHours: Math.ceil(zonePlants.length * 0.25),
      });
    }
  });

  return tasks;
}

export function generateMaintenanceSchedule(plants: PlanPlant[], propertyId: string): MaintenanceSchedule {
  const tasks: PlantMaintenanceTask[] = [];

  // Generate tasks for each plant
  plants.forEach(plant => {
    tasks.push(...generateSeasonalTasks(plant));
    tasks.push(...generateGrowthProjections(plant));
  });

  // Generate spacing checks
  tasks.push(...generateSpacingChecks(plants));

  // Sort by priority, then month
  tasks.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return a.month - b.month;
  });

  // Calculate summary
  const highPriorityTasks = tasks.filter(t => t.priority === 'high').length;
  const estimatedAnnualHours = tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
  
  const currentMonth = new Date().getMonth() + 1;
  const nextTask = tasks
    .filter(t => !t.yearOffset && t.month >= currentMonth)
    .sort((a, b) => a.month - b.month)[0] || 
    tasks.filter(t => !t.yearOffset)[0];

  return {
    propertyId,
    generatedAt: new Date(),
    tasks,
    summary: {
      totalTasks: tasks.filter(t => !t.yearOffset).length,
      highPriorityTasks,
      estimatedAnnualHours,
      nextMaintenanceWindow: nextTask || null,
    },
  };
}

export function getTasksBySeason(tasks: PlantMaintenanceTask[]): Record<string, PlantMaintenanceTask[]> {
  return {
    spring: tasks.filter(t => t.season === 'spring' && !t.yearOffset),
    summer: tasks.filter(t => t.season === 'summer' && !t.yearOffset), 
    fall: tasks.filter(t => t.season === 'fall' && !t.yearOffset),
    winter: tasks.filter(t => t.season === 'winter' && !t.yearOffset),
  };
}

export function getUpcomingTasks(tasks: PlantMaintenanceTask[], months = 3): PlantMaintenanceTask[] {
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