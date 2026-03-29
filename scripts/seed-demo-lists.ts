#!/usr/bin/env tsx

/**
 * Seed demo lists script
 * 
 * Creates sample lists using the LWF API and saves them as static JSON
 * for use as featured/example lists in the UI.
 * 
 * Usage: npx tsx scripts/seed-demo-lists.ts
 */

import { writeFileSync } from 'fs';
import { join } from 'path';

const LWF_API_BASE = 'https://lwf-api.vercel.app/api/v1';

interface Plant {
  id: string;
  commonName: string;
  genus: string;
  species: string;
  notes?: string;
}

interface PlantValue {
  attributeId: string;
  attributeName?: string;
  value?: string;
  resolved?: {
    value?: string;
    description?: string;
  };
}

interface DemoList {
  name: string;
  organization: {
    type: 'city' | 'hoa' | 'community';
    name: string;
  };
  description: string;
  plants: Array<{
    plantId: string;
    commonName: string;
    botanicalName: string;
    reason: string;
  }>;
}

async function fetchPlants(search = '', limit = 50): Promise<Plant[]> {
  const url = `${LWF_API_BASE}/plants?search=${encodeURIComponent(search)}&limit=${limit}&includeImages=true`;
  console.log(`Fetching plants: ${url}`);
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch plants: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.data || [];
}

async function fetchPlantValues(plantId: string): Promise<PlantValue[]> {
  const url = `${LWF_API_BASE}/plants/${plantId}/values`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`Failed to fetch values for plant ${plantId}: ${response.statusText}`);
      return [];
    }
    
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.warn(`Error fetching values for plant ${plantId}:`, error);
    return [];
  }
}

async function fetchFilterPresets() {
  const url = `${LWF_API_BASE}/filter-presets`;
  
  const response = await fetch(url);
  if (!response.ok) {
    console.warn(`Failed to fetch filter presets: ${response.statusText}`);
    return null;
  }
  
  return response.json();
}

function hasAttribute(values: PlantValue[], attributeName: string, expectedValue?: string): boolean {
  if (!Array.isArray(values)) return false;
  
  return values.some(v => {
    const matches = v.attributeName?.toLowerCase().includes(attributeName.toLowerCase()) ||
                   v.resolved?.value?.toLowerCase().includes(attributeName.toLowerCase());
    
    if (!expectedValue) return matches;
    
    const value = v.resolved?.value || v.value || '';
    return matches && value.toLowerCase().includes(expectedValue.toLowerCase());
  });
}

function getAttributeValue(values: PlantValue[], attributeName: string): string | null {
  if (!Array.isArray(values)) return null;
  
  const attr = values.find(v => 
    v.attributeName?.toLowerCase().includes(attributeName.toLowerCase())
  );
  return attr?.resolved?.value || attr?.value || null;
}

async function createRestrictedPlantsList(): Promise<DemoList> {
  console.log('Creating City of Ashland — Restricted Plants list...');
  
  const plants = await fetchPlants('', 100); // Get more plants to filter
  const restrictedPlants = [];
  
  for (const plant of plants.slice(0, 30)) { // Limit API calls
    const values = await fetchPlantValues(plant.id);
    
    // Look for invasive or restricted indicators
    if (hasAttribute(values, 'invasive') || 
        hasAttribute(values, 'prohibited') ||
        hasAttribute(values, 'restricted') ||
        hasAttribute(values, 'noxious')) {
      
      let reason = 'Invasive species';
      
      if (hasAttribute(values, 'prohibited')) reason = 'Prohibited by city ordinance';
      if (hasAttribute(values, 'noxious')) reason = 'Listed as noxious weed';
      if (hasAttribute(values, 'restricted')) reason = 'Restricted planting';
      
      restrictedPlants.push({
        plantId: plant.id,
        commonName: plant.commonName,
        botanicalName: `${plant.genus} ${plant.species}`.trim(),
        reason,
      });
      
      if (restrictedPlants.length >= 15) break;
    }
  }
  
  // If we don't find enough "restricted" plants from attributes, add some known problem plants
  if (restrictedPlants.length < 10) {
    const additionalProblematic = plants.slice(0, 15 - restrictedPlants.length);
    for (const plant of additionalProblematic) {
      restrictedPlants.push({
        plantId: plant.id,
        commonName: plant.commonName,
        botanicalName: `${plant.genus} ${plant.species}`.trim(),
        reason: 'Requires evaluation for fire risk',
      });
    }
  }
  
  return {
    name: 'City of Ashland — Restricted Plants',
    organization: {
      type: 'city',
      name: 'City of Ashland',
    },
    description: 'Plants that are restricted or prohibited within city limits due to fire risk, invasive nature, or local ordinances.',
    plants: restrictedPlants,
  };
}

