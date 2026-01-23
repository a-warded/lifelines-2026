import { auth } from "@/lib/auth";
import { ExchangeClaim, ExchangeListing } from "@/lib/models";
import { connectMongo } from "@/lib/mongo";
import { NextRequest, NextResponse } from "next/server";

// GET - List listings with filters
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const type = searchParams.get("type"); // seed/surplus/tool
        const status = searchParams.get("status"); // open/claimed/completed
        const limit = parseInt(searchParams.get("limit") || "20");
        const myListings = searchParams.get("my") === "true";

        await connectMongo();

        // Build query
        const query: Record<string, unknown> = {};
        if (type && ["seed", "surplus", "tool"].includes(type)) {
            query.type = type;
        }
        if (status && ["open", "claimed", "completed", "cancelled"].includes(status)) {
            query.status = status;
        }
        if (myListings) {
            query.userId = session.user.id;
        }

        const listings = await ExchangeListing.find(query)
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        return NextResponse.json({
            listings: listings.map((l) => ({
                id: l._id.toString(),
                userId: l.userId,
                type: l.type,
                title: l.title,
                description: l.description,
                quantity: l.quantity,
                unit: l.unit,
                condition: l.condition,
                locationArea: l.locationArea,
                contact: l.contact,
                status: l.status,
                createdAt: l.createdAt,
                isOwner: l.userId === session?.user?.id,
            })),
        });
    } catch (error) {
        console.error("Listings fetch error:", error);
        return NextResponse.json(
            { error: "Failed to fetch listings" },
            { status: 500 }
        );
    }
}

// POST - Create a new listing
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { type, title, description, quantity, unit, condition, locationArea, contact } =
      body;

        // Validation
        if (!type || !title || !quantity || !unit || !locationArea || !contact) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        if (!["seed", "surplus", "tool"].includes(type)) {
            return NextResponse.json({ error: "Invalid listing type" }, { status: 400 });
        }

        if (quantity <= 0) {
            return NextResponse.json(
                { error: "Quantity must be greater than 0" },
                { status: 400 }
            );
        }

        if (description && description.length > 500) {
            return NextResponse.json(
                { error: "Description too long (max 500 chars)" },
                { status: 400 }
            );
        }

        await connectMongo();

        const listing = await ExchangeListing.create({
            userId: session.user.id,
            type,
            title: title.trim(),
            description: (description || "").trim(),
            quantity,
            unit,
            condition: type === "seed" ? condition || "unknown" : undefined,
            locationArea: locationArea.trim(),
            contact: contact.trim(),
            status: "open",
        });

        return NextResponse.json({
            success: true,
            listing: {
                id: listing._id.toString(),
                type: listing.type,
                title: listing.title,
                status: listing.status,
                createdAt: listing.createdAt,
            },
        });
    } catch (error) {
        console.error("Listing creation error:", error);
        return NextResponse.json(
            { error: "Failed to create listing" },
            { status: 500 }
        );
    }
}

// PATCH - Update listing status (complete/cancel)
export async function PATCH(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { listingId, action } = body;

        if (!listingId || !action) {
            return NextResponse.json(
                { error: "Missing listingId or action" },
                { status: 400 }
            );
        }

        if (!["complete", "cancel", "reopen"].includes(action)) {
            return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }

        await connectMongo();

        const listing = await ExchangeListing.findOne({
            _id: listingId,
            userId: session.user.id,
        });

        if (!listing) {
            return NextResponse.json({ error: "Listing not found" }, { status: 404 });
        }

        const statusMap: Record<string, string> = {
            complete: "completed",
            cancel: "cancelled",
            reopen: "open",
        };

        listing.status = statusMap[action] as typeof listing.status;
        await listing.save();

        // If cancelled/reopened, update related claims
        if (action === "cancel" || action === "reopen") {
            await ExchangeClaim.updateMany(
                { listingId: listing._id.toString(), status: "pending" },
                { status: action === "cancel" ? "cancelled" : "pending" }
            );
        }

        return NextResponse.json({
            success: true,
            status: listing.status,
        });
    } catch (error) {
        console.error("Listing update error:", error);
        return NextResponse.json(
            { error: "Failed to update listing" },
            { status: 500 }
        );
    }
}
