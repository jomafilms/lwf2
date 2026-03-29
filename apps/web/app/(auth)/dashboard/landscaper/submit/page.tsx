import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getCurrentUserRole } from "@/lib/user-role";
import { db, plans, properties } from "@lwf/database";
import { eq, ne, desc, and } from "drizzle-orm";
import Link from "next/link";
import {
  FileText,
  CheckCircle,
  Clock,
  ArrowLeft,
  AlertTriangle,
  Send,
  Eye,
  Calendar,
  DollarSign,
  Target,
} from "lucide-react";
import { SubmitPlanButton } from "./SubmitPlanButton";

export default async function SubmitPlansPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/sign-in");

  const role = await getCurrentUserRole();
  if (role !== "landscaper") {
    redirect("/dashboard");
  }

  // Fetch all plans by this landscaper that can be submitted
  const submittablePlans = await db
    .select({
      id: plans.id,
      name: plans.name,
      status: plans.status,
      propertyAddress: properties.address,
      complianceScore: plans.complianceScore,
      estimatedCost: plans.estimatedCost,
      plantPlacements: plans.plantPlacements,
      notes: plans.notes,
      createdAt: plans.createdAt,
      submittedAt: plans.submittedAt,
      updatedAt: plans.updatedAt,
    })
    .from(plans)
    .innerJoin(properties, eq(plans.propertyId, properties.id))
    .where(
      and(
        eq(plans.createdBy, currentUser.id),
        eq(plans.status, "draft") // Only draft plans can be submitted
      )
    )
    .orderBy(desc(plans.updatedAt));

  // Also fetch recently submitted plans for tracking
  const recentSubmissions = await db
    .select({
      id: plans.id,
      name: plans.name,
      status: plans.status,
      propertyAddress: properties.address,
      complianceScore: plans.complianceScore,
      estimatedCost: plans.estimatedCost,
      submittedAt: plans.submittedAt,
    })
    .from(plans)
    .innerJoin(properties, eq(plans.propertyId, properties.id))
    .where(
      and(
        eq(plans.createdBy, currentUser.id),
        // Plans that are submitted, under review, or approved
        ne(plans.status, "draft")
      )
    )
    .orderBy(desc(plans.submittedAt))
    .limit(5);

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
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Submit Plans</h1>
          <p className="mt-1 text-gray-500">
            Submit completed landscaping plans to the city for approval
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Plans Ready to Submit */}
          <div className="lg:col-span-2">
            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <Send className="h-5 w-5 text-green-500" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Plans Ready to Submit
                </h2>
              </div>

              {submittablePlans.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center">
                  <FileText className="mx-auto h-8 w-8 text-gray-300" />
                  <p className="mt-2 text-sm font-medium text-gray-600">
                    No plans ready for submission
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    Complete your draft plans to submit them for city approval
                  </p>
                  <Link
                    href="/dashboard/landscaper"
                    className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 transition-colors"
                  >
                    <FileText className="h-4 w-4" />
                    View Draft Plans
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {submittablePlans.map((plan) => {
                    const isReadyToSubmit = 
                      plan.complianceScore && plan.complianceScore >= 70 &&
                      plan.plantPlacements;

                    return (
                      <div
                        key={plan.id}
                        className={`rounded-lg border p-4 ${
                          isReadyToSubmit 
                            ? "border-green-200 bg-green-50" 
                            : "border-yellow-200 bg-yellow-50"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-medium text-gray-900">
                                {plan.name || "Untitled Plan"}
                              </h3>
                              <span className="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">
                                <Clock className="h-3 w-3" />
                                draft
                              </span>
                            </div>
                            
                            <p className="text-xs text-gray-600">{plan.propertyAddress}</p>

                            <div className="mt-2 grid grid-cols-3 gap-4 text-xs">
                              <div className="flex items-center gap-1.5">
                                <Target className="h-3 w-3" />
                                <span className={plan.complianceScore ? "text-green-700" : "text-gray-500"}>
                                  {plan.complianceScore ? `${plan.complianceScore}% compliant` : "Not scored"}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-1.5">
                                <DollarSign className="h-3 w-3" />
                                <span className="text-gray-700">
                                  {plan.estimatedCost 
                                    ? `$${plan.estimatedCost.toLocaleString()}`
                                    : "No cost estimate"
                                  }
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-1.5">
                                <Calendar className="h-3 w-3" />
                                <span className="text-gray-500">
                                  Updated {plan.updatedAt ? new Date(plan.updatedAt).toLocaleDateString() : "—"}
                                </span>
                              </div>
                            </div>

                            {!isReadyToSubmit && (
                              <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-700">
                                <AlertTriangle className="h-3 w-3" />
                                <span>
                                  Plan needs {!plan.complianceScore ? "compliance scoring" : ""}
                                  {(!plan.complianceScore && (plan.complianceScore ?? 0) < 70) ? " and " : ""}
                                  {plan.complianceScore && plan.complianceScore < 70 ? "higher compliance (70%+ required)" : ""}
                                  {!plan.plantPlacements ? " plant placements" : ""}
                                </span>
                              </div>
                            )}

                            {plan.notes && (
                              <p className="mt-2 text-xs text-gray-600 italic">{plan.notes}</p>
                            )}
                          </div>
                          
                          <div className="flex flex-col items-end gap-2 ml-4">
                            <div className="flex items-center gap-2">
                              <Link
                                href={`/plans/${plan.id}/document`}
                                className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
                              >
                                <Eye className="h-3 w-3" />
                                Preview
                              </Link>
                              
                              {isReadyToSubmit ? (
                                <SubmitPlanButton planId={plan.id} planName={plan.name || "Untitled Plan"} />
                              ) : (
                                <span className="cursor-not-allowed rounded-lg bg-gray-200 px-3 py-1.5 text-xs font-medium text-gray-500">
                                  Not Ready
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Submission History */}
          <div className="lg:col-span-1">
            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Recent Submissions
              </h2>

              {recentSubmissions.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-8 w-8 text-gray-300" />
                  <p className="mt-2 text-sm text-gray-500">No submissions yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentSubmissions.map((submission) => {
                    const statusColors = {
                      submitted: "bg-blue-100 text-blue-800",
                      under_review: "bg-yellow-100 text-yellow-800",
                      approved: "bg-green-100 text-green-800",
                      completed: "bg-purple-100 text-purple-800",
                    };

                    const statusIcons = {
                      submitted: FileText,
                      under_review: Clock,
                      approved: CheckCircle,
                      completed: CheckCircle,
                    };

                    const StatusIcon = statusIcons[submission.status as keyof typeof statusIcons] || FileText;

                    return (
                      <div
                        key={submission.id}
                        className="rounded-lg border border-gray-100 p-3 text-xs"
                      >
                        <div className="flex items-start justify-between">
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-gray-900 truncate">
                              {submission.name || "Untitled Plan"}
                            </p>
                            <p className="text-gray-500 truncate">{submission.propertyAddress}</p>
                            
                            <div className="mt-1 flex items-center gap-2">
                              <span className={`flex items-center gap-1 rounded-full px-1.5 py-0.5 text-xs font-medium ${
                                statusColors[submission.status as keyof typeof statusColors] || statusColors.submitted
                              }`}>
                                <StatusIcon className="h-2.5 w-2.5" />
                                {submission.status}
                              </span>
                            </div>

                            {submission.submittedAt && (
                              <p className="mt-1 text-gray-400">
                                {new Date(submission.submittedAt).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  <Link
                    href="/dashboard/landscaper/submissions"
                    className="block rounded-lg border border-dashed p-3 text-center text-xs text-gray-500 hover:text-gray-700"
                  >
                    View all submissions →
                  </Link>
                </div>
              )}
            </div>

            {/* Submission Guidelines */}
            <div className="mt-6 rounded-lg border bg-white p-6 shadow-sm">
              <h3 className="mb-3 text-sm font-semibold text-gray-900">
                Submission Requirements
              </h3>
              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-3 w-3 mt-0.5 text-green-500 flex-shrink-0" />
                  <span>Compliance score ≥ 70%</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-3 w-3 mt-0.5 text-green-500 flex-shrink-0" />
                  <span>All zones have plant placements</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-3 w-3 mt-0.5 text-green-500 flex-shrink-0" />
                  <span>Cost estimate provided</span>
                </div>
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-3 w-3 mt-0.5 text-amber-500 flex-shrink-0" />
                  <span>Plan name and notes recommended</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}