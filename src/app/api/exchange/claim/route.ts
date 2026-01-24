import { auth } from "@/lib/auth";
import { ExchangeClaim, ExchangeListing } from "@/lib/models";
import { connectMongo } from "@/lib/mongo";
import { NextRequest, NextResponse } from "next/server";

// POST - Claim a listing
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { listingId, message, tradeOffer } = body;

        if (!listingId) {
            return NextResponse.json(
                { error: "Missing listing ID" },
                { status: 400 }
            );
        }

        await connectMongo();

        // Check listing exists and is open
        const listing = await ExchangeListing.findById(listingId);
        if (!listing) {
            return NextResponse.json({ error: "Listing not found" }, { status: 404 });
        }

        if (listing.status !== "available") {
            return NextResponse.json(
                { error: "Listing is not available for claiming" },
                { status: 400 }
            );
        }

        if (listing.userId === session.user.id) {
            return NextResponse.json(
                { error: "Cannot claim your own listing" },
                { status: 400 }
            );
        }

        // Check if user already claimed this listing
        const existingClaim = await ExchangeClaim.findOne({
            listingId: listing._id.toString(),
            claimerId: session.user.id,
        });

        if (existingClaim) {
            return NextResponse.json(
                { error: "You have already expressed interest in this listing" },
                { status: 400 }
            );
        }

        // Create claim (expression of interest)
        const claim = await ExchangeClaim.create({
            listingId: listing._id.toString(),
            ownerId: listing.userId,
            claimerId: session.user.id,
            claimerName: session.user.name || "Anonymous",
            message: message?.trim() || "",
            tradeOffer: tradeOffer?.trim() || "",
            status: "pending",
        });

        // Don't change listing status - allow multiple people to express interest
        // Owner can choose who to give it to

        return NextResponse.json({
            success: true,
            claim: {
                id: claim._id.toString(),
                status: claim.status,
                createdAt: claim.createdAt,
            },
        });
    } catch (error) {
        console.error("Claim creation error:", error);
        return NextResponse.json(
            { error: "Failed to create claim" },
            { status: 500 }
        );
    }
}

// GET - Get claims for user's listings
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const listingId = searchParams.get("listingId");

        await connectMongo();

        const query: Record<string, unknown> = { ownerId: session.user.id };
        if (listingId) {
            query.listingId = listingId;
        }

        const claims = await ExchangeClaim.find(query)
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({
            claims: claims.map((c) => ({
                id: c._id.toString(),
                listingId: c.listingId,
                claimerName: c.claimerName,
                message: c.message,
                tradeOffer: c.tradeOffer,
                status: c.status,
                createdAt: c.createdAt,
            })),
        });
    } catch (error) {
        console.error("Claims fetch error:", error);
        return NextResponse.json(
            { error: "Failed to fetch claims" },
            { status: 500 }
        );
    }
}
