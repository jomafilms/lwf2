/**
 * Design Tokens — Single source of truth for all visual styling
 * 
 * Update these values to change the look of the entire app.
 * Colors here should match tailwind.config.ts extensions.
 */

// ─── Fire Zone Colors ────────────────────────────────────────────────────────

export const ZONE_COLORS = {
  zone0: { bg: "bg-red-500", text: "text-red-700", hex: "#EF4444", label: "Zone 0 (0-5ft)" },
  zone1: { bg: "bg-amber-500", text: "text-amber-700", hex: "#F59E0B", label: "Zone 1 (5-30ft)" },
  zone2: { bg: "bg-green-500", text: "text-green-700", hex: "#22C55E", label: "Zone 2 (30-100ft)" },
} as const;

// ─── Score Colors (fire, pollinator, water, deer) ────────────────────────────

export const SCORE_COLORS = {
  high: { bg: "bg-green-500", text: "text-green-700", hex: "#22c55e", min: 70 },
  medium: { bg: "bg-yellow-500", text: "text-yellow-700", hex: "#eab308", min: 40 },
  low: { bg: "bg-red-500", text: "text-red-700", hex: "#ef4444", min: 0 },
} as const;

export function getScoreColor(score: number) {
  if (score >= SCORE_COLORS.high.min) return SCORE_COLORS.high;
  if (score >= SCORE_COLORS.medium.min) return SCORE_COLORS.medium;
  return SCORE_COLORS.low;
}

// ─── Compliance Status ───────────────────────────────────────────────────────

export const STATUS_COLORS = {
  compliant: { bg: "bg-green-100", text: "text-green-800", dot: "bg-green-500", label: "Compliant" },
  "needs-work": { bg: "bg-yellow-100", text: "text-yellow-800", dot: "bg-yellow-500", label: "Needs Work" },
  "non-compliant": { bg: "bg-red-100", text: "text-red-800", dot: "bg-red-500", label: "Non-Compliant" },
  unassessed: { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400", label: "Not Assessed" },
} as const;

// ─── Chart Colors ────────────────────────────────────────────────────────────

export const CHART_COLORS = {
  primary: "#3b82f6",   // blue-500
  secondary: "#8b5cf6", // violet-500
  success: "#22c55e",   // green-500
  warning: "#eab308",   // yellow-500
  danger: "#ef4444",    // red-500
  info: "#06b6d4",      // cyan-500
  muted: "#9ca3af",     // gray-400
  
  // Ordered palette for lists, tags, pie charts
  palette: [
    "#ef4444", "#f97316", "#eab308", "#22c55e",
    "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899",
  ] as string[],
} as const;

// ─── Map Colors (Mapbox paint properties need hex) ───────────────────────────

export const MAP_COLORS = {
  parcelFill: "#3B82F6",
  parcelStroke: "#3B82F6",
  structureFill: "#1e293b",
  structureStroke: "#f8fafc",
  drawLine: "#ffffff",
  drawPoint: "#ffffff",
  drawPointStroke: "#1e293b",
} as const;

// ─── Spacing & Layout ────────────────────────────────────────────────────────

export const LAYOUT = {
  cardRadius: "rounded-lg",         // change to rounded-xl, rounded-2xl, etc.
  buttonRadius: "rounded-lg",
  badgeRadius: "rounded-full",
  inputRadius: "rounded-lg",
  modalRadius: "rounded-2xl",
  cardShadow: "shadow-sm",
  cardBorder: "border border-gray-200",
  cardPadding: "p-6",
  sectionGap: "space-y-6",
  touchTarget: "min-h-[44px]",      // mobile touch target
  maxContentWidth: "max-w-7xl",
} as const;

// ─── Typography ──────────────────────────────────────────────────────────────

export const TEXT = {
  heading: "font-semibold leading-none tracking-tight",
  subheading: "text-sm text-gray-600",
  body: "text-sm text-gray-700",
  muted: "text-xs text-gray-400",
  label: "text-xs font-medium text-gray-500 uppercase tracking-wide",
} as const;

// ─── Attribute Icons ─────────────────────────────────────────────────────────

export const ATTRIBUTE_ICONS = {
  fire: "🔥",
  pollinator: "🦋",
  water: "💧",
  deer: "🦌",
  native: "🌿",
  maintenance: "🔧",
} as const;

// ─── Score Labels ────────────────────────────────────────────────────────────

export const SCORE_LABELS = {
  fire: { icon: "🔥", label: "Fire Safety" },
  pollinator: { icon: "🦋", label: "Pollinator" },
  water: { icon: "💧", label: "Water Efficiency" },
  deer: { icon: "🦌", label: "Deer Resistance" },
} as const;
