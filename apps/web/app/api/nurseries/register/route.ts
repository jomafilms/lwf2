import { NextRequest, NextResponse } from "next/server";
import { db, nurseries, orgs, orgMembers } from "@lwf/database";
import { requireAuth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    const body = await request.json();
    const {
      name,
      address,
      city,
      state,
      zip,
      phone,
      email,
      website,
      description,
      isRetail,
      isWholesale,
      servesLandscapers,
    } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Nursery name is required" },
        { status: 400 }
      );
    }

    // Create org
    const [org] = await db
      .insert(orgs)
      .values({
        name: name.trim(),
        type: "nursery",
        website: website?.trim() || null,
      })
      .returning();

    // Create org membership (owner)
    await db.insert(orgMembers).values({
      orgId: org.id,
      userId: user.id,
      role: "owner",
    });

    // Create nursery record
    const [nursery] = await db
      .insert(nurseries)
      .values({
        name: name.trim(),
        address: address?.trim() || null,
        city: city?.trim() || null,
        state: state?.trim() || null,
        zip: zip?.trim() || null,
        phone: phone?.trim() || null,
        email: email?.trim() || null,
        website: website?.trim() || null,
        description: description?.trim() || null,
        isRetail: isRetail || false,
        isWholesale: isWholesale || false,
        servesLandscapers: servesLandscapers || false,
        connectionType: "manual",
      })
      .returning();

    return NextResponse.json({ data: { org, nursery } }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error registering nursery:", error);
    return NextResponse.json(
      { error: "Failed to register nursery" },
      { status: 500 }
    );
  }
}
