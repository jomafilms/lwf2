"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { HardeningItem } from "./HardeningItem";
import type { HardeningCategoryData } from "@/app/hardening/page";

interface HardeningChecklistProps {
  categories: HardeningCategoryData[];
  onUpdateItem: (categoryId: string, itemId: string, completed: boolean) => void;
}

export function HardeningChecklist({ categories, onUpdateItem }: HardeningChecklistProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    () => new Set(categories.map(cat => cat.id))
  );

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const getCategoryCompletion = (category: HardeningCategoryData) => {
    const completed = category.items.filter(item => item.completed).length;
    const total = category.items.length;
    return { completed, total, percentage: total > 0 ? (completed / total) * 100 : 0 };
  };

  return (
    <div className="space-y-4">
      {categories.map((category) => {
        const isExpanded = expandedCategories.has(category.id);
        const completion = getCategoryCompletion(category);
        
        return (
          <div
            key={category.id}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden"
          >
            {/* Category Header */}
            <button
              onClick={() => toggleCategory(category.id)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3 text-left">
                <span className="text-2xl">{category.icon}</span>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {category.title}
                  </h3>
                  <p className="text-sm text-gray-500">{category.description}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Progress indicator */}
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {completion.completed}/{completion.total}
                  </div>
                  <div className="text-xs text-gray-500">
                    {Math.round(completion.percentage)}% complete
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      completion.percentage === 100
                        ? "bg-green-500"
                        : completion.percentage > 50
                        ? "bg-amber-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${completion.percentage}%` }}
                  />
                </div>
                
                {/* Expand/collapse icon */}
                {isExpanded ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </button>

            {/* Category Items */}
            {isExpanded && (
              <div className="border-t border-gray-100">
                <div className="divide-y divide-gray-100">
                  {category.items.map((item, index) => (
                    <HardeningItem
                      key={item.id}
                      item={item}
                      isLast={index === category.items.length - 1}
                      onToggle={(completed) => onUpdateItem(category.id, item.id, completed)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}