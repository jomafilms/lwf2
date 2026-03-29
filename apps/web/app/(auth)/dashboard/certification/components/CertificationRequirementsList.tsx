/**
 * CertificationRequirementsList Component
 * 
 * Displays all certification requirements organized by category
 * with met/unmet status, progress tracking, and cost estimates.
 */

'use client';

import { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  DollarSign,
  ChevronDown,
  ChevronRight,
  Home,
  Wrench,
  Eye,
  Leaf,
  RefreshCw
} from 'lucide-react';
import { CATEGORY_NAMES, CATEGORY_DESCRIPTIONS, calculateRemainingCost } from '../../../../../lib/certification/requirements';
import type { CertificationRequirement } from '../../../../../lib/certification/requirements';
import type { RequirementStatus } from '../../../../../lib/certification/types';

interface CertificationData {
  requirements: Array<CertificationRequirement & { status: RequirementStatus }>;
  requirementsByCategory: Record<string, Array<CertificationRequirement & { status: RequirementStatus }>>;
  summary: {
    totalRequirements: number;
    metRequirements: number;
    progressPercentage: number;
    estimatedRemainingCost: { min: number; max: number };
    eligible: boolean;
    insuranceImpact: 'high' | 'medium' | 'low';
  };
  planInfo: {
    planId?: string;
    planName?: string;
    totalPlants: number;
    plantsByZone: { zone0: number; zone1: number; zone2: number };
  } | null;
}

interface Props {
  propertyId: string;
}

const categoryIcons: Record<string, any> = {
  roof: Home,
  walls: Home,
  windows: Eye,
  zone0: AlertCircle,
  zone1: Leaf,
  zone2: Leaf,
  maintenance: RefreshCw
};

