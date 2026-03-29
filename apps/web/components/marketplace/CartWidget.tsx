"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

interface CartItem {
  plantId: string;
  plantName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  size?: string;
  zone?: string;
}

interface CartWidgetProps {
  nurseryId: string;
  nurseryName?: string;
  className?: string;
}

export function CartWidget({ nurseryId, nurseryName = "Nursery", className }: CartWidgetProps) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.totalPrice, 0);

  // Load cart data
  useEffect(() => {
    loadCart();
  }, [nurseryId]);

  const loadCart = async () => {
    try {
      const response = await fetch(`/api/cart?nursery_id=${nurseryId}`);
      if (response.ok) {
        const data = await response.json();
        setItems(data.items || []);
      }
    } catch (error) {
      console.error('Failed to load cart:', error);
    }
  };

  const updateQuantity = async (plantId: string, size: string | undefined, newQuantity: number) => {
    setLoading(true);
    try {
      const response = await fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nurseryId,
          plantId,
          size,
          quantity: newQuantity
        })
      });

      if (response.ok) {
        await loadCart();
      }
    } catch (error) {
      console.error('Failed to update cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/cart?nursery_id=${nurseryId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setItems([]);
      }
    } catch (error) {
      console.error('Failed to clear cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nurseryId,
          fromCart: true
        })
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Order created successfully! Order ID: ${data.orderId}`);
        setItems([]);
        setIsOpen(false);
      } else {
        const error = await response.json();
        alert(`Failed to create order: ${error.error}`);
      }
    } catch (error) {
      console.error('Failed to create order:', error);
      alert('Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          <ShoppingCart className="h-4 w-4" />
          {totalItems > 0 && (
            <Badge variant="destructive" className="ml-2 min-w-[20px] h-5 text-xs">
              {totalItems}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Cart - {nurseryName}</SheetTitle>
          <SheetDescription>
            {totalItems === 0
              ? "Your cart is empty"
              : `${totalItems} items • $${(totalPrice / 100).toFixed(2)}`
            }
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-8 text-neutral-500">
              <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No items in cart</p>
              <p className="text-sm">Add plants to see them here</p>
            </div>
          ) : (
            <>
              {/* Cart items */}
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {items.map((item, index) => (
                  <div key={`${item.plantId}-${item.size || 'default'}-${index}`} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.plantName}</p>
                      {item.size && (
                        <p className="text-xs text-neutral-500">{item.size}</p>
                      )}
                      {item.zone && (
                        <Badge variant="outline" className="text-xs mt-1">
                          {item.zone}
                        </Badge>
                      )}
                      <p className="text-sm font-medium text-green-600">
                        ${(item.unitPrice / 100).toFixed(2)} each
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => updateQuantity(item.plantId, item.size, item.quantity - 1)}
                        disabled={loading}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      
                      <span className="min-w-[30px] text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => updateQuantity(item.plantId, item.size, item.quantity + 1)}
                        disabled={loading}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                        onClick={() => updateQuantity(item.plantId, item.size, 0)}
                        disabled={loading}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cart actions */}
              <div className="pt-4 border-t space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total:</span>
                  <span className="text-lg font-bold text-green-600">
                    ${(totalPrice / 100).toFixed(2)}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <Button
                    onClick={createOrder}
                    className="w-full"
                    disabled={loading || items.length === 0}
                  >
                    {loading ? 'Processing...' : 'Submit Order to Nursery'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={clearCart}
                    className="w-full"
                    disabled={loading || items.length === 0}
                  >
                    Clear Cart
                  </Button>
                </div>
                
                <p className="text-xs text-neutral-500 text-center">
                  Order will be sent directly to {nurseryName} for fulfillment
                </p>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}