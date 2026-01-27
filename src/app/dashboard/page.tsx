"use client";

import { CropManager } from "@/components/farm/crop-manager";
import { Button, Card, CardContent, Modal, OfflineBadge } from "@/components/ui";
import { AlertTriangle, BarChart3, Calculator, Droplets, MapPin, Recycle, Users } from "lucide-react";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

// hooks - the state managers
import {
    useCropManager,
    useDashboardData,
    useDemoData,
    useRegeneratePlan,
    useSuggestedCrops,
} from "./hooks";

// components - the ui pieces
import {
    GetStartedCard,
    LatestPlanCard,
    RegeneratePlanModal,
    SuggestedCropsModal
} from "./components";

// constants - the magic values
import { getQuickActions } from "./constants";

// dynamic import for map to avoid ssr issues. next.js be weird sometimes
const FarmMap = dynamic(
    () => import("@/components/map/farm-map").then((mod) => mod.FarmMap),
    {
        ssr: false,
        loading: () => (
            <div className="flex h-[400px] items-center justify-center rounded-sm bg-muted">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
        ),
    }
);

// compost sites hook for dashboard map. the trash treasures locator
function useCompostSites() {
    const [sites, setSites] = useState<Array<{
    id: string;
    userId: string;
    userName?: string;
    siteName: string;
    siteEmoji?: string;
    siteType: string;
    latitude: number;
    longitude: number;
    locationLabel?: string;
    country?: string;
  }>>([]);
    const [loading, setLoading] = useState(false);

    const fetchSites = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/compost?all=true");
            if (res.ok) {
                const data = await res.json();
                setSites(data.sites || []);
            }
        } catch (error) {
            console.error("Failed to fetch compost sites:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    return { sites, loading, fetchSites };
}

export default function DashboardPage() {
    const { data: session } = useSession();
    const searchParams = useSearchParams();
    const { t, i18n } = useTranslation();
    const isRTL = i18n.dir() === "rtl";
    const [showMap, setShowMap] = useState(true);
    const [showCompostLocations, setShowCompostLocations] = useState(false);
    const [showStatsModal, setShowStatsModal] = useState(false);
    const showDemo = searchParams.get("demo") === "true";

    // check url params to enable compost locations. query string parsing
    useEffect(() => {
        const showCompost = searchParams.get("showCompost") === "true";
        if (showCompost) {
            setShowCompostLocations(true);
            setShowMap(true);
        }
    }, [searchParams]);

    // data hooks - the data fetching gang
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

    // compost sites - the recycling spots
    const compostSitesHook = useCompostSites();

    // fetch compost sites when toggle is enabled. lazy loading bestie
    useEffect(() => {
        if (showCompostLocations && compostSitesHook.sites.length === 0) {
            compostSitesHook.fetchSites();
        }
    }, [showCompostLocations, compostSitesHook]);

    // action hooks - the doers
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

  // define map farm type that FarmMap expects. type safety
  type MapFarm = {
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
  };

  // combine farms and compost sites for map display. mashup time
  const mapItems = useMemo((): MapFarm[] => {
      const items: MapFarm[] = allFarms.map(farm => ({
          userId: farm.userId,
          userName: farm.userName,
          farmName: farm.farmName,
          latitude: farm.latitude,
          longitude: farm.longitude,
          locationLabel: farm.locationLabel,
          country: farm.country,
          crops: farm.crops?.map(c => ({ plantName: c.plantName, count: c.count })) || [],
          spaceType: farm.spaceType,
          dailyWaterLiters: farm.dailyWaterLiters,
      }));
    
      if (showCompostLocations) {
          compostSitesHook.sites.forEach((site) => {
              items.push({
                  userId: site.userId,
                  userName: site.userName,
                  farmName: site.siteName,
                  farmEmoji: site.siteEmoji || "♻️",
                  latitude: site.latitude,
                  longitude: site.longitude,
                  locationLabel: site.locationLabel,
                  country: site.country,
                  crops: [],
                  spaceType: `${site.siteType} compost`,
                  dailyWaterLiters: 0,
              });
          });
      }
    
      return items;
  }, [allFarms, showCompostLocations, compostSitesHook.sites]);

  // compute stats for modal. crunching numbers
  const mapStats = useMemo(() => ({
      totalFarms: allFarms.length,
      totalCompostSites: compostSitesHook.sites.length,
      totalCrops: allFarms.reduce((sum, f) => sum + (f.crops?.length || 0), 0),
      totalPlants: allFarms.reduce(
          (sum, f) => sum + (f.crops?.reduce((s, c) => s + c.count, 0) || 0),
          0
      ),
  }), [allFarms, compostSitesHook.sites]);

  // show suggested crops modal when user has a plan but no crops yet. helpful popup
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
                      {t("dashboard.welcome", { name: farmProfile?.userName || "" })}
                  </h1>
                  <p className="mt-1 text-muted-foreground">
                      {t("dashboard.tagline", { name: farmProfile?.farmName || "" })}
                  </p>
              </div>
              <div className="flex gap-2">
                  <div className="flex items-center gap-2">
                      <Recycle className="h-4 w-4 text-emerald-600" />
                      <span className="text-sm font-medium">{t("map.compostSites")}</span>
                      <button
                          onClick={() => setShowCompostLocations(!showCompostLocations)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              showCompostLocations ? "bg-emerald-500" : "bg-gray-300 dark:bg-zinc-600"
                          }`}
                          role="switch"
                          aria-checked={showCompostLocations}
                          dir="ltr"
                      >
                          <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  showCompostLocations ? "translate-x-6" : "translate-x-1"
                              }`}
                          />
                      </button>
                  </div>
                  {showDemo && (
                      <Button onClick={demo.loadDemo} loading={demo.loading} variant="outline">
                          <Calculator className={`${isRTL ? "ms-2" : "me-2"} h-4 w-4`} />
                          {t("dashboard.loadDemo")}
                      </Button>
                  )}
              </div>
          </div>

          {/* Farm Map */}
          {showMap && mapItems.length > 0 && (
              <div className="overflow-hidden rounded-xl p-0 relative">

                  {/* Stats Button */}
                  <div className={`absolute top-4 ${isRTL ? "left-4" : "right-4"} z-10`}>
                      <button
                          onClick={() => {
                              if (compostSitesHook.sites.length === 0) {
                                  compostSitesHook.fetchSites();
                              }
                              setShowStatsModal(true);
                          }}
                          className="flex items-center gap-2 rounded-lg bg-white/95 px-3 py-2 transition-colors hover:bg-white dark:bg-zinc-800/95 dark:hover:bg-zinc-700"
                      >
                          <BarChart3 className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">{t("map.stats")}</span>
                      </button>
                  </div>

                  <FarmMap
                      farms={mapItems}
                      currentUserId={session?.user?.id}
                      currentUserLocation={
                          farmProfile
                              ? { lat: farmProfile.latitude, lng: farmProfile.longitude }
                              : undefined
                      }
                      height="400px"
                      showCompostLegend={showCompostLocations}
                  />
              </div>
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

                  {/* Water Summary Card */}
                  {waterCalculation && waterCalculation.totalDailyLiters > 0 && (
                      <Card className="">
                          <CardContent className="py-2">
                              <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                                          <Droplets className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                      </div>
                                      <div>
                                          <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                        Daily Water Need
                                          </p>
                                          <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                                              {waterCalculation.totalDailyLiters.toFixed(2)}L
                                          </p>
                                      </div>
                                  </div>
                                  <div className="text-right">
                                      <p className="text-xs text-blue-600 dark:text-blue-400">
                                          {farmProfile?.crops.length} crop{farmProfile?.crops.length !== 1 && "s"}
                                      </p>
                                      <p className="text-xs text-blue-600 dark:text-blue-400">
                                          {farmProfile?.crops.reduce((sum, c) => sum + c.count, 0)} plants
                                      </p>
                                  </div>
                              </div>

                              {waterCalculation.warning && (
                                  <div className="mt-3 flex items-start gap-2 rounded-lg bg-amber-100 p-3 text-sm text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                                      <span>{waterCalculation.warning}</span>
                                  </div>
                              )}
                          </CardContent>
                      </Card>
                  )}

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

          {/* Community Stats Modal */}
          <Modal isOpen={showStatsModal} onClose={() => setShowStatsModal(false)} title="Community Statistics">
              <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
            Overview of the Lifelines community and their farming activities.
                  </p>
          
                  <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-lg border p-4">
                          <div className="flex items-center gap-3">
                              <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900">
                                  <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                              </div>
                              <div>
                                  <p className="text-2xl font-bold">{mapStats.totalFarms}</p>
                                  <p className="text-xs text-muted-foreground">Active Farms</p>
                              </div>
                          </div>
                      </div>
            
                      <div className="rounded-lg border p-4">
                          <div className="flex items-center gap-3">
                              <div className="rounded-lg bg-emerald-100 p-2 dark:bg-emerald-900">
                                  <Recycle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                              </div>
                              <div>
                                  <p className="text-2xl font-bold">{mapStats.totalCompostSites}</p>
                                  <p className="text-xs text-muted-foreground">Compost Sites</p>
                              </div>
                          </div>
                      </div>
            
                      <div className="rounded-lg border p-4">
                          <div className="flex items-center gap-3">
                              <div className="rounded-lg bg-teal-100 p-2 dark:bg-teal-900">
                                  <MapPin className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                              </div>
                              <div>
                                  <p className="text-2xl font-bold">{mapStats.totalCrops}</p>
                                  <p className="text-xs text-muted-foreground">Crop Types</p>
                              </div>
                          </div>
                      </div>
            
                      <div className="rounded-lg border p-4">
                          <div className="flex items-center gap-3">
                              <div className="rounded-lg bg-amber-100 p-2 dark:bg-amber-900">
                                  <span className="flex h-5 w-5 items-center justify-center text-lg">🌱</span>
                              </div>
                              <div>
                                  <p className="text-2xl font-bold">{mapStats.totalPlants.toLocaleString()}</p>
                                  <p className="text-xs text-muted-foreground">Total Plants</p>
                              </div>
                          </div>
                      </div>
                  </div>
          
                  <div className="flex justify-end pt-2">
                      <Button variant="outline" onClick={() => setShowStatsModal(false)}>
              Close
                      </Button>
                  </div>
              </div>
          </Modal>
      </div>
  );
}
