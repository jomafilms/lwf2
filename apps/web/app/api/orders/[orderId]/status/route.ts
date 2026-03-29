import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db, orders, fulfillmentUpdates, nurseryOrganizations } from '@lwf/database';
import { eq, and } from 'drizzle-orm';

interface RouteParams {
  params: {
    orderId: string;
  };
}

/**
 * PUT /api/orders/[orderId]/status
 * Update order status (nursery owners only)
 */
export async function PUT(req: NextRequest, { params }: RouteParams) {
  const user = await getCurrentUser();
  
  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  try {
    const { orderId } = params;
    const body = await req.json();
    const { status, notes, estimatedDate } = body;

    // Validate status
    const validStatuses = ['confirmed', 'fulfilled', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Get the order
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if user owns the nursery for this order
    const [nursery] = await db
      .select()
      .from(nurseryOrganizations)
      .where(
        and(
          eq(nurseryOrganizations.id, order.nurseryId!),
          eq(nurseryOrganizations.ownerId, user.id)
        )
      )
      .limit(1);

    if (!nursery) {
      return NextResponse.json(
        { error: 'You do not have permission to update this order' },
        { status: 403 }
      );
    }

    // Update order
    const updateData: any = {
      status,
      updatedAt: new Date()
    };

    if (notes) {
      updateData.nurseryNotes = notes;
    }

    if (estimatedDate) {
      updateData.estimatedReadyDate = new Date(estimatedDate);
    }

    if (status === 'confirmed') {
      updateData.confirmedAt = new Date();
    } else if (status === 'fulfilled') {
      updateData.fulfilledAt = new Date();
    }

    await db
      .update(orders)
      .set(updateData)
      .where(eq(orders.id, orderId));

    // Create fulfillment update record
    await db
      .insert(fulfillmentUpdates)
      .values({
        orderId,
        updatedBy: user.id,
        status,
        message: notes || null,
        estimatedDate: estimatedDate ? new Date(estimatedDate) : null
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Order status update error:', error);
    return NextResponse.json(
      { error: 'Failed to update order status' },
      { status: 500 }
    );
  }
}