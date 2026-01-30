"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

// Subscribe to online/offline status changes
function subscribeToOnlineStatus(callback: () => void) {
    window.addEventListener("online", callback);
    window.addEventListener("offline", callback);
    return () => {
        window.removeEventListener("online", callback);
        window.removeEventListener("offline", callback);
    };
}

function getOnlineSnapshot(): boolean {
    return navigator.onLine;
}

function getServerSnapshot(): boolean {
    return true; // Assume online during SSR
}

/**
 * Hook to get real-time online/offline status
 * Uses useSyncExternalStore for proper React 18+ integration
 */
export function useOnlineStatus(): boolean {
    return useSyncExternalStore(
        subscribeToOnlineStatus,
        getOnlineSnapshot,
        getServerSnapshot
    );
}

/**
 * Hook to get network status with additional details
 */
export function useNetworkStatus() {
    const isOnline = useOnlineStatus();
    const [connectionType, setConnectionType] = useState<string | null>(null);
    const [effectiveType, setEffectiveType] = useState<string | null>(null);
    const [downlink, setDownlink] = useState<number | null>(null);
    const [rtt, setRtt] = useState<number | null>(null);

    useEffect(() => {
        const connection = (navigator as unknown as { connection?: NetworkInformation }).connection;
        
        if (!connection) return;

        const updateConnectionInfo = () => {
            setConnectionType(connection.type || null);
            setEffectiveType(connection.effectiveType || null);
            setDownlink(connection.downlink || null);
            setRtt(connection.rtt || null);
        };

        updateConnectionInfo();
        connection.addEventListener("change", updateConnectionInfo);

        return () => {
            connection.removeEventListener("change", updateConnectionInfo);
        };
    }, []);

    return {
        isOnline,
        connectionType,
        effectiveType,
        downlink,
        rtt,
        isSlowConnection: effectiveType === "slow-2g" || effectiveType === "2g",
    };
}

interface NetworkInformation extends EventTarget {
    type?: string;
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
    addEventListener(type: "change", listener: () => void): void;
    removeEventListener(type: "change", listener: () => void): void;
}

/**
 * Hook for managing service worker registration and updates
 */
export function useServiceWorker() {
    const [isRegistered, setIsRegistered] = useState(false);
    const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
    const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
    const registrationRef = useRef<ServiceWorkerRegistration | null>(null);

    useEffect(() => {
        if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
            return;
        }

        const registerSW = async () => {
            try {
                const reg = await navigator.serviceWorker.register("/sw.js", {
                    scope: "/",
                });

                registrationRef.current = reg;
                setRegistration(reg);
                setIsRegistered(true);

                // Check for updates
                reg.addEventListener("updatefound", () => {
                    const newWorker = reg.installing;
                    if (newWorker) {
                        newWorker.addEventListener("statechange", () => {
                            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                                setIsUpdateAvailable(true);
                            }
                        });
                    }
                });

                // Listen for messages from service worker
                navigator.serviceWorker.addEventListener("message", (event) => {
                    if (event.data?.type === "SYNC_OFFLINE_QUEUE") {
                        syncOfflineQueue();
                    }
                });

                console.log("[App] Service worker registered successfully");
            } catch (error) {
                console.error("[App] Service worker registration failed:", error);
            }
        };

        registerSW();
    }, []);

    const update = useCallback(async () => {
        if (registrationRef.current) {
            await registrationRef.current.update();
        }
    }, []);

    const skipWaiting = useCallback(() => {
        if (registrationRef.current?.waiting) {
            registrationRef.current.waiting.postMessage({ type: "SKIP_WAITING" });
            window.location.reload();
        }
    }, []);

    const clearCache = useCallback(() => {
        if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({ type: "CLEAR_CACHE" });
        }
    }, []);

    const cacheUrls = useCallback((urls: string[]) => {
        if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({ 
                type: "CACHE_URLS", 
                urls 
            });
        }
    }, []);

    return {
        isRegistered,
        isUpdateAvailable,
        registration,
        update,
        skipWaiting,
        clearCache,
        cacheUrls,
    };
}

// Sync offline queue when back online
async function syncOfflineQueue() {
    if (typeof window === "undefined") return;

    try {
        const queueData = localStorage.getItem("farm_offline_queue");
        if (!queueData) return;

        const queue = JSON.parse(queueData);
        if (!Array.isArray(queue) || queue.length === 0) return;

        console.log("[App] Syncing offline queue:", queue.length, "items");

        const results = await Promise.allSettled(
            queue.map(async (item: { endpoint: string; method: string; body: unknown }) => {
                const response = await fetch(item.endpoint, {
                    method: item.method,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(item.body),
                });
                if (!response.ok) throw new Error(`Failed: ${response.status}`);
                return response.json();
            })
        );

        // Clear successfully synced items
        const failedItems = queue.filter((_, index) => results[index].status === "rejected");
        
        if (failedItems.length > 0) {
            localStorage.setItem("farm_offline_queue", JSON.stringify(failedItems));
        } else {
            localStorage.removeItem("farm_offline_queue");
        }

        console.log("[App] Sync complete:", results.filter(r => r.status === "fulfilled").length, "succeeded");
    } catch (error) {
        console.error("[App] Failed to sync offline queue:", error);
    }
}

/**
 * Hook to automatically sync offline queue when coming back online
 */
export function useOfflineSync() {
    const isOnline = useOnlineStatus();
    const previousOnline = useRef(isOnline);

    useEffect(() => {
        // Sync when transitioning from offline to online
        if (isOnline && !previousOnline.current) {
            syncOfflineQueue();
        }
        previousOnline.current = isOnline;
    }, [isOnline]);

    return { isOnline };
}
