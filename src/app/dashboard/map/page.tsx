"use client";

import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

// components - the ui building blocks
import {
    CompostSiteDetailsCard,
    FarmDetailsCard,
    LayerToggle,
    MapHeader,
    MapSearch,
    MapStatsCards,
} from "./components";

// hooks - the state wizards
import { useMapData, useMapFiltering, useMapSelection } from "./hooks";

// types - the typescript stuff
import type { MapLayer } from "./types";

// dynamically import map to avoid ssr issues with leaflet. csr only gang
const FarmMap = dynamic(
    () => import("@/components/map/farm-map").then((mod) => mod.FarmMap),
    {
        ssr: false,
        loading: () => (
            <div className="flex h-[600px] items-center justify-center rounded-xl bg-muted">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
        ),
    }
);

export default function MapPage() {
    const { data: session } = useSession();
    const searchParams = useSearchParams();
    const initialLayer = (searchParams.get("layer") as MapLayer) || "all";

    const [activeLayer, setActiveLayer] = useState<MapLayer>(initialLayer);

    // data fetching - getting the goods
    const { farms, compostSites, userProfile, loading, stats, refetch } = useMapData();

    // filtering and search - narrowing it down
    const { searchQuery, setSearchQuery, mapItems } = useMapFiltering({
        farms,
        compostSites,
        activeLayer,
    });

    // selection state - what did you click on
    const selection = useMapSelection(compostSites);

    return (
        <div className="space-y-6">
            <MapHeader onRefresh={refetch} loading={loading} />

            <LayerToggle activeLayer={activeLayer} onLayerChange={setActiveLayer} />

            <MapStatsCards stats={stats} />

            <MapSearch value={searchQuery} onChange={setSearchQuery} />

            {/* Map */}
            {loading ? (
                <div className="flex h-[600px] items-center justify-center rounded-xl bg-muted">
                    <div className="text-center">
                        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        <p className="mt-2 text-sm text-muted-foreground">Loading map...</p>
                    </div>
                </div>
            ) : (
                <FarmMap
                    farms={mapItems}
                    currentUserId={session?.user?.id}
                    currentUserLocation={
                        userProfile
                            ? { lat: userProfile.latitude, lng: userProfile.longitude }
                            : undefined
                    }
                    height="600px"
                    onFarmClick={selection.handleItemClick}
                    showCompostLegend={activeLayer === "compost" || activeLayer === "all"}
                />
            )}

            {/* Selected Farm Details */}
            {selection.selectedFarm && (
                <FarmDetailsCard
                    farm={selection.selectedFarm}
                    onClose={selection.clearFarm}
                />
            )}

            {/* Selected Compost Site Details */}
            {selection.selectedCompostSite && (
                <CompostSiteDetailsCard
                    site={selection.selectedCompostSite}
                    onClose={selection.clearCompostSite}
                />
            )}
        </div>
    );
}
