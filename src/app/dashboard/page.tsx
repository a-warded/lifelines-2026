"use client";

import { Button, Card, CardContent, OfflineBadge } from "@/components/ui";
import { CropManager } from "@/components/farm/crop-manager";
import { Calculator, Map } from "lucide-react";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

// Hooks
import {
  useDashboardData,
  useCropManager,
  useSuggestedCrops,
  useRegeneratePlan,
  useDemoData,
} from "./hooks";

// Components
import {
  QuickActionsList,
  LatestPlanCard,
  GetStartedCard,
  RegeneratePlanModal,
  SuggestedCropsModal,
} from "./components";

// Constants
import { getQuickActions } from "./constants";

// Dynamic import for map to avoid SSR issues
const FarmMap = dynamic(
  () => import("@/components/map/farm-map").then((mod) => mod.FarmMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[400px] items-center justify-center rounded-xl bg-muted">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    ),
  }
);

export default function DashboardPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const [showMap, setShowMap] = useState(true);
  const showDemo = searchParams.get("demo") === "true";

  // Data hooks
  const dashboardData = useDashboardData();
  const {
    latestPlan,
    setLatestPlan,
    farmProfile,
    setFarmProfile,
    allFarms,
    waterCalculation,
    setWaterCalculation,
    loading,
    refreshPlan,
    refreshFarms,
  } = dashboardData;

  // Action hooks
  const cropManager = useCropManager(
    farmProfile,
    setFarmProfile,
    setWaterCalculation,
    refreshFarms
  );

  const suggestedCrops = useSuggestedCrops(
    latestPlan,
    farmProfile,
    setFarmProfile,
    setWaterCalculation
  );

  const regeneratePlan = useRegeneratePlan(farmProfile, setLatestPlan);

  const demo = useDemoData(refreshPlan);

  // Show suggested crops modal when user has a plan but no crops yet
  useEffect(() => {
    if (
      !loading && 
      latestPlan && 
      farmProfile && 
      (!farmProfile.crops || farmProfile.crops.length === 0) &&
      !suggestedCrops.dismissed
    ) {
      const timer = setTimeout(() => {
        suggestedCrops.setShowModal(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [loading, latestPlan, farmProfile, suggestedCrops.dismissed, suggestedCrops.setShowModal]);

  const features = getQuickActions(t);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            {t("dashboard.welcome", { name: session?.user?.name || "" })}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {farmProfile?.farmName || t("dashboard.tagline")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowMap(!showMap)}>
            <Map className="mr-2 h-4 w-4" />
            {showMap ? "Hide Map" : "Show Map"}
          </Button>
          {showDemo && (
            <Button onClick={demo.loadDemo} loading={demo.loading} variant="outline">
              <Calculator className="mr-2 h-4 w-4" />
              {t("dashboard.loadDemo")}
            </Button>
          )}
        </div>
      </div>

      {/* Farm Map */}
      {showMap && allFarms.length > 0 && (
        <Card>
          <CardContent className="overflow-hidden rounded-xl p-0">
            <FarmMap
              farms={allFarms}
              currentUserId={session?.user?.id}
              currentUserLocation={
                farmProfile
                  ? { lat: farmProfile.latitude, lng: farmProfile.longitude }
                  : undefined
              }
              height="400px"
            />
          </CardContent>
        </Card>
      )}

      {/* Two Column Layout */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left Column - Crops Manager */}
        <div>
          <CropManager
            crops={farmProfile?.crops || []}
            waterCalculation={waterCalculation || undefined}
            onCropsChange={cropManager.handleCropsChange}
            saving={cropManager.savingCrops}
          />
        </div>

        {/* Right Column - Quick Actions & Plan */}
        <div className="space-y-6">
          <QuickActionsList features={features} />

          {latestPlan ? (
            <LatestPlanCard
              plan={latestPlan}
              onAddCrops={() => suggestedCrops.setShowModal(true)}
              onRegenerate={regeneratePlan.openModal}
            />
          ) : (
            <GetStartedCard onCreatePlan={regeneratePlan.openModal} />
          )}
        </div>
      </div>

      <OfflineBadge />

      {/* Modals */}
      <RegeneratePlanModal
        isOpen={regeneratePlan.showModal}
        onClose={() => regeneratePlan.setShowModal(false)}
        formData={regeneratePlan.formData}
        setFormData={regeneratePlan.setFormData}
        onSubmit={regeneratePlan.handleRegenerate}
        loading={regeneratePlan.regenerating}
      />

      <SuggestedCropsModal
        isOpen={suggestedCrops.showModal}
        onClose={suggestedCrops.closeModal}
        plan={latestPlan}
        onAddAll={suggestedCrops.addAllSuggestedCrops}
        loading={suggestedCrops.adding}
      />
    </div>
  );
}
