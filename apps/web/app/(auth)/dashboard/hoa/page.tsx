import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db, orgMembers, orgs } from "@lwf/database";
import { eq } from "drizzle-orm";
import Link from "next/link";
import {
  Users,
  Home,
  TrendingUp,
  Link as LinkIcon,
  Plus,
  Settings,
  Target,
  BarChart3,
  List,
} from "lucide-react";
import { HOAStats } from "@/components/hoa/HOAStats";
import { MembersList } from "@/components/hoa/MembersList";
import { InviteSection } from "@/components/hoa/InviteSection";

const statusColors: Record<string, string> = {
  compliant: "bg-green-100 text-green-800",
  partial: "bg-yellow-100 text-yellow-800",
  "non-compliant": "bg-red-100 text-red-800",
  unassessed: "bg-gray-100 text-gray-800",
  "no-property": "bg-blue-100 text-blue-800",
};

export default async function HOADashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  // Get user's HOA memberships where they are admin
  const adminMemberships = await db
    .select({
      id: orgs.id,
      name: orgs.name,
      type: orgs.type,
      description: orgs.description,
      zipCode: orgs.zipCode,
      role: orgMembers.role,
    })
    .from(orgMembers)
    .innerJoin(orgs, eq(orgs.id, orgMembers.orgId))
    .where(eq(orgMembers.userId, user.id));

  const hoaOrgs = adminMemberships.filter(m => 
    ["hoa", "neighborhood", "firewise"].includes(m.type || "")
  );

  if (hoaOrgs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="border-b bg-white">
          <div className="mx-auto max-w-6xl px-4 py-3">
            <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">
              ← Back to Dashboard
            </Link>
          </div>
        </nav>

        <main className="mx-auto max-w-4xl px-4 py-8">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <h1 className="mt-4 text-2xl font-bold text-gray-900">
              HOA & Community Dashboard
            </h1>
            <p className="mt-2 text-gray-600">
              Create or join an HOA, neighborhood, or Firewise community to track 
              collective fire safety progress.
            </p>
            
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/hoa/create"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Create Organization
              </Link>
              <Link
                href="/hoa/join"
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <LinkIcon className="h-4 w-4" />
                Join with Code
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // If user has HOA memberships, show the first one (in future, we can add org selector)
  const selectedOrg = hoaOrgs[0];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">
            ← Back to Dashboard
          </Link>
          {hoaOrgs.length > 1 && (
            <select className="text-sm border border-gray-300 rounded px-2 py-1">
              {hoaOrgs.map(org => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{selectedOrg.name}</h1>
              <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                <span className="capitalize">{selectedOrg.type}</span>
                {selectedOrg.zipCode && <span>ZIP: {selectedOrg.zipCode}</span>}
                <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                  selectedOrg.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {selectedOrg.role}
                </span>
              </div>
            </div>
            {selectedOrg.role === 'admin' && (
              <Link
                href={`/dashboard/hoa/${selectedOrg.id}/settings`}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            )}
          </div>
          {selectedOrg.description && (
            <p className="mt-4 text-gray-700">{selectedOrg.description}</p>
          )}
        </div>

        {/* Stats Overview */}
        <HOAStats orgId={selectedOrg.id} />

        {/* Goal Progress */}
        <div className="mb-8 rounded-lg bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Target className="h-5 w-5 text-orange-600" />
            <h2 className="text-lg font-semibold text-gray-900">Community Goal</h2>
          </div>
          <div className="mb-2 text-sm text-gray-600">
            90% fire assessment coverage by 2034 (CWPP goal)
          </div>
          {/* This will be populated by the HOAStats component */}
        </div>

        {/* Organization Lists */}
        {selectedOrg.role === 'admin' && (
          <div className="mb-8 rounded-lg bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <List className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">Organization Lists</h2>
              </div>
              <Link
                href="/dashboard/lists?visibility=org"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Manage Lists →
              </Link>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Create plant lists visible to your organization members. These appear in public browse for your community.
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Community Preferred Plants</span>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">15 plants</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Restricted Species</span>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">8 plants</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <Link
                href="/dashboard/lists/create?visibility=org"
                className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                <Plus className="h-4 w-4" />
                Create New Org List
              </Link>
            </div>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Members List */}
          <div className="lg:col-span-2">
            <MembersList orgId={selectedOrg.id} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Invite Section */}
            {selectedOrg.role === 'admin' && (
              <InviteSection orgId={selectedOrg.id} />
            )}

            {/* Quick Actions */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h3 className="mb-4 font-semibold text-gray-900">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-3 text-sm text-gray-600 hover:text-gray-900"
                >
                  <Home className="h-4 w-4" />
                  Add Your Property
                </Link>
                <Link
                  href="/browse"
                  className="flex items-center gap-3 text-sm text-gray-600 hover:text-gray-900"
                >
                  <TrendingUp className="h-4 w-4" />
                  Browse Fire-Safe Plants
                </Link>
                <Link
                  href="/dashboard/hoa/resources"
                  className="flex items-center gap-3 text-sm text-gray-600 hover:text-gray-900"
                >
                  <BarChart3 className="h-4 w-4" />
                  Download Reports
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}