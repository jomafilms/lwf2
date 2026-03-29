#!/usr/bin/env node

/**
 * Generate rich seed lists with real LWF API data
 * Replaces demo-lists.json with diverse, realistic collections
 */

const API_BASE = 'https://lwf-api.vercel.app/api/v1';
const HIZ_ATTRIBUTE_ID = 'b908b170-70c9-454d-a2ed-d86f98cb3de1';

interface Plant {
  id: string;
  genus: string;
  species: string;
  subspeciesVarieties?: string | null;
  commonName: string;
  primaryImage?: {
    url: string;
    type: string;
    source: string;
  } | null;
}

interface PlantValue {
  attributeId: string;
  attributeName: string;
  rawValue: string;
  resolved: {
    value: string;
    raw: string;
    type: string;
  };
}

interface SeedListPlant {
  plantId: string;
  commonName: string;
  botanicalName: string;
  reason: string;
  imageUrl?: string;
}

interface SeedList {
  name: string;
  organization: {
    type: 'community' | 'city' | 'hoa';
    name: string;
  };
  description: string;
  plants: SeedListPlant[];
}

async function fetchAPI(endpoint: string): Promise<any> {
  const response = await fetch(`${API_BASE}${endpoint}`);
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

async function getPlants(limit = 50, includeImages = true): Promise<Plant[]> {
  const data = await fetchAPI(`/plants?limit=${limit}&includeImages=${includeImages}`);
  return data.data;
}

async function getPlantValues(plantId: string): Promise<PlantValue[]> {
  const data = await fetchAPI(`/plants/${plantId}/values`);
  return data.data;
}

async function getBulkHIZValues(): Promise<Record<string, any>> {
  const data = await fetchAPI(`/values/bulk?attributeIds=${HIZ_ATTRIBUTE_ID}&resolve=true&limit=200`);
  return data.data.values;
}

function formatBotanicalName(plant: Plant): string {
  let name = `${plant.genus} ${plant.species}`;
  if (plant.subspeciesVarieties) {
    name += ` ${plant.subspeciesVarieties}`;
  }
  return name;
}

async function createZone0SafePlants(): Promise<SeedList> {
  console.error('Creating Zone 0 Safe Plants list...');
  
  // Get more plants since we're looking for specific criteria
  const plants = await getPlants(200, true);
  const hizValues = await getBulkHIZValues();
  
  const zone0Plants: SeedListPlant[] = [];
  
  for (const plant of plants) {
    const plantHIZ = hizValues[plant.id]?.[HIZ_ATTRIBUTE_ID];
    if (!plantHIZ) continue;
    
    const hasZone0 = plantHIZ.some((hiz: any) => hiz.resolved && hiz.resolved.value === '0-5');
    if (hasZone0) {
      // Get plant values to find list choice
      try {
        const values = await getPlantValues(plant.id);
        const listChoiceValue = values.find(v => v.attributeName === 'List Choice');
        
        // Only include plants that are considered appropriate
        if (listChoiceValue && listChoiceValue.resolved && listChoiceValue.resolved.value &&
            (listChoiceValue.resolved.value === 'Consider' || listChoiceValue.resolved.value === "Charisse's list")) {
          zone0Plants.push({
            plantId: plant.id,
            commonName: plant.commonName,
            botanicalName: formatBotanicalName(plant),
            reason: `Zone 0-5 approved (${listChoiceValue.resolved.value})`,
            imageUrl: plant.primaryImage?.url
          });
          
          if (zone0Plants.length >= 20) break;
        }
      } catch (error) {
        console.error(`Error getting values for ${plant.commonName}:`, error);
      }
    }
  }
  
  return {
    name: 'Zone 0 Safe Plants (0-5ft)',
    organization: {
      type: 'community',
      name: 'Rogue Valley Fire Safe Council'
    },
    description: 'Fire-reluctant plants suitable for the closest zone to structures (0-5 feet). These plants have been evaluated for low flammability and are safe for defensible space.',
    plants: zone0Plants
  };
}

async function createOregonNativeFireReluctant(): Promise<SeedList> {
  console.error('Creating Oregon Native Fire-Reluctant Plants list...');
  
  const plants = await getPlants(150, true);
  const nativePlants: SeedListPlant[] = [];
  
  for (const plant of plants) {
    try {
      const values = await getPlantValues(plant.id);
      const nativeStatus = values.find(v => v.attributeName === 'Native Status');
      const listChoice = values.find(v => v.attributeName === 'List Choice');
      const characterScore = values.find(v => v.attributeName === 'Character Score');
      
      if (nativeStatus && 
          nativeStatus.resolved && 
          nativeStatus.resolved.value &&
          (nativeStatus.resolved.value.includes('Oregon') || nativeStatus.resolved.value.includes('S. Oregon')) &&
          listChoice && 
          (listChoice.resolved.value === 'Consider' || listChoice.resolved.value === "Charisse's list")) {
        
        let reason = `Oregon native`;
        if (characterScore) {
          const score = parseInt(characterScore.resolved.value);
          if (score <= 6) {
            reason += ` • Low fire risk (score: ${score})`;
          }
        }
        
        nativePlants.push({
          plantId: plant.id,
          commonName: plant.commonName,
          botanicalName: formatBotanicalName(plant),
          reason,
          imageUrl: plant.primaryImage?.url
        });
        
        if (nativePlants.length >= 20) break;
      }
    } catch (error) {
      console.error(`Error processing ${plant.commonName}:`, error);
    }
  }
  
  return {
    name: 'Oregon Native Fire-Reluctant Plants',
    organization: {
      type: 'community',
      name: 'Southern Oregon Native Plant Society'
    },
    description: 'Native plants from Oregon that provide fire protection while supporting local ecosystems and wildlife.',
    plants: nativePlants
  };
}

async function createAshlandRestrictedPlants(): Promise<SeedList> {
  console.error('Creating Ashland Restricted Plants list...');
  
  const plants = await getPlants(100, true);
  const restrictedPlants: SeedListPlant[] = [];
  
  for (const plant of plants) {
    try {
      const values = await getPlantValues(plant.id);
      const restrictions = values.find(v => v.attributeName === 'Restrictions');
      const invasiveQualities = values.find(v => v.attributeName === 'Invasive Qualities');
      const characterScore = values.find(v => v.attributeName === 'Character Score');
      
      let isRestricted = false;
      let reason = '';
      
      if (restrictions && restrictions.resolved && restrictions.resolved.value && restrictions.resolved.value.includes('Ashland')) {
        isRestricted = true;
        reason = 'Restricted in Ashland city limits';
      } else if (invasiveQualities && invasiveQualities.resolved && invasiveQualities.resolved.value && invasiveQualities.resolved.value !== 'None') {
        isRestricted = true;
        reason = `Invasive qualities: ${invasiveQualities.resolved.value}`;
      } else if (characterScore) {
        const score = parseInt(characterScore.resolved.value);
        if (score > 8) {
          isRestricted = true;
          reason = `High flammability (score: ${score})`;
        }
      }
      
      if (isRestricted) {
        restrictedPlants.push({
          plantId: plant.id,
          commonName: plant.commonName,
          botanicalName: formatBotanicalName(plant),
          reason,
          imageUrl: plant.primaryImage?.url
        });
        
        if (restrictedPlants.length >= 18) break;
      }
    } catch (error) {
      console.error(`Error processing ${plant.commonName}:`, error);
    }
  }
  
  return {
    name: 'City of Ashland — Restricted Plants',
    organization: {
      type: 'city',
      name: 'City of Ashland'
    },
    description: 'Plants that are restricted or prohibited within city limits due to fire risk, invasive nature, or local ordinances.',
    plants: restrictedPlants
  };
}

async function createDeerResistantChoices(): Promise<SeedList> {
  console.error('Creating Deer-Resistant Choices list...');
  
  const plants = await getPlants(100, true);
  const deerResistantPlants: SeedListPlant[] = [];
  
  for (const plant of plants) {
    try {
      const values = await getPlantValues(plant.id);
      const deerResistance = values.find(v => v.attributeName === 'Deer Resistance');
      
      if (deerResistance && 
          (deerResistance.resolved.value === 'High (Usually)' || 
           deerResistance.resolved.value === 'Very High' ||
           deerResistance.resolved.value === 'Some')) {
        
        deerResistantPlants.push({
          plantId: plant.id,
          commonName: plant.commonName,
          botanicalName: formatBotanicalName(plant),
          reason: `Deer resistance: ${deerResistance.resolved.value}`,
          imageUrl: plant.primaryImage?.url
        });
        
        if (deerResistantPlants.length >= 18) break;
      }
    } catch (error) {
      console.error(`Error processing ${plant.commonName}:`, error);
    }
  }
  
  return {
    name: 'Deer-Resistant Choices',
    organization: {
      type: 'community',
      name: 'Rogue Valley Gardeners Association'
    },
    description: 'Plants that deer typically avoid, perfect for properties in areas with high deer populations.',
    plants: deerResistantPlants
  };
}

async function createLowWaterFireReluctant(): Promise<SeedList> {
  console.error('Creating Low Water Fire-Reluctant Plants list...');
  
  const plants = await getPlants(200, true);
  const lowWaterPlants: SeedListPlant[] = [];
  
  for (const plant of plants) {
    try {
      const values = await getPlantValues(plant.id);
      const waterNeed = values.find(v => v.attributeName === 'Water Need');
      const droughtTolerant = values.find(v => v.attributeName === 'Drought Tolerant');
      const listChoice = values.find(v => v.attributeName === 'List Choice');
      const waterAmount = values.find(v => v.attributeName === 'Water Amount');
      
      let isLowWater = false;
      let waterReason = '';
      
      if (waterNeed && waterNeed.resolved && waterNeed.resolved.value && 
          (waterNeed.resolved.value === 'Low' || waterNeed.resolved.value === 'Very Low')) {
        isLowWater = true;
        waterReason = `${waterNeed.resolved.value} water need`;
      } else if (waterAmount && waterAmount.resolved && waterAmount.resolved.value &&
                 (waterAmount.resolved.value === 'Low' || waterAmount.resolved.value === 'Very Low')) {
        isLowWater = true;
        waterReason = `${waterAmount.resolved.value} water`;
      } else if (droughtTolerant && droughtTolerant.resolved && droughtTolerant.resolved.value === 'Yes') {
        isLowWater = true;
        waterReason = 'Drought tolerant';
      }
      
      if (isLowWater && 
          listChoice && listChoice.resolved && listChoice.resolved.value &&
          (listChoice.resolved.value === 'Consider' || listChoice.resolved.value === "Charisse's list")) {
        
        lowWaterPlants.push({
          plantId: plant.id,
          commonName: plant.commonName,
          botanicalName: formatBotanicalName(plant),
          reason: `${waterReason} • Fire-reluctant`,
          imageUrl: plant.primaryImage?.url
        });
        
        if (lowWaterPlants.length >= 18) break;
      }
    } catch (error) {
      console.error(`Error processing ${plant.commonName}:`, error);
    }
  }
  
  return {
    name: 'Low Water Fire-Reluctant Plants',
    organization: {
      type: 'community',
      name: 'Southern Oregon Water Conservation Council'
    },
    description: 'Water-wise plants that provide fire protection while reducing irrigation needs during dry seasons.',
    plants: lowWaterPlants
  };
}

async function createMountainMeadowsHOA(): Promise<SeedList> {
  console.error('Creating Mountain Meadows HOA list...');
  
  const plants = await getPlants(100, true);
  const hoaPlants: SeedListPlant[] = [];
  
  for (const plant of plants) {
    try {
      const values = await getPlantValues(plant.id);
      const deerResistance = values.find(v => v.attributeName === 'Deer Resistance');
      const nativeStatus = values.find(v => v.attributeName === 'Native Status');
      const listChoice = values.find(v => v.attributeName === 'List Choice');
      const hizAttribute = values.find(v => v.attributeName === 'Home Ignition Zone (HIZ)');
      
      let score = 0;
      let reasons: string[] = [];
      
      // Good for Zone 0-1
      if (hizAttribute && hizAttribute.resolved && hizAttribute.resolved.value && 
          (hizAttribute.resolved.value === '0-5' || hizAttribute.resolved.value === '5-10')) {
        score += 3;
        reasons.push('Zone 0-1 approved');
      }
      
      // Deer resistant
      if (deerResistance && (deerResistance.resolved.value === 'High (Usually)' || deerResistance.resolved.value === 'Very High')) {
        score += 2;
        reasons.push('Deer resistant');
      }
      
      // Native preference
      if (nativeStatus && nativeStatus.resolved && nativeStatus.resolved.value && nativeStatus.resolved.value.includes('Oregon')) {
        score += 1;
        reasons.push('Oregon native');
      }
      
      // Fire safe
      if (listChoice && (listChoice.resolved.value === 'Consider' || listChoice.resolved.value === "Charisse's list")) {
        score += 2;
        reasons.push('Fire-reluctant');
      }
      
      if (score >= 3 && reasons.length >= 2) {
        hoaPlants.push({
          plantId: plant.id,
          commonName: plant.commonName,
          botanicalName: formatBotanicalName(plant),
          reason: reasons.join(' • '),
          imageUrl: plant.primaryImage?.url
        });
        
        if (hoaPlants.length >= 15) break;
      }
    } catch (error) {
      console.error(`Error processing ${plant.commonName}:`, error);
    }
  }
  
  return {
    name: 'Mountain Meadows HOA — Preferred Plants',
    organization: {
      type: 'hoa',
      name: 'Mountain Meadows HOA'
    },
    description: 'Community-approved plants for close-to-structure placement. Low maintenance, deer resistant, and fire-reluctant selections that meet HOA landscaping standards.',
    plants: hoaPlants
  };
}

async function createPollinatorGarden(): Promise<SeedList> {
  console.error('Creating Pollinator Garden list...');
  
  const plants = await getPlants(100, true);
  const pollinatorPlants: SeedListPlant[] = [];
  
  for (const plant of plants) {
    try {
      const values = await getPlantValues(plant.id);
      const benefits = values.find(v => v.attributeName === 'Benefits');
      const listChoice = values.find(v => v.attributeName === 'List Choice');
      
      if (benefits && 
          benefits.resolved && 
          benefits.resolved.value &&
          (benefits.resolved.value.toLowerCase().includes('pollinator') ||
           benefits.resolved.value.toLowerCase().includes('bee') ||
           benefits.resolved.value.toLowerCase().includes('butterfly') ||
           benefits.resolved.value.toLowerCase().includes('nectar')) &&
          listChoice && 
          (listChoice.resolved.value === 'Consider' || listChoice.resolved.value === "Charisse's list")) {
        
        pollinatorPlants.push({
          plantId: plant.id,
          commonName: plant.commonName,
          botanicalName: formatBotanicalName(plant),
          reason: `Pollinator benefits • ${listChoice.resolved.value}`,
          imageUrl: plant.primaryImage?.url
        });
        
        if (pollinatorPlants.length >= 15) break;
      }
    } catch (error) {
      console.error(`Error processing ${plant.commonName}:`, error);
    }
  }
  
  return {
    name: 'Pollinator Garden — Fire-Safe Picks',
    organization: {
      type: 'community',
      name: 'Southern Oregon Pollinator Project'
    },
    description: 'Plants that support beneficial insects while maintaining fire-safe garden practices. Perfect for eco-friendly defensible space.',
    plants: pollinatorPlants
  };
}

async function main() {
  try {
    console.error('Generating rich seed lists from LWF API...');
    
    const lists: SeedList[] = [];
    
    // Generate all lists
    lists.push(await createZone0SafePlants());
    lists.push(await createOregonNativeFireReluctant());
    lists.push(await createAshlandRestrictedPlants());
    lists.push(await createDeerResistantChoices());
    lists.push(await createLowWaterFireReluctant());
    lists.push(await createMountainMeadowsHOA());
    lists.push(await createPollinatorGarden());
    
    const output = {
      generated: new Date().toISOString(),
      lists
    };
    
    console.log(JSON.stringify(output, null, 2));
    console.error(`Generated ${lists.length} seed lists with real LWF API data`);
    
  } catch (error) {
    console.error('Error generating seed lists:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}