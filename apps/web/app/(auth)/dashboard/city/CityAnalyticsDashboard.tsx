"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Shield, 
  TrendingUp, 
  Users, 
  FileText,
  Download,
  Calendar,
  Target,
  MapPin,
} from "lucide-react";
import { ProgressBar } from "@/components/charts/ProgressBar";
import { DonutChart } from "@/components/charts/DonutChart";
import { BarChart } from "@/components/charts/BarChart";
import { CHART_COLORS, SCORE_COLORS } from "@/lib/design-tokens";

interface CityStats {
  overview: {
    totalProperties: number;
    totalPlans: number;
    propertiesAssessed: number;
    averageScore: number | null;
    assessmentProgress: number;
    targetCoverage: number;
    progressTowardGoal: number;
  };
  scoreDistribution: Array<{
    tier: string;
    count: number;
  }>;
  timeSeries: Array<{
    month: string;
    count: number;
    monthLabel: string;
  }>;
  roleStats: Array<{
    role: string;
    count: number;
  }>;
  lastUpdated: string;
}

const tierColors = {
  compliant: SCORE_COLORS.high.hex, // green
  "needs-work": SCORE_COLORS.medium.hex, // yellow
  "non-compliant": SCORE_COLORS.low.hex, // red
  unassessed: CHART_COLORS.muted, // gray
};

const tierLabels = {
  compliant: "Compliant (80%+)",
  "needs-work": "Needs Work (50-79%)",
  "non-compliant": "Non-Compliant (<50%)",
  unassessed: "Unassessed",
};

const roleLabels = {
  homeowner: "Homeowners",
  landscaper: "Landscapers",
  nursery_admin: "Nursery Admins",
  city_admin: "City Admins",
  platform_admin: "Platform Admins",
};

export function CityAnalyticsDashboard() {
  const [stats, setStats] = useState<CityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("/api/city/stats");
        if (!response.ok) {
          throw new Error("Failed to fetch stats");
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

  const handleExport = async () => {
    try {
      setExporting(true);
      const response = await fetch("/api/city/export");
      if (!response.ok) {
        throw new Error("Export failed");
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ashland-wildfire-progress-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export error:", err);
      alert("Export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-64"></div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-900 mb-2">Error Loading Dashboard</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const scoreDistributionData = stats.scoreDistribution.map(item => ({
    label: tierLabels[item.tier as keyof typeof tierLabels] || item.tier,
    value: item.count,
    color: tierColors[item.tier as keyof typeof tierColors] || CHART_COLORS.muted,
  }));

  const timeSeriesData = stats.timeSeries.slice(-12).map(item => ({
    label: item.monthLabel,
    value: item.count,
    color: CHART_COLORS.primary,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-3">
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">
            ← Back to Dashboard
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">City Analytics Dashboard</h1>
              <p className="mt-1 text-sm text-gray-600">
                Community wildfire readiness progress tracking
              </p>
            </div>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
            >
              <Download className="h-4 w-4" />
              {exporting ? "Exporting..." : "Export CSV"}
            </button>
          </div>
          
          <p className="mt-2 text-xs text-gray-500">
            Last updated: {new Date(stats.lastUpdated).toLocaleString()}
          </p>
        </div>

        {/* Overview Stats */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Properties */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-blue-100 p-2">
                <MapPin className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Properties</p>
                <p className="text-2xl font-bold text-gray-900">{stats.overview.totalProperties}</p>
              </div>
            </div>
          </div>

          {/* Properties Assessed */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-green-100 p-2">
                <Shield className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Properties Assessed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.overview.propertiesAssessed}</p>
                <p className="text-xs text-gray-500">{stats.overview.assessmentProgress}% of total</p>
              </div>
            </div>
          </div>

          {/* Average Score */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-yellow-100 p-2">
                <TrendingUp className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.overview.averageScore ? `${stats.overview.averageScore}%` : "—"}
                </p>
                <p className="text-xs text-gray-500">Compliance scoring</p>
              </div>
            </div>
          </div>

          {/* Total Plans */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-purple-100 p-2">
                <FileText className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Plans Created</p>
                <p className="text-2xl font-bold text-gray-900">{stats.overview.totalPlans}</p>
                <p className="text-xs text-gray-500">Landscaping plans</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Progress Section */}
        <div className="mb-8 rounded-lg bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Progress Toward 90% Community Goal
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              CWPP target: 90% risk reduction coverage in 10 years
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <ProgressBar
                value={stats.overview.propertiesAssessed}
                max={stats.overview.targetCoverage}
                label={`${stats.overview.propertiesAssessed} of ${stats.overview.targetCoverage} properties assessed`}
                color="green"
                size="lg"
                showPercentage={false}
              />
              <p className="mt-2 text-sm text-gray-600">
                <span className="font-semibold text-green-600">
                  {stats.overview.progressTowardGoal}%
                </span>{" "}
                toward 90% goal
              </p>
            </div>
            
            <div className="text-sm text-gray-600 space-y-2">
              <div className="flex justify-between">
                <span>Total properties:</span>
                <span className="font-semibold">{stats.overview.totalProperties}</span>
              </div>
              <div className="flex justify-between">
                <span>Target (90%):</span>
                <span className="font-semibold">{stats.overview.targetCoverage}</span>
              </div>
              <div className="flex justify-between">
                <span>Remaining needed:</span>
                <span className="font-semibold text-orange-600">
                  {Math.max(0, stats.overview.targetCoverage - stats.overview.propertiesAssessed)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          {/* Score Distribution */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Compliance Score Distribution
            </h3>
            {scoreDistributionData.some(d => d.value > 0) ? (
              <DonutChart
                data={scoreDistributionData}
                size={240}
                centerText={`${stats.overview.propertiesAssessed} assessed`}
              />
            ) : (
              <div className="flex h-64 items-center justify-center text-gray-500">
                No assessments yet
              </div>
            )}
          </div>

          {/* Assessment Timeline */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Properties Assessed Over Time
            </h3>
            {timeSeriesData.length > 0 ? (
              <BarChart
                data={timeSeriesData}
                height={240}
                className="mt-4"
              />
            ) : (
              <div className="flex h-64 items-center justify-center text-gray-500">
                No assessment data yet
              </div>
            )}
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* User Roles */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Platform Users by Role
            </h3>
            <div className="space-y-3">
              {stats.roleStats.map((role) => (
                <div key={role.role} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {roleLabels[role.role as keyof typeof roleLabels] || role.role}
                  </span>
                  <span className="font-semibold text-gray-900">{role.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Key Metrics */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Key Context
            </h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div>
                <span className="font-semibold">City Population:</span> ~21,000
              </div>
              <div>
                <span className="font-semibold">Wildfire Zone:</span> Entire city declared wildfire hazard zone
              </div>
              <div>
                <span className="font-semibold">Estimated Liability:</span> $60M to achieve full community compliance
              </div>
              <div>
                <span className="font-semibold">Current Funding:</span> $7/month utility fee
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Use Case:</strong> This data is designed for city council presentations, 
                grant applications, and bond market discussions.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}