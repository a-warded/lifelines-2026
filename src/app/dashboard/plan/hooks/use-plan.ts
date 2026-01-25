"use client";

import { useState, useEffect, useCallback } from "react";
import { cachePlan, getCachedPlan } from "@/lib/offline-storage";
import { getPlantByName } from "@/lib/plants";
import type { Plan, Profile } from "../types";

interface UsePlanViewOptions {
  planId: string;
}

export function usePlanView({ planId }: UsePlanViewOptions) {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const url = planId === "latest" ? "/api/plans" : `/api/plans?id=${planId}`;
        const res = await fetch(url);

        if (res.ok) {
          const data = await res.json();
          if (data.plan) {
            setPlan(data.plan);
            setProfile(data.profile);
            cachePlan(data.plan);
          }
        } else {
          throw new Error("Failed to fetch");
        }
      } catch {
        // Try cached data
        const cached = getCachedPlan<Plan>();
        if (cached) {
          setPlan(cached);
          setIsOffline(true);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [planId]);

  return { plan, profile, loading, isOffline };
}

export function useAddCropsToFarm(plan: Plan | null) {
  const [addingCrops, setAddingCrops] = useState(false);
  const [addedCrops, setAddedCrops] = useState<Set<string>>(new Set());

  const addCropToFarm = useCallback(async (cropName: string) => {
    if (addedCrops.has(cropName)) return;

    setAddingCrops(true);
    try {
      const farmRes = await fetch("/api/farm");
      if (!farmRes.ok) throw new Error("Failed to fetch farm");
      const farmData = await farmRes.json();
      const currentCrops = farmData.profile?.crops || [];

      const plant = getPlantByName(cropName);
      const plantId = plant?.id || cropName.toLowerCase().replace(/\s+/g, "-");
      const plantName = plant?.name || cropName;

      const newCrop = {
        plantId,
        plantName,
        count: 1,
        stage: "seedling",
      };

      const existingIndex = currentCrops.findIndex(
        (c: { plantId: string }) => c.plantId === newCrop.plantId
      );

      let updatedCrops;
      if (existingIndex >= 0) {
        updatedCrops = [...currentCrops];
        updatedCrops[existingIndex] = {
          ...updatedCrops[existingIndex],
          count: updatedCrops[existingIndex].count + 1,
        };
      } else {
        updatedCrops = [...currentCrops, newCrop];
      }

      const res = await fetch("/api/farm", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ crops: updatedCrops }),
      });

      if (res.ok) {
        setAddedCrops((prev) => new Set([...prev, cropName]));
      }
    } catch (error) {
      console.error("Failed to add crop:", error);
    } finally {
      setAddingCrops(false);
    }
  }, [addedCrops]);

  const addAllCropsToFarm = useCallback(async () => {
    if (!plan) return;

    setAddingCrops(true);
    try {
      const farmRes = await fetch("/api/farm");
      if (!farmRes.ok) throw new Error("Failed to fetch farm");
      const farmData = await farmRes.json();
      const currentCrops = farmData.profile?.crops || [];

      const newCrops = plan.recommendedCrops.map((crop) => {
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
          (c: { plantId: string }) => c.plantId === newCrop.plantId
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
        setAddedCrops(new Set(plan.recommendedCrops.map((c) => c.cropName)));
      }
    } catch (error) {
      console.error("Failed to add crops:", error);
    } finally {
      setAddingCrops(false);
    }
  }, [plan]);

  return {
    addingCrops,
    addedCrops,
    addCropToFarm,
    addAllCropsToFarm,
  };
}
