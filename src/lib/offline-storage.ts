// Offline Storage Utility
// Lightweight caching using localStorage for offline support

const STORAGE_KEYS = {
    LATEST_PLAN: "farm_latest_plan",
    LATEST_WATER: "farm_latest_water",
    ASSISTANT_CHAT: "farm_assistant_chat",
    OFFLINE_QUEUE: "farm_offline_queue",
} as const;

interface CachedData<T> {
  data: T;
  timestamp: number;
}

// Check if we're in browser
function isBrowser(): boolean {
    return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

// Generic get with expiry check (default 24h)
export function getFromCache<T>(key: string, maxAgeMs = 24 * 60 * 60 * 1000): T | null {
    if (!isBrowser()) return null;

    try {
        const stored = localStorage.getItem(key);
        if (!stored) return null;

        const cached: CachedData<T> = JSON.parse(stored);
        const now = Date.now();

        if (now - cached.timestamp > maxAgeMs) {
            localStorage.removeItem(key);
            return null;
        }

        return cached.data;
    } catch {
        return null;
    }
}

// Generic set
export function setToCache<T>(key: string, data: T): void {
    if (!isBrowser()) return;

    try {
        const cached: CachedData<T> = {
            data,
            timestamp: Date.now(),
        };
        localStorage.setItem(key, JSON.stringify(cached));
    } catch {
    // Storage full or not available - fail silently
    }
}

// Remove from cache
export function removeFromCache(key: string): void {
    if (!isBrowser()) return;
    localStorage.removeItem(key);
}

// Specific helpers for our data types
export function cachePlan(plan: unknown): void {
    setToCache(STORAGE_KEYS.LATEST_PLAN, plan);
}

export function getCachedPlan<T>(): T | null {
    return getFromCache<T>(STORAGE_KEYS.LATEST_PLAN);
}

export function cacheWaterCalculation(calc: unknown): void {
    setToCache(STORAGE_KEYS.LATEST_WATER, calc);
}

export function getCachedWaterCalculation<T>(): T | null {
    return getFromCache<T>(STORAGE_KEYS.LATEST_WATER);
}

export function cacheAssistantChat(messages: unknown[]): void {
    setToCache(STORAGE_KEYS.ASSISTANT_CHAT, messages);
}

export function getCachedAssistantChat<T>(): T[] | null {
    return getFromCache<T[]>(STORAGE_KEYS.ASSISTANT_CHAT);
}

// Offline queue for pending requests
interface QueuedRequest {
  id: string;
  endpoint: string;
  method: string;
  body: unknown;
  timestamp: number;
}

export function addToOfflineQueue(request: Omit<QueuedRequest, "id" | "timestamp">): void {
    if (!isBrowser()) return;

    const queue = getFromCache<QueuedRequest[]>(STORAGE_KEYS.OFFLINE_QUEUE) || [];
    queue.push({
        ...request,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
    });
    setToCache(STORAGE_KEYS.OFFLINE_QUEUE, queue);
}

export function getOfflineQueue(): QueuedRequest[] {
    return getFromCache<QueuedRequest[]>(STORAGE_KEYS.OFFLINE_QUEUE) || [];
}

export function clearOfflineQueue(): void {
    removeFromCache(STORAGE_KEYS.OFFLINE_QUEUE);
}

// Check online status
export function isOnline(): boolean {
    if (!isBrowser()) return true;
    return navigator.onLine;
}

// Clear all cached data
export function clearAllCache(): void {
    Object.values(STORAGE_KEYS).forEach(removeFromCache);
}
