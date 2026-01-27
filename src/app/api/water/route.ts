import { auth } from "@/lib/auth";
import { calculateWater, WaterEntry } from "@/lib/logic/water-calculator";
import { WaterCalculation } from "@/lib/models";
import { connectMongo } from "@/lib/mongo";
import { NextRequest, NextResponse } from "next/server";

// POST - calculate and optionally save water usage. bruh hydration is key
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { entries, save } = body as { entries: WaterEntry[]; save?: boolean };

        // validation - gotta make sure the data is good
        if (!entries || !Array.isArray(entries) || entries.length === 0) {
            return NextResponse.json(
                { error: "Please provide at least one plant entry" },
                { status: 400 }
            );
        }

        // validate each entry. ts pmo when people send bad data
        for (const entry of entries) {
            if (!entry.plantId || !entry.stage || !entry.count || entry.count <= 0) {
                return NextResponse.json(
                    { error: "Each entry must have plantId, stage, and count > 0" },
                    { status: 400 }
                );
            }
        }

        // calculate. math time bestie
        const result = calculateWater(entries);

        // optionally save. n-not like i want to remember your water usage or anything
        let savedId = null;
        if (save) {
            await connectMongo();

            const calculation = await WaterCalculation.create({
                userId: session.user.id,
                entries,
                totalLitersPerDay: result.totalDailyLiters,
                results: result.entries,
                tips: result.tips,
            });

            savedId = calculation._id.toString();
        }

        return NextResponse.json({
            success: true,
            result: {
                entries: result.entries,
                totalDailyLiters: result.totalDailyLiters,
                warning: result.warning,
                tips: result.tips,
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

// GET - fetch users water calculation history. lowkey useful for tracking
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
                entries: c.entries,
                totalLitersPerDay: c.totalLitersPerDay,
                results: c.results,
                tips: c.tips,
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
