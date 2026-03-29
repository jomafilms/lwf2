import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getCurrentUserRole } from "@/lib/user-role";
import { db, landscaperClients, properties, plans, user } from "@lwf/database";
import { eq, desc, count, sql, and } from "drizzle-orm";
import Link from "next/link";
import {
  Users,
  FileText,
  TrendingUp,
  MapPin,
  Calendar,
  CheckCircle,
  Clock,
  Plus,
  Home,
  AlertTriangle,
} from "lucide-react";

export default async function LandscaperDashboardPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/sign-in");

  const role = await getCurrentUserRole();
  if (role !== "landscaper") {
    redirect("/dashboard");
  }

  // Fetch landscaper's clients (properties)
  const clientProperties = await db
    .select({
      id: properties.id,
      address: properties.address,
      lat: properties.lat,
      lng: properties.lng,
      fireZones: properties.fireZones,
      ownerName: user.name,
      ownerEmail: user.email,
      status: landscaperClients.status,
      clientSince: landscaperClients.createdAt,
    })
    .from(landscaperClients)
    .innerJoin(properties, eq(landscaperClients.propertyId, properties.id))
    .innerJoin(user, eq(properties.ownerId, user.id))
    .where(eq(landscaperClients.landscaperId, currentUser.id))
    .orderBy(desc(landscaperClients.createdAt));

  // Fetch plans created by this landscaper
  const landscaperPlans = await db
    .select({
      id: plans.id,
      name: plans.name,
      status: plans.status,
      propertyAddress: properties.address,
      complianceScore: plans.readinessScore,
      estimatedCost: plans.estimatedCost,
      createdAt: plans.createdAt,
      submittedAt: plans.submittedAt,
    })
    .from(plans)
    .innerJoin(properties, eq(plans.propertyId, properties.id))
    .where(eq(plans.createdBy, currentUser.id))
    .orderBy(desc(plans.createdAt));

  // Calculate stats
  const totalClients = clientProperties.length;
  const activePlans = landscaperPlans.filter(p => p.status === "draft").length;
  const submittedPlans = landscaperPlans.filter(p => 
    ["submitted", "under_review"].includes(p.status || "")
  ).length;
  const approvedPlans = landscaperPlans.filter(p => 
    ["approved", "completed"].includes(p.status || "")
  ).length;
  
  const avgComplianceScore = landscaperPlans.length > 0
    ? Math.round(
        landscaperPlans
          .filter(p => p.complianceScore)
          .reduce((sum, p) => sum + (p.complianceScore || 0), 0) /
        landscaperPlans.filter(p => p.complianceScore).length
      )
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">
            ← Back to Dashboard
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Landscaper Dashboard</h1>
          <p className="mt-1 text-gray-500">
            Manage your clients and fire-safe landscaping projects
          </p>
        </div>

        {/* Stats Overview */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalClients}</p>
                <p className="text-sm text-gray-500">Total Clients</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{activePlans}</p>
                <p className="text-sm text-gray-500">Plans in Progress</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{submittedPlans}</p>
                <p className="text-sm text-gray-500">Submitted Plans</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{avgComplianceScore}%</p>
                <p className="text-sm text-gray-500">Avg Compliance</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Client Properties */}
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Client Properties</h2>
              <Link
                href="/dashboard/landscaper/clients/add"
                className="flex items-center gap-1.5 rounded-lg bg-blue-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-600 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Client
              </Link>
            </div>

            {clientProperties.length === 0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center">
                <Users className="mx-auto h-8 w-8 text-gray-300" />
                <p className="mt-2 text-sm font-medium text-gray-600">
                  No clients yet
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Start by adding your first client property
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {clientProperties.slice(0, 5).map((client) => {
                  const hasZones = !!client.fireZones;
                  const clientSince = client.clientSince
                    ? new Date(client.clientSince).toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      })
                    : null;

                  return (
                    <Link
                      key={client.id}
                      href={`/dashboard/landscaper/client/${client.id}`}
                      className="group block rounded-lg border p-4 hover:border-blue-200 hover:bg-blue-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-gray-900 group-hover:text-blue-700">
                            {client.address}
                          </p>
                          <p className="text-xs text-gray-500">{client.ownerName}</p>
                          <div className="mt-1 flex items-center gap-3 text-xs text-gray-400">
                            {clientSince && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Since {clientSince}
                              </span>
                            )}
                            <span className={`flex items-center gap-1 ${
                              hasZones ? "text-green-600" : "text-gray-400"
                            }`}>
                              <MapPin className="h-3 w-3" />
                              {hasZones ? "Zones mapped" : "No zones"}
                            </span>
                          </div>
                        </div>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          client.status === "active" 
                            ? "bg-green-100 text-green-800"
                            : client.status === "pending"
                            ? "bg-yellow-100 text-yellow-800" 
                            : "bg-gray-100 text-gray-800"
                        }`}>
                          {client.status}
                        </span>
                      </div>
                    </Link>
                  );
                })}
                
                {clientProperties.length > 5 && (
                  <Link
                    href="/dashboard/landscaper/clients"
                    className="block rounded-lg border border-dashed p-3 text-center text-sm text-gray-500 hover:text-gray-700"
                  >
                    View all {clientProperties.length} clients →
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Active Plans */}
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Active Plans</h2>
              <Link
                href="/dashboard/landscaper/submit"
                className="flex items-center gap-1.5 rounded-lg bg-green-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-600 transition-colors"
              >
                <FileText className="h-4 w-4" />
                Submit Plans
              </Link>
            </div>

            {landscaperPlans.length === 0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center">
                <FileText className="mx-auto h-8 w-8 text-gray-300" />
                <p className="mt-2 text-sm font-medium text-gray-600">
                  No plans created yet
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Create plans for your client properties
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {landscaperPlans.slice(0, 5).map((plan) => {
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

                  const StatusIcon = statusIcons[plan.status as keyof typeof statusIcons] || Clock;

                  return (
                    <div
                      key={plan.id}
                      className="rounded-lg border p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-gray-900">
                            {plan.name || "Untitled Plan"}
                          </p>
                          <p className="text-xs text-gray-500">{plan.propertyAddress}</p>
                          <div className="mt-1 flex items-center gap-3 text-xs text-gray-400">
                            {plan.complianceScore && (
                              <span className="text-green-600">
                                {plan.complianceScore}% compliant
                              </span>
                            )}
                            {plan.estimatedCost && (
                              <span>${plan.estimatedCost.toLocaleString()}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                            statusColors[plan.status as keyof typeof statusColors] || statusColors.draft
                          }`}>
                            <StatusIcon className="h-3 w-3" />
                            {plan.status}
                          </span>
                          {plan.submittedAt && (
                            <span className="text-xs text-gray-400">
                              Submitted {new Date(plan.submittedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {landscaperPlans.length > 5 && (
                  <Link
                    href="/dashboard/landscaper/plans"
                    className="block rounded-lg border border-dashed p-3 text-center text-sm text-gray-500 hover:text-gray-700"
                  >
                    View all {landscaperPlans.length} plans →
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}