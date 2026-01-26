"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Droplets, Sprout, Sun } from "lucide-react";
import type { FarmProfileData, EditableProfileData } from "../types";
import {
    WATER_AVAILABILITY_OPTIONS,
    SOIL_CONDITION_OPTIONS,
    SUNLIGHT_OPTIONS,
} from "../constants";

interface GrowingConditionsCardProps {
  profile: FarmProfileData | null;
  editing: boolean;
  editData: EditableProfileData;
  onUpdate: <K extends keyof EditableProfileData>(key: K, value: EditableProfileData[K]) => void;
}

export function GrowingConditionsCard({
    profile,
    editing,
    editData,
    onUpdate,
}: GrowingConditionsCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Sun className="h-5 w-5 text-yellow-500" />
          Growing Conditions
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {editing ? (
                    <EditingConditions editData={editData} onUpdate={onUpdate} />
                ) : (
                    <DisplayConditions profile={profile} />
                )}

                {profile?.dailyWaterLiters !== undefined && profile.dailyWaterLiters > 0 && (
                    <div className="mt-4 flex items-center gap-2 rounded-lg bg-blue-50 p-3 dark:bg-blue-950">
                        <Droplets className="h-5 w-5 text-blue-600" />
                        <span className="text-sm text-blue-700 dark:text-blue-300">
              Your crops need <strong>{profile.dailyWaterLiters.toFixed(1)}L</strong> of water per
              day
                        </span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function EditingConditions({
    editData,
    onUpdate,
}: {
  editData: EditableProfileData;
  onUpdate: <K extends keyof EditableProfileData>(key: K, value: EditableProfileData[K]) => void;
}) {
    return (
        <div className="grid gap-4 sm:grid-cols-3">
            <div>
                <label className="mb-1 flex items-center gap-1 text-sm font-medium">
                    <Droplets className="h-4 w-4 text-blue-500" />
          Water
                </label>
                <Select
                    value={editData.waterAvailability || ""}
                    onChange={(e) => onUpdate("waterAvailability", e.target.value)}
                    options={WATER_AVAILABILITY_OPTIONS.map((opt) => ({
                        value: opt.value,
                        label: opt.label,
                    }))}
                />
            </div>
            <div>
                <label className="mb-1 flex items-center gap-1 text-sm font-medium">
                    <Sprout className="h-4 w-4 text-amber-600" />
          Soil
                </label>
                <Select
                    value={editData.soilCondition || ""}
                    onChange={(e) => onUpdate("soilCondition", e.target.value)}
                    options={SOIL_CONDITION_OPTIONS.map((opt) => ({
                        value: opt.value,
                        label: opt.label,
                    }))}
                />
            </div>
            <div>
                <label className="mb-1 flex items-center gap-1 text-sm font-medium">
                    <Sun className="h-4 w-4 text-yellow-500" />
          Sunlight
                </label>
                <Select
                    value={editData.sunlight || ""}
                    onChange={(e) => onUpdate("sunlight", e.target.value)}
                    options={SUNLIGHT_OPTIONS.map((opt) => ({
                        value: opt.value,
                        label: opt.label,
                    }))}
                />
            </div>
        </div>
    );
}

function DisplayConditions({ profile }: { profile: FarmProfileData | null }) {
    return (
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
    );
}
