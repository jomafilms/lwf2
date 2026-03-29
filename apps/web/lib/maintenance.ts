/**
 * B8 — Maintenance Calendar & Reminders
 * Generate seasonal maintenance schedules based on plant plans
 */

import type { PlanPlant, Zone } from '@/lib/scoring/types';

export interface PlantMaintenanceTask {
  id: string;
  plantId: string;
  plantName: string;
  zone: Zone;
  taskType: 'pruning' | 'debris_removal' | 'spacing_check' | 'growth_projection' | 'winter_prep' | 'spring_prep';
  season: 'spring' | 'summer' | 'fall' | 'winter';
  month: number;
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  fireSafetyReason: string;
  estimatedHours?: number;
  yearOffset?: number;
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

// Zone frequency: Zone 0 (defensible space) needs most attention
const ZONE_FREQUENCY: Record<Zone, number> = {
  zone0: 1.5, zone1: 1.0, zone2: 0.75
};

function taskId() { return Math.random().toString(36).substring(2, 15); }

export function generateMaintenanceSchedule(plants: PlanPlant[], propertyId: string): MaintenanceSchedule {
  const tasks: PlantMaintenanceTask[] = [];

  plants.forEach(plant => {
    const name = plant.plantName || `Plant ${plant.plantId}`;
    const zoneMulti = ZONE_FREQUENCY[plant.zone];

    // Seasonal tasks
    tasks.push(
      // Spring prep (April)
      {
        id: taskId(), plantId: plant.plantId, plantName: name, zone: plant.zone,
        taskType: 'spring_prep', season: 'spring', month: 4,
        priority: plant.zone === 'zone0' ? 'high' : 'medium',
        title: `Spring preparation for ${name}`,
        description: 'Remove winter debris, check for dead branches',
        fireSafetyReason: `Remove dry fuel load around ${plant.zone === 'zone0' ? 'structure' : 'property'}`,
        estimatedHours: Math.ceil(0.5 * zoneMulti),
      },
      // Fall pruning (October) - main season
      {
        id: taskId(), plantId: plant.plantId, plantName: name, zone: plant.zone,
        taskType: 'pruning', season: 'fall', month: 10, priority: 'high',
        title: `Fall pruning for ${name}`,
        description: 'Remove dead, diseased branches. Thin for air circulation',
        fireSafetyReason: `Annual pruning reduces fuel load and maintains ${plant.zone === 'zone0' ? 'defensible space' : 'fire-safe structure'}`,
        estimatedHours: Math.ceil(1.0 * zoneMulti),
      },
      // Winter prep (December)
      {
        id: taskId(), plantId: plant.plantId, plantName: name, zone: plant.zone,
        taskType: 'winter_prep', season: 'winter', month: 12, priority: 'medium',
        title: `Winter preparation for ${name}`,
        description: 'Final cleanup, secure loose branches',
        fireSafetyReason: 'Winter storms create debris; proactive cleanup maintains fire safety',
        estimatedHours: Math.ceil(0.25 * zoneMulti),
      }
    );

    // Growth projections at 3, 5, 10 years
    [3, 5, 10].forEach(years => {
      const projectedHeight = years * 1.5; // simplified growth rate
      let priority: 'high' | 'medium' | 'low' = 'low';
      let reason = 'Monitor growth for spacing and fire safety';

      if (plant.zone === 'zone0' && projectedHeight > 6) {
        priority = 'high';
        reason = 'May exceed Zone 0 height limit (defensible space)';
      }

      tasks.push({
        id: taskId(), plantId: plant.plantId, plantName: name, zone: plant.zone,
        taskType: 'growth_projection', season: 'fall', month: 10, priority,
        title: `Growth projection: ${name} in ${years} years`,
        description: `Projected height: ${projectedHeight.toFixed(1)} feet`,
        fireSafetyReason: reason, yearOffset: years,
      });
    });
  });

  // Spacing checks by zone
  const byZone: Record<Zone, PlanPlant[]> = {
    zone0: plants.filter(p => p.zone === 'zone0'),
    zone1: plants.filter(p => p.zone === 'zone1'), 
    zone2: plants.filter(p => p.zone === 'zone2'),
  };

  Object.entries(byZone)
    .filter(([_, zonePlants]) => zonePlants.length > 1)
    .forEach(([zone, zonePlants]) => {
      tasks.push({
        id: taskId(), plantId: 'zone-spacing',
        plantName: `${zone.toUpperCase()} spacing check`,
        zone: zone as Zone, taskType: 'spacing_check', season: 'spring', month: 3,
        priority: zone === 'zone0' ? 'high' : 'medium',
        title: `Check plant spacing in ${zone}`,
        description: `${zonePlants.length} plants: verify 10+ foot spacing`,
        fireSafetyReason: 'Close plants create fire ladders, reduce defensible space effectiveness',
        estimatedHours: Math.ceil(zonePlants.length * 0.25),
      });
    });

  // Sort and calculate summary
  tasks.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority] || a.month - b.month;
  });

  const highPriorityTasks = tasks.filter(t => t.priority === 'high').length;
  const estimatedAnnualHours = tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
  
  const currentMonth = new Date().getMonth() + 1;
  const nextTask = tasks
    .filter(t => !t.yearOffset && t.month >= currentMonth)
    .sort((a, b) => a.month - b.month)[0] || 
    tasks.filter(t => !t.yearOffset)[0];

  return {
    propertyId, generatedAt: new Date(), tasks,
    summary: {
      totalTasks: tasks.filter(t => !t.yearOffset).length,
      highPriorityTasks, estimatedAnnualHours,
      nextMaintenanceWindow: nextTask || null,
    },
  };
}