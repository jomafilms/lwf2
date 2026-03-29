"use client";

import { useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Home, X, Shield, TreePine, Target } from "lucide-react";
import { AssessmentData } from "./types";

interface AssessmentWizardProps {
  onComplete: (data: AssessmentData) => void;
  onCancel: () => void;
  initialData?: Partial<AssessmentData>;
}

const INITIAL_DATA: AssessmentData = {
  structureFeatures: {
    windows: { north: false, south: false, east: false, west: false },
    attachments: { fence: false, deck: false, pergola: false },
    roofType: "tile",
    sidingMaterial: "wood",
    ventsGaps: false,
  },
  zone0Current: {
    materials: { bark_mulch: false, gravel: false, concrete: false, plants: false, nothing: false },
    plantsTouchingStructure: null,
    deadMaterialVisible: null,
    photos: [],
  },
  zone1Current: {
    vegetationType: { lawn: false, shrubs: false, trees: false, garden_beds: false },
    plantsConnected: null,
    irrigationPresent: null,
    maintenanceLevel: null,
  },
  zone2Current: {
    trees: { present: false, spacing: null, limbedUp: null },
    brushDeadMaterial: null,
    defensibleSpace: null,
  },
  priorities: {
    mainPriorities: {
      fire_safety: false,
      beauty: false,
      low_water: false,
      wildlife: false,
      low_maintenance: false,
    },
    budgetRange: null,
    laborApproach: null,
    timeline: null,
  },
};

