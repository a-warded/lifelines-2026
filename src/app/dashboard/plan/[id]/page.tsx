"use client";

import { Badge, Button, Card, CardContent, OfflineBadge } from "@/components/ui";
import { cachePlan, getCachedPlan } from "@/lib/offline-storage";
import { getPlantByName } from "@/lib/plants";
import {
    AlertTriangle,
    ArrowLeft,
    Calendar,
    CheckCircle2,
    Clock,
    Droplets,
    Leaf,
    Loader2,
    Plus,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface RecommendedCrop {
  cropName: string;
  reason: string;
  difficulty: "easy" | "medium" | "hard";
  timeToHarvestDays: number;
}

interface TimelineBlock {
  label: "Today" | "This Week" | "Week 2+";
  steps: string[];
}

interface Plan {
  id: string;
  recommendedCrops: RecommendedCrop[];
  timeline: TimelineBlock[];
  setupChecklist: string[];
  estimatedDailyWaterLiters: number;
  fallbackNotes: string;
  createdAt: string;
}

interface Profile {
  waterAvailability: string;
  soilCondition: string;
  spaceType: string;
  sunlight: string;
  primaryGoal: string;
}

export default function PlanViewPage() {
    const params = useParams();
    const router = useRouter();
    const { t } = useTranslation();
    const [plan, setPlan] = useState<Plan | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isOffline, setIsOffline] = useState(false);
    const [addingCrops, setAddingCrops] = useState(false);
    const [addedCrops, setAddedCrops] = useState<Set<string>>(new Set());

    useEffect(() => {
        const fetchPlan = async () => {
            try {
                const url =
          params.id === "latest" ? "/api/plans" : `/api/plans?id=${params.id}`;
                const res = await fetch(url);

                if (res.ok) {
                    const data = await res.json();
                    if (data.plan) {
                        setPlan(data.plan);
                        setProfile(data.profile);
                        cachePlan(data.plan);
                    }
                } else {
                    throw new Error("Failed to fetch");
                }
            } catch {
                // Try cached data
                const cached = getCachedPlan<Plan>();
                if (cached) {
                    setPlan(cached);
                    setIsOffline(true);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchPlan();
    }, [params.id]);

    const addCropToFarm = async (cropName: string) => {
        if (addedCrops.has(cropName)) return;
        
        setAddingCrops(true);
        try {
            // First get current crops
            const farmRes = await fetch("/api/farm");
            if (!farmRes.ok) throw new Error("Failed to fetch farm");
            const farmData = await farmRes.json();
            const currentCrops = farmData.profile?.crops || [];
            
            // Look up the plant by name to get proper ID
            const plant = getPlantByName(cropName);
            const plantId = plant?.id || cropName.toLowerCase().replace(/\s+/g, "-");
            const plantName = plant?.name || cropName;
            
            // Add new crop
            const newCrop = {
                plantId,
                plantName,
                count: 1,
                stage: "seedling",
            };
            
            // Check if crop already exists
            const existingIndex = currentCrops.findIndex(
                (c: { plantId: string }) => c.plantId === newCrop.plantId
            );
            
            let updatedCrops;
            if (existingIndex >= 0) {
                // Increment count
                updatedCrops = [...currentCrops];
                updatedCrops[existingIndex] = {
                    ...updatedCrops[existingIndex],
                    count: updatedCrops[existingIndex].count + 1,
                };
            } else {
                updatedCrops = [...currentCrops, newCrop];
            }
            
            // Save to farm
            const res = await fetch("/api/farm", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ crops: updatedCrops }),
            });
            
            if (res.ok) {
                setAddedCrops((prev) => new Set([...prev, cropName]));
            }
        } catch (error) {
            console.error("Failed to add crop:", error);
        } finally {
            setAddingCrops(false);
        }
    };

    const addAllCropsToFarm = async () => {
        if (!plan) return;
        
        setAddingCrops(true);
        try {
            // First get current crops
            const farmRes = await fetch("/api/farm");
            if (!farmRes.ok) throw new Error("Failed to fetch farm");
            const farmData = await farmRes.json();
            const currentCrops = farmData.profile?.crops || [];
            
            // Add all recommended crops with proper plant ID lookup
            const newCrops = plan.recommendedCrops.map((crop) => {
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
                    (c: { plantId: string }) => c.plantId === newCrop.plantId
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
                setAddedCrops(new Set(plan.recommendedCrops.map((c) => c.cropName)));
            }
        } catch (error) {
            console.error("Failed to add crops:", error);
        } finally {
            setAddingCrops(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!plan) {
        return (
            <div className="mx-auto max-w-2xl space-y-6 text-center">
                <div className="py-12">
                    <Leaf className="mx-auto h-16 w-16 text-muted-foreground" />
                    <h2 className="mt-4 text-xl font-semibold">{t("plan.view.noPlan")}</h2>
                    <p className="mt-2 text-muted-foreground">
                        {t("plan.view.createFirst")}
                    </p>
                    <Link href="/dashboard/plan/new">
                        <Button className="mt-6">{t("plan.view.actions.newPlan")}</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const difficultyColors = {
        easy: "success",
        medium: "warning",
        hard: "danger",
    } as const;

    const showFallbackWarning =
    profile?.waterAvailability === "none" ||
    (profile?.waterAvailability === "low" && profile?.sunlight === "high");

    return (
        <div className="mx-auto max-w-3xl space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.back()}
                    className="shrink-0"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-foreground">
                        {t("plan.view.title")}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {t("plan.view.created")} {new Date(plan.createdAt).toLocaleDateString()}
                    </p>
                </div>
                {isOffline && (
                    <Badge variant="warning">{t("plan.view.offline")}</Badge>
                )}
            </div>

            {/* Fallback Warning */}
            {showFallbackWarning && plan.fallbackNotes && (
                <Card className="border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950">
                    <CardContent className="flex gap-3">
                        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
                        <div>
                            <h3 className="font-semibold text-amber-800 dark:text-amber-200">
                                {t("plan.view.challengingConditions")}
                            </h3>
                            <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
                                {plan.fallbackNotes}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Recommended Crops */}
            <Card>
                <CardContent>
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="flex items-center gap-2 text-lg font-semibold">
                            <Leaf className="h-5 w-5 text-green-600" />
                            {t("plan.view.recommendedCrops.title")}
                        </h2>
                        {!isOffline && plan.recommendedCrops.length > 0 && (
                            <Button
                                size="sm"
                                onClick={addAllCropsToFarm}
                                disabled={addingCrops || addedCrops.size === plan.recommendedCrops.length}
                            >
                                {addedCrops.size === plan.recommendedCrops.length ? (
                                    <>
                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                        Added All
                                    </>
                                ) : (
                                    <>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add All to Farm
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                    <div className="space-y-4">
                        {plan.recommendedCrops.map((crop, index) => (
                            <div
                                key={crop.cropName}
                                className="flex items-start gap-4 rounded-lg border p-4"
                            >
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-700 dark:bg-green-900 dark:text-green-300">
                                    {index + 1}
                                </div>
                                <div className="flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="font-semibold">{crop.cropName}</h3>
                                        <Badge variant={difficultyColors[crop.difficulty]}>
                                            {t(`plan.difficulty.${crop.difficulty}`)}
                                        </Badge>
                                        <Badge variant="outline">
                                            <Clock className="mr-1 h-3 w-3" />
                                            ~{crop.timeToHarvestDays} {t("units.days")}
                                        </Badge>
                                    </div>
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        {crop.reason}
                                    </p>
                                </div>
                                {!isOffline && (
                                    <Button
                                        size="sm"
                                        variant={addedCrops.has(crop.cropName) ? "secondary" : "outline"}
                                        onClick={() => addCropToFarm(crop.cropName)}
                                        disabled={addingCrops || addedCrops.has(crop.cropName)}
                                        className="shrink-0"
                                    >
                                        {addedCrops.has(crop.cropName) ? (
                                            <CheckCircle2 className="h-4 w-4" />
                                        ) : (
                                            <Plus className="h-4 w-4" />
                                        )}
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Water Estimate */}
            <Card className="border-cyan-200 bg-cyan-50 dark:border-cyan-800 dark:bg-cyan-950">
                <CardContent className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Droplets className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
                        <div>
                            <p className="font-semibold text-cyan-800 dark:text-cyan-200">
                                {t("plan.view.water.title")}
                            </p>
                            <p className="text-2xl font-bold text-cyan-700 dark:text-cyan-300">
                                {plan.estimatedDailyWaterLiters} {t("units.liters")}
                            </p>
                        </div>
                    </div>
                    <Link
                        href={`/dashboard/water?crop=${plan.recommendedCrops[0]?.cropName || "tomato"}&plants=2`}
                    >
                        <Button variant="outline" size="sm">
                            {t("plan.view.water.openCalculator")}
                        </Button>
                    </Link>
                </CardContent>
            </Card>

            {/* Setup Checklist */}
            <Card>
                <CardContent>
                    <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                        {t("plan.view.checklist.title")}
                    </h2>
                    <ul className="space-y-2">
                        {plan.setupChecklist.map((item, index) => (
                            <li key={index} className="flex items-start gap-3">
                                <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                                <span className="text-sm">{item}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
                <CardContent>
                    <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                        <Calendar className="h-5 w-5 text-primary" />
                        {t("plan.view.timeline.title")}
                    </h2>
                    <div className="space-y-6">
                        {plan.timeline.map((block) => (
                            <div key={block.label}>
                                <h3 className="mb-2 font-semibold text-primary">
                                    {block.label}
                                </h3>
                                <ul className="space-y-1.5 border-l-2 border-primary/30 pl-4">
                                    {block.steps.map((step, index) => (
                                        <li
                                            key={index}
                                            className="relative text-sm before:absolute before:-left-[21px] before:top-2 before:h-2 before:w-2 before:rounded-full before:bg-primary/50"
                                        >
                                            {step}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/dashboard/plan/new" className="flex-1">
                    <Button variant="outline" className="w-full">
                        {t("plan.view.actions.newPlan")}
                    </Button>
                </Link>
                <Link href="/dashboard/exchange" className="flex-1">
                    <Button variant="secondary" className="w-full">
                        {t("plan.view.actions.findSeeds")}
                    </Button>
                </Link>
            </div>

            <OfflineBadge />
        </div>
    );
}
