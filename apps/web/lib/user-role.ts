import { db, userProfiles } from "@lwf/database";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function getUserRole(userId?: string) {
  let targetUserId = userId;
  if (!targetUserId) {
    const user = await getCurrentUser();
    if (!user) return null;
    targetUserId = user.id;
  }

  const profile = await db
    .select({ role: userProfiles.role })
    .from(userProfiles)
    .where(eq(userProfiles.userId, targetUserId))
    .limit(1);

  return profile[0]?.role || "homeowner";
}

export async function getCurrentUserRole() {
  const user = await getCurrentUser();
  if (!user) return null;
  return getUserRole(user.id);
}