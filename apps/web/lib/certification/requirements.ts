/**
 * Wildfire Prepared Home (IBHS) Certification Requirements
 * 
 * Based on Insurance Institute for Business & Home Safety standards
 * and Firewise USA guidelines.
 */

export interface CertificationRequirement {
  id: string;
  category: 'roof' | 'walls' | 'windows' | 'zone0' | 'zone1' | 'zone2' | 'maintenance';
  title: string;
  description: string;
  howToMeet: string;
  estimatedCost: { min: number; max: number };
  diy: boolean; // can homeowner do this themselves?
}

export const CERTIFICATION_REQUIREMENTS: CertificationRequirement[] = [
  // ROOF Requirements
  {
    id: 'roof-covering',
    category: 'roof',
    title: 'Non-combustible Roof Covering',
    description: 'Roof must be covered with Class A fire-rated materials (metal, tile, asphalt shingles, or concrete)',
    howToMeet: 'Install or upgrade to Class A rated roofing materials. Metal roofing, concrete/clay tiles, and composition shingles typically qualify.',
    estimatedCost: { min: 8000, max: 25000 },
    diy: false
  },
  {
    id: 'roof-debris',
    category: 'roof',
    title: 'Roof and Gutter Maintenance',
    description: 'Keep roof and gutters clear of leaves, needles, and other flammable debris',
    howToMeet: 'Clean gutters monthly during fire season, install gutter guards, and regularly remove debris from roof valleys.',
    estimatedCost: { min: 200, max: 1500 },
    diy: true
  },
  {
    id: 'roof-vents',
    category: 'roof',
    title: 'Protected Roof Vents',
    description: 'Roof vents must have ember-resistant screening (1/8" mesh or smaller)',
    howToMeet: 'Install or upgrade to vents with fine mesh screening to prevent ember intrusion.',
    estimatedCost: { min: 300, max: 800 },
    diy: true
  },

  // WALLS Requirements
  {
    id: 'walls-siding',
    category: 'walls',
    title: 'Ignition-resistant Siding',
    description: 'Exterior walls within 30 feet of structures should use non-combustible or ignition-resistant materials',
    howToMeet: 'Use fiber cement, stucco, brick, stone, or metal siding. Wood siding can qualify if properly treated and maintained.',
    estimatedCost: { min: 5000, max: 20000 },
    diy: false
  },
  {
    id: 'walls-clearance',
    category: 'walls',
    title: 'Foundation Clearance',
    description: 'Maintain 6-inch clearance between ground and combustible siding or decking',
    howToMeet: 'Remove soil, mulch, or vegetation that touches wooden siding. Create a non-combustible barrier if needed.',
    estimatedCost: { min: 100, max: 500 },
    diy: true
  },

  // WINDOWS Requirements
  {
    id: 'windows-glazing',
    category: 'windows',
    title: 'Multi-pane Windows',
    description: 'Windows should be double-pane or triple-pane with tempered or laminated glass',
    howToMeet: 'Upgrade single-pane windows to double-pane. Tempered glass is preferred for fire resistance.',
    estimatedCost: { min: 300, max: 800 },
    diy: false
  },
  {
    id: 'windows-screens',
    category: 'windows',
    title: 'Window Screen Protection',
    description: 'Install fine mesh screens on all windows and vents to prevent ember entry',
    howToMeet: 'Use metal screens with 1/8" mesh or smaller on all openings including windows, vents, and crawl spaces.',
    estimatedCost: { min: 500, max: 1200 },
    diy: true
  },

  // ZONE 0 Requirements (0-5 feet)
  {
    id: 'zone0-clearance',
    category: 'zone0',
    title: 'Structure Clearance Zone',
    description: 'Remove all vegetation within 5 feet of structures, or use only hardscaping',
    howToMeet: 'Remove all plants, mulch, and combustible materials within 5 feet of buildings. Use gravel, pavers, or concrete.',
    estimatedCost: { min: 500, max: 2500 },
    diy: true
  },
  {
    id: 'zone0-plants',
    category: 'zone0',
    title: 'Fire-resistant Plants Only',
    description: 'If plants are used in Zone 0, they must be high-moisture, low-growing, and fire-resistant',
    howToMeet: 'Use only plants with A-rating placement codes and character scores above 70. Keep well-watered and pruned.',
    estimatedCost: { min: 200, max: 1000 },
    diy: true
  },
  {
    id: 'zone0-irrigation',
    category: 'zone0',
    title: 'Zone 0 Irrigation',
    description: 'If plants are present in Zone 0, ensure adequate irrigation to maintain moisture',
    howToMeet: 'Install drip irrigation or soaker hoses for any plants within 5 feet of structures.',
    estimatedCost: { min: 300, max: 800 },
    diy: true
  },

  // ZONE 1 Requirements (5-30 feet)
  {
    id: 'zone1-spacing',
    category: 'zone1',
    title: 'Tree Crown Spacing',
    description: 'Maintain 10-foot spacing between mature tree canopies',
    howToMeet: 'Thin trees to create 10-foot gaps between crowns. Remove competing trees or shrubs as needed.',
    estimatedCost: { min: 800, max: 3000 },
    diy: false
  },
  {
    id: 'zone1-pruning',
    category: 'zone1',
    title: 'Remove Ladder Fuels',
    description: 'Prune lower branches to 8-10 feet above ground to prevent fire from climbing into canopy',
    howToMeet: 'Remove lower tree branches and tall shrubs beneath trees. Create vertical separation between ground and canopy.',
    estimatedCost: { min: 500, max: 1500 },
    diy: true
  },
  {
    id: 'zone1-plants',
    category: 'zone1',
    title: 'Fire-resistant Plant Selection',
    description: 'Use plants with placement codes A or B and maintain appropriate spacing',
    howToMeet: 'Select plants from the LWF database with good fire resistance ratings. Space according to mature size.',
    estimatedCost: { min: 1000, max: 4000 },
    diy: true
  },

  // ZONE 2 Requirements (30-100 feet)
  {
    id: 'zone2-thinning',
    category: 'zone2',
    title: 'Vegetation Thinning',
    description: 'Thin vegetation to break up fuel continuity and create defensible space',
    howToMeet: 'Remove dead trees, dense shrubs, and create fuel breaks. Maintain access for emergency vehicles.',
    estimatedCost: { min: 2000, max: 8000 },
    diy: false
  },
  {
    id: 'zone2-access',
    category: 'zone2',
    title: 'Emergency Access',
    description: 'Maintain clear access routes for emergency vehicles and evacuation',
    howToMeet: 'Keep driveways and roads clear of overhanging branches. Ensure turning radius for fire trucks.',
    estimatedCost: { min: 500, max: 2000 },
    diy: true
  },

  // MAINTENANCE Requirements
  {
    id: 'maintenance-annual',
    category: 'maintenance',
    title: 'Annual Property Inspection',
    description: 'Conduct annual inspection of all defensible space zones and structural elements',
    howToMeet: 'Schedule yearly review of vegetation growth, structural repairs, and compliance with all requirements.',
    estimatedCost: { min: 200, max: 500 },
    diy: true
  },
  {
    id: 'maintenance-seasonal',
    category: 'maintenance',
    title: 'Seasonal Debris Removal',
    description: 'Remove dead vegetation, fallen branches, and leaf accumulation before fire season',
    howToMeet: 'Clean property 2-3 times per year, especially in spring before fire season begins.',
    estimatedCost: { min: 300, max: 800 },
    diy: true
  },
  {
    id: 'maintenance-watering',
    category: 'maintenance',
    title: 'Irrigation Maintenance',
    description: 'Maintain irrigation systems to ensure adequate moisture in all planted areas',
    howToMeet: 'Check and repair irrigation systems seasonally. Ensure adequate coverage for fire-resistant plants.',
    estimatedCost: { min: 200, max: 600 },
    diy: true
  }
];

