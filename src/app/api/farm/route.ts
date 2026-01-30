import { auth } from "@/lib/auth";
import { getCountryFromCoords } from "@/lib/geo";
import { calculateWater, WaterEntry } from "@/lib/logic/water-calculator";
import { FarmProfile } from "@/lib/models";
import { connectMongo } from "@/lib/mongo";
import { getPlantById } from "@/lib/plants";
import { NextRequest, NextResponse } from "next/server";

// GET - get current users farm profile or all public farms. i-its not like i made this for you specifically
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        const { searchParams } = new URL(request.url);
        const all = searchParams.get("all") === "true";
        const bounds = searchParams.get("bounds"); // "lat1,lng1,lat2,lng2"

        await connectMongo();

        // return all public farms (for map). lowkey cool to see everyone growing stuff
        if (all) {
            const query: Record<string, unknown> = { 
                isPublic: true,
                onboardingCompleted: true
            };

            // optional: filter by map bounds. gotta optimize or the map will be goofy ahh slow
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

        // return current users profile. n-not like i care about your farm or anything
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const profile = await FarmProfile.findOne({ userId: session.user.id }).lean();

        if (!profile) {
            return NextResponse.json({ profile: null, needsOnboarding: true });
        }

        // calculate water requirements if the profile has crops. hydration is lowkenuinely important
        let waterCalculation = null;
        if (profile.crops && profile.crops.length > 0) {
            const waterEntries: WaterEntry[] = profile.crops.map((c: { plantId: string; stage: string; count: number }) => ({
                plantId: c.plantId,
                stage: c.stage as "seedling" | "vegetative" | "flowering" | "fruiting" | "mature",
                count: c.count,
            }));
            waterCalculation = calculateWater(waterEntries);
        }

        return NextResponse.json({ 
            profile,
            waterCalculation,
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

// POST - create or update farm profile. ts hits different when you finally save your data
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

        // validate required fields. bruh you gotta fill out the form
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

        // get country from coordinates. gotta know where youre farming
        const country = await getCountryFromCoords(latitude, longitude);

        // generate a random farm name if not provided. lowkey cute names fr
        const randomFarmNames = [
            "Sunny Patch", "Green Haven", "Little Sprout", "Happy Harvest", "Tiny Oasis",
            "Urban Eden", "Pocket Garden", "Fresh Start", "Bloom Corner", "Leaf Lane",
            "Veggie Nook", "Garden Joy", "Growth Hub", "Plant Paradise", "Harvest Home",
            "Seed Dream", "Green Thumb", "Nature's Nook", "Sprout Space", "Micro Meadow"
        ];
        const generatedFarmName = farmName?.trim() 
            ? farmName 
            : randomFarmNames[Math.floor(Math.random() * randomFarmNames.length)];

        const profileData = {
            userId: session.user.id,
            userName: session.user.name || undefined,
            farmName: generatedFarmName,
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

// PATCH - update crops and calculate water. n-not like i care about your plants or anything
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

        // validate and enrich crop data. ts pmo when users send bad data
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

        // calculate water requirements. hydration check bestie
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
