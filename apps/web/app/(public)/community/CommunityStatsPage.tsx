"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Shield, 
  TrendingUp, 
  Users, 
  ArrowRight,
  Target,
  MapPin,
  Flame,
  TreePine,
} from "lucide-react";
import { ProgressBar } from "@/components/charts/ProgressBar";
import { DonutChart } from "@/components/charts/DonutChart";
import { BarChart } from "@/components/charts/BarChart";
import { SCORE_COLORS, CHART_COLORS } from "@/lib/design-tokens";

interface CommunityStats {
  community: {
    totalProperties: number;
    propertiesAssessed: number;
    averageScore: number | null;
    assessmentProgress: number;
    progressTowardGoal: number;
    targetCoverage: number;
  };
  scoreDistribution: Array<{
    tier: string;
    count: number;
  }>;
  monthlyProgress: Array<{
    month: string;
    count: number;
    monthLabel: string;
  }>;
  lastUpdated: string;
}

const tierColors = {
  compliant: SCORE_COLORS.high.hex, // green
  "needs-work": SCORE_COLORS.medium.hex, // yellow
  "non-compliant": SCORE_COLORS.low.hex, // red
  unassessed: CHART_COLORS.muted, // gray (keeping this as a fallback since it's not part of scoring)
};

const tierLabels = {
  compliant: "Fire-Safe",
  "needs-work": "Improving", 
  "non-compliant": "Needs Work",
  unassessed: "Not Yet Assessed",
};

