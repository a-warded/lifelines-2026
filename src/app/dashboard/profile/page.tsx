"use client";

import { Button } from "@/components/ui/button";
import { Edit2, Save } from "lucide-react";
import { useSession } from "next-auth/react";
import { useTranslation } from "react-i18next";

// components - the profile ui pieces
import {
  FarmDetailsCard,
  GrowingConditionsCard,
  LocationCard,
  UserInfoCard,
} from "./components";

// hooks - profile state gang
import { useFarmProfile } from "./hooks";

export default function ProfilePage() {
    const { data: session } = useSession();
    const { t, i18n } = useTranslation();
    const isRTL = i18n.dir() === "rtl";
    const farmProfile = useFarmProfile();

    if (farmProfile.loading) {
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
                    <h1 className="text-2xl font-bold">{t("profile.title")}</h1>
                    <p className="text-muted-foreground">{t("profile.subtitle")}</p>
                </div>
                {!farmProfile.editing ? (
                    <Button onClick={farmProfile.startEditing} variant="outline">
                        <Edit2 className={`${isRTL ? "ms-2" : "me-2"} h-4 w-4`} />
                        {t("profile.editProfile")}
                    </Button>
                ) : (
                    <div className="flex gap-2">
                        <Button variant="ghost" onClick={farmProfile.cancelEditing}>
                            {t("common.cancel")}
                        </Button>
                        <Button onClick={farmProfile.saveProfile} loading={farmProfile.saving}>
                            <Save className={`${isRTL ? "ms-2" : "me-2"} h-4 w-4`} />
                            {t("profile.saveChanges")}
                        </Button>
                    </div>
                )}
            </div>

            {/* User Info */}
            <UserInfoCard session={session} />

            {/* Farm Details */}
            <FarmDetailsCard
                profile={farmProfile.profile}
                editing={farmProfile.editing}
                editData={farmProfile.editData}
                onUpdate={farmProfile.updateField}
            />

            {/* Growing Conditions */}
            <GrowingConditionsCard
                profile={farmProfile.profile}
                editing={farmProfile.editing}
                editData={farmProfile.editData}
                onUpdate={farmProfile.updateField}
            />

            {/* Location */}
            <LocationCard
                profile={farmProfile.profile}
                editing={farmProfile.editing}
                editData={farmProfile.editData}
                onUpdate={farmProfile.updateField}
                onLocationSelect={farmProfile.updateLocation}
            />
        </div>
    );
}
