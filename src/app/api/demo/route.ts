import { auth } from "@/lib/auth";
import { generatePlan } from "@/lib/logic/plan-generator";
import { calculateWater } from "@/lib/logic/water-calculator";
import {
    AssistantMessage,
    ExchangeListing,
    FarmProfile,
    Plan,
    WaterCalculation,
} from "@/lib/models";
import { connectMongo } from "@/lib/mongo";
import { NextResponse } from "next/server";

// POST - Load demo data
export async function POST() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectMongo();

        const userId = session.user.id;

        // Create demo farm profile and plan
        const demoProfile = await FarmProfile.findOneAndUpdate(
            { userId },
            {
                userId,
                waterAvailability: "medium",
                soilCondition: "normal",
                spaceType: "containers",
                sunlight: "medium",
                primaryGoal: "nutrition",
                experienceLevel: "beginner",
            },
            { upsert: true, new: true }
        );

        const planDraft = generatePlan(demoProfile);
        await Plan.findOneAndUpdate(
            { userId },
            {
                userId,
                farmProfileId: demoProfile._id.toString(),
                ...planDraft,
            },
            { upsert: true, new: true }
        );

        // Create demo exchange listings (5 total) with new structure
        const demoListings = [
            {
                userId,
                type: "seeds",
                mode: "offering",
                dealType: "donation",
                title: "Tomato Seeds - Cherry Variety",
                description: "Saved from last season. Good germination rate.",
                plantType: "tomato",
                quantity: "50 seeds",
                condition: "fresh",
                locationLabel: "City Center",
                latitude: 25.0343,
                longitude: 121.5645,
                country: "TW",
                status: "available",
            },
            {
                userId,
                type: "seeds",
                mode: "offering",
                dealType: "trade",
                tradeItems: ["Basil seeds", "Pepper seeds"],
                title: "Basil Seeds Collection",
                description: "Mix of sweet and Thai basil. Perfect for containers.",
                plantType: "basil",
                quantity: "30 seeds",
                condition: "fresh",
                locationLabel: "North Zone",
                latitude: 25.0500,
                longitude: 121.5300,
                country: "TW",
                status: "available",
            },
            {
                userId,
                type: "produce",
                mode: "offering",
                dealType: "donation",
                title: "Fresh Lettuce - Pick Up Today",
                description: "Harvested this morning. Need to share before it wilts.",
                plantType: "lettuce",
                quantity: "2 kg",
                locationLabel: "East District",
                latitude: 25.0400,
                longitude: 121.5800,
                country: "TW",
                status: "available",
            },
            {
                userId,
                type: "produce",
                mode: "offering",
                dealType: "price",
                price: 100,
                currencyCountry: "TW",
                title: "Extra Tomatoes",
                description: "More than we can eat! Various sizes.",
                plantType: "tomato",
                quantity: "5 kg",
                locationLabel: "West Area",
                latitude: 25.0300,
                longitude: 121.5100,
                country: "TW",
                status: "claimed",
            },
            {
                userId,
                type: "tools",
                mode: "seeking",
                dealType: "trade",
                tradeItems: ["Seeds", "Produce"],
                title: "Looking for Watering Can",
                description: "Need a 5L watering can for my balcony garden.",
                quantity: "1 item",
                locationLabel: "South Zone",
                latitude: 25.0200,
                longitude: 121.5500,
                country: "TW",
                status: "available",
            },
        ];

        // Clear existing demo listings and create new ones
        await ExchangeListing.deleteMany({ userId });
        await ExchangeListing.insertMany(demoListings);

        // Create demo water calculation with new multi-entry format
        const waterResult = calculateWater([
            { plantId: "tomato", stage: "vegetative", count: 4 },
            { plantId: "basil", stage: "vegetative", count: 2 },
        ]);

        await WaterCalculation.findOneAndUpdate(
            { userId },
            {
                userId,
                entries: [
                    { plantId: "tomato", stage: "vegetative", count: 4 },
                    { plantId: "basil", stage: "vegetative", count: 2 },
                ],
                totalLitersPerDay: waterResult.totalDailyLiters,
                results: waterResult.entries,
                tips: waterResult.tips,
            },
            { upsert: true }
        );

        // Create demo assistant messages (3 exchanges)
        await AssistantMessage.deleteMany({ userId });
        await AssistantMessage.insertMany([
            {
                userId,
                role: "user",
                content: "How do I start growing today?",
            },
            {
                userId,
                role: "assistant",
                content: `**Start growing today:**

1. Find 1 container with drainage (bucket, pot, box)
2. Fill with any available soil
3. Plant easy seeds: herbs, leafy greens, or beans
4. Place where sun reaches 4+ hours
5. Water gently until soil is moist
6. Check daily - water when top feels dry

💡 Don't overthink it. Start small, learn as you grow.`,
            },
            {
                userId,
                role: "user",
                content: "What crops need low water?",
            },
            {
                userId,
                role: "assistant",
                content: `**Low-water crops for your situation:**

1. **Herbs** (mint, basil, rosemary) - Very hardy
2. **Leafy greens** - Quick harvest, minimal water
3. **Beans/legumes** - Drought tolerant, fix nitrogen
4. **Onions/garlic** - Store water in bulbs

💡 Mulch heavily to retain moisture - reduces watering by 50%!`,
            },
            {
                userId,
                role: "user",
                content: "How do I check if soil is too salty?",
            },
            {
                userId,
                role: "assistant",
                content: `**Checking for salty soil:**

1. Look for white crust on soil surface
2. Check if plants wilt despite watering
3. Look for brown leaf edges (salt burn)
4. Taste test: dab wet soil on tongue (salty = problem)
5. After rain, check for white residue

**If salty:**
- Flush with lots of fresh water
- Use raised beds with new soil
- Container growing avoids the problem entirely`,
            },
        ]);

        return NextResponse.json({
            success: true,
            message: "Demo data loaded successfully",
            created: {
                profile: 1,
                plan: 1,
                listings: 5,
                waterCalculation: 1,
                assistantMessages: 6,
            },
        });
    } catch (error) {
        console.error("Demo data error:", error);
        return NextResponse.json(
            { error: "Failed to load demo data" },
            { status: 500 }
        );
    }
}