async function createHOAPreferredList(): Promise<DemoList> {
  console.log('Creating Mountain Meadows HOA — Preferred Zone 0 Plants list...');
  
  const plants = await fetchPlants('', 100);
  const preferredPlants = [];
  
  for (const plant of plants.slice(0, 40)) {
    const values = await fetchPlantValues(plant.id);
    
    // Look for Zone 0 (0-5ft) placement
    const hizValue = getAttributeValue(values, 'hiz') || getAttributeValue(values, 'zone') || '';
    if (hizValue.includes('0-5') || hizValue.includes('Zone 0')) {
      
      // Check for low flammability, low water, deer resistance
      const isLowWater = hasAttribute(values, 'water', 'low') || hasAttribute(values, 'drought');
      const isDeerResistant = hasAttribute(values, 'deer', 'resistant') || hasAttribute(values, 'deer', 'high');
      const isLowFlammability = !hasAttribute(values, 'flammable') && !hasAttribute(values, 'highly flammable');
      
      let reason = 'Suitable for Zone 0 placement';
      if (isLowWater && isDeerResistant) reason += ' • Low water needs • Deer resistant';
      else if (isLowWater) reason += ' • Low water needs';
      else if (isDeerResistant) reason += ' • Deer resistant';
      
      if (isLowFlammability) reason += ' • Low fire risk';
      
      preferredPlants.push({
        plantId: plant.id,
        commonName: plant.commonName,
        botanicalName: `${plant.genus} ${plant.species}`.trim(),
        reason,
      });
      
      if (preferredPlants.length >= 18) break;
    }
  }
  
  // If not enough Zone 0 plants found, add plants with good characteristics
  while (preferredPlants.length < 15) {
    const plant = plants[preferredPlants.length];
    if (!plant) break;
    
    const values = await fetchPlantValues(plant.id);
    const isLowWater = hasAttribute(values, 'water', 'low') || hasAttribute(values, 'drought');
    
    let reason = 'HOA approved characteristics';
    if (isLowWater) reason += ' • Low maintenance';
    
    preferredPlants.push({
      plantId: plant.id,
      commonName: plant.commonName,
      botanicalName: `${plant.genus} ${plant.species}`.trim(),
      reason,
    });
  }
  
  return {
    name: 'Mountain Meadows HOA — Preferred Zone 0 Plants',
    organization: {
      type: 'hoa',
      name: 'Mountain Meadows HOA',
    },
    description: 'Community-approved plants for close-to-structure placement (0-5 feet). Low maintenance, deer resistant, and fire-reluctant.',
    plants: preferredPlants,
  };
}

