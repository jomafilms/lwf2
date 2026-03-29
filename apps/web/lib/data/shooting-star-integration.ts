/**
 * Shooting Star Nursery Integration
 * 
 * Processes real inventory data from Shooting Star Nursery
 * and matches it with LWF plant database for fire safety ratings.
 */

export interface ShootingStarPlant {
  common_name: string;
  botanical_name: string;
  price: string;
  container_size: string;
  availability: string;
  category: string;
  url: string;
}

export interface EnhancedNurseryPlant {
  // Nursery data
  id: string;
  commonName: string;
  botanicalName: string;
  sizes: Array<{
    size: string;
    price: number; // in cents
    availability: number;
    status: 'in-stock' | 'limited' | 'out-of-stock';
  }>;
  category: string;
  nurseryUrl: string;

  // LWF integration (when matched)
  lwfPlantId?: string;
  fireScore?: number;
  placementCode?: string;
  riskReduction?: string;
  pollinator?: boolean;
  waterNeeds?: string;
  deerResistant?: boolean;
}

/**
 * Process Shooting Star inventory and enhance with fire safety data
 */
export async function processShootingStarInventory(): Promise<EnhancedNurseryPlant[]> {
  try {
    // Load Shooting Star inventory data
    const response = await fetch('/data/nurseries/shooting-star-availability.json');
    const data = await response.json();
    const plants = data.plants as ShootingStarPlant[];

    // Group by botanical name (same species, different sizes)
    const groupedPlants = new Map<string, ShootingStarPlant[]>();
    
    plants.forEach(plant => {
      const key = plant.botanical_name.toLowerCase().trim();
      if (!groupedPlants.has(key)) {
        groupedPlants.set(key, []);
      }
      groupedPlants.get(key)!.push(plant);
    });

    // Process each plant group
    const enhancedPlants: EnhancedNurseryPlant[] = [];
    
    for (const [botanicalName, plantVariants] of groupedPlants) {
      // Skip if no botanical name
      if (!botanicalName || botanicalName === '' || botanicalName === 'unknown') {
        continue;
      }

      // Use the first variant for common info
      const firstVariant = plantVariants[0];
      
      // Process sizes and availability
      const sizes = plantVariants.map(variant => {
        const availability = parseInt(variant.availability) || 0;
        
        return {
          size: variant.container_size || '1 gal',
          price: estimatePrice(variant.container_size, variant.category),
          availability,
          status: availability === 0 ? 'out-of-stock' as const : 
                  availability < 5 ? 'limited' as const : 
                  'in-stock' as const
        };
      }).filter(size => size.size); // Remove entries with no size

      const enhancedPlant: EnhancedNurseryPlant = {
        id: `ss-${botanicalName.replace(/[^a-z0-9]/g, '-')}`,
        commonName: firstVariant.common_name.replace(/\s*-\s*\d+.*$/, ''), // Remove size suffix
        botanicalName: firstVariant.botanical_name,
        sizes,
        category: firstVariant.category,
        nurseryUrl: firstVariant.url,
      };

      enhancedPlants.push(enhancedPlant);
    }

    // Sort by availability and common name
    enhancedPlants.sort((a, b) => {
      const aHasStock = a.sizes.some(s => s.status !== 'out-of-stock');
      const bHasStock = b.sizes.some(s => s.status !== 'out-of-stock');
      
      if (aHasStock !== bHasStock) {
        return bHasStock ? 1 : -1; // In-stock first
      }
      
      return a.commonName.localeCompare(b.commonName);
    });

    return enhancedPlants;
  } catch (error) {
    console.error('Error processing Shooting Star inventory:', error);
    return [];
  }
}

/**
 * Estimate pricing based on container size and category
 * (Real prices would come from scraping or API)
 */
function estimatePrice(size: string, category: string): number {
  const sizeMultiplier = getSizeMultiplier(size);
  const categoryBase = getCategoryBasePrice(category);
  
  return Math.round(categoryBase * sizeMultiplier);
}

