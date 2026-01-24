"use client";

import { Badge, Button, Card, CardContent, OfflineBadge } from "@/components/ui";
import { CropManager } from "@/components/farm/crop-manager";
import { cachePlan, getCachedPlan } from "@/lib/offline-storage";
import { GrowthStage } from "@/lib/plants";
import {
    ArrowRight,
    Calculator,
    Leaf,
    Map,
    MessageCircle,
    RefreshCw,
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
            title: t("dashboard.features.plan.title"),
            description: t("dashboard.features.plan.description"),
            href: "/dashboard/plan/new",
            icon: Sprout,
            color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
        },
        {
            title: t("dashboard.features.exchange.title"),
            description: t("dashboard.features.exchange.description"),
            href: "/dashboard/exchange",
            icon: RefreshCw,
            color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
        },
        {
            title: t("dashboard.features.assistant.title"),
            description: t("dashboard.features.assistant.description"),
            href: "/dashboard/assistant",
            icon: MessageCircle,
            color: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
        },
    ];

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
                                    </div>
                                    <Link href={`/dashboard/plan/${latestPlan.id}`}>
                                        <Button size="sm" variant="outline">
                                            {t("dashboard.latestPlan.view")}
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Getting Started - Only if no crops */}
                    {!latestPlan && (!farmProfile?.crops || farmProfile.crops.length === 0) && (
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
                                    <Link href="/dashboard/plan/new">
                                        <Button size="lg">
                                            <Sprout className="mr-2 h-5 w-5" />
                                            {t("dashboard.getStarted.cta")}
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            <OfflineBadge />
        </div>
    );
}
