import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db, orders, cartSessions, type OrderItem, type DeliveryAddress, type ContactInfo } from '@lwf/database';
import { eq, desc, and } from 'drizzle-orm';

/**
 * GET /api/orders
 * List current user's orders
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
    const userOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.customerId, user.id))
      .orderBy(desc(orders.createdAt));

    return NextResponse.json({ orders: userOrders });
  } catch (error) {
    console.error('Orders fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/orders
 * Create order from cart or direct submission
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
    const {
      nurseryId,
      items,
      propertyId,
      planId,
      deliveryAddress,
      contactInfo,
      requestedDeliveryDate,
      fromCart = false
    } = body;

    // Validate required fields
    if (!nurseryId) {
      return NextResponse.json(
        { error: 'nurseryId is required' },
        { status: 400 }
      );
    }

    let orderItems: OrderItem[];

    if (fromCart) {
      // Create order from existing cart
      const [cart] = await db
        .select()
        .from(cartSessions)
        .where(
          and(
            eq(cartSessions.nurseryId, nurseryId),
            eq(cartSessions.userId, user.id)
          )
        )
        .limit(1);

      if (!cart || !cart.items || (cart.items as any[]).length === 0) {
        return NextResponse.json(
          { error: 'Cart is empty or not found' },
          { status: 400 }
        );
      }

      orderItems = (cart.items as any[]).map(item => ({
        plantId: item.plantId,
        plantName: item.plantName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        size: item.size,
        notes: item.notes,
        nurseryPlantId: item.nurseryPlantId,
        availability: item.availability || 'in-stock',
        leadTime: item.leadTime
      }));
    } else {
      // Direct order submission
      if (!items || !Array.isArray(items) || items.length === 0) {
        return NextResponse.json(
          { error: 'Items array is required and must not be empty' },
          { status: 400 }
        );
      }
      orderItems = items;
    }

    // Calculate total
    const totalAmount = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);

    // Determine customer type (basic heuristic)
    const customerType = user.roles?.includes('landscaper') ? 'landscaper' : 'homeowner';

    // Create order
    const [newOrder] = await db
      .insert(orders)
      .values({
        customerId: user.id,
        customerType,
        nurseryId,
        propertyId: propertyId || null,
        planId: planId || null,
        items: orderItems,
        totalAmount,
        platformFee: 0, // Not active initially
        deliveryAddress: deliveryAddress as DeliveryAddress || null,
        contactInfo: contactInfo as ContactInfo || null,
        requestedDeliveryDate: requestedDeliveryDate ? new Date(requestedDeliveryDate) : null,
        status: 'submitted',
        submittedAt: new Date()
      })
      .returning();

    // Clear cart if order was created from cart
    if (fromCart) {
      await db
        .delete(cartSessions)
        .where(
          and(
            eq(cartSessions.nurseryId, nurseryId),
            eq(cartSessions.userId, user.id)
          )
        );
    }

    return NextResponse.json({ 
      success: true, 
      orderId: newOrder.id,
      order: newOrder
    });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}