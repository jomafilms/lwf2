import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db, cartSessions, type CartItem, type PropertyContext } from '@lwf/database';
import { eq, and, gt } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

/**
 * GET /api/cart?nursery_id=uuid
 * Get current user's cart for a specific nursery
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const nurseryId = searchParams.get('nursery_id');
  
  if (!nurseryId) {
    return NextResponse.json(
      { error: 'nursery_id parameter is required' },
      { status: 400 }
    );
  }

  try {
    const user = await getCurrentUser();
    const sessionId = user?.id || req.cookies.get('cart_session')?.value;

    if (!sessionId) {
      // No cart session exists
      return NextResponse.json({
        items: [],
        total: 0,
        nurseryId
      });
    }

    // Find active cart session
    const [cart] = await db
      .select()
      .from(cartSessions)
      .where(
        and(
          eq(cartSessions.nurseryId, nurseryId),
          user 
            ? eq(cartSessions.userId, user.id)
            : eq(cartSessions.sessionId, sessionId),
          gt(cartSessions.expiresAt, new Date())
        )
      )
      .limit(1);

    if (!cart) {
      return NextResponse.json({
        items: [],
        total: 0,
        nurseryId
      });
    }

    const total = (cart.items as CartItem[]).reduce((sum, item) => sum + item.totalPrice, 0);

    return NextResponse.json({
      items: cart.items,
      total,
      nurseryId,
      propertyContext: cart.propertyContext,
      lastUpdated: cart.updatedAt
    });
  } catch (error) {
    console.error('Cart fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cart' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cart
 * Add item to cart or update existing item quantity
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();
    
    const { nurseryId, plantId, plantName, quantity, unitPrice, size, notes, zone } = body;
    
    // Validate required fields
    if (!nurseryId || !plantId || !plantName || !quantity || !unitPrice) {
      return NextResponse.json(
        { error: 'Missing required fields: nurseryId, plantId, plantName, quantity, unitPrice' },
        { status: 400 }
      );
    }

    if (quantity <= 0 || unitPrice <= 0) {
      return NextResponse.json(
        { error: 'Quantity and unitPrice must be positive numbers' },
        { status: 400 }
      );
    }

    // Get or create session ID
    let sessionId = user?.id;
    if (!sessionId) {
      sessionId = req.cookies.get('cart_session')?.value;
      if (!sessionId) {
        sessionId = uuidv4();
      }
    }

    // Find or create cart session
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    
    let [cart] = await db
      .select()
      .from(cartSessions)
      .where(
        and(
          eq(cartSessions.nurseryId, nurseryId),
          user 
            ? eq(cartSessions.userId, user.id)
            : eq(cartSessions.sessionId, sessionId)
        )
      )
      .limit(1);

    const newItem: CartItem = {
      plantId,
      plantName,
      quantity,
      unitPrice,
      totalPrice: quantity * unitPrice,
      size,
      notes,
      zone,
      addedAt: new Date(),
      availability: 'in-stock', // Default, would be updated from nursery inventory
      nurseryPlantId: undefined,
      leadTime: undefined
    };

    if (cart) {
      // Update existing cart
      const items = cart.items as CartItem[];
      const existingItemIndex = items.findIndex(item => 
        item.plantId === plantId && 
        item.size === size
      );

      if (existingItemIndex >= 0) {
        // Update quantity and price
        items[existingItemIndex].quantity += quantity;
        items[existingItemIndex].totalPrice = items[existingItemIndex].quantity * items[existingItemIndex].unitPrice;
      } else {
        // Add new item
        items.push(newItem);
      }

      await db
        .update(cartSessions)
        .set({
          items: items,
          updatedAt: new Date(),
          expiresAt
        })
        .where(eq(cartSessions.id, cart.id));
    } else {
      // Create new cart
      await db
        .insert(cartSessions)
        .values({
          userId: user?.id || null,
          sessionId: user ? null : sessionId,
          nurseryId,
          items: [newItem],
          expiresAt,
        });
    }

    const response = NextResponse.json({ success: true });
    
    // Set cookie for anonymous users
    if (!user) {
      response.cookies.set('cart_session', sessionId, {
        maxAge: 7 * 24 * 60 * 60, // 7 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
    }

    return response;
  } catch (error) {
    console.error('Cart add error:', error);
    return NextResponse.json(
      { error: 'Failed to add to cart' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/cart
 * Update cart item quantity or remove item
 */
export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();
    
    const { nurseryId, plantId, size, quantity } = body;
    
    if (!nurseryId || !plantId) {
      return NextResponse.json(
        { error: 'nurseryId and plantId are required' },
        { status: 400 }
      );
    }

    const sessionId = user?.id || req.cookies.get('cart_session')?.value;
    if (!sessionId) {
      return NextResponse.json(
        { error: 'No cart session found' },
        { status: 404 }
      );
    }

    // Find cart
    const [cart] = await db
      .select()
      .from(cartSessions)
      .where(
        and(
          eq(cartSessions.nurseryId, nurseryId),
          user 
            ? eq(cartSessions.userId, user.id)
            : eq(cartSessions.sessionId, sessionId)
        )
      )
      .limit(1);

    if (!cart) {
      return NextResponse.json(
        { error: 'Cart not found' },
        { status: 404 }
      );
    }

    // Update items
    const items = cart.items as CartItem[];
    const itemIndex = items.findIndex(item => 
      item.plantId === plantId && item.size === size
    );

    if (itemIndex < 0) {
      return NextResponse.json(
        { error: 'Item not found in cart' },
        { status: 404 }
      );
    }

    if (quantity <= 0) {
      // Remove item
      items.splice(itemIndex, 1);
    } else {
      // Update quantity
      items[itemIndex].quantity = quantity;
      items[itemIndex].totalPrice = quantity * items[itemIndex].unitPrice;
    }

    await db
      .update(cartSessions)
      .set({
        items,
        updatedAt: new Date()
      })
      .where(eq(cartSessions.id, cart.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Cart update error:', error);
    return NextResponse.json(
      { error: 'Failed to update cart' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/cart?nursery_id=uuid
 * Clear cart for a specific nursery
 */
export async function DELETE(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const nurseryId = searchParams.get('nursery_id');
  
  if (!nurseryId) {
    return NextResponse.json(
      { error: 'nursery_id parameter is required' },
      { status: 400 }
    );
  }

  try {
    const user = await getCurrentUser();
    const sessionId = user?.id || req.cookies.get('cart_session')?.value;

    if (!sessionId) {
      return NextResponse.json({ success: true }); // Nothing to clear
    }

    await db
      .delete(cartSessions)
      .where(
        and(
          eq(cartSessions.nurseryId, nurseryId),
          user 
            ? eq(cartSessions.userId, user.id)
            : eq(cartSessions.sessionId, sessionId)
        )
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Cart clear error:', error);
    return NextResponse.json(
      { error: 'Failed to clear cart' },
      { status: 500 }
    );
  }
}