"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  GeoLocation, 
  getUserLocation, 
  getCountryFromCoords, 
  getLocationLabel 
} from "@/lib/geo";

type LocationStatus = "idle" | "loading" | "detecting" | "success" | "error";

interface UseUserLocationReturn {
  userLocation: GeoLocation | null;
  userCountry: string;
  locationStatus: LocationStatus;
  locationError: string;
  detectLocation: () => Promise<void>;
  isReady: boolean;
}

export function useUserLocation(): UseUserLocationReturn {
  const [userLocation, setUserLocation] = useState<GeoLocation | null>(null);
  const [userCountry, setUserCountry] = useState<string>("");
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("loading");
  const [locationError, setLocationError] = useState<string>("");

  // Fetch from farm profile on mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    setLocationStatus("loading");
    try {
      const profileRes = await fetch("/api/farm");
      if (profileRes.ok) {
        const data = await profileRes.json();
        if (data.profile?.latitude && data.profile?.longitude) {
          setUserLocation({
            latitude: data.profile.latitude,
            longitude: data.profile.longitude,
            country: data.profile.country,
            locationLabel: data.profile.locationLabel,
          });
          setUserCountry(data.profile.country || "");
          setLocationStatus("success");
          return;
        }
      }
      
      // Fallback to IP-based country detection
      const response = await fetch("/api/geo");
      const geoData = await response.json();
      setUserCountry(geoData.country || "");
      setLocationStatus("success");
    } catch {
      setUserCountry(""); // Don't filter by country on error
      setLocationStatus("success"); // Still mark as ready so listings can load
    }
  };

  const detectLocation = useCallback(async () => {
    setLocationStatus("detecting");
    setLocationError("");

    try {
      const location = await getUserLocation();
      const [country, locationLabel] = await Promise.all([
        getCountryFromCoords(location.latitude, location.longitude),
        getLocationLabel(location.latitude, location.longitude),
      ]);

      setUserLocation({
        ...location,
        country,
        locationLabel,
      });
      setUserCountry(country);
      setLocationStatus("success");
    } catch (err) {
      setLocationStatus("error");
      setLocationError(err instanceof Error ? err.message : "Location error");
    }
  }, []);

  return {
    userLocation,
    userCountry,
    locationStatus,
    locationError,
    detectLocation,
    isReady: locationStatus === "success" || locationStatus === "error",
  };
}