function getSizeMultiplier(size: string): number {
  const sizeStr = size.toLowerCase();
  
  if (sizeStr.includes('4"') || sizeStr.includes('4 in')) return 0.6;
  if (sizeStr.includes('6"') || sizeStr.includes('6 in')) return 1.0;
  if (sizeStr.includes('1 gal') || sizeStr.includes('1g')) return 1.5;
  if (sizeStr.includes('2 gal') || sizeStr.includes('2g')) return 2.5;
  if (sizeStr.includes('5 gal') || sizeStr.includes('5g')) return 5.0;
  if (sizeStr.includes('10 gal') || sizeStr.includes('10g')) return 8.0;
  if (sizeStr.includes('15 gal') || sizeStr.includes('15g')) return 12.0;
  
  return 1.0; // default
}

function getCategoryBasePrice(category: string): number {
  const categoryStr = category.toLowerCase();
  
  // Base prices in cents
  if (categoryStr.includes('tree')) return 2500;
  if (categoryStr.includes('shrub')) return 1800;
  if (categoryStr.includes('perennial')) return 1200;
  if (categoryStr.includes('groundcover')) return 1000;
  if (categoryStr.includes('grass')) return 1400;
  if (categoryStr.includes('fern')) return 1600;
  if (categoryStr.includes('vine')) return 1300;
  if (categoryStr.includes('herb')) return 800;
  
  return 1500; // default
}

/**
 * Match nursery plant with LWF database by botanical name
 */
export async function matchWithLWFDatabase(botanicalName: string): Promise<{
  lwfPlantId?: string;
  fireScore?: number;
  placementCode?: string;
  riskReduction?: string;
} | null> {
  try {
    // Parse genus and species from botanical name
    const parts = botanicalName.split(' ');
    if (parts.length < 2) return null;
    
    const genus = parts[0];
    const species = parts[1];
    
    // Search LWF API
    const response = await fetch(
      `https://lwf-api.vercel.app/api/v1/plants?genus=${encodeURIComponent(genus)}&species=${encodeURIComponent(species)}&limit=1`
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    if (!data.data || data.data.length === 0) return null;
    
    const plant = data.data[0];
    
    // Get risk reduction data
    let riskReduction = '';
    let fireScore = 0;
    let placementCode = '';
    
    try {
      const riskResponse = await fetch(
        `https://lwf-api.vercel.app/api/v1/plants/${plant.id}/risk-reduction`
      );
      
      if (riskResponse.ok) {
        const riskData = await riskResponse.json();
        riskReduction = riskData.riskReductionText || '';
        fireScore = riskData.characterScore || 0;
        placementCode = riskData.placement?.code || '';
      }
    } catch (error) {
      console.warn('Could not fetch risk reduction data:', error);
    }
    
    return {
      lwfPlantId: plant.id,
      fireScore,
      placementCode,
      riskReduction
    };
  } catch (error) {
    console.error('Error matching with LWF database:', error);
    return null;
  }
}

/**
 * Get featured fire-safe plants from Shooting Star inventory
 */
export async function getFeaturedFireSafePlants(): Promise<EnhancedNurseryPlant[]> {
  const allPlants = await processShootingStarInventory();
  
  // Filter for plants likely to be fire-safe based on botanical names
  const fireSafeBotanicalNames = [
    'lavandula',
    'salvia',
    'ceanothus',
    'arctostaphylos',
    'achillea',
    'sedum',
    'cistus',
    'rosmarinus',
    'santolina',
    'penstemon'
  ];
  
  const featured = allPlants.filter(plant => {
    const genus = plant.botanicalName.toLowerCase().split(' ')[0];
    return fireSafeBotanicalNames.some(safe => genus.includes(safe));
  }).slice(0, 12); // Limit to 12 featured plants
  
  // Enhance with LWF data for featured plants
  for (const plant of featured) {
    const lwfData = await matchWithLWFDatabase(plant.botanicalName);
    if (lwfData) {
      Object.assign(plant, lwfData);
    }
  }
  
  return featured;
}