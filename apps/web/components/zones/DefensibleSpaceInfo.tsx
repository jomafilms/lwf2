import { Shield, Flame, Droplets, Scissors } from "lucide-react";

const ZONE_INFO = [
  {
    id: "zone0",
    title: "Zone 0 (0-5 feet)",
    icon: Shield,
    color: "bg-red-100 border-red-200 text-red-800",
    iconColor: "text-red-600",
    description: "Non-combustible zone around structures",
    strategies: [
      "Remove all flammable vegetation and materials",
      "Use gravel, pavers, or concrete surfaces",
      "Keep gutters and roofs clear of debris",
      "Store firewood away from structures"
    ],
  },
  {
    id: "zone1", 
    title: "Zone 1 (5-30 feet)",
    icon: Scissors,
    color: "bg-orange-100 border-orange-200 text-orange-800",
    iconColor: "text-orange-600",
    description: "Lean, clean, and green landscaping",
    strategies: [
      "Choose fire-resistant, low-growing plants",
      "Create space between plant groupings",
      "Remove dead or dying vegetation promptly",
      "Maintain lawn areas if irrigated"
    ],
  },
  {
    id: "zone2",
    title: "Zone 2 (30-100 feet)", 
    icon: Droplets,
    color: "bg-yellow-100 border-yellow-200 text-yellow-800",
    iconColor: "text-yellow-600",
    description: "Reduce fuel continuity and density",
    strategies: [
      "Thin existing vegetation to break up fuel loads",
      "Remove ladder fuels (vegetation that connects ground to tree canopy)",
      "Create fuel breaks with driveways or cleared areas",
      "Select larger fire-resistant trees and shrubs"
    ],
  },
  {
    id: "zone3",
    title: "Zone 3 (100+ feet)",
    icon: Flame,
    color: "bg-green-100 border-green-200 text-green-800", 
    iconColor: "text-green-600",
    description: "Extended wildfire protection zone",
    strategies: [
      "Focus on forest health and fuel reduction",
      "Work with neighbors on community-wide efforts", 
      "Consider professional forest management",
      "Maintain access roads and water sources"
    ],
  },
] as const;

interface DefensibleSpaceInfoProps {
  className?: string;
  compact?: boolean;
}

export function DefensibleSpaceInfo({ className = "", compact = false }: DefensibleSpaceInfoProps) {
  if (compact) {
    return (
      <div className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-4 ${className}`}>
        {ZONE_INFO.map((zone) => {
          const Icon = zone.icon;
          return (
            <div key={zone.id} className={`rounded-lg border p-4 ${zone.color}`}>
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`h-5 w-5 ${zone.iconColor}`} />
                <h3 className="font-semibold text-sm">{zone.title}</h3>
              </div>
              <p className="text-xs leading-relaxed">{zone.description}</p>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center">
        <h2 className="text-2xl font-bold text-stone-900 mb-2">
          Understanding Defensible Space Zones
        </h2>
        <p className="text-stone-600 max-w-2xl mx-auto leading-relaxed">
          Creating defensible space around your home involves managing vegetation and materials 
          in distinct zones based on distance from structures. Each zone has specific strategies 
          to reduce fire risk while maintaining an attractive landscape.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {ZONE_INFO.map((zone) => {
          const Icon = zone.icon;
          return (
            <div key={zone.id} className={`rounded-xl border p-6 ${zone.color}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg bg-white/50`}>
                  <Icon className={`h-6 w-6 ${zone.iconColor}`} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{zone.title}</h3>
                  <p className="text-sm opacity-90">{zone.description}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm mb-2">Key Strategies:</h4>
                <ul className="space-y-1">
                  {zone.strategies.map((strategy, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="inline-block w-1.5 h-1.5 bg-current rounded-full mt-2 flex-shrink-0" />
                      <span className="leading-relaxed">{strategy}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center bg-stone-50 rounded-xl p-6">
        <p className="text-sm text-stone-600 leading-relaxed">
          <strong>Remember:</strong> Defensible space requirements may vary by location and local regulations. 
          Always check with your local fire department or building authority for specific requirements in your area.
          In high-risk areas, defensible space may need to extend beyond 100 feet.
        </p>
      </div>
    </div>
  );
}