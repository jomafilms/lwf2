'use client';

import { useState, useRef, useEffect } from 'react';
import { useDemoRole, type DemoRole } from '@/lib/demo/use-demo-role';
import { ChevronDown, ChevronUp } from 'lucide-react';

const roleOptions: Array<{ value: DemoRole; label: string; emoji: string }> = [
  { value: 'homeowner', label: 'Homeowner', emoji: '🏠' },
  { value: 'landscaper', label: 'Landscaper', emoji: '🌱' },
  { value: 'nursery_admin', label: 'Nursery Admin', emoji: '🏪' },
  { value: 'hoa_admin', label: 'HOA Admin', emoji: '🏘️' },
  { value: 'city_admin', label: 'City Admin', emoji: '🏛️' },
  { value: 'not_signed_in', label: 'Not Signed In', emoji: '👤' },
];

export function DemoRoleSelector() {
  const { demoRole, setDemoRole, isDemoMode } = useDemoRole();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Don't render if not in demo mode
  if (!isDemoMode) {
    return null;
  }

  const currentRole = roleOptions.find(option => option.value === demoRole);
  const displayLabel = currentRole ? `${currentRole.emoji} ${currentRole.label}` : '🎭 Demo Role';

  return (
    <div 
      ref={dropdownRef}
      className="fixed bottom-4 left-4 z-50"
    >
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 rounded-full border border-gray-200 bg-white/90 backdrop-blur-sm px-3 py-2 text-sm font-medium text-gray-700 shadow-lg hover:bg-white hover:shadow-xl transition-all duration-200"
        >
          <span className="text-lg">🎭</span>
          <span className="hidden sm:inline">Demo:</span>
          <span className="max-w-24 truncate">{displayLabel}</span>
          {isOpen ? (
            <ChevronUp className="h-3.5 w-3.5 text-gray-400" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
          )}
        </button>

        {isOpen && (
          <div className="absolute bottom-full mb-2 w-48 origin-bottom-left rounded-lg border border-gray-200 bg-white shadow-xl ring-1 ring-black/5">
            <div className="border-b border-gray-100 px-3 py-2">
              <p className="text-xs font-medium text-gray-900">Demo Role Override</p>
              <p className="text-xs text-gray-500">For presentation mode</p>
            </div>
            <div className="py-1">
              {roleOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setDemoRole(option.value);
                    setIsOpen(false);
                    // Force page reload to update server-side role
                    window.location.reload();
                  }}
                  className={`flex w-full items-center gap-3 px-3 py-2 text-sm text-left hover:bg-gray-50 transition-colors ${
                    demoRole === option.value ? 'bg-orange-50 text-orange-700' : 'text-gray-700'
                  }`}
                >
                  <span className="text-base">{option.emoji}</span>
                  <span className="font-medium">{option.label}</span>
                  {demoRole === option.value && (
                    <span className="ml-auto text-xs text-orange-600">●</span>
                  )}
                </button>
              ))}
              {demoRole && (
                <>
                  <div className="border-t border-gray-100 my-1" />
                  <button
                    onClick={() => {
                      setDemoRole(null);
                      setIsOpen(false);
                      window.location.reload();
                    }}
                    className="flex w-full items-center gap-3 px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-base">🚫</span>
                    <span>Clear Override</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}