export const CATEGORY_NAMES: Record<CertificationRequirement['category'], string> = {
  roof: 'Roof & Gutters',
  walls: 'Walls & Siding', 
  windows: 'Windows & Openings',
  zone0: 'Zone 0 (0-5 feet)',
  zone1: 'Zone 1 (5-30 feet)', 
  zone2: 'Zone 2 (30-100+ feet)',
  maintenance: 'Ongoing Maintenance'
};

export const CATEGORY_DESCRIPTIONS: Record<CertificationRequirement['category'], string> = {
  roof: 'Fire-resistant roofing materials and regular maintenance',
  walls: 'Non-combustible siding and proper clearances',
  windows: 'Fire-resistant glazing and ember protection',
  zone0: 'Immediate area around structures - highest priority',
  zone1: 'Defensible space transition zone with managed vegetation',
  zone2: 'Reduced fuel zone extending to property boundaries',
  maintenance: 'Regular upkeep to maintain fire readiness year-round'
};

/**
 * Get requirements by category
 */
export function getRequirementsByCategory(category: CertificationRequirement['category']): CertificationRequirement[] {
  return CERTIFICATION_REQUIREMENTS.filter(req => req.category === category);
}

/**
 * Calculate total estimated cost for all requirements
 */
export function calculateTotalCost(requirements: CertificationRequirement[] = CERTIFICATION_REQUIREMENTS): { min: number; max: number } {
  return requirements.reduce(
    (total, req) => ({
      min: total.min + req.estimatedCost.min,
      max: total.max + req.estimatedCost.max
    }),
    { min: 0, max: 0 }
  );
}

/**
 * Calculate costs for remaining (unmet) requirements
 */
export function calculateRemainingCost(requirements: CertificationRequirement[], metRequirementIds: string[]): { min: number; max: number } {
  const unmetRequirements = requirements.filter(req => !metRequirementIds.includes(req.id));
  return calculateTotalCost(unmetRequirements);
}

/**
 * Group requirements by category for display
 */
export function getRequirementsByCategories(): Record<CertificationRequirement['category'], CertificationRequirement[]> {
  const grouped: Partial<Record<CertificationRequirement['category'], CertificationRequirement[]>> = {};
  
  for (const requirement of CERTIFICATION_REQUIREMENTS) {
    if (!grouped[requirement.category]) {
      grouped[requirement.category] = [];
    }
    grouped[requirement.category]!.push(requirement);
  }
  
  return grouped as Record<CertificationRequirement['category'], CertificationRequirement[]>;
}