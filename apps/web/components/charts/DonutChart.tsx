"use client";

import { useEffect, useState } from "react";

interface DonutChartProps {
  data: Array<{
    label: string;
    value: number;
    color: string;
  }>;
  size?: number;
  strokeWidth?: number;
  showLegend?: boolean;
  centerText?: string;
}

export function DonutChart({
  data,
  size = 200,
  strokeWidth = 20,
  showLegend = true,
  centerText,
}: DonutChartProps) {
  const [animated, setAnimated] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercentage = 0;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={CHART_COLORS.muted}
            strokeWidth={strokeWidth}
          />
          
          {/* Data segments */}
          {data.map((segment, index) => {
            const percentage = total > 0 ? (segment.value / total) * 100 : 0;
            const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
            const strokeDashoffset = -((accumulatedPercentage / 100) * circumference);
            
            const currentSegment = (
              <circle
                key={segment.label}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={segment.color}
                strokeWidth={strokeWidth}
                strokeDasharray={animated ? strokeDasharray : "0 1000"}
                strokeDashoffset={animated ? strokeDashoffset : 0}
                className="transition-all duration-700 ease-out"
                style={{
                  transitionDelay: `${index * 150}ms`,
                }}
              />
            );
            
            accumulatedPercentage += percentage;
            return currentSegment;
          })}
        </svg>
        
        {/* Center text */}
        {centerText && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-center text-sm font-semibold text-gray-900">
              {centerText}
            </span>
          </div>
        )}
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="flex flex-wrap gap-4 justify-center">
          {data.map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-gray-600">
                {item.label} ({item.value})
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}