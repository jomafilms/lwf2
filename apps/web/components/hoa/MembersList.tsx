"use client";

import { useEffect, useState } from "react";
import { MapPin, Shield, Clock } from "lucide-react";

interface Member {
  userId: string;
  name: string;
  email: string;
  role: string;
  joinedAt: string;
  properties: Property[];
  totalProperties: number;
  assessedProperties: number;
  avgComplianceScore: number;
  complianceStatus: 'compliant' | 'partial' | 'non-compliant' | 'unassessed' | 'no-property';
}

interface Property {
  id: string;
  address: string;
  complianceScore: number | null;
  planStatus: string | null;
}

interface MembersListProps {
  orgId: string;
}

const statusConfig = {
  compliant: { label: "Compliant", color: "bg-green-100 text-green-800", icon: "✓" },
  partial: { label: "Partial", color: "bg-yellow-100 text-yellow-800", icon: "⚠" },
  "non-compliant": { label: "Needs Work", color: "bg-red-100 text-red-800", icon: "✗" },
  unassessed: { label: "Unassessed", color: "bg-gray-100 text-gray-800", icon: "?" },
  "no-property": { label: "No Property", color: "bg-blue-100 text-blue-800", icon: "—" },
};

export function MembersList({ orgId }: MembersListProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMembers() {
      try {
        const response = await fetch(`/api/hoa/${orgId}/members`);
        if (response.ok) {
          const data = await response.json();
          setMembers(data.members);
        }
      } catch (error) {
        console.error("Error fetching members:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchMembers();
  }, [orgId]);

  if (loading) {
    return (
      <div className="rounded-lg bg-white shadow-sm">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900">Community Members</h2>
          <div className="mt-4 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse border-b border-gray-100 pb-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const sortedMembers = [...members].sort((a, b) => {
    // Admins first, then by compliance status, then by name
    if (a.role === 'admin' && b.role !== 'admin') return -1;
    if (b.role === 'admin' && a.role !== 'admin') return 1;
    
    const statusOrder = ['compliant', 'partial', 'unassessed', 'non-compliant', 'no-property'];
    const aOrder = statusOrder.indexOf(a.complianceStatus);
    const bOrder = statusOrder.indexOf(b.complianceStatus);
    
    if (aOrder !== bOrder) return aOrder - bOrder;
    
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="rounded-lg bg-white shadow-sm">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Community Members ({members.length})
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Track member compliance and property assessments
        </p>
      </div>

      <div className="divide-y divide-gray-100">
        {sortedMembers.map((member) => {
          const status = statusConfig[member.complianceStatus];
          
          return (
            <div key={member.userId} className="p-6">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                  <span className="text-sm font-medium text-blue-600">
                    {member.name?.charAt(0)?.toUpperCase() || "?"}
                  </span>
                </div>

                {/* Member Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium text-gray-900">{member.name || "Unknown"}</h3>
                    {member.role === 'admin' && (
                      <span className="rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-800">
                        Admin
                      </span>
                    )}
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${status.color}`}>
                      {status.icon} {status.label}
                    </span>
                  </div>

                  {/* Properties */}
                  <div className="mt-2 space-y-2">
                    {member.properties.length === 0 ? (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <MapPin className="h-4 w-4" />
                        No properties registered
                      </div>
                    ) : (
                      member.properties.map((property) => (
                        <div key={property.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="h-4 w-4" />
                            <span className="truncate">{property.address}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {property.complianceScore !== null ? (
                              <>
                                <Shield className="h-4 w-4 text-green-600" />
                                <span className="text-sm font-medium text-green-600">
                                  {property.complianceScore}%
                                </span>
                              </>
                            ) : (
                              <>
                                <Clock className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-500">
                                  Not assessed
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Summary */}
                  {member.totalProperties > 0 && (
                    <div className="mt-3 text-xs text-gray-500">
                      {member.assessedProperties}/{member.totalProperties} properties assessed
                      {member.avgComplianceScore > 0 && (
                        <> • {member.avgComplianceScore}% avg score</>
                      )}
                      {" • "}Joined {new Date(member.joinedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {members.length === 0 && (
        <div className="p-8 text-center">
          <p className="text-gray-500">No members found</p>
        </div>
      )}
    </div>
  );
}