'use client';

import { useCart } from '@/lib/cart/store';
import { toast } from '@/components/ui/Toast';

interface PlanToggleButtonProps {
  plantId: string;
  commonName: string;
  botanicalName: string;
  imageUrl: string | null;
  nurseryId?: string | null;
  variant?: 'pill' | 'block';
  className?: string;
}

export function PlanToggleButton({
  plantId,
  commonName,
  botanicalName,
  imageUrl,
  nurseryId = null,
  variant = 'block',
  className,
}: PlanToggleButtonProps) {
  const { addToCart, removeFromCart, isInCart } = useCart();
  const inPlan = isInCart(plantId);

  function handleToggle(e?: React.MouseEvent) {
    e?.stopPropagation();
    if (inPlan) {
      removeFromCart(plantId);
      toast('Removed from plan');
    } else {
      addToCart({
        lwfPlantId: plantId,
        commonName,
        botanicalName,
        imageUrl,
        nurseryId,
      });
      toast('Added to plan!');
    }
  }

  if (variant === 'pill') {
    return (
      <button
        onClick={handleToggle}
        className={`px-2.5 py-1 text-xs font-medium rounded-full shadow-sm transition-colors ${
          inPlan
            ? 'bg-green-500 text-white hover:bg-red-500'
            : 'bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white hover:text-orange-600'
        } ${className || ''}`}
      >
        {inPlan ? '✓ In Plan' : '+ Add to Plan'}
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
        inPlan
          ? 'bg-green-500 text-white hover:bg-red-500'
          : 'bg-orange-500 text-white hover:bg-orange-600'
      } ${className || ''}`}
    >
      {inPlan ? '✓ In Plan' : '+ Add to Plan'}
    </button>
  );
}
