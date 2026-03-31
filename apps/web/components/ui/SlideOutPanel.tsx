'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SlideOutPanelProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export function SlideOutPanel({ open, onClose, children, title }: SlideOutPanelProps) {
  // Close on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    if (open) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when panel is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 animate-fade-in"
        onClick={onClose}
      />
      
      {/* Panel - Desktop: slide from right, Mobile: slide from bottom */}
      <div
        className={cn(
          "fixed z-50 bg-white shadow-lg",
          // Desktop (md and up): slide from right, 480px wide, pinned to right edge
          "md:top-0 md:bottom-0 md:right-0 md:left-auto md:w-[480px] md:max-h-none md:rounded-none md:animate-slide-right",
          // Mobile: slide from bottom, max 85vh height
          "inset-x-0 bottom-0 max-h-[85vh] rounded-t-2xl animate-slide-up md:animate-none",
          // Scrollable content
          "flex flex-col overflow-hidden"
        )}
      >
        {/* Header with close button and drag handle */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200">
          {/* Mobile drag handle */}
          <div className="w-8 h-1 bg-gray-300 rounded-full mx-auto md:hidden" />
          
          {/* Title */}
          {title && (
            <h2 className="text-lg font-semibold text-gray-900 hidden md:block">
              {title}
            </h2>
          )}
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}