"use client";

import { Button, Card, CardContent, OfflineBadge, Select } from "@/components/ui";
import { cachePlan } from "@/lib/offline-storage";
import { AlertCircle, ArrowLeft, Loader2, Sprout } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface FormData {
  waterAvailability: string;
  soilCondition: string;
  spaceType: string;
  sunlight: string;
  primaryGoal: string;
  experienceLevel: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function NewPlanPage() {
    const router = useRouter();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const [formData, setFormData] = useState<FormData>({
        waterAvailability: "",
        soilCondition: "",
        spaceType: "",
        sunlight: "",
        primaryGoal: "",
        experienceLevel: "",
    });

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
        { value: "", label: t("plan.form.experience.options.skip") },
        { value: "beginner", label: t("plan.form.experience.options.beginner") },
        { value: "intermediate", label: t("plan.form.experience.options.intermediate") },
        { value: "advanced", label: t("plan.form.experience.options.advanced") },
    ];

    const handleChange = (field: keyof FormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const validate = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.waterAvailability) {
            newErrors.waterAvailability = t("plan.form.errors.water");
        }
        if (!formData.soilCondition) {
            newErrors.soilCondition = t("plan.form.errors.soil");
        }
        if (!formData.spaceType) {
            newErrors.spaceType = t("plan.form.errors.space");
        }
        if (!formData.sunlight) {
            newErrors.sunlight = t("plan.form.errors.sunlight");
        }
        if (!formData.primaryGoal) {
            newErrors.primaryGoal = t("plan.form.errors.goal");
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        setLoading(true);
        try {
            const res = await fetch("/api/plans", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    experienceLevel: formData.experienceLevel || undefined,
                }),
            });

            if (!res.ok) {
                throw new Error("Failed to create plan");
            }

            const data = await res.json();
            cachePlan(data.plan);
            router.push(`/dashboard/plan/${data.plan.id}`);
        } catch (error) {
            console.error("Error creating plan:", error);
            setErrors({ submit: t("plan.form.errors.submit") });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mx-auto max-w-2xl space-y-6">
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
                <div>
                    <h1 className="text-2xl font-bold text-foreground">
                        {t("plan.form.title")}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {t("plan.form.subtitle")}
                    </p>
                </div>
            </div>

            {/* Form */}
            <Card padding="lg">
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Water Availability */}
                        <div className="space-y-2">
                            <Select
                                label={t("plan.form.water.label")}
                                options={waterOptions}
                                value={formData.waterAvailability}
                                onChange={(e) =>
                                    handleChange("waterAvailability", e.target.value)
                                }
                                placeholder={t("plan.form.water.placeholder")}
                                error={errors.waterAvailability}
                            />
                            {formData.waterAvailability === "none" && (
                                <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
                                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                                    <span>
                                        {t("plan.form.water.noAccessWarning")}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Soil Condition */}
                        <Select
                            label={t("plan.form.soil.label")}
                            options={soilOptions}
                            value={formData.soilCondition}
                            onChange={(e) => handleChange("soilCondition", e.target.value)}
                            placeholder={t("plan.form.soil.placeholder")}
                            error={errors.soilCondition}
                        />

                        {/* Space Type */}
                        <Select
                            label={t("plan.form.space.label")}
                            options={spaceOptions}
                            value={formData.spaceType}
                            onChange={(e) => handleChange("spaceType", e.target.value)}
                            placeholder={t("plan.form.space.placeholder")}
                            error={errors.spaceType}
                        />

                        {/* Sunlight */}
                        <Select
                            label={t("plan.form.sunlight.label")}
                            options={sunlightOptions}
                            value={formData.sunlight}
                            onChange={(e) => handleChange("sunlight", e.target.value)}
                            placeholder={t("plan.form.sunlight.placeholder")}
                            error={errors.sunlight}
                        />

                        {/* Primary Goal */}
                        <Select
                            label={t("plan.form.goal.label")}
                            options={goalOptions}
                            value={formData.primaryGoal}
                            onChange={(e) => handleChange("primaryGoal", e.target.value)}
                            placeholder={t("plan.form.goal.placeholder")}
                            error={errors.primaryGoal}
                        />

                        {/* Experience Level (Optional) */}
                        <Select
                            label={t("plan.form.experience.label")}
                            options={experienceOptions}
                            value={formData.experienceLevel}
                            onChange={(e) => handleChange("experienceLevel", e.target.value)}
                            helper={t("plan.form.experience.helper")}
                        />

                        {/* Submit Error */}
                        {errors.submit && (
                            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-200">
                                <AlertCircle className="h-4 w-4" />
                                {errors.submit}
                            </div>
                        )}

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            size="lg"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    {t("plan.form.creating")}
                                </>
                            ) : (
                                <>
                                    <Sprout className="mr-2 h-5 w-5" />
                                    {t("plan.form.submit")}
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <OfflineBadge />
        </div>
    );
}
