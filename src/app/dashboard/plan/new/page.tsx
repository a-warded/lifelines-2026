"use client";

import { Button, Card, CardContent, OfflineBadge, Select } from "@/components/ui";
import { cachePlan } from "@/lib/offline-storage";
import { AlertCircle, ArrowLeft, Loader2, Sprout } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
        { value: "none", label: "None - No reliable water access" },
        { value: "low", label: "Low - Limited or shared access" },
        { value: "medium", label: "Medium - Regular but limited supply" },
        { value: "high", label: "High - Reliable water access" },
    ];

    const soilOptions = [
        { value: "normal", label: "Normal - Regular garden soil" },
        { value: "salty", label: "Salty - Near coast or salty groundwater" },
        { value: "unknown", label: "Unknown - Not sure about soil quality" },
    ];

    const spaceOptions = [
        { value: "rooftop", label: "Rooftop" },
        { value: "balcony", label: "Balcony" },
        { value: "containers", label: "Containers / Pots" },
        { value: "backyard", label: "Backyard" },
        { value: "microplot", label: "Small Plot / Community Garden" },
    ];

    const sunlightOptions = [
        { value: "low", label: "Low - 0-3 hours of direct sun" },
        { value: "medium", label: "Medium - 4-6 hours of direct sun" },
        { value: "high", label: "High - 7+ hours of direct sun" },
    ];

    const goalOptions = [
        { value: "calories", label: "Calories - Grow filling, calorie-dense food" },
        { value: "nutrition", label: "Nutrition - Grow vitamin-rich vegetables" },
        { value: "fast", label: "Fast Harvest - Quickest time to food" },
    ];

    const experienceOptions = [
        { value: "", label: "Skip this question" },
        { value: "beginner", label: "Beginner - New to farming" },
        { value: "intermediate", label: "Intermediate - Some experience" },
        { value: "advanced", label: "Advanced - Experienced grower" },
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
            newErrors.waterAvailability = "Please select your water availability";
        }
        if (!formData.soilCondition) {
            newErrors.soilCondition = "Please select your soil condition";
        }
        if (!formData.spaceType) {
            newErrors.spaceType = "Please select your growing space type";
        }
        if (!formData.sunlight) {
            newErrors.sunlight = "Please select your sunlight level";
        }
        if (!formData.primaryGoal) {
            newErrors.primaryGoal = "Please select your primary goal";
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
            setErrors({ submit: "Failed to create plan. Please try again." });
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
            Get Your Farming Plan
                    </h1>
                    <p className="text-sm text-muted-foreground">
            Answer a few questions to get personalized recommendations
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
                                label="Water Availability *"
                                options={waterOptions}
                                value={formData.waterAvailability}
                                onChange={(e) =>
                                    handleChange("waterAvailability", e.target.value)
                                }
                                placeholder="How much water can you access?"
                                error={errors.waterAvailability}
                            />
                            {formData.waterAvailability === "none" && (
                                <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
                                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                                    <span>
                    No water access makes growing very difficult. We'll provide
                    alternative strategies.
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Soil Condition */}
                        <Select
                            label="Soil Condition *"
                            options={soilOptions}
                            value={formData.soilCondition}
                            onChange={(e) => handleChange("soilCondition", e.target.value)}
                            placeholder="What's your soil like?"
                            error={errors.soilCondition}
                        />

                        {/* Space Type */}
                        <Select
                            label="Growing Space *"
                            options={spaceOptions}
                            value={formData.spaceType}
                            onChange={(e) => handleChange("spaceType", e.target.value)}
                            placeholder="Where will you grow?"
                            error={errors.spaceType}
                        />

                        {/* Sunlight */}
                        <Select
                            label="Sunlight *"
                            options={sunlightOptions}
                            value={formData.sunlight}
                            onChange={(e) => handleChange("sunlight", e.target.value)}
                            placeholder="How much sun does your space get?"
                            error={errors.sunlight}
                        />

                        {/* Primary Goal */}
                        <Select
                            label="Primary Goal *"
                            options={goalOptions}
                            value={formData.primaryGoal}
                            onChange={(e) => handleChange("primaryGoal", e.target.value)}
                            placeholder="What matters most to you?"
                            error={errors.primaryGoal}
                        />

                        {/* Experience Level (Optional) */}
                        <Select
                            label="Experience Level (Optional)"
                            options={experienceOptions}
                            value={formData.experienceLevel}
                            onChange={(e) => handleChange("experienceLevel", e.target.value)}
                            helper="We'll adjust recommendations based on your experience"
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
                  Creating Your Plan...
                                </>
                            ) : (
                                <>
                                    <Sprout className="mr-2 h-5 w-5" />
                  Generate My Farming Plan
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