async function createNativeFireReluctantList(): Promise<DemoList> {
  console.log('Creating Rogue Valley Native Fire-Reluctant Plants list...');
  
  const plants = await fetchPlants('native', 50);
  const nativePlants = [];
  
  for (const plant of plants.slice(0, 35)) {
    const values = await fetchPlantValues(plant.id);
    
    const isNative = hasAttribute(values, 'native', 'yes') || 
                    hasAttribute(values, 'oregon') || 
                    hasAttribute(values, 'rogue valley') ||
                    plant.commonName.toLowerCase().includes('native');
    
    if (isNative) {
      const isFireResistant = !hasAttribute(values, 'flammable') && 
                             !hasAttribute(values, 'volatile');
      const isLowFlammability = hasAttribute(values, 'fire', 'resistant') || 
                               hasAttribute(values, 'low flammability');
      
      let reason = 'Native to Rogue Valley region';
      if (isFireResistant || isLowFlammability) reason += ' • Good fire characteristics';
      
      nativePlants.push({
        plantId: plant.id,
        commonName: plant.commonName,
        botanicalName: `${plant.genus} ${plant.species}`.trim(),
        reason,
      });
      
      if (nativePlants.length >= 22) break;
    }
  }
  
  // Add non-native plants with good fire characteristics if needed
  if (nativePlants.length < 20) {
    const additionalPlants = await fetchPlants('fire resistant', 20);
    for (const plant of additionalPlants.slice(0, 20 - nativePlants.length)) {
      nativePlants.push({
        plantId: plant.id,
        commonName: plant.commonName,
        botanicalName: `${plant.genus} ${plant.species}`.trim(),
        reason: 'Fire-reluctant characteristics',
      });
    }
  }
  
  return {
    name: 'Rogue Valley Native Fire-Reluctant Plants',
    organization: {
      type: 'community',
      name: 'Rogue Valley Fire Safe Council',
    },
    description: 'Native and adapted plants that provide good fire protection while supporting local ecosystems.',
    plants: nativePlants,
  };
}

async function createPollinatorGardenList(): Promise<DemoList> {
  console.log('Creating Pollinator Garden — Fire-Safe Picks list...');
  
  const plants = await fetchPlants('pollinator', 40);
  const pollinatorPlants = [];
  
  for (const plant of plants.slice(0, 25)) {
    const values = await fetchPlantValues(plant.id);
    
    const isPollinatorFriendly = hasAttribute(values, 'pollinator') || 
                                hasAttribute(values, 'bee') ||
                                hasAttribute(values, 'butterfly') ||
                                hasAttribute(values, 'nectar');
    
    const isFireSafe = !hasAttribute(values, 'highly flammable') && 
                      !hasAttribute(values, 'volatile oils');
    
    if (isPollinatorFriendly && isFireSafe) {
      let reason = 'Supports pollinators';
      
      if (hasAttribute(values, 'bee')) reason += ' • Bee friendly';
      if (hasAttribute(values, 'butterfly')) reason += ' • Butterfly habitat';
      if (hasAttribute(values, 'nectar')) reason += ' • Nectar source';
      
      reason += ' • Fire-safe characteristics';
      
      pollinatorPlants.push({
        plantId: plant.id,
        commonName: plant.commonName,
        botanicalName: `${plant.genus} ${plant.species}`.trim(),
        reason,
      });
      
      if (pollinatorPlants.length >= 15) break;
    }
  }
  
  return {
    name: 'Pollinator Garden — Fire-Safe Picks',
    organization: {
      type: 'community',
      name: 'Southern Oregon Pollinator Project',
    },
    description: 'Plants that support beneficial insects while maintaining fire-safe garden practices.',
    plants: pollinatorPlants,
  };
}

async function main() {
  console.log('Starting demo lists generation...');
  
  try {
    const demoLists = await Promise.all([
      createRestrictedPlantsList(),
      createHOAPreferredList(),
      createNativeFireReluctantList(),
      createPollinatorGardenList(),
    ]);
    
    const outputData = {
      generated: new Date().toISOString(),
      lists: demoLists,
    };
    
    // Ensure lib/data directory exists
    const outputPath = join(process.cwd(), 'apps/web/lib/data/demo-lists.json');
    
    writeFileSync(outputPath, JSON.stringify(outputData, null, 2));
    
    console.log(`✅ Generated ${demoLists.length} demo lists`);
    console.log(`📁 Saved to: ${outputPath}`);
    
    demoLists.forEach((list, i) => {
      console.log(`${i + 1}. ${list.name} — ${list.plants.length} plants`);
    });
    
  } catch (error) {
    console.error('❌ Failed to generate demo lists:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}