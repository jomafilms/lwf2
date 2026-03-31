"use client";

import { Check } from "lucide-react";
import type { HardeningItemData, Priority, CostRange } from "@/app/hardening/page";

interface HardeningItemProps {
  item: HardeningItemData;
  isLast?: boolean;
  onToggle: (completed: boolean) => void;
}

export function HardeningItem({ item, isLast = false, onToggle }: HardeningItemProps) {
  const getPriorityConfig = (priority: Priority) => {
    switch (priority) {
      case "critical":
        return {
          emoji: "🔴",
          label: "Critical",
          color: "text-red-600",
          bgColor: "bg-red-50",
        };
      case "important":
        return {
          emoji: "🟡",
          label: "Important", 
          color: "text-amber-600",
          bgColor: "bg-amber-50",
        };
      case "nice-to-have":
        return {
          emoji: "🟢",
          label: "Nice-to-have",
          color: "text-green-600", 
          bgColor: "bg-green-50",
        };
    }
  };

  const getCostLabel = (cost: CostRange) => {
    switch (cost) {
      case "$":
        return { label: "Low cost", desc: "Under $500" };
      case "$$":
        return { label: "Medium cost", desc: "$500-$2000" };
      case "$$$":
        return { label: "High cost", desc: "$2000+" };
    }
  };

  const priority = getPriorityConfig(item.priority);
  const cost = getCostLabel(item.cost);

  return (
    <div className={`px-6 py-4 ${isLast ? "" : ""}`}>
      <div className="flex gap-4">
        {/* Checkbox */}
        <button
          onClick={() => onToggle(!item.completed)}
          className={`flex-shrink-0 mt-1 w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
            item.completed
              ? "bg-green-500 border-green-500 text-white"
              : "border-gray-300 hover:border-green-400"
          }`}
        >
          {item.completed && <Check className="h-4 w-4" />}
        </button>

        {/* Content */}
        <div className="flex-1 space-y-2">
          {/* Title and completion state */}
          <div className="flex items-start justify-between gap-3">
            <h4
              className={`font-medium leading-snug transition-all ${
                item.completed
                  ? "text-gray-500 line-through"
                  : "text-gray-900"
              }`}
            >
              {item.title}
            </h4>
          </div>

          {/* Description */}
          <p
            className={`text-sm leading-relaxed transition-all ${
              item.completed ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {item.description}
          </p>

          {/* Priority and cost badges */}
          <div className="flex items-center gap-2 pt-1">
            {/* Priority badge */}
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${priority.bgColor} ${priority.color}`}
            >
              <span className="text-[10px]">{priority.emoji}</span>
              {priority.label}
            </span>

            {/* Cost badge */}
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
              <span className="font-semibold">{item.cost}</span>
              <span className="text-gray-500">{cost.desc}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}