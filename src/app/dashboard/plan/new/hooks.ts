"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { cachePlan } from "@/lib/offline-storage";
import type { PlanFormData, PlanFormErrors } from "./types";
import { DEFAULT_FORM_DATA } from "./types";

export function usePlanForm() {
  const router = useRouter();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<PlanFormErrors>({});
  const [formData, setFormData] = useState<PlanFormData>(DEFAULT_FORM_DATA);

  const handleChange = useCallback((field: keyof PlanFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (prev[field]) {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      }
      return prev;
    });
  }, []);

  const validate = useCallback((): boolean => {
    const newErrors: PlanFormErrors = {};

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
  }, [formData, t]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
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
  }, [formData, validate, router, t]);

  return {
    formData,
    errors,
    loading,
    handleChange,
    handleSubmit,
  };
}
