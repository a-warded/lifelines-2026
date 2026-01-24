"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MapPin, RefreshCw, Search, Users } from "lucide-react";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
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
    latitude: number;
    longitude: number;
    locationLabel?: string;
    country?: string;
    crops: Array<{ plantName: string; count: number }>;
    spaceType: string;
    dailyWaterLiters: number;
}

interface FarmProfile {
    latitude: number;
    longitude: number;
}

export default function MapPage() {
    const { data: session } = useSession();
    const [farms, setFarms] = useState<Farm[]>([]);
    const [userProfile, setUserProfile] = useState<FarmProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [farmsRes, profileRes] = await Promise.all([
                fetch("/api/farm?all=true"),
                fetch("/api/farm"),
            ]);

            if (farmsRes.ok) {
                const data = await farmsRes.json();
                setFarms(data.farms || []);
            }

            if (profileRes.ok) {
                const data = await profileRes.json();
                setUserProfile(data.profile);
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
            farm.crops.some((c) => c.plantName.toLowerCase().includes(query))
        );
    });

    const stats = {
        totalFarms: farms.length,
        totalCrops: farms.reduce((sum, f) => sum + f.crops.length, 0),
        totalPlants: farms.reduce(
            (sum, f) => sum + f.crops.reduce((s, c) => s + c.count, 0),
            0
        ),
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Farm Map</h1>
                    <p className="text-muted-foreground">
                        Discover farms and connect with growers in your area
                    </p>
                </div>
                <Button onClick={fetchData} variant="outline" disabled={loading}>
                    <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                    Refresh
                </Button>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-3">
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
                            <MapPin className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.totalCrops}</p>
                            <p className="text-xs text-muted-foreground">Crop Types</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center gap-3 py-4">
                        <div className="rounded-lg bg-teal-100 p-2 dark:bg-teal-900">
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
                        <p className="mt-2 text-sm text-muted-foreground">Loading farms...</p>
                    </div>
                </div>
            ) : (
                <FarmMap
                    farms={filteredFarms}
                    currentUserId={session?.user?.id}
                    currentUserLocation={
                        userProfile
                            ? { lat: userProfile.latitude, lng: userProfile.longitude }
                            : undefined
                    }
                    height="600px"
                    onFarmClick={setSelectedFarm}
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
                        {selectedFarm.crops.length > 0 && (
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
        </div>
    );
}
