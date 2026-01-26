import { auth } from "@/lib/auth";
import { calculateDistance, getCountryFromCoords } from "@/lib/geo";
import { CompostSite } from "@/lib/models/compost-site";
import { connectMongo } from "@/lib/mongo";
import { NextRequest, NextResponse } from "next/server";

const MAX_COMPOST_DISTANCE_KM = 100; // Show compost sites within 100km

// GET - Get compost sites (all public or user's own)
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        const { searchParams } = new URL(request.url);
        const all = searchParams.get("all") === "true";
        const my = searchParams.get("my") === "true";
        const lat = parseFloat(searchParams.get("lat") || "");
        const lon = parseFloat(searchParams.get("lon") || "");
        const country = searchParams.get("country") || "";
        const limit = parseInt(searchParams.get("limit") || "100");

        await connectMongo();

        // Return user's own compost sites
        if (my) {
            if (!session?.user?.id) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }

            const sites = await CompostSite.find({ userId: session.user.id })
                .sort({ createdAt: -1 })
                .lean();

            return NextResponse.json({
                sites: sites.map((s) => ({
                    id: s._id.toString(),
                    ...s,
                    isOwner: true,
                })),
            });
        }

        // Return all public compost sites
        if (all) {
            const query: Record<string, unknown> = { isPublic: true };
            
            if (country) {
                query.country = country.toUpperCase();
            }

            let sites = await CompostSite.find(query)
                .select("userId userName siteName siteEmoji siteType description acceptsWaste sellsFertilizer capacityKg currentLoadKg latitude longitude locationLabel country isVerified")
                .limit(limit * 2)
                .lean();

            // Filter by distance if coordinates provided
            if (!isNaN(lat) && !isNaN(lon)) {
                sites = sites.filter((s) => {
                    const distance = calculateDistance(lat, lon, s.latitude, s.longitude);
                    return distance <= MAX_COMPOST_DISTANCE_KM;
                });
            }

            sites = sites.slice(0, limit);

            return NextResponse.json({
                sites: sites.map((s) => {
                    let distance: number | undefined;
                    if (!isNaN(lat) && !isNaN(lon)) {
                        distance = Math.round(calculateDistance(lat, lon, s.latitude, s.longitude) * 10) / 10;
                    }
                    return {
                        id: s._id.toString(),
                        ...s,
                        distance,
                        isOwner: s.userId === session?.user?.id,
                    };
                }),
            });
        }

        // Default: return nearest sites if location provided
        if (!isNaN(lat) && !isNaN(lon)) {
            const sites = await CompostSite.find({ isPublic: true })
                .select("userId userName siteName siteEmoji siteType acceptsWaste sellsFertilizer latitude longitude locationLabel country isVerified")
                .lean();

            // Calculate distances and sort
            const sitesWithDistance = sites
                .map((s) => ({
                    ...s,
                    id: s._id.toString(),
                    distance: calculateDistance(lat, lon, s.latitude, s.longitude),
                    isOwner: s.userId === session?.user?.id,
                }))
                .filter((s) => s.distance <= MAX_COMPOST_DISTANCE_KM)
                .sort((a, b) => a.distance - b.distance)
                .slice(0, 10);

            return NextResponse.json({ sites: sitesWithDistance });
        }

        return NextResponse.json({ sites: [] });
    } catch (error) {
        console.error("Compost sites fetch error:", error);
        return NextResponse.json(
            { error: "Failed to fetch compost sites" },
            { status: 500 }
        );
    }
}

// POST - Create a new compost site
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const {
            siteName,
            siteEmoji,
            description,
            siteType,
            acceptsWaste,
            sellsFertilizer,
            capacityKg,
            contactInfo,
            latitude,
            longitude,
            locationLabel,
            isPublic = true,
        } = body;

        // Validation
        if (!siteName || !siteType || typeof latitude !== "number" || typeof longitude !== "number") {
            return NextResponse.json(
                { error: "Missing required fields: siteName, siteType, and location are required" },
                { status: 400 }
            );
        }

        if (!["community", "private", "commercial", "municipal"].includes(siteType)) {
            return NextResponse.json(
                { error: "Invalid site type" },
                { status: 400 }
            );
        }

        await connectMongo();

        // Get country from coordinates
        const country = await getCountryFromCoords(latitude, longitude);

        const site = await CompostSite.create({
            userId: session.user.id,
            userName: session.user.name || undefined,
            siteName,
            siteEmoji: siteEmoji || "♻️",
            description,
            siteType,
            acceptsWaste: acceptsWaste !== false,
            sellsFertilizer: sellsFertilizer === true,
            capacityKg: capacityKg || undefined,
            contactInfo,
            latitude,
            longitude,
            locationLabel,
            country,
            isPublic,
            isVerified: false,
        });

        return NextResponse.json({
            site: {
                id: site._id.toString(),
                ...site.toObject(),
            },
        });
    } catch (error) {
        console.error("Compost site creation error:", error);
        return NextResponse.json(
            { error: "Failed to create compost site" },
            { status: 500 }
        );
    }
}

// DELETE - Remove a compost site
export async function DELETE(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const siteId = searchParams.get("id");

        if (!siteId) {
            return NextResponse.json({ error: "Site ID required" }, { status: 400 });
        }

        await connectMongo();

        const site = await CompostSite.findOne({ _id: siteId, userId: session.user.id });
        
        if (!site) {
            return NextResponse.json({ error: "Site not found or unauthorized" }, { status: 404 });
        }

        await CompostSite.deleteOne({ _id: siteId });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Compost site deletion error:", error);
        return NextResponse.json(
            { error: "Failed to delete compost site" },
            { status: 500 }
        );
    }
}
