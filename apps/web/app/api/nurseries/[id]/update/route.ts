import { NextRequest, NextResponse } from "next/server";
import { db, nurseries } from "@lwf/database";
import { requireAuth } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;
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

    const [updated] = await db
      .update(nurseries)
      .set({
        name: name?.trim(),
        address: address?.trim() || null,
        city: city?.trim() || null,
        state: state?.trim() || null,
        zip: zip?.trim() || null,
        phone: phone?.trim() || null,
        email: email?.trim() || null,
        website: website?.trim() || null,
        description: description?.trim() || null,
        isRetail: isRetail ?? undefined,
        isWholesale: isWholesale ?? undefined,
        servesLandscapers: servesLandscapers ?? undefined,
      })
      .where(eq(nurseries.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: "Nursery not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: updated });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error updating nursery:", error);
    return NextResponse.json(
      { error: "Failed to update nursery" },
      { status: 500 }
    );
  }
}
