import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getCurrentUserRole } from "@/lib/user-role";
import { CityAnalyticsDashboard } from "./CityAnalyticsDashboard";

export default async function CityDashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  // Require city_admin role
  const role = await getCurrentUserRole();
  if (role !== "city_admin") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h1>
          <p className="text-gray-600">This dashboard is only available to city administrators.</p>
        </div>
      </div>
    );
  }

  return <CityAnalyticsDashboard />;
}