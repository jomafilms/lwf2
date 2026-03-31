/**
 * Cost Estimator Page
 * 
 * Select a property/plan and see full cost breakdown with budget options.
 * Compare different tiers and get landscaper quotes.
 */

import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, properties } from "@lwf/database";
import { CostEstimator } from "../../../../components/cost/CostEstimator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Loader2, Calculator, ArrowLeft } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import Link from "next/link";

interface CostPageProps {
  searchParams: Promise<{
    propertyId?: string;
  }>;
}

// ─── Property Selection Component ────────────────────────────────────────────

async function PropertySelector() {
  const userProperties = await db
    .select({
      id: properties.id,
      address: properties.address,
      createdAt: properties.createdAt,
    })
    .from(properties)
    .orderBy(properties.createdAt);

  if (userProperties.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <Calculator className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">No Properties Found</h3>
            <p className="text-gray-600 mb-4">
              You need to create a property and landscape plan before estimating costs.
            </p>
            <Button asChild>
              <Link href="/dashboard/properties/new">
                Add Your Property
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Property for Cost Estimate</CardTitle>
        <CardDescription>
          Choose which property you'd like to estimate landscaping costs for
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {userProperties.map((property) => (
            <Link
              key={property.id}
              href={`/dashboard/cost?propertyId=${property.id}`}
              className="block"
            >
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{property.address}</h4>
                      <p className="text-sm text-gray-600">
                        Added {property.createdAt?.toLocaleDateString() ?? 'Recently'}
                      </p>
                    </div>
                    <div className="flex items-center text-blue-600">
                      <span className="text-sm">Get Estimate</span>
                      <ArrowLeft className="h-4 w-4 ml-1 rotate-180" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Property Cost Estimator ─────────────────────────────────────────────────

async function PropertyCostEstimator({ propertyId }: { propertyId: string }) {
  const property = await db
    .select()
    .from(properties)
    .where(eq(properties.id, propertyId))
    .limit(1);

  if (property.length === 0) {
    notFound();
  }

  const propertyData = property[0];
  
  // Extract location info for grant eligibility
  const propertyLocation = {
    city: undefined, // Would need geocoding to get city from address
    state: propertyData.address?.includes('OR') ? 'Oregon' : 
           propertyData.address?.includes('CA') ? 'California' :
           propertyData.address?.includes('WA') ? 'Washington' : undefined,
    county: undefined, // Would need geocoding
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Cost Estimate</h1>
          <p className="text-gray-600">{propertyData.address}</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard/cost" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Property Selection
          </Link>
        </Button>
      </div>

      {/* Cost Estimator */}
      <CostEstimator 
        propertyId={propertyId}
        propertyLocation={propertyLocation}
      />
    </div>
  );
}

// ─── Loading Component ───────────────────────────────────────────────────────

function CostPageLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-gray-500">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading cost estimator...
      </div>
      
      {/* Skeleton Cards */}
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── Main Page Component ─────────────────────────────────────────────────────

export default async function CostPage({ searchParams }: CostPageProps) {
  const { propertyId } = await searchParams;

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <Suspense fallback={<CostPageLoading />}>
        {propertyId ? (
          <PropertyCostEstimator propertyId={propertyId} />
        ) : (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold mb-2">Cost Estimator</h1>
              <p className="text-gray-600">
                Get detailed cost estimates for your fire-safe landscaping project,
                including plant costs from local nurseries, labor estimates, and available grants.
              </p>
            </div>
            <PropertySelector />
          </div>
        )}
      </Suspense>
    </div>
  );
}

export const metadata = {
  title: "Cost Estimator - LWF",
  description: "Estimate costs for your fire-safe landscaping project with local nursery pricing and grant information.",
};