export function AssessmentWizard({ onComplete, onCancel, initialData }: AssessmentWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<AssessmentData>({
    ...INITIAL_DATA,
    ...initialData,
  });

  const totalSteps = 5;

  const updateData = useCallback((updates: Partial<AssessmentData>) => {
    setData(prev => ({
      ...prev,
      ...updates,
    }));
  }, []);

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    onComplete(data);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg max-w-2xl mx-auto">
      {/* Header */}
      <div className="border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Property Assessment
            </h2>
            <p className="text-sm text-gray-500">
              Step {currentStep} of {totalSteps}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Progress bar */}
        <div className="mt-4">
          <div className="bg-gray-200 rounded-full h-2">
            <div 
              className="bg-orange-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="p-6 min-h-[400px]">
        {currentStep === 1 && (
          <StructureFeaturesStep
            data={data.structureFeatures}
            onChange={(structureFeatures) => updateData({ structureFeatures })}
          />
        )}
        
        {currentStep === 2 && (
          <Zone0CurrentStep
            data={data.zone0Current}
            onChange={(zone0Current) => updateData({ zone0Current })}
          />
        )}
        
        {currentStep === 3 && (
          <Zone1CurrentStep
            data={data.zone1Current}
            onChange={(zone1Current) => updateData({ zone1Current })}
          />
        )}
        
        {currentStep === 4 && (
          <Zone2CurrentStep
            data={data.zone2Current}
            onChange={(zone2Current) => updateData({ zone2Current })}
          />
        )}
        
        {currentStep === 5 && (
          <PrioritiesStep
            data={data.priorities}
            onChange={(priorities) => updateData({ priorities })}
          />
        )}
      </div>

      {/* Navigation */}
      <div className="border-t px-6 py-4 flex items-center justify-between">
        <button
          onClick={prevStep}
          disabled={currentStep === 1}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </button>
        
        {currentStep === totalSteps ? (
          <button
            onClick={handleComplete}
            className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600"
          >
            Complete Assessment
          </button>
        ) : (
          <button
            onClick={nextStep}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

// Step Components (simplified for now - framework established)
function StructureFeaturesStep({ 
  data, 
  onChange 
}: { 
  data: AssessmentData['structureFeatures'];
  onChange: (data: AssessmentData['structureFeatures']) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <Home className="h-12 w-12 mx-auto text-orange-500 mb-3" />
        <h3 className="text-lg font-medium text-gray-900">Structure Features</h3>
        <p className="text-sm text-gray-500">Tell us about your building and any attachments</p>
      </div>
      
      <div className="text-center p-8 bg-gray-50 rounded-lg">
        <p className="text-gray-600">Assessment framework established</p>
        <p className="text-sm text-gray-500 mt-2">Individual step forms will be implemented in the next iteration</p>
        <p className="text-xs text-gray-400 mt-2">
          Will include: windows, attachments, roof type, siding material, vents/gaps
        </p>
      </div>
    </div>
  );
}

function Zone0CurrentStep({ 
  data, 
  onChange
}: { 
  data: AssessmentData['zone0Current'];
  onChange: (data: AssessmentData['zone0Current']) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <Shield className="h-12 w-12 mx-auto text-red-500 mb-3" />
        <h3 className="text-lg font-medium text-gray-900">Zone 0: Immediate Structure (0-5ft)</h3>
        <p className="text-sm text-gray-500">What's currently right around your building?</p>
      </div>
      
      <div className="text-center p-8 bg-gray-50 rounded-lg">
        <p className="text-gray-600">Zone 0 assessment framework established</p>
        <p className="text-sm text-gray-500 mt-2">Will include materials checklist, vegetation touching structure, and photo upload</p>
        <p className="text-xs text-gray-400 mt-2">
          Materials: bark mulch, gravel, concrete, plants, dead material visible
        </p>
      </div>
    </div>
  );
}

function Zone1CurrentStep({ 
  data, 
  onChange 
}: { 
  data: AssessmentData['zone1Current'];
  onChange: (data: AssessmentData['zone1Current']) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <Shield className="h-12 w-12 mx-auto text-orange-500 mb-3" />
        <h3 className="text-lg font-medium text-gray-900">Zone 1: Near Structure (5-30ft)</h3>
        <p className="text-sm text-gray-500">What vegetation do you currently have in your landscaping zone?</p>
      </div>
      
      <div className="text-center p-8 bg-gray-50 rounded-lg">
        <p className="text-gray-600">Zone 1 assessment framework established</p>
        <p className="text-sm text-gray-500 mt-2">Will include vegetation types, plant connectivity, and maintenance levels</p>
        <p className="text-xs text-gray-400 mt-2">
          Vegetation: lawn, shrubs, trees, garden beds, connectivity, irrigation, maintenance
        </p>
      </div>
    </div>
  );
}

function Zone2CurrentStep({ 
  data, 
  onChange 
}: { 
  data: AssessmentData['zone2Current'];
  onChange: (data: AssessmentData['zone2Current']) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <TreePine className="h-12 w-12 mx-auto text-green-500 mb-3" />
        <h3 className="text-lg font-medium text-gray-900">Zone 2: Surrounding Area (30-100ft)</h3>
        <p className="text-sm text-gray-500">What's in your wider property area and beyond?</p>
      </div>
      
      <div className="text-center p-8 bg-gray-50 rounded-lg">
        <p className="text-gray-600">Zone 2 assessment framework established</p>
        <p className="text-sm text-gray-500 mt-2">Will include tree spacing, limbing, brush accumulation, and defensible space rating</p>
        <p className="text-xs text-gray-400 mt-2">
          Trees: types, spacing, limbing up, brush/dead material, defensible space rating
        </p>
      </div>
    </div>
  );
}

function PrioritiesStep({ 
  data, 
  onChange 
}: { 
  data: AssessmentData['priorities'];
  onChange: (data: AssessmentData['priorities']) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <Target className="h-12 w-12 mx-auto text-purple-500 mb-3" />
        <h3 className="text-lg font-medium text-gray-900">Your Priorities</h3>
        <p className="text-sm text-gray-500">Help us understand what matters most to you</p>
      </div>
      
      <div className="text-center p-8 bg-gray-50 rounded-lg">
        <p className="text-gray-600">Priorities assessment framework established</p>
        <p className="text-sm text-gray-500 mt-2">Will include budget range, labor approach, timeline, and priority selection</p>
        <p className="text-xs text-gray-400 mt-2">
          Priorities: fire safety, beauty, low water, wildlife, maintenance; budget, labor, timeline
        </p>
      </div>
    </div>
  );
}