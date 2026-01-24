import { auth } from "@/lib/auth";
import { getCountryFromCoords } from "@/lib/geo";
import { calculateWater, WaterEntry } from "@/lib/logic/water-calculator";
import { FarmProfile } from "@/lib/models";
import { connectMongo } from "@/lib/mongo";
import { getPlantById } from "@/lib/plants";
import { NextRequest, NextResponse } from "next/server";

// GET - Get current user's farm profile or all public farms
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        const { searchParams } = new URL(request.url);
        const all = searchParams.get("all") === "true";
        const bounds = searchParams.get("bounds"); // "lat1,lng1,lat2,lng2"

        await connectMongo();

        // Return all public farms (for map)
        if (all) {
            const query: Record<string, unknown> = { 
                isPublic: true,
                onboardingCompleted: true
            };

            // Optional: filter by map bounds
            if (bounds) {
                const [lat1, lng1, lat2, lng2] = bounds.split(",").map(Number);
                if (!isNaN(lat1) && !isNaN(lng1) && !isNaN(lat2) && !isNaN(lng2)) {
                    query.latitude = { $gte: Math.min(lat1, lat2), $lte: Math.max(lat1, lat2) };
                    query.longitude = { $gte: Math.min(lng1, lng2), $lte: Math.max(lng1, lng2) };
                }
            }

            const farms = await FarmProfile.find(query)
                .select("userId userName farmName farmEmoji latitude longitude locationLabel country crops spaceType dailyWaterLiters")
                .limit(500)
                .lean();

            return NextResponse.json({ farms });
        }

        // Return current user's profile
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const profile = await FarmProfile.findOne({ userId: session.user.id }).lean();

        if (!profile) {
            return NextResponse.json({ profile: null, needsOnboarding: true });
        }

        return NextResponse.json({ 
            profile,
            needsOnboarding: !profile.onboardingCompleted 
        });
    } catch (error) {
        console.error("Failed to fetch farm profile:", error);
        return NextResponse.json(
            { error: "Failed to fetch profile" },
            { status: 500 }
        );
    }
}

// POST - Create or update farm profile
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const {
            farmName,
            farmEmoji,
            waterAvailability,
            soilCondition,
            spaceType,
            sunlight,
            primaryGoal,
            experienceLevel,
            latitude,
            longitude,
            locationLabel,
            isPublic = true,
            onboardingCompleted = false,
        } = body;

        // Validate required fields
        if (!waterAvailability || !soilCondition || !spaceType || !sunlight || !primaryGoal) {
            return NextResponse.json(
                { error: "Missing required farm details" },
                { status: 400 }
            );
        }

        if (typeof latitude !== "number" || typeof longitude !== "number") {
            return NextResponse.json(
                { error: "Location is required" },
                { status: 400 }
            );
        }

        await connectMongo();

        // Get country from coordinates
        const country = await getCountryFromCoords(latitude, longitude);

        const profileData = {
            userId: session.user.id,
            userName: session.user.name || undefined,
            farmName,
            farmEmoji: farmEmoji || "🌱",
            waterAvailability,
            soilCondition,
            spaceType,
            sunlight,
            primaryGoal,
            experienceLevel,
            latitude,
            longitude,
            locationLabel: locationLabel || undefined,
            country,
            isPublic,
            onboardingCompleted,
        };

        const profile = await FarmProfile.findOneAndUpdate(
            { userId: session.user.id },
            { $set: profileData },
            { upsert: true, new: true }
        );

        return NextResponse.json({ profile });
    } catch (error) {
        console.error("Failed to save farm profile:", error);
        return NextResponse.json(
            { error: "Failed to save profile" },
            { status: 500 }
        );
    }
}

// PATCH - Update crops and calculate water
export async function PATCH(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { crops } = body;

        if (!Array.isArray(crops)) {
            return NextResponse.json(
                { error: "Invalid crops data" },
                { status: 400 }
            );
        }

        await connectMongo();

        // Validate and enrich crop data
        const validCrops = crops
            .filter((c) => c.plantId && c.count > 0)
            .map((c) => {
                const plant = getPlantById(c.plantId);
                return {
                    plantId: c.plantId,
                    plantName: plant?.name || c.plantId,
                    count: c.count,
                    stage: c.stage || "seedling",
                    plantedDate: c.plantedDate ? new Date(c.plantedDate) : undefined,
                    notes: c.notes,
                };
            });

        // Calculate water requirements
        const waterEntries: WaterEntry[] = validCrops.map((c) => ({
            plantId: c.plantId,
            stage: c.stage,
            count: c.count,
        }));
        const waterResult = calculateWater(waterEntries);

        const profile = await FarmProfile.findOneAndUpdate(
            { userId: session.user.id },
            {
                $set: {
                    crops: validCrops,
                    dailyWaterLiters: waterResult.totalDailyLiters,
                },
            },
            { new: true }
        );

        if (!profile) {
            return NextResponse.json(
                { error: "Profile not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ 
            profile,
            waterCalculation: waterResult
        });
    } catch (error) {
        console.error("Failed to update crops:", error);
        return NextResponse.json(
            { error: "Failed to update crops" },
            { status: 500 }
        );
    }
}
