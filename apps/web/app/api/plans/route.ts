import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db, plans, properties } from '@lwf/database';
import { eq, and, desc } from 'drizzle-orm';

/**
 * GET /api/plans?property_id=uuid
 * List plans for a property or all user plans
 */
export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  
  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = req.nextUrl;
    const propertyId = searchParams.get('property_id');

    if (propertyId) {
      // Get plans for specific property
      // First verify user owns the property
      const [property] = await db
        .select()
        .from(properties)
        .where(
          and(
            eq(properties.id, propertyId),
            eq(properties.ownerId, user.id)
          )
        )
        .limit(1);

      if (!property) {
        return NextResponse.json(
          { error: 'Property not found or access denied' },
          { status: 404 }
        );
      }

      // Get plans for this property
      const propertyPlans = await db
        .select()
        .from(plans)
        .where(eq(plans.propertyId, propertyId))
        .orderBy(desc(plans.createdAt));

      return NextResponse.json({ plans: propertyPlans });
    } else {
      // Get all plans for properties owned by this user
      const userPlans = await db
        .select()
        .from(plans)
        .leftJoin(properties, eq(plans.propertyId, properties.id))
        .where(eq(properties.ownerId, user.id))
        .orderBy(desc(plans.createdAt));

      return NextResponse.json({ 
        plans: userPlans.map(row => ({
          ...row.plans,
          property: row.properties
        }))
      });
    }
  } catch (error) {
    console.error('Plans fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch plans' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/plans
 * Create a new plan
 */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  
  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { propertyId, name, plantPlacements, notes, status = 'draft' } = body;

    // Validate required fields
    if (!propertyId) {
      return NextResponse.json(
        { error: 'propertyId is required' },
        { status: 400 }
      );
    }

    // Verify user owns the property
    const [property] = await db
      .select()
      .from(properties)
      .where(
        and(
          eq(properties.id, propertyId),
          eq(properties.ownerId, user.id)
        )
      )
      .limit(1);

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found or access denied' },
        { status: 404 }
      );
    }

    // Create plan
    const [newPlan] = await db
      .insert(plans)
      .values({
        propertyId,
        createdBy: user.id,
        name: name || null,
        plantPlacements: plantPlacements || null,
        notes: notes || null,
        status: status as any,
      })
      .returning();

    return NextResponse.json({ 
      success: true,
      planId: newPlan.id,
      plan: newPlan
    });
  } catch (error) {
    console.error('Plan creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create plan' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/plans
 * Update an existing plan
 */
export async function PUT(req: NextRequest) {
  const user = await getCurrentUser();
  
  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { id, name, plantPlacements, notes, status } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Plan id is required' },
        { status: 400 }
      );
    }

    // Verify user owns the plan (through property ownership)
    const [existingPlan] = await db
      .select()
      .from(plans)
      .leftJoin(properties, eq(plans.propertyId, properties.id))
      .where(
        and(
          eq(plans.id, id),
          eq(properties.ownerId, user.id)
        )
      )
      .limit(1);

    if (!existingPlan) {
      return NextResponse.json(
        { error: 'Plan not found or access denied' },
        { status: 404 }
      );
    }

    // Update plan
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (name !== undefined) updateData.name = name;
    if (plantPlacements !== undefined) updateData.plantPlacements = plantPlacements;
    if (notes !== undefined) updateData.notes = notes;
    if (status !== undefined) updateData.status = status;

    const [updatedPlan] = await db
      .update(plans)
      .set(updateData)
      .where(eq(plans.id, id))
      .returning();

    return NextResponse.json({ 
      success: true,
      plan: updatedPlan
    });
  } catch (error) {
    console.error('Plan update error:', error);
    return NextResponse.json(
      { error: 'Failed to update plan' },
      { status: 500 }
    );
  }
}