// Plan Generator - Rule Engine MVP
// Generates farming plans based on user constraints

import { IFarmProfile } from "../models/farm-profile";
import { IRecommendedCrop, ITimelineBlock } from "../models/plan";

export interface PlanDraft {
  recommendedCrops: IRecommendedCrop[];
  timeline: ITimelineBlock[];
  setupChecklist: string[];
  estimatedDailyWaterLiters: number;
  fallbackNotes: string;
}

type Difficulty = "easy" | "medium" | "hard";

interface CropData {
  name: string;
  waterNeed: string;
  sunNeed: string;
  saltTolerance: string;
  spaceEfficiency: string[];
  goalFit: string[];
  difficulty: Difficulty;
  harvestDays: number;
  dailyWater: number;
}

// Crop database with characteristics
const CROPS: Record<string, CropData> = {
    tomato: {
        name: "Tomato",
        waterNeed: "high", // low/medium/high
        sunNeed: "high",
        saltTolerance: "low",
        spaceEfficiency: ["containers", "rooftop", "backyard", "microplot"],
        goalFit: ["nutrition"],
        difficulty: "medium",
        harvestDays: 70,
        dailyWater: 0.7, // avg liters per plant
    },
    potato: {
        name: "Potato",
        waterNeed: "medium",
        sunNeed: "medium",
        saltTolerance: "low",
        spaceEfficiency: ["containers", "backyard", "microplot"],
        goalFit: ["calories"],
        difficulty: "medium",
        harvestDays: 90,
        dailyWater: 0.5,
    },
    beans: {
        name: "Beans/Legumes",
        waterNeed: "low",
        sunNeed: "medium",
        saltTolerance: "medium",
        spaceEfficiency: ["containers", "rooftop", "balcony", "backyard", "microplot"],
        goalFit: ["calories", "nutrition"],
        difficulty: "easy",
        harvestDays: 55,
        dailyWater: 0.4,
    },
    leafyGreens: {
        name: "Leafy Greens",
        waterNeed: "low",
        sunNeed: "low",
        saltTolerance: "medium",
        spaceEfficiency: ["containers", "rooftop", "balcony", "backyard", "microplot"],
        goalFit: ["nutrition", "fast"],
        difficulty: "easy",
        harvestDays: 30,
        dailyWater: 0.2,
    },
    cucumber: {
        name: "Cucumber",
        waterNeed: "high",
        sunNeed: "high",
        saltTolerance: "low",
        spaceEfficiency: ["containers", "backyard", "microplot"],
        goalFit: ["nutrition"],
        difficulty: "hard",
        harvestDays: 55,
        dailyWater: 0.8,
    },
    herbs: {
        name: "Herbs (Mint/Basil/Parsley)",
        waterNeed: "low",
        sunNeed: "low",
        saltTolerance: "high",
        spaceEfficiency: ["containers", "rooftop", "balcony", "backyard", "microplot"],
        goalFit: ["fast", "nutrition"],
        difficulty: "easy",
        harvestDays: 21,
        dailyWater: 0.1,
    },
    onions: {
        name: "Onions/Garlic",
        waterNeed: "low",
        sunNeed: "medium",
        saltTolerance: "medium",
        spaceEfficiency: ["containers", "backyard", "microplot"],
        goalFit: ["calories"],
        difficulty: "medium",
        harvestDays: 100,
        dailyWater: 0.15,
    },
};

type CropKey = keyof typeof CROPS;

interface CropScore {
  key: CropKey;
  score: number;
  reasons: string[];
}

function scoreCrop(
    cropKey: CropKey,
    profile: IFarmProfile
): CropScore {
    const crop = CROPS[cropKey];
    let score = 50; // base score
    const reasons: string[] = [];

    // Water availability scoring
    const waterMap: Record<string, number> = { none: 0, low: 1, medium: 2, high: 3 };
    const cropWaterMap: Record<string, number> = { low: 1, medium: 2, high: 3 };
    const userWater = waterMap[profile.waterAvailability];
    const cropWater = cropWaterMap[crop.waterNeed];

    if (userWater >= cropWater) {
        score += 20;
        reasons.push(`Works well with your ${profile.waterAvailability} water availability`);
    } else if (userWater === cropWater - 1) {
        score += 5;
        reasons.push("May need careful watering management");
    } else {
        score -= 30;
        reasons.push("Water requirements may be challenging");
    }

    // Sunlight scoring
    const sunMap: Record<string, number> = { low: 1, medium: 2, high: 3 };
    const userSun = sunMap[profile.sunlight];
    const cropSun = sunMap[crop.sunNeed];

    if (userSun >= cropSun) {
        score += 15;
        reasons.push(`Suitable for your ${profile.sunlight} sunlight conditions`);
    } else {
        score -= 20;
    }

    // Soil condition scoring
    if (profile.soilCondition === "salty") {
        const saltMap: Record<string, number> = { low: -30, medium: 0, high: 15 };
        score += saltMap[crop.saltTolerance];
        if (crop.saltTolerance === "high") {
            reasons.push("Tolerates salty soil conditions well");
        }
    }

    // Space type scoring
    if (crop.spaceEfficiency.includes(profile.spaceType)) {
        score += 15;
        reasons.push(`Ideal for ${profile.spaceType} growing`);
    } else {
        score -= 10;
    }

    // Goal fit scoring
    if (crop.goalFit.includes(profile.primaryGoal)) {
        score += 20;
        const goalLabels = {
            calories: "high calorie production",
            nutrition: "nutritional value",
            fast: "quick harvest",
        };
        reasons.push(`Great for ${goalLabels[profile.primaryGoal]}`);
    }

    // Experience level adjustment
    if (profile.experienceLevel === "beginner" && crop.difficulty === "hard") {
        score -= 15;
    } else if (profile.experienceLevel === "beginner" && crop.difficulty === "easy") {
        score += 10;
        reasons.push("Beginner-friendly crop");
    }

    return { key: cropKey, score, reasons };
}

