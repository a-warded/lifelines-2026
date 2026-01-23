import { auth } from "@/lib/auth";
import { calculateWater } from "@/lib/logic/water-calculator";
import { WaterCalculation } from "@/lib/models";
import { connectMongo } from "@/lib/mongo";
import { NextRequest, NextResponse } from "next/server";

// POST - Calculate and optionally save water usage
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { cropType, numberOfPlants, growthStage, waterAvailability, save } = body;

        // Validation
        if (!cropType || !numberOfPlants || !growthStage || !waterAvailability) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        if (numberOfPlants <= 0) {
            return NextResponse.json(
                { error: "Number of plants must be greater than 0" },
                { status: 400 }
            );
        }

        // Calculate
        const result = calculateWater({
            cropType,
            numberOfPlants,
            growthStage,
            waterAvailability,
        });

        // Optionally save
        let savedId = null;
        if (save) {
            await connectMongo();

            const calculation = await WaterCalculation.create({
                userId: session.user.id,
                cropType,
                numberOfPlants,
                growthStage,
                waterAvailability,
                ...result,
            });

            savedId = calculation._id.toString();
        }

        return NextResponse.json({
            success: true,
            result: {
                ...result,
                id: savedId,
            },
        });
    } catch (error) {
        console.error("Water calculation error:", error);
        return NextResponse.json(
            { error: "Failed to calculate water usage" },
            { status: 500 }
        );
    }
}

// GET - Fetch user's water calculation history
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get("limit") || "10");

        await connectMongo();

        const calculations = await WaterCalculation.find({ userId: session.user.id })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        return NextResponse.json({
            calculations: calculations.map((c) => ({
                id: c._id.toString(),
                cropType: c.cropType,
                numberOfPlants: c.numberOfPlants,
                growthStage: c.growthStage,
                waterAvailability: c.waterAvailability,
                dailyLiters: c.dailyLiters,
                weeklyLiters: c.weeklyLiters,
                survivalDailyLiters: c.survivalDailyLiters,
                warnings: c.warnings,
                createdAt: c.createdAt,
            })),
        });
    } catch (error) {
        console.error("Water history fetch error:", error);
        return NextResponse.json(
            { error: "Failed to fetch water history" },
            { status: 500 }
        );
    }
}
