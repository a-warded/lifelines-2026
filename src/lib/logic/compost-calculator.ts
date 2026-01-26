/**
 * Waste-to-Fertilizer Calculator
 * 
 * Converts different types of agricultural waste into estimated organic fertilizer output.
 * Based on typical composting ratios and timeframes.
 */

export type WasteType = 
    | "crop_residue"      // Stalks, leaves, stems
    | "fruit_waste"       // Spoiled/excess fruits
    | "vegetable_waste"   // Spoiled/excess vegetables  
    | "grass_clippings"   // Lawn/field grass
    | "leaves"            // Dry/fallen leaves
    | "manure"            // Animal manure
    | "food_scraps"       // Kitchen waste
    | "sawdust"           // Wood shavings
    | "straw"             // Dry straw/hay
    | "coffee_grounds";   // Used coffee grounds

export interface WasteEntry {
    wasteType: WasteType;
    amountKg: number;
}

export interface CompostResult {
    totalWasteKg: number;
    estimatedFertilizerKg: number;
    conversionRate: number; // percentage
    compostingDays: number;
    nitrogenContent: "high" | "medium" | "low";
    carbonContent: "high" | "medium" | "low";
    cnRatioBalanced: boolean;
    tips: string[];
    breakdown: Array<{
        wasteType: WasteType;
        amountKg: number;
        fertilizerKg: number;
        category: "green" | "brown";
    }>;
}

// Waste conversion data
const WASTE_DATA: Record<WasteType, {
    conversionRate: number; // % of weight retained as compost
    category: "green" | "brown"; // High nitrogen (green) or high carbon (brown)
    cnRatio: number; // Carbon to Nitrogen ratio
    compostDays: number; // Typical days to compost
}> = {
    crop_residue: { conversionRate: 0.35, category: "brown", cnRatio: 60, compostDays: 90 },
    fruit_waste: { conversionRate: 0.25, category: "green", cnRatio: 35, compostDays: 45 },
    vegetable_waste: { conversionRate: 0.25, category: "green", cnRatio: 25, compostDays: 45 },
    grass_clippings: { conversionRate: 0.30, category: "green", cnRatio: 20, compostDays: 30 },
    leaves: { conversionRate: 0.40, category: "brown", cnRatio: 60, compostDays: 120 },
    manure: { conversionRate: 0.45, category: "green", cnRatio: 15, compostDays: 60 },
    food_scraps: { conversionRate: 0.20, category: "green", cnRatio: 20, compostDays: 60 },
    sawdust: { conversionRate: 0.30, category: "brown", cnRatio: 400, compostDays: 180 },
    straw: { conversionRate: 0.35, category: "brown", cnRatio: 80, compostDays: 120 },
    coffee_grounds: { conversionRate: 0.40, category: "green", cnRatio: 20, compostDays: 30 },
};

export const WASTE_TYPE_LABELS: Record<WasteType, { label: string; emoji: string; description: string }> = {
    crop_residue: { 
        label: "Crop residue", 
        emoji: "🌾", 
        description: "Stalks, stems, leaves from harvest" 
    },
    fruit_waste: { 
        label: "Fruit waste", 
        emoji: "🍎", 
        description: "Spoiled or excess fruits" 
    },
    vegetable_waste: { 
        label: "Vegetable waste", 
        emoji: "🥕", 
        description: "Spoiled or excess vegetables" 
    },
    grass_clippings: { 
        label: "Grass clippings", 
        emoji: "🌿", 
        description: "Fresh grass from mowing" 
    },
    leaves: { 
        label: "Dry leaves", 
        emoji: "🍂", 
        description: "Fallen or dried leaves" 
    },
    manure: { 
        label: "Animal manure", 
        emoji: "🐄", 
        description: "Livestock waste" 
    },
    food_scraps: { 
        label: "Kitchen scraps", 
        emoji: "🥗", 
        description: "Peels, eggshells, etc." 
    },
    sawdust: { 
        label: "Sawdust", 
        emoji: "🪵", 
        description: "Untreated wood shavings" 
    },
    straw: { 
        label: "Straw/hay", 
        emoji: "🌿", 
        description: "Dried straw or hay" 
    },
    coffee_grounds: { 
        label: "Coffee grounds", 
        emoji: "☕", 
        description: "Used coffee grounds" 
    },
};