export function CertificationRequirementsList({ propertyId }: Props) {
  const [data, setData] = useState<CertificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['zone0'])); // Zone 0 expanded by default

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await fetch(`/api/certification/${propertyId}`);
        
        if (!response.ok) {
          throw new Error('Failed to load certification data');
        }
        
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [propertyId]);

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <div className="text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-red-500" />
          <p className="mt-2 text-sm font-medium text-gray-900">Error loading data</p>
          <p className="mt-1 text-xs text-gray-500">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-gray-100 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { summary, requirementsByCategory, planInfo } = data;
  const progressColor = summary.progressPercentage >= 80 ? 'text-green-600' : 
                       summary.progressPercentage >= 60 ? 'text-orange-600' : 'text-red-600';
  const progressBgColor = summary.progressPercentage >= 80 ? 'bg-green-100' : 
                         summary.progressPercentage >= 60 ? 'bg-orange-100' : 'bg-red-100';

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Certification Progress
          </h2>
          <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${progressBgColor} ${progressColor}`}>
            {summary.progressPercentage}% Complete
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
          <div 
            className={`h-3 rounded-full transition-all duration-300 ${
              summary.progressPercentage >= 80 ? 'bg-green-500' : 
              summary.progressPercentage >= 60 ? 'bg-orange-500' : 'bg-red-500'
            }`}
            style={{ width: `${summary.progressPercentage}%` }}
          ></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Requirements Met</span>
            <p className="text-lg font-semibold text-gray-900">
              {summary.metRequirements} / {summary.totalRequirements}
            </p>
          </div>
          <div>
            <span className="text-gray-500">Estimated Remaining Cost</span>
            <p className="text-lg font-semibold text-gray-900">
              ${summary.estimatedRemainingCost.min.toLocaleString()} - ${summary.estimatedRemainingCost.max.toLocaleString()}
            </p>
          </div>
          <div>
            <span className="text-gray-500">Insurance Impact</span>
            <p className={`text-lg font-semibold capitalize ${
              summary.insuranceImpact === 'high' ? 'text-green-600' :
              summary.insuranceImpact === 'medium' ? 'text-orange-600' : 'text-red-600'
            }`}>
              {summary.insuranceImpact}
            </p>
          </div>
        </div>

        {summary.eligible && (
          <div className="mt-4 rounded-lg bg-green-50 p-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-900">Eligible for Certification</span>
            </div>
            <p className="mt-1 text-sm text-green-800">
              Your property meets the requirements for Wildfire Prepared Home certification.
            </p>
          </div>
        )}

        {planInfo && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-gray-600">
              Based on {planInfo.totalPlants} plants in your landscape plan: {' '}
              {planInfo.plantsByZone.zone0} in Zone 0, {planInfo.plantsByZone.zone1} in Zone 1, {planInfo.plantsByZone.zone2} in Zone 2
            </p>
          </div>
        )}
      </div>

      {/* Requirements by Category */}
      <div className="bg-white rounded-lg border">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Certification Requirements
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Track your progress across all Wildfire Prepared Home requirements
          </p>
        </div>

        <div className="divide-y">
          {Object.entries(requirementsByCategory).map(([category, requirements]) => {
            const CategoryIcon = categoryIcons[category] || Home;
            const isExpanded = expandedCategories.has(category);
            const metCount = requirements.filter(r => r.status.met).length;
            const totalCount = requirements.length;
            const categoryProgress = Math.round((metCount / totalCount) * 100);

            return (
              <div key={category}>
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <CategoryIcon className="h-6 w-6 text-orange-500" />
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900">
                        {CATEGORY_NAMES[category as keyof typeof CATEGORY_NAMES]}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {CATEGORY_DESCRIPTIONS[category as keyof typeof CATEGORY_DESCRIPTIONS]}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">
                      {metCount}/{totalCount} complete
                    </span>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      categoryProgress === 100 ? 'bg-green-100 text-green-800' :
                      categoryProgress >= 50 ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {categoryProgress}%
                    </span>
                    {isExpanded ? (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </button>

                {/* Category Requirements */}
                {isExpanded && (
                  <div className="px-6 pb-6">
                    <div className="ml-10 space-y-4">
                      {requirements.map((requirement) => {
                        const { status } = requirement;
                        const StatusIcon = status.met ? CheckCircle : Clock;
                        const statusColor = status.met ? 'text-green-600' : 'text-orange-600';
                        const statusBg = status.met ? 'bg-green-50' : 'bg-orange-50';

                        return (
                          <div key={requirement.id} className={`rounded-lg border p-4 ${statusBg}`}>
                            <div className="flex items-start gap-3">
                              <StatusIcon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${statusColor}`} />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h4 className="font-medium text-gray-900">
                                      {requirement.title}
                                    </h4>
                                    <p className="mt-1 text-sm text-gray-700">
                                      {requirement.description}
                                    </p>
                                  </div>
                                  <div className="ml-4 flex-shrink-0 text-right">
                                    <div className="flex items-center gap-1 text-sm text-gray-600">
                                      <DollarSign className="h-4 w-4" />
                                      {requirement.estimatedCost.min === requirement.estimatedCost.max 
                                        ? `$${requirement.estimatedCost.min.toLocaleString()}`
                                        : `$${requirement.estimatedCost.min.toLocaleString()} - $${requirement.estimatedCost.max.toLocaleString()}`
                                      }
                                    </div>
                                    <div className="mt-1">
                                      {requirement.diy ? (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                                          <Wrench className="h-3 w-3" />
                                          DIY Friendly
                                        </span>
                                      ) : (
                                        <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">
                                          Professional
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="mt-3 p-3 bg-white rounded border">
                                  <p className="text-sm font-medium text-gray-900">How to Meet This Requirement:</p>
                                  <p className="mt-1 text-sm text-gray-700">{requirement.howToMeet}</p>
                                </div>

                                {status.notes && (
                                  <div className="mt-3 p-3 bg-gray-50 rounded">
                                    <p className="text-sm">
                                      <span className="font-medium text-gray-900">Status: </span>
                                      {status.notes}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}