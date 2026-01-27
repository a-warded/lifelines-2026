// offline storage utility - deadass lightweight caching using localStorage
// i-its not like i care if your app works offline or anything...

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

// gotta check if we're in browser cause server-side rendering is lowkey annoying
function isBrowser(): boolean {
    return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

// generic get with expiry check (default 24h cause i said so)
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

// generic set - lowkey just saves stuff to localStorage
export function setToCache<T>(key: string, data: T): void {
    if (!isBrowser()) return;

    try {
        const cached: CachedData<T> = {
            data,
            timestamp: Date.now(),
        };
        localStorage.setItem(key, JSON.stringify(cached));
    } catch {
    // storage full or not available - we just fail silently cause whatever
    }
}

// yeet stuff from cache
export function removeFromCache(key: string): void {
    if (!isBrowser()) return;
    localStorage.removeItem(key);
}

// specific helpers for our data types. not that you asked
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

// offline queue for pending requests when internet decides to ghost you
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

// check if we got wifi or nah
export function isOnline(): boolean {
    if (!isBrowser()) return true;
    return navigator.onLine;
}

// nuke all cached data from orbit. its the only way to be sure
export function clearAllCache(): void {
    Object.values(STORAGE_KEYS).forEach(removeFromCache);
}
