// Water Calculator Logic
// Calculates water requirements based on crops, plants, and growth stage

export interface WaterInput {
  cropType: string;
  numberOfPlants: number;
  growthStage: "seedling" | "growing" | "fruiting";
  waterAvailability: "none" | "low" | "medium" | "high";
}

export interface WaterResult {
  dailyLiters: number;
  weeklyLiters: number;
  survivalDailyLiters: number;
  warnings: string[];
}

// Liters per plant per day by crop and growth stage
const WATER_BASELINES: Record<string, Record<string, number>> = {
    tomato: { seedling: 0.2, growing: 0.6, fruiting: 1.0 },
    potato: { seedling: 0.3, growing: 0.5, fruiting: 0.7 },
    beans: { seedling: 0.2, growing: 0.4, fruiting: 0.6 },
    leafyGreens: { seedling: 0.1, growing: 0.2, fruiting: 0.3 },
    cucumber: { seedling: 0.3, growing: 0.7, fruiting: 1.2 },
    herbs: { seedling: 0.05, growing: 0.1, fruiting: 0.15 },
    onions: { seedling: 0.1, growing: 0.15, fruiting: 0.2 },
};

// Default baseline for unknown crops
const DEFAULT_BASELINE = { seedling: 0.2, growing: 0.4, fruiting: 0.6 };

export function calculateWater(input: WaterInput): WaterResult {
    const { cropType, numberOfPlants, growthStage, waterAvailability } = input;

    // Get baseline for crop or use default
    const cropBaseline = WATER_BASELINES[cropType] || DEFAULT_BASELINE;
    const litersPerPlant = cropBaseline[growthStage];

    // Calculate totals
    const dailyLiters = Math.round(litersPerPlant * numberOfPlants * 100) / 100;
    const weeklyLiters = Math.round(dailyLiters * 7 * 100) / 100;
    const survivalDailyLiters = Math.round(dailyLiters * 0.6 * 100) / 100;

    // Generate warnings (max 3)
    const warnings: string[] = [];

    if (waterAvailability === "none") {
        warnings.push(
            "⚠️ No water access: Growing is not feasible. Establish water source first."
        );
    }

    if (waterAvailability === "low" && dailyLiters > 5) {
        warnings.push(
            `⚠️ ${dailyLiters}L daily exceeds low-water capacity. Consider reducing to ${Math.floor(5 / litersPerPlant)} plants.`
        );
    }

    if (waterAvailability === "medium" && dailyLiters > 15) {
        warnings.push(
            `⚠️ ${dailyLiters}L daily is high for medium water availability. Consider reducing plant count.`
        );
    }

    if (dailyLiters > 30) {
        warnings.push(
            "⚠️ Over 30L daily is unrealistic for micro-farming. Strongly consider a smaller operation."
        );
    }

    // Limit to 3 warnings
    return {
        dailyLiters,
        weeklyLiters,
        survivalDailyLiters,
        warnings: warnings.slice(0, 3),
    };
}

// Export crop options for dropdown
export const CROP_OPTIONS = [
    { value: "tomato", label: "Tomato" },
    { value: "potato", label: "Potato" },
    { value: "beans", label: "Beans/Legumes" },
    { value: "leafyGreens", label: "Leafy Greens" },
    { value: "cucumber", label: "Cucumber" },
    { value: "herbs", label: "Herbs" },
    { value: "onions", label: "Onions/Garlic" },
];

export const GROWTH_STAGES = [
    { value: "seedling", label: "Seedling" },
    { value: "growing", label: "Growing" },
    { value: "fruiting", label: "Fruiting/Mature" },
];

export const WATER_LEVELS = [
    { value: "none", label: "None" },
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
];
