"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { CompostSite, Farm, FarmProfile, MapLayer, MapStats } from "../types";

// cache keys for map data. gotta save that geo data bestie
const CACHE_KEYS = {
    MAP_FARMS: "map_farms_cache",
    MAP_COMPOST_SITES: "map_compost_sites_cache",
    MAP_USER_PROFILE: "map_user_profile_cache",
};

// cache helpers - borrowed from offline-storage pattern
function getFromCache<T>(key: string, maxAgeMs = 24 * 60 * 60 * 1000): T | null {
    if (typeof window === "undefined") return null;
    try {
        const stored = localStorage.getItem(key);
        if (!stored) return null;
        const cached = JSON.parse(stored);
        if (Date.now() - cached.timestamp > maxAgeMs) {
            localStorage.removeItem(key);
            return null;
        }
        return cached.data;
    } catch {
        return null;
    }
}

function setToCache<T>(key: string, data: T): void {
    if (typeof window === "undefined") return;
    try {
        localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
    } catch {
        // storage full - whatever
    }
}

// hook for fetching and managing map data. the geo data wrangler
export function useMapData() {
    const [farms, setFarms] = useState<Farm[]>([]);
    const [compostSites, setCompostSites] = useState<CompostSite[]>([]);
    const [userProfile, setUserProfile] = useState<FarmProfile | null>(null);
    const [loading, setLoading] = useState(true);

    // load cached data on mount (client-side only)
    useEffect(() => {
        const cachedFarms = getFromCache<Farm[]>(CACHE_KEYS.MAP_FARMS);
        const cachedCompostSites = getFromCache<CompostSite[]>(CACHE_KEYS.MAP_COMPOST_SITES);
        const cachedProfile = getFromCache<FarmProfile>(CACHE_KEYS.MAP_USER_PROFILE);
        
        if (cachedFarms) setFarms(cachedFarms);
        if (cachedCompostSites) setCompostSites(cachedCompostSites);
        if (cachedProfile) setUserProfile(cachedProfile);
        
        // if we have cached data, dont show loading spinner
        if (cachedFarms || cachedCompostSites) {
            setLoading(false);
        }
    }, []);

    const fetchData = useCallback(async () => {
        // only show loading if we have no cached data
        const hasCachedData = farms.length > 0 || compostSites.length > 0;
        if (!hasCachedData) {
            setLoading(true);
        }
        
        try {
            const [farmsRes, profileRes, compostRes] = await Promise.all([
                fetch("/api/farm?all=true"),
                fetch("/api/farm"),
                fetch("/api/compost?all=true"),
            ]);

            if (farmsRes.ok) {
                const data = await farmsRes.json();
                const farmsData = data.farms || [];
                setFarms(farmsData);
                setToCache(CACHE_KEYS.MAP_FARMS, farmsData);
            }

            if (profileRes.ok) {
                const data = await profileRes.json();
                setUserProfile(data.profile);
                if (data.profile) {
                    setToCache(CACHE_KEYS.MAP_USER_PROFILE, data.profile);
                }
            }

            if (compostRes.ok) {
                const data = await compostRes.json();
                const sitesData = data.sites || [];
                setCompostSites(sitesData);
                setToCache(CACHE_KEYS.MAP_COMPOST_SITES, sitesData);
            }
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setLoading(false);
        }
    }, [farms.length, compostSites.length]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const stats: MapStats = useMemo(() => ({
        totalFarms: farms.length,
        totalCompostSites: compostSites.length,
        totalCrops: farms.reduce((sum, f) => sum + (f.crops?.length || 0), 0),
        totalPlants: farms.reduce(
            (sum, f) => sum + (f.crops?.reduce((s, c) => s + c.count, 0) || 0),
            0
        ),
    }), [farms, compostSites]);

    return {
        farms,
        compostSites,
        userProfile,
        loading,
        stats,
        refetch: fetchData,
    };
}

// hook for filtering and combining map items. search and filter gang
interface UseMapFilteringOptions {
  farms: Farm[];
  compostSites: CompostSite[];
  activeLayer: MapLayer;
}

export function useMapFiltering({ farms, compostSites, activeLayer }: UseMapFilteringOptions) {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredFarms = useMemo(() => {
        if (!searchQuery) return farms;
        const query = searchQuery.toLowerCase();
        return farms.filter((farm) =>
            farm.farmName?.toLowerCase().includes(query) ||
      farm.userName?.toLowerCase().includes(query) ||
      farm.locationLabel?.toLowerCase().includes(query) ||
      farm.country?.toLowerCase().includes(query) ||
      farm.crops?.some((c) => c.plantName.toLowerCase().includes(query))
        );
    }, [farms, searchQuery]);

    const filteredCompostSites = useMemo(() => {
        if (!searchQuery) return compostSites;
        const query = searchQuery.toLowerCase();
        return compostSites.filter((site) =>
            site.siteName?.toLowerCase().includes(query) ||
      site.userName?.toLowerCase().includes(query) ||
      site.locationLabel?.toLowerCase().includes(query) ||
      site.siteType?.toLowerCase().includes(query)
        );
    }, [compostSites, searchQuery]);

    // combine items for the map based on active layer. mixing it up
    const mapItems = useMemo(() => {
        const items: Farm[] = [];

        if (activeLayer === "farms" || activeLayer === "all") {
            items.push(...filteredFarms);
        }

        if (activeLayer === "compost" || activeLayer === "all") {
            // convert compost sites to farm-like objects for the map. gotta make them compatible
            filteredCompostSites.forEach((site) => {
                items.push({
                    userId: site.userId,
                    userName: site.userName,
                    farmName: site.siteName,
                    farmEmoji: site.siteEmoji || "♻️",
                    latitude: site.latitude,
                    longitude: site.longitude,
                    locationLabel: site.locationLabel,
                    country: site.country,
                    crops: [],
                    spaceType: `${site.siteType} compost`,
                    dailyWaterLiters: 0,
                });
            });
        }

        return items;
    }, [activeLayer, filteredFarms, filteredCompostSites]);

    return {
        searchQuery,
        setSearchQuery,
        filteredFarms,
        filteredCompostSites,
        mapItems,
    };
}

// hook for managing selected item state. what did you click on
export function useMapSelection(compostSites: CompostSite[]) {
    const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
    const [selectedCompostSite, setSelectedCompostSite] = useState<CompostSite | null>(null);

    const handleItemClick = useCallback((item: Farm) => {
    // check if its a compost site (no crops) or a farm. gotta tell them apart
        if (item.crops && item.crops.length === 0 && item.spaceType.includes("compost")) {
            const site = compostSites.find((s) => s.siteName === item.farmName);
            if (site) {
                setSelectedCompostSite(site);
                setSelectedFarm(null);
            }
        } else {
            setSelectedFarm(item);
            setSelectedCompostSite(null);
        }
    }, [compostSites]);

    const clearSelection = useCallback(() => {
        setSelectedFarm(null);
        setSelectedCompostSite(null);
    }, []);

    return {
        selectedFarm,
        selectedCompostSite,
        handleItemClick,
        clearFarm: () => setSelectedFarm(null),
        clearCompostSite: () => setSelectedCompostSite(null),
        clearSelection,
    };
}
