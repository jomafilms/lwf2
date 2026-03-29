/**
 * NurseryMatchCard Component
 * Shows nursery availability for plants in a list
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import { Building2, ExternalLink } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { NurseryMatch } from "@/lib/nursery-availability";

interface Props {
  plantIds: string[];
}

export function NurseryMatchCard({ plantIds }: Props) {
  const [matches, setMatches] = useState<NurseryMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMatches() {
      if (plantIds.length === 0) {
        setMatches([]);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/nursery-availability", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plantIds }),
        });

        if (res.ok) {
          const data = await res.json();
          setMatches(data.slice(0, 5)); // Show top 5 nurseries
        } else {
          setMatches([]);
        }
      } catch (error) {
        console.error("Failed to load nursery matches:", error);
        setMatches([]);
      } finally {
        setLoading(false);
      }
    }

    loadMatches();
  }, [plantIds]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-gray-400" />
            <CardTitle className="text-lg">Nursery Availability</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center justify-between">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (matches.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-gray-400" />
            <CardTitle className="text-lg">Nursery Availability</CardTitle>
          </div>
          <CardDescription>
            Find local nurseries that carry these plants
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            No nursery data available for these plants yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  const topMatch = matches[0];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-emerald-600" />
          <CardTitle className="text-lg">Nursery Availability</CardTitle>
        </div>
        <CardDescription>
          <strong>{topMatch.nursery.name}</strong> has {topMatch.percentage}% of these plants
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress bars for top nurseries */}
        <div className="space-y-3">
          {matches.map(match => (
            <div key={match.nursery.id}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="font-medium text-gray-900">
                  {match.nursery.name}
                </span>
                <span className="text-gray-500">
                  {match.percentage}% ({match.inventoryCount}/{plantIds.length})
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-emerald-600 h-2 rounded-full transition-all"
                  style={{ width: `${match.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* View all link */}
        <div className="pt-2 border-t">
          <Link
            href="/nurseries"
            className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            View all nurseries <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}