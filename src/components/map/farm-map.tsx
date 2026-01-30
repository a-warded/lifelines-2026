"use client";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";

interface Farm {
    userId: string;
    userName?: string;
    farmName?: string;
    farmEmoji?: string;
    latitude: number;
    longitude: number;
    locationLabel?: string;
    country?: string;
    crops: Array<{ plantName: string; count: number }>;
    spaceType: string;
    dailyWaterLiters: number;
}

interface FarmMapProps {
    farms: Farm[];
    currentUserId?: string;
    currentUserLocation?: { lat: number; lng: number };
    height?: string;
    onFarmClick?: (farm: Farm) => void;
    showCompostLegend?: boolean;
}

function isValidCoord(lat: number, lng: number): boolean {
    return typeof lat === "number" && typeof lng === "number" && !isNaN(lat) && !isNaN(lng);
}

function createFarmIcon(emoji: string, isCurrentUser: boolean, isCompostSite: boolean = false) {
    const colors = isCurrentUser 
        ? "#3B82F6, #2563EB" 
        : isCompostSite 
            ? "#10B981, #059669"
            : "#80ED99, #57CC99";
    
    return L.divIcon({
        html: `<div style="
            background: linear-gradient(135deg, ${colors});
            width: ${isCurrentUser ? "36px" : "32px"};
            height: ${isCurrentUser ? "36px" : "32px"};
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: ${isCurrentUser ? "3px" : "2px"} solid white;
            display: flex;
            align-items: center;
            justify-content: center;
        "><span style="transform: rotate(45deg); font-size: ${isCurrentUser ? "16px" : "14px"};">${emoji}</span></div>`,
        className: isCurrentUser ? "current-farm-marker" : isCompostSite ? "compost-marker" : "farm-marker",
        iconSize: isCurrentUser ? [36, 36] : [32, 32],
        iconAnchor: isCurrentUser ? [18, 36] : [16, 32],
        popupAnchor: [0, isCurrentUser ? -36 : -32],
    });
}

