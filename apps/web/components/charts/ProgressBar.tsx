"use client";

import { useEffect, useState } from "react";

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  className?: string;
  showPercentage?: boolean;
  color?: "green" | "blue" | "orange" | "red";
  size?: "sm" | "md" | "lg";
}

const colorClasses = {
  green: "bg-green-500",
  blue: "bg-blue-500", 
  orange: "bg-orange-500",
  red: "bg-red-500",
};

const sizeClasses = {
  sm: "h-2",
  md: "h-3", 
  lg: "h-4",
};

export function ProgressBar({
  value,
  max = 100,
  label,
  className = "",
  showPercentage = true,
  color = "blue",
  size = "md",
}: ProgressBarProps) {
  const [animatedValue, setAnimatedValue] = useState(0);
  
  const percentage = Math.min((value / max) * 100, 100);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValue(percentage);
    }, 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  return (
    <div className={`w-full ${className}`}>
      {(label || showPercentage) && (
        <div className="mb-2 flex items-center justify-between">
          {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
          {showPercentage && (
            <span className="text-sm text-gray-500">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full ${sizeClasses[size]}`}>
        <div
          className={`${colorClasses[color]} ${sizeClasses[size]} rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${animatedValue}%` }}
        />
      </div>
    </div>
  );
}