"use client";

import { useRef, useCallback } from "react";

const SWIPE_THRESHOLD = 80;

/**
 * Swipe-to-dismiss — swipe down or swipe right to close.
 * Ported from joma-v2 for mobile slide-out panels.
 */
export function useSwipeToDismiss(onDismiss: () => void) {
  const startRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    startRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
  }, []);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!startRef.current) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - startRef.current.x;
    const dy = touch.clientY - startRef.current.y;
    const elapsed = Date.now() - startRef.current.time;
    startRef.current = null;

    if (elapsed > 500) return;

    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    // Swipe right to close
    if (dx > SWIPE_THRESHOLD && absDx > absDy * 1.2) { onDismiss(); return; }
    // Swipe down to close
    if (dy > SWIPE_THRESHOLD && absDy > absDx * 1.2) { onDismiss(); }
  }, [onDismiss]);

  return { onTouchStart, onTouchEnd };
}
