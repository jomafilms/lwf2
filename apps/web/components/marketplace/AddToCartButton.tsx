"use client";

import { useState } from "react";
import { ShoppingCart, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface PlantOption {
  size: string;
  price: number; // in cents
  availability: 'in-stock' | 'order-on-demand' | 'out-of-stock';
  leadTime?: string;
}

interface AddToCartButtonProps {
  plantId: string;
  plantName: string;
  nurseryId: string;
  options?: PlantOption[];
  zone?: string; // Fire zone context
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
}

const DEFAULT_OPTION: PlantOption = {
  size: "4-inch pot",
  price: 1500, // $15.00
  availability: 'in-stock'
};

export function AddToCartButton({
  plantId,
  plantName,
  nurseryId,
  options = [DEFAULT_OPTION],
  zone,
  className,
  variant = "default",
  size = "sm"
}: AddToCartButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<PlantOption>(options[0]);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAddToCart = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nurseryId,
          plantId,
          plantName,
          quantity,
          unitPrice: selectedOption.price,
          size: selectedOption.size,
          notes: notes.trim() || undefined,
          zone
        })
      });

      if (response.ok) {
        setAdded(true);
        setTimeout(() => {
          setAdded(false);
          setIsOpen(false);
          // Reset form
          setQuantity(1);
          setNotes("");
          setSelectedOption(options[0]);
        }, 1000);
      } else {
        const error = await response.json();
        alert(`Failed to add to cart: ${error.error}`);
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      alert('Failed to add to cart');
    } finally {
      setLoading(false);
    }
  };

  const availableOptions = options.filter(opt => opt.availability !== 'out-of-stock');
  const canAddToCart = availableOptions.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={variant} 
          size={size} 
          className={className}
          disabled={!canAddToCart}
        >
          {added ? (
            <>
              <Check className="h-4 w-4" />
              Added!
            </>
          ) : (
            <>
              <ShoppingCart className="h-4 w-4" />
              {!canAddToCart ? 'Out of Stock' : 'Add to Cart'}
            </>
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add to Cart</DialogTitle>
          <DialogDescription>
            {plantName}
            {zone && (
              <Badge variant="outline" className="ml-2">
                {zone}
              </Badge>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Size/Price selection */}
          <div>
            <Label htmlFor="size">Size & Price</Label>
            <Select
              value={`${selectedOption.size}|${selectedOption.price}`}
              onValueChange={(value) => {
                const [size, price] = value.split('|');
                const option = options.find(opt => 
                  opt.size === size && opt.price === parseInt(price)
                );
                if (option) setSelectedOption(option);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {options.map((option, index) => (
                  <SelectItem 
                    key={index}
                    value={`${option.size}|${option.price}`}
                    disabled={option.availability === 'out-of-stock'}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span>{option.size}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          ${(option.price / 100).toFixed(2)}
                        </span>
                        {option.availability === 'out-of-stock' && (
                          <Badge variant="destructive" className="text-xs">
                            Out of Stock
                          </Badge>
                        )}
                        {option.availability === 'order-on-demand' && (
                          <Badge variant="secondary" className="text-xs">
                            {option.leadTime || 'Made to Order'}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Quantity */}
          <div>
            <Label htmlFor="quantity">Quantity</Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 w-9 p-0"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <Plus className="h-4 w-4 rotate-45" />
              </Button>
              
              <Input
                id="quantity"
                type="number"
                value={quantity}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (!isNaN(value) && value >= 1) {
                    setQuantity(value);
                  }
                }}
                className="text-center"
                min={1}
                max={50}
              />
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 w-9 p-0"
                onClick={() => setQuantity(Math.min(50, quantity + 1))}
                disabled={quantity >= 50}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Special notes */}
          <div>
            <Label htmlFor="notes">Special Notes (optional)</Label>
            <Input
              id="notes"
              placeholder="Size preference, planting instructions, etc."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={200}
            />
          </div>

          {/* Availability info */}
          {selectedOption.availability === 'order-on-demand' && (
            <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
              <p className="text-sm text-orange-700">
                <strong>Made to Order:</strong> {selectedOption.leadTime || 'Please contact nursery for timing'}
              </p>
            </div>
          )}

          {/* Total */}
          <div className="flex justify-between items-center py-2 border-t">
            <span>Total:</span>
            <span className="text-lg font-bold text-green-600">
              ${((selectedOption.price * quantity) / 100).toFixed(2)}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddToCart}
            disabled={loading || !canAddToCart}
            className="flex-1"
          >
            {loading ? 'Adding...' : `Add ${quantity} to Cart`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}