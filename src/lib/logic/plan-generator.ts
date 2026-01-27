// plan generator - rule engine mvp. lowkey the most goofy ahh code ive ever written
// generates farming plans based on user constraints
// uses central plant database cause im organized like that

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

// map profile values to plant data values. n-not like this took forever to figure out or anything
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

    // Determine if conditions are challenging - used for bonus scoring
    const isHarshConditions = 
        profile.waterAvailability === "none" || 
        (profile.waterAvailability === "low" && profile.sunlight === "low") ||
        (profile.soilCondition === "salty" && profile.waterAvailability !== "high");

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

    // Bonus for drought-tolerant plants in low/no water conditions
    if ((profile.waterAvailability === "none" || profile.waterAvailability === "low") && 
        (plant.waterNeed === "low" || plant.waterNeed === "very-low")) {
        score += 25;
        if (!reasons.some(r => r.includes("water"))) {
            reasons.push("Drought-tolerant and low water needs");
        }
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

    // Bonus for shade-tolerant plants in low sunlight conditions
    if (profile.sunlight === "low" && 
        (plant.sunNeed === "shade" || plant.sunNeed === "partial-shade")) {
        score += 20;
        if (!reasons.some(r => r.includes("sunlight") || r.includes("shade"))) {
            reasons.push("Thrives in low light conditions");
        }
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

    // In harsh conditions, give bonus to easy/resilient plants so there's always good options
    if (isHarshConditions && plant.difficulty === "easy") {
        score += 10;
        if (!reasons.some(r => r.includes("Beginner") || r.includes("easy") || r.includes("Hardy"))) {
            reasons.push("Hardy and resilient plant");
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

    // Get top crops - if best scores are very low, still return them but add context
    const topScores = scores.slice(0, topCount);
    
    // If all top scores are very low (challenging conditions), ensure we still provide recommendations
    // by adding "best available" context to the reasons
    const isChallengingConditions = topScores[0]?.score < 30;

    return topScores.map((s) => {
        const avgHarvestDays = Math.round(
            (s.plant.harvestDays.min + s.plant.harvestDays.max) / 2
        );
        
        let reasons = s.reasons.slice(0, 2);
        
        // For challenging conditions, add helpful context if reasons are sparse
        if (isChallengingConditions && reasons.length === 0) {
            // Add fallback reasons based on plant properties
            if (s.plant.difficulty === "easy") {
                reasons.push("Hardy and easy to grow");
            }
            if (s.plant.saltTolerance === "high" || s.plant.saltTolerance === "medium") {
                reasons.push("Tolerates difficult soil conditions");
            }
            if (s.plant.waterNeed === "low" || s.plant.waterNeed === "very-low") {
                reasons.push("Low water requirements");
            }
            if (reasons.length === 0) {
                reasons.push("Best available option for your conditions");
            }
        }
        
        return {
            cropName: s.plant.name,
            reason: reasons.join(". ") + ".",
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
        "plan.view.timeline.steps.surveySpace",
        isContainerBased
            ? "plan.view.timeline.steps.gatherContainers"
            : "plan.view.timeline.steps.markArea",
        "plan.view.timeline.steps.checkWater",
    ];

    if (isLowResource) {
        todaySteps.push("plan.view.timeline.steps.setupWaterCollection");
    }

    const thisWeekSteps: string[] = [
        isContainerBased
            ? "plan.view.timeline.steps.fillContainers"
            : "plan.view.timeline.steps.prepareSoil",
        `plan.view.timeline.steps.obtainSeeds::${crops.map((c) => c.cropName).join(", ")}`,
        "plan.view.timeline.steps.createSchedule",
        "plan.view.timeline.steps.setupShade",
    ];

    if (profile.soilCondition === "salty") {
        thisWeekSteps.push(
            "plan.view.timeline.steps.considerRaised"
        );
    }

    const week2Steps: string[] = [
        "plan.view.timeline.steps.plantSeeds",
        "plan.view.timeline.steps.morningWatering",
        "plan.view.timeline.steps.monitorPests",
        "plan.view.timeline.steps.addMulch",
        "plan.view.timeline.steps.connectGrowers",
    ];

    if (profile.experienceLevel === "beginner") {
        week2Steps.push("plan.view.timeline.steps.keepLog");
    }

    return [
        { label: "plan.view.timeline.today", steps: todaySteps },
        { label: "plan.view.timeline.thisWeek", steps: thisWeekSteps },
        { label: "plan.view.timeline.week2", steps: week2Steps },
    ];
}

function generateChecklist(profile: IFarmProfile): string[] {
    const base = [
        "plan.view.checklist.items.findContainers",
        "plan.view.checklist.items.ensureDrainage",
        "plan.view.checklist.items.prepareSoil",
        "plan.view.checklist.items.sourceSeeds",
        "plan.view.checklist.items.setupWatering",
        "plan.view.checklist.items.planSunShade",
    ];

    if (profile.soilCondition === "salty") {
        base.push("plan.view.checklist.items.saltFlushing");
    }

    if (profile.waterAvailability === "low") {
        base.push("plan.view.checklist.items.waterRecycling");
    }

    if (profile.waterAvailability === "none") {
        base.push("plan.view.checklist.items.establishWater");
    }

    return base.slice(0, 8); // Max 8 items
}

function estimateWaterUsage(crops: IRecommendedCrop[]): number {
    // Assume 1 plant of each recommended crop as starter (matches "Add All to My Farm" behavior)
    // Use seedling stage as baseline (matches the default stage when crops are added)
    let total = 0;
    for (const crop of crops) {
        const plant = Object.values(PLANTS).find((p) => p.name === crop.cropName);
        if (plant) {
            // Use seedling stage to match actual water calculator behavior
            total += plant.waterByStage.seedling * 1; // 1 plant per crop
        }
    }
    return Math.round(total * 100) / 100; // round to 2 decimals. clean numbers only
}

function generateFallbackNotes(profile: IFarmProfile): string {
    const notes: string[] = [];

    // Count how many challenging conditions exist
    const challengingConditions: string[] = [];
    if (profile.waterAvailability === "none") challengingConditions.push("no water access");
    if (profile.waterAvailability === "low") challengingConditions.push("limited water");
    if (profile.sunlight === "low") challengingConditions.push("low sunlight");
    if (profile.soilCondition === "salty") challengingConditions.push("salty soil");

    if (challengingConditions.length >= 3) {
        notes.push(
            `⚠️ Your conditions (${challengingConditions.join(", ")}) are very challenging for growing. The recommended crops are the most resilient options available. Consider: container gardening with imported soil, rainwater collection, and starting with just one or two crops to test what works in your specific situation.`
        );
    } else if (profile.waterAvailability === "none") {
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

    if (profile.sunlight === "low" && profile.soilCondition !== "salty") {
        notes.push(
            "Low sunlight limits your options. Leafy greens and some herbs can tolerate shade better than fruiting plants."
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
