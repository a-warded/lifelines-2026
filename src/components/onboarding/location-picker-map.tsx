"use client";

import { getCountryFromCoords } from "@/lib/geo";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";

// Fix for default marker icons in Leaflet with webpack
const DefaultIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface LocationPickerMapProps {
    latitude?: number | null;
    longitude?: number | null;
    onLocationSelect: (lat: number, lng: number, label?: string) => void;
    height?: string;
}

export function LocationPickerMap({
    latitude,
    longitude,
    onLocationSelect,
    height = "400px",
}: LocationPickerMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);
    const [searching, setSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current) return;

        // Initialize map centered on user location or default
        const initialLat = latitude || 20;
        const initialLng = longitude || 0;
        const initialZoom = latitude && longitude ? 13 : 2;

        const map = L.map(mapRef.current).setView([initialLat, initialLng], initialZoom);

        // Add OpenStreetMap tiles
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 19,
        }).addTo(map);

        // Add marker if initial position
        if (latitude && longitude) {
            markerRef.current = L.marker([latitude, longitude]).addTo(map);
        }

        // Click handler
        map.on("click", async (e: L.LeafletMouseEvent) => {
            const { lat, lng } = e.latlng;

            // Update or create marker
            if (markerRef.current) {
                markerRef.current.setLatLng([lat, lng]);
            } else {
                markerRef.current = L.marker([lat, lng]).addTo(map);
            }

            // Reverse geocode
            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
                    { headers: { "User-Agent": "Lifelines-App/1.0" } }
                );
                const data = await response.json();
                const label = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
                onLocationSelect(lat, lng, label);
            } catch {
                onLocationSelect(lat, lng);
            }
        });

        mapInstanceRef.current = map;

        return () => {
            map.remove();
            mapInstanceRef.current = null;
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Update marker when props change
    useEffect(() => {
        if (!mapInstanceRef.current) return;

        if (latitude && longitude) {
            if (markerRef.current) {
                markerRef.current.setLatLng([latitude, longitude]);
            } else {
                markerRef.current = L.marker([latitude, longitude]).addTo(mapInstanceRef.current);
            }
            mapInstanceRef.current.setView([latitude, longitude], 13);
        }
    }, [latitude, longitude]);

    const handleSearch = async () => {
        if (!searchQuery.trim() || !mapInstanceRef.current) return;

        setSearching(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1`,
                { headers: { "User-Agent": "Lifelines-App/1.0" } }
            );
            const results = await response.json();

            if (results.length > 0) {
                const { lat, lon, display_name } = results[0];
                const latNum = parseFloat(lat);
                const lngNum = parseFloat(lon);

                mapInstanceRef.current.setView([latNum, lngNum], 13);

                if (markerRef.current) {
                    markerRef.current.setLatLng([latNum, lngNum]);
                } else {
                    markerRef.current = L.marker([latNum, lngNum]).addTo(mapInstanceRef.current);
                }

                onLocationSelect(latNum, lngNum, display_name);
            }
        } catch {
            console.error("Search failed");
        } finally {
            setSearching(false);
        }
    };

    return (
        <div className="relative">
            {/* Search bar */}
            <div className="absolute left-2 right-2 top-2 z-[1000] flex gap-2">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="Search for a place..."
                    className="flex-1 rounded-lg border bg-white px-3 py-2 text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-zinc-800"
                />
                <button
                    onClick={handleSearch}
                    disabled={searching}
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-md hover:bg-primary/90 disabled:opacity-50"
                >
                    {searching ? "..." : "Search"}
                </button>
            </div>

            {/* Map container */}
            <div ref={mapRef} style={{ height, width: "100%" }} />
        </div>
    );
}
