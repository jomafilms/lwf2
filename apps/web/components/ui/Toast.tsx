'use client';

import { useState, useEffect, createContext, useContext, useCallback } from 'react';

interface ToastMessage {
  id: number;
  text: string;
}

let toastId = 0;
let addToastFn: ((text: string) => void) | null = null;

export function toast(text: string) {
  if (addToastFn) addToastFn(text);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((text: string) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2500);
  }, []);

  useEffect(() => {
    addToastFn = addToast;
    return () => { addToastFn = null; };
  }, [addToast]);

  return (
    <>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="animate-slide-up bg-gray-900 text-white px-4 py-2.5 rounded-lg shadow-lg text-sm font-medium"
          >
            {t.text}
          </div>
        ))}
      </div>
    </>
  );
}
