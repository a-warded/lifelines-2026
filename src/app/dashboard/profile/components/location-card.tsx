"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, MapPin } from "lucide-react";
import dynamic from "next/dynamic";
import type { FarmProfileData, EditableProfileData } from "../types";

const LocationPickerMap = dynamic(
    () =>
        import("@/components/onboarding/location-picker-map").then((mod) => mod.LocationPickerMap),
    {
        ssr: false,
        loading: () => (
            <div className="flex h-48 items-center justify-center rounded-xl bg-muted">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
        ),
    }
);

interface LocationCardProps {
  profile: FarmProfileData | null;
  editing: boolean;
  editData: EditableProfileData;
  onUpdate: <K extends keyof EditableProfileData>(key: K, value: EditableProfileData[K]) => void;
  onLocationSelect: (lat: number, lng: number, label?: string) => void;
}

export function LocationCard({
    profile,
    editing,
    editData,
    onUpdate,
    onLocationSelect,
}: LocationCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-red-500" />
          Farm Location
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {editing ? (
                    <EditingLocation
                        editData={editData}
                        onUpdate={onUpdate}
                        onLocationSelect={onLocationSelect}
                    />
                ) : (
                    <DisplayLocation profile={profile} />
                )}
            </CardContent>
        </Card>
    );
}

function EditingLocation({
    editData,
    onUpdate,
    onLocationSelect,
}: {
  editData: EditableProfileData;
  onUpdate: <K extends keyof EditableProfileData>(key: K, value: EditableProfileData[K]) => void;
  onLocationSelect: (lat: number, lng: number, label?: string) => void;
}) {
    return (
        <>
            <p className="text-sm text-muted-foreground">
        Click on the map to update your farm location
            </p>
            <div className="overflow-hidden rounded-xl border">
                <LocationPickerMap
                    latitude={editData.latitude}
                    longitude={editData.longitude}
                    onLocationSelect={onLocationSelect}
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
                    onChange={(e) => onUpdate("isPublic", e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                />
                <label htmlFor="isPublic" className="text-sm">
          Show my farm on the public map
                </label>
            </div>
        </>
    );
}

function DisplayLocation({ profile }: { profile: FarmProfileData | null }) {
    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>
                    {profile?.locationLabel ||
            `${profile?.latitude?.toFixed(4)}, ${profile?.longitude?.toFixed(4)}`}
                </span>
            </div>
            {profile?.country && (
                <p className="text-sm text-muted-foreground">Country: {profile.country}</p>
            )}
            <p className="text-sm text-muted-foreground">
                {profile?.isPublic !== false ? "✅ Visible on public map" : "🔒 Hidden from public map"}
            </p>
        </div>
    );
}
