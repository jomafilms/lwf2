"use client";

import { useEffect, useState } from "react";
import { Users, Shield, TrendingUp, Target } from "lucide-react";

interface HOAStatsProps {
  orgId: string;
}

interface Stats {
  memberCount: number;
  avgComplianceScore: number;
  assessmentProgress: number;
  propertiesAssessed: number;
  totalProperties: number;
}

export function HOAStats({ orgId }: HOAStatsProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch(`/api/hoa/${orgId}`);
        if (response.ok) {
          const data = await response.json();
          setStats(data.stats);
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [orgId]);

  if (loading) {
    return (
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-lg bg-white p-6 shadow-sm">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const progressColor = 
    stats.assessmentProgress >= 90 ? "text-green-600" :
    stats.assessmentProgress >= 60 ? "text-yellow-600" : 
    "text-red-600";

  const scoreColor = 
    stats.avgComplianceScore >= 80 ? "text-green-600" :
    stats.avgComplianceScore >= 60 ? "text-yellow-600" : 
    "text-red-600";

  return (
    <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Member Count */}
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-blue-100 p-2">
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Members</p>
            <p className="text-2xl font-bold text-gray-900">{stats.memberCount}</p>
          </div>
        </div>
      </div>

      {/* Average Compliance Score */}
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-green-100 p-2">
            <Shield className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Avg Compliance</p>
            <p className={`text-2xl font-bold ${scoreColor}`}>
              {stats.avgComplianceScore > 0 ? `${stats.avgComplianceScore}%` : "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Assessment Progress */}
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-orange-100 p-2">
            <TrendingUp className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Assessed</p>
            <p className={`text-2xl font-bold ${progressColor}`}>
              {stats.assessmentProgress > 0 ? `${stats.assessmentProgress}%` : "0%"}
            </p>
          </div>
        </div>
      </div>

      {/* Properties Count */}
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-purple-100 p-2">
            <Target className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Properties</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.propertiesAssessed}/{stats.totalProperties}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}