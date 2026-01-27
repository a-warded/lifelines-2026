// water calculator - uses central plant database
// calculates water requirements for multiple plant entries. i-its not like i care about your plants staying hydrated...

import { GrowthStage, getPlantById, getPlantOptions } from "../plants";

export interface WaterEntry {
    plantId: string;
    stage: GrowthStage;
    count: number;
}

export interface WaterResult {
    plantId: string;
    plantName: string;
    stage: GrowthStage;
    count: number;
    litersPerPlant: number;
    totalLiters: number;
}

export interface WaterCalculationResult {
    entries: WaterResult[];
    totalDailyLiters: number;
    warning?: string;
    tips: string[];
}

// growth stage labels for display. lowkey self explanatory
export const GROWTH_STAGES: { value: GrowthStage; label: string }[] = [
    { value: "seedling", label: "Seedling" },
    { value: "vegetative", label: "Vegetative" },
    { value: "flowering", label: "Flowering" },
    { value: "fruiting", label: "Fruiting" },
    { value: "mature", label: "Mature" },
];

// water level thresholds for warnings. bruh if you hit these your plants are thirsty af
const HIGH_WATER_THRESHOLD = 10; // liters/day
const VERY_HIGH_WATER_THRESHOLD = 20; // liters/day deadass

export function calculateWater(entries: WaterEntry[]): WaterCalculationResult {
    const results: WaterResult[] = [];
    let totalDailyLiters = 0;

    for (const entry of entries) {
        if (!entry.plantId || entry.count <= 0) continue;

        const plant = getPlantById(entry.plantId);
        if (!plant) continue;

        const litersPerPlant = plant.waterByStage[entry.stage];
        const totalLiters = litersPerPlant * entry.count;

        results.push({
            plantId: entry.plantId,
            plantName: plant.name,
            stage: entry.stage,
            count: entry.count,
            litersPerPlant: Math.round(litersPerPlant * 100) / 100,
            totalLiters: Math.round(totalLiters * 100) / 100,
        });

        totalDailyLiters += totalLiters;
    }

    // Round total
    totalDailyLiters = Math.round(totalDailyLiters * 100) / 100;

    // Generate warning if needed
    let warning: string | undefined;
    if (totalDailyLiters >= VERY_HIGH_WATER_THRESHOLD) {
        warning =
            "⚠️ Very high water demand! Consider reducing plant count, using mulch, or setting up drip irrigation to conserve water.";
    } else if (totalDailyLiters >= HIGH_WATER_THRESHOLD) {
        warning =
            "⚠️ High water demand. Consider water-saving techniques like mulching and drip irrigation.";
    }

    // Generate contextual tips
    const tips = generateTips(results, totalDailyLiters);

    return {
        entries: results,
        totalDailyLiters,
        warning,
        tips,
    };
}

function generateTips(results: WaterResult[], totalLiters: number): string[] {
    const tips: string[] = [];

    // Always include basic tips
    tips.push("Water early morning or late evening to reduce evaporation.");

    // High water plants tip
    const highWaterPlants = results.filter((r) => {
        const plant = getPlantById(r.plantId);
        return plant && (plant.waterNeed === "high" || plant.waterNeed === "very-high");
    });

    if (highWaterPlants.length > 0) {
        tips.push(
            `${highWaterPlants.map((p) => p.plantName).join(", ")} need${highWaterPlants.length === 1 ? "s" : ""} consistent moisture. Don't let soil dry out completely.`
        );
    }

    // Fruiting stage tip
    const fruitingPlants = results.filter((r) => r.stage === "fruiting");
    if (fruitingPlants.length > 0) {
        tips.push(
            "Plants in fruiting stage need the most water. Reduce watering slightly as they mature."
        );
    }

    // Container tip
    tips.push("Containers dry out faster than ground soil. Check moisture daily.");

    // Multiple plants tip
    if (totalLiters > 5) {
        tips.push(
            "Consider grouping plants with similar water needs together for more efficient watering."
        );
    }

    // Mulching tip
    if (totalLiters > 3) {
        tips.push("Add 5-10cm of mulch around plants to retain moisture and reduce watering needs by up to 50%.");
    }

    return tips.slice(0, 4); // Max 4 tips
}

// calculate water for a single plant (convenience function cause im nice like that)
export function calculateSinglePlantWater(
    plantId: string,
    stage: GrowthStage,
    count: number
): WaterResult | null {
    const plant = getPlantById(plantId);
    if (!plant) return null;

    const litersPerPlant = plant.waterByStage[stage];
    const totalLiters = litersPerPlant * count;

    return {
        plantId,
        plantName: plant.name,
        stage,
        count,
        litersPerPlant: Math.round(litersPerPlant * 100) / 100,
        totalLiters: Math.round(totalLiters * 100) / 100,
    };
}

// get all plant options for dropdowns. ts pmo having to export everything
export { getPlantOptions };

// re-export growth stages type cause imports are lowkey confusing
    export type { GrowthStage };

