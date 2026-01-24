"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Check, Droplets, Edit2, MapPin, Save, Sprout, Sun, User } from "lucide-react";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";

const LocationPickerMap = dynamic(
    () => import("@/components/onboarding/location-picker-map").then((mod) => mod.LocationPickerMap),
    {
        ssr: false,
        loading: () => (
            <div className="flex h-48 items-center justify-center rounded-xl bg-muted">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
        ),
    }
);

interface FarmProfileData {
    farmName?: string;
    waterAvailability: string;
    soilCondition: string;
    spaceType: string;
    sunlight: string;
    primaryGoal: string;
    experienceLevel?: string;
    latitude: number;
    longitude: number;
    locationLabel?: string;
    country?: string;
    isPublic: boolean;
    dailyWaterLiters: number;
    crops: Array<{ plantName: string; count: number }>;
}

export default function ProfilePage() {
    const { data: session } = useSession();
    const [profile, setProfile] = useState<FarmProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editData, setEditData] = useState<Partial<FarmProfileData>>({});

    const fetchProfile = useCallback(async () => {
        try {
            const res = await fetch("/api/farm");
            if (res.ok) {
                const data = await res.json();
                setProfile(data.profile);
                setEditData(data.profile || {});
            }
        } catch (error) {
            console.error("Failed to fetch profile:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/farm", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...editData,
                    onboardingCompleted: true,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                setProfile(data.profile);
                setEditing(false);
            }
        } catch (error) {
            console.error("Failed to save profile:", error);
        } finally {
            setSaving(false);
        }
    };

    const handleLocationSelect = (lat: number, lng: number, label?: string) => {
        setEditData({
            ...editData,
            latitude: lat,
            longitude: lng,
            locationLabel: label,
        });
    };

    if (loading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-3xl space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Farm Profile</h1>
                    <p className="text-muted-foreground">Manage your farm settings and location</p>
                </div>
                {!editing ? (
                    <Button onClick={() => setEditing(true)} variant="outline">
                        <Edit2 className="mr-2 h-4 w-4" />
                        Edit Profile
                    </Button>
                ) : (
                    <div className="flex gap-2">
                        <Button variant="ghost" onClick={() => {
                            setEditing(false);
                            setEditData(profile || {});
                        }}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} loading={saving}>
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                        </Button>
                    </div>
                )}
            </div>

            {/* User Info */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Account
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                            {session?.user?.name?.[0]?.toUpperCase() || "U"}
                        </div>
                        <div>
                            <p className="text-lg font-medium">{session?.user?.name}</p>
                            <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Farm Details */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sprout className="h-5 w-5 text-green-600" />
                        Farm Details
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {editing ? (
                        <>
                            <div>
                                <label className="mb-1 block text-sm font-medium">Farm Name</label>
                                <Input
                                    value={editData.farmName || ""}
                                    onChange={(e) => setEditData({ ...editData, farmName: e.target.value })}
                                    placeholder="My Farm"
                                />
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1 block text-sm font-medium">Space Type</label>
                                    <Select
                                        value={editData.spaceType || ""}
                                        onChange={(e) => setEditData({ ...editData, spaceType: e.target.value })}
                                        options={[
                                            { value: "rooftop", label: "🏢 Rooftop" },
                                            { value: "balcony", label: "🏠 Balcony" },
                                            { value: "containers", label: "🪴 Containers" },
                                            { value: "backyard", label: "🌳 Backyard" },
                                            { value: "microplot", label: "🌾 Microplot" },
                                        ]}
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium">Experience Level</label>
                                    <Select
                                        value={editData.experienceLevel || ""}
                                        onChange={(e) => setEditData({ ...editData, experienceLevel: e.target.value })}
                                        options={[
                                            { value: "beginner", label: "🌱 Beginner" },
                                            { value: "intermediate", label: "🌿 Intermediate" },
                                            { value: "advanced", label: "🌳 Advanced" },
                                        ]}
                                    />
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <p className="text-sm text-muted-foreground">Farm Name</p>
                                <p className="font-medium">{profile?.farmName || "Unnamed Farm"}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Space Type</p>
                                <p className="font-medium capitalize">{profile?.spaceType || "-"}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Experience</p>
                                <p className="font-medium capitalize">{profile?.experienceLevel || "-"}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Crops Growing</p>
                                <p className="font-medium">{profile?.crops?.length || 0} crops</p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Growing Conditions */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sun className="h-5 w-5 text-yellow-500" />
                        Growing Conditions
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {editing ? (
                        <div className="grid gap-4 sm:grid-cols-3">
                            <div>
                                <label className="mb-1 flex items-center gap-1 text-sm font-medium">
                                    <Droplets className="h-4 w-4 text-blue-500" />
                                    Water
                                </label>
                                <Select
                                    value={editData.waterAvailability || ""}
                                    onChange={(e) => setEditData({ ...editData, waterAvailability: e.target.value })}
                                    options={[
                                        { value: "none", label: "None" },
                                        { value: "low", label: "Low" },
                                        { value: "medium", label: "Medium" },
                                        { value: "high", label: "High" },
                                    ]}
                                />
                            </div>
                            <div>
                                <label className="mb-1 flex items-center gap-1 text-sm font-medium">
                                    <Sprout className="h-4 w-4 text-amber-600" />
                                    Soil
                                </label>
                                <Select
                                    value={editData.soilCondition || ""}
                                    onChange={(e) => setEditData({ ...editData, soilCondition: e.target.value })}
                                    options={[
                                        { value: "normal", label: "Normal" },
                                        { value: "salty", label: "Salty" },
                                        { value: "unknown", label: "Unknown" },
                                    ]}
                                />
                            </div>
                            <div>
                                <label className="mb-1 flex items-center gap-1 text-sm font-medium">
                                    <Sun className="h-4 w-4 text-yellow-500" />
                                    Sunlight
                                </label>
                                <Select
                                    value={editData.sunlight || ""}
                                    onChange={(e) => setEditData({ ...editData, sunlight: e.target.value })}
                                    options={[
                                        { value: "low", label: "Low" },
                                        { value: "medium", label: "Medium" },
                                        { value: "high", label: "High" },
                                    ]}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-3">
                            <div className="flex items-center gap-2">
                                <Droplets className="h-5 w-5 text-blue-500" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Water</p>
                                    <p className="font-medium capitalize">{profile?.waterAvailability || "-"}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Sprout className="h-5 w-5 text-amber-600" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Soil</p>
                                    <p className="font-medium capitalize">{profile?.soilCondition || "-"}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Sun className="h-5 w-5 text-yellow-500" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Sunlight</p>
                                    <p className="font-medium capitalize">{profile?.sunlight || "-"}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {profile?.dailyWaterLiters !== undefined && profile.dailyWaterLiters > 0 && (
                        <div className="mt-4 flex items-center gap-2 rounded-lg bg-blue-50 p-3 dark:bg-blue-950">
                            <Droplets className="h-5 w-5 text-blue-600" />
                            <span className="text-sm text-blue-700 dark:text-blue-300">
                                Your crops need <strong>{profile.dailyWaterLiters.toFixed(1)}L</strong> of water per day
                            </span>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Location */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-red-500" />
                        Farm Location
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {editing ? (
                        <>
                            <p className="text-sm text-muted-foreground">
                                Click on the map to update your farm location
                            </p>
                            <div className="overflow-hidden rounded-xl border">
                                <LocationPickerMap
                                    latitude={editData.latitude}
                                    longitude={editData.longitude}
                                    onLocationSelect={handleLocationSelect}
                                    height="250px"
                                />
                            </div>
                            {editData.locationLabel && (
                                <div className="flex items-center gap-2 text-sm text-green-600">
                                    <Check className="h-4 w-4" />
                                    {editData.locationLabel}
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isPublic"
                                    checked={editData.isPublic !== false}
                                    onChange={(e) => setEditData({ ...editData, isPublic: e.target.checked })}
                                    className="h-4 w-4 rounded border-gray-300"
                                />
                                <label htmlFor="isPublic" className="text-sm">
                                    Show my farm on the public map
                                </label>
                            </div>
                        </>
                    ) : (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span>{profile?.locationLabel || `${profile?.latitude?.toFixed(4)}, ${profile?.longitude?.toFixed(4)}`}</span>
                            </div>
                            {profile?.country && (
                                <p className="text-sm text-muted-foreground">Country: {profile.country}</p>
                            )}
                            <p className="text-sm text-muted-foreground">
                                {profile?.isPublic !== false ? "✅ Visible on public map" : "🔒 Hidden from public map"}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
