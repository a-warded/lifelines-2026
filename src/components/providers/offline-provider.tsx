"use client";

import { useOfflineSync, useServiceWorker } from "@/hooks/use-offline";
import { createContext, ReactNode, useContext, useEffect } from "react";

interface OfflineContextType {
    isOnline: boolean;
    isServiceWorkerReady: boolean;
    isUpdateAvailable: boolean;
    skipWaiting: () => void;
    clearCache: () => void;
    cacheUrls: (urls: string[]) => void;
}

const OfflineContext = createContext<OfflineContextType | null>(null);

export function useOfflineContext() {
    const context = useContext(OfflineContext);
    if (!context) {
        throw new Error("useOfflineContext must be used within OfflineProvider");
    }
    return context;
}

interface OfflineProviderProps {
    children: ReactNode;
}

export function OfflineProvider({ children }: OfflineProviderProps) {
    const { isOnline } = useOfflineSync();
    const { 
        isRegistered, 
        isUpdateAvailable, 
        skipWaiting, 
        clearCache, 
        cacheUrls 
    } = useServiceWorker();

    // Pre-cache important routes when online
    useEffect(() => {
        if (isOnline && isRegistered) {
            // Cache frequently accessed pages
            const routesToCache = [
                "/dashboard",
                "/dashboard/exchange",
                "/dashboard/forum",
                "/dashboard/compost",
                "/dashboard/profile",
            ];
            cacheUrls(routesToCache);
        }
    }, [isOnline, isRegistered, cacheUrls]);

    // Show update notification when available
    useEffect(() => {
        if (isUpdateAvailable) {
            console.log("[App] New version available! Refresh to update.");
        }
    }, [isUpdateAvailable]);

    const value: OfflineContextType = {
        isOnline,
        isServiceWorkerReady: isRegistered,
        isUpdateAvailable,
        skipWaiting,
        clearCache,
        cacheUrls,
    };

    return (
        <OfflineContext.Provider value={value}>
            {children}
        </OfflineContext.Provider>
    );
}
