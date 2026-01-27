// water calculator feature type definitions. hydration check types
import type { GrowthStage, WaterCalculationResult } from "@/lib/logic/water-calculator";
import type { TFunction } from "i18next";

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

export { GrowthStage, WaterCalculationResult };

