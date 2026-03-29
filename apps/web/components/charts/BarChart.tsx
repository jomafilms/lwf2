"use client";

import { useEffect, useState } from "react";
import { CHART_COLORS } from "@/lib/design-tokens";

interface BarChartProps {
  data: Array<{
    label: string;
    value: number;
    color?: string;
  }>;
  height?: number;
  showValues?: boolean;
  className?: string;
}

export function BarChart({
  data,
  height = 200,
  showValues = true,
  className = "",
}: BarChartProps) {
  const [animated, setAnimated] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const maxValue = Math.max(...data.map(d => d.value), 1);
  const barWidth = Math.max(40, Math.min(100, 300 / data.length)); // Responsive bar width
  const chartWidth = data.length * barWidth + (data.length - 1) * 8; // 8px gap between bars

  return (
    <div className={`overflow-x-auto ${className}`}>
      <div className="inline-flex flex-col" style={{ minWidth: chartWidth }}>
        {/* Chart */}
        <div className="relative flex items-end justify-center gap-2" style={{ height }}>
          {data.map((item, index) => {
            const barHeight = animated ? (item.value / maxValue) * (height - 30) : 0;
            const color = item.color || CHART_COLORS.primary; // Default blue
            
            return (
              <div
                key={item.label}
                className="flex flex-col items-center gap-2"
                style={{ width: barWidth }}
              >
                {/* Value label */}
                {showValues && item.value > 0 && (
                  <div className="text-xs font-medium text-gray-600">
                    {item.value}
                  </div>
                )}
                
                {/* Bar */}
                <div
                  className="w-full rounded-t transition-all duration-700 ease-out"
                  style={{
                    backgroundColor: color,
                    height: Math.max(barHeight, 2), // Minimum 2px height for zero values
                    transitionDelay: `${index * 100}ms`,
                  }}
                />
              </div>
            );
          })}
        </div>
        
        {/* X-axis labels */}
        <div className="mt-3 flex justify-center gap-2">
          {data.map((item) => (
            <div
              key={item.label}
              className="text-xs text-gray-500 text-center"
              style={{ width: barWidth }}
            >
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}