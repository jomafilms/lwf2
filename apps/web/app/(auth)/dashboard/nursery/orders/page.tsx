import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db, orders, orgs, orgMembers } from "@lwf/database";
import { eq, desc, and } from "drizzle-orm";
import { NurseryOrdersManager } from "@/components/marketplace/NurseryOrdersManager";

export default async function NurseryOrdersPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  // Check if user is associated with a nursery
  const userNurseryMemberships = await db
    .select({ org: orgs })
    .from(orgMembers)
    .innerJoin(orgs, eq(orgMembers.orgId, orgs.id))
    .where(eq(orgMembers.userId, user.id));
  const userNurseries = userNurseryMemberships.map((m) => m.org);

  if (userNurseries.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-neutral-600 mb-6">
            You need to be associated with a nursery organization to view orders.
          </p>
          <a
            href="/dashboard/nursery"
            className="text-blue-600 hover:underline"
          >
            Set up your nursery profile →
          </a>
        </div>
      </div>
    );
  }

  const nursery = userNurseries[0]; // Use first nursery for now

  // Fetch orders for this nursery
  const nurseryOrders = await db
    .select()
    .from(orders)
    .where(eq(orders.nurseryId, nursery.id))
    .orderBy(desc(orders.createdAt));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="text-neutral-600">
            Manage incoming orders for {nursery.name}
          </p>
        </div>
      </div>

      <Suspense fallback={<div>Loading orders...</div>}>
        <NurseryOrdersManager nursery={nursery as any} orders={nurseryOrders as any} />
      </Suspense>
    </div>
  );
}