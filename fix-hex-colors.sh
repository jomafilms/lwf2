#!/bin/bash
# Script to replace hardcoded hex values with design tokens

# DonutChart.tsx
sed -i 's/"use client";[\s\S]*import { useEffect, useState } from "react";/"use client";\n\nimport { useEffect, useState } from "react";\nimport { CHART_COLORS } from "@\/lib\/design-tokens";/g' apps/web/components/charts/DonutChart.tsx
sed -i 's/stroke="#f3f4f6"/stroke={CHART_COLORS.muted}/g' apps/web/components/charts/DonutChart.tsx

# PropertyMap.tsx - add import
sed -i '/import { MAP_COLORS } from "@\/lib\/design-tokens";/!s/} from "@\/lib\/geo\/fire-zones";/} from "@\/lib\/geo\/fire-zones";\nimport { MAP_COLORS } from "@\/lib\/design-tokens";/g' apps/web/components/map/PropertyMap.tsx
sed -i 's/"fill-color": "#3B82F6"/"fill-color": MAP_COLORS.parcelFill/g' apps/web/components/map/PropertyMap.tsx
sed -i 's/"line-color": "#3B82F6"/"line-color": MAP_COLORS.parcelStroke/g' apps/web/components/map/PropertyMap.tsx
sed -i 's/"fill-color": "#1e293b"/"fill-color": MAP_COLORS.structureFill/g' apps/web/components/map/PropertyMap.tsx
sed -i 's/"line-color": "#f8fafc"/"line-color": MAP_COLORS.structureStroke/g' apps/web/components/map/PropertyMap.tsx
sed -i 's/"line-color": "#ffffff"/"line-color": MAP_COLORS.drawLine/g' apps/web/components/map/PropertyMap.tsx
sed -i 's/"circle-color": "#ffffff"/"circle-color": MAP_COLORS.drawPoint/g' apps/web/components/map/PropertyMap.tsx
sed -i 's/"circle-stroke-color": "#1e293b"/"circle-stroke-color": MAP_COLORS.drawPointStroke/g' apps/web/components/map/PropertyMap.tsx

# AddToListButton.tsx
sed -i '/import { CHART_COLORS } from "@\/lib\/design-tokens";/!s/} from "@\/lib\/tags\/api";/} from "@\/lib\/tags\/api";\nimport { CHART_COLORS } from "@\/lib\/design-tokens";/g' apps/web/components/plants/AddToListButton.tsx
sed -i 's/backgroundColor: tag.color || "#9ca3af"/backgroundColor: tag.color || CHART_COLORS.muted/g' apps/web/components/plants/AddToListButton.tsx

# Lists page
sed -i '/import { CHART_COLORS } from "@\/lib\/design-tokens";/!s/} from "@\/lib\/tags\/api";/} from "@\/lib\/tags\/api";\nimport { CHART_COLORS } from "@\/lib\/design-tokens";/g' apps/web/app/\(auth\)/dashboard/lists/page.tsx
sed -i 's/const LIST_COLORS = \[[\s\S]*\];/const LIST_COLORS = CHART_COLORS.palette;/g' apps/web/app/\(auth\)/dashboard/lists/page.tsx
sed -i 's/backgroundColor: tag.color || "#9ca3af"/backgroundColor: tag.color || CHART_COLORS.muted/g' apps/web/app/\(auth\)/dashboard/lists/page.tsx

# CityAnalyticsDashboard.tsx
sed -i '/import { CHART_COLORS, SCORE_COLORS } from "@\/lib\/design-tokens";/!s/import { BarChart } from "@\/components\/charts\/BarChart";/import { BarChart } from "@\/components\/charts\/BarChart";\nimport { CHART_COLORS, SCORE_COLORS } from "@\/lib\/design-tokens";/g' apps/web/app/\(auth\)/dashboard/city/CityAnalyticsDashboard.tsx
sed -i 's/compliant: "#22c55e"/compliant: SCORE_COLORS.high.hex/g' apps/web/app/\(auth\)/dashboard/city/CityAnalyticsDashboard.tsx
sed -i 's/"needs-work": "#eab308"/"needs-work": SCORE_COLORS.medium.hex/g' apps/web/app/\(auth\)/dashboard/city/CityAnalyticsDashboard.tsx
sed -i 's/"non-compliant": "#ef4444"/"non-compliant": SCORE_COLORS.low.hex/g' apps/web/app/\(auth\)/dashboard/city/CityAnalyticsDashboard.tsx
sed -i 's/unassessed: "#9ca3af"/unassessed: CHART_COLORS.muted/g' apps/web/app/\(auth\)/dashboard/city/CityAnalyticsDashboard.tsx
sed -i 's/color: "#3b82f6"/color: CHART_COLORS.primary/g' apps/web/app/\(auth\)/dashboard/city/CityAnalyticsDashboard.tsx
sed -i 's/|| "#9ca3af"/|| CHART_COLORS.muted/g' apps/web/app/\(auth\)/dashboard/city/CityAnalyticsDashboard.tsx

# CommunityStatsPage.tsx
sed -i '/import { SCORE_COLORS, CHART_COLORS } from "@\/lib\/design-tokens";/!s/import { BarChart } from "@\/components\/charts\/BarChart";/import { BarChart } from "@\/components\/charts\/BarChart";\nimport { SCORE_COLORS, CHART_COLORS } from "@\/lib\/design-tokens";/g' apps/web/app/\(public\)/community/CommunityStatsPage.tsx
sed -i 's/compliant: "#22c55e"/compliant: SCORE_COLORS.high.hex/g' apps/web/app/\(public\)/community/CommunityStatsPage.tsx
sed -i 's/"needs-work": "#eab308"/"needs-work": SCORE_COLORS.medium.hex/g' apps/web/app/\(public\)/community/CommunityStatsPage.tsx
sed -i 's/"non-compliant": "#ef4444"/"non-compliant": SCORE_COLORS.low.hex/g' apps/web/app/\(public\)/community/CommunityStatsPage.tsx
sed -i 's/unassessed: "#9ca3af"/unassessed: CHART_COLORS.muted/g' apps/web/app/\(public\)/community/CommunityStatsPage.tsx
sed -i 's/color: "#059669"/color: SCORE_COLORS.high.hex/g' apps/web/app/\(public\)/community/CommunityStatsPage.tsx
sed -i 's/|| "#9ca3af"/|| CHART_COLORS.muted/g' apps/web/app/\(public\)/community/CommunityStatsPage.tsx

echo "Design token replacements completed!"