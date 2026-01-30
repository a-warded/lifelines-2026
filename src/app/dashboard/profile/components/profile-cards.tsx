"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Sprout, User } from "lucide-react";
import type { Session } from "next-auth";
import type { FarmProfileData, EditableProfileData } from "../types";
import { SPACE_TYPE_OPTIONS, EXPERIENCE_LEVEL_OPTIONS, FARM_EMOJI_OPTIONS } from "../constants";

interface UserInfoCardProps {
  session: Session | null;
}

export function UserInfoCard({ session }: UserInfoCardProps) {
    return (
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
    );
}

interface FarmDetailsCardProps {
  profile: FarmProfileData | null;
  editing: boolean;
  editData: EditableProfileData;
  onUpdate: <K extends keyof EditableProfileData>(key: K, value: EditableProfileData[K]) => void;
}

export function FarmDetailsCard({
    profile,
    editing,
    editData,
    onUpdate,
}: FarmDetailsCardProps) {
    return (
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
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="mb-1 block text-sm font-medium">Farm Name</label>
                                <Input
                                    value={editData.farmName || ""}
                                    onChange={(e) => onUpdate("farmName", e.target.value)}
                                    placeholder="My Farm"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium">Emoji</label>
                                <div className="relative">
                                    <button
                                        type="button"
                                        className="flex h-10 w-14 items-center justify-center rounded-lg border border-input bg-background text-2xl hover:bg-muted"
                                        onClick={() => {
                                            const currentIndex = FARM_EMOJI_OPTIONS.indexOf(editData.farmEmoji || "🌱");
                                            const nextIndex = (currentIndex + 1) % FARM_EMOJI_OPTIONS.length;
                                            onUpdate("farmEmoji", FARM_EMOJI_OPTIONS[nextIndex]);
                                        }}
                                    >
                                        {editData.farmEmoji || "🌱"}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-1 block text-sm font-medium">Space Type</label>
                                <Select
                                    value={editData.spaceType || ""}
                                    onChange={(e) => onUpdate("spaceType", e.target.value)}
                                    options={SPACE_TYPE_OPTIONS.map((opt) => ({
                                        value: opt.value,
                                        label: opt.label,
                                    }))}
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium">Experience Level</label>
                                <Select
                                    value={editData.experienceLevel || ""}
                                    onChange={(e) => onUpdate("experienceLevel", e.target.value)}
                                    options={EXPERIENCE_LEVEL_OPTIONS.map((opt) => ({
                                        value: opt.value,
                                        label: opt.label,
                                    }))}
                                />
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <p className="text-sm text-muted-foreground">Farm Name</p>
                            <p className="font-medium">
                                <span className="mr-1">{profile?.farmEmoji || "🌱"}</span>
                                {profile?.farmName || "Unnamed Farm"}
                            </p>
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
    );
}
