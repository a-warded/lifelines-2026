import { auth } from "@/lib/auth";
import { calculateDistance, MAX_LISTING_DISTANCE_KM } from "@/lib/geo";
import { ExchangeClaim, ExchangeListing } from "@/lib/models";
import { connectMongo } from "@/lib/mongo";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// GET - List listings with filters and location-based filtering
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const type = searchParams.get("type"); // seeds/produce/tools/other
        const status = searchParams.get("status"); // available/claimed/completed
        const mode = searchParams.get("mode"); // offering/seeking
        const limit = parseInt(searchParams.get("limit") || "50");
        const myListings = searchParams.get("my") === "true";
        
        // Location filtering
        const lat = parseFloat(searchParams.get("lat") || "");
        const lon = parseFloat(searchParams.get("lon") || "");
        const country = searchParams.get("country") || "";

        await connectMongo();

        // Build query
        const query: Record<string, unknown> = {};
        
        if (type && ["seeds", "produce", "tools", "other"].includes(type)) {
            query.type = type;
        }
        if (status && ["available", "claimed", "completed", "cancelled"].includes(status)) {
            query.status = status;
        } else if (!myListings) {
            // Default to available for public listings
            query.status = "available";
        }
        if (mode && ["offering", "seeking"].includes(mode)) {
            query.mode = mode;
        }
        if (myListings) {
            query.userId = session.user.id;
        }
        
        // Country filtering (required for non-my listings)
        if (!myListings && country) {
            query.country = country.toUpperCase();
        }

        let listings = await ExchangeListing.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 2) // Fetch extra for distance filtering
            .lean();

        // Filter by distance if coordinates provided
        if (!myListings && !isNaN(lat) && !isNaN(lon)) {
            listings = listings.filter((l) => {
                if (!l.latitude || !l.longitude) return false;
                const distance = calculateDistance(lat, lon, l.latitude, l.longitude);
                return distance <= MAX_LISTING_DISTANCE_KM;
            });
        }

        // Limit after filtering
        listings = listings.slice(0, limit);

        return NextResponse.json({
            listings: listings.map((l) => {
                // Calculate distance if coordinates available
                let distance: number | undefined;
                if (!isNaN(lat) && !isNaN(lon) && l.latitude && l.longitude) {
                    distance = Math.round(calculateDistance(lat, lon, l.latitude, l.longitude) * 10) / 10;
                }

                return {
                    id: l._id.toString(),
                    userId: l.userId,
                    userName: l.userName,
                    type: l.type,
                    plantId: l.plantId,
                    title: l.title,
                    description: l.description,
                    quantity: l.quantity,
                    mode: l.mode,
                    dealType: l.dealType,
                    price: l.price,
                    currencyCountry: l.currencyCountry,
                    tradeItems: l.tradeItems,
                    country: l.country,
                    locationLabel: l.locationLabel,
                    distance,
                    status: l.status,
                    createdAt: l.createdAt,
                    isOwner: l.userId === session?.user?.id,
                };
            }),
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
        const {
            type,
            plantId,
            title,
            description,
            quantity,
            mode,
            dealType,
            price,
            tradeItems,
            latitude,
            longitude,
            country,
            locationLabel,
        } = body;

        // Validation
        if (!type || !title || !country) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        if (!["seeds", "produce", "tools", "other"].includes(type)) {
            return NextResponse.json({ error: "Invalid listing type" }, { status: 400 });
        }

        if (!["offering", "seeking"].includes(mode || "offering")) {
            return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
        }

        if (!["price", "trade", "donation"].includes(dealType || "donation")) {
            return NextResponse.json({ error: "Invalid deal type" }, { status: 400 });
        }

        if (dealType === "price" && (price === undefined || price < 0)) {
            return NextResponse.json({ error: "Price is required for priced listings" }, { status: 400 });
        }

        if (dealType === "trade" && (!tradeItems || tradeItems.length === 0)) {
            return NextResponse.json({ error: "Trade items are required for trade listings" }, { status: 400 });
        }

        if (description && description.length > 1000) {
            return NextResponse.json(
                { error: "Description too long (max 1000 chars)" },
                { status: 400 }
            );
        }

        await connectMongo();

        const listing = await ExchangeListing.create({
            userId: session.user.id,
            userName: session.user.name || "Anonymous",
            type,
            plantId: plantId || undefined,
            title: title.trim(),
            description: (description || "").trim(),
            quantity: quantity?.trim() || undefined,
            mode: mode || "offering",
            dealType: dealType || "donation",
            price: dealType === "price" ? price : undefined,
            currencyCountry: dealType === "price" ? country : undefined,
            tradeItems: dealType === "trade" ? tradeItems : undefined,
            latitude: latitude || undefined,
            longitude: longitude || undefined,
            country: country.toUpperCase(),
            locationLabel: locationLabel?.trim() || undefined,
            status: "available",
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
            reopen: "available",
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

// Endpoint to get user's country from Cloudflare header (fallback)
export async function OPTIONS(request: NextRequest) {
    try {
        const headersList = await headers();
        const cfCountry = headersList.get("cf-ipcountry") || "US";
        
        return NextResponse.json({
            country: cfCountry.toUpperCase(),
        });
    } catch (error) {
        return NextResponse.json({ country: "US" });
    }
}
