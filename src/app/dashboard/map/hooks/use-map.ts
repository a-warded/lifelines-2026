"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { CompostSite, Farm, FarmProfile, MapLayer, MapStats } from "../types";

// hook for fetching and managing map data. the geo data wrangler
export function useMapData() {
    const [farms, setFarms] = useState<Farm[]>([]);
    const [compostSites, setCompostSites] = useState<CompostSite[]>([]);
    const [userProfile, setUserProfile] = useState<FarmProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [farmsRes, profileRes, compostRes] = await Promise.all([
                fetch("/api/farm?all=true"),
                fetch("/api/farm"),
                fetch("/api/compost?all=true"),
            ]);

            if (farmsRes.ok) {
                const data = await farmsRes.json();
                setFarms(data.farms || []);
            }

            if (profileRes.ok) {
                const data = await profileRes.json();
                setUserProfile(data.profile);
            }

            if (compostRes.ok) {
                const data = await compostRes.json();
                setCompostSites(data.sites || []);
            }
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setLoading(false);
        }
    }, []);

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