export function FarmMap({
    farms,
    currentUserId,
    currentUserLocation,
    height = "500px",
    onFarmClick,
    showCompostLegend = false,
}: FarmMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const markersRef = useRef<L.Marker[]>([]);
    const hasInitializedViewRef = useRef(false);

    // store onFarmClick in ref to avoid triggering re-renders. lowkey optimization
    const onFarmClickRef = useRef(onFarmClick);
    onFarmClickRef.current = onFarmClick;

    // initialize map only once. we dont do double inits here bestie
    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current) return;

        // clear any existing leaflet instance on the container. out with the old
        const container = mapRef.current;
        if ((container as unknown as { _leaflet_id?: number })._leaflet_id) {
            delete (container as unknown as { _leaflet_id?: number })._leaflet_id;
        }

        // determine initial view. gotta figure out where we looking
        let initialLat = 20;
        let initialLng = 0;
        let initialZoom = 2;

        if (currentUserLocation) {
            initialLat = currentUserLocation.lat;
            initialLng = currentUserLocation.lng;
            initialZoom = 10;
        } else {
            const validFarms = farms.filter(f => isValidCoord(f.latitude, f.longitude));
            if (validFarms.length > 0) {
                const bounds = L.latLngBounds(validFarms.map(f => [f.latitude, f.longitude]));
                const center = bounds.getCenter();
                initialLat = center.lat;
                initialLng = center.lng;
                initialZoom = validFarms.length > 1 ? 4 : 10;
            }
        }

        try {
            const map = L.map(container, {
                center: [initialLat, initialLng],
                zoom: initialZoom,
            });

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                maxZoom: 19,
            }).addTo(map);

            mapInstanceRef.current = map;
        } catch (error) {
            console.error("Error initializing map:", error);
        }

        return () => {
            if (mapInstanceRef.current) {
                try {
                    mapInstanceRef.current.remove();
                } catch {
                    // ignore cleanup errors. we dont care tbh
                }
                mapInstanceRef.current = null;
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // only run once on mount. one and done

    // update markers when farms change. gotta keep em fresh
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map) return;

        // clear existing markers. out with the old ones
        markersRef.current.forEach(marker => {
            try {
                marker.remove();
            } catch {
                // ignore. its whatever
            }
        });
        markersRef.current = [];

        // add new markers. in with the new
        const validFarms = farms.filter(f => isValidCoord(f.latitude, f.longitude));
        
        markersRef.current = validFarms.map((farm) => {
            const isCurrentUser = farm.userId === currentUserId;
            const isCompostSite = farm.spaceType?.includes("compost") || farm.farmEmoji === "♻️";
            const emoji = farm.farmEmoji || (isCompostSite ? "♻️" : "🌱");
            const icon = createFarmIcon(emoji, isCurrentUser, isCompostSite);

            const crops = farm.crops || [];
            const cropList = crops.length > 0
                ? crops.slice(0, 3).map((c) => `${c.plantName} (${c.count})`).join(", ")
                : isCompostSite ? "Composting site" : "No crops yet";

            const popupContent = isCompostSite
                ? `
                    <div style="min-width: 180px; font-family: system-ui, sans-serif;">
                        <div style="font-weight: 600; font-size: 14px; margin-bottom: 4px; color: #1a1a1a;">
                            ♻️ ${farm.farmName || "Compost Site"}
                        </div>
                        ${farm.userName ? `<div style="font-size: 12px; color: #666; margin-bottom: 8px;">by ${farm.userName}</div>` : ""}
                        <div style="font-size: 12px; color: #444; margin-bottom: 4px;">
                            <strong>Type:</strong> ${farm.spaceType.replace(" compost", "")}
                        </div>
                        <div style="font-size: 12px; color: #10b981; margin-top: 8px;">
                            🌱 Organic Fertilizer Available
                        </div>
                    </div>
                `
                : `
                    <div style="min-width: 180px; font-family: system-ui, sans-serif;">
                        <div style="font-weight: 600; font-size: 14px; margin-bottom: 4px; color: #1a1a1a;">
                            ${farm.farmName || (isCurrentUser ? "Your Farm" : "Farm")}
                        </div>
                        ${farm.userName ? `<div style="font-size: 12px; color: #666; margin-bottom: 8px;">by ${farm.userName}</div>` : ""}
                        <div style="font-size: 12px; color: #444; margin-bottom: 4px;">
                            <strong>Space:</strong> ${farm.spaceType}
                        </div>
                        <div style="font-size: 12px; color: #444; margin-bottom: 4px;">
                            <strong>Growing:</strong> ${cropList}
                        </div>
                        ${farm.dailyWaterLiters > 0 ? `
                            <div style="font-size: 12px; color: #0ea5e9; margin-top: 8px;">
                                💧 ${farm.dailyWaterLiters.toFixed(1)}L/day
                            </div>
                        ` : ""}
                    </div>
                `;

            const marker = L.marker([farm.latitude, farm.longitude], { icon })
                .addTo(map)
                .bindPopup(popupContent);

            if (onFarmClickRef.current) {
                marker.on("click", () => onFarmClickRef.current?.(farm));
            }

            return marker;
        });

        // only fit bounds on initial load, not when toggling layers. stop the map from jumping around
        if (!hasInitializedViewRef.current && validFarms.length > 0) {
            hasInitializedViewRef.current = true;
            if (validFarms.length > 1) {
                try {
                    const bounds = L.latLngBounds(validFarms.map(f => [f.latitude, f.longitude]));
                    map.fitBounds(bounds, { padding: [50, 50] });
                } catch {
                    // ignore bounds errors. ts pmo sometimes
                }
            } else if (validFarms.length === 1) {
                map.setView([validFarms[0].latitude, validFarms[0].longitude], 10);
            }
        }

        return () => {
            // cleanup markers on dependency change. gotta clean up after ourselves
            markersRef.current.forEach(marker => {
                try {
                    marker.remove();
                } catch {
                    // ignore. whatever
                }
            });
            markersRef.current = [];
        };
    }, [farms, currentUserId]);

    // update view when user location changes, but only on initial load
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map || !currentUserLocation || hasInitializedViewRef.current) return;

        hasInitializedViewRef.current = true;
        map.setView([currentUserLocation.lat, currentUserLocation.lng], 10);
    }, [currentUserLocation]);

    return (
        <div className="relative overflow-hidden rounded-md border" style={{ isolation: "isolate" }}>
            <div ref={mapRef} style={{ height, width: "100%" }} className="z-0" />
            
            {/* Legend */}
            <div className="absolute bottom-4 left-4 z-10 rounded-lg bg-white/95 p-3 shadow-lg backdrop-blur dark:bg-zinc-800/95">
                <div className="mb-2 text-xs font-semibold text-muted-foreground">Legend</div>
                <div className="flex items-center gap-2 text-sm">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-[10px]">
                        🏠
                    </span>
                    <span>Your Location</span>
                </div>
                <div className="mt-1 flex items-center gap-2 text-sm">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-500 text-[10px]">
                        🌱
                    </span>
                    <span>Farms</span>
                </div>
                {showCompostLegend && (
                    <div className="mt-1 flex items-center gap-2 text-sm">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-[10px]">
                            ♻️
                        </span>
                        <span>Compost Sites</span>
                    </div>
                )}
            </div>
        </div>
    );
}
