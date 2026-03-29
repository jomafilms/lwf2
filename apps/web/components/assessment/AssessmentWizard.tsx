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
      <div className="p-6 min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="mb-6">
            {currentStep === 1 && <Home className="h-16 w-16 mx-auto text-orange-500" />}
            {currentStep === 2 && <Shield className="h-16 w-16 mx-auto text-red-500" />}
            {currentStep === 3 && <Shield className="h-16 w-16 mx-auto text-orange-500" />}
            {currentStep === 4 && <TreePine className="h-16 w-16 mx-auto text-green-500" />}
            {currentStep === 5 && <Target className="h-16 w-16 mx-auto text-purple-500" />}
          </div>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            {currentStep === 1 && "Structure Features"}
            {currentStep === 2 && "Zone 0: Immediate Structure (0-5ft)"}
            {currentStep === 3 && "Zone 1: Near Structure (5-30ft)"}
            {currentStep === 4 && "Zone 2: Surrounding Area (30-100ft)"}
            {currentStep === 5 && "Your Priorities"}
          </h3>
          
          <div className="bg-blue-50 rounded-lg p-6 max-w-md mx-auto">
            <p className="font-medium text-blue-900 mb-2">Assessment Framework Complete</p>
            <p className="text-sm text-blue-700">
              The guided property assessment structure has been implemented. 
              Individual step forms with detailed questions will be built in the next iteration.
            </p>
          </div>
        </div>
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