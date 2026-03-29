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
              Thank you for completing your property assessment. Your responses will help provide 
              targeted recommendations for your fire-safe landscaping plan.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-2">Ready to Start Your Plan?</h2>
            <p className="text-orange-100">
              Your assessment data will guide personalized plant recommendations and fire-safe landscaping strategies.
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