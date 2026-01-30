"use client";

import { getUserLocation } from "@/lib/geo";
import {
    calculateCompost,
    estimateFertilizerValue,
    getCompostingMethod,
    WASTE_TYPE_LABELS,
    type WasteEntry,
    type WasteType,
} from "@/lib/logic/compost-calculator";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DEFAULT_SITE_FORM, DEFAULT_WASTE_ENTRY } from "../constants";
import type {
    AddSiteForm,
    CompostLocation,
    CompostResult,
    CompostSite,
    WasteFormEntry,
} from "../types";

// hook for managing waste entries and calculation. trash to treasure conversion
export function useCompostCalculator() {
    const [entries, setEntries] = useState<WasteFormEntry[]>([DEFAULT_WASTE_ENTRY]);
    const [result, setResult] = useState<CompostResult | null>(null);
    const [method, setMethod] = useState<ReturnType<typeof getCompostingMethod> | null>(null);
    const [valueEstimate, setValueEstimate] = useState<ReturnType<typeof estimateFertilizerValue> | null>(null);

    const wasteTypeOptions = useMemo(
        () =>
            Object.entries(WASTE_TYPE_LABELS).map(([value, data]) => ({
                value,
                label: data.label,
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

// Cache key for compost sites
const COMPOST_CACHE_KEY = "cache_compost_sites";

// Helper to get initial cached compost data
const getInitialCompostCache = () => {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return null;
    try {
        const cached = localStorage.getItem(COMPOST_CACHE_KEY);
        if (!cached) return null;
        const { data, timestamp } = JSON.parse(cached);
        // Check if cache is still valid (24 hours)
        if (Date.now() - timestamp > 24 * 60 * 60 * 1000) return null;
        return data;
    } catch {
        return null;
    }
};

// hook for managing nearby compost sites. finding the composters near you
export function useCompostSites() {
    // Initialize empty, will load from cache in useEffect
    const [sites, setSites] = useState<CompostSite[]>([]);
    const [loading, setLoading] = useState(false);
    const [userLocation, setUserLocation] = useState<CompostLocation | null>(null);
    const [locationLabel, setLocationLabel] = useState("");
    const [isOffline, setIsOffline] = useState(false);
    const [isCached, setIsCached] = useState(false);

    // Load from cache on client mount
    useEffect(() => {
        const cached = getInitialCompostCache();
        if (cached) {
            setSites(cached.sites || []);
            if (cached.location) {
                setUserLocation({ lat: cached.location.latitude, lng: cached.location.longitude });
            }
            if (cached.locationLabel) {
                setLocationLabel(cached.locationLabel);
            }
            setIsCached(true);
        }
        setIsOffline(typeof navigator !== 'undefined' ? !navigator.onLine : false);
    }, []);

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
                setIsCached(false);
                setIsOffline(false);
                
                // Cache for offline use
                if (typeof localStorage !== "undefined") {
                    localStorage.setItem(COMPOST_CACHE_KEY, JSON.stringify({
                        data: { sites: data.sites, location, locationLabel: location.locationLabel },
                        timestamp: Date.now()
                    }));
                }
            }
        } catch (error) {
            console.error("Failed to fetch compost sites:", error);
            
            // Try to load from cache if not already loaded
            if (!isCached && typeof localStorage !== "undefined") {
                const cached = localStorage.getItem(COMPOST_CACHE_KEY);
                if (cached) {
                    try {
                        const { data } = JSON.parse(cached);
                        setSites(data.sites || []);
                        if (data.location) {
                            setUserLocation({ lat: data.location.latitude, lng: data.location.longitude });
                        }
                        if (data.locationLabel) {
                            setLocationLabel(data.locationLabel);
                        }
                        setIsCached(true);
                    } catch {
                        // Invalid cache
                    }
                }
            }
            setIsOffline(!navigator.onLine);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSites();
    }, [fetchSites]);

    // Refetch when coming back online
    useEffect(() => {
        const handleOnline = () => {
            setIsOffline(false);
            if (isCached) {
                fetchSites();
            }
        };
        const handleOffline = () => setIsOffline(true);

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, [fetchSites, isCached]);

    return {
        sites,
        loading,
        userLocation,
        setUserLocation,
        locationLabel,
        setLocationLabel,
        refetch: fetchSites,
        isOffline,
        isCached,
    };
}

// hook for adding a new compost site. sharing is caring or whatever
interface UseAddSiteOptions {
  userLocation: CompostLocation | null;
  locationLabel: string;
  onSuccess: () => void;
}

export function useAddSite({ userLocation, locationLabel, onSuccess }: UseAddSiteOptions) {
    const [form, setForm] = useState<AddSiteForm>(DEFAULT_SITE_FORM);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isQueued, setIsQueued] = useState(false);

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
        setIsQueued(false);
        
        const payload = {
            ...form,
            capacityKg: form.capacityKg ? parseInt(form.capacityKg) : undefined,
            latitude: userLocation.lat,
            longitude: userLocation.lng,
            locationLabel,
        };
        
        try {
            const res = await fetch("/api/compost", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                resetForm();
                onSuccess();
            }
        } catch (error) {
            console.error("Failed to add site:", error);
            
            // Queue for later if offline
            if (!navigator.onLine) {
                const queueKey = "farm_offline_queue";
                const existingQueue = localStorage.getItem(queueKey);
                const queue = existingQueue ? JSON.parse(existingQueue) : [];
                queue.push({
                    id: crypto.randomUUID(),
                    endpoint: "/api/compost",
                    method: "POST",
                    body: payload,
                    timestamp: Date.now(),
                });
                localStorage.setItem(queueKey, JSON.stringify(queue));
                setIsQueued(true);
                resetForm();
            }
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
        isQueued,
    };
}
