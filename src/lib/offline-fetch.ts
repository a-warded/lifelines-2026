// Offline-aware fetch utility for FADES
// Handles caching, offline queuing, and graceful degradation

import { addToOfflineQueue, getFromCache, setToCache } from "./offline-storage";

interface FetchOptions extends RequestInit {
    // Cache the response for offline use
    cacheKey?: string;
    // Max age for cached data in milliseconds
    cacheMaxAge?: number;
    // Whether to queue the request if offline (for mutations)
    queueIfOffline?: boolean;
    // Whether to return cached data if network fails
    fallbackToCache?: boolean;
}

interface OfflineFetchResult<T> {
    data: T | null;
    error: string | null;
    isOffline: boolean;
    isCached: boolean;
    cachedAt?: number;
}

/**
 * Offline-aware fetch that handles caching and queuing
 */
export async function offlineFetch<T>(
    url: string,
    options: FetchOptions = {}
): Promise<OfflineFetchResult<T>> {
    const {
        cacheKey,
        cacheMaxAge = 5 * 60 * 1000, // 5 minutes default
        queueIfOffline = false,
        fallbackToCache = true,
        ...fetchOptions
    } = options;

    const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
    const method = (fetchOptions.method || "GET").toUpperCase();
    const isGetRequest = method === "GET";

    // For non-GET requests while offline, queue them
    if (!isOnline && !isGetRequest && queueIfOffline) {
        addToOfflineQueue({
            endpoint: url,
            method,
            body: fetchOptions.body ? JSON.parse(fetchOptions.body as string) : null,
        });

        return {
            data: null,
            error: null,
            isOffline: true,
            isCached: false,
        };
    }

    // Try network first
    try {
        const response = await fetch(url, {
            ...fetchOptions,
            headers: {
                "Content-Type": "application/json",
                ...fetchOptions.headers,
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        // Cache GET responses
        if (isGetRequest && cacheKey) {
            setToCache(cacheKey, data);
        }

        return {
            data,
            error: null,
            isOffline: false,
            isCached: false,
        };
    } catch (error) {
        console.log("[OfflineFetch] Network request failed:", url, error);

        // For GET requests, try to return cached data
        if (isGetRequest && fallbackToCache && cacheKey) {
            const cached = getFromCache<{ data: T; timestamp: number }>(cacheKey, cacheMaxAge);
            
            if (cached) {
                console.log("[OfflineFetch] Returning cached data for:", url);
                return {
                    data: cached as T,
                    error: null,
                    isOffline: !isOnline,
                    isCached: true,
                };
            }
        }

        // For non-GET requests while offline, queue them
        if (!isGetRequest && queueIfOffline) {
            addToOfflineQueue({
                endpoint: url,
                method,
                body: fetchOptions.body ? JSON.parse(fetchOptions.body as string) : null,
            });

            return {
                data: null,
                error: "Request queued for when you're back online",
                isOffline: true,
                isCached: false,
            };
        }

        return {
            data: null,
            error: error instanceof Error ? error.message : "Network error",
            isOffline: !isOnline,
            isCached: false,
        };
    }
}

// Storage keys for different data types
export const CACHE_KEYS = {
    FARM_PROFILE: "cache_farm_profile",
    LATEST_PLAN: "cache_latest_plan",
    FORUM_POSTS: "cache_forum_posts",
    EXCHANGE_LISTINGS: "cache_exchange_listings",
    COMPOST_SITES: "cache_compost_sites",
    WATER_CALCULATION: "cache_water_calculation",
    ASSISTANT_MESSAGES: "cache_assistant_messages",
} as const;

// Pre-built fetch functions for common API calls
export const api = {
    // Farm profile
    async getFarmProfile() {
        return offlineFetch("/api/farm", {
            cacheKey: CACHE_KEYS.FARM_PROFILE,
            cacheMaxAge: 10 * 60 * 1000, // 10 minutes
            fallbackToCache: true,
        });
    },

    async updateFarmProfile(data: unknown) {
        return offlineFetch("/api/farm", {
            method: "POST",
            body: JSON.stringify(data),
            queueIfOffline: true,
        });
    },

    // Plans
    async getLatestPlan() {
        return offlineFetch("/api/plans", {
            cacheKey: CACHE_KEYS.LATEST_PLAN,
            cacheMaxAge: 30 * 60 * 1000, // 30 minutes
            fallbackToCache: true,
        });
    },

    // Forum
    async getForumPosts(params?: Record<string, string>) {
        const searchParams = new URLSearchParams(params);
        return offlineFetch(`/api/forum?${searchParams}`, {
            cacheKey: `${CACHE_KEYS.FORUM_POSTS}_${searchParams}`,
            cacheMaxAge: 5 * 60 * 1000, // 5 minutes
            fallbackToCache: true,
        });
    },

    async createForumPost(data: unknown) {
        return offlineFetch("/api/forum", {
            method: "POST",
            body: JSON.stringify(data),
            queueIfOffline: true,
        });
    },

    // Exchange
    async getExchangeListings(params?: Record<string, string>) {
        const searchParams = new URLSearchParams(params);
        return offlineFetch(`/api/exchange?${searchParams}`, {
            cacheKey: `${CACHE_KEYS.EXCHANGE_LISTINGS}_${searchParams}`,
            cacheMaxAge: 5 * 60 * 1000, // 5 minutes
            fallbackToCache: true,
        });
    },

    async createExchangeListing(data: unknown) {
        return offlineFetch("/api/exchange", {
            method: "POST",
            body: JSON.stringify(data),
            queueIfOffline: true,
        });
    },

    // Compost sites
    async getCompostSites() {
        return offlineFetch("/api/compost?all=true", {
            cacheKey: CACHE_KEYS.COMPOST_SITES,
            cacheMaxAge: 15 * 60 * 1000, // 15 minutes
            fallbackToCache: true,
        });
    },

    // Water calculation
    async getWaterCalculation() {
        return offlineFetch("/api/water", {
            cacheKey: CACHE_KEYS.WATER_CALCULATION,
            cacheMaxAge: 60 * 60 * 1000, // 1 hour
            fallbackToCache: true,
        });
    },
};
