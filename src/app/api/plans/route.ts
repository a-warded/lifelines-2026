import { auth } from "@/lib/auth";
import { generatePlan } from "@/lib/logic/plan-generator";
import { FarmProfile, Plan } from "@/lib/models";
import { connectMongo } from "@/lib/mongo";
import { NextRequest, NextResponse } from "next/server";

// POST - Create profile and generate plan
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const {
            waterAvailability,
            soilCondition,
            spaceType,
            sunlight,
            primaryGoal,
            experienceLevel,
        } = body;

        // Validation
        if (!waterAvailability || !soilCondition || !spaceType || !sunlight || !primaryGoal) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        await connectMongo();

        // Create or update farm profile
        const profileData = {
            userId: session.user.id,
            waterAvailability,
            soilCondition,
            spaceType,
            sunlight,
            primaryGoal,
            experienceLevel: experienceLevel || undefined,
        };

        const profile = await FarmProfile.findOneAndUpdate(
            { userId: session.user.id },
            { $set: profileData },
            { upsert: true, new: true, runValidators: true }
        );

        // Generate plan
        const planDraft = generatePlan(profile);

        // Save plan (prefer updating an existing placeholder plan created at signup)
        const placeholderPlan = await Plan.findOne({
            userId: session.user.id,
            $or: [
                { farmProfileId: { $exists: false } },
                { farmProfileId: null },
                { farmProfileId: "" },
            ],
        }).sort({ createdAt: -1 });

        const plan = placeholderPlan
            ? await Plan.findByIdAndUpdate(
                placeholderPlan._id,
                {
                    $set: {
                        farmProfileId: profile._id.toString(),
                        ...planDraft,
                    },
                },
                { new: true, runValidators: true }
            )
            : await Plan.create({
                userId: session.user.id,
                farmProfileId: profile._id.toString(),
                ...planDraft,
            });

        if (!plan) {
            return NextResponse.json(
                { error: "Failed to create plan" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            profile: {
                id: profile._id.toString(),
                ...profileData,
            },
            plan: {
                id: plan._id.toString(),
                ...planDraft,
                createdAt: plan.createdAt,
            },
        });
    } catch (error) {
        console.error("Plan creation error:", error);
        return NextResponse.json(
            { error: "Failed to create plan" },
            { status: 500 }
        );
    }
}

// GET - Fetch user's latest plan or specific plan by id
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const planId = searchParams.get("id");

        await connectMongo();

        let plan;
        if (planId) {
            plan = await Plan.findOne({
                _id: planId,
                userId: session.user.id,
            });
        } else {
            plan = await Plan.findOne({ userId: session.user.id }).sort({
                createdAt: -1,
            });
        }

        if (!plan) {
            return NextResponse.json({ plan: null });
        }

        // Get associated profile (optional for placeholder plans)
        const profile = plan.farmProfileId
            ? await FarmProfile.findById(plan.farmProfileId)
            : null;

        return NextResponse.json({
            plan: {
                id: plan._id.toString(),
                recommendedCrops: plan.recommendedCrops,
                timeline: plan.timeline,
                setupChecklist: plan.setupChecklist,
                estimatedDailyWaterLiters: plan.estimatedDailyWaterLiters,
                fallbackNotes: plan.fallbackNotes,
                createdAt: plan.createdAt,
            },
            profile: profile
                ? {
                    id: profile._id.toString(),
                    waterAvailability: profile.waterAvailability,
                    soilCondition: profile.soilCondition,
                    spaceType: profile.spaceType,
                    sunlight: profile.sunlight,
                    primaryGoal: profile.primaryGoal,
                    experienceLevel: profile.experienceLevel,
                }
                : null,
        });
    } catch (error) {
        console.error("Plan fetch error:", error);
        return NextResponse.json(
            { error: "Failed to fetch plan" },
            { status: 500 }
        );
    }
}
