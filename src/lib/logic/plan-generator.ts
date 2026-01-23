// Plan Generator - Rule Engine MVP
// Generates farming plans based on user constraints
// Uses central plant database

import { IFarmProfile } from "../models/farm-profile";
import { IRecommendedCrop, ITimelineBlock } from "../models/plan";
import {
    Difficulty,
    Goal,
    GrowingSpace,
    PLANTS,
    PlantData,
    SunNeed,
    WaterNeed,
    getAllPlants,
} from "../plants";

export interface PlanDraft {
    recommendedCrops: IRecommendedCrop[];
    timeline: ITimelineBlock[];
    setupChecklist: string[];
    estimatedDailyWaterLiters: number;
    fallbackNotes: string;
}

interface CropScore {
    plant: PlantData;
    score: number;
    reasons: string[];
}

// Map profile values to plant data values
const WATER_AVAILABILITY_MAP: Record<string, number> = {
    none: 0,
    low: 1,
    medium: 2,
    high: 3,
};

const WATER_NEED_MAP: Record<WaterNeed, number> = {
    "very-low": 0,
    low: 1,
    medium: 2,
    high: 3,
    "very-high": 4,
};

const SUNLIGHT_MAP: Record<string, number> = {
    low: 1,
    medium: 2,
    high: 3,
};

const SUN_NEED_MAP: Record<SunNeed, number> = {
    shade: 0,
    "partial-shade": 1,
    "partial-sun": 2,
    "full-sun": 3,
};

const SALT_TOLERANCE_SCORE: Record<string, number> = {
    none: -40,
    low: -25,
    medium: 0,
    high: 15,
};

const GOAL_MAP: Record<string, Goal> = {
    calories: "calories",
    nutrition: "nutrition",
    fast: "fast",
};

const SPACE_MAP: Record<string, GrowingSpace> = {
    containers: "containers",
    rooftop: "rooftop",
    balcony: "balcony",
    backyard: "backyard",
    microplot: "microplot",
};

function scorePlant(plant: PlantData, profile: IFarmProfile): CropScore {
    let score = 50; // base score
    const reasons: string[] = [];

    // Water availability scoring
    const userWater = WATER_AVAILABILITY_MAP[profile.waterAvailability] ?? 2;
    const plantWater = WATER_NEED_MAP[plant.waterNeed];

    if (userWater >= plantWater) {
        score += 20;
        reasons.push(`Works well with your ${profile.waterAvailability} water availability`);
    } else if (userWater >= plantWater - 1) {
        score += 5;
        reasons.push("May need careful watering management");
    } else {
        score -= 30;
        reasons.push("Water requirements may be challenging");
    }

    // Sunlight scoring
    const userSun = SUNLIGHT_MAP[profile.sunlight] ?? 2;
    const plantSun = SUN_NEED_MAP[plant.sunNeed];

    // Plants can tolerate more sun than they need, but not less
    if (userSun >= plantSun) {
        score += 15;
        reasons.push(`Suitable for your ${profile.sunlight} sunlight conditions`);
    } else if (userSun >= plantSun - 1) {
        score -= 5;
    } else {
        score -= 20;
    }

    // Soil condition scoring
    if (profile.soilCondition === "salty") {
        const saltScore = SALT_TOLERANCE_SCORE[plant.saltTolerance] ?? 0;
        score += saltScore;
        if (plant.saltTolerance === "high") {
            reasons.push("Tolerates salty soil conditions well");
        } else if (plant.saltTolerance === "medium") {
            reasons.push("Has some salt tolerance");
        }
    }

    // Space type scoring
    const userSpace = SPACE_MAP[profile.spaceType];
    if (userSpace && plant.spaceEfficiency.includes(userSpace)) {
        score += 15;
        reasons.push(`Ideal for ${profile.spaceType} growing`);
    } else {
        score -= 10;
    }

    // Goal fit scoring
    const userGoal = GOAL_MAP[profile.primaryGoal];
    if (userGoal && plant.goalFit.includes(userGoal)) {
        score += 20;
        const goalLabels: Record<Goal, string> = {
            calories: "high calorie production",
            nutrition: "nutritional value",
            fast: "quick harvest",
            income: "income generation",
        };
        reasons.push(`Great for ${goalLabels[userGoal]}`);
    }

    // Fast harvest bonus for "fast" goal
    if (profile.primaryGoal === "fast" && plant.harvestDays.max <= 45) {
        score += 15;
        reasons.push("Quick harvest time");
    }

    // Experience level adjustment
    if (profile.experienceLevel === "beginner") {
        if (plant.difficulty === "hard") {
            score -= 20;
        } else if (plant.difficulty === "easy") {
            score += 15;
            reasons.push("Beginner-friendly crop");
        }
    }

    return { plant, score, reasons };
}

function getTopCrops(profile: IFarmProfile): IRecommendedCrop[] {
    const allPlants = getAllPlants();
    const scores: CropScore[] = allPlants.map((plant) => scorePlant(plant, profile));

    // Sort by score descending
    scores.sort((a, b) => b.score - a.score);

    // Take top 3-4 depending on scores
    const topCount = scores[3]?.score > 40 ? 4 : 3;

    return scores.slice(0, topCount).map((s) => {
        const avgHarvestDays = Math.round(
            (s.plant.harvestDays.min + s.plant.harvestDays.max) / 2
        );
        return {
            cropName: s.plant.name,
            reason: s.reasons.slice(0, 2).join(". ") + ".",
            difficulty: s.plant.difficulty as Difficulty,
            timeToHarvestDays: avgHarvestDays,
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
        thisWeekSteps.push(
            "Consider raised beds or containers to avoid salty ground soil"
        );
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

    if (profile.waterAvailability === "none") {
        base.push("Establish water source or collection system");
    }

    return base.slice(0, 8); // Max 8 items
}

function estimateWaterUsage(crops: IRecommendedCrop[]): number {
    // Assume 2 plants of each recommended crop as starter
    // Use vegetative stage as baseline
    let total = 0;
    for (const crop of crops) {
        const plant = Object.values(PLANTS).find((p) => p.name === crop.cropName);
        if (plant) {
            // Average of seedling and vegetative stages
            const avgWater = (plant.waterByStage.seedling + plant.waterByStage.vegetative) / 2;
            total += avgWater * 2; // 2 plants
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

// Export plant options for UI
export function getPlantOptions(): { value: string; label: string }[] {
    return Object.entries(PLANTS).map(([id, plant]) => ({
        value: id,
        label: plant.name,
    }));
}
