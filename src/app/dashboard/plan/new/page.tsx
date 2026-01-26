"use client";

import { Button, Card, CardContent, OfflineBadge, Select } from "@/components/ui";
import { AlertCircle, ArrowLeft, Loader2, Sprout } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { usePlanForm } from "./hooks";
import { getPlanFormOptions } from "./types";

export default function NewPlanPage() {
    const router = useRouter();
    const { t } = useTranslation();
    const { formData, errors, loading, handleChange, handleSubmit } = usePlanForm();
    const options = getPlanFormOptions(t);

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
                                options={options.water}
                                value={formData.waterAvailability}
                                onChange={(e) => handleChange("waterAvailability", e.target.value)}
                                placeholder={t("plan.form.water.placeholder")}
                                error={errors.waterAvailability}
                            />
                            {formData.waterAvailability === "none" && (
                                <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
                                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                                    <span>{t("plan.form.water.noAccessWarning")}</span>
                                </div>
                            )}
                        </div>

                        {/* Soil Condition */}
                        <Select
                            label={t("plan.form.soil.label")}
                            options={options.soil}
                            value={formData.soilCondition}
                            onChange={(e) => handleChange("soilCondition", e.target.value)}
                            placeholder={t("plan.form.soil.placeholder")}
                            error={errors.soilCondition}
                        />

                        {/* Space Type */}
                        <Select
                            label={t("plan.form.space.label")}
                            options={options.space}
                            value={formData.spaceType}
                            onChange={(e) => handleChange("spaceType", e.target.value)}
                            placeholder={t("plan.form.space.placeholder")}
                            error={errors.spaceType}
                        />

                        {/* Sunlight */}
                        <Select
                            label={t("plan.form.sunlight.label")}
                            options={options.sunlight}
                            value={formData.sunlight}
                            onChange={(e) => handleChange("sunlight", e.target.value)}
                            placeholder={t("plan.form.sunlight.placeholder")}
                            error={errors.sunlight}
                        />

                        {/* Primary Goal */}
                        <Select
                            label={t("plan.form.goal.label")}
                            options={options.goal}
                            value={formData.primaryGoal}
                            onChange={(e) => handleChange("primaryGoal", e.target.value)}
                            placeholder={t("plan.form.goal.placeholder")}
                            error={errors.primaryGoal}
                        />

                        {/* Experience Level (Optional) */}
                        <Select
                            label={t("plan.form.experience.label")}
                            options={options.experience}
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
                        <Button type="submit" size="lg" className="w-full" disabled={loading}>
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
