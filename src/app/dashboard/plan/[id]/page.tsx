"use client";

import { Badge, Button, OfflineBadge } from "@/components/ui";
import { ArrowLeft, Leaf, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

// Components
import {
    FallbackWarning,
    RecommendedCropsCard,
    WaterEstimateCard,
    ChecklistCard,
    TimelineCard,
} from "../components";

// Hooks
import { usePlanView, useAddCropsToFarm } from "../hooks";

export default function PlanViewPage() {
    const params = useParams();
    const router = useRouter();
    const { t } = useTranslation();
    const planId = params.id as string;

    const { plan, profile, loading, isOffline } = usePlanView({ planId });
    const cropActions = useAddCropsToFarm(plan);

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
                    <p className="mt-2 text-muted-foreground">{t("plan.view.createFirst")}</p>
                    <Link href="/dashboard/plan/new">
                        <Button className="mt-6">{t("plan.view.actions.newPlan")}</Button>
                    </Link>
                </div>
            </div>
        );
    }

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
                    <h1 className="text-2xl font-bold text-foreground">{t("plan.view.title")}</h1>
                    <p className="text-sm text-muted-foreground">
                        {t("plan.view.created")} {new Date(plan.createdAt).toLocaleDateString()}
                    </p>
                </div>
                {isOffline && <Badge variant="warning">{t("plan.view.offline")}</Badge>}
            </div>

            {/* Fallback Warning */}
            <FallbackWarning profile={profile} fallbackNotes={plan.fallbackNotes} />

            {/* Recommended Crops */}
            <RecommendedCropsCard
                plan={plan}
                isOffline={isOffline}
                addedCrops={cropActions.addedCrops}
                addingCrops={cropActions.addingCrops}
                onAddCrop={cropActions.addCropToFarm}
                onAddAll={cropActions.addAllCropsToFarm}
            />

            {/* Water Estimate */}
            <WaterEstimateCard
                liters={plan.estimatedDailyWaterLiters}
                firstCropName={plan.recommendedCrops[0]?.cropName}
            />

            {/* Setup Checklist */}
            <ChecklistCard items={plan.setupChecklist} />

            {/* Timeline */}
            <TimelineCard timeline={plan.timeline} />

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
