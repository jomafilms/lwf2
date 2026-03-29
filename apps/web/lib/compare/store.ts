'use client';

import { useState, useEffect, useCallback, useSyncExternalStore } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CompareItem {
  id: string;
  commonName: string;
  botanicalName: string;
  imageUrl: string | null;
}

const COMPARE_KEY = 'lwf-plant-compare';
const MAX_COMPARE_ITEMS = 3;

// ─── External store for SSR-safe localStorage sync ──────────────────────────

let listeners: Array<() => void> = [];
let cachedCompare: CompareItem[] | null = null;

function emitChange() {
  cachedCompare = null; // bust cache
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

function getSnapshot(): CompareItem[] {
  if (cachedCompare !== null) return cachedCompare;
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(COMPARE_KEY);
    cachedCompare = raw ? (JSON.parse(raw) as CompareItem[]) : [];
  } catch {
    cachedCompare = [];
  }
  return cachedCompare;
}

function getServerSnapshot(): CompareItem[] {
  return [];
}

function persist(items: CompareItem[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(COMPARE_KEY, JSON.stringify(items));
  emitChange();
}

// ─── Compare operations ──────────────────────────────────────────────────────

export function addToCompare(item: CompareItem): boolean {
  const compare = getSnapshot();
  
  // Check if already in compare list
  if (compare.some((c) => c.id === item.id)) {
    return false;
  }
  
  // Check if we're at max capacity
  if (compare.length >= MAX_COMPARE_ITEMS) {
    return false;
  }
  
  persist([...compare, item]);
  return true;
}

export function removeFromCompare(id: string) {
  const compare = getSnapshot();
  persist(compare.filter((c) => c.id !== id));
}

export function clearCompare() {
  persist([]);
}

export function isInCompare(id: string): boolean {
  return getSnapshot().some((c) => c.id === id);
}

export function canAddToCompare(): boolean {
  return getSnapshot().length < MAX_COMPARE_ITEMS;
}

export function getCompareUrl(): string {
  const compare = getSnapshot();
  if (compare.length === 0) return '/plants/compare';
  
  const ids = compare.map((c) => c.id).join(',');
  return `/plants/compare?ids=${ids}`;
}

// ─── React hook ──────────────────────────────────────────────────────────────

export function useCompare() {
  const compare = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return {
    items: compare,
    count: compare.length,
    maxItems: MAX_COMPARE_ITEMS,
    isFull: compare.length >= MAX_COMPARE_ITEMS,
    addToCompare: useCallback((item: CompareItem) => {
      return addToCompare(item);
    }, []),
    removeFromCompare: useCallback((id: string) => {
      removeFromCompare(id);
    }, []),
    clearCompare: useCallback(() => {
      clearCompare();
    }, []),
    isInCompare: useCallback((id: string) => compare.some((c) => c.id === id), [compare]),
    canAdd: canAddToCompare(),
    getCompareUrl,
  };
}