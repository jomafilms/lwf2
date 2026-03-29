import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db, properties, plans } from "@lwf/database";
import { eq, desc, inArray } from "drizzle-orm";
import Link from "next/link";
import {
  Home,
  TreePine,
  ListChecks,
  Settings,
  Shield,
  MapPin,
  Calendar,
  Layers,
  Plus,
  FileText,
} from "lucide-react";

const roleBadgeColors: Record<string, string> = {
  homeowner: "bg-green-100 text-green-800",
  landscaper: "bg-blue-100 text-blue-800",
  nursery_admin: "bg-purple-100 text-purple-800",
  city_admin: "bg-amber-100 text-amber-800",
  platform_admin: "bg-red-100 text-red-800",
};

const roleLabels: Record<string, string> = {
  homeowner: "Homeowner",
  landscaper: "Landscaper",
  nursery_admin: "Nursery Admin",
  city_admin: "City Admin",
  platform_admin: "Platform Admin",
};

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  // Default role — will come from user_profiles in a future iteration
  const role = "homeowner";
  const badgeColor = roleBadgeColors[role] || roleBadgeColors.homeowner;
  const roleLabel = roleLabels[role] || "Homeowner";

  // Fetch user's saved properties
  const userProperties = await db
    .select()
    .from(properties)
    .where(eq(properties.ownerId, user.id))
    .orderBy(desc(properties.createdAt));

  // Fetch plans for user's properties
  const propertyIds = userProperties.map((p) => p.id);
  const userPlans =
    propertyIds.length > 0
      ? await db
          .select({ id: plans.id, propertyId: plans.propertyId })
          .from(plans)
          .where(inArray(plans.propertyId, propertyIds))
      : [];

  // Map: propertyId -> first planId
  const propertyPlanMap = new Map<string, string>();
  for (const plan of userPlans) {
    if (plan.propertyId && !propertyPlanMap.has(plan.propertyId)) {
      propertyPlanMap.set(plan.propertyId, plan.id);
    }
  }

  const sections = [
    {
      href: "/dashboard",
      label: "My Properties",
      description: "Manage your properties and fire zones",
      icon: Home,
    },
    {
      href: "/my-plants",
      label: "My Plants",
      description: "Your saved plants and lists",
      icon: TreePine,
    },
    {
      href: "/dashboard",
      label: "My Lists",
      description: "Custom plant lists and shopping lists",
      icon: ListChecks,
    },
    {
      href: "/dashboard/hoa",
      label: "HOA & Community",
      description: "Community compliance tracking and progress",
      icon: Shield,
    },
    {
      href: "/dashboard/preferences",
      label: "Preferences",
      description: "View and manage AI-learned preferences",
      icon: Settings,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white">
        <div className="mx-auto max-w-4xl px-4 py-3">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
            ← Back to FireScape
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* Profile header */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            {user.image ? (
              <img
                src={user.image}
                alt={user.name || ""}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-500 text-2xl font-bold text-white">
                {(user.name?.[0] || user.email[0]).toUpperCase()}
              </span>
            )}
            <div>
              <h1 className="text-xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-sm text-gray-500">{user.email}</p>
              <span
                className={`mt-1.5 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeColor}`}
              >
                <Shield className="h-3 w-3" />
                {roleLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Saved Properties */}
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              My Properties
            </h2>
            <Link
              href="/map"
              className="flex items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-orange-600 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Property
            </Link>
          </div>

          {userProperties.length === 0 ? (
            <div className="rounded-lg border border-dashed bg-white p-8 text-center">
              <MapPin className="mx-auto h-8 w-8 text-gray-300" />
              <p className="mt-2 text-sm font-medium text-gray-600">
                No properties saved yet
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Go to the map, draw your structure, and save your property.
              </p>
              <Link
                href="/map"
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 transition-colors"
              >
                <MapPin className="h-4 w-4" />
                Map Your Property
              </Link>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {userProperties.map((prop) => {
                const hasZones = !!prop.fireZones;
                const hasPlan = propertyPlanMap.has(prop.id);
                const firstPlanId = propertyPlanMap.get(prop.id);
                const createdDate = prop.createdAt
                  ? new Date(prop.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : null;

                return (
                  <Link
                    key={prop.id}
                    href={`/map?property=${prop.id}`}
                    className="group rounded-lg border bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                          {prop.address}
                        </p>
                        <div className="mt-1.5 flex items-center gap-3 text-xs text-gray-500">
                          {createdDate && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {createdDate}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Layers className="h-3 w-3" />
                            {hasZones ? (
                              <span className="text-green-600 font-medium">
                                Zones calculated
                              </span>
                            ) : (
                              <span className="text-gray-400">
                                No zones yet
                              </span>
                            )}
                          </span>
                        </div>
                        {hasPlan && firstPlanId && (
                          <Link
                            href={`/plans/${firstPlanId}/document`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="mt-1.5 inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 transition-colors"
                          >
                            <FileText className="h-3 w-3" />
                            View Plan Document
                          </Link>
                        )}
                      </div>
                      <MapPin className="h-4 w-4 flex-shrink-0 text-gray-300 group-hover:text-orange-400 transition-colors" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick links */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {sections.map((section) => (
            <Link
              key={section.label}
              href={section.href}
              className="group rounded-lg border bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <section.icon className="h-5 w-5 text-orange-500" />
                <h2 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                  {section.label}
                </h2>
              </div>
              <p className="mt-1.5 text-sm text-gray-500">
                {section.description}
              </p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
