"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { getUserLocation } from "@/lib/geo";
import {
  calculateCompost,
  getCompostingMethod,
  estimateFertilizerValue,
  type WasteEntry,
  type WasteType,
  WASTE_TYPE_LABELS,
} from "@/lib/logic/compost-calculator";
import type { 
  WasteFormEntry, 
  CompostSite, 
  AddSiteForm, 
  CompostLocation,
  CompostResult,
} from "../types";
import { DEFAULT_WASTE_ENTRY, DEFAULT_SITE_FORM } from "../constants";

// Hook for managing waste entries and calculation
export function useCompostCalculator() {
  const [entries, setEntries] = useState<WasteFormEntry[]>([DEFAULT_WASTE_ENTRY]);
  const [result, setResult] = useState<CompostResult | null>(null);
  const [method, setMethod] = useState<ReturnType<typeof getCompostingMethod> | null>(null);
  const [valueEstimate, setValueEstimate] = useState<ReturnType<typeof estimateFertilizerValue> | null>(null);

  const wasteTypeOptions = useMemo(
    () =>
      Object.entries(WASTE_TYPE_LABELS).map(([value, data]) => ({
        value,
        label: `${data.emoji} ${data.label}`,
      })),
    []
  );

  const calculateResult = useCallback(() => {
    const validEntries: WasteEntry[] = entries
      .filter((e) => e.wasteType && e.amountKg > 0)
      .map((e) => ({
        wasteType: e.wasteType as WasteType,
        amountKg: e.amountKg,
      }));

    if (validEntries.length > 0) {
      const calcResult = calculateCompost(validEntries);
      setResult(calcResult);

      const hasManure = validEntries.some((e) => e.wasteType === "manure");
      const methodResult = getCompostingMethod(calcResult.totalWasteKg, hasManure);
      setMethod(methodResult);

      const value = estimateFertilizerValue(calcResult.estimatedFertilizerKg);
      setValueEstimate(value);
    } else {
      setResult(null);
      setMethod(null);
      setValueEstimate(null);
    }
  }, [entries]);

  useEffect(() => {
    calculateResult();
  }, [calculateResult]);

  const addEntry = useCallback(() => {
    setEntries((prev) => [
      ...prev,
      { id: Date.now().toString(), wasteType: "", amountKg: 0 },
    ]);
  }, []);

  const removeEntry = useCallback((id: string) => {
    setEntries((prev) => {
      if (prev.length > 1) {
        return prev.filter((e) => e.id !== id);
      }
      return prev;
    });
  }, []);

  const updateEntry = useCallback(
    (id: string, field: keyof WasteFormEntry, value: string | number) => {
      setEntries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, [field]: value } : e))
      );
    },
    []
  );

  return {
    entries,
    result,
    method,
    valueEstimate,
    wasteTypeOptions,
    addEntry,
    removeEntry,
    updateEntry,
  };
}

// Hook for managing nearby compost sites
export function useCompostSites() {
  const [sites, setSites] = useState<CompostSite[]>([]);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<CompostLocation | null>(null);
  const [locationLabel, setLocationLabel] = useState("");

  const fetchSites = useCallback(async () => {
    setLoading(true);
    try {
      const location = await getUserLocation();
      setUserLocation({ lat: location.latitude, lng: location.longitude });
      setLocationLabel(location.locationLabel || "");

      const res = await fetch(
        `/api/compost?lat=${location.latitude}&lon=${location.longitude}`
      );
      if (res.ok) {
        const data = await res.json();
        setSites(data.sites || []);
      }
    } catch (error) {
      console.error("Failed to fetch compost sites:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSites();
  }, [fetchSites]);

  return {
    sites,
    loading,
    userLocation,
    setUserLocation,
    locationLabel,
    setLocationLabel,
    refetch: fetchSites,
  };
}

// Hook for adding a new compost site
interface UseAddSiteOptions {
  userLocation: CompostLocation | null;
  locationLabel: string;
  onSuccess: () => void;
}

export function useAddSite({ userLocation, locationLabel, onSuccess }: UseAddSiteOptions) {
  const [form, setForm] = useState<AddSiteForm>(DEFAULT_SITE_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateForm = useCallback(<K extends keyof AddSiteForm>(
    key: K,
    value: AddSiteForm[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetForm = useCallback(() => {
    setForm(DEFAULT_SITE_FORM);
  }, []);

  const submitSite = useCallback(async () => {
    if (!form.siteName || !userLocation) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/compost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          capacityKg: form.capacityKg ? parseInt(form.capacityKg) : undefined,
          latitude: userLocation.lat,
          longitude: userLocation.lng,
          locationLabel,
        }),
      });

      if (res.ok) {
        resetForm();
        onSuccess();
      }
    } catch (error) {
      console.error("Failed to add site:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [form, userLocation, locationLabel, onSuccess, resetForm]);

  return {
    form,
    updateForm,
    resetForm,
    submitSite,
    isSubmitting,
  };
}
