import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db, nurseryOrganizations } from "@lwf/database";
import { eq } from "drizzle-orm";
import { ShootingStarMarketplace } from "@/components/marketplace/ShootingStarMarketplace";

export default async function ShootingStarMarketplacePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  // Get Shooting Star nursery
  const [shootingStar] = await db
    .select()
    .from(nurseryOrganizations)
    .where(eq(nurseryOrganizations.name, "Shooting Star Nursery"))
    .limit(1);

  if (!shootingStar) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Demo Setup Required</h1>
          <p className="text-neutral-600 mb-6">
            Shooting Star Nursery organization not found in database.
          </p>
          <p className="text-sm text-neutral-500">
            Please run nursery data import to set up the demo.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Shooting Star Nursery Demo</h1>
        <p className="text-neutral-600">
          Complete marketplace integration with real inventory and fire safety ratings
        </p>
        <p className="text-sm text-neutral-500 mt-1">
          Central Point, OR • 1,733 plants in stock
        </p>
      </div>

      <ShootingStarMarketplace nursery={shootingStar} />
    </div>
  );
}