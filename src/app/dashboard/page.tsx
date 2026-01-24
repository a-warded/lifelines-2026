"use client";

import { Badge, Button, Card, CardContent, Modal, OfflineBadge, Select } from "@/components/ui";
import { CropManager } from "@/components/farm/crop-manager";
import { cachePlan, getCachedPlan } from "@/lib/offline-storage";
import { getPlantByName, GrowthStage } from "@/lib/plants";
import {
    ArrowRight,
    Calculator,
    CheckCircle2,
    Leaf,
    Map,
    MessageCircle,
    Plus,
    Recycle,
    RefreshCw,
    Sparkles,
    Sprout,
} from "lucide-react";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

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

interface CropEntry {
    plantId: string;
    plantName: string;
    count: number;
    stage: GrowthStage;
    plantedDate?: string;
    notes?: string;
}

interface WaterCalculation {
    entries: Array<{
        plantId: string;
        plantName: string;
        stage: GrowthStage;
        count: number;
        litersPerPlant: number;
        totalLiters: number;
    }>;
    totalDailyLiters: number;
    warning?: string;
    tips: string[];
}

interface FarmProfile {
    userId: string;
    userName?: string;
    farmName?: string;
    latitude: number;
    longitude: number;
    locationLabel?: string;
    country?: string;
    crops: CropEntry[];
    spaceType: string;
    dailyWaterLiters: number;
}

interface PlanPreview {
    id: string;
    recommendedCrops: Array<{
        cropName: string;
        difficulty: string;
    }>;
    estimatedDailyWaterLiters: number;
    createdAt: string;
}

