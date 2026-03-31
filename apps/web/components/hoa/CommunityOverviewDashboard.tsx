"use client";

import { useState } from "react";
import { 
  Users, 
  MapPin, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp,
  Building,
  Shield,
  Percent
} from "lucide-react";

interface CommunityData {
  name: string;
  totalProperties: number;
  propertiesAssessed: number;
  avgComplianceScore: number;
  zoneBreakdown: {
    zone1: { total: number; assessed: number; compliant: number };
    zone2: { total: number; assessed: number; compliant: number };
    zone3: { total: number; assessed: number; compliant: number };
  };
}

export function CommunityOverviewDashboard() {
  const [communityName, setCommunityName] = useState("");
  const [totalProperties, setTotalProperties] = useState<number | "">("");
  const [showResults, setShowResults] = useState(false);

  // Mock data based on user inputs
  const generateMockData = (): CommunityData => {
    const assessed = Math.floor((totalProperties as number) * 0.35); // 35% assessed
    const avgScore = 72; // Mock average compliance score
    
    const total = totalProperties as number;
    const zone1Properties = Math.floor(total * 0.4);
    const zone2Properties = Math.floor(total * 0.35);
    const zone3Properties = total - zone1Properties - zone2Properties;
    
    return {
      name: communityName,
      totalProperties: total,
      propertiesAssessed: assessed,
      avgComplianceScore: avgScore,
      zoneBreakdown: {
        zone1: {
          total: zone1Properties,
          assessed: Math.floor(zone1Properties * 0.4),
          compliant: Math.floor(zone1Properties * 0.28)
        },
        zone2: {
          total: zone2Properties,
          assessed: Math.floor(zone2Properties * 0.3),
          compliant: Math.floor(zone2Properties * 0.18)
        },
        zone3: {
          total: zone3Properties,
          assessed: Math.floor(zone3Properties * 0.25),
          compliant: Math.floor(zone3Properties * 0.15)
        }
      }
    };
  };

  const handleGenerateReport = () => {
    if (communityName && totalProperties) {
      setShowResults(true);
    }
  };

  const mockData = showResults ? generateMockData() : null;

  return (
    <div className="space-y-8">
      {/* Setup Form */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Community Setup
        </h2>
        
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="community-name" className="block text-sm font-medium text-gray-700 mb-2">
              Community/HOA Name
            </label>
            <input
              id="community-name"
              type="text"
              value={communityName}
              onChange={(e) => setCommunityName(e.target.value)}
              placeholder="e.g. Ashland Hills HOA"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-green-500"
            />
          </div>
          
          <div>
            <label htmlFor="total-properties" className="block text-sm font-medium text-gray-700 mb-2">
              Total Number of Properties
            </label>
            <input
              id="total-properties"
              type="number"
              value={totalProperties}
              onChange={(e) => setTotalProperties(e.target.value ? parseInt(e.target.value) : "")}
              placeholder="e.g. 150"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-green-500"
            />
          </div>
        </div>
        
        <button
          onClick={handleGenerateReport}
          disabled={!communityName || !totalProperties}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-green-600 px-6 py-3 text-white font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          <TrendingUp className="h-5 w-5" />
          Generate Community Dashboard
        </button>
      </div>

      {/* Results */}
      {showResults && mockData && (
        <>
          {/* Community Overview Stats */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={<Building className="h-6 w-6 text-blue-600" />}
              title="Total Properties"
              value={mockData.totalProperties.toString()}
              subtitle="in community"
            />
            
            <StatCard
              icon={<CheckCircle className="h-6 w-6 text-green-600" />}
              title="Properties Assessed"
              value={mockData.propertiesAssessed.toString()}
              subtitle={`${Math.round((mockData.propertiesAssessed / mockData.totalProperties) * 100)}% complete`}
              trend="positive"
            />
            
            <StatCard
              icon={<Shield className="h-6 w-6 text-orange-600" />}
              title="Avg Compliance"
              value={`${mockData.avgComplianceScore}%`}
              subtitle="fire safety score"
              trend={mockData.avgComplianceScore > 70 ? "positive" : "negative"}
            />
            
            <StatCard
              icon={<Users className="h-6 w-6 text-purple-600" />}
              title="Participation Rate"
              value={`${Math.round((mockData.propertiesAssessed / mockData.totalProperties) * 100)}%`}
              subtitle="of properties"
            />
          </div>

          {/* Progress Tracker */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Assessment Progress
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">Community Progress</span>
                <span className="text-gray-500">
                  {mockData.propertiesAssessed} of {mockData.totalProperties} properties
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${(mockData.propertiesAssessed / mockData.totalProperties) * 100}%` }}
                />
              </div>
              
              <div className="flex justify-between text-xs text-gray-500">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <ProgressItem
                label="Ready to Start"
                count={mockData.totalProperties - mockData.propertiesAssessed}
                color="bg-gray-400"
              />
              <ProgressItem
                label="Assessment Complete"
                count={mockData.propertiesAssessed}
                color="bg-blue-500"
              />
              <ProgressItem
                label="Fully Compliant"
                count={mockData.zoneBreakdown.zone1.compliant + mockData.zoneBreakdown.zone2.compliant + mockData.zoneBreakdown.zone3.compliant}
                color="bg-green-500"
              />
            </div>
          </div>

          {/* Zone Breakdown */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Fire Zone Compliance Breakdown
            </h3>
            
            <div className="grid gap-6 lg:grid-cols-3">
              <ZoneCard
                zone="Zone 1"
                description="Extreme Risk (0-30 feet)"
                data={mockData.zoneBreakdown.zone1}
                color="bg-red-500"
              />
              
              <ZoneCard
                zone="Zone 2"
                description="High Risk (30-100 feet)"
                data={mockData.zoneBreakdown.zone2}
                color="bg-orange-500"
              />
              
              <ZoneCard
                zone="Zone 3"
                description="Moderate Risk (100+ feet)"
                data={mockData.zoneBreakdown.zone3}
                color="bg-yellow-500"
              />
            </div>
          </div>

          {/* Action Items */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Recommended Actions
            </h3>
            
            <div className="space-y-4">
              <ActionItem
                priority="high"
                title="Increase Assessment Participation"
                description={`Only ${Math.round((mockData.propertiesAssessed / mockData.totalProperties) * 100)}% of properties have been assessed. Consider outreach campaign.`}
                action="Send assessment reminders to remaining properties"
              />
              
              <ActionItem
                priority="medium"
                title="Focus on Zone 1 Compliance"
                description="Zone 1 areas have the highest fire risk and need immediate attention."
                action="Provide Zone 1 specific plant recommendations and incentives"
              />
              
              <ActionItem
                priority="low"
                title="Celebrate Progress"
                description="Share community progress with residents to maintain momentum."
                action="Send monthly progress newsletter"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ 
  icon, 
  title, 
  value, 
  subtitle, 
  trend 
}: { 
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle: string;
  trend?: "positive" | "negative";
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <div>{icon}</div>
        {trend && (
          <div className={`text-xs font-medium ${
            trend === "positive" ? "text-green-600" : "text-red-600"
          }`}>
            {trend === "positive" ? "↗" : "↘"}
          </div>
        )}
      </div>
      
      <div className="mt-4">
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="text-sm text-gray-600">{title}</div>
        <div className="text-xs text-gray-500 mt-1">{subtitle}</div>
      </div>
    </div>
  );
}

function ProgressItem({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-3 h-3 rounded-full ${color}`} />
      <div>
        <div className="text-sm font-medium text-gray-900">{count}</div>
        <div className="text-xs text-gray-500">{label}</div>
      </div>
    </div>
  );
}

function ZoneCard({ 
  zone, 
  description, 
  data, 
  color 
}: { 
  zone: string;
  description: string;
  data: { total: number; assessed: number; compliant: number };
  color: string;
}) {
  const complianceRate = data.assessed > 0 ? Math.round((data.compliant / data.assessed) * 100) : 0;
  const assessmentRate = Math.round((data.assessed / data.total) * 100);
  
  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-3 h-3 rounded-full ${color}`} />
        <div>
          <div className="font-semibold text-gray-900">{zone}</div>
          <div className="text-xs text-gray-500">{description}</div>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Total Properties:</span>
          <span className="font-medium">{data.total}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span>Assessed:</span>
          <span className="font-medium">{data.assessed} ({assessmentRate}%)</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span>Compliant:</span>
          <span className="font-medium">{data.compliant} ({complianceRate}%)</span>
        </div>
      </div>
    </div>
  );
}

function ActionItem({ 
  priority, 
  title, 
  description, 
  action 
}: { 
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  action: string;
}) {
  const priorityColors = {
    high: "bg-red-100 text-red-800 border-red-200",
    medium: "bg-orange-100 text-orange-800 border-orange-200",
    low: "bg-blue-100 text-blue-800 border-blue-200"
  };

  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <div className="flex items-start gap-3">
        <div className={`px-2 py-1 text-xs font-medium rounded border ${priorityColors[priority]}`}>
          {priority.toUpperCase()}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900">{title}</h4>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
          <div className="mt-2 text-sm font-medium text-green-600">
            → {action}
          </div>
        </div>
      </div>
    </div>
  );
}