/**
 * Grant Information Component
 * 
 * Lists available grant programs for fire mitigation with eligibility info.
 * Oregon-focused but includes federal programs.
 */

import { AlertCircle, ExternalLink, DollarSign, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

interface GrantProgram {
  name: string;
  provider: string;
  maxAmount: string;
  deadline: string;
  eligibility: string[];
  description: string;
  applicationUrl: string;
  requirements: string[];
  status: 'active' | 'seasonal' | 'limited_funding';
}

interface GrantInfoProps {
  propertyLocation?: {
    city?: string;
    state?: string;
    county?: string;
  };
  estimatedCost: number; // in cents
  planScope: 'starter' | 'standard' | 'comprehensive';
}

// ─── Grant Programs Data ─────────────────────────────────────────────────────

const GRANT_PROGRAMS: GrantProgram[] = [
  {
    name: "Oregon Department of Forestry (ODF) Fire Prevention Grant",
    provider: "Oregon Department of Forestry",
    maxAmount: "Up to $5,000",
    deadline: "Typically March 31st annually",
    eligibility: [
      "Oregon residents",
      "Properties in Wildland-Urban Interface (WUI)",
      "Match funding required (25-50%)"
    ],
    description: "Supports fire prevention activities including defensible space creation, fuel reduction, and fire-resistant landscaping.",
    applicationUrl: "https://www.oregon.gov/odf/fire/Pages/prevention-grants.aspx",
    requirements: [
      "Detailed project plan",
      "Property assessment",
      "Before/after photos",
      "Receipts for reimbursement"
    ],
    status: 'seasonal'
  },
  {
    name: "FEMA Hazard Mitigation Grant Program (HMGP)",
    provider: "Federal Emergency Management Agency",
    maxAmount: "Up to $15,000",
    deadline: "Continuous (post-disaster)",
    eligibility: [
      "Must be post-federally declared disaster",
      "Property owner or community application",
      "Cost-benefit analysis required"
    ],
    description: "Federal funding for long-term hazard reduction measures including fire-resistant landscaping and defensible space.",
    applicationUrl: "https://www.fema.gov/grants/mitigation/hazard-mitigation",
    requirements: [
      "FEMA disaster declaration",
      "Environmental review",
      "Cost-benefit analysis showing >1.0 ratio",
      "State/local matching funds"
    ],
    status: 'limited_funding'
  },
  {
    name: "Firewise USA Recognition Grants",
    provider: "National Fire Protection Association",
    maxAmount: "Up to $1,000",
    deadline: "Rolling applications",
    eligibility: [
      "Firewise USA recognized communities",
      "Community-based projects",
      "Educational component required"
    ],
    description: "Small grants for community fire safety education and demonstration projects.",
    applicationUrl: "https://www.nfpa.org/Public-Education/Fire-causes-and-risks/Wildfire/Firewise-USA",
    requirements: [
      "Community Firewise recognition",
      "Educational plan",
      "Community involvement",
      "Public demonstration area"
    ],
    status: 'active'
  },
  {
    name: "Oregon Watershed Enhancement Board (OWEB)",
    provider: "Oregon Watershed Enhancement Board",
    maxAmount: "Up to $10,000",
    deadline: "November 1st and May 1st",
    eligibility: [
      "Properties affecting watershed health",
      "Native plant restoration focus",
      "Water quality benefits"
    ],
    description: "Supports restoration projects that improve watershed health and can include fire-resistant native landscaping.",
    applicationUrl: "https://www.oregon.gov/oweb/grants/Pages/default.aspx",
    requirements: [
      "Watershed benefit analysis",
      "Native plant preference",
      "Long-term maintenance plan",
      "Technical review"
    ],
    status: 'active'
  },
  {
    name: "Local Utility Fire Prevention Programs",
    provider: "Pacific Power, PGE, NW Natural",
    maxAmount: "Up to $2,500",
    deadline: "Varies by utility",
    eligibility: [
      "Utility service area",
      "Near utility infrastructure",
      "Vegetation management focus"
    ],
    description: "Utility companies often provide grants for vegetation management and fire prevention near power lines and gas infrastructure.",
    applicationUrl: "Contact your local utility provider",
    requirements: [
      "Utility service account",
      "Near utility infrastructure",
      "Pre-approval required",
      "Certified contractor may be required"
    ],
    status: 'active'
  },
];

// ─── Helper Functions ────────────────────────────────────────────────────────

function getEligibleGrants(
  location: GrantInfoProps['propertyLocation'],
  cost: number,
  scope: string
): GrantProgram[] {
  return GRANT_PROGRAMS.filter(grant => {
    // Oregon-specific grants
    if (grant.provider.includes('Oregon') && location?.state !== 'Oregon') {
      return false;
    }
    
    // Cost filtering (very basic)
    const maxAmountNum = parseInt(grant.maxAmount.replace(/[^\d]/g, '')) * 100; // convert to cents
    if (cost > maxAmountNum * 3) { // If project cost is way above grant amount
      return false;
    }
    
    return true;
  });
}

function getEstimatedEligibility(grant: GrantProgram, cost: number): 'high' | 'medium' | 'low' {
  const maxAmountNum = parseInt(grant.maxAmount.replace(/[^\d]/g, '')) * 100;
  
  if (cost <= maxAmountNum) return 'high';
  if (cost <= maxAmountNum * 2) return 'medium';
  return 'low';
}

function getStatusBadgeVariant(status: GrantProgram['status']): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case 'active': return 'default';
    case 'seasonal': return 'secondary';
    case 'limited_funding': return 'outline';
    default: return 'outline';
  }
}