function getTopCrops(profile: IFarmProfile): IRecommendedCrop[] {
    const scores: CropScore[] = Object.keys(CROPS).map((key) =>
        scoreCrop(key as CropKey, profile)
    );

    // Sort by score descending
    scores.sort((a, b) => b.score - a.score);

    // Take top 3
    return scores.slice(0, 3).map((s) => {
        const crop = CROPS[s.key];
        return {
            cropName: crop.name,
            reason: s.reasons.slice(0, 2).join(". ") + ".",
            difficulty: crop.difficulty,
            timeToHarvestDays: crop.harvestDays,
        };
    });
}

function generateTimeline(
    profile: IFarmProfile,
    crops: IRecommendedCrop[]
): ITimelineBlock[] {
    const isContainerBased = ["containers", "rooftop", "balcony"].includes(
        profile.spaceType
    );
    const isLowResource =
    profile.waterAvailability === "low" || profile.waterAvailability === "none";

    const todaySteps: string[] = [
        "Survey your growing space and note sunlight patterns",
        isContainerBased
            ? "Gather containers with drainage holes"
            : "Mark out your growing area",
        "Check your water source and storage options",
    ];

    if (isLowResource) {
        todaySteps.push("Set up water collection containers if possible");
    }

    const thisWeekSteps: string[] = [
        isContainerBased
            ? "Fill containers with growing medium or soil mix"
            : "Prepare soil - remove debris, loosen top layer",
        `Obtain seeds or seedlings for: ${crops.map((c) => c.cropName).join(", ")}`,
        "Create a simple watering schedule",
        "Set up basic shade protection if needed",
    ];

    if (profile.soilCondition === "salty") {
        thisWeekSteps.push("Consider raised beds or containers to avoid salty ground soil");
    }

    const week2Steps: string[] = [
        "Plant your first seeds following spacing guidelines",
        "Establish morning watering routine",
        "Monitor for pests - check leaves daily",
        "Add mulch to retain moisture",
        "Connect with local growers through the Exchange feature",
    ];

    if (profile.experienceLevel === "beginner") {
        week2Steps.push("Keep a simple log of what you plant and when");
    }

    return [
        { label: "Today", steps: todaySteps },
        { label: "This Week", steps: thisWeekSteps },
        { label: "Week 2+", steps: week2Steps },
    ];
}

function generateChecklist(profile: IFarmProfile): string[] {
    const base = [
        "Find or prepare growing containers/space",
        "Ensure adequate drainage",
        "Prepare soil or growing medium",
        "Source seeds or seedlings",
        "Set up watering system or schedule",
        "Plan for sun/shade management",
    ];

    if (profile.soilCondition === "salty") {
        base.push("Consider salt-flushing or container growing");
    }

    if (profile.waterAvailability === "low") {
        base.push("Set up water recycling/collection");
    }

    return base.slice(0, 8); // Max 8 items
}

function estimateWaterUsage(crops: IRecommendedCrop[]): number {
    // Assume 2 plants of each recommended crop as starter
    let total = 0;
    for (const crop of crops) {
        const cropData = Object.values(CROPS).find((c) => c.name === crop.cropName);
        if (cropData) {
            total += cropData.dailyWater * 2;
        }
    }
    return Math.round(total * 10) / 10; // Round to 1 decimal
}

function generateFallbackNotes(profile: IFarmProfile): string {
    const notes: string[] = [];

    if (profile.waterAvailability === "none") {
        notes.push(
            "⚠️ Without water access, growing is extremely limited. Consider: (1) Setting up rainwater collection, (2) Partnering with neighbors who have water, (3) Using the Exchange to trade for produce while you establish water access."
        );
    }

    if (profile.waterAvailability === "low" && profile.sunlight === "high") {
        notes.push(
            "High sun with low water is challenging. Focus on drought-resistant herbs and consider shade cloth to reduce water loss."
        );
    }

    if (profile.soilCondition === "salty" && profile.spaceType === "backyard") {
        notes.push(
            "Salty backyard soil: Consider raised beds with imported soil, or container gardening as alternatives."
        );
    }

    if (notes.length === 0) {
        notes.push(
            "If conditions become difficult, reduce plant count, focus on hardier crops (herbs, leafy greens), and use the Exchange to supplement your needs."
        );
    }

    return notes.join(" ");
}

export function generatePlan(profile: IFarmProfile): PlanDraft {
    const recommendedCrops = getTopCrops(profile);
    const timeline = generateTimeline(profile, recommendedCrops);
    const setupChecklist = generateChecklist(profile);
    const estimatedDailyWaterLiters = estimateWaterUsage(recommendedCrops);
    const fallbackNotes = generateFallbackNotes(profile);

    return {
        recommendedCrops,
        timeline,
        setupChecklist,
        estimatedDailyWaterLiters,
        fallbackNotes,
    };
}

// Export crop list for water calculator
export const CROP_LIST = Object.entries(CROPS).map(([key, data]) => ({
    value: key,
    label: data.name,
}));
