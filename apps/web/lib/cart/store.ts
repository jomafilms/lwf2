'use client';

import { useState, useEffect, useCallback, useSyncExternalStore } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CartItem {
  lwfPlantId: string;
  commonName: string;
  botanicalName: string;
  imageUrl: string | null;
  quantity: number;
  containerSize: string;
  nurseryId: string | null;
  price: number; // cents
}

const CART_KEY = 'lwf-plant-cart';

// Container size options with default pricing (cents)
export const CONTAINER_SIZES = [
  { label: '1 gallon', value: '1gal', defaultPrice: 1295 },
  { label: '2 gallon', value: '2gal', defaultPrice: 1995 },
  { label: '5 gallon', value: '5gal', defaultPrice: 3495 },
  { label: '15 gallon', value: '15gal', defaultPrice: 6995 },
] as const;

// ─── External store for SSR-safe localStorage sync ──────────────────────────

let listeners: Array<() => void> = [];
let cachedCart: CartItem[] | null = null;

function emitChange() {
  cachedCart = null; // bust cache
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: () => void) {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function getSnapshot(): CartItem[] {
  if (cachedCart !== null) return cachedCart;
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    cachedCart = raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    cachedCart = [];
  }
  return cachedCart;
}

function getServerSnapshot(): CartItem[] {
  return [];
}

function persist(items: CartItem[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  emitChange();
}

// ─── Cart operations ─────────────────────────────────────────────────────────

export function addToCart(item: Omit<CartItem, 'quantity' | 'containerSize' | 'price'> & Partial<Pick<CartItem, 'quantity' | 'containerSize' | 'price'>>) {
  const cart = getSnapshot();
  const existing = cart.find((c) => c.lwfPlantId === item.lwfPlantId);
  if (existing) return; // already in cart

  const containerSize = item.containerSize || '1gal';
  const sizeInfo = CONTAINER_SIZES.find((s) => s.value === containerSize);
  const price = item.price || sizeInfo?.defaultPrice || 1295;

  const newItem: CartItem = {
    lwfPlantId: item.lwfPlantId,
    commonName: item.commonName,
    botanicalName: item.botanicalName,
    imageUrl: item.imageUrl,
    quantity: item.quantity || 1,
    containerSize,
    nurseryId: item.nurseryId,
    price,
  };

  persist([...cart, newItem]);
}

export function removeFromCart(lwfPlantId: string) {
  const cart = getSnapshot();
  persist(cart.filter((c) => c.lwfPlantId !== lwfPlantId));
}

export function updateQuantity(lwfPlantId: string, quantity: number) {
  const cart = getSnapshot();
  persist(
    cart.map((c) =>
      c.lwfPlantId === lwfPlantId ? { ...c, quantity: Math.max(1, Math.min(10, quantity)) } : c
    )
  );
}

export function updateContainerSize(lwfPlantId: string, containerSize: string) {
  const cart = getSnapshot();
  const sizeInfo = CONTAINER_SIZES.find((s) => s.value === containerSize);
  persist(
    cart.map((c) =>
      c.lwfPlantId === lwfPlantId
        ? { ...c, containerSize, price: sizeInfo?.defaultPrice || c.price }
        : c
    )
  );
}

export function clearCart() {
  persist([]);
}

export function isInCart(lwfPlantId: string): boolean {
  return getSnapshot().some((c) => c.lwfPlantId === lwfPlantId);
}

export function getTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

// ─── React hook ──────────────────────────────────────────────────────────────

export function useCart() {
  const cart = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return {
    items: cart,
    count: cart.length,
    total: getTotal(cart),
    addToCart,
    removeFromCart,
    updateQuantity,
    updateContainerSize,
    clearCart,
    isInCart: useCallback((id: string) => cart.some((c) => c.lwfPlantId === id), [cart]),
    formatPrice,
  };
}