function getStatusLabel(status: GrantProgram['status']): string {
  switch (status) {
    case 'active': return 'Active';
    case 'seasonal': return 'Seasonal';
    case 'limited_funding': return 'Limited Funding';
    default: return 'Unknown';
  }
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function GrantInfo({ propertyLocation, estimatedCost, planScope }: GrantInfoProps) {
  const eligibleGrants = getEligibleGrants(propertyLocation, estimatedCost, planScope);
  const totalPotentialFunding = eligibleGrants.reduce((sum, grant) => {
    const amount = parseInt(grant.maxAmount.replace(/[^\d]/g, '')) * 100;
    return sum + amount;
  }, 0);
  
  const costInDollars = estimatedCost / 100;
  const fundingInDollars = totalPotentialFunding / 100;
  const coveragePercentage = estimatedCost > 0 ? Math.min(100, (fundingInDollars / costInDollars) * 100) : 0;
  
  return (
    <div className="space-y-6">
      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Grant Funding Overview
          </CardTitle>
          <CardDescription>
            Available funding programs for your fire-safe landscaping project
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-700">{eligibleGrants.length}</div>
              <div className="text-sm text-green-600">Eligible Programs</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-700">
                ${fundingInDollars.toLocaleString()}
              </div>
              <div className="text-sm text-blue-600">Potential Funding</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-700">
                {coveragePercentage.toFixed(0)}%
              </div>
              <div className="text-sm text-orange-600">Cost Coverage</div>
            </div>
          </div>
          
          {coveragePercentage >= 80 && (
            <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded-lg flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-green-700">
                <strong>Great news!</strong> Available grants could cover most of your project costs.
                Start with applications for active programs and consider timing for seasonal deadlines.
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Grant Programs */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Available Grant Programs</h3>
        
        {eligibleGrants.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-gray-500">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium mb-2">No Eligible Grants Found</p>
                <p className="text-sm">
                  Based on your location and project scope, we couldn't find matching grant programs.
                  Check with your local fire department or county for additional opportunities.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          eligibleGrants.map((grant, index) => {
            const eligibility = getEstimatedEligibility(grant, estimatedCost);
            
            return (
              <Card key={index} className="relative">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{grant.name}</CardTitle>
                      <CardDescription>{grant.provider}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={getStatusBadgeVariant(grant.status)}>
                        {getStatusLabel(grant.status)}
                      </Badge>
                      <Badge 
                        variant={
                          eligibility === 'high' ? 'default' : 
                          eligibility === 'medium' ? 'secondary' : 'outline'
                        }
                      >
                        {eligibility === 'high' ? 'High Match' : 
                         eligibility === 'medium' ? 'Medium Match' : 'Low Match'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm font-medium text-gray-700">Maximum Amount</div>
                        <div className="text-lg font-semibold text-green-600">{grant.maxAmount}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-700">
                          <Calendar className="h-4 w-4 inline mr-1" />
                          Deadline
                        </div>
                        <div className="text-sm">{grant.deadline}</div>
                      </div>
                    </div>
                    
                    {/* Description */}
                    <p className="text-sm text-gray-600">{grant.description}</p>
                    
                    {/* Eligibility */}
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-2">Eligibility Requirements</div>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {grant.eligibility.map((req, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-green-500 mt-1">•</span>
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {/* Requirements */}
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-2">Application Requirements</div>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {grant.requirements.map((req, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-blue-500 mt-1">•</span>
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {/* Apply Button */}
                    <Button asChild className="w-full">
                      <a 
                        href={grant.applicationUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2"
                      >
                        Apply for This Grant
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
      
      {/* Additional Resources */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Resources</CardTitle>
          <CardDescription>Other ways to reduce project costs</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-blue-500 mt-1">•</span>
            <div>
              <strong>Community Group Buys:</strong> Join with neighbors to bulk purchase plants
              and materials for better pricing.
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-blue-500 mt-1">•</span>
            <div>
              <strong>Volunteer Labor:</strong> Many Firewise communities organize volunteer
              work days for defensible space projects.
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-blue-500 mt-1">•</span>
            <div>
              <strong>Phased Implementation:</strong> Start with Zone 0 (highest priority)
              and expand over multiple seasons as budget allows.
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-blue-500 mt-1">•</span>
            <div>
              <strong>Tax Deductions:</strong> Fire mitigation improvements may qualify for
              property tax exemptions in some counties.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default GrantInfo;