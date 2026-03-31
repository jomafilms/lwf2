"use client";

import { Shield, Target, DollarSign, Clock, TrendingUp } from "lucide-react";
import type { HardeningCategoryData, Priority } from "@/app/hardening/page";

interface HardeningSummaryProps {
  totalItems: number;
  completedItems: number;
  categories: HardeningCategoryData[];
}

export function HardeningSummary({ totalItems, completedItems, categories }: HardeningSummaryProps) {
  const completionPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  // Calculate hardening score based on priority weighting
  const getHardeningScore = () => {
    let totalWeight = 0;
    let completedWeight = 0;

    categories.forEach(category => {
      category.items.forEach(item => {
        const weight = item.priority === "critical" ? 3 : item.priority === "important" ? 2 : 1;
        totalWeight += weight;
        if (item.completed) {
          completedWeight += weight;
        }
      });
    });

    return totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0;
  };

  // Categorize remaining items by priority
  const getRemainingByPriority = () => {
    const remaining: Record<Priority, number> = {
      critical: 0,
      important: 0,
      "nice-to-have": 0,
    };

    categories.forEach(category => {
      category.items.forEach(item => {
        if (!item.completed) {
          remaining[item.priority]++;
        }
      });
    });

    return remaining;
  };

  // Estimate total cost of remaining items
  const getEstimatedCost = () => {
    const costRanges = { $: 250, $$: 1250, $$$: 5000 }; // Mid-point estimates
    let totalCost = 0;

    categories.forEach(category => {
      category.items.forEach(item => {
        if (!item.completed) {
          totalCost += costRanges[item.cost];
        }
      });
    });

    return totalCost;
  };

  const hardeningScore = getHardeningScore();
  const remaining = getRemainingByPriority();
  const estimatedCost = getEstimatedCost();

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-amber-600";
    return "text-red-600";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-6">
      {/* Main Progress Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-4">
            {/* Progress circle */}
            <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="#f3f4f6"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                strokeLinecap="round"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - completionPercentage / 100)}`}
                className={getScoreColor(hardeningScore)}
                style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-xl font-bold ${getScoreColor(hardeningScore)}`}>
                {Math.round(completionPercentage)}%
              </span>
            </div>
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Hardening Progress
          </h3>
          <p className="text-sm text-gray-500">
            {completedItems} of {totalItems} items completed
          </p>
        </div>

        {/* Progress bar */}
        <div className="mt-4 w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ${getScoreBgColor(hardeningScore)}`}
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Hardening Score */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-3">
          <Shield className={`h-5 w-5 ${getScoreColor(hardeningScore)}`} />
          <h3 className="font-semibold text-gray-900">Hardening Score</h3>
        </div>
        
        <div className="text-center">
          <div className={`text-3xl font-bold ${getScoreColor(hardeningScore)} mb-1`}>
            {hardeningScore}
          </div>
          <p className="text-sm text-gray-500">
            {hardeningScore >= 80 
              ? "Excellent fire resistance"
              : hardeningScore >= 60
              ? "Good fire resistance" 
              : "Needs improvement"
            }
          </p>
        </div>

        <div className="mt-4 text-xs text-gray-400">
          * Score weighted by priority: Critical items count 3x, Important 2x
        </div>
      </div>

      {/* Remaining by Priority */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Target className="h-5 w-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Remaining Items</h3>
        </div>
        
        <div className="space-y-3">
          {remaining.critical > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-red-500 text-sm">🔴</span>
                <span className="text-sm text-gray-700">Critical</span>
              </div>
              <span className="text-sm font-medium text-red-600">
                {remaining.critical}
              </span>
            </div>
          )}
          
          {remaining.important > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-amber-500 text-sm">🟡</span>
                <span className="text-sm text-gray-700">Important</span>
              </div>
              <span className="text-sm font-medium text-amber-600">
                {remaining.important}
              </span>
            </div>
          )}
          
          {remaining["nice-to-have"] > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-green-500 text-sm">🟢</span>
                <span className="text-sm text-gray-700">Nice-to-have</span>
              </div>
              <span className="text-sm font-medium text-green-600">
                {remaining["nice-to-have"]}
              </span>
            </div>
          )}
          
          {completedItems === totalItems && (
            <div className="text-center py-4">
              <div className="text-green-600 text-2xl mb-2">🎉</div>
              <p className="text-sm font-medium text-green-700">
                All items completed!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Cost Estimate */}
      {estimatedCost > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <DollarSign className="h-5 w-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Cost Estimate</h3>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 mb-1">
              ${estimatedCost.toLocaleString()}
            </div>
            <p className="text-sm text-gray-500">
              Estimated for remaining items
            </p>
          </div>
          
          <div className="mt-4 text-xs text-gray-400">
            * Rough estimates: $ = $250, $$ = $1,250, $$$ = $5,000
          </div>
        </div>
      )}

      {/* Next Steps */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
        <div className="flex items-center gap-3 mb-3">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Next Steps</h3>
        </div>
        
        <div className="space-y-2 text-sm text-gray-700">
          {remaining.critical > 0 ? (
            <p>Focus on <strong className="text-red-600">critical</strong> items first for maximum fire protection.</p>
          ) : remaining.important > 0 ? (
            <p>Work on <strong className="text-amber-600">important</strong> items to improve your hardening score.</p>
          ) : remaining["nice-to-have"] > 0 ? (
            <p>Complete the remaining <strong className="text-green-600">nice-to-have</strong> items when budget allows.</p>
          ) : (
            <p>🎉 <strong>Congratulations!</strong> Your home has excellent structural fire resistance.</p>
          )}
          
          {hardeningScore < 60 && (
            <p className="mt-2 text-amber-700">
              Consider consulting with a fire-safety professional for guidance.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}