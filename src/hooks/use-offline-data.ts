"use client";

import { CACHE_KEYS, offlineFetch } from "@/lib/offline-fetch";
import { useOnlineStatus } from "./use-offline";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseOfflineDataOptions<T> {
    // Cache key for this data
    cacheKey: string;
    // Max age for cached data in ms
    cacheMaxAge?: number;
    // Initial data (optional)
    initialData?: T;
    // Fetch on mount
    fetchOnMount?: boolean;
    // Refetch interval (0 = disabled)
    refetchInterval?: number;
    // Skip fetching entirely
    skip?: boolean;
}

interface UseOfflineDataResult<T> {
    data: T | null;
    error: string | null;
    isLoading: boolean;
    isOffline: boolean;
    isCached: boolean;
    refetch: () => Promise<void>;
    cachedAt?: number;
}

/**
 * Hook for offline-aware data fetching with automatic caching
 */
export function useOfflineData<T>(
    url: string,
    options: UseOfflineDataOptions<T>
): UseOfflineDataResult<T> {
    const {
        cacheKey,
        cacheMaxAge = 5 * 60 * 1000,
        initialData = null,
        fetchOnMount = true,
        refetchInterval = 0,
        skip = false,
    } = options;

    const isOnline = useOnlineStatus();
    const [data, setData] = useState<T | null>(initialData);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(!skip && fetchOnMount);
    const [isCached, setIsCached] = useState(false);
    const [cachedAt, setCachedAt] = useState<number | undefined>();
    
    const mountedRef = useRef(true);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const fetchData = useCallback(async () => {
        if (skip) return;

        setIsLoading(true);
        setError(null);

        const result = await offlineFetch<T>(url, {
            cacheKey,
            cacheMaxAge,
            fallbackToCache: true,
        });

        if (!mountedRef.current) return;

        if (result.error && !result.data) {
            setError(result.error);
        } else if (result.data) {
            setData(result.data);
            setIsCached(result.isCached);
            if (result.cachedAt) {
                setCachedAt(result.cachedAt);
            }
        }

        setIsLoading(false);
    }, [url, cacheKey, cacheMaxAge, skip]);

    // Initial fetch
    useEffect(() => {
        mountedRef.current = true;

        if (fetchOnMount && !skip) {
            fetchData();
        }

        return () => {
            mountedRef.current = false;
        };
    }, [fetchOnMount, skip, fetchData]);

    // Refetch when coming back online
    useEffect(() => {
        if (isOnline && isCached && !skip) {
            fetchData();
        }
    }, [isOnline, isCached, fetchData, skip]);

    // Refetch interval
    useEffect(() => {
        if (refetchInterval > 0 && isOnline && !skip) {
            intervalRef.current = setInterval(fetchData, refetchInterval);
            return () => {
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                }
            };
        }
    }, [refetchInterval, isOnline, fetchData, skip]);

    return {
        data,
        error,
        isLoading,
        isOffline: !isOnline,
        isCached,
        refetch: fetchData,
        cachedAt,
    };
}

// Specialized hooks for common data types
export function useFarmProfile() {
    return useOfflineData("/api/farm", {
        cacheKey: CACHE_KEYS.FARM_PROFILE,
        cacheMaxAge: 10 * 60 * 1000, // 10 minutes
    });
}

export function useForumPosts(params?: Record<string, string>) {
    const searchParams = new URLSearchParams(params);
    const url = `/api/forum?${searchParams}`;
    
    return useOfflineData(url, {
        cacheKey: `${CACHE_KEYS.FORUM_POSTS}_${searchParams}`,
        cacheMaxAge: 5 * 60 * 1000, // 5 minutes
    });
}

export function useExchangeListings(params?: Record<string, string>) {
    const searchParams = new URLSearchParams(params);
    const url = `/api/exchange?${searchParams}`;
    
    return useOfflineData(url, {
        cacheKey: `${CACHE_KEYS.EXCHANGE_LISTINGS}_${searchParams}`,
        cacheMaxAge: 5 * 60 * 1000, // 5 minutes
    });
}

export function useCompostSites() {
    return useOfflineData("/api/compost?all=true", {
        cacheKey: CACHE_KEYS.COMPOST_SITES,
        cacheMaxAge: 15 * 60 * 1000, // 15 minutes
    });
}
