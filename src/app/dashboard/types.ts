import { GrowthStage } from "@/lib/plants";
import type { TFunction } from "i18next";

// type alias for i18next translation function. fancy type magic
export type TranslateFunction = TFunction<"translation", undefined>;

export interface CropEntry {
  plantId: string;
  plantName: string;
  count: number;
  stage: GrowthStage;
  plantedDate?: string;
  notes?: string;
}

export interface WaterCalculation {
  entries: Array<{
    plantId: string;
    plantName: string;
    stage: GrowthStage;
    count: number;
    litersPerPlant: number;
    totalLiters: number;
  }>;
  totalDailyLiters: number;
  warning?: string;
  tips: string[];
}

export interface FarmProfile {
  userId: string;
  userName?: string;
  farmName?: string;
  latitude: number;
  longitude: number;
  locationLabel?: string;
  country?: string;
  crops: CropEntry[];
  spaceType: string;
  dailyWaterLiters: number;
  // extended properties that may exist. bonus fields ig
  waterAvailability?: string;
  soilCondition?: string;
  sunlight?: string;
  primaryGoal?: string;
  experienceLevel?: string;
}

export interface PlanPreview {
  id: string;
  recommendedCrops: Array<{
    cropName: string;
    difficulty: string;
  }>;
  estimatedDailyWaterLiters: number;
  createdAt: string;
}

export interface PlanFormData {
  waterAvailability: string;
  soilCondition: string;
  spaceType: string;
  sunlight: string;
  primaryGoal: string;
  experienceLevel: string;
}

export interface QuickActionFeature {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}
