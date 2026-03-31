import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db, properties, plans } from "@lwf/database";
import { eq, desc } from "drizzle-orm";
import { PlanDesignInterface } from "@/components/_archive_canvas/PlanDesignInterface";

interface PageProps {
  searchParams: Promise<{
    property?: string;
    plan?: string;
  }>;
}

export default async function PlanDesignPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  // Get user's properties if no specific property is selected
  let selectedProperty = null;
  let existingPlan = null;

  if (resolvedParams.property) {
    // Load specific property
    const [property] = await db
      .select()
      .from(properties)
      .where(eq(properties.id, resolvedParams.property))
      .limit(1);

    if (property && property.ownerId === user.id) {
      selectedProperty = property;

      // Load existing plan if specified
      if (resolvedParams.plan) {
        const [plan] = await db
          .select()
          .from(plans)
          .where(eq(plans.id, resolvedParams.plan))
          .limit(1);

        if (plan && plan.propertyId === property.id) {
          existingPlan = plan;
        }
      }
    }
  }

  if (!selectedProperty) {
    // Get user's first property or redirect to setup
    const userProperties = await db
      .select()
      .from(properties)
      .where(eq(properties.ownerId, user.id))
      .orderBy(desc(properties.createdAt))
      .limit(1);

    if (userProperties.length === 0) {
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">No Property Found</h1>
            <p className="text-neutral-600 mb-6">
              You need to map a property before designing landscape plans.
            </p>
            <a
              href="/map"
              className="inline-flex items-center px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800"
            >
              Map Your Property →
            </a>
          </div>
        </div>
      );
    }

    selectedProperty = userProperties[0];
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Landscape Plan Designer</h1>
          <p className="text-neutral-600">
            Create professional landscape plans with plant placement and spacing
          </p>
          <p className="text-sm text-neutral-500 mt-1">
            Property: {selectedProperty.address}
          </p>
        </div>
      </div>

      <Suspense fallback={<div>Loading design canvas...</div>}>
        <PlanDesignInterface 
          property={selectedProperty} 
          existingPlan={existingPlan as any}
        />
      </Suspense>
    </div>
  );
}