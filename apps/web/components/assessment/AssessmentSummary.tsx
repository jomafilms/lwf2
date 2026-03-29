"use client";

import { ArrowRight, CheckCircle } from "lucide-react";
import { AssessmentData } from "./types";

interface AssessmentSummaryProps {
  assessment: AssessmentData;
  onStartPlan: () => void;
}

export function AssessmentSummary({ assessment, onStartPlan }: AssessmentSummaryProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Overall Assessment Complete */}
      <div className="bg-white rounded-xl border shadow-sm p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-green-100 rounded-full">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Assessment Complete!
            </h2>
            <p className="text-gray-600 mb-4">
              Thank you for completing your property assessment. Based on your responses, 
              we'll be able to provide more targeted recommendations for your fire-safe landscaping plan.
            </p>
          </div>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-4 mt-4">
          <h3 className="font-medium text-blue-900 mb-2">Next Steps</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Your assessment has been saved to your property</li>
            <li>• Use the chat panel to get personalized plant recommendations</li>
            <li>• Create your custom landscaping plan based on this assessment</li>
            <li>• Get specific recommendations for each fire zone</li>
          </ul>
        </div>
      </div>

      {/* Assessment Overview */}
      <div className="bg-white rounded-xl border shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Assessment Overview
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Structure Assessment</h4>
            <p className="text-sm text-gray-600">
              Building features, materials, and attachments evaluated for fire resistance.
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Zone Evaluation</h4>
            <p className="text-sm text-gray-600">
              Current vegetation and materials assessed across all three fire zones (0-5ft, 5-30ft, 30-100ft).
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Priority Setting</h4>
            <p className="text-sm text-gray-600">
              Your preferences for budget, timeline, and landscaping priorities captured.
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">AI Integration</h4>
            <p className="text-sm text-gray-600">
              Assessment data will inform personalized recommendations from the plant advisor.
            </p>
          </div>
        </div>
      </div>

      {/* Start Plan CTA */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-2">Ready to Start Your Plan?</h2>
            <p className="text-orange-100">
              Your assessment will guide personalized plant recommendations and fire-safe landscaping strategies tailored to your specific property.
            </p>
          </div>
          <button
            onClick={onStartPlan}
            className="flex items-center gap-2 bg-white text-orange-600 px-6 py-3 rounded-lg font-medium hover:bg-orange-50 transition-colors whitespace-nowrap"
          >
            Start Your Plan
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}