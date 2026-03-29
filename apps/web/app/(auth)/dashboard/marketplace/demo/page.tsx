import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db, orgs } from "@lwf/database";
import { eq } from "drizzle-orm";
import { MarketplaceDemo } from "@/components/marketplace/MarketplaceDemo";

export default async function MarketplaceDemoPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  // Get Shooting Star nursery for demo
  const [shootingStar] = await db
    .select()
    .from(orgs)
    .where(eq(orgs.name, "Shooting Star Nursery"))
    .limit(1);

  if (!shootingStar) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Demo Not Available</h1>
          <p className="text-neutral-600">
            Shooting Star Nursery data not found. Please run nursery data import first.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Marketplace Demo</h1>
        <p className="text-neutral-600">
          Test the full marketplace flow: browse plants, add to cart, submit orders
        </p>
      </div>

      <MarketplaceDemo nursery={shootingStar as any} />
    </div>
  );
}