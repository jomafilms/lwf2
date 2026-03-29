import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getCurrentUserRole } from "@/lib/user-role";
import { db, landscaperClients, properties, plans, user } from "@lwf/database";
import { eq, desc, and } from "drizzle-orm";
import Link from "next/link";
import {
  MapPin,
  User,
  Calendar,
  Layers,
  FileText,
  Plus,
  Eye,
  ArrowLeft,
  CheckCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";

interface Props {
  params: Promise<{ propertyId: string }>;
}

export default async function ClientPropertyPage({ params }: Props) {
  const { propertyId } = await params;
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/sign-in");

  const role = await getCurrentUserRole();
  if (role !== "landscaper") {
    redirect("/dashboard");
  }

  // Check if this property is a client of the current landscaper
  const clientRelationship = await db
    .select({
      id: landscaperClients.id,
      status: landscaperClients.status,
      notes: landscaperClients.notes,
      clientSince: landscaperClients.createdAt,
    })
    .from(landscaperClients)
    .where(
      and(
        eq(landscaperClients.landscaperId, currentUser.id),
        eq(landscaperClients.propertyId, propertyId)
      )
    )
    .limit(1);

  if (clientRelationship.length === 0) {
    notFound();
  }

  const client = clientRelationship[0];

  // Fetch property details
  const property = await db
    .select({
      id: properties.id,
      address: properties.address,
      lat: properties.lat,
      lng: properties.lng,
      parcelBoundary: properties.parcelBoundary,
      structureFootprints: properties.structureFootprints,
      fireZones: properties.fireZones,
      ownerId: properties.ownerId,
      ownerName: user.name,
      ownerEmail: user.email,
      createdAt: properties.createdAt,
    })
    .from(properties)
    .innerJoin(user, eq(properties.ownerId, user.id))
    .where(eq(properties.id, propertyId))
    .limit(1);

  if (property.length === 0) {
    notFound();
  }

  const propertyData = property[0];

  // Fetch plans for this property created by this landscaper
  const propertyPlans = await db
    .select({
      id: plans.id,
      name: plans.name,
      status: plans.status,
      complianceScore: plans.complianceScore,
      estimatedCost: plans.estimatedCost,
      plantPlacements: plans.plantPlacements,
      notes: plans.notes,
      createdAt: plans.createdAt,
      submittedAt: plans.submittedAt,
      updatedAt: plans.updatedAt,
    })
    .from(plans)
    .where(
      and(
        eq(plans.propertyId, propertyId),
        eq(plans.createdBy, currentUser.id)
      )
    )
    .orderBy(desc(plans.createdAt));

  const hasZones = !!propertyData.fireZones;
  const clientSince = client.clientSince
    ? new Date(client.clientSince).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const statusColors = {
    draft: "bg-gray-100 text-gray-800",
    submitted: "bg-blue-100 text-blue-800",
    under_review: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    completed: "bg-purple-100 text-purple-800",
  };

  const statusIcons = {
    draft: Clock,
    submitted: FileText,
    under_review: AlertTriangle,
    approved: CheckCircle,
    completed: CheckCircle,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <Link 
            href="/dashboard/landscaper" 
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Landscaper Dashboard
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Property Header */}
        <div className="mb-6 rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold text-gray-900">
                {propertyData.address}
              </h1>
              <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                  <User className="h-4 w-4" />
                  {propertyData.ownerName}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {propertyData.lat.toFixed(4)}, {propertyData.lng.toFixed(4)}
                </span>
                {clientSince && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    Client since {clientSince}
                  </span>
                )}
              </div>
              {client.notes && (
                <div className="mt-3 rounded-lg bg-blue-50 p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Notes:</strong> {client.notes}
                  </p>
                </div>
              )}
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className={`rounded-full px-3 py-1 text-sm font-medium ${
                client.status === "active" 
                  ? "bg-green-100 text-green-800"
                  : client.status === "pending"
                  ? "bg-yellow-100 text-yellow-800" 
                  : "bg-gray-100 text-gray-800"
              }`}>
                {client.status}
              </span>
              <Link
                href={`/map?property=${propertyId}`}
                className="flex items-center gap-1.5 rounded-lg bg-blue-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-600 transition-colors"
              >
                <Eye className="h-4 w-4" />
                View on Map
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Property Info */}
          <div className="lg:col-span-1">
            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Property Details
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Owner Contact
                  </label>
                  <div className="mt-1 space-y-1">
                    <p className="text-sm text-gray-900">{propertyData.ownerName}</p>
                    <p className="text-sm text-gray-500">{propertyData.ownerEmail}</p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Fire Zones
                  </label>
                  <div className="mt-1 flex items-center gap-2">
                    <Layers className={`h-4 w-4 ${hasZones ? "text-green-500" : "text-gray-400"}`} />
                    <span className={`text-sm ${hasZones ? "text-green-700" : "text-gray-500"}`}>
                      {hasZones ? "Calculated" : "Not calculated"}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Property Added
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {propertyData.createdAt 
                      ? new Date(propertyData.createdAt).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric", 
                          year: "numeric"
                        })
                      : "Unknown"
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Plans */}
          <div className="lg:col-span-2">
            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Landscaping Plans
                </h2>
                {hasZones && (
                  <Link
                    href={`/map?property=${propertyId}&plan=new`}
                    className="flex items-center gap-1.5 rounded-lg bg-green-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-600 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Create Plan
                  </Link>
                )}
              </div>

              {!hasZones ? (
                <div className="rounded-lg border border-dashed p-8 text-center">
                  <Layers className="mx-auto h-8 w-8 text-gray-300" />
                  <p className="mt-2 text-sm font-medium text-gray-600">
                    Fire zones not calculated
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    Fire zones must be calculated before creating plans
                  </p>
                  <Link
                    href={`/map?property=${propertyId}`}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 transition-colors"
                  >
                    <MapPin className="h-4 w-4" />
                    Calculate Zones
                  </Link>
                </div>
              ) : propertyPlans.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center">
                  <FileText className="mx-auto h-8 w-8 text-gray-300" />
                  <p className="mt-2 text-sm font-medium text-gray-600">
                    No plans created yet
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    Create your first landscaping plan for this property
                  </p>
                  <Link
                    href={`/map?property=${propertyId}&plan=new`}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Create First Plan
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {propertyPlans.map((plan) => {
                    const StatusIcon = statusIcons[plan.status as keyof typeof statusIcons] || Clock;

                    return (
                      <div
                        key={plan.id}
                        className="rounded-lg border p-4 hover:border-gray-300 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-medium text-gray-900">
                                {plan.name || "Untitled Plan"}
                              </h3>
                              <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                                statusColors[plan.status as keyof typeof statusColors] || statusColors.draft
                              }`}>
                                <StatusIcon className="h-3 w-3" />
                                {plan.status}
                              </span>
                            </div>
                            
                            <div className="mt-1 flex items-center gap-4 text-xs text-gray-500">
                              {plan.complianceScore && (
                                <span className="text-green-600">
                                  {plan.complianceScore}% compliant
                                </span>
                              )}
                              {plan.estimatedCost && (
                                <span>${plan.estimatedCost.toLocaleString()}</span>
                              )}
                              <span>
                                Created {new Date(plan.createdAt).toLocaleDateString()}
                              </span>
                            </div>

                            {plan.notes && (
                              <p className="mt-2 text-xs text-gray-600">{plan.notes}</p>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 ml-4">
                            <Link
                              href={`/map?property=${propertyId}&plan=${plan.id}`}
                              className="text-blue-600 hover:text-blue-700 text-xs font-medium"
                            >
                              Edit
                            </Link>
                            <Link
                              href={`/plans/${plan.id}/document`}
                              className="text-green-600 hover:text-green-700 text-xs font-medium"
                            >
                              View Report
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}