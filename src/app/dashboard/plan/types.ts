// Plan feature type definitions

export interface RecommendedCrop {
  cropName: string;
  reason: string;
  difficulty: "easy" | "medium" | "hard";
  timeToHarvestDays: number;
}

export interface TimelineBlock {
  label: "Today" | "This Week" | "Week 2+" | "plan.view.timeline.today" | "plan.view.timeline.thisWeek" | "plan.view.timeline.week2";
  steps: string[];
}

export interface Plan {
  id: string;
  recommendedCrops: RecommendedCrop[];
  timeline: TimelineBlock[];
  setupChecklist: string[];
  estimatedDailyWaterLiters: number;
  fallbackNotes: string;
  createdAt: string;
}

export interface Profile {
  waterAvailability: string;
  soilCondition: string;
  spaceType: string;
  sunlight: string;
  primaryGoal: string;
}

export const DIFFICULTY_COLORS = {
    easy: "success",
    medium: "warning",
    hard: "danger",
} as const;