export function calculateCompost(entries: WasteEntry[]): CompostResult {
    if (entries.length === 0) {
        return {
            totalWasteKg: 0,
            estimatedFertilizerKg: 0,
            conversionRate: 0,
            compostingDays: 0,
            nitrogenContent: "low",
            carbonContent: "low",
            cnRatioBalanced: false,
            tips: ["Add some waste materials to calculate your fertilizer potential!"],
            breakdown: [],
        };
    }

    let totalWaste = 0;
    let totalFertilizer = 0;
    let greenWeight = 0;
    let brownWeight = 0;
    let maxDays = 0;
    let weightedCN = 0;

    const breakdown: CompostResult["breakdown"] = [];

    for (const entry of entries) {
        if (entry.amountKg <= 0) continue;
        
        const data = WASTE_DATA[entry.wasteType];
        const fertilizerKg = entry.amountKg * data.conversionRate;
        
        totalWaste += entry.amountKg;
        totalFertilizer += fertilizerKg;
        weightedCN += data.cnRatio * entry.amountKg;
        maxDays = Math.max(maxDays, data.compostDays);
        
        if (data.category === "green") {
            greenWeight += entry.amountKg;
        } else {
            brownWeight += entry.amountKg;
        }

        breakdown.push({
            wasteType: entry.wasteType,
            amountKg: entry.amountKg,
            fertilizerKg: Math.round(fertilizerKg * 100) / 100,
            category: data.category,
        });
    }

    const avgCNRatio = totalWaste > 0 ? weightedCN / totalWaste : 0;
    const cnRatioBalanced = avgCNRatio >= 25 && avgCNRatio <= 35;
    
    // Ideal is about 2-3 parts brown to 1 part green by volume (roughly 50-50 by weight)
    const greenRatio = totalWaste > 0 ? greenWeight / totalWaste : 0;

    // Generate tips
    const tips: string[] = [];
    
    if (greenRatio > 0.7) {
        tips.push("Add more brown materials (leaves, straw) to balance nitrogen and prevent odors.");
    } else if (greenRatio < 0.3) {
        tips.push("Add more green materials (fresh waste, manure) to speed up decomposition.");
    } else {
        tips.push("Good balance of green and brown materials! Your compost should process well.");
    }

    if (avgCNRatio > 35) {
        tips.push("Carbon-heavy mix may decompose slowly. Add nitrogen-rich materials like grass or manure.");
    } else if (avgCNRatio < 25) {
        tips.push("Nitrogen-heavy mix may smell. Add carbon-rich browns like straw or leaves.");
    }

    if (totalWaste >= 50) {
        tips.push("Great volume! Turn the pile every 2-3 weeks for faster decomposition.");
    } else if (totalWaste >= 20) {
        tips.push("Good starting amount. Keep adding materials as you generate more waste.");
    } else {
        tips.push("Small batch - consider collecting more before composting for better results.");
    }

    // Determine nutrient content based on inputs
    const nitrogenContent: "high" | "medium" | "low" = 
        greenRatio > 0.5 ? "high" : greenRatio > 0.3 ? "medium" : "low";
    const carbonContent: "high" | "medium" | "low" = 
        greenRatio < 0.5 ? "high" : greenRatio < 0.7 ? "medium" : "low";

    return {
        totalWasteKg: Math.round(totalWaste * 100) / 100,
        estimatedFertilizerKg: Math.round(totalFertilizer * 100) / 100,
        conversionRate: totalWaste > 0 ? Math.round((totalFertilizer / totalWaste) * 100) : 0,
        compostingDays: maxDays,
        nitrogenContent,
        carbonContent,
        cnRatioBalanced,
        tips,
        breakdown,
    };
}

/**
 * Estimate market value of produced fertilizer
 * Based on average organic compost prices
 */
export function estimateFertilizerValue(fertilizerKg: number, country?: string): {
    lowEstimate: number;
    highEstimate: number;
    currency: string;
} {
    // Average compost price ranges from $0.50 to $2.00 per kg globally
    // This varies greatly by region
    const baseRateLow = 0.50;
    const baseRateHigh = 1.50;
    
    return {
        lowEstimate: Math.round(fertilizerKg * baseRateLow * 100) / 100,
        highEstimate: Math.round(fertilizerKg * baseRateHigh * 100) / 100,
        currency: "USD", // Simplified - in production would use country-specific currency
    };
}

/**
 * Get composting method recommendations based on waste type and quantity
 */
export function getCompostingMethod(totalKg: number, hasManure: boolean): {
    method: string;
    description: string;
    difficulty: "easy" | "medium" | "hard";
    requirements: string[];
} {
    if (totalKg > 500) {
        return {
            method: "Windrow Composting",
            description: "Large-scale outdoor composting in long piles that are regularly turned.",
            difficulty: "hard",
            requirements: [
                "Large open space (minimum 10m x 3m)",
                "Tractor or loader for turning",
                "6-12 months processing time",
                "Regular moisture monitoring",
            ],
        };
    } else if (totalKg > 100 || hasManure) {
        return {
            method: "Hot Composting",
            description: "Active composting with regular turning to maintain high temperatures.",
            difficulty: "medium",
            requirements: [
                "Enclosed bin or pile (1m³ minimum)",
                "Pitchfork for turning",
                "2-3 months processing time",
                "Turn every 2-3 weeks",
                "Keep moist like a wrung sponge",
            ],
        };
    } else {
        return {
            method: "Backyard Bin Composting",
            description: "Simple enclosed bin composting suitable for small-scale waste.",
            difficulty: "easy",
            requirements: [
                "Compost bin or tumbler",
                "Small garden space",
                "3-6 months processing time",
                "Occasional turning",
                "Layer greens and browns",
            ],
        };
    }
}
