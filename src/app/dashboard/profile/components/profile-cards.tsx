"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Sprout, User } from "lucide-react";
import type { Session } from "next-auth";
import type { FarmProfileData, EditableProfileData } from "../types";
import { SPACE_TYPE_OPTIONS, EXPERIENCE_LEVEL_OPTIONS } from "../constants";

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
                        <div>
                            <label className="mb-1 block text-sm font-medium">Farm Name</label>
                            <Input
                                value={editData.farmName || ""}
                                onChange={(e) => onUpdate("farmName", e.target.value)}
                                placeholder="My Farm"
                            />
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
    );
}
