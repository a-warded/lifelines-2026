import { auth } from "@/lib/auth";
import { generatePlan } from "@/lib/logic/plan-generator";
import { FarmProfile, Plan } from "@/lib/models";
import { connectMongo } from "@/lib/mongo";
import { getPlantByName } from "@/lib/plants";
import { NextRequest, NextResponse } from "next/server";

// POST - create profile and generate plan. n-not like i care about your farming success or anything
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

        // validation - bruh just fill out the form properly
        if (!waterAvailability || !soilCondition || !spaceType || !sunlight || !primaryGoal) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        await connectMongo();

        // create or update farm profile. lowkey important
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

        // generate plan. ts hits different when the algorithm does its thing
        const planDraft = generatePlan(profile);

        // save plan (prefer updating an existing placeholder plan created at signup). gotta be efficient
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

// GET - fetch users latest plan or specific plan by id. i-its not like i organized this for you
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

        // get associated profile (optional for placeholder plans). lowkey useful
        const profile = plan.farmProfileId
            ? await FarmProfile.findById(plan.farmProfileId)
            : null;

        // recalculate water estimate to ensure consistency with crop manager
        // uses 1 plant per recommended crop at seedling stage (matching "add all to my farm" behavior). deadass important
        let estimatedDailyWaterLiters = 0;
        if (plan.recommendedCrops && plan.recommendedCrops.length > 0) {
            for (const crop of plan.recommendedCrops) {
                const plant = getPlantByName(crop.cropName);
                if (plant) {
                    estimatedDailyWaterLiters += plant.waterByStage.seedling * 1;
                }
            }
            estimatedDailyWaterLiters = Math.round(estimatedDailyWaterLiters * 100) / 100;
        }

        return NextResponse.json({
            plan: {
                id: plan._id.toString(),
                recommendedCrops: plan.recommendedCrops,
                timeline: plan.timeline,
                setupChecklist: plan.setupChecklist,
                estimatedDailyWaterLiters,
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
