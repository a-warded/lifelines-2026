"use client";

import { Badge, Button, Card, CardContent } from "@/components/ui";
import {
  CheckCircle2,
  Clock,
  Droplets,
  Leaf,
  Plus,
  AlertTriangle,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import type { Plan, Profile, RecommendedCrop } from "../types";
import { DIFFICULTY_COLORS } from "../types";

interface FallbackWarningProps {
  profile: Profile | null;
  fallbackNotes: string;
}

export function FallbackWarning({ profile, fallbackNotes }: FallbackWarningProps) {
  const { t } = useTranslation();
  
  const showWarning =
    profile?.waterAvailability === "none" ||
    (profile?.waterAvailability === "low" && profile?.sunlight === "high");

  if (!showWarning || !fallbackNotes) return null;

  return (
    <Card className="border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950">
      <CardContent className="flex gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
        <div>
          <h3 className="font-semibold text-amber-800 dark:text-amber-200">
            {t("plan.view.challengingConditions")}
          </h3>
          <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
            {fallbackNotes}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

interface CropCardProps {
  crop: RecommendedCrop;
  index: number;
  isOffline: boolean;
  isAdded: boolean;
  isAdding: boolean;
  onAdd: () => void;
}

export function CropCard({
  crop,
  index,
  isOffline,
  isAdded,
  isAdding,
  onAdd,
}: CropCardProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-start gap-4 rounded-lg border p-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-700 dark:bg-green-900 dark:text-green-300">
        {index + 1}
      </div>
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-semibold">{crop.cropName}</h3>
          <Badge variant={DIFFICULTY_COLORS[crop.difficulty]}>
            {t(`plan.difficulty.${crop.difficulty}`)}
          </Badge>
          <Badge variant="outline">
            <Clock className="mr-1 h-3 w-3" />
            ~{crop.timeToHarvestDays} {t("units.days")}
          </Badge>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{crop.reason}</p>
      </div>
      {!isOffline && (
        <Button
          size="sm"
          variant={isAdded ? "secondary" : "outline"}
          onClick={onAdd}
          disabled={isAdding || isAdded}
          className="shrink-0"
        >
          {isAdded ? <CheckCircle2 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </Button>
      )}
    </div>
  );
}

interface RecommendedCropsCardProps {
  plan: Plan;
  isOffline: boolean;
  addedCrops: Set<string>;
  addingCrops: boolean;
  onAddCrop: (cropName: string) => void;
  onAddAll: () => void;
}

export function RecommendedCropsCard({
  plan,
  isOffline,
  addedCrops,
  addingCrops,
  onAddCrop,
  onAddAll,
}: RecommendedCropsCardProps) {
  const { t } = useTranslation();

  return (
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
              onClick={onAddAll}
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
            <CropCard
              key={crop.cropName}
              crop={crop}
              index={index}
              isOffline={isOffline}
              isAdded={addedCrops.has(crop.cropName)}
              isAdding={addingCrops}
              onAdd={() => onAddCrop(crop.cropName)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface WaterEstimateCardProps {
  liters: number;
  firstCropName?: string;
}

export function WaterEstimateCard({ liters, firstCropName }: WaterEstimateCardProps) {
  const { t } = useTranslation();

  return (
    <Card className="border-cyan-200 bg-cyan-50 dark:border-cyan-800 dark:bg-cyan-950">
      <CardContent className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Droplets className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
          <div>
            <p className="font-semibold text-cyan-800 dark:text-cyan-200">
              {t("plan.view.water.title")}
            </p>
            <p className="text-2xl font-bold text-cyan-700 dark:text-cyan-300">
              {liters} {t("units.liters")}
            </p>
          </div>
        </div>
        <Link href={`/dashboard/water?crop=${firstCropName || "tomato"}&plants=2`}>
          <Button variant="outline" size="sm">
            {t("plan.view.water.openCalculator")}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

interface ChecklistCardProps {
  items: string[];
}

export function ChecklistCard({ items }: ChecklistCardProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardContent>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <CheckCircle2 className="h-5 w-5 text-primary" />
          {t("plan.view.checklist.title")}
        </h2>
        <ul className="space-y-2">
          {items.map((item, index) => (
            <li key={index} className="flex items-start gap-3">
              <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
              <span className="text-sm">{item}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

interface TimelineCardProps {
  timeline: Plan["timeline"];
}

export function TimelineCard({ timeline }: TimelineCardProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardContent>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <Calendar className="h-5 w-5 text-primary" />
          {t("plan.view.timeline.title")}
        </h2>
        <div className="space-y-6">
          {timeline.map((block) => (
            <div key={block.label}>
              <h3 className="mb-2 font-semibold text-primary">{block.label}</h3>
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
  );
}
