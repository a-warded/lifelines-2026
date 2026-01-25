import { MessageCircle, Recycle, RefreshCw } from "lucide-react";
import type { TranslateFunction, QuickActionFeature, PlanFormData } from "./types";

export const DEFAULT_PLAN_FORM: PlanFormData = {
  waterAvailability: "medium",
  soilCondition: "normal",
  spaceType: "containers",
  sunlight: "medium",
  primaryGoal: "nutrition",
  experienceLevel: "beginner",
};

export function getQuickActions(t: TranslateFunction): QuickActionFeature[] {
  return [
    {
      title: t("dashboard.features.exchange.title"),
      description: t("dashboard.features.exchange.description"),
      href: "/dashboard/exchange",
      icon: RefreshCw,
      color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    },
    {
      title: t("dashboard.features.compost.title", "Waste to Fertilizer"),
      description: t(
        "dashboard.features.compost.description",
        "Turn agricultural waste into organic compost"
      ),
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
}

export function getPlanFormOptions(t: TranslateFunction) {
  return {
    water: [
      { value: "none", label: t("plan.form.water.options.none") },
      { value: "low", label: t("plan.form.water.options.low") },
      { value: "medium", label: t("plan.form.water.options.medium") },
      { value: "high", label: t("plan.form.water.options.high") },
    ],
    soil: [
      { value: "normal", label: t("plan.form.soil.options.normal") },
      { value: "salty", label: t("plan.form.soil.options.salty") },
      { value: "unknown", label: t("plan.form.soil.options.unknown") },
    ],
    space: [
      { value: "rooftop", label: t("plan.form.space.options.rooftop") },
      { value: "balcony", label: t("plan.form.space.options.balcony") },
      { value: "containers", label: t("plan.form.space.options.containers") },
      { value: "backyard", label: t("plan.form.space.options.backyard") },
      { value: "microplot", label: t("plan.form.space.options.microplot") },
    ],
    sunlight: [
      { value: "low", label: t("plan.form.sunlight.options.low") },
      { value: "medium", label: t("plan.form.sunlight.options.medium") },
      { value: "high", label: t("plan.form.sunlight.options.high") },
    ],
    goal: [
      { value: "calories", label: t("plan.form.goal.options.calories") },
      { value: "nutrition", label: t("plan.form.goal.options.nutrition") },
      { value: "fast", label: t("plan.form.goal.options.fast") },
    ],
    experience: [
      { value: "beginner", label: t("plan.form.experience.options.beginner") },
      { value: "intermediate", label: t("plan.form.experience.options.intermediate") },
      { value: "advanced", label: t("plan.form.experience.options.advanced") },
    ],
  };
}
