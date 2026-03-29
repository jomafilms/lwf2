import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db, orgs } from "@lwf/database";
import { nanoid } from "nanoid";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, type, description, zipCode } = body;

    if (!name || !type) {
      return NextResponse.json(
        { error: "Name and type are required" },
        { status: 400 }
      );
    }

    const validTypes = ["hoa", "neighborhood", "firewise"];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: "Invalid organization type" },
        { status: 400 }
      );
    }

    const [org] = await db
      .insert(orgs)
      .values({
        name,
        type,
        description,
        zipCode,
        createdBy: user.id,
      })
      .returning();

    // Add creator as admin
    const { orgMembers } = await import("@lwf/database");
    await db.insert(orgMembers).values({
      orgId: org.id,
      userId: user.id,
      role: "admin",
    });

    return NextResponse.json({ org }, { status: 201 });
  } catch (error) {
    console.error("Error creating organization:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}