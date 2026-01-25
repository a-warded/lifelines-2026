"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { cachePlan, getCachedPlan } from "@/lib/offline-storage";
import { getPlantByName } from "@/lib/plants";
import type {
  FarmProfile,
  PlanPreview,
  CropEntry,
  WaterCalculation,
  PlanFormData,
} from "../types";
import { DEFAULT_PLAN_FORM } from "../constants";

export function useDashboardData() {
  const router = useRouter();
  const [latestPlan, setLatestPlan] = useState<PlanPreview | null>(null);
  const [farmProfile, setFarmProfile] = useState<FarmProfile | null>(null);
  const [allFarms, setAllFarms] = useState<FarmProfile[]>([]);
  const [waterCalculation, setWaterCalculation] = useState<WaterCalculation | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchLatestPlan = useCallback(async () => {
    try {
      const res = await fetch("/api/plans");
      if (res.ok) {
        const data = await res.json();
        if (data.plan) {
          setLatestPlan(data.plan);
          cachePlan(data.plan);
        }
      }
    } catch {
      const cached = getCachedPlan<PlanPreview>();
      if (cached) {
        setLatestPlan(cached);
      }
    }
  }, []);

  const fetchFarmProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/farm");
      if (res.ok) {
        const data = await res.json();
        if (data.needsOnboarding) {
          router.push("/onboarding");
          return;
        }
        setFarmProfile(data.profile);
        if (data.waterCalculation) {
          setWaterCalculation(data.waterCalculation);
        }
      }
    } catch (error) {
      console.error("Failed to fetch farm profile:", error);
    }
  }, [router]);

  const fetchAllFarms = useCallback(async () => {
    try {
      const res = await fetch("/api/farm?all=true");
      if (res.ok) {
        const data = await res.json();
        setAllFarms(data.farms || []);
      }
    } catch (error) {
      console.error("Failed to fetch farms:", error);
    }
  }, []);

  useEffect(() => {
    Promise.all([fetchLatestPlan(), fetchFarmProfile(), fetchAllFarms()]).finally(() => {
      setLoading(false);
    });
  }, [fetchLatestPlan, fetchFarmProfile, fetchAllFarms]);

  const refreshPlan = fetchLatestPlan;
  const refreshFarms = fetchAllFarms;

  return {
    latestPlan,
    setLatestPlan,
    farmProfile,
    setFarmProfile,
    allFarms,
    waterCalculation,
    setWaterCalculation,
    loading,
    refreshPlan,
    refreshFarms,
  };
}

export function useCropManager(
  farmProfile: FarmProfile | null,
  setFarmProfile: (p: FarmProfile) => void,
  setWaterCalculation: (w: WaterCalculation | null) => void,
  refreshFarms: () => void
) {
  const [savingCrops, setSavingCrops] = useState(false);

  const handleCropsChange = useCallback(
    async (crops: CropEntry[], save = false) => {
      if (!save) return;

      setSavingCrops(true);
      try {
        const res = await fetch("/api/farm", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ crops }),
        });

        if (res.ok) {
          const data = await res.json();
          setFarmProfile(data.profile);
          setWaterCalculation(data.waterCalculation);
          refreshFarms();
        }
      } catch (error) {
        console.error("Failed to update crops:", error);
      } finally {
        setSavingCrops(false);
      }
    },
    [setFarmProfile, setWaterCalculation, refreshFarms]
  );

  return { savingCrops, handleCropsChange };
}

export function useSuggestedCrops(
  latestPlan: PlanPreview | null,
  farmProfile: FarmProfile | null,
  setFarmProfile: (p: FarmProfile) => void,
  setWaterCalculation: (w: WaterCalculation | null) => void
) {
  const [showModal, setShowModal] = useState(false);
  const [adding, setAdding] = useState(false);

  const addAllSuggestedCrops = useCallback(async () => {
    if (!latestPlan) return;

    setAdding(true);
    try {
      const currentCrops = farmProfile?.crops || [];

      const newCrops = latestPlan.recommendedCrops.map((crop) => {
        const plant = getPlantByName(crop.cropName);
        return {
          plantId: plant?.id || crop.cropName.toLowerCase().replace(/\s+/g, "-"),
          plantName: plant?.name || crop.cropName,
          count: 1,
          stage: "seedling" as const,
        };
      });

      const updatedCrops = [...currentCrops];
      for (const newCrop of newCrops) {
        const existingIndex = updatedCrops.findIndex(
          (c) => c.plantId === newCrop.plantId
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

      const res = await fetch("/api/farm", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ crops: updatedCrops }),
      });

      if (res.ok) {
        const data = await res.json();
        setFarmProfile(data.profile);
        setWaterCalculation(data.waterCalculation);
        setShowModal(false);
      }
    } catch (error) {
      console.error("Failed to add crops:", error);
    } finally {
      setAdding(false);
    }
  }, [latestPlan, farmProfile, setFarmProfile, setWaterCalculation]);

  return {
    showModal,
    setShowModal,
    adding,
    addAllSuggestedCrops,
  };
}

export function useRegeneratePlan(
  farmProfile: FarmProfile | null,
  setLatestPlan: (p: PlanPreview | null) => void
) {
  const [showModal, setShowModal] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [formData, setFormData] = useState<PlanFormData>(DEFAULT_PLAN_FORM);

  const openModal = useCallback(() => {
    if (farmProfile) {
      setFormData({
        waterAvailability: farmProfile.waterAvailability || "medium",
        soilCondition: farmProfile.soilCondition || "normal",
        spaceType: farmProfile.spaceType || "containers",
        sunlight: farmProfile.sunlight || "medium",
        primaryGoal: farmProfile.primaryGoal || "nutrition",
        experienceLevel: farmProfile.experienceLevel || "beginner",
      });
    }
    setShowModal(true);
  }, [farmProfile]);

  const handleRegenerate = useCallback(async () => {
    setRegenerating(true);
    try {
      await fetch("/api/farm", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const res = await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.plan) {
          setLatestPlan(data.plan);
          cachePlan(data.plan);
        }
        setShowModal(false);
      }
    } catch (error) {
      console.error("Failed to regenerate plan:", error);
    } finally {
      setRegenerating(false);
    }
  }, [formData, setLatestPlan]);

  return {
    showModal,
    setShowModal,
    formData,
    setFormData,
    regenerating,
    openModal,
    handleRegenerate,
  };
}

export function useDemoData(refreshPlan: () => Promise<void>) {
  const [loading, setLoading] = useState(false);

  const loadDemo = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/demo", { method: "POST" });
      if (res.ok) {
        await refreshPlan();
        window.location.reload();
      }
    } catch (error) {
      console.error("Failed to load demo data:", error);
    } finally {
      setLoading(false);
    }
  }, [refreshPlan]);

  return { loading, loadDemo };
}
