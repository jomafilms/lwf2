import { notFound } from "next/navigation";
import { db, plans, properties } from "@lwf/database";
import { eq } from "drizzle-orm";
import {
  buildPlanDocument,
  type PlantPlacement,
  type PlanDocumentData,
} from "@/lib/plans/build-document";
import { PlanDocumentView } from "@/components/plans/PlanDocumentView";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PlanDocumentPage({ params }: PageProps) {
  const { id } = await params;

  // Fetch plan
  const [plan] = await db.select().from(plans).where(eq(plans.id, id));
  if (!plan) notFound();

  // Fetch property
  const [property] = plan.propertyId
    ? await db
        .select()
        .from(properties)
        .where(eq(properties.id, plan.propertyId))
    : [null];

  if (!property) notFound();

  const plantPlacements = Array.isArray(plan.plantPlacements)
    ? (plan.plantPlacements as PlantPlacement[])
    : [];

  let documentData: PlanDocumentData;

  if (plantPlacements.length === 0) {
    // Render empty state
    documentData = {
      planId: plan.id,
      planName: plan.name ?? "Untitled Plan",
      propertyAddress: property.address,
      generatedAt: new Date().toISOString(),
      zones: [],
      estimatedTotal: null,
      nurserySources: [],
    };
  } else {
    documentData = await buildPlanDocument({
      planId: plan.id,
      planName: plan.name ?? "Untitled Plan",
      propertyAddress: property.address,
      plantPlacements,
    });
  }

  return <PlanDocumentView data={documentData} />;
}