export default function DashboardPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { t } = useTranslation();
    
    const [latestPlan, setLatestPlan] = useState<PlanPreview | null>(null);
    const [loading, setLoading] = useState(true);
    const [demoLoading, setDemoLoading] = useState(false);
    
    // Farm profile state
    const [farmProfile, setFarmProfile] = useState<FarmProfile | null>(null);
    const [allFarms, setAllFarms] = useState<FarmProfile[]>([]);
    const [waterCalculation, setWaterCalculation] = useState<WaterCalculation | null>(null);
    const [savingCrops, setSavingCrops] = useState(false);
    
    // UI state
    const [showMap, setShowMap] = useState(true);
    const [showRegeneratePlanModal, setShowRegeneratePlanModal] = useState(false);
    const [showSuggestedCropsModal, setShowSuggestedCropsModal] = useState(false);
    const [regeneratingPlan, setRegeneratingPlan] = useState(false);
    const [addingAllCrops, setAddingAllCrops] = useState(false);
    const [planFormData, setPlanFormData] = useState({
        waterAvailability: "medium",
        soilCondition: "normal",
        spaceType: "containers",
        sunlight: "medium",
        primaryGoal: "nutrition",
        experienceLevel: "beginner",
    });

    const showDemo = searchParams.get("demo") === "true";

    const fetchLatestPlan = useCallback(async () => {
        try {
            const res = await fetch("/api/plans");
            if (res.ok) {
                const data = await res.json();
                if (data.plan) {
                    setLatestPlan(data.plan);
                    cachePlan(data.plan);
                }
            }
        } catch {
            const cached = getCachedPlan<PlanPreview>();
            if (cached) {
                setLatestPlan(cached);
            }
        }
    }, []);

    const fetchFarmProfile = useCallback(async () => {
        try {
            const res = await fetch("/api/farm");
            if (res.ok) {
                const data = await res.json();
                if (data.needsOnboarding) {
                    router.push("/onboarding");
                    return;
                }
                setFarmProfile(data.profile);
            }
        } catch (error) {
            console.error("Failed to fetch farm profile:", error);
        }
    }, [router]);

    const fetchAllFarms = useCallback(async () => {
        try {
            const res = await fetch("/api/farm?all=true");
            if (res.ok) {
                const data = await res.json();
                setAllFarms(data.farms || []);
            }
        } catch (error) {
            console.error("Failed to fetch farms:", error);
        }
    }, []);

    useEffect(() => {
        Promise.all([fetchLatestPlan(), fetchFarmProfile(), fetchAllFarms()]).finally(() => {
            setLoading(false);
        });
    }, [fetchLatestPlan, fetchFarmProfile, fetchAllFarms]);

    // Show suggested crops modal when user has a plan but no crops yet
    useEffect(() => {
        if (!loading && latestPlan && farmProfile && (!farmProfile.crops || farmProfile.crops.length === 0)) {
            // Small delay for better UX
            const timer = setTimeout(() => {
                setShowSuggestedCropsModal(true);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [loading, latestPlan, farmProfile]);

    const addAllSuggestedCrops = async () => {
        if (!latestPlan) return;
        
        setAddingAllCrops(true);
        try {
            const currentCrops = farmProfile?.crops || [];
            
            // Add all recommended crops with proper plant ID lookup
            const newCrops = latestPlan.recommendedCrops.map((crop) => {
                const plant = getPlantByName(crop.cropName);
                return {
                    plantId: plant?.id || crop.cropName.toLowerCase().replace(/\s+/g, "-"),
                    plantName: plant?.name || crop.cropName,
                    count: 1,
                    stage: "seedling" as const,
                };
            });
            
            // Merge with existing crops
            const updatedCrops = [...currentCrops];
            for (const newCrop of newCrops) {
                const existingIndex = updatedCrops.findIndex(
                    (c) => c.plantId === newCrop.plantId
                );
                if (existingIndex >= 0) {
                    updatedCrops[existingIndex] = {
                        ...updatedCrops[existingIndex],
                        count: updatedCrops[existingIndex].count + 1,
                    };
                } else {
                    updatedCrops.push(newCrop);
                }
            }
            
            // Save to farm
            const res = await fetch("/api/farm", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ crops: updatedCrops }),
            });
            
            if (res.ok) {
                const data = await res.json();
                setFarmProfile(data.profile);
                setWaterCalculation(data.waterCalculation);
                setShowSuggestedCropsModal(false);
            }
        } catch (error) {
            console.error("Failed to add crops:", error);
        } finally {
            setAddingAllCrops(false);
        }
    };

    const loadDemoData = async () => {
        setDemoLoading(true);
        try {
            const res = await fetch("/api/demo", { method: "POST" });
            if (res.ok) {
                await fetchLatestPlan();
                window.location.reload();
            }
        } catch (error) {
            console.error("Failed to load demo data:", error);
        } finally {
            setDemoLoading(false);
        }
    };

    const handleCropsChange = async (crops: CropEntry[], save = false) => {
        if (!save) return;

        setSavingCrops(true);
        try {
            const res = await fetch("/api/farm", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ crops }),
            });

            if (res.ok) {
                const data = await res.json();
                setFarmProfile(data.profile);
                setWaterCalculation(data.waterCalculation);
                fetchAllFarms();
            }
        } catch (error) {
            console.error("Failed to update crops:", error);
        } finally {
            setSavingCrops(false);
        }
    };

    const features = [
        {
            title: t("dashboard.features.exchange.title"),
            description: t("dashboard.features.exchange.description"),
            href: "/dashboard/exchange",
            icon: RefreshCw,
            color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
        },
        {
            title: t("dashboard.features.compost.title", "Waste to Fertilizer"),
            description: t("dashboard.features.compost.description", "Turn agricultural waste into organic compost"),
            href: "/dashboard/compost",
            icon: Recycle,
            color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
        },
        {
            title: t("dashboard.features.assistant.title"),
            description: t("dashboard.features.assistant.description"),
            href: "/dashboard/assistant",
            icon: MessageCircle,
            color: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
        },
    ];

    const waterOptions = [
        { value: "none", label: t("plan.form.water.options.none") },
        { value: "low", label: t("plan.form.water.options.low") },
        { value: "medium", label: t("plan.form.water.options.medium") },
        { value: "high", label: t("plan.form.water.options.high") },
    ];

    const soilOptions = [
        { value: "normal", label: t("plan.form.soil.options.normal") },
        { value: "salty", label: t("plan.form.soil.options.salty") },
        { value: "unknown", label: t("plan.form.soil.options.unknown") },
    ];

    const spaceOptions = [
        { value: "rooftop", label: t("plan.form.space.options.rooftop") },
        { value: "balcony", label: t("plan.form.space.options.balcony") },
        { value: "containers", label: t("plan.form.space.options.containers") },
        { value: "backyard", label: t("plan.form.space.options.backyard") },
        { value: "microplot", label: t("plan.form.space.options.microplot") },
    ];

    const sunlightOptions = [
        { value: "low", label: t("plan.form.sunlight.options.low") },
        { value: "medium", label: t("plan.form.sunlight.options.medium") },
        { value: "high", label: t("plan.form.sunlight.options.high") },
    ];

    const goalOptions = [
        { value: "calories", label: t("plan.form.goal.options.calories") },
        { value: "nutrition", label: t("plan.form.goal.options.nutrition") },
        { value: "fast", label: t("plan.form.goal.options.fast") },
    ];

    const experienceOptions = [
        { value: "beginner", label: t("plan.form.experience.options.beginner") },
        { value: "intermediate", label: t("plan.form.experience.options.intermediate") },
        { value: "advanced", label: t("plan.form.experience.options.advanced") },
    ];

    const handleRegeneratePlan = async () => {
        setRegeneratingPlan(true);
        try {
            // First update farm profile with new conditions
            await fetch("/api/farm", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(planFormData),
            });

            // Then generate new plan
            const res = await fetch("/api/plans", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(planFormData),
            });

            if (res.ok) {
                const data = await res.json();
                if (data.plan) {
                    setLatestPlan(data.plan);
                    cachePlan(data.plan);
                }
                setShowRegeneratePlanModal(false);
            }
        } catch (error) {
            console.error("Failed to regenerate plan:", error);
        } finally {
            setRegeneratingPlan(false);
        }
    };

    const openRegeneratePlanModal = () => {
        // Pre-fill with current farm profile values if available
        if (farmProfile) {
            setPlanFormData({
                waterAvailability: (farmProfile as unknown as { waterAvailability?: string }).waterAvailability || "medium",
                soilCondition: (farmProfile as unknown as { soilCondition?: string }).soilCondition || "normal",
                spaceType: farmProfile.spaceType || "containers",
                sunlight: (farmProfile as unknown as { sunlight?: string }).sunlight || "medium",
                primaryGoal: (farmProfile as unknown as { primaryGoal?: string }).primaryGoal || "nutrition",
                experienceLevel: (farmProfile as unknown as { experienceLevel?: string }).experienceLevel || "beginner",
            });
        }
        setShowRegeneratePlanModal(true);
    };

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
                    <Button
                        variant="outline"
                        onClick={() => setShowMap(!showMap)}
                    >
                        <Map className="mr-2 h-4 w-4" />
                        {showMap ? "Hide Map" : "Show Map"}
                    </Button>
                    {showDemo && (
                        <Button
                            onClick={loadDemoData}
                            loading={demoLoading}
                            variant="outline"
                        >
                            <Calculator className="mr-2 h-4 w-4" />
                            {t("dashboard.loadDemo")}
                        </Button>
                    )}
                </div>
            </div>

            {/* Farm Map */}
            {showMap && allFarms.length > 0 && (
                <Card>
                    <CardContent className="p-0 overflow-hidden rounded-xl">
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
                        onCropsChange={handleCropsChange}
                        saving={savingCrops}
                    />
                </div>

                {/* Right Column - Quick Actions & Plan */}
                <div className="space-y-6">
                    {/* Quick Actions */}
                    <div className="space-y-3">
                        {features.map((feature) => {
                            const Icon = feature.icon;
                            return (
                                <Link key={feature.href} href={feature.href}>
                                    <Card className="group cursor-pointer transition-all hover:border-primary hover:shadow-md">
                                        <CardContent className="flex items-center gap-4 py-4">
                                            <div className={`rounded-xl p-3 ${feature.color}`}>
                                                <Icon className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-foreground group-hover:text-primary">
                                                    {feature.title}
                                                </h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {feature.description}
                                                </p>
                                            </div>
                                            <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                                        </CardContent>
                                    </Card>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Latest Plan Preview */}
                    {latestPlan && (
                        <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
                            <CardContent>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <Leaf className="h-5 w-5 text-green-600 dark:text-green-400" />
                                            <h3 className="font-semibold text-green-800 dark:text-green-200">
                                                {t("dashboard.latestPlan.title")}
                                            </h3>
                                        </div>
                                        <p className="mt-2 text-sm text-green-700 dark:text-green-300">
                                            {t("dashboard.latestPlan.recommended")}:{" "}
                                            {latestPlan.recommendedCrops.slice(0, 3).map((c, i) => (
                                                <span key={c.cropName}>
                                                    {i > 0 && ", "}
                                                    <strong>{c.cropName}</strong>
                                                </span>
                                            ))}
                                        </p>
                                        <div className="mt-2 flex items-center gap-3">
                                            <Badge variant="info">
                                                💧 {latestPlan.estimatedDailyWaterLiters}L/{t("common.day")}
                                            </Badge>
                                            <span className="text-xs text-green-600 dark:text-green-400">
                                                {new Date(latestPlan.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <button
                                            onClick={openRegeneratePlanModal}
                                            className="mt-3 text-xs text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200 underline underline-offset-2 transition-colors"
                                        >
                                            Generate a new farming plan
                                        </button>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="outline" onClick={() => setShowSuggestedCropsModal(true)}>
                                            <Plus className="mr-1 h-3 w-3" />
                                            Add Crops
                                        </Button>
                                        <Link href={`/dashboard/plan/${latestPlan.id}`}>
                                            <Button size="sm" variant="outline">
                                                {t("dashboard.latestPlan.view")}
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Getting Started - Only if no plan */}
                    {!latestPlan && (
                        <Card className="border-dashed">
                            <CardContent className="py-8 text-center">
                                <Sprout className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-4 text-lg font-semibold">
                                    {t("dashboard.getStarted.title")}
                                </h3>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    {t("dashboard.getStarted.description")}
                                </p>
                                <div className="mt-6">
                                    <Button size="lg" onClick={openRegeneratePlanModal}>
                                        <Sprout className="mr-2 h-5 w-5" />
                                        {t("dashboard.getStarted.cta")}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            <OfflineBadge />

            {/* Regenerate Plan Modal */}
            <Modal
                isOpen={showRegeneratePlanModal}
                onClose={() => setShowRegeneratePlanModal(false)}
                title="Update Farming Conditions"
            >
                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Update your farming conditions to get new personalized crop recommendations.
                    </p>

                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">{t("plan.form.water.label")}</label>
                            <Select
                                value={planFormData.waterAvailability}
                                onChange={(e) => setPlanFormData(prev => ({ ...prev, waterAvailability: e.target.value }))}
                                options={waterOptions}
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium">{t("plan.form.soil.label")}</label>
                            <Select
                                value={planFormData.soilCondition}
                                onChange={(e) => setPlanFormData(prev => ({ ...prev, soilCondition: e.target.value }))}
                                options={soilOptions}
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium">{t("plan.form.space.label")}</label>
                            <Select
                                value={planFormData.spaceType}
                                onChange={(e) => setPlanFormData(prev => ({ ...prev, spaceType: e.target.value }))}
                                options={spaceOptions}
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium">{t("plan.form.sunlight.label")}</label>
                            <Select
                                value={planFormData.sunlight}
                                onChange={(e) => setPlanFormData(prev => ({ ...prev, sunlight: e.target.value }))}
                                options={sunlightOptions}
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium">{t("plan.form.goal.label")}</label>
                            <Select
                                value={planFormData.primaryGoal}
                                onChange={(e) => setPlanFormData(prev => ({ ...prev, primaryGoal: e.target.value }))}
                                options={goalOptions}
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium">{t("plan.form.experience.label")}</label>
                            <Select
                                value={planFormData.experienceLevel}
                                onChange={(e) => setPlanFormData(prev => ({ ...prev, experienceLevel: e.target.value }))}
                                options={experienceOptions}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            variant="outline"
                            onClick={() => setShowRegeneratePlanModal(false)}
                            disabled={regeneratingPlan}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleRegeneratePlan}
                            loading={regeneratingPlan}
                        >
                            <Sprout className="mr-2 h-4 w-4" />
                            Generate New Plan
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Suggested Crops Modal */}
            <Modal
                isOpen={showSuggestedCropsModal}
                onClose={() => setShowSuggestedCropsModal(false)}
                title="Suggested Crops for You"
            >
                <div className="space-y-4">
                    <div className="flex items-start gap-3 rounded-lg bg-green-50 p-4 dark:bg-green-950">
                        <Sparkles className="h-5 w-5 shrink-0 text-green-600 dark:text-green-400" />
                        <div>
                            <p className="text-sm font-medium text-green-800 dark:text-green-200">
                                We&apos;ve selected the best crops for you!
                            </p>
                            <p className="mt-1 text-sm text-green-700 dark:text-green-300">
                                Based on your location, conditions, and goals, here are our top recommendations.
                            </p>
                        </div>
                    </div>

                    {latestPlan && (
                        <div className="space-y-3">
                            {latestPlan.recommendedCrops.map((crop, index) => (
                                <div
                                    key={crop.cropName}
                                    className="flex items-center gap-3 rounded-lg border p-3"
                                >
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-700 dark:bg-green-900 dark:text-green-300">
                                        {index + 1}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium">{crop.cropName}</p>
                                        <Badge 
                                            variant={crop.difficulty === "easy" ? "success" : crop.difficulty === "medium" ? "warning" : "danger"}
                                            className="mt-1"
                                        >
                                            {crop.difficulty}
                                        </Badge>
                                    </div>
                                </div>
                            ))}

                            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950">
                                <p className="text-sm text-blue-700 dark:text-blue-300">
                                    💧 Estimated daily water: <strong>{latestPlan.estimatedDailyWaterLiters}L</strong>
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-2">
                        <Button
                            variant="outline"
                            onClick={() => setShowSuggestedCropsModal(false)}
                        >
                            Maybe Later
                        </Button>
                        <Button
                            onClick={addAllSuggestedCrops}
                            loading={addingAllCrops}
                        >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Add All to My Farm
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
