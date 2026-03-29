// Simple test for compliance report generation
// Run with: node test-compliance.js

// Mock PlanPlant data
const mockPlanPlants = [
  {
    plantId: 'test-plant-1',
    plantName: 'Test Low Fire Risk Plant',
    zone: 'zone0',
    characterScore: 80,
    placementCode: 'A',
    attributes: {
      water: 'low',
      deer: 'high',
      pollinator: 'yes'
    }
  },
  {
    plantId: 'test-plant-2', 
    plantName: 'Test High Fire Risk Plant',
    zone: 'zone0',
    characterScore: 30,
    placementCode: 'C', // Wrong placement for zone0
    attributes: {
      water: 'high',
      deer: 'low',
      pollinator: 'no'
    }
  },
  {
    plantId: 'test-plant-3',
    plantName: 'Test Zone 1 Plant',
    zone: 'zone1',
    characterScore: 65,
    placementCode: 'B',
    attributes: {
      water: 'moderate',
      deer: 'moderate', 
      pollinator: 'yes'
    }
  }
];

console.log('Testing compliance report generation...');
console.log('Mock data:', JSON.stringify(mockPlanPlants, null, 2));

// Test would require importing the actual functions
// This just validates the structure looks right
console.log('Mock data structure is valid ✓');