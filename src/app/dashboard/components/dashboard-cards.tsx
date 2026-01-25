"use client";

import { Badge, Button, Card, CardContent, Modal, Select } from "@/components/ui";
import {
  ArrowRight,
  CheckCircle2,
  Leaf,
  Plus,
  Sparkles,
  Sprout,
} from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import type { PlanPreview, QuickActionFeature, PlanFormData } from "../types";
import { getPlanFormOptions } from "../constants";

interface QuickActionsListProps {
  features: QuickActionFeature[];
}

export function QuickActionsList({ features }: QuickActionsListProps) {
  return (
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
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}

interface LatestPlanCardProps {
  plan: PlanPreview;
  onAddCrops: () => void;
  onRegenerate: () => void;
}

export function LatestPlanCard({ plan, onAddCrops, onRegenerate }: LatestPlanCardProps) {
  const { t } = useTranslation();

  return (
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
              {plan.recommendedCrops.slice(0, 3).map((c, i) => (
                <span key={c.cropName}>
                  {i > 0 && ", "}
                  <strong>{c.cropName}</strong>
                </span>
              ))}
            </p>
            <div className="mt-2 flex items-center gap-3">
              <Badge variant="info">
                💧 {plan.estimatedDailyWaterLiters}L/{t("common.day")}
              </Badge>
              <span className="text-xs text-green-600 dark:text-green-400">
                {new Date(plan.createdAt).toLocaleDateString()}
              </span>
            </div>
            <button
              onClick={onRegenerate}
              className="mt-3 text-xs text-green-600 underline underline-offset-2 transition-colors hover:text-green-800 dark:text-green-400 dark:hover:text-green-200"
            >
              Generate a new farming plan
            </button>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={onAddCrops}>
              <Plus className="mr-1 h-3 w-3" />
              Add Crops
            </Button>
            <Link href={`/dashboard/plan/${plan.id}`}>
              <Button size="sm" variant="outline">
                {t("dashboard.latestPlan.view")}
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface GetStartedCardProps {
  onCreatePlan: () => void;
}

export function GetStartedCard({ onCreatePlan }: GetStartedCardProps) {
  const { t } = useTranslation();

  return (
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
          <Button size="lg" onClick={onCreatePlan}>
            <Sprout className="mr-2 h-5 w-5" />
            {t("dashboard.getStarted.cta")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface RegeneratePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: PlanFormData;
  setFormData: (data: PlanFormData) => void;
  onSubmit: () => void;
  loading: boolean;
}

export function RegeneratePlanModal({
  isOpen,
  onClose,
  formData,
  setFormData,
  onSubmit,
  loading,
}: RegeneratePlanModalProps) {
  const { t } = useTranslation();
  const options = getPlanFormOptions(t);

  const updateField = (field: keyof PlanFormData, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Update Farming Conditions">
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Update your farming conditions to get new personalized crop recommendations.
        </p>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">{t("plan.form.water.label")}</label>
            <Select
              value={formData.waterAvailability}
              onChange={(e) => updateField("waterAvailability", e.target.value)}
              options={options.water}
            />
          </div>

          <div>
            <label className="text-sm font-medium">{t("plan.form.soil.label")}</label>
            <Select
              value={formData.soilCondition}
              onChange={(e) => updateField("soilCondition", e.target.value)}
              options={options.soil}
            />
          </div>

          <div>
            <label className="text-sm font-medium">{t("plan.form.space.label")}</label>
            <Select
              value={formData.spaceType}
              onChange={(e) => updateField("spaceType", e.target.value)}
              options={options.space}
            />
          </div>

          <div>
            <label className="text-sm font-medium">{t("plan.form.sunlight.label")}</label>
            <Select
              value={formData.sunlight}
              onChange={(e) => updateField("sunlight", e.target.value)}
              options={options.sunlight}
            />
          </div>

          <div>
            <label className="text-sm font-medium">{t("plan.form.goal.label")}</label>
            <Select
              value={formData.primaryGoal}
              onChange={(e) => updateField("primaryGoal", e.target.value)}
              options={options.goal}
            />
          </div>

          <div>
            <label className="text-sm font-medium">{t("plan.form.experience.label")}</label>
            <Select
              value={formData.experienceLevel}
              onChange={(e) => updateField("experienceLevel", e.target.value)}
              options={options.experience}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={onSubmit} loading={loading}>
            <Sprout className="mr-2 h-4 w-4" />
            Generate New Plan
          </Button>
        </div>
      </div>
    </Modal>
  );
}

interface SuggestedCropsModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: PlanPreview | null;
  onAddAll: () => void;
  loading: boolean;
}

export function SuggestedCropsModal({
  isOpen,
  onClose,
  plan,
  onAddAll,
  loading,
}: SuggestedCropsModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Suggested Crops for You">
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-lg bg-green-50 p-4 dark:bg-green-950">
          <Sparkles className="h-5 w-5 shrink-0 text-green-600 dark:text-green-400" />
          <div>
            <p className="text-sm font-medium text-green-800 dark:text-green-200">
              We&apos;ve selected the best crops for you!
            </p>
            <p className="mt-1 text-sm text-green-700 dark:text-green-300">
              Based on your location, conditions, and goals, here are our top
              recommendations.
            </p>
          </div>
        </div>

        {plan && (
          <div className="space-y-3">
            {plan.recommendedCrops.map((crop, index) => (
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
                    variant={
                      crop.difficulty === "easy"
                        ? "success"
                        : crop.difficulty === "medium"
                          ? "warning"
                          : "danger"
                    }
                    className="mt-1"
                  >
                    {crop.difficulty}
                  </Badge>
                </div>
              </div>
            ))}

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                💧 Estimated daily water:{" "}
                <strong>{plan.estimatedDailyWaterLiters}L</strong>
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose}>
            Maybe Later
          </Button>
          <Button onClick={onAddAll} loading={loading}>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Add All to My Farm
          </Button>
        </div>
      </div>
    </Modal>
  );
}
