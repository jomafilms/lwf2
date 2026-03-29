export interface AssessmentData {
  // Step 1: Structure Features
  structureFeatures: {
    windows: {
      north: boolean;
      south: boolean;
      east: boolean;
      west: boolean;
    };
    attachments: {
      fence: boolean;
      deck: boolean;
      pergola: boolean;
      other?: string;
    };
    roofType: "tile" | "shake" | "metal" | "composite" | "other";
    roofOther?: string;
    sidingMaterial: "wood" | "vinyl" | "brick" | "stucco" | "fiber_cement" | "other";
    sidingOther?: string;
    ventsGaps: boolean;
    ventsGapsDescription?: string;
  };
  
  // Step 2: Current Zone 0 (0-5ft)
  zone0Current: {
    materials: {
      bark_mulch: boolean;
      gravel: boolean;
      concrete: boolean;
      plants: boolean;
      nothing: boolean;
      other?: string;
    };
    plantsTouchingStructure: boolean | null;
    deadMaterialVisible: boolean | null;
    photos: File[];
  };
  
  // Step 3: Current Zone 1 (5-30ft)
  zone1Current: {
    vegetationType: {
      lawn: boolean;
      shrubs: boolean;
      trees: boolean;
      garden_beds: boolean;
      other?: string;
    };
    plantsConnected: boolean | null;
    irrigationPresent: boolean | null;
    maintenanceLevel: "well_maintained" | "moderate" | "overgrown" | null;
  };
  
  // Step 4: Current Zone 2 (30-100ft)
  zone2Current: {
    trees: {
      present: boolean;
      types?: string;
      spacing: "close" | "moderate" | "wide" | null;
      limbedUp: boolean | null;
    };
    brushDeadMaterial: boolean | null;
    brushDescription?: string;
    defensibleSpace: "good" | "fair" | "poor" | null;
  };
  
  // Step 5: Your Priorities
  priorities: {
    mainPriorities: {
      fire_safety: boolean;
      beauty: boolean;
      low_water: boolean;
      wildlife: boolean;
      low_maintenance: boolean;
    };
    budgetRange: "under_500" | "500_2k" | "2k_5k" | "5k_15k" | "15k_plus" | null;
    laborApproach: "diy" | "hiring" | "hybrid" | null;
    timeline: "this_season" | "this_year" | "gradual_years" | null;
  };
}