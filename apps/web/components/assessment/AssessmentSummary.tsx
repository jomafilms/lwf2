"use client";

import { ArrowRight } from "lucide-react";
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
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Assessment Complete!
        </h2>
        <p className="text-gray-600 mb-4">
          Thank you for completing your property assessment. Based on your responses, 
          we'll be able to provide more targeted recommendations for your fire-safe landscaping plan.
        </p>
        
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">Next Steps</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Your assessment has been saved to your property</li>
            <li>• Use the chat panel to get personalized plant recommendations</li>
            <li>• Create your custom landscaping plan</li>
          </ul>
        </div>
      </div>

      {/* Start Plan CTA */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-2">Ready to Start Your Plan?</h2>
            <p className="text-orange-100">
              We'll use your assessment to recommend specific plants and create a customized fire-safe landscaping plan.
            </p>
          </div>
          <button
            onClick={onStartPlan}
            className="flex items-center gap-2 bg-white text-orange-600 px-6 py-3 rounded-lg font-medium hover:bg-orange-50 transition-colors"
          >
            Start Your Plan
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}