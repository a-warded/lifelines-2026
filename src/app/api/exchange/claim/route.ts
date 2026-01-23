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
        const { listingId, claimerName, claimerContact } = body;

        if (!listingId || !claimerName || !claimerContact) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        await connectMongo();

        // Check listing exists and is open
        const listing = await ExchangeListing.findById(listingId);
        if (!listing) {
            return NextResponse.json({ error: "Listing not found" }, { status: 404 });
        }

        if (listing.status !== "open") {
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

        // Create claim
        const claim = await ExchangeClaim.create({
            listingId: listing._id.toString(),
            ownerId: listing.userId,
            claimerId: session.user.id,
            claimerName: claimerName.trim(),
            claimerContact: claimerContact.trim(),
            status: "pending",
        });

        // Update listing status
        listing.status = "claimed";
        await listing.save();

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
                claimerContact: c.claimerContact,
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