export function CommunityStatsPage() {
  const [stats, setStats] = useState<CommunityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("/api/community/stats");
        if (!response.ok) {
          throw new Error("Failed to fetch community stats");
        }
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="animate-pulse space-y-8">
            <div className="h-12 bg-gray-200 rounded w-96 mx-auto"></div>
            <div className="grid gap-6 sm:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-900 mb-2">Unable to Load Community Stats</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const scoreDistributionData = stats.scoreDistribution
    .filter(item => item.count > 0)
    .map(item => ({
      label: tierLabels[item.tier as keyof typeof tierLabels] || item.tier,
      value: item.count,
      color: tierColors[item.tier as keyof typeof tierColors] || CHART_COLORS.muted,
    }));

  const monthlyData = stats.monthlyProgress.slice(-12).map(item => ({
    label: item.monthLabel.split(' ')[0], // Short month names for better mobile display
    value: item.count,
    color: SCORE_COLORS.high.hex, // green
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
            <TreePine className="h-4 w-4" />
            Back to FireScape
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="text-center mb-16">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-green-100 p-3">
              <Flame className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Ashland Community Fire Safety Progress
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-2">
            Our community is working together toward 90% wildfire risk reduction coverage. 
            Track our collective progress and join the effort.
          </p>
          <p className="text-sm text-gray-500">
            Updated {new Date(stats.lastUpdated).toLocaleDateString()}
          </p>
        </div>

        {/* Key Stats */}
        <div className="mb-16 grid gap-8 sm:grid-cols-3">
          {/* Progress Toward Goal */}
          <div className="rounded-xl bg-white p-8 shadow-sm text-center">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-blue-100 p-3">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {stats.community.progressTowardGoal}%
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1">Toward 90% Goal</p>
            <p className="text-xs text-gray-500">
              {stats.community.propertiesAssessed} of {stats.community.targetCoverage} properties assessed
            </p>
          </div>

          {/* Total Properties */}
          <div className="rounded-xl bg-white p-8 shadow-sm text-center">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-green-100 p-3">
                <MapPin className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-green-600 mb-2">
              {stats.community.totalProperties}
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1">Total Properties</p>
            <p className="text-xs text-gray-500">
              {stats.community.assessmentProgress}% have been assessed
            </p>
          </div>

          {/* Average Score */}
          <div className="rounded-xl bg-white p-8 shadow-sm text-center">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-yellow-100 p-3">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-yellow-600 mb-2">
              {stats.community.averageScore ? `${stats.community.averageScore}%` : "—"}
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1">Average Score</p>
            <p className="text-xs text-gray-500">
              Fire-safety compliance rating
            </p>
          </div>
        </div>

        {/* Main Progress Bar */}
        <div className="mb-16 rounded-xl bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Community Progress Toward Fire Safety
          </h2>
          <ProgressBar
            value={stats.community.propertiesAssessed}
            max={stats.community.targetCoverage}
            label="Properties with fire-safe landscaping plans"
            color="green"
            size="lg"
            className="mb-6"
          />
          
          <div className="grid gap-4 sm:grid-cols-2 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Target for 90% coverage:</span>
                <span className="font-semibold">{stats.community.targetCoverage} properties</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Currently assessed:</span>
                <span className="font-semibold text-green-600">{stats.community.propertiesAssessed} properties</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Remaining to reach goal:</span>
                <span className="font-semibold text-orange-600">
                  {Math.max(0, stats.community.targetCoverage - stats.community.propertiesAssessed)} properties
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Estimated timeline:</span>
                <span className="font-semibold">10 years (CWPP goal)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="mb-16 grid gap-8 lg:grid-cols-2">
          {/* Assessment Progress */}
          <div className="rounded-xl bg-white p-8 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Monthly Assessment Progress
            </h3>
            {monthlyData.length > 0 ? (
              <BarChart
                data={monthlyData}
                height={200}
                className="mt-4"
              />
            ) : (
              <div className="flex h-48 items-center justify-center text-gray-500">
                Assessment tracking coming soon
              </div>
            )}
            <p className="mt-4 text-sm text-gray-600 text-center">
              Properties receiving fire-safety assessments each month
            </p>
          </div>

          {/* Score Distribution */}
          <div className="rounded-xl bg-white p-8 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Fire Safety Status
            </h3>
            {scoreDistributionData.length > 0 ? (
              <DonutChart
                data={scoreDistributionData}
                size={200}
                centerText="Properties"
                showLegend={false}
              />
            ) : (
              <div className="flex h-48 items-center justify-center text-gray-500">
                No assessments completed yet
              </div>
            )}
            {scoreDistributionData.length > 0 && (
              <div className="mt-6 grid gap-2 text-sm">
                {scoreDistributionData.map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-gray-700">{item.label}</span>
                    </div>
                    <span className="font-semibold">{item.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Call to Action */}
        <div className="rounded-xl bg-gradient-to-r from-green-600 to-blue-600 p-8 text-white text-center">
          <div className="mb-4 flex justify-center">
            <Users className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold mb-4">
            Join the Community Effort
          </h2>
          <p className="text-lg mb-6 max-w-2xl mx-auto">
            Every property assessment brings us closer to our goal. Get started with your 
            fire-safe landscaping plan and become part of the solution.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-semibold text-green-600 hover:bg-gray-50 transition-colors"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/plants"
              className="inline-flex items-center gap-2 rounded-lg border border-white px-6 py-3 font-semibold text-white hover:bg-white/10 transition-colors"
            >
              Browse Fire-Safe Plants
            </Link>
          </div>
        </div>

        {/* Community Context */}
        <div className="mt-16 rounded-xl bg-white p-8 shadow-sm">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            About This Initiative
          </h3>
          <div className="grid gap-6 md:grid-cols-2 text-sm text-gray-600">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Community Wildfire Protection Plan (CWPP)</h4>
              <p>
                Ashland's CWPP sets a goal of 90% wildfire risk reduction coverage across our community 
                within 10 years. This initiative is community-driven and focuses on creating fire-safe 
                landscaping around homes and properties.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">How You Can Help</h4>
              <ul className="space-y-1">
                <li>• Assess your property for fire risks</li>
                <li>• Create a fire-safe landscaping plan</li>
                <li>• Share resources with neighbors</li>
                <li>• Support community initiatives</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}