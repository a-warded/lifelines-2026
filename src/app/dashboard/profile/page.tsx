"use client";

import { Button } from "@/components/ui/button";
import { Edit2, Save } from "lucide-react";
import { useSession } from "next-auth/react";

// Components
import {
  UserInfoCard,
  FarmDetailsCard,
  GrowingConditionsCard,
  LocationCard,
} from "./components";

// Hooks
import { useFarmProfile } from "./hooks";

export default function ProfilePage() {
  const { data: session } = useSession();
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
          <h1 className="text-2xl font-bold">Farm Profile</h1>
          <p className="text-muted-foreground">Manage your farm settings and location</p>
        </div>
        {!farmProfile.editing ? (
          <Button onClick={farmProfile.startEditing} variant="outline">
            <Edit2 className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="ghost" onClick={farmProfile.cancelEditing}>
              Cancel
            </Button>
            <Button onClick={farmProfile.saveProfile} loading={farmProfile.saving}>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
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
