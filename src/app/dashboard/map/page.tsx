"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MapPin, Recycle, RefreshCw, Search, Users } from "lucide-react";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const FarmMap = dynamic(
    () => import("@/components/map/farm-map").then((mod) => mod.FarmMap),
    {
        ssr: false,
        loading: () => (
            <div className="flex h-[600px] items-center justify-center rounded-xl bg-muted">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
        ),
    }
);

interface Farm {
    userId: string;
    userName?: string;
    farmName?: string;
    farmEmoji?: string;
    latitude: number;
    longitude: number;
    locationLabel?: string;
    country?: string;
    crops: Array<{ plantName: string; count: number }>;
    spaceType: string;
    dailyWaterLiters: number;
}

interface CompostSite {
    id: string;
    userId: string;
    userName?: string;
    siteName: string;
    siteEmoji?: string;
    siteType: string;
    description?: string;
    acceptsWaste: boolean;
    sellsFertilizer: boolean;
    latitude: number;
    longitude: number;
    locationLabel?: string;
    country?: string;
    distance?: number;
}

interface FarmProfile {
    latitude: number;
    longitude: number;
}

type MapLayer = "farms" | "compost" | "all";

export default function MapPage() {
    const { data: session } = useSession();
    const searchParams = useSearchParams();
    const initialLayer = (searchParams.get("layer") as MapLayer) || "all";
    
    const [farms, setFarms] = useState<Farm[]>([]);
    const [compostSites, setCompostSites] = useState<CompostSite[]>([]);
    const [userProfile, setUserProfile] = useState<FarmProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
    const [selectedCompostSite, setSelectedCompostSite] = useState<CompostSite | null>(null);
    const [activeLayer, setActiveLayer] = useState<MapLayer>(initialLayer);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [farmsRes, profileRes, compostRes] = await Promise.all([
                fetch("/api/farm?all=true"),
                fetch("/api/farm"),
                fetch("/api/compost?all=true"),
            ]);

            if (farmsRes.ok) {
                const data = await farmsRes.json();
                setFarms(data.farms || []);
            }

            if (profileRes.ok) {
                const data = await profileRes.json();
                setUserProfile(data.profile);
            }
            
            if (compostRes.ok) {
                const data = await compostRes.json();
                setCompostSites(data.sites || []);
            }
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const filteredFarms = farms.filter((farm) => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            farm.farmName?.toLowerCase().includes(query) ||
            farm.userName?.toLowerCase().includes(query) ||
            farm.locationLabel?.toLowerCase().includes(query) ||
            farm.country?.toLowerCase().includes(query) ||
            farm.crops?.some((c) => c.plantName.toLowerCase().includes(query))
        );
    });
    
    const filteredCompostSites = compostSites.filter((site) => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            site.siteName?.toLowerCase().includes(query) ||
            site.userName?.toLowerCase().includes(query) ||
            site.locationLabel?.toLowerCase().includes(query) ||
            site.siteType?.toLowerCase().includes(query)
        );
    });
    
    // Combine farms and compost sites for the map based on active layer
    const mapItems = (() => {
        const items: Farm[] = [];
        
        if (activeLayer === "farms" || activeLayer === "all") {
            items.push(...filteredFarms);
        }
        
        if (activeLayer === "compost" || activeLayer === "all") {
            // Convert compost sites to farm-like objects for the map
            filteredCompostSites.forEach(site => {
                items.push({
                    userId: site.userId,
                    userName: site.userName,
                    farmName: site.siteName,
                    farmEmoji: site.siteEmoji || "♻️",
                    latitude: site.latitude,
                    longitude: site.longitude,
                    locationLabel: site.locationLabel,
                    country: site.country,
                    crops: [], // No crops for compost sites
                    spaceType: `${site.siteType} compost`,
                    dailyWaterLiters: 0,
                } as Farm);
            });
        }
        
        return items;
    })();

    const stats = {
        totalFarms: farms.length,
        totalCompostSites: compostSites.length,
        totalCrops: farms.reduce((sum, f) => sum + (f.crops?.length || 0), 0),
        totalPlants: farms.reduce(
            (sum, f) => sum + (f.crops?.reduce((s, c) => s + c.count, 0) || 0),
            0
        ),
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Community Map</h1>
                    <p className="text-muted-foreground">
                        Discover farms, composting sites, and connect with your community
                    </p>
                </div>
                <Button onClick={fetchData} variant="outline" disabled={loading}>
                    <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                    Refresh
                </Button>
            </div>
            
            {/* Layer Toggle */}
            <div className="flex flex-wrap gap-2">
                <Button
                    variant={activeLayer === "all" ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setActiveLayer("all")}
                >
                    🗺️ All
                </Button>
                <Button
                    variant={activeLayer === "farms" ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setActiveLayer("farms")}
                >
                    🌱 Farms Only
                </Button>
                <Button
                    variant={activeLayer === "compost" ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setActiveLayer("compost")}
                >
                    ♻️ Compost Sites Only
                </Button>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-4">
                <Card>
                    <CardContent className="flex items-center gap-3 py-4">
                        <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900">
                            <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.totalFarms}</p>
                            <p className="text-xs text-muted-foreground">Active Farms</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center gap-3 py-4">
                        <div className="rounded-lg bg-emerald-100 p-2 dark:bg-emerald-900">
                            <Recycle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.totalCompostSites}</p>
                            <p className="text-xs text-muted-foreground">Compost Sites</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center gap-3 py-4">
                        <div className="rounded-lg bg-teal-100 p-2 dark:bg-teal-900">
                            <MapPin className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.totalCrops}</p>
                            <p className="text-xs text-muted-foreground">Crop Types</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center gap-3 py-4">
                        <div className="rounded-lg bg-amber-100 p-2 dark:bg-amber-900">
                            <span className="flex h-5 w-5 items-center justify-center text-lg">🌱</span>
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.totalPlants.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">Total Plants</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search farms by name, location, or crops..."
                    className="pl-10"
                />
            </div>

            {/* Map */}
            {loading ? (
                <div className="flex h-[600px] items-center justify-center rounded-xl bg-muted">
                    <div className="text-center">
                        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        <p className="mt-2 text-sm text-muted-foreground">Loading map...</p>
                    </div>
                </div>
            ) : (
                <FarmMap
                    farms={mapItems}
                    currentUserId={session?.user?.id}
                    currentUserLocation={
                        userProfile
                            ? { lat: userProfile.latitude, lng: userProfile.longitude }
                            : undefined
                    }
                    height="600px"
                    onFarmClick={(item) => {
                        // Check if it's a compost site (no crops) or a farm
                        if (item.crops && item.crops.length === 0 && item.spaceType.includes("compost")) {
                            // Find the original compost site
                            const site = compostSites.find(s => s.siteName === item.farmName);
                            if (site) {
                                setSelectedCompostSite(site);
                                setSelectedFarm(null);
                            }
                        } else {
                            setSelectedFarm(item);
                            setSelectedCompostSite(null);
                        }
                    }}
                    showCompostLegend={activeLayer === "compost" || activeLayer === "all"}
                />
            )}

            {/* Selected Farm Details */}
            {selectedFarm && (
                <Card className="border-primary">
                    <CardContent className="py-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-lg font-semibold">
                                    {selectedFarm.farmName || "Farm"}
                                </h3>
                                {selectedFarm.userName && (
                                    <p className="text-sm text-muted-foreground">
                                        by {selectedFarm.userName}
                                    </p>
                                )}
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedFarm(null)}
                            >
                                ✕
                            </Button>
                        </div>
                        <div className="mt-4 grid gap-3 sm:grid-cols-3">
                            <div>
                                <p className="text-xs text-muted-foreground">Location</p>
                                <p className="text-sm">
                                    {selectedFarm.locationLabel || `${selectedFarm.latitude.toFixed(2)}, ${selectedFarm.longitude.toFixed(2)}`}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Space Type</p>
                                <p className="text-sm capitalize">{selectedFarm.spaceType}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Daily Water</p>
                                <p className="text-sm">{selectedFarm.dailyWaterLiters.toFixed(1)}L</p>
                            </div>
                        </div>
                        {selectedFarm.crops && selectedFarm.crops.length > 0 && (
                            <div className="mt-4">
                                <p className="mb-2 text-xs text-muted-foreground">Growing</p>
                                <div className="flex flex-wrap gap-2">
                                    {selectedFarm.crops.map((crop, i) => (
                                        <span
                                            key={i}
                                            className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900 dark:text-green-300"
                                        >
                                            {crop.plantName} ({crop.count})
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
            
            {/* Selected Compost Site Details */}
            {selectedCompostSite && (
                <Card className="border-emerald-500">
                    <CardContent className="py-4">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">{selectedCompostSite.siteEmoji || "♻️"}</span>
                                <div>
                                    <h3 className="text-lg font-semibold">
                                        {selectedCompostSite.siteName}
                                    </h3>
                                    {selectedCompostSite.userName && (
                                        <p className="text-sm text-muted-foreground">
                                            by {selectedCompostSite.userName}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedCompostSite(null)}
                            >
                                ✕
                            </Button>
                        </div>
                        <div className="mt-4 grid gap-3 sm:grid-cols-3">
                            <div>
                                <p className="text-xs text-muted-foreground">Location</p>
                                <p className="text-sm">
                                    {selectedCompostSite.locationLabel || `${selectedCompostSite.latitude.toFixed(2)}, ${selectedCompostSite.longitude.toFixed(2)}`}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Site Type</p>
                                <p className="text-sm capitalize">{selectedCompostSite.siteType}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Services</p>
                                <div className="flex flex-wrap gap-1">
                                    {selectedCompostSite.acceptsWaste && (
                                        <span className="rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                                            📥 Accepts Waste
                                        </span>
                                    )}
                                    {selectedCompostSite.sellsFertilizer && (
                                        <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-900 dark:text-green-300">
                                            🌱 Has Fertilizer
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        {selectedCompostSite.description && (
                            <div className="mt-4">
                                <p className="mb-1 text-xs text-muted-foreground">Description</p>
                                <p className="text-sm">{selectedCompostSite.description}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
