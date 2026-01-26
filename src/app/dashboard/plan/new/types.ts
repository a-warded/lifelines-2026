import type { TFunction } from "i18next";

// Type alias for i18next translation function
export type TranslateFunction = TFunction<"translation", undefined>;

export interface PlanFormData {
  waterAvailability: string;
  soilCondition: string;
  spaceType: string;
  sunlight: string;
  primaryGoal: string;
  experienceLevel: string;
}

export interface PlanFormErrors {
  [key: string]: string;
}

export interface SelectOption {
  value: string;
  label: string;
}

export const DEFAULT_FORM_DATA: PlanFormData = {
    waterAvailability: "",
    soilCondition: "",
    spaceType: "",
    sunlight: "",
    primaryGoal: "",
    experienceLevel: "",
};

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
            { value: "", label: t("plan.form.experience.options.skip") },
            { value: "beginner", label: t("plan.form.experience.options.beginner") },
            { value: "intermediate", label: t("plan.form.experience.options.intermediate") },
            { value: "advanced", label: t("plan.form.experience.options.advanced") },
        ],
    };
}
