'use client';

import { useState, useEffect } from 'react';

export type DemoRole = 'homeowner' | 'landscaper' | 'nursery_admin' | 'hoa_admin' | 'city_admin' | 'not_signed_in';

export function useDemoRole() {
  const [demoRole, setDemoRole] = useState<DemoRole | null>(null);

  useEffect(() => {
    // Only work in demo mode
    if (process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
      return;
    }

    // Read from localStorage
    const stored = localStorage.getItem('demo-role');
    if (stored) {
      setDemoRole(stored as DemoRole);
    }
  }, []);

  const setRole = (role: DemoRole | null) => {
    if (process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
      return;
    }

    setDemoRole(role);
    
    if (role) {
      // Store in localStorage
      localStorage.setItem('demo-role', role);
      
      // Store in cookie for SSR access
      document.cookie = `demo-role=${role}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days
    } else {
      localStorage.removeItem('demo-role');
      // Clear cookie
      document.cookie = 'demo-role=; path=/; max-age=0';
    }
  };

  return {
    demoRole,
    setDemoRole: setRole,
    isDemoMode: process.env.NEXT_PUBLIC_DEMO_MODE === 'true',
  };
}