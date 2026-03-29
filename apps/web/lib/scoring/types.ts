/**
 * Scoring system types for landscape plan evaluation.
 */

export type Zone = "zone0" | "zone1" | "zone2";

export interface PlanPlant {
  plantId: string;
  plantName?: string;
  zone: Zone;
  characterScore?: number;
  placementCode?: string;
  attributes?: Record<string, string>; // attributeName -> value
}

export interface ScoreBreakdownItem {
  plantId: string;
  plantName: string;
  contribution: number; // -100 to +100
  reason: string;
}

export interface CategoryScore {
  score: number;
  breakdown: ScoreBreakdownItem[];
}

export interface ScoreResult {
  fire: CategoryScore;
  pollinator: CategoryScore;
  water: CategoryScore;
  deer: CategoryScore;
}

export interface ScoreSuggestion {
  category: "fire" | "pollinator" | "water" | "deer";
  plantId: string;
  plantName: string;
  suggestion: string;
  estimatedImprovement: number;
}
