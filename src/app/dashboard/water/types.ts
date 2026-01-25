// Water calculator feature type definitions
import type { TFunction } from "i18next";
import type { GrowthStage, WaterCalculationResult } from "@/lib/logic/water-calculator";

export type TranslateFunction = TFunction<"translation", undefined>;

export interface PlantEntry {
  id: string;
  plantId: string;
  stage: GrowthStage;
  count: number;
}

export interface WaterHistory {
  date: string;
  total: number;
  plants: string[];
}

export { WaterCalculationResult, GrowthStage };
