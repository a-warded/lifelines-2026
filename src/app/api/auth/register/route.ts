import { clientPromise } from "@/lib/mongo";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { name, email, password } = await request.json();

        if (!name || !email || !password) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const client = await clientPromise;
        const db = client.db();

        // Check if user already exists
        const existingUser = await db.collection("users").findOne({ email });
        if (existingUser) {
            return NextResponse.json(
                { error: "User already exists" },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const result = await db.collection("users").insertOne({
            name,
            email,
            password: hashedPassword,
            createdAt: new Date(),
        });

        // Create an initial empty plan for this new user.
        // Use the same MongoDB connection as signup (no separate Mongoose connection).
        try {
            const now = new Date();
            await db.collection("plans").insertOne({
                userId: result.insertedId.toString(),
                // farmProfileId intentionally omitted until onboarding is complete
                recommendedCrops: [],
                timeline: [],
                setupChecklist: [],
                estimatedDailyWaterLiters: 0,
                fallbackNotes: "",
                createdAt: now,
                updatedAt: now,
            });
        } catch (planError) {
            // Keep signup atomic: if we can't create the initial plan, roll back the user.
            await db.collection("users").deleteOne({ _id: result.insertedId });
            console.error("Registration error (plan initialization failed):", planError);
            return NextResponse.json(
                { error: "Failed to initialize user plan" },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { message: "User created successfully", userId: result.insertedId },
            { status: 201 }
        );
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
