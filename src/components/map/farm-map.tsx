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
}

export function FarmMap({
    farms,
    currentUserId,
    currentUserLocation,
    height = "500px",
    onFarmClick,
}: FarmMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const markersRef = useRef<L.Marker[]>([]);

    useEffect(() => {
        if (!mapRef.current) return;

        // Clean up existing map
        if (mapInstanceRef.current) {
            mapInstanceRef.current.remove();
            mapInstanceRef.current = null;
        }

        // Determine initial view
        let initialLat = 20;
        let initialLng = 0;
        let initialZoom = 2;

        if (currentUserLocation) {
            initialLat = currentUserLocation.lat;
            initialLng = currentUserLocation.lng;
            initialZoom = 10;
        } else if (farms.length > 0) {
            const bounds = L.latLngBounds(farms.map((f) => [f.latitude, f.longitude]));
            const center = bounds.getCenter();
            initialLat = center.lat;
            initialLng = center.lng;
            initialZoom = 4;
        }

        const map = L.map(mapRef.current).setView([initialLat, initialLng], initialZoom);

        // Add OpenStreetMap tiles
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 19,
        }).addTo(map);

        // Helper function to create a farm icon with custom emoji
        const createFarmIcon = (emoji: string, isCurrentUser: boolean) => L.divIcon({
            html: `<div style="
                background: linear-gradient(135deg, ${isCurrentUser ? "#3B82F6, #2563EB" : "#80ED99, #57CC99"});
                width: ${isCurrentUser ? "36px" : "32px"};
                height: ${isCurrentUser ? "36px" : "32px"};
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                border: ${isCurrentUser ? "3px" : "2px"} solid white;
                box-shadow: 0 2px ${isCurrentUser ? "12px" : "8px"} rgba(${isCurrentUser ? "59, 130, 246" : "0,0,0"}, ${isCurrentUser ? "0.5" : "0.3"});
                display: flex;
                align-items: center;
                justify-content: center;
            "><span style="transform: rotate(45deg); font-size: ${isCurrentUser ? "16px" : "14px"};">${emoji}</span></div>`,
            className: isCurrentUser ? "current-farm-marker" : "farm-marker",
            iconSize: isCurrentUser ? [36, 36] : [32, 32],
            iconAnchor: isCurrentUser ? [18, 36] : [16, 32],
            popupAnchor: [0, isCurrentUser ? -36 : -32],
        });

        // Add markers for each farm
        markersRef.current = farms.map((farm) => {
            const isCurrentUser = farm.userId === currentUserId;
            const emoji = farm.farmEmoji || "🌱";
            const icon = createFarmIcon(emoji, isCurrentUser);

            const crops = farm.crops || [];
            const cropList = crops.length > 0
                ? crops.slice(0, 3).map((c) => `${c.plantName} (${c.count})`).join(", ")
                : "No crops yet";

            const popupContent = `
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

            if (onFarmClick) {
                marker.on("click", () => onFarmClick(farm));
            }

            return marker;
        });

        // Fit bounds if multiple farms
        if (farms.length > 1) {
            const bounds = L.latLngBounds(farms.map((f) => [f.latitude, f.longitude]));
            map.fitBounds(bounds, { padding: [50, 50] });
        }

        mapInstanceRef.current = map;

        return () => {
            map.remove();
            mapInstanceRef.current = null;
            markersRef.current = [];
        };
    }, [farms, currentUserId, currentUserLocation, onFarmClick]);

    return (
        <div className="relative overflow-hidden rounded-xl border shadow-sm" style={{ isolation: "isolate" }}>
            <div ref={mapRef} style={{ height, width: "100%" }} className="z-0" />
            
            {/* Legend */}
            <div className="absolute bottom-4 left-4 z-10 rounded-lg bg-white/95 p-3 shadow-lg backdrop-blur dark:bg-zinc-800/95">
                <div className="mb-2 text-xs font-semibold text-muted-foreground">Legend</div>
                <div className="flex items-center gap-2 text-sm">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-[10px]">
                        🏠
                    </span>
                    <span>Your Farm</span>
                </div>
                <div className="mt-1 flex items-center gap-2 text-sm">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-500 text-[10px]">
                        🌱
                    </span>
                    <span>Other Farms</span>
                </div>
            </div>

            {/* Farm count */}
            <div className="absolute right-4 top-4 z-10 rounded-lg bg-white/95 px-3 py-2 shadow-lg backdrop-blur dark:bg-zinc-800/95">
                <span className="text-sm font-medium">{farms.length} farms</span>
            </div>
        </div>
    );
}
