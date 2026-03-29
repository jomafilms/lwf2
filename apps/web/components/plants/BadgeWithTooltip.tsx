'use client';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

interface BadgeWithTooltipProps {
  children: React.ReactNode;
  tooltip?: string;
  className?: string;
}

export function BadgeWithTooltip({ children, tooltip, className = '' }: BadgeWithTooltipProps) {
  if (!tooltip) {
    // No tooltip, just return the badge content
    return <span className={className}>{children}</span>;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={`inline-flex items-center gap-1 cursor-help ${className}`}>
            {children}
            <Info className="h-3 w-3 opacity-60 hover:opacity-100 transition-opacity" />
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs text-xs">{